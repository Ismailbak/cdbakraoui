"""
Structured Retrievers for RAG — patients, appointments, medical acts, act results.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, date


class RetrievedFact(BaseModel):
    source_type: str
    source_id: int
    fact_text: str
    snippet: str
    timestamp: Optional[datetime] = None
    metadata: Dict[str, Any] = {}
    confidence: float = 1.0


class StructuredRetriever(ABC):
    @abstractmethod
    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        pass


def _truncate(text: Optional[str], max_len: int = 280) -> str:
    if not text:
        return ""
    text = str(text).strip()
    if len(text) <= max_len:
        return text
    return text[: max_len - 3].rstrip() + "..."


def _query_hints(query: str) -> set:
    q = query.lower()
    return {
        "appointment": any(k in q for k in ("rdv", "rendez", "appointment", "visite", "suivi", "planifier")),
        "upcoming": any(k in q for k in ("prochain", "upcoming", "futur", "planif")),
        "past": any(k in q for k in ("dernier", "historique", "passé", "past", "previous")),
        "lab": any(k in q for k in ("resultat", "résultat", "analyse", "lab", "biolog", "crp", "vs", "test")),
        "abnormal": any(k in q for k in ("anormal", "abnormal", "élevé", "eleve", "bas")),
        "treatment": any(k in q for k in ("traitement", "medicament", "médicament", "prescri", "therap")),
        "diagnosis": any(k in q for k in ("diagnostic", "diagnos", "maladie", "patholog")),
        "act": any(k in q for k in ("acte", "consultation", "hospital", "rapport")),
    }


class PatientRetriever(StructuredRetriever):
    def __init__(self, db_session):
        self.db = db_session

    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        facts = []
        if not patient_id:
            return facts

        from app.models.patient import Patient
        from app.models.patient_allergy import PatientAllergy

        patient = self.db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return facts

        display = f"{patient.civility or ''} {patient.first_name} {patient.last_name}".strip()
        ipp = f" (IPP: {patient.ipp})" if patient.ipp else ""
        facts.append(RetrievedFact(
            source_type="patient",
            source_id=patient.id,
            fact_text=f"Patient: {display}{ipp}",
            snippet=f"{display}{ipp}",
            confidence=1.0,
        ))

        if patient.date_of_birth:
            age = (date.today() - patient.date_of_birth).days // 365
            facts.append(RetrievedFact(
                source_type="patient",
                source_id=patient.id,
                fact_text=f"Date of birth: {patient.date_of_birth}, Age: {age}",
                snippet=f"DOB {patient.date_of_birth}, {age} ans",
                confidence=1.0,
            ))

        if patient.gender:
            facts.append(RetrievedFact(
                source_type="patient",
                source_id=patient.id,
                fact_text=f"Gender: {patient.gender}",
                snippet=f"Sexe: {patient.gender}",
                confidence=1.0,
            ))

        if patient.blood_type:
            facts.append(RetrievedFact(
                source_type="patient",
                source_id=patient.id,
                fact_text=f"Blood type: {patient.blood_type}",
                snippet=f"Groupe sanguin: {patient.blood_type}",
                confidence=1.0,
            ))

        if patient.primary_diagnosis:
            facts.append(RetrievedFact(
                source_type="patient",
                source_id=patient.id,
                fact_text=f"Primary diagnosis: {patient.primary_diagnosis}",
                snippet=_truncate(patient.primary_diagnosis),
                confidence=1.0,
            ))

        if patient.notes:
            facts.append(RetrievedFact(
                source_type="patient_note",
                source_id=patient.id,
                fact_text=f"Clinical notes: {_truncate(patient.notes, 400)}",
                snippet=_truncate(patient.notes),
                confidence=1.0,
            ))

        allergies = self.db.query(PatientAllergy).filter(PatientAllergy.patient_id == patient_id).limit(top_k).all()
        for allergy in allergies:
            facts.append(RetrievedFact(
                source_type="patient_note",
                source_id=patient.id,
                fact_text=f"Allergy: {allergy.allergen} (severity: {allergy.severity or 'unknown'})",
                snippet=f"{allergy.allergen}",
                confidence=1.0,
            ))

        return facts[: top_k * 2]


class AppointmentRetriever(StructuredRetriever):
    def __init__(self, db_session):
        self.db = db_session

    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        if not patient_id:
            return []

        from app.models.appointment import Appointment

        hints = _query_hints(query)
        q = self.db.query(Appointment).filter(Appointment.patient_id == patient_id)
        now = datetime.utcnow()

        if hints.get("upcoming"):
            q = q.filter(Appointment.datetime_scheduled >= now)
        elif hints.get("past"):
            q = q.filter(Appointment.datetime_scheduled < now)

        rows = q.order_by(Appointment.datetime_scheduled.desc()).limit(top_k).all()
        facts = []
        for row in rows:
            reason = _truncate(row.reason) or "Motif non précisé"
            dt = row.datetime_scheduled.isoformat() if row.datetime_scheduled else ""
            snippet = f"{dt} — {reason} (statut: {row.status})"
            facts.append(RetrievedFact(
                source_type="appointment",
                source_id=row.id,
                fact_text=snippet,
                snippet=snippet,
                timestamp=row.datetime_scheduled,
                confidence=1.0,
            ))
        return facts


class MedicalActRetriever(StructuredRetriever):
    def __init__(self, db_session):
        self.db = db_session

    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        if not patient_id:
            return []

        from app.models.medical_act import MedicalAct, ActDiagnosis, ActTreatment

        acts = (
            self.db.query(MedicalAct)
            .filter(MedicalAct.patient_id == patient_id)
            .order_by(MedicalAct.act_date.desc())
            .limit(top_k)
            .all()
        )

        facts = []
        for act in acts:
            diagnoses = (
                self.db.query(ActDiagnosis)
                .filter(ActDiagnosis.act_id == act.id)
                .limit(3)
                .all()
            )
            treatments = (
                self.db.query(ActTreatment)
                .filter(ActTreatment.act_id == act.id)
                .limit(3)
                .all()
            )
            diag_text = ", ".join(d.diagnosis_label for d in diagnoses if d.diagnosis_label) or ""
            treat_text = ", ".join(
                f"{t.drug_name} {t.dosage or ''}".strip() for t in treatments if t.drug_name
            ) or ""

            parts = [
                f"Acte: {act.act_type or 'N/A'}",
                f"Date: {act.act_date}",
            ]
            if act.category:
                parts.append(f"Catégorie: {act.category}")
            if act.status:
                parts.append(f"Statut: {act.status}")
            if act.description:
                parts.append(f"Description: {_truncate(act.description)}")
            if diag_text:
                parts.append(f"Diagnostics: {diag_text}")
            if treat_text:
                parts.append(f"Traitements: {treat_text}")
            if act.report:
                parts.append(f"Rapport: {_truncate(act.report)}")
            if act.notes:
                parts.append(f"Notes: {_truncate(act.notes)}")

            snippet = " | ".join(parts)
            facts.append(RetrievedFact(
                source_type="medical_act",
                source_id=act.id,
                fact_text=snippet,
                snippet=snippet,
                timestamp=act.act_date if isinstance(act.act_date, datetime) else None,
                confidence=1.0,
            ))
        return facts


class ActResultRetriever(StructuredRetriever):
    def __init__(self, db_session):
        self.db = db_session

    async def retrieve(self, query: str, patient_id: Optional[int] = None, top_k: int = 5) -> List[RetrievedFact]:
        if not patient_id:
            return []

        from app.models.act_result import ActResult

        hints = _query_hints(query)
        q = self.db.query(ActResult).filter(ActResult.patient_id == patient_id)
        if hints.get("abnormal"):
            q = q.filter(ActResult.is_abnormal == True)

        results = q.order_by(ActResult.result_date.desc()).limit(top_k).all()
        facts = []
        for res in results:
            value = res.result_value or ""
            unit = res.result_unit or ""
            abnormal = "anormal" if res.is_abnormal else "normal"
            date_str = res.result_date.isoformat() if res.result_date else ""
            name = res.result_name or "Résultat"
            cat = f", catégorie: {res.result_category}" if res.result_category else ""
            snippet = f"{date_str} — {name}: {value} {unit} ({abnormal}{cat})"
            if res.notes:
                snippet = f"{snippet} | {_truncate(res.notes)}"

            facts.append(RetrievedFact(
                source_type="act_result",
                source_id=res.id,
                fact_text=snippet,
                snippet=snippet,
                timestamp=res.result_date,
                metadata={"is_abnormal": bool(res.is_abnormal)},
                confidence=1.0,
            ))
        return facts


class StructuredRetrievalPipeline:
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
        top_k_per_source: int = 5,
    ) -> List[RetrievedFact]:
        if patient_id and user_id:
            authorized = await self.patient_service.user_can_access_patient(user_id, patient_id)
            if not authorized:
                return []

        facts: List[RetrievedFact] = []
        hints = _query_hints(query)

        facts.extend(await self.patient_retriever.retrieve(query, patient_id, top_k_per_source))

        if hints.get("appointment") or not hints.get("lab"):
            facts.extend(await self.appointment_retriever.retrieve(query, patient_id, top_k_per_source))

        if hints.get("act") or hints.get("treatment") or hints.get("diagnosis") or not hints.get("lab"):
            facts.extend(await self.medical_act_retriever.retrieve(query, patient_id, top_k_per_source))

        if hints.get("lab") or hints.get("abnormal") or True:
            facts.extend(await self.act_result_retriever.retrieve(query, patient_id, top_k_per_source))

        return facts
