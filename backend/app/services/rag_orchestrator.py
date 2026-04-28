"""
RAG Orchestrator.
Coordinates intent classification, retrieval, authorization, and prompt building.
Central control point for the entire grounded retrieval pipeline.
"""

from typing import Optional, Tuple
from app.schemas.rag_response import GroundedChatResponse, RAGMetadata, ChatRequest
from app.services.retrievers.query_classifier import QueryClassifier, QueryIntent
from app.services.retrievers.structured_retriever import StructuredRetrievalPipeline
from app.services.retrievers.prompt_builder import PromptBuilder
from app.config_rag import rag_config
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class RAGOrchestrator:
    """
    Main orchestrator for RAG pipeline.
    
    Flow:
    1. Classify query intent
    2. Auto-detect patient if enabled and confident
    3. Guard authorization
    4. Retrieve structured facts
    5. Build grounded prompt
    6. (Later) Call LLM and validate response
    """
    
    def __init__(self, db_session, patient_service, llm_service=None):
        """
        Initialize orchestrator.
        
        Args:
            db_session: SQLAlchemy database session
            patient_service: Service for patient queries and authorization
            llm_service: LLM adapter (optional, for full pipeline)
        """
        self.db = db_session
        self.patient_service = patient_service
        self.llm_service = llm_service
        
        # Components
        self.classifier = QueryClassifier()
        self.retriever = StructuredRetrievalPipeline(db_session, patient_service)
        self.prompt_builder = PromptBuilder()
    
    async def process_chat_request(
        self,
        request: ChatRequest,
        user_id: int
    ) -> Tuple[str, GroundedChatResponse, list]:
        """
        Process a chat request end-to-end.
        
        Returns:
            (grounded_prompt, response_object, warnings)
        """
        warnings = []
        patient_id = request.patient_id
        
        # Step 1: Classify intent
        classification = self.classifier.classify(request.query)
        logger.info(f"Classification: {classification.intent} (confidence={classification.confidence})")
        
        # Step 2: Auto-detect patient if enabled and not explicitly provided
        if (not patient_id and 
            classification.intent == QueryIntent.PATIENT_SPECIFIC and
            rag_config.AUTO_DETECT_ENABLED):
            
            patient_id, auto_detect_confidence = await self._auto_detect_patient(
                classification, user_id
            )
            
            if not patient_id and classification.patient_confidence > 0:
                warnings.append(
                    f"Query appears patient-specific but patient could not be auto-detected. "
                    f"Please specify patient ID."
                )
        
        # Step 3: Retrieve facts (with authorization guard)
        facts = await self.retriever.retrieve_with_authorization(
            query=request.query,
            patient_id=patient_id,
            user_id=user_id,
            top_k_per_source=rag_config.RETRIEVAL_TOP_K
        )
        
        if not facts and rag_config.RETURN_INSUFFICIENT_DATA_WHEN_EMPTY:
            warnings.append("No relevant medical records found for this query.")
        
        # Step 4: Build grounded prompt
        grounded_prompt = self.prompt_builder.build_grounded_prompt(
            user_query=request.query,
            retrieved_facts=facts,
            patient_id=patient_id,
            language=request.language or "en"
        )
        
        # Step 5: Determine confidence level
        confidence = self._assess_confidence(len(facts))
        
        # Step 6: Build response object (without LLM answer yet - Phase 0 design)
        sources = self.prompt_builder.extract_sources_from_facts(facts)
        
        metadata = RAGMetadata(
            retrieval_type="structured",  # Phase 1 only
            confidence=confidence,
            tokens_used=len(grounded_prompt.split()),  # Rough estimate
            language=request.language or "en",
            model="pending"  # Will be filled by LLM service
        )
        
        response = GroundedChatResponse(
            response="[Answer pending LLM generation]",  # Phase 0: placeholder
            sources=sources,
            warnings=warnings,
            metadata=metadata
        )
        
        return grounded_prompt, response, warnings
    
    async def _auto_detect_patient(self, classification, user_id: int) -> Tuple[Optional[int], float]:
        """
        Attempt to auto-detect patient from query classification.
        Only auto-binds if confidence meets threshold.
        
        Returns:
            (patient_id, confidence) or (None, 0)
        """
        if classification.detected_patient_id:
            # Already found in classifier
            patient_id = classification.detected_patient_id
            confidence = classification.patient_confidence
        else:
            # Need to search by name or other identifiers
            patient_id = None
            confidence = 0.0
        
        # Check authorization
        if patient_id:
            authorized = await self.patient_service.user_can_access_patient(user_id, patient_id)
            if not authorized:
                logger.warning(f"User {user_id} not authorized for patient {patient_id}")
                return None, 0.0
        
        # Apply confidence threshold
        if confidence < rag_config.AUTO_DETECT_CONFIDENCE_THRESHOLD:
            logger.info(
                f"Auto-detect confidence {confidence} below threshold "
                f"{rag_config.AUTO_DETECT_CONFIDENCE_THRESHOLD}"
            )
            return None, confidence
        
        return patient_id, confidence
    
    def _assess_confidence(self, fact_count: int) -> str:
        """
        Assess answer confidence based on evidence availability.
        
        Args:
            fact_count: Number of retrieved facts
        
        Returns:
            "high" | "medium" | "low"
        """
        if fact_count >= 3:
            return "high"
        elif fact_count >= 1:
            return "medium"
        else:
            return "low"
    
    async def validate_response_policy(self, response: GroundedChatResponse) -> list:
        """
        Validate response against safety policies.
        
        Returns:
            List of policy violations (empty if compliant)
        """
        violations = []
        
        # Policy 1: Require evidence for facts
        if rag_config.REQUIRE_EVIDENCE_FOR_FACTS:
            if response.metadata.confidence == "low" and not response.sources:
                violations.append("Response low confidence but no sources provided")
        
        # Policy 2: Insufficient data fallback
        if rag_config.RETURN_INSUFFICIENT_DATA_WHEN_EMPTY:
            if not response.sources and response.metadata.confidence == "low":
                if "[Answer pending" not in response.response:
                    violations.append("Low confidence without explicit 'insufficient data' statement")
        
        return violations
