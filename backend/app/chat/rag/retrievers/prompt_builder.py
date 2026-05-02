"""
Prompt Builder for RAG.
Deterministic prompt construction with grounded evidence sections.
Separates retrieval from generation for auditability.
"""

from typing import List, Optional, Dict
from datetime import datetime
from app.chat.rag.retrievers.structured_retriever import RetrievedFact


class PromptTemplate:
    """Template for grounded prompts with versioning."""
    
    VERSION = "0.1"
    
    SYSTEM_PROMPT = """You are a medical assistant for a healthcare management system.
Your role is to answer questions about patient care, medical acts, and clinical data.

CRITICAL RULES:
1. Only use the provided evidence to answer questions
2. Do NOT invent or assume facts not in the evidence
3. If evidence is insufficient, explicitly say "Insufficient data" 
4. Always cite your sources
5. Be concise and medically accurate
6. For ambiguous questions, ask for clarification
7. IMPORTANT: When the context section contains "Patient identifier auto-detected from user query and mapped to this internal Patient ID", 
   the evidence provided IS the correct answer to the user's question. Do NOT doubt or question this mapping.
   The system has already verified the patient. Use the provided evidence directly.

Evidence format:
- [TYPE: source_type | ID: source_id] excerpt

Safety constraints:
- Never provide medical advice without strong evidence
- Flag conflicting information when present
- Decline to answer if data is incomplete or unreliable
"""


class PromptBuilder:
    """
    Deterministic prompt assembly from query and evidence.
    Versioned for regression testing.
    """
    
    def __init__(self):
        self.template_version = PromptTemplate.VERSION
    
    def build_grounded_prompt(
        self,
        user_query: str,
        retrieved_facts: List[RetrievedFact],
        patient_id: Optional[int] = None,
        language: str = "en",
        detected_from_ipp: bool = False
    ) -> str:
        """
        Build a deterministic prompt with evidence sections.
        
        Args:
            user_query: User's question
            retrieved_facts: Facts from structured retrieval
            patient_id: Optional patient scope
            language: User's language (for context setting)
            detected_from_ipp: Whether patient was auto-detected from IPP in query
        
        Returns:
            Complete prompt string for LLM
        """
        sections = []
        
        # 1. System rules
        # Use different rules for patient-specific vs general queries
        if patient_id:
            # Patient-specific: must cite evidence
            system_prompt = PromptTemplate.SYSTEM_PROMPT
        else:
            # General query: can answer general medical questions without evidence
            system_prompt = PromptTemplate.SYSTEM_PROMPT.replace(
                "3. If evidence is insufficient, explicitly say \"Insufficient data\" ",
                "3. For general questions without patient data, provide helpful medical information when available "
            )
        sections.append(system_prompt)
        
        # 2. Context setting
        context_section = self._build_context_section(patient_id, language, detected_from_ipp)
        sections.append(context_section)
        
        # 3. Evidence section
        if retrieved_facts:
            evidence_section = self._build_evidence_section(retrieved_facts, detected_from_ipp)
            sections.append(evidence_section)
        else:
            if language == "fr":
                sections.append("\nEVIDENCE:\nAucune donnée médicale trouvée dans les dossiers.")
            else:
                sections.append("\nEVIDENCE:\nNo relevant evidence found in medical records.")
        
        # 4. User query
        query_section = f"\nUSER QUERY:\n{user_query}"
        sections.append(query_section)
        
        # 5. Response instruction
        if language == "fr":
            instruction = "\nRESPONSE:\nUtilise uniquement les preuves ci-dessus pour répondre. Cite tes sources."
        else:
            instruction = "\nRESPONSE:\nAnswer using only the evidence above. Cite your sources."
        sections.append(instruction)
        
        return "\n".join(sections)
    
    def _build_context_section(self, patient_id: Optional[int], language: str, detected_from_ipp: bool) -> str:
        """Build context section with patient scope info."""
        if not patient_id:
            if language == "fr":
                return "\nCONTEXTE:\nRequête générale (pas de patient spécifique)"
            else:
                return "\nCONTEXT:\nGeneral query (no specific patient)"
        
        context = f"\nCONTEXT:\nPatient ID: {patient_id}"
        if detected_from_ipp:
            context += "\nPatient identifier auto-detected from user query and mapped to this internal Patient ID"
        
        return context
    
    def _build_evidence_section(self, retrieved_facts: List[RetrievedFact], detected_from_ipp: bool = False) -> str:
        """Build evidence section from retrieved facts."""
        if not retrieved_facts:
            return "\nEVIDENCE:\nNo evidence available"
        
        evidence_lines = ["\nEVIDENCE:"]
        for fact in retrieved_facts:
            line = f"- [TYPE: {fact.source_type} | ID: {fact.source_id}] {fact.snippet}"
            evidence_lines.append(line)
        
        return "\n".join(evidence_lines)
    
    def extract_sources_from_facts(self, facts: List[RetrievedFact]) -> list:
        """Convert RetrievedFact objects to SourceReference format for response."""
        from app.core.schemas.rag_response import SourceReference
        
        sources = []
        for fact in facts:
            source = SourceReference(
                source_type=fact.source_type,
                source_id=fact.source_id,
                label=f"{fact.source_type}_{fact.source_id}",
                snippet=fact.snippet,
                score=fact.confidence
            )
            sources.append(source)
        
        return sources
