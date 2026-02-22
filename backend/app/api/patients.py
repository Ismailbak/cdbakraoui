from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.patient import Patient as PatientModel

router = APIRouter()


class PatientBase(BaseModel):
    name: str
    age: int
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    insurance: Optional[str] = None
    insurance_number: Optional[str] = None
    blood_type: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    notes_admin: Optional[str] = None
    status: Optional[str] = "Actif"


class PatientCreate(PatientBase):
    ipp: Optional[str] = None


class Patient(PatientBase):
    id: int
    ipp: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[Patient])
def get_patients(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="Search by name, IPP, phone, or diagnosis"),
    ipp: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    query = db.query(PatientModel)
    if q:
        q_filter = f"%{q}%"
        query = query.filter(
            or_(
                PatientModel.name.ilike(q_filter),
                PatientModel.ipp.ilike(q_filter),
                PatientModel.phone.ilike(q_filter),
                PatientModel.diagnosis.ilike(q_filter),
                PatientModel.city.ilike(q_filter),
            )
        )
    if ipp:
        query = query.filter(PatientModel.ipp.ilike(f"%{ipp}%"))
    if name:
        query = query.filter(PatientModel.name.ilike(f"%{name}%"))
    if phone:
        query = query.filter(PatientModel.phone.ilike(f"%{phone}%"))
    if diagnosis:
        query = query.filter(PatientModel.diagnosis.ilike(f"%{diagnosis}%"))
    if status:
        query = query.filter(PatientModel.status == status)
    return query.order_by(PatientModel.id.desc()).all()


@router.get("/{patient_id}", response_model=Patient)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/", response_model=Patient)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    db_patient = PatientModel(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.put("/{patient_id}", response_model=Patient)
def update_patient(patient_id: int, patient: PatientBase, db: Session = Depends(get_db)):
    db_patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for k, v in patient.model_dump().items():
        setattr(db_patient, k, v)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    db_patient = db.query(PatientModel).filter(PatientModel.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(db_patient)
    db.commit()
    return {"message": "Deleted"}
