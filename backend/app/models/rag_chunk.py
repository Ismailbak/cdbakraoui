"""
RAG Chunk Model.
Stores text chunks and embeddings for semantic retrieval (Phase 2).
Used by Qdrant ingestion pipeline.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class RAGChunk(Base):
    """
    Chunked text segments for semantic retrieval.
    Each chunk is stored in both MySQL (metadata) and Qdrant (embeddings).
    """
    
    __tablename__ = "rag_chunks"
    
    id = Column(Integer, primary_key=True)
    
    # Source reference
    patient_id = Column(Integer, ForeignKey("patient.id"), nullable=True, index=True)
    source_type = Column(
        String(50),
        nullable=False,
        index=True,
        comment="patient_note, act_note, pdf_extract, chat_summary, etc."
    )
    source_id = Column(
        Integer,
        nullable=False,
        comment="Foreign ID in the source table (appointment.id, act_result.id, etc.)"
    )
    
    # Text content
    chunk_text = Column(Text, nullable=False, comment="The actual text chunk")
    chunk_index = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Order of chunk within source document"
    )
    
    # Embedding reference (stored in Qdrant, ID here for sync)
    qdrant_point_id = Column(
        Integer,
        nullable=True,
        unique=True,
        comment="Qdrant point ID for vector lookup"
    )
    
    # Metadata
    language = Column(String(10), nullable=False, default="en")
    chunk_metadata = Column(
        JSON,
        nullable=True,
        comment="Additional metadata: dates, tags, author, relevance hints, etc."
    )
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexing for search
    __table_args__ = {
        'mysql_charset': 'utf8mb4',
        'mysql_collate': 'utf8mb4_unicode_ci'
    }
    
    def __repr__(self):
        return f"<RAGChunk(id={self.id}, source={self.source_type}:{self.source_id})>"
    
    def to_qdrant_point(self, embedding: list):
        """
        Convert to Qdrant point format for vector insertion.
        
        Args:
            embedding: Vector embedding from model
        
        Returns:
            Dict ready for Qdrant upsert
        """
        return {
            "id": self.qdrant_point_id or self.id,
            "vector": embedding,
            "payload": {
                "chunk_id": self.id,
                "patient_id": self.patient_id,
                "source_type": self.source_type,
                "source_id": self.source_id,
                "language": self.language,
                "created_at": self.created_at.isoformat(),
                "text": self.chunk_text[:500],  # Preview in payload
                "metadata": self.chunk_metadata or {}
            }
        }


class RAGQueryCache(Base):
    """
    Optional cache for repeated queries (development only).
    Speeds up repeated questions and provides deterministic debugging.
    """
    
    __tablename__ = "rag_query_cache"
    
    id = Column(Integer, primary_key=True)
    
    # Query identifier
    query_hash = Column(String(64), nullable=False, unique=True, index=True)
    
    # Scope
    patient_id = Column(Integer, ForeignKey("patient.id"), nullable=True)
    user_id = Column(Integer, nullable=True, comment="User who made query")
    
    # Cached result
    retrieval_payload = Column(
        JSON,
        nullable=False,
        comment="Serialized list of retrieved facts"
    )
    
    # Cache control
    expires_at = Column(DateTime, nullable=True, comment="TTL for cache entry")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    hit_count = Column(Integer, nullable=False, default=0, comment="Number of cache hits")
    
    def __repr__(self):
        return f"<RAGQueryCache(query_hash={self.query_hash}, hits={self.hit_count})>"
