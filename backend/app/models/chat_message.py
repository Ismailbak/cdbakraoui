from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True, index=True)
    message = Column(Text)  # User's message
    response = Column(Text)  # AI's response
    language = Column(String(10), default="fr")  # Language used (fr, en, ar)
    model_name = Column(String(100), default="biomistral")  # Which model was used
    tokens_used = Column(Integer, nullable=True)  # Token count for billing
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, onupdate=func.now())
