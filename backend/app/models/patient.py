from sqlalchemy import Column, Integer, String, Text, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    ipp = Column(String(50), unique=True, index=True, nullable=True)  # Identifiant Permanent du Patient
    first_name = Column(String(255), index=True, nullable=False)
    last_name = Column(String(255), index=True, nullable=False)  # Also used for FULLTEXT search
    civility = Column(String(10), nullable=True)  # M., Mme, Mlle, etc.
    gender = Column(String(10))
    date_of_birth = Column(Date, nullable=True)  # Age calculated dynamically, never stored
    phone = Column(String(30), index=True, nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), index=True, nullable=True)
    marital_status = Column(String(50), nullable=True)  # Célibataire, Marié, Divorcé, Veuf
    nationality = Column(String(100), nullable=True)
    profession = Column(String(100), nullable=True)
    insurance = Column(String(100), nullable=True)  # Mutuelle / type assurance (CNSS, CNOPS, etc.)
    insurance_number = Column(String(50), nullable=True)
    blood_type = Column(String(10), nullable=True)
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_relation = Column(String(100), nullable=True)
    emergency_contact_phone = Column(String(30), nullable=True)
    primary_diagnosis = Column(String(255), nullable=True)  # Main diagnosis (renamed from diagnosis)
    notes = Column(Text, nullable=True)  # Notes médicales
    notes_admin = Column(Text, nullable=True)  # Notes administratives
    status = Column(String(20), default="Actif")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    chat_sessions = relationship("ChatSession", back_populates="patient")
