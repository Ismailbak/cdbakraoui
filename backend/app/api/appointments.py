from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.appointment import Appointment as AppointmentModel
from app.models.patient import Patient as PatientModel
from app.api.auth import get_current_user_orm
from app.models.user import User
from app.services.audit_service import log_action

router = APIRouter()


class AppointmentBase(BaseModel):
    patient_id: int
    date: str
    time: str
    reason: Optional[str] = None
    status: str = "scheduled"


class Appointment(AppointmentBase):
    id: int
    patient_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


def _appointment_with_patient_name(db: Session, row: AppointmentModel) -> dict:
    patient = db.query(PatientModel).filter(PatientModel.id == row.patient_id).first()
    return {
        "id": row.id,
        "patient_id": row.patient_id,
        "patient_name": patient.name if patient else None,
        "date": row.date,
        "time": row.time,
        "reason": row.reason,
        "status": row.status,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


@router.get("/", response_model=List[Appointment])
def get_appointments(db: Session = Depends(get_db)):
    rows = db.query(AppointmentModel).order_by(AppointmentModel.date.desc(), AppointmentModel.time.desc()).all()
    return [_appointment_with_patient_name(db, r) for r in rows]


@router.get("/today", response_model=List[Appointment])
def get_today_appointments(db: Session = Depends(get_db)):
    today = datetime.now().strftime("%Y-%m-%d")
    rows = db.query(AppointmentModel).filter(AppointmentModel.date == today).order_by(AppointmentModel.time).all()
    return [_appointment_with_patient_name(db, r) for r in rows]


@router.get("/patient/{patient_id}", response_model=List[Appointment])
def get_patient_appointments(patient_id: int, db: Session = Depends(get_db)):
    rows = db.query(AppointmentModel).filter(AppointmentModel.patient_id == patient_id).order_by(AppointmentModel.date.desc()).all()
    return [_appointment_with_patient_name(db, r) for r in rows]


@router.get("/{appointment_id}", response_model=Appointment)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    row = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return _appointment_with_patient_name(db, row)


@router.post("/", response_model=Appointment)
def create_appointment(
    appointment: AppointmentBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    db_app = AppointmentModel(**appointment.model_dump())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    log_action(
        db,
        action="CREATE_APPOINTMENT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="appointment",
        resource_id=str(db_app.id),
        details=f"Created appointment for patient {appointment.patient_id}",
    )
    return _appointment_with_patient_name(db, db_app)


@router.put("/{appointment_id}", response_model=Appointment)
def update_appointment(
    appointment_id: int,
    appointment: AppointmentBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    row = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for k, v in appointment.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    log_action(
        db,
        action="UPDATE_APPOINTMENT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="appointment",
        resource_id=str(appointment_id),
        details=f"Updated appointment for patient {appointment.patient_id}",
    )
    return _appointment_with_patient_name(db, row)


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    row = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    patient_id = row.patient_id
    db.delete(row)
    db.commit()
    log_action(
        db,
        action="DELETE_APPOINTMENT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="appointment",
        resource_id=str(appointment_id),
        details=f"Deleted appointment for patient {patient_id}",
    )
    return {"message": "Deleted"}
