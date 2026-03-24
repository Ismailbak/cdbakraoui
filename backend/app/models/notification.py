from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # None if is_public is handled differently, but here we'll use it for individual read tracking
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255))
    message = Column(Text)
    read = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    category = Column(String(50), default='message')
    created_at = Column(DateTime, server_default=func.now())
