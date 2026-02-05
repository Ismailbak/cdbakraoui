from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class MedicalAct(Base):
    __tablename__ = "medical_acts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    act_type = Column(String(50))
    description = Column(Text, nullable=True)
    date = Column(String(20))
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="completed")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
