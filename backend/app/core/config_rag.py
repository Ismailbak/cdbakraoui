"""
RAG Configuration settings.
Centralized configuration for retrieval, confidence thresholds, and safety policies.
"""

from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional


class RAGConfig(BaseSettings):
    """RAG pipeline configuration."""
    
    # Retrieval settings
    RETRIEVAL_TOP_K: int = 5
    MAX_TOTAL_FACTS: int = 16
    RETRIEVAL_TIMEOUT_SECONDS: int = 3
    CHUNK_MAX_TOKENS: int = 500
    SEMANTIC_TOP_K: int = 5
    SEMANTIC_ENABLED: bool = False
    
    # Confidence thresholds
    CONFIDENCE_HIGH_THRESHOLD: float = 0.8
    CONFIDENCE_MEDIUM_THRESHOLD: float = 0.5
    
    # Patient auto-detection policy
    AUTO_DETECT_ENABLED: bool = True
    AUTO_DETECT_CONFIDENCE_THRESHOLD: float = 0.95
    AUTO_DETECT_REQUIRE_EXACT_MATCH: bool = True
    
    # Qdrant settings (Phase 2)
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_PATH: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "medical_chunks"
    QDRANT_VECTOR_SIZE: int = 384  # For sentence-transformers/all-MiniLM-L6-v2
    QDRANT_SIMILARITY_THRESHOLD: float = 0.6
    
    # Embedding model (local/open-source)
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_BATCH_SIZE: int = 32
    
    # Safety policies
    RETURN_INSUFFICIENT_DATA_WHEN_EMPTY: bool = True
    REQUIRE_EVIDENCE_FOR_FACTS: bool = True
    ALLOW_AMBIGUOUS_PATIENT_BINDING: bool = False
    
    # Development mode
    ENABLE_RETRIEVAL_DIAGNOSTICS: bool = True
    ENABLE_QUERY_CACHING: bool = False
    
    model_config = ConfigDict(
        env_file=".env",
        env_prefix="RAG_",
        case_sensitive=True,
        extra="ignore",
    )


# Instantiate default config
rag_config = RAGConfig()
