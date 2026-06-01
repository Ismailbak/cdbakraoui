from fastapi import APIRouter, Depends, Query, HTTPException, Response
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.models.patient import Patient as PatientModel
from app.models.patient_allergy import PatientAllergy as PatientAllergyModel
from app.auth.router import get_current_user_orm, RoleChecker
from app.models.user import User
from app.models.medical_act import MedicalAct
from app.models.appointment import Appointment
from app.models.act_result import ActResult
from app.analytics.audit import log_action
from app.pdf import service as pdf_service

router = APIRouter()


def calculate_age(date_of_birth: Optional[date]) -> Optional[int]:
    """Calculate age from date of birth."""
    if not date_of_birth:
        return None
    today = datetime.now().date()
    age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    return age if age > 0 else None


class PatientBase(BaseModel):
    first_name: str
    last_name: str
    civility: Optional[str] = None  # M., Mme, Mlle, etc.
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None  # Age calculated dynamically, never stored
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    marital_status: Optional[str] = None  # Célibataire, Marié, Divorcé, Veuf
    nationality: Optional[str] = None
    profession: Optional[str] = None
    insurance: Optional[str] = None
    insurance_number: Optional[str] = None
    blood_type: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    primary_diagnosis: Optional[str] = None  # Renamed from diagnosis
    notes: Optional[str] = None
    notes_admin: Optional[str] = None
    status: Optional[str] = "Actif"


class PatientCreate(PatientBase):
    ipp: Optional[str] = None


class Patient(PatientBase):
    id: int
    ipp: Optional[str] = None
    created_at: Optional[datetime] = None
    age: Optional[int] = None  # Computed field - never stored

    class Config:
        from_attributes = True


class PatientAllergyBase(BaseModel):
    allergen: str
    reaction_type: Optional[str] = None
    severity: Optional[str] = None  # e.g., "mild", "moderate", "severe"
    notes: Optional[str] = None


class PatientAllergyCreate(PatientAllergyBase):
    patient_id: int


class PatientAllergyOut(PatientAllergyBase):
    id: int
    patient_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


def _patient_to_dict(patient: PatientModel) -> dict:
    """Convert PatientModel to dict with computed age and full name."""
    patient_dict = {
        "id": patient.id,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "civility": patient.civility,
        "gender": patient.gender,
        "date_of_birth": patient.date_of_birth.isoformat() if isinstance(patient.date_of_birth, date) else patient.date_of_birth,
        "age": calculate_age(patient.date_of_birth),  # Computed, never stored
        "phone": patient.phone,
        "email": patient.email,
        "address": patient.address,
        "city": patient.city,
        "marital_status": patient.marital_status,
        "nationality": patient.nationality,
        "profession": patient.profession,
        "insurance": patient.insurance,
        "insurance_number": patient.insurance_number,
        "blood_type": patient.blood_type,
        "emergency_contact_name": patient.emergency_contact_name,
        "emergency_contact_relation": patient.emergency_contact_relation,
        "emergency_contact_phone": patient.emergency_contact_phone,
        "primary_diagnosis": patient.primary_diagnosis,
        "notes": patient.notes,
        "notes_admin": patient.notes_admin,
        "status": patient.status,
        "ipp": patient.ipp,
        "created_at": patient.created_at.isoformat() if patient.created_at else None,
    }
    return patient_dict


@router.get("/", response_model=List[Patient])
def get_patients(
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
    q: Optional[str] = Query(None, description="Search by first_name, last_name, IPP, or phone"),
    ipp: Optional[str] = Query(None),
    first_name: Optional[str] = Query(None),
    last_name: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: Optional[int] = Query(None, ge=1, le=1000, description="Max rows to return. Omit for all (legacy behavior)."),
    offset: int = Query(0, ge=0, description="Number of rows to skip (for pagination)."),
):
    query = db.query(PatientModel)
    if q:
        q_filter = f"%{q}%"
        query = query.filter(
            or_(
                PatientModel.first_name.ilike(q_filter),
                PatientModel.last_name.ilike(q_filter),
                PatientModel.ipp.ilike(q_filter),
                PatientModel.phone.ilike(q_filter),
                PatientModel.city.ilike(q_filter),
            )
        )
    if ipp:
        query = query.filter(PatientModel.ipp.ilike(f"%{ipp}%"))
    if first_name:
        query = query.filter(PatientModel.first_name.ilike(f"%{first_name}%"))
    if last_name:
        query = query.filter(PatientModel.last_name.ilike(f"%{last_name}%"))
    if phone:
        query = query.filter(PatientModel.phone.ilike(f"%{phone}%"))
    if status:
        query = query.filter(PatientModel.status == status)

    total = query.count()
    response.headers["X-Total-Count"] = str(total)

    query = query.order_by(PatientModel.id.desc())
    if offset:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)

    patients = query.all()
    return [_patient_to_dict(p) for p in patients]


