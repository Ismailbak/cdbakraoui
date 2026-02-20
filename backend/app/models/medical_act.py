from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class MedicalAct(Base):
    __tablename__ = "medical_acts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    act_type = Column(String(50))
    description = Column(Text, nullable=True)
    report = Column(Text, nullable=True)  # Rapport de consultation structuré
    date = Column(String(20))
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="completed")
    doctor_id = Column(Integer, nullable=True)  # Médecin principal
    assigned_staff_ids = Column(Text, nullable=True)  # JSON array of staff IDs for multi-assignment
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class ActDocument(Base):
    """Documents attachés à un acte médical / consultation."""
    __tablename__ = "act_documents"

    id = Column(Integer, primary_key=True, index=True)
    act_id = Column(Integer, ForeignKey("medical_acts.id"))
    filename = Column(String(255))
    file_path = Column(String(500))  # path or storage key
    mime_type = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
