"""
RAG Response schemas for grounded chat responses.
Defines the contract for chat responses with sources, confidence, and metadata.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class SourceReference(BaseModel):
    """Citation source for retrieved evidence."""
    
    source_type: Literal["patient", "appointment", "medical_act", "act_result", "patient_note", "act_note", "pdf_extract", "chat_summary"]
    source_id: int
    label: str = Field(description="Human-readable label (e.g., patient name, appointment date)")
    timestamp: Optional[str] = Field(None, description="ISO timestamp when source was created")
    snippet: str = Field(description="Relevant excerpt from the source")
    score: Optional[float] = Field(None, description="Relevance score (0-1)")


class RAGMetadata(BaseModel):
    """Metadata about retrieval and generation."""
    
    retrieval_type: Literal["structured", "hybrid", "none"] = Field(
        description="What retrieval method was used"
    )
    confidence: Literal["high", "medium", "low"] = Field(
        description="Confidence in the answer based on evidence quality"
    )
    tokens_used: int = Field(description="Number of tokens in LLM request")
    language: str = Field(description="Detected language of user query (ISO 639-1)")
    model: str = Field(description="LLM model name used")


class GroundedChatResponse(BaseModel):
    """Chat response with grounding evidence and metadata."""
    
    response: str = Field(description="The assistant's answer")
    sources: List[SourceReference] = Field(
        default_factory=list,
        description="Retrieved sources supporting the answer"
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Warnings (e.g., 'Insufficient data', 'Ambiguous patient match')"
    )
    metadata: RAGMetadata


class ChatRequest(BaseModel):
    """Extended chat request with RAG parameters."""
    
    query: str = Field(description="User's question or prompt")
    patient_id: Optional[int] = Field(None, description="Optional: explicit patient scope")
    include_sources: bool = Field(default=True, description="Include source citations in response")
    retrieval_mode: Literal["auto", "structured_only", "hybrid"] = Field(
        default="auto",
        description="Retrieval strategy"
    )
    language: Optional[str] = Field(None, description="User's language (auto-detect if None)")
