"""
Chat Session model - Groups related chat messages into conversations
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ChatSession(Base):
    """
    Represents a conversation session between a doctor and the AI
    
    Can be scoped to:
    - A specific patient (patient_id set)
    - General consultation (patient_id null)
    
    All ChatMessage records belong to a ChatSession
    """
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    
    # User and Patient Context
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # Who created this session
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    
    # Session Metadata
    title = Column(String(255), nullable=True)  # Auto-generated or custom title
    
    # Lifecycle
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    user = relationship("User", foreign_keys="[ChatSession.created_by]", back_populates="chat_sessions")
    patient = relationship("Patient", back_populates="chat_sessions")
    
    def __repr__(self):
        return f"<ChatSession {self.id} - User {self.created_by}, Patient {self.patient_id}>"
