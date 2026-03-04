from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    ipp = Column(String(50), unique=True, index=True, nullable=True)  # Identifiant Permanent du Patient
    name = Column(String(255), index=True)
    age = Column(Integer)
    gender = Column(String(10))
    date_of_birth = Column(String(20), nullable=True)
    phone = Column(String(30), index=True, nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), index=True, nullable=True)
    insurance = Column(String(100), nullable=True)  # Mutuelle / type assurance (CNSS, CNOPS, etc.)
    insurance_number = Column(String(50), nullable=True)
    blood_type = Column(String(10), nullable=True)
    allergies = Column(Text, nullable=True)  # JSON array of allergies
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_relation = Column(String(100), nullable=True)
    emergency_contact_phone = Column(String(30), nullable=True)
    diagnosis = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)  # Notes médicales
    notes_admin = Column(Text, nullable=True)  # Notes administratives
    status = Column(String(20), default="Actif")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
