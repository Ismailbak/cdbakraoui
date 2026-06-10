from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String(100), nullable=True)
    action = Column(String(100), index=True)  # e.g., "LOGIN", "DELETE_PATIENT"
    resource_type = Column(String(50), nullable=True)  # e.g., "patient", "medical_act"
    resource_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)  # JSON or descriptive text
    ip_address = Column(String(45), nullable=True)
    status = Column(String(20), default="success")  # "success" or "failure"
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
