"""Cascade-delete a patient and all rows that reference patients.id."""

import logging
from typing import List

from sqlalchemy.orm import Session

from app.models.act_result import ActResult
from app.models.appointment import Appointment
from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.models.form_system import ActForm, DynamicFormResponse
from app.models.medical_act import (
    ActDiagnosis,
    ActDocument,
    ActTreatment,
    MedicalAct,
    MedicalActStaff,
)
from app.models.patient import Patient
from app.models.patient_allergy import PatientAllergy
from app.models.rag_chunk import RAGChunk, RAGQueryCache

logger = logging.getLogger(__name__)


def _delete_qdrant_points(point_ids: List[int], patient_id: int) -> None:
    """Best-effort removal of vector index entries (non-blocking if Qdrant is down)."""
    try:
        from qdrant_client.models import FieldCondition, Filter, MatchValue, PointIdsList

        from app.core.config_rag import rag_config
        from app.chat.rag.retrievers.semantic_retriever import _get_qdrant

        client = _get_qdrant()
        if client is None:
            return

        if point_ids:
            client.delete(
                collection_name=rag_config.QDRANT_COLLECTION_NAME,
                points_selector=PointIdsList(points=point_ids),
            )
        else:
            client.delete(
                collection_name=rag_config.QDRANT_COLLECTION_NAME,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="patient_id",
                            match=MatchValue(value=patient_id),
                        )
                    ]
                ),
            )
    except Exception as exc:
        logger.warning("Qdrant cleanup skipped for patient %s: %s", patient_id, exc)


def delete_patient_cascade(db: Session, patient_id: int) -> None:
    """Remove dependent rows, then the patient. Caller must commit."""
    act_ids = [
        row[0]
        for row in db.query(MedicalAct.id).filter(MedicalAct.patient_id == patient_id).all()
    ]

    if act_ids:
        db.query(DynamicFormResponse).filter(
            DynamicFormResponse.act_id.in_(act_ids)
        ).delete(synchronize_session=False)
        db.query(ActForm).filter(ActForm.act_id.in_(act_ids)).delete(synchronize_session=False)
        db.query(ActDocument).filter(ActDocument.act_id.in_(act_ids)).delete(
            synchronize_session=False
        )
        db.query(ActDiagnosis).filter(ActDiagnosis.act_id.in_(act_ids)).delete(
            synchronize_session=False
        )
        db.query(ActTreatment).filter(ActTreatment.act_id.in_(act_ids)).delete(
            synchronize_session=False
        )
        db.query(MedicalActStaff).filter(MedicalActStaff.medical_act_id.in_(act_ids)).delete(
            synchronize_session=False
        )
        db.query(ActResult).filter(ActResult.act_id.in_(act_ids)).delete(synchronize_session=False)
        db.query(MedicalAct).filter(MedicalAct.id.in_(act_ids)).delete(synchronize_session=False)

    db.query(ActResult).filter(ActResult.patient_id == patient_id).delete(synchronize_session=False)
    db.query(Appointment).filter(Appointment.patient_id == patient_id).delete(
        synchronize_session=False
    )

    session_ids = [
        row[0]
        for row in db.query(ChatSession.id).filter(ChatSession.patient_id == patient_id).all()
    ]
    if session_ids:
        db.query(ChatMessage).filter(ChatMessage.session_id.in_(session_ids)).delete(
            synchronize_session=False
        )
    db.query(ChatMessage).filter(ChatMessage.patient_id == patient_id).delete(
        synchronize_session=False
    )
    db.query(ChatSession).filter(ChatSession.patient_id == patient_id).delete(
        synchronize_session=False
    )

    db.query(PatientAllergy).filter(PatientAllergy.patient_id == patient_id).delete(
        synchronize_session=False
    )

    db.query(RAGQueryCache).filter(RAGQueryCache.patient_id == patient_id).delete(
        synchronize_session=False
    )
    qdrant_ids = [
        row[0]
        for row in db.query(RAGChunk.qdrant_point_id)
        .filter(RAGChunk.patient_id == patient_id, RAGChunk.qdrant_point_id.isnot(None))
        .all()
    ]
    db.query(RAGChunk).filter(RAGChunk.patient_id == patient_id).delete(synchronize_session=False)
    _delete_qdrant_points(qdrant_ids, patient_id)

    db.query(Patient).filter(Patient.id == patient_id).delete(synchronize_session=False)
