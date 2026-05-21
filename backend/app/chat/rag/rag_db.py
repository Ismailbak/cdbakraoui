"""Helpers for rag_chunks table availability and schema checks."""

import logging
from sqlalchemy import inspect
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def rag_chunks_table_ready(db: Session) -> bool:
    """True if rag_chunks exists and has columns required by the ORM."""
    try:
        bind = db.get_bind()
        insp = inspect(bind)
        if "rag_chunks" not in insp.get_table_names():
            return False
        cols = {c["name"] for c in insp.get_columns("rag_chunks")}
        required = {"patient_id", "chunk_text", "is_embedded", "chunk_metadata"}
        return required.issubset(cols)
    except Exception as e:
        logger.warning("rag_chunks schema check failed: %s", e)
        return False


def count_embedded_chunks(db: Session, patient_id: int) -> int:
    if not rag_chunks_table_ready(db):
        return 0
    try:
        from app.models.rag_chunk import RAGChunk

        return (
            db.query(RAGChunk)
            .filter(RAGChunk.patient_id == patient_id, RAGChunk.is_embedded == True)
            .count()
        )
    except Exception as e:
        logger.warning("count_embedded_chunks failed: %s", e)
        return 0
