"""
Chat service - AI Assistant with patient context awareness
Integrates BioMistral LLM via Ollama with patient medical history
"""

import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.models.llm import llm
from app.models.chat_message import ChatMessage
from app.models.patient import Patient
from app.models.user import User

logger = logging.getLogger(__name__)


def build_patient_context(db: Session, patient_id: int) -> str:
    """
    Build medical context from patient data for the LLM prompt
    
    Args:
        db: Database session
        patient_id: Patient ID
        
    Returns:
        Formatted patient context string
    """
    try:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return ""
        
        context = f"""
[Patient Medical Context]
- Name: {patient.first_name} {patient.last_name}
- Date of Birth: {patient.date_of_birth or 'Unknown'}
- Gender: {patient.gender}
- Blood Type: {patient.blood_type or 'Unknown'}
- Allergies: {patient.notes or 'None documented'}
- Diagnosis: {patient.primary_diagnosis or 'None documented'}
- Insurance: {patient.insurance}
- Medical Notes: {patient.notes or 'No notes'}
"""
        return context.strip()
    except Exception as e:
        logger.error(f"Error building patient context: {e}")
        return ""


def get_chat_response(
    message: str,
    user_id: int,
    db: Session,
    patient_id: Optional[int] = None,
    language: str = "fr"
) -> dict:
    """
    Generate an AI response for a medical chat message
    
    Args:
        message: User's chat message
        user_id: User ID (for audit)
        db: Database session
        patient_id: Optional patient ID for context
        language: Language code (fr, en, ar)
        
    Returns:
        dict with response, tokens used, and model info
    """
    
    # Build system message based on language
    system_messages = {
        "fr": "Tu es un assistant médical IA spécialisé en médecine générale et rhumatologie. Réponds aux questions médicales de manière précise et professionnelle. Fournis des explications claires.",
        "en": "You are a medical AI assistant specialized in general medicine and rheumatology. Answer medical questions precisely and professionally. Provide clear explanations.",
        "ar": "أنت مساعد ذكاء اصطناعي طبي متخصص في الطب العام وأمراض الروماتيزم. أجب على الأسئلة الطبية بدقة واحترافية. قدم شروحات واضحة."
    }
    
    system_msg = system_messages.get(language, system_messages["fr"])
    
    # Build context
    context = ""
    if patient_id:
        context = build_patient_context(db, patient_id)
    
    # Construct full prompt
    full_prompt = f"""{system_msg}

{context}

User: {message}
Assistant:"""
    
    # Generate response
    result = llm.generate(full_prompt, language=language)
    
    # Store in database
    try:
        chat_msg = ChatMessage(
            user_id=user_id,
            patient_id=patient_id,
            message=message,
            response=result.get("response", ""),
            language=language,
            model_name=result.get("model", "unknown"),
            tokens_used=result.get("tokens", 0)
        )
        db.add(chat_msg)
        db.commit()
        db.refresh(chat_msg)
        logger.info(f"Chat message {chat_msg.id} stored for user {user_id}")
    except Exception as e:
        logger.error(f"Error storing chat message: {e}")
        db.rollback()
    
    return {
        "response": result.get("response", "").strip(),
        "tokens": result.get("tokens", 0),
        "model": result.get("model", "biomistral"),
        "language": language
    }


def get_chat_history(
    db: Session,
    user_id: int,
    patient_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0
) -> list:
    """
    Retrieve chat history for a user/patient
    
    Args:
        db: Database session
        user_id: User ID
        patient_id: Optional patient ID filter
        limit: Max number of messages to return
        offset: Pagination offset
        
    Returns:
        List of chat messages
    """
    query = db.query(ChatMessage).filter(ChatMessage.user_id == user_id)
    
    if patient_id:
        query = query.filter(ChatMessage.patient_id == patient_id)
    
    return query.order_by(ChatMessage.created_at.desc()).offset(offset).limit(limit).all()

