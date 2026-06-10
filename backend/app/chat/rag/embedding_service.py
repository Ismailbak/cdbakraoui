"""
Local embedding service (sentence-transformers).
"""

import logging
from functools import lru_cache
from typing import List, Optional

from app.core.config_rag import rag_config

logger = logging.getLogger(__name__)

_model = None


def get_embedding_model():
    global _model
    if _model is not None:
        return _model
    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(rag_config.EMBEDDING_MODEL_NAME)
        logger.info("Loaded embedding model %s", rag_config.EMBEDDING_MODEL_NAME)
        return _model
    except Exception as e:
        logger.warning("Embedding model unavailable: %s", e)
        return None


def embed_texts(texts: List[str]) -> Optional[List[List[float]]]:
    model = get_embedding_model()
    if not model or not texts:
        return None
    try:
        vectors = model.encode(texts, batch_size=rag_config.EMBEDDING_BATCH_SIZE, show_progress_bar=False)
        return [v.tolist() for v in vectors]
    except Exception as e:
        logger.error("Embedding failed: %s", e)
        return None


def embed_query(text: str) -> Optional[List[float]]:
    result = embed_texts([text])
    if result:
        return result[0]
    return None
