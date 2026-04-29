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
    ) -> Tuple[str, GroundedChatResponse, list, Optional[int]]:
        """
        Process a chat request end-to-end.
        
        Returns:
            (grounded_prompt, response_object, warnings, detected_patient_id)
        """
        print("\n" + "="*80)
        print(f"🚀 RAG_ORCHESTRATOR.process_chat_request START")
        print(f"   Query: '{request.query}'")
        print(f"   Patient ID from request: {request.patient_id}")
        print("="*80)
        
        warnings = []
        patient_id = request.patient_id
        detected_patient_id = None
        
        # Step 1: Classify intent
        classification = self.classifier.classify(request.query)
        print(f"📊 Classification: {classification.intent} (confidence={classification.confidence}, patient_confidence={classification.patient_confidence})")
        
        # Step 2: Auto-detect patient if enabled and not explicitly provided
        print(f"\n🔎 Step 2: Auto-detect check")
        print(f"   patient_id={patient_id}, intent={classification.intent}, AUTO_DETECT_ENABLED={rag_config.AUTO_DETECT_ENABLED}")
        
        if (not patient_id and 
            classification.intent == QueryIntent.PATIENT_SPECIFIC and
            rag_config.AUTO_DETECT_ENABLED):
            
            print(f"   ✅ ENTERING IPP DETECTION BLOCK")
            
            # Try to extract IPP from query and lookup patient
            import re
            ipp_pattern = re.compile(r'\b(?:[A-Z]{2}\d{6,8}|\d{1,3})\b')
            ipp_match = ipp_pattern.search(request.query)
            
            print(f"\n🔍 DEBUG: Query: '{request.query}'")
            print(f"🔍 DEBUG: IPP match: {ipp_match.group() if ipp_match else 'NOT FOUND'}")
            
            if ipp_match:
                # IPP detected - look it up in database
                ipp_value = ipp_match.group()
                from app.models.patient import Patient
                print(f"🔍 DEBUG: Looking up patient with IPP='{ipp_value}'")
                
                db_patient = self.db.query(Patient).filter(Patient.ipp == ipp_value).first()
                print(f"🔍 DEBUG: Database query result: {db_patient}")
                
                if db_patient:
                    patient_id = db_patient.id
                    detected_patient_id = patient_id
                    print(f"✅ DEBUG: Auto-detected patient {patient_id} ({db_patient.first_name} {db_patient.last_name}) from IPP {ipp_value}")
                else:
                    print(f"❌ DEBUG: IPP {ipp_value} not found in database")
                    # Try alternative formats
                    print(f"🔍 DEBUG: Trying alternative formats for IPP '{ipp_value}'...")
                    db_patient_alt = self.db.query(Patient).filter(
                        Patient.ipp.ilike(f"%{ipp_value}%")
                    ).first()
                    if db_patient_alt:
                        print(f"✅ DEBUG: Found with partial match: IPP={db_patient_alt.ipp}, Patient={db_patient_alt.id}")
                        patient_id = db_patient_alt.id
                        detected_patient_id = patient_id
                    else:
                        print(f"❌ DEBUG: Patient with IPP '{ipp_value}' not found in system.")
                        warnings.append(f"Patient with IPP '{ipp_value}' not found in system.")
            
            # If still no patient found, apply confidence threshold check
            if not patient_id and classification.patient_confidence >= rag_config.AUTO_DETECT_CONFIDENCE_THRESHOLD:
                # Try alternative detection methods (placeholder for future)
                patient_id, auto_detect_confidence = await self._auto_detect_patient(
                    classification, user_id
                )
                detected_patient_id = patient_id
            
            # Check authorization
            if patient_id:
                authorized = await self.patient_service.user_can_access_patient(user_id, patient_id)
                if not authorized:
                    logger.warning(f"User {user_id} not authorized for patient {patient_id}")
                    patient_id = None
                    warnings.append(f"Access denied to patient {patient_id}.")
            
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
            language=request.language or "en",
            detected_from_ipp=detected_patient_id is not None
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
        
        return grounded_prompt, response, warnings, detected_patient_id or patient_id
    
    async def _auto_detect_patient(self, classification, user_id: int) -> Tuple[Optional[int], float]:
        """
        Fallback auto-detect when IPP lookup doesn't succeed.
        For future enhancement (name-based lookup, etc.).
        
        Returns:
            (patient_id, confidence) or (None, 0)
        """
        # Placeholder for future enhancements like name-based lookup
        return None, 0.0
    
    async def _lookup_patient_by_ipp(self, ipp_value: str) -> Optional[int]:
        """
        Look up patient ID by IPP code.
        
        Args:
            ipp_value: IPP code (e.g., "15", "01", "FR123456")
        
        Returns:
            patient_id or None if not found
        """
        from app.models.patient import Patient
        try:
            patient = self.db.query(Patient).filter(Patient.ipp == ipp_value).first()
            if patient:
                logger.info(f"Found patient {patient.id} with IPP {ipp_value}")
                return patient.id
            logger.warning(f"Patient with IPP {ipp_value} not found")
            return None
        except Exception as e:
            logger.error(f"Error looking up patient by IPP {ipp_value}: {e}")
            return None
    
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
