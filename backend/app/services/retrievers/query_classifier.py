"""
Query Classifier for RAG.
Rule-based intent classification for medical queries.
Determines if query is patient-specific, general medical, or mixed.
"""

from enum import Enum
from typing import Optional, Tuple
from pydantic import BaseModel
import re


class QueryIntent(str, Enum):
    """Query intent classification."""
    PATIENT_SPECIFIC = "patient_specific"
    GENERAL_MEDICAL = "general_medical"
    MIXED_AMBIGUOUS = "mixed_ambiguous"


class ClassificationResult(BaseModel):
    """Result of query classification."""
    intent: QueryIntent
    confidence: float  # 0.0 to 1.0
    detected_patient_id: Optional[int] = None
    patient_confidence: float = 0.0
    reasoning: str


class QueryClassifier:
    """
    Rule-based classifier for medical queries.
    Phase 0 MVP: lightweight, deterministic classification.
    """
    
    def __init__(self):
        # Patterns for detecting patient identifiers
        self.ipp_pattern = re.compile(r'\b[A-Z]{2}\d{6,8}\b')  # Example: FR123456
        self.age_pattern = re.compile(r'\b(\d{1,3})\s*(?:years?|ans|yo)\b', re.IGNORECASE)
        self.gender_pattern = re.compile(r'\b(male|female|m|f|h|f)\b', re.IGNORECASE)
    
    def classify(self, query: str, known_patients: Optional[dict] = None) -> ClassificationResult:
        """
        Classify query intent.
        
        Args:
            query: User's natural language question
            known_patients: Dict of {patient_id: patient_name} for fuzzy matching
        
        Returns:
            ClassificationResult with intent, confidence, and reasoning
        """
        query_lower = query.lower()
        detected_patient_id = None
        patient_confidence = 0.0
        reasoning_parts = []
        
        # Rule 1: Explicit patient identifiers (IPP, name)
        ipp_match = self.ipp_pattern.search(query)
        if ipp_match:
            # IPP detected - set confidence high but don't store as patient_id (which is int)
            # Patient ID lookup would happen separately based on IPP lookup
            patient_confidence = 0.95
            reasoning_parts.append(f"Detected IPP: {ipp_match.group()}")
        
        # Rule 2: Personal identifiers (age, gender, specific symptoms)
        personal_identifiers = sum([
            bool(self.age_pattern.search(query)),
            bool(self.gender_pattern.search(query)),
            "my patient" in query_lower or "this patient" in query_lower,
            "patient record" in query_lower or "patient file" in query_lower,
        ])
        
        if personal_identifiers >= 2:
            if patient_confidence < 0.7:
                patient_confidence = 0.7
            reasoning_parts.append(f"Multiple personal identifiers detected ({personal_identifiers})")
        
        # Rule 3: General medical knowledge questions
        general_keywords = [
            "define", "explain", "what is", "how does", "describe",
            "difference between", "when to use", "contraindication",
            "side effect", "dosage"
        ]
        is_general = any(kw in query_lower for kw in general_keywords)
        
        # Classify intent
        if detected_patient_id or patient_confidence >= 0.7:
            intent = QueryIntent.PATIENT_SPECIFIC
            confidence = min(patient_confidence, 0.95)
        elif is_general and patient_confidence < 0.3:
            intent = QueryIntent.GENERAL_MEDICAL
            confidence = 0.85
            reasoning_parts.append("Detected general medical knowledge question")
        else:
            intent = QueryIntent.MIXED_AMBIGUOUS
            confidence = 0.5
            reasoning_parts.append("Mixed or ambiguous intent")
        
        reasoning = "; ".join(reasoning_parts) if reasoning_parts else "Default classification"
        
        return ClassificationResult(
            intent=intent,
            confidence=confidence,
            detected_patient_id=detected_patient_id,
            patient_confidence=patient_confidence,
            reasoning=reasoning
        )
    
    def extract_patient_candidates(self, query: str, known_patients: dict) -> Tuple[list, float]:
        """
        Extract potential patient matches from query.
        Returns list of candidate IDs and max confidence score.
        
        Args:
            query: User query
            known_patients: {patient_id: {"name": str, "age": int, "ipp": str}}
        
        Returns:
            (candidate_patient_ids, max_confidence)
        """
        candidates = []
        max_conf = 0.0
        
        # IPP exact match
        ipp_match = self.ipp_pattern.search(query)
        if ipp_match:
            for pid, data in known_patients.items():
                if data.get("ipp") == ipp_match.group():
                    candidates.append(pid)
                    max_conf = 0.95
        
        # Full name exact match
        query_lower = query.lower()
        for pid, data in known_patients.items():
            if data.get("name", "").lower() in query_lower:
                candidates.append(pid)
                max_conf = max(max_conf, 0.9)
        
        return candidates, max_conf
