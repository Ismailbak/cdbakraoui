"""
RAG-integrated Chat Service.
Extends the existing chat service with RAG orchestrator for grounded responses.
"""

import logging
from typing import Optional
from sqlalchemy.orm import Session

from app.services.rag_orchestrator import RAGOrchestrator
from app.schemas.rag_response import ChatRequest as RAGChatRequest, GroundedChatResponse
from app.models.llm import llm
from app.models.chat_message import ChatMessage
from app.models.user import User
from app.services.patient_service import PatientService

logger = logging.getLogger(__name__)


async def get_grounded_chat_response(
    message: str,
    user_id: int,
    db: Session,
    patient_id: Optional[int] = None,
    language: str = "fr",
    retrieval_mode: str = "auto"
) -> dict:
    """
    Generate a grounded AI response using RAG orchestrator.
    
    Flow:
    1. Classify intent with query classifier
    2. Retrieve relevant medical facts with authorization
    3. Build deterministic prompt with evidence
    4. Call LLM with grounded prompt
    5. Validate response against safety policies
    6. Return response with sources and metadata
    
    Args:
        message: User's chat message
        user_id: User ID (for authorization)
        db: Database session
        patient_id: Optional patient ID
        language: Language code (fr, en, ar)
        retrieval_mode: "auto" | "structured_only" | "hybrid"
    
    Returns:
        dict with grounded response, sources, confidence, and metadata
    """
    try:
        # Initialize orchestrator
        patient_service = PatientService(db)
        orchestrator = RAGOrchestrator(db, patient_service)
        
        # Build RAG request
        rag_request = RAGChatRequest(
            query=message,
            patient_id=patient_id,
            include_sources=True,
            retrieval_mode=retrieval_mode,
            language=language
        )
        
        # Process through orchestrator
        grounded_prompt, rag_response, warnings, detected_patient_id = await orchestrator.process_chat_request(
            rag_request, user_id=user_id
        )
        
        # Use detected patient ID if auto-detected, otherwise use provided one
        final_patient_id = detected_patient_id or patient_id
        
        logger.info(
            f"RAG orchestration complete: {len(rag_response.sources)} sources, "
            f"confidence={rag_response.metadata.confidence}, "
            f"warnings={len(warnings)}"
        )
        
        # Build system message based on language
        system_messages = {
            "fr": "Tu es un assistant médical IA spécialisé en médecine générale et rhumatologie. Sois EXTRÊMEMENT CONCIS et direct. Limite tes réponses à 3 ou 4 phrases maximum. Ne donne pas de longues introductions ou conclusions.",
            "en": "You are a medical AI assistant specialized in general medicine and rheumatology. Be EXTREMELY CONCISE and direct. Limit your answers to 3 or 4 sentences maximum. Do not provide long introductions or conclusions.",
            "ar": "أنت مساعد ذكاء اصطناعي طبي متخصص في الطب العام وأمراض الروماتيزم. كن موجزاً ومباشراً جداً. اقتصر في إجاباتك على 3 أو 4 جمل كحد أقصى. لا تقدم مقدمات أو استنتاجات طويلة."
        }
        
        system_msg = system_messages.get(language, system_messages["fr"])
        
        # If confidence is low, add safety guidance to LLM
        if rag_response.metadata.confidence == "low":
            system_msg += "\n\nWARNING: Limited evidence available for this query. Be cautious and explicitly state uncertainty."
        
        # Call LLM with grounded prompt
        llm_result = llm.generate(
            prompt=grounded_prompt,
            system=system_msg,
            language=language
        )
        
        # Update response with LLM output
        rag_response.response = llm_result.get("response", "").strip()
        rag_response.metadata.model = llm_result.get("model", "biomistral")
        rag_response.metadata.tokens_used = llm_result.get("tokens", 0)
        
        # Validate response against safety policies
        policy_violations = await orchestrator.validate_response_policy(rag_response)
        if policy_violations:
            logger.warning(f"Policy violations detected: {policy_violations}")
            # Note: In Phase 1, we log but don't block responses with policy violations
            # rag_response.warnings.extend(policy_violations)
        
        # Store in database
        try:
            # Import chat_service for session management
            from app.services.chat_service import create_chat_session, get_chat_session
            from app.models.chat_session import ChatSession
            
            # Create or get chat session if patient is identified
            session_id = None
            if final_patient_id:
                # Check if there's an active session for this patient
                existing_session = db.query(ChatSession).filter(
                    ChatSession.patient_id == final_patient_id,
                    ChatSession.created_by == user_id
                ).order_by(ChatSession.created_at.desc()).first()
                
                if existing_session:
                    session_id = existing_session.id
                else:
                    # Create new session
                    new_session = create_chat_session(
                        db=db,
                        patient_id=final_patient_id,
                        user_id=user_id,
                        title=f"Chat session for patient {final_patient_id}"
                    )
                    db.commit()
                    session_id = new_session.id
            
            chat_msg = ChatMessage(
                session_id=session_id,
                user_id=user_id,
                patient_id=final_patient_id,
                message=message,
                response=rag_response.response,
                language=language,
                model_name=rag_response.metadata.model,
                tokens_used=rag_response.metadata.tokens_used
            )
            db.add(chat_msg)
            db.commit()
            db.refresh(chat_msg)
            logger.info(f"Grounded chat message {chat_msg.id} stored for user {user_id}, patient {final_patient_id}")
        except Exception as e:
            logger.error(f"Error storing chat message: {e}")
            db.rollback()
        
        return {
            "response": rag_response.response,
            "sources": [s.model_dump() for s in rag_response.sources],
            "confidence": rag_response.metadata.confidence,
            "warnings": rag_response.warnings,
            "tokens": rag_response.metadata.tokens_used,
            "model": rag_response.metadata.model,
            "language": language,
            "retrieval_type": rag_response.metadata.retrieval_type
        }
    
    except Exception as e:
        logger.error(f"Error in grounded chat response: {e}", exc_info=True)
        # Fallback to basic response if orchestrator fails
        return {
            "response": f"I encountered an error processing your query: {str(e)}",
            "sources": [],
            "confidence": "low",
            "warnings": ["RAG orchestrator error - falling back to basic response"],
            "tokens": 0,
            "model": "error",
            "language": language,
            "retrieval_type": "none",
            "error": str(e)
        }
