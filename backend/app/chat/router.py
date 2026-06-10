"""
Chat API endpoints for AI Assistant
- POST /chat/: Send a message and get AI response
- GET /chat/history: Get chat history
"""

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
import io
import logging
import traceback

from app.core.database import get_db
from app.chat.service import (
    get_chat_response, 
    get_chat_history,
    delete_chat_history_item,
    create_chat_session,
    get_chat_session,
    list_patient_chat_sessions,
    update_chat_session,
    delete_chat_session,
    add_message_to_session,
    get_session_messages
)
from app.chat.rag.chat_service import get_grounded_chat_response
from app.auth.router import get_current_user_orm
from app.models.user import User
from app.core.schemas.chat_session import (
    ChatSessionCreate,
    ChatSessionUpdate,
    ChatSessionResponse,
    ChatSessionDetailResponse,
    ChatMessageCreate,
    ChatMessageResponse
)

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, strip_whitespace=True)
    patient_id: Optional[int] = None
    session_id: Optional[int] = None
    language: Literal["fr", "en", "ar"] = "fr"


MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024
TEXT_ATTACHMENT_EXTENSIONS = {".txt", ".md", ".csv", ".json", ".xml", ".html", ".log"}


def _attachment_extension(filename: Optional[str]) -> str:
    if not filename or "." not in filename:
        return ""
    return f".{filename.rsplit('.', 1)[-1].lower()}"


