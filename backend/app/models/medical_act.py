from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date, Numeric
from sqlalchemy.sql import func
from app.database import Base

class MedicalAct(Base):
    __tablename__ = "medical_acts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    act_type = Column(String(50))
    description = Column(Text, nullable=True)
    report = Column(Text, nullable=True)  # Rapport de consultation structuré
    act_date = Column(Date, nullable=False)  # Date of the medical act
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="completed")
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Médecin principal
    amount = Column(Numeric(10, 2), nullable=True)
    category = Column(String(50), nullable=True)
    # diagnosis and treatment moved to separate tables (act_diagnoses, act_treatments)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class ActDocument(Base):
    """Documents attachés à un acte médical / consultation."""
    __tablename__ = "act_documents"

    id = Column(Integer, primary_key=True, index=True)
    act_id = Column(Integer, ForeignKey("medical_acts.id"), nullable=False)
    filename = Column(String(255))
    file_path = Column(String(500))  # path or storage key
    mime_type = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class ActDiagnosis(Base):
    """Diagnoses associated with a medical act."""
    __tablename__ = "act_diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    act_id = Column(Integer, ForeignKey("medical_acts.id"), nullable=False)
    diagnosis_label = Column(String(255), nullable=False)
    diagnosis_notes = Column(Text, nullable=True)
    diagnosis_type = Column(String(20), default="principal")  # principal, secondary, differential
    created_at = Column(DateTime, server_default=func.now())


class ActTreatment(Base):
    """Treatments/medications prescribed in a medical act."""
    __tablename__ = "act_treatments"

    id = Column(Integer, primary_key=True, index=True)
    act_id = Column(Integer, ForeignKey("medical_acts.id"), nullable=False)
    drug_name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)  # e.g., "3x daily", "once at night"
    duration = Column(String(100), nullable=True)  # e.g., "7 days", "1 month"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class MedicalActStaff(Base):
    """Junction table for multi-staff assignment to medical acts."""
    __tablename__ = "medical_act_staff"

    id = Column(Integer, primary_key=True, index=True)
    medical_act_id = Column(Integer, ForeignKey("medical_acts.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(100), nullable=True)  # e.g., "nurse", "anesthetist", "assistant"
    created_at = Column(DateTime, server_default=func.now())
