from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class Appointment(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    date: str
    time: str
    reason: Optional[str] = None
    status: str = "scheduled"  # scheduled, completed, cancelled

@router.get("/", response_model=List[Appointment])
def get_appointments():
    return []

@router.get("/{appointment_id}", response_model=Appointment)
def get_appointment(appointment_id: int):
    return {"id": appointment_id, "patient_id": 0, "date": "", "time": "", "status": "scheduled"}

@router.post("/", response_model=Appointment)
def create_appointment(appointment: Appointment):
    return appointment

@router.put("/{appointment_id}", response_model=Appointment)
def update_appointment(appointment_id: int, appointment: Appointment):
    return appointment

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: int):
    return {"message": "Deleted"}

@router.get("/patient/{patient_id}", response_model=List[Appointment])
def get_patient_appointments(patient_id: int):
    return []

@router.get("/today", response_model=List[Appointment])
def get_today_appointments():
    return []
