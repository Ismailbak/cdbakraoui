from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ChatMessageSchema(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSessionCreate(BaseModel):
    title: Optional[str] = None
    patient_id: int


class ChatSessionUpdate(BaseModel):
    title: Optional[str] = None


class ChatSessionResponse(BaseModel):
    id: int
    patient_id: int
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    created_by: int

    model_config = ConfigDict(from_attributes=True)


class ChatSessionDetailResponse(ChatSessionResponse):
    messages: List[ChatMessageSchema] = []


class ChatMessageCreate(BaseModel):
    session_id: int
    role: str  # "user" or "assistant"
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
