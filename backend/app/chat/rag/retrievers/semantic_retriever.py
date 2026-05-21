"""
Semantic retrieval via Qdrant (graceful degradation if unavailable).
"""

import logging
from datetime import datetime
from typing import List, Optional

from app.chat.rag.retrievers.structured_retriever import RetrievedFact
from app.chat.rag.embedding_service import embed_query
from app.core.config_rag import rag_config

logger = logging.getLogger(__name__)

_qdrant_client = None


def _get_qdrant():
    global _qdrant_client
    if _qdrant_client is not None:
        return _qdrant_client
    try:
        from qdrant_client import QdrantClient
        from qdrant_client.models import Filter, FieldCondition, MatchValue

        _qdrant_client = QdrantClient(
            host=rag_config.QDRANT_HOST,
            port=rag_config.QDRANT_PORT,
            timeout=rag_config.RETRIEVAL_TIMEOUT_SECONDS,
        )
        return _qdrant_client
    except Exception as e:
        logger.warning("Qdrant client unavailable: %s", e)
        return None


async def semantic_retrieve(
    query: str,
    patient_id: Optional[int] = None,
    top_k: int = None,
) -> List[RetrievedFact]:
    """Search Qdrant for relevant chunks; returns empty list if service down."""
    top_k = top_k or rag_config.SEMANTIC_TOP_K
    vector = embed_query(query)
    if not vector:
        return []

    client = _get_qdrant()
    if not client:
        return []

    try:
        from qdrant_client.models import Filter, FieldCondition, MatchValue

        query_filter = None
        if patient_id is not None:
            query_filter = Filter(
                must=[FieldCondition(key="patient_id", match=MatchValue(value=patient_id))]
            )

        results = client.search(
            collection_name=rag_config.QDRANT_COLLECTION_NAME,
            query_vector=vector,
            query_filter=query_filter,
            limit=top_k,
            score_threshold=rag_config.QDRANT_SIMILARITY_THRESHOLD,
        )

        facts = []
        for hit in results:
            payload = hit.payload or {}
            source_type = payload.get("source_type", "patient_note")
            source_id = int(payload.get("source_id", 0))
            snippet = (payload.get("text") or payload.get("chunk_preview") or "")[:400]
            if not snippet:
                continue
            created = payload.get("created_at")
            ts = None
            if created:
                try:
                    ts = datetime.fromisoformat(created.replace("Z", "+00:00"))
                except ValueError:
                    ts = None

            facts.append(
                RetrievedFact(
                    source_type=source_type if source_type in (
                        "patient", "appointment", "medical_act", "act_result",
                        "patient_note", "act_note", "pdf_extract", "chat_summary"
                    ) else "patient_note",
                    source_id=source_id,
                    fact_text=snippet,
                    snippet=snippet,
                    timestamp=ts,
                    metadata={"qdrant_score": hit.score},
                    confidence=min(1.0, float(hit.score or 0.5)),
                )
            )
        return facts
    except Exception as e:
        logger.warning("Semantic search failed: %s", e)
        return []
