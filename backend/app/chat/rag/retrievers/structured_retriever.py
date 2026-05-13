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


def _truncate(text: Optional[str], max_len: int = 240) -> str:
    if not text:
        return ""
    if len(text) <= max_len:
        return text
    return text[: max_len - 3].rstrip() + "..."


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
            ipp_text = f" (IPP: {patient.ipp})" if patient.ipp else ""
            display_name = f"{patient.civility or ''} {patient.first_name} {patient.last_name}".strip()
            facts.append(RetrievedFact(
                source_type="patient",
                source_id=patient.id,
                fact_text=f"Patient: {display_name}{ipp_text}",
                snippet=f"{display_name}{ipp_text}",
                confidence=1.0
            ))

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
            
            if any(
                kw in query_lower
                for kw in [
                    "diagnos",
                    "condition",
                    "problem",
                    "suffer",
                    "suffers",
                    "symptom",
                    "symptoms",
                    "souffre",
                    "maladie",
                    "pathologie"
                ]
            ) and patient.primary_diagnosis:
                facts.append(RetrievedFact(
                    source_type="patient",
                    source_id=patient.id,
                    fact_text=f"Primary diagnosis: {patient.primary_diagnosis}",
                    snippet=patient.primary_diagnosis,
                    confidence=1.0
                ))
        
        return facts[:top_k]


class AppointmentRetriever(StructuredRetriever):
    """
    Retrieve appointment history for a patient.
    """

    def __init__(self, db_session):
        self.db = db_session

    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        facts = []

        if not patient_id:
            return facts

        from app.models.appointment import Appointment

        rows = (
            self.db.query(Appointment)
            .filter(Appointment.patient_id == patient_id)
            .order_by(Appointment.datetime_scheduled.desc())
            .limit(top_k)
            .all()
        )

        for row in rows:
            reason = _truncate(row.reason) if row.reason else "Motif non precise"
            dt = row.datetime_scheduled.isoformat() if row.datetime_scheduled else ""
            snippet = f"{dt} — {reason} (statut: {row.status})"
            facts.append(
                RetrievedFact(
                    source_type="appointment",
                    source_id=row.id,
                    fact_text=snippet,
                    snippet=snippet,
                    timestamp=row.datetime_scheduled,
                    confidence=1.0
                )
            )

        return facts


class MedicalActRetriever(StructuredRetriever):
    """
    Retrieve medical acts, diagnoses, and treatments for a patient.
    """

    def __init__(self, db_session):
        self.db = db_session

    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        facts = []

        if not patient_id:
            return facts

        from app.models.medical_act import MedicalAct, ActDiagnosis, ActTreatment

        acts = (
            self.db.query(MedicalAct)
            .filter(MedicalAct.patient_id == patient_id)
            .order_by(MedicalAct.act_date.desc())
            .limit(top_k)
            .all()
        )

        for act in acts:
            diagnoses = (
                self.db.query(ActDiagnosis)
                .filter(ActDiagnosis.act_id == act.id)
                .order_by(ActDiagnosis.created_at.desc())
                .limit(3)
                .all()
            )
            treatments = (
                self.db.query(ActTreatment)
                .filter(ActTreatment.act_id == act.id)
                .order_by(ActTreatment.created_at.desc())
                .limit(3)
                .all()
            )

            diag_text = ", ".join(d.diagnosis_label for d in diagnoses if d.diagnosis_label) or ""
            treat_text = ", ".join(t.drug_name for t in treatments if t.drug_name) or ""
            report_text = _truncate(act.report) if act.report else ""

            parts = [
                f"Acte: {act.act_type or 'N/A'}",
                f"Date: {act.act_date}",
            ]
            if act.category:
                parts.append(f"Categorie: {act.category}")
            if act.status:
                parts.append(f"Statut: {act.status}")
            if diag_text:
                parts.append(f"Diagnostics: {diag_text}")
            if treat_text:
                parts.append(f"Traitements: {treat_text}")
            if report_text:
                parts.append(f"Rapport: {report_text}")

            snippet = " | ".join(parts)

            facts.append(
                RetrievedFact(
                    source_type="medical_act",
                    source_id=act.id,
                    fact_text=snippet,
                    snippet=snippet,
                    timestamp=act.act_date,
                    confidence=1.0
                )
            )

        return facts


class ActResultRetriever(StructuredRetriever):
    """
    Retrieve lab results for a patient.
    """

    def __init__(self, db_session):
        self.db = db_session

    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        facts = []

        if not patient_id:
            return facts

        from app.models.act_result import ActResult

        results = (
            self.db.query(ActResult)
            .filter(ActResult.patient_id == patient_id)
            .order_by(ActResult.result_date.desc())
            .limit(top_k)
            .all()
        )

        for res in results:
            value = res.result_value or ""
            unit = res.result_unit or ""
            abnormal = "anormal" if res.is_abnormal else "normal"
            date_str = res.result_date.isoformat() if res.result_date else ""
            name = res.result_name or "Resultat"
            snippet = f"{date_str} — {name}: {value} {unit} ({abnormal})"
            if res.notes:
                snippet = f"{snippet} | Notes: {_truncate(res.notes)}"

            facts.append(
                RetrievedFact(
                    source_type="act_result",
                    source_id=res.id,
                    fact_text=snippet,
                    snippet=snippet,
                    timestamp=res.result_date,
                    confidence=1.0
                )
            )

        return facts


class StructuredRetrievalPipeline:
    """
    Orchestrates retrieval from multiple structured sources.
    """
    
    def __init__(self, db_session, patient_service):
        self.db = db_session
        self.patient_service = patient_service
        self.patient_retriever = PatientRetriever(db_session)
        self.appointment_retriever = AppointmentRetriever(db_session)
        self.medical_act_retriever = MedicalActRetriever(db_session)
        self.act_result_retriever = ActResultRetriever(db_session)
    
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

        # Retrieve from appointments
        appointment_facts = await self.appointment_retriever.retrieve(
            query=query,
            patient_id=patient_id,
            top_k=top_k_per_source
        )
        facts.extend(appointment_facts)

        # Retrieve from medical acts
        act_facts = await self.medical_act_retriever.retrieve(
            query=query,
            patient_id=patient_id,
            top_k=top_k_per_source
        )
        facts.extend(act_facts)

        # Retrieve from lab results
        result_facts = await self.act_result_retriever.retrieve(
            query=query,
            patient_id=patient_id,
            top_k=top_k_per_source
        )
        facts.extend(result_facts)
        
        return facts