async def _extract_attachment_text(file: UploadFile) -> tuple[str, str]:
    """Extract plain text from a supported assistant attachment."""
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="La pièce jointe est vide.")
    if len(raw) > MAX_ATTACHMENT_BYTES:
        raise HTTPException(status_code=413, detail="La pièce jointe dépasse la limite de 8 Mo.")

    filename = file.filename or "piece_jointe"
    extension = _attachment_extension(filename)

    if extension in TEXT_ATTACHMENT_EXTENSIONS or (file.content_type or "").startswith("text/"):
        try:
            return raw.decode("utf-8"), filename
        except UnicodeDecodeError:
            return raw.decode("latin-1", errors="ignore"), filename

    if extension == ".pdf" or file.content_type == "application/pdf":
        try:
            try:
                from pypdf import PdfReader
            except ImportError:
                from PyPDF2 import PdfReader

            reader = PdfReader(io.BytesIO(raw))
            text = "\n\n".join((page.extract_text() or "").strip() for page in reader.pages)
            text = text.strip()
            if not text:
                raise HTTPException(status_code=400, detail="Aucun texte lisible trouvé dans ce PDF.")
            return text, filename
        except HTTPException:
            raise
        except ImportError:
            raise HTTPException(
                status_code=400,
                detail="Lecture PDF indisponible. Installez pypdf ou testez avec un fichier texte.",
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Impossible de lire cette pièce jointe PDF.")

    raise HTTPException(
        status_code=400,
        detail="Type de pièce jointe non supporté. Utilisez PDF, TXT, MD, CSV, JSON, XML ou LOG.",
    )


def _build_attachment_prompt(message: str, filename: str, text: str) -> str:
    clipped = text[:12000]
    truncated_note = "\n\n[Texte tronqué à 12 000 caractères pour l'analyse.]" if len(text) > len(clipped) else ""
    user_message = message.strip() or "Analyse cette pièce jointe."
    return (
        f"{user_message}\n\n"
        f"--- PIECE JOINTE: {filename} ---\n"
        f"{clipped}{truncated_note}\n"
        "--- FIN PIECE JOINTE ---"
    )


class ChatResponse(BaseModel):
    response: str
    tokens: int
    model: str
    language: str


class SourceReference(BaseModel):
    """Citation source for retrieved evidence."""
    source_type: str
    source_id: int
    label: str
    timestamp: Optional[str] = None
    snippet: str
    score: Optional[float] = None


class GroundedChatResponse(BaseModel):
    """Chat response with grounding evidence and metadata."""
    response: str
    sources: List[SourceReference] = []
    confidence: str  # "high" | "medium" | "low"
    warnings: List[str] = []
    tokens: int
    model: str
    language: str
    retrieval_type: str = "structured"  # "structured" | "hybrid" | "none"
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    session_id: Optional[int] = None
    message_id: Optional[int] = None


class ChatHistoryItem(BaseModel):
    id: int
    session_id: Optional[int] = None
    patient_id: Optional[int] = None
    message: str
    response: str
    language: str
    tokens_used: Optional[int] = None
    model: str = Field(default="biomistral", alias="model_name")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    Send a message to the AI assistant

    - **message**: User's question or message
    - **patient_id**: Optional patient ID for medical context
    - **language**: Response language (fr, en, ar)
    """
    try:
        result = get_chat_response(
            message=request.message,
            user_id=current_user.id,
            db=db,
            patient_id=request.patient_id,
            language=request.language
        )
        return ChatResponse(**result)
    except PermissionError:
        raise HTTPException(status_code=403, detail="Access to this patient is not allowed")
    except Exception as e:
        logger.error(f"Chat error for user {current_user.id}:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error generating response")


@router.post("/grounded", response_model=GroundedChatResponse)
async def chat_grounded(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    Send a message to the RAG-powered assistant with grounded responses.
    
    This endpoint uses the RAG orchestrator to:
    1. Classify query intent
    2. Retrieve relevant medical facts
    3. Build a grounded prompt with evidence
    4. Generate response with sources and confidence
    
    - **message**: User's question or message
    - **patient_id**: Optional patient ID for medical context
    - **language**: Response language (fr, en, ar)
    
    Returns:
    - **response**: The assistant's answer
    - **sources**: List of retrieved facts with citations
    - **confidence**: "high" | "medium" | "low" based on evidence quality
    - **warnings**: Warnings about insufficient data or ambiguities
    - **retrieval_type**: "structured" | "hybrid" | "none"
    """
    try:
        result = await get_grounded_chat_response(
            message=request.message,
            user_id=current_user.id,
            db=db,
            patient_id=request.patient_id,
            session_id=request.session_id,
            language=request.language,
            retrieval_mode="auto"
        )
        
        # Convert source dicts to SourceReference objects
        sources = [
            SourceReference(
                source_type=s.get("source_type"),
                source_id=s.get("source_id"),
                label=s.get("label"),
                timestamp=s.get("timestamp"),
                snippet=s.get("snippet"),
                score=s.get("score")
            )
            for s in result.get("sources", [])
        ]
        
        return GroundedChatResponse(
            response=result.get("response", ""),
            sources=sources,
            confidence=result.get("confidence", "low"),
            warnings=result.get("warnings", []),
            tokens=result.get("tokens", 0),
            model=result.get("model", "biomistral"),
            language=result.get("language", "fr"),
            retrieval_type=result.get("retrieval_type", "structured"),
            patient_id=result.get("patient_id"),
            patient_name=result.get("patient_name"),
            session_id=result.get("session_id"),
            message_id=result.get("message_id"),
        )
    except PermissionError:
        raise HTTPException(status_code=403, detail="Access to this patient is not allowed")
    except Exception as e:
        logger.error(f"Grounded chat error for user {current_user.id}:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error generating grounded response")


@router.post("/grounded/attachment", response_model=GroundedChatResponse)
async def chat_grounded_with_attachment(
    message: str = Form(""),
    patient_id: Optional[int] = Form(None),
    session_id: Optional[int] = Form(None),
    language: Literal["fr", "en", "ar"] = Form("fr"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """
    Send a grounded assistant message with one attachment.

    The attachment text is extracted and appended to the user prompt so the
    existing RAG + LLM path can analyze it without changing normal chat.
    """
    try:
        attachment_text, filename = await _extract_attachment_text(file)
        enriched_message = _build_attachment_prompt(message, filename, attachment_text)

        result = await get_grounded_chat_response(
            message=enriched_message,
            user_id=current_user.id,
            db=db,
            patient_id=patient_id,
            session_id=session_id,
            stored_message=f"{message.strip() or 'Analyse cette pièce jointe.'}\n\nPièce jointe: {filename}",
            language=language,
            retrieval_mode="auto",
        )

        sources = [
            SourceReference(
                source_type=s.get("source_type"),
                source_id=s.get("source_id"),
                label=s.get("label"),
                timestamp=s.get("timestamp"),
                snippet=s.get("snippet"),
                score=s.get("score"),
            )
            for s in result.get("sources", [])
        ]

        return GroundedChatResponse(
            response=result.get("response", ""),
            sources=sources,
            confidence=result.get("confidence", "low"),
            warnings=result.get("warnings", []),
            tokens=result.get("tokens", 0),
            model=result.get("model", "biomistral"),
            language=result.get("language", language),
            retrieval_type=result.get("retrieval_type", "structured"),
            patient_id=result.get("patient_id"),
            patient_name=result.get("patient_name"),
            session_id=result.get("session_id"),
            message_id=result.get("message_id"),
        )
    except HTTPException:
        raise
    except Exception:
        logger.error(f"Attachment chat error for user {current_user.id}:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error generating response from attachment")


@router.get("/history", response_model=List[ChatHistoryItem])
def chat_history(
    patient_id: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    Get chat history for the current user

    - **patient_id**: Optional filter by patient
    - **limit**: Max number of messages (1–100)
    - **offset**: Pagination offset
    """
    try:
        history = get_chat_history(
            db=db,
            user_id=current_user.id,
            patient_id=patient_id,
            limit=limit,
            offset=offset
        )
        return history
    except PermissionError:
        raise HTTPException(status_code=403, detail="Access to this patient is not allowed")
    except Exception as e:
        logger.error(f"History error for user {current_user.id}:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error fetching chat history")


@router.delete("/history/{message_id}")
def delete_history_item(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    Delete one chat history item owned by the current user.
    """
    try:
        if not delete_chat_history_item(db=db, message_id=message_id, user_id=current_user.id):
            raise HTTPException(status_code=404, detail="Chat history item not found")

        return {"message": "Chat history item deleted successfully"}
    except HTTPException:
        raise
    except Exception:
        logger.error(f"Delete history error for user {current_user.id}:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error deleting chat history item")


# Chat Session Management Endpoints

@router.post("/sessions", response_model=ChatSessionResponse)
def create_session(
    request: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    Create a new chat session for a patient
    
    - **patient_id**: ID of the patient
    - **title**: Optional session title (auto-generated if not provided)
    """
    try:
        session = create_chat_session(
            db=db,
            patient_id=request.patient_id,
            user_id=current_user.id,
            title=request.title
        )
        return session
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating session: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error creating chat session")


@router.get("/sessions/{session_id}", response_model=ChatSessionDetailResponse)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    Get a chat session with all messages
    
    - **session_id**: ID of the session
    """
    try:
        session = get_chat_session(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Verify user has access to this session's patient
        # (Add authorization check here if needed)
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error fetching chat session")


@router.get("/patients/{patient_id}/sessions", response_model=List[ChatSessionResponse])
def list_patient_sessions(
    patient_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    List all chat sessions for a patient
    
    - **patient_id**: ID of the patient
    - **limit**: Max number of sessions (1–100)
    - **offset**: Pagination offset
    """
    try:
        # Verify user has access to this patient
        # (Add authorization check here if needed)
        
        sessions = list_patient_chat_sessions(
            db=db,
            patient_id=patient_id,
            user_id=current_user.id,
            limit=limit,
            offset=offset
        )
        return sessions
    except Exception as e:
        logger.error(f"Error listing patient sessions: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error fetching patient sessions")


@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
def update_session(
    session_id: int,
    request: ChatSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    Update a chat session
    
    - **session_id**: ID of the session
    - **title**: New session title
    """
    try:
        session = update_chat_session(
            db=db,
            session_id=session_id,
            title=request.title
        )
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating session: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error updating chat session")


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    Delete a chat session and all associated messages
    
    - **session_id**: ID of the session to delete
    """
    try:
        if not delete_chat_session(db, session_id):
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        return {"message": "Chat session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error deleting chat session")


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
def add_message(
    session_id: int,
    request: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    Add a message to a chat session
    
    - **session_id**: ID of the session
    - **role**: Message role ("user" or "assistant")
    - **content**: Message content
    """
    try:
        message = add_message_to_session(
            db=db,
            session_id=session_id,
            role=request.role,
            content=request.content
        )
        return message
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error adding message: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error adding message to session")


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
def get_messages(
    session_id: int,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm)
):
    """
    Get messages from a chat session
    
    - **session_id**: ID of the session
    - **limit**: Max number of messages (1–500)
    - **offset**: Pagination offset
    """
    try:
        messages = get_session_messages(
            db=db,
            session_id=session_id,
            limit=limit,
            offset=offset
        )
        return messages
    except Exception as e:
        logger.error(f"Error fetching messages: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error fetching session messages")