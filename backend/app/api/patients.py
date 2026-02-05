from fastapi import APIRouter, Depends
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class Patient(BaseModel):
    id: int
    name: str
    age: int
    diagnosis: Optional[str] = None

@router.get("/", response_model=List[Patient])
def get_patients():
    return []

@router.get("/{patient_id}", response_model=Patient)
def get_patient(patient_id: int):
    return {"id": patient_id, "name": "Patient", "age": 0}

@router.post("/", response_model=Patient)
def create_patient(patient: Patient):
    return patient

@router.put("/{patient_id}", response_model=Patient)
def update_patient(patient_id: int, patient: Patient):
    return patient

@router.delete("/{patient_id}")
def delete_patient(patient_id: int):
    return {"message": "Deleted"}
