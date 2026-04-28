"""
Retrievers package for RAG.
Contains query classification, structured retrieval, and prompt building.
"""

from .query_classifier import QueryClassifier, QueryIntent, ClassificationResult
from .structured_retriever import (
    StructuredRetriever,
    RetrievedFact,
    PatientRetriever,
    AppointmentRetriever,
    MedicalActRetriever,
    ActResultRetriever,
    StructuredRetrievalPipeline,
)
from .prompt_builder import PromptBuilder, PromptTemplate

__all__ = [
    "QueryClassifier",
    "QueryIntent",
    "ClassificationResult",
    "StructuredRetriever",
    "RetrievedFact",
    "PatientRetriever",
    "AppointmentRetriever",
    "MedicalActRetriever",
    "ActResultRetriever",
    "StructuredRetrievalPipeline",
    "PromptBuilder",
    "PromptTemplate",
]
