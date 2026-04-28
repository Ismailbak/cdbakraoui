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
        
        if not patient_id:
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
            
            if any(kw in query_lower for kw in ["insurance", "mutuelle"]) and patient.insurance:
                facts.append(RetrievedFact(
                    source_type="patient",
                    source_id=patient.id,
                    fact_text=f"Insurance: {patient.insurance}",
                    snippet=f"Insurance: {patient.insurance}",
                    confidence=1.0
                ))
            
            if any(kw in query_lower for kw in ["diagnosis", "condition"]) and patient.primary_diagnosis:
                facts.append(RetrievedFact(
                    source_type="patient",
                    source_id=patient.id,
                    fact_text=f"Primary diagnosis: {patient.primary_diagnosis}",
                    snippet=f"Diagnosis: {patient.primary_diagnosis}",
                    confidence=1.0
                ))
        
        # Retrieve allergies
        if any(kw in query_lower for kw in ["allerg", "reaction", "adverse"]):
            allergies = self.db.query(PatientAllergy).filter(
                PatientAllergy.patient_id == patient_id
            ).all()
            
            for allergy in allergies:
                facts.append(RetrievedFact(
                    source_type="patient",
                    source_id=patient_id,
                    fact_text=f"Allergy: {allergy.allergen}, Severity: {allergy.severity or 'Unknown'}, Reaction: {allergy.reaction_type or 'Not specified'}",
                    snippet=f"Allergen: {allergy.allergen} ({allergy.severity or 'Unknown'})",
                    confidence=1.0
                ))
        
        return facts[:top_k]


class AppointmentRetriever(StructuredRetriever):
    """
    Retrieve appointment history and details.
    """
    
    def __init__(self, db_session):
        self.db = db_session
    
    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        """
        Retrieve appointments matching query terms.
        Keywords: date, provider, type, reason, status.
        """
        facts = []
        query_lower = query.lower()
        
        if not patient_id:
            return facts
        
        from app.models.appointment import Appointment
        
        # Retrieve recent appointments
        appointments = self.db.query(Appointment).filter(
            Appointment.patient_id == patient_id
        ).order_by(Appointment.datetime_scheduled.desc()).limit(10).all()
        
        for appt in appointments:
            # Check if query matches appointment context
            should_include = any(kw in query_lower for kw in ["appointment", "visit", "consultation", "scheduled", "status"])
            
            if should_include or "recent" in query_lower:
                facts.append(RetrievedFact(
                    source_type="appointment",
                    source_id=appt.id,
                    fact_text=f"Appointment scheduled: {appt.datetime_scheduled}, Status: {appt.status}",
                    snippet=f"Appointment on {appt.datetime_scheduled.strftime('%Y-%m-%d %H:%M')} ({appt.status})" + 
                            (f" - Reason: {appt.reason}" if appt.reason else ""),
                    timestamp=appt.datetime_scheduled,
                    confidence=1.0
                ))
        
        return facts[:top_k]


class MedicalActRetriever(StructuredRetriever):
    """
    Retrieve medical acts (procedures, exams performed).
    """
    
    def __init__(self, db_session):
        self.db = db_session
    
    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        """
        Retrieve medical acts (procedures, lab tests, exams).
        Keywords: act name, date, result type, findings.
        """
        facts = []
        query_lower = query.lower()
        
        if not patient_id:
            return facts
        
        from app.models.medical_act import MedicalAct, ActDiagnosis
        
        # Retrieve recent medical acts
        acts = self.db.query(MedicalAct).filter(
            MedicalAct.patient_id == patient_id
        ).order_by(MedicalAct.act_date.desc()).limit(10).all()
        
        for act in acts:
            # Check if query matches medical act context
            should_include = any(kw in query_lower for kw in ["medical act", "procedure", "exam", "consultation", "test", "act_type"])
            
            if should_include or "recent" in query_lower or "performed" in query_lower:
                snippet = f"{act.act_type or 'Medical Act'} on {act.act_date}"
                if act.description:
                    snippet += f" - {act.description[:100]}"
                
                facts.append(RetrievedFact(
                    source_type="medical_act",
                    source_id=act.id,
                    fact_text=f"Medical act: {act.act_type}, Date: {act.act_date}, Status: {act.status}",
                    snippet=snippet,
                    timestamp=act.act_date,
                    confidence=1.0
                ))
            
            # Add diagnoses associated with this act
            if any(kw in query_lower for kw in ["diagnosis", "condition", "finding"]):
                diagnoses = self.db.query(ActDiagnosis).filter(
                    ActDiagnosis.act_id == act.id
                ).all()
                
                for diagnosis in diagnoses:
                    facts.append(RetrievedFact(
                        source_type="medical_act",
                        source_id=act.id,
                        fact_text=f"Diagnosis from {act.act_type}: {diagnosis.diagnosis_label}",
                        snippet=f"{diagnosis.diagnosis_label} ({diagnosis.diagnosis_type})" + 
                                (f" - {diagnosis.diagnosis_notes[:100]}" if diagnosis.diagnosis_notes else ""),
                        timestamp=act.act_date,
                        confidence=1.0
                    ))
        
        return facts[:top_k]


