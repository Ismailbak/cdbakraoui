"""
Prompt Builder for RAG.
Deterministic prompt construction with grounded evidence sections.
Separates retrieval from generation for auditability.
"""

from typing import List, Optional, Dict
from datetime import datetime
from app.services.retrievers.structured_retriever import RetrievedFact


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
        sections.append(PromptTemplate.SYSTEM_PROMPT)
        
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
        query_section = f"\nUSER QUESTION:\n{user_query}"
        sections.append(query_section)
        
        # 5. Answer policy
        answer_policy = self._build_answer_policy(len(retrieved_facts), language)
        sections.append(answer_policy)
        
        return "\n".join(sections)
    
    def _build_context_section(self, patient_id: Optional[int], language: str, detected_from_ipp: bool = False) -> str:
        """Build context information header."""
        context = "\nCONTEXT:"
        if patient_id:
            # When auto-detected from IPP, DON'T show internal Patient ID to avoid confusing the LLM
            # about mismatch between query ID (e.g., "14") and internal ID (e.g., "19")
            if not detected_from_ipp:
                context += f"\n- Patient ID (in system): {patient_id}"
            else:
                context += "\n- Patient: Automatically identified from medical ID in query"
        context += f"\n- Language: {language}"
        context += f"\n- Timestamp: {datetime.utcnow().isoformat()}"
        return context
    
    def _build_evidence_section(self, facts: List[RetrievedFact], detected_from_ipp: bool = False) -> str:
        """Build evidence section from retrieved facts.
        
        When detected_from_ipp=True, hide internal patient IDs from citations
        to avoid confusing LLM about ID mismatches (e.g., query "14" vs internal ID "19").
        """
        evidence_lines = ["\nEVIDENCE:"]
        
        # Group by source type
        by_source = {}
        for fact in facts:
            if fact.source_type not in by_source:
                by_source[fact.source_type] = []
            by_source[fact.source_type].append(fact)
        
        # Format each source group
        for source_type, source_facts in by_source.items():
            evidence_lines.append(f"\n[{source_type.upper()}]")
            for fact in source_facts:
                timestamp_str = fact.timestamp.isoformat() if fact.timestamp else "Unknown date"
                
                # Hide internal patient IDs when auto-detected from IPP
                if detected_from_ipp and source_type.lower() == "patient":
                    citation = f"- {fact.fact_text} ({timestamp_str})"
                else:
                    citation = f"- [{source_type}:{fact.source_id}] {fact.fact_text} ({timestamp_str})"
                
                evidence_lines.append(citation)
                if fact.snippet:
                    evidence_lines.append(f"  Snippet: {fact.snippet[:200]}")
        
        return "\n".join(evidence_lines)
    
    def _build_answer_policy(self, fact_count: int, language: str = "en") -> str:
        """Build answer policy based on evidence availability."""
        policy = "\nANSWER POLICY:"
        
        if fact_count == 0:
            if language == "fr":
                policy += (
                    "\n- NO EVIDENCE FOUND for this query."
                    "\n- Respond with: 'I don't have sufficient data to answer this question.'"
                    "\n- Suggest what additional information would help."
                )
            else:
                policy += (
                    "\n- NO EVIDENCE FOUND for this query."
                    "\n- Respond with: 'I don't have sufficient data to answer this question.'"
                    "\n- Suggest what additional information would help."
                )
        else:
            # 1 or more facts = provide answer
            if language == "fr":
                policy += (
                    "\n- EVIDENCE AVAILABLE / PREUVES DISPONIBLES."
                    "\n- Provide a direct, evidence-grounded answer in French."
                    "\n- DO NOT question or doubt the patient mapping. The system has verified it."
                    "\n- Cite sources for key facts."
                )
            else:
                policy += (
                    "\n- EVIDENCE AVAILABLE."
                    "\n- Provide a direct, evidence-grounded answer."
                    "\n- Cite sources for key facts."
                )
        
        return policy
    
    def extract_sources_from_facts(self, facts: List[RetrievedFact]) -> List[Dict]:
        """
        Convert RetrievedFact objects to source reference dicts for API response.
        
        Returns:
            List of source reference objects
        """
        sources = []
        for fact in facts:
            source = {
                "source_type": fact.source_type,
                "source_id": fact.source_id,
                "label": self._generate_label(fact),
                "timestamp": fact.timestamp.isoformat() if fact.timestamp else None,
                "snippet": fact.snippet[:300] if fact.snippet else fact.fact_text[:300],
                "score": fact.confidence
            }
            sources.append(source)
        return sources
    
    def _generate_label(self, fact: RetrievedFact) -> str:
        """Generate human-readable label for source."""
        labels = {
            "patient": f"Patient Record #{fact.source_id}",
            "appointment": f"Appointment #{fact.source_id}",
            "medical_act": f"Medical Act #{fact.source_id}",
            "act_result": f"Test Result #{fact.source_id}",
        }
        return labels.get(fact.source_type, f"{fact.source_type} #{fact.source_id}")
