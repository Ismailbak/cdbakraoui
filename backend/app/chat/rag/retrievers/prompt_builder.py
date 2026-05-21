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
3. If evidence is insufficient, explicitly say "Données insuffisantes" / "Insufficient data"
4. Always cite your sources by type and ID when answering
5. Be concise and medically accurate (3-5 sentences for clinicians)
6. For ambiguous questions, ask for clarification
7. Help the doctor decide: summarize key findings, flag abnormal results, note gaps in follow-up
8. Suggest next steps only when grounded in evidence (e.g. review act, schedule follow-up, repeat lab)
9. When patient ID was auto-detected from the query, trust the mapped evidence for that patient

Evidence format:
- [TYPE: source_type | ID: source_id] excerpt

Safety constraints:
- Never provide medical advice without strong evidence
- Flag conflicting information when present
- Decline to answer if data is incomplete or unreliable
"""

    GENERAL_SYSTEM_PROMPT = """You are a medical assistant for a healthcare management system.
Your role is to answer general medical questions and provide patient-safe information.

CRITICAL RULES:
1. Provide general medical information when asked
2. Do NOT invent or assume patient-specific facts
3. If the question is unclear or needs patient context, ask for clarification
4. Be concise and medically accurate
5. Do not provide diagnosis or treatment for a specific person without data
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
            # General query: allow ungrounded medical info without sources
            system_prompt = PromptTemplate.GENERAL_SYSTEM_PROMPT
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
                sections.append("\nEVIDENCE:\nAucune donnée patient utilisée pour cette requête générale.")
            else:
                sections.append("\nEVIDENCE:\nNo patient records were used for this general query.")
        
        # 4. User query
        query_section = f"\nUSER QUERY:\n{user_query}"
        sections.append(query_section)
        
        # 5. Response instruction
        if language == "fr":
            instruction = (
                "\nRESPONSE:\n"
                "Si des preuves sont fournies: synthèse clinique, points clés, anomalies, "
                "recommandations prudentes pour le médecin. "
                "Ne crée pas de liste 'Sources utilisées' dans le texte: les sources sont affichées séparément dans l'interface. "
                "Sinon: réponse générale ou demande de précision patient — pas d'invention."
            )
        else:
            instruction = (
                "\nRESPONSE:\n"
                "If evidence is provided, base your answer on it. "
                "Do not add a manual 'Sources used' list in the text: sources are displayed separately in the interface. "
                "Otherwise, answer generally without inventing patient-specific details."
            )
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
