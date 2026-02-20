from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from pydantic import BaseModel

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
    q: Optional[str] = Query(None, description="Search by name, IPP, phone, or diagnosis"),
    ipp: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    """Multi-field search: pass q for global search, or ipp/name/phone/diagnosis/status for filters."""
    return []


@router.get("/{patient_id}", response_model=Patient)
def get_patient(patient_id: int):
    return {"id": patient_id, "name": "Patient", "age": 0}


@router.post("/", response_model=Patient)
def create_patient(patient: PatientCreate):
    return patient


@router.put("/{patient_id}", response_model=Patient)
def update_patient(patient_id: int, patient: PatientBase):
    return patient


@router.delete("/{patient_id}")
def delete_patient(patient_id: int):
    return {"message": "Deleted"}