class ActResultRetriever(StructuredRetriever):
    """
    Retrieve results from performed medical acts (lab values, imaging findings).
    """
    
    def __init__(self, db_session):
        self.db = db_session
    
    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        """
        Retrieve act results: lab values, imaging reports, findings.
        Keywords: test name, value range, abnormality, date.
        """
        facts = []
        query_lower = query.lower()
        
        if not patient_id:
            return facts
        
        from app.models.act_result import ActResult
        
        # Retrieve recent act results
        results = self.db.query(ActResult).filter(
            ActResult.patient_id == patient_id
        ).order_by(ActResult.result_date.desc()).limit(10).all()
        
        for result in results:
            # Check if query matches result context
            should_include = any(kw in query_lower for kw in ["result", "lab", "value", "test", "imagerie", "imaging"])
            abnormal_query = "abnormal" in query_lower
            
            # Always include abnormal results when asked about abnormalities
            if abnormal_query and result.is_abnormal:
                facts.append(RetrievedFact(
                    source_type="act_result",
                    source_id=result.id,
                    fact_text=f"ABNORMAL result: {result.result_name} = {result.result_value} {result.result_unit or ''}",
                    snippet=f"⚠️ {result.result_name}: {result.result_value} {result.result_unit or ''} (ABNORMAL)",
                    timestamp=result.result_date,
                    metadata={"is_abnormal": True},
                    confidence=1.0
                ))
            elif should_include:
                status_flag = "⚠️ ABNORMAL" if result.is_abnormal else "Normal"
                facts.append(RetrievedFact(
                    source_type="act_result",
                    source_id=result.id,
                    fact_text=f"Test result: {result.result_name} = {result.result_value} {result.result_unit or ''} ({status_flag})",
                    snippet=f"{result.result_name}: {result.result_value} {result.result_unit or ''} - {status_flag}",
                    timestamp=result.result_date,
                    metadata={"is_abnormal": result.is_abnormal},
                    confidence=1.0
                ))
        
        return facts[:top_k]


class StructuredRetrievalPipeline:
    """
    Orchestrate retrieval across all structured sources.
    Enforces authorization and aggregates results.
    """
    
    def __init__(self, db_session, patient_service):
        self.db = db_session
        self.patient_service = patient_service
        self.retrievers = {
            "patient": PatientRetriever(db_session),
            "appointment": AppointmentRetriever(db_session),
            "medical_act": MedicalActRetriever(db_session),
            "act_result": ActResultRetriever(db_session),
        }
    
    async def retrieve_with_authorization(
        self,
        query: str,
        patient_id: Optional[int],
        user_id: int,
        top_k_per_source: int = 3
    ) -> List[RetrievedFact]:
        """
        Retrieve facts with authorization guard.
        
        Args:
            query: Retrieval query
            patient_id: Scoped patient (if any)
            user_id: Requesting user (for authorization)
            top_k_per_source: Max results per retriever
        
        Returns:
            Aggregated and sorted facts
        """
        # Authorization: Check if user can access patient_id
        if patient_id:
            authorized = await self.patient_service.user_can_access_patient(user_id, patient_id)
            if not authorized:
                return []  # Empty result = insufficient access
        
        # Retrieve from all sources
        all_facts = []
        for source_name, retriever in self.retrievers.items():
            try:
                facts = await retriever.retrieve(query, patient_id, top_k_per_source)
                all_facts.extend(facts)
            except Exception as e:
                print(f"Retriever {source_name} failed: {e}")
                continue
        
        # Sort by confidence and recency
        all_facts.sort(
            key=lambda f: (f.confidence, f.timestamp or datetime.min),
            reverse=True
        )
        
        return all_facts[:top_k_per_source * len(self.retrievers)]
