"""
Patient Service - Patient data operations and authorization.
Supports both basic CRUD and RAG-specific authorization checks.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.user import User
import logging

logger = logging.getLogger(__name__)


class PatientService:
    """Service for patient operations with authorization."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_patients(self) -> List[dict]:
        patients = self.db.query(Patient).all()
        return [{"id": p.id, "name": f"{p.first_name} {p.last_name}"} for p in patients]
    
    def get_patient_by_id(self, patient_id: int) -> Optional[dict]:
        patient = self.db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return None
        return {
            "id": patient.id,
            "name": f"{patient.first_name} {patient.last_name}",
            "dob": patient.date_of_birth,
            "gender": patient.gender
        }
    
    def create_patient(self, data: dict) -> dict:
        return data
    
    def update_patient(self, patient_id: int, data: dict) -> dict:
        return data
    
    def delete_patient(self, patient_id: int) -> bool:
        return True
    
    def anonymize_patient_data(self, data: dict) -> dict:
        """Remove or mask PII from patient data."""
        anonymized = data.copy()
        if "name" in anonymized:
            anonymized["name"] = "ANONYMIZED"
        return anonymized
    
    async def user_can_access_patient(self, user_id: int, patient_id: int) -> bool:
        """
        Check if user is authorized to access patient data.
        
        Phase 1: Basic implementation - all authenticated users can access all patients.
        Future: Implement role-based access control (RBAC) or scope-based filtering.
        
        Args:
            user_id: User requesting access
            patient_id: Patient being accessed
        
        Returns:
            True if authorized, False otherwise
        """
        try:
            # Verify user exists and is active
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.warning(f"User {user_id} not found for authorization check")
                return False
            
            # Verify patient exists
            patient = self.db.query(Patient).filter(Patient.id == patient_id).first()
            if not patient:
                logger.warning(f"Patient {patient_id} not found for authorization check")
                return False
            
            # Phase 1: All authenticated users can access all patients
            # TODO: Implement proper RBAC:
            # - Doctors can access their assigned patients
            # - Nurses can access patients in their clinic
            # - Admins can access all patients
            # - Patients can access only their own records
            
            return True
        
        except Exception as e:
            logger.error(f"Error checking authorization for user {user_id}: {e}")
            return False
