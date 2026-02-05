from fastapi import APIRouter
from pydantic import BaseModel
from app.services.chat_service import get_chat_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    patient_id: int = None

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest):
    response = get_chat_response(request.message, request.patient_id)
    return {"response": response}
