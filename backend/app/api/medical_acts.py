from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class MedicalAct(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    act_type: str  # consultation, exam, procedure, etc.
    description: Optional[str] = None
    date: str
    notes: Optional[str] = None
    status: str = "completed"  # pending, completed, cancelled

@router.get("/", response_model=List[MedicalAct])
def get_medical_acts():
    return []

@router.get("/{act_id}", response_model=MedicalAct)
def get_medical_act(act_id: int):
    return {"id": act_id, "patient_id": 0, "act_type": "", "date": "", "status": "completed"}

@router.post("/", response_model=MedicalAct)
def create_medical_act(act: MedicalAct):
    return act

@router.put("/{act_id}", response_model=MedicalAct)
def update_medical_act(act_id: int, act: MedicalAct):
    return act

@router.delete("/{act_id}")
def delete_medical_act(act_id: int):
    return {"message": "Deleted"}

@router.get("/patient/{patient_id}", response_model=List[MedicalAct])
def get_patient_medical_acts(patient_id: int):
    return []

@router.get("/types", response_model=List[str])
def get_act_types():
    return ["consultation", "examination", "procedure", "follow-up", "emergency"]
