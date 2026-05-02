"""
Structured Retrievers for RAG.
Retrieve grounded facts from MySQL using deterministic queries.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class RetrievedFact(BaseModel):
    """A single retrieved fact with metadata."""
    source_type: str  # "patient", "appointment", "medical_act", "act_result"
    source_id: int
    fact_text: str
    snippet: str
    timestamp: Optional[datetime] = None
    metadata: Dict[str, Any] = {}
    confidence: float = 1.0  # Structured facts = high confidence


class StructuredRetriever(ABC):
    """
    Base class for structured retrieval from MySQL.
    Each retriever handles one data source type.
    """
    
    @abstractmethod
    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        """
        Retrieve facts matching query for optional patient scope.
        
        Args:
            query: Natural language query
            patient_id: Optional patient scope
            top_k: Max results to return
        
        Returns:
            List of RetrievedFact objects
        """
        pass


class PatientRetriever(StructuredRetriever):
    """
    Retrieve patient information: demographics, allergies, conditions.
    """
    
    def __init__(self, db_session):
        self.db = db_session
    
    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        """
        Retrieve patient demographics and medical history.
        Searches: demographics, allergies, diagnoses, blood type, insurance.
        """
        facts = []
        query_lower = query.lower()
        
        print(f"\n🔍 PatientRetriever.retrieve() - patient_id={patient_id}, query='{query}'")
        
        if not patient_id:
            print(f"   ❌ No patient_id provided, returning empty")
            return facts
        
        # Import models here to avoid circular imports
        from app.models.patient import Patient
        from app.models.patient_allergy import PatientAllergy
        
        # Retrieve patient record
        patient = self.db.query(Patient).filter(Patient.id == patient_id).first()
        if patient:
            # Check what fields user is asking about
            if any(kw in query_lower for kw in ["name", "patient", "who"]):
                facts.append(RetrievedFact(
                    source_type="patient",
                    source_id=patient.id,
                    fact_text=f"Patient: {patient.first_name} {patient.last_name}",
                    snippet=f"{patient.civility or ''} {patient.first_name} {patient.last_name}",
                    confidence=1.0
                ))
            
            if any(kw in query_lower for kw in ["age", "birth", "dob"]) and patient.date_of_birth:
                from datetime import date
                age = (date.today() - patient.date_of_birth).days // 365
                facts.append(RetrievedFact(
                    source_type="patient",
                    source_id=patient.id,
                    fact_text=f"Date of birth: {patient.date_of_birth}, Age: {age} years",
                    snippet=f"DOB: {patient.date_of_birth}",
                    confidence=1.0
                ))
            
            if any(kw in query_lower for kw in ["blood", "type"]) and patient.blood_type:
                facts.append(RetrievedFact(
                    source_type="patient",
                    source_id=patient.id,
                    fact_text=f"Blood type: {patient.blood_type}",
                    snippet=f"Blood type: {patient.blood_type}",
                    confidence=1.0
                ))
            
            if any(kw in query_lower for kw in ["allerg", "allerg"]):
                allergies = self.db.query(PatientAllergy).filter(PatientAllergy.patient_id == patient_id).all()
                for allergy in allergies[:top_k]:
                    facts.append(RetrievedFact(
                        source_type="patient_note",
                        source_id=patient.id,
                        fact_text=f"Allergy: {allergy.allergen} (Severity: {allergy.severity or 'unknown'})",
                        snippet=f"{allergy.allergen}",
                        confidence=1.0
                    ))
            
            if any(kw in query_lower for kw in ["diagnos", "condition", "problem"]) and patient.primary_diagnosis:
                facts.append(RetrievedFact(
                    source_type="patient",
                    source_id=patient.id,
                    fact_text=f"Primary diagnosis: {patient.primary_diagnosis}",
                    snippet=patient.primary_diagnosis,
                    confidence=1.0
                ))
        
        return facts[:top_k]


class StructuredRetrievalPipeline:
    """
    Orchestrates retrieval from multiple structured sources.
    """
    
    def __init__(self, db_session, patient_service):
        self.db = db_session
        self.patient_service = patient_service
        self.patient_retriever = PatientRetriever(db_session)
    
    async def retrieve_with_authorization(
        self,
        query: str,
        patient_id: Optional[int] = None,
        user_id: Optional[int] = None,
        top_k_per_source: int = 5
    ) -> List[RetrievedFact]:
        """
        Retrieve facts from all sources with authorization.
        """
        facts = []
        
        # Check authorization if patient_id is provided
        if patient_id and user_id:
            authorized = await self.patient_service.user_can_access_patient(user_id, patient_id)
            if not authorized:
                return facts
        
        # Retrieve from patient source
        patient_facts = await self.patient_retriever.retrieve(
            query=query,
            patient_id=patient_id,
            top_k=top_k_per_source
        )
        facts.extend(patient_facts)
        
        return facts
