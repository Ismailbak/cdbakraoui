"""
Ingest clinical text into rag_chunks + Qdrant for semantic retrieval.
"""

import logging
from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from app.chat.rag.embedding_service import embed_texts
from app.chat.rag.retrievers.semantic_retriever import _get_qdrant, ensure_qdrant_collection
from app.core.config_rag import rag_config
from app.models.rag_chunk import RAGChunk
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.medical_act import MedicalAct
from app.models.act_result import ActResult

logger = logging.getLogger(__name__)


def _chunk_text(text: str, max_len: int = 500) -> List[str]:
    if not text or not text.strip():
        return []
    text = text.strip()
    if len(text) <= max_len:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start : start + max_len])
        start += max_len
    return chunks


def _upsert_qdrant(points: List[dict]) -> bool:
    if not points:
        return True
    try:
        from qdrant_client.models import PointStruct

        client = _get_qdrant()
        if not client or not ensure_qdrant_collection(client):
            return False

        structs = [
            PointStruct(id=p["id"], vector=p["vector"], payload=p["payload"])
            for p in points
        ]
        client.upsert(collection_name=rag_config.QDRANT_COLLECTION_NAME, points=structs)
        return True
    except Exception as e:
        logger.warning("Qdrant upsert failed: %s", e)
        return False


def ingest_patient_records(db: Session, patient_id: int) -> int:
    """Rebuild chunks for one patient from MySQL sources. Returns chunk count."""
    db.query(RAGChunk).filter(RAGChunk.patient_id == patient_id).delete()
    db.commit()

    records: List[Tuple[str, int, str, Optional[datetime]]] = []

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient:
        for field, stype in [
            (patient.notes, "patient_note"),
            (patient.notes_admin, "patient_note"),
            (patient.primary_diagnosis, "patient"),
        ]:
            if field:
                records.append((stype, patient.id, str(field), patient.updated_at))

    for apt in db.query(Appointment).filter(Appointment.patient_id == patient_id).all():
        if apt.reason:
            records.append(("appointment", apt.id, apt.reason, apt.datetime_scheduled))

    for act in db.query(MedicalAct).filter(MedicalAct.patient_id == patient_id).all():
        for part in [act.description, act.notes, act.report]:
            if part:
                records.append(("act_note", act.id, part, act.act_date))

    for res in db.query(ActResult).filter(ActResult.patient_id == patient_id).all():
        text = f"{res.result_name}: {res.result_value or ''} {res.result_unit or ''}"
        if res.notes:
            text += f" — {res.notes}"
        records.append(("act_result", res.id, text, res.result_date))

    chunk_rows: List[RAGChunk] = []
    texts_for_embed: List[str] = []

    for source_type, source_id, text, ts in records:
        for idx, piece in enumerate(_chunk_text(text, rag_config.CHUNK_MAX_TOKENS)):
            row = RAGChunk(
                patient_id=patient_id,
                source_type=source_type,
                source_id=source_id,
                chunk_text=piece,
                chunk_index=idx,
                language="fr",
                chunk_metadata={"ingested_at": datetime.utcnow().isoformat()},
            )
            chunk_rows.append(row)
            texts_for_embed.append(piece)

    if not chunk_rows:
        return 0

    db.add_all(chunk_rows)
    db.flush()

    vectors = embed_texts(texts_for_embed)
    qdrant_points = []
    if vectors and len(vectors) == len(chunk_rows):
        for row, vec in zip(chunk_rows, vectors):
            row.qdrant_point_id = row.id
            row.is_embedded = True
            row.embedding_model = rag_config.EMBEDDING_MODEL_NAME
            row.embedding_created_at = datetime.utcnow()
            qdrant_points.append({
                "id": row.id,
                "vector": vec,
                "payload": {
                    "chunk_id": row.id,
                    "patient_id": patient_id,
                    "source_type": row.source_type,
                    "source_id": row.source_id,
                    "text": row.chunk_text[:500],
                    "created_at": datetime.utcnow().isoformat(),
                },
            })
        _upsert_qdrant(qdrant_points)

    db.commit()
    return len(chunk_rows)