@router.get("/{patient_id}", response_model=Patient)
def get_patient(
    patient_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return _patient_to_dict(patient)


@router.post("/", response_model=Patient)
def create_patient(
    patient: PatientCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    db_patient = PatientModel(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    log_action(
        db,
        action="CREATE_PATIENT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="patient",
        resource_id=str(db_patient.id),
        details=f"Created patient: {db_patient.first_name} {db_patient.last_name}",
    )
    return _patient_to_dict(db_patient)


@router.put("/{patient_id}", response_model=Patient)
def update_patient(
    patient_id: int, 
    patient: PatientBase, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    db_patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for k, v in patient.model_dump().items():
        setattr(db_patient, k, v)
    db.commit()
    db.refresh(db_patient)
    log_action(
        db,
        action="UPDATE_PATIENT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="patient",
        resource_id=str(patient_id),
        details=f"Updated patient: {db_patient.first_name} {db_patient.last_name}",
    )
    return _patient_to_dict(db_patient)


@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "department_head"])),
):
    db_patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    patient_name = f"{db_patient.first_name} {db_patient.last_name}"
    db.delete(db_patient)
    db.commit()
    
    log_action(
        db, 
        action="DELETE_PATIENT", 
        user_id=current_user.id, 
        username=current_user.username,
        resource_type="patient",
        resource_id=str(patient_id),
        details=f"Deleted patient: {patient_name}"
    )
    return {"message": "Deleted"}


@router.get("/{patient_id}/dossier")
def get_patient_dossier(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    # 1. Get Patient
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # 2. Get Medical Acts
    medical_acts = db.query(MedicalAct).filter(MedicalAct.patient_id == patient_id).order_by(MedicalAct.act_date.desc()).all()
    
    # 3. Get Appointments
    appointments = db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.datetime_scheduled.desc()).all()
    
    # 4. Get Lab Results
    lab_results = db.query(ActResult).filter(ActResult.patient_id == patient_id).order_by(ActResult.result_date.desc()).all()
    
    # 5. Get Allergies
    allergies = db.query(PatientAllergyModel).filter(PatientAllergyModel.patient_id == patient_id).all()
    
    # 6. Generate PDF
    pdf_buffer = pdf_service.generate_patient_dossier_pdf(patient, medical_acts, appointments, lab_results, allergies)
    
    filename = f"Dossier_{patient.first_name}_{patient.last_name}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ── Allergy Management Endpoints ──
@router.get("/{patient_id}/allergies", response_model=List[PatientAllergyOut])
def get_patient_allergies(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Get all allergies for a patient."""
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    allergies = db.query(PatientAllergyModel).filter(PatientAllergyModel.patient_id == patient_id).all()
    return allergies


@router.post("/{patient_id}/allergies", response_model=PatientAllergyOut)
def create_patient_allergy(
    patient_id: int,
    allergy: PatientAllergyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Create a new allergy for a patient."""
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    new_allergy = PatientAllergyModel(
        patient_id=patient_id,
        allergen=allergy.allergen,
        reaction_type=allergy.reaction_type,
        severity=allergy.severity,
        notes=allergy.notes,
        created_at=datetime.now(),
        created_by=current_user.id,
    )
    db.add(new_allergy)
    db.commit()
    db.refresh(new_allergy)
    
    log_action(db, current_user.id, f"Create allergy: {allergy.allergen} for patient {patient_id}", "CREATE")
    
    return new_allergy


@router.put("/{patient_id}/allergies/{allergy_id}", response_model=PatientAllergyOut)
def update_patient_allergy(
    patient_id: int,
    allergy_id: int,
    allergy: PatientAllergyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Update an allergy for a patient."""
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db_allergy = db.query(PatientAllergyModel).filter(
        PatientAllergyModel.id == allergy_id,
        PatientAllergyModel.patient_id == patient_id
    ).first()
    if not db_allergy:
        raise HTTPException(status_code=404, detail="Allergy not found")
    
    db_allergy.allergen = allergy.allergen
    db_allergy.reaction_type = allergy.reaction_type
    db_allergy.severity = allergy.severity
    db_allergy.notes = allergy.notes
    db_allergy.updated_at = datetime.now()
    db_allergy.updated_by = current_user.id
    
    db.commit()
    db.refresh(db_allergy)
    
    log_action(db, current_user.id, f"Update allergy: {allergy.allergen} for patient {patient_id}", "UPDATE")
    
    return db_allergy


@router.delete("/{patient_id}/allergies/{allergy_id}")
def delete_patient_allergy(
    patient_id: int,
    allergy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Delete an allergy for a patient."""
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db_allergy = db.query(PatientAllergyModel).filter(
        PatientAllergyModel.id == allergy_id,
        PatientAllergyModel.patient_id == patient_id
    ).first()
    if not db_allergy:
        raise HTTPException(status_code=404, detail="Allergy not found")
    
    allergen_name = db_allergy.allergen
    db.delete(db_allergy)
    db.commit()
    
    log_action(db, current_user.id, f"Delete allergy: {allergen_name} for patient {patient_id}", "DELETE")
    
    return {"message": "Allergy deleted successfully"}
