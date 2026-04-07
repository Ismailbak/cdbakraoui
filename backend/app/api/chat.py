"""
Chat API endpoints for AI Assistant
- POST /chat/: Send a message and get AI response
- GET /chat/history: Get chat history
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
import logging
import traceback

from app.database import get_db
from app.services.chat_service import get_chat_response, get_chat_history
from app.api.auth import get_current_user_orm
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, strip_whitespace=True)
    patient_id: Optional[int] = None
    language: Literal["fr", "en", "ar"] = "fr"


class ChatResponse(BaseModel):
    response: str
    tokens: int
    model: str
    language: str


class ChatHistoryItem(BaseModel):
    id: int
    message: str
    response: str
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


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