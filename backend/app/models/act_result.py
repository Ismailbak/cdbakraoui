from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class ActResult(Base):
    """Lab results associated with a medical act."""
    __tablename__ = "act_results"

    id = Column(Integer, primary_key=True, index=True)
    act_id = Column(Integer, ForeignKey("medical_acts.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    result_date = Column(Date, nullable=True)
    result_name = Column(String(255), nullable=True)
    result_value = Column(String(100), nullable=True)
    result_unit = Column(String(50), nullable=True)
    is_abnormal = Column(Boolean, default=False)
    result_category = Column(String(50), nullable=True)  # e.g., "laboratoire", "imagerie"
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
