from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class PatientAllergy(Base):
    """Patient allergies and adverse reactions."""
    __tablename__ = "patient_allergies"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    allergen = Column(String(255), nullable=False)  # e.g., "Penicillin", "Peanuts"
    reaction_type = Column(String(100), nullable=True)  # e.g., "rash", "anaphylaxis"
    severity = Column(String(20), nullable=True)  # e.g., "mild", "moderate", "severe"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
