
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.patient import Patient as PatientModel
from app.models.appointment import Appointment as AppointmentModel
from app.models.medical_act import MedicalAct as MedicalActModel
from datetime import datetime

router = APIRouter()

@router.get("/recent-activity")
def get_recent_activity(db: Session = Depends(get_db)):
    # Get latest 5 patients
    recent_patients = db.query(PatientModel).order_by(PatientModel.created_at.desc()).limit(5).all()
    # Get latest 5 appointments
    recent_appointments = db.query(AppointmentModel).order_by(AppointmentModel.date.desc()).limit(5).all()
    # Get latest 5 medical acts
    recent_acts = db.query(MedicalActModel).order_by(MedicalActModel.date.desc()).limit(5).all()

    activities = []
    for p in recent_patients:
        activities.append({
            "type": "patient",
            "title": "Nouveau patient ajouté",
            "subtitle": getattr(p, "name", None) or f"ID {p.id}",
            "time": _to_iso(getattr(p, "created_at", None))
        })
    for a in recent_appointments:
        activities.append({
            "type": "appointment",
            "title": "Rendez-vous confirmé",
            "subtitle": f"Patient ID {a.patient_id} - {a.date}",
            "time": _to_iso(getattr(a, "date", None))
        })
    for m in recent_acts:
        activities.append({
            "type": "medical_act",
            "title": "Acte médical créé",
            "subtitle": f"{m.act_type} (Patient ID {m.patient_id})",
            "time": _to_iso(getattr(m, "date", None))
        })

    # Sort all activities by time descending (most recent first)
    activities = [a for a in activities if a["time"]]
    activities.sort(key=lambda x: x["time"], reverse=True)
    return {"activities": activities[:10]}  # Return the 10 most recent activities

def _to_iso(dt):
    if hasattr(dt, 'isoformat'):
        return dt.isoformat()
    return str(dt) if dt else None

def get_patient_names(db, patient_ids):
    patients = db.query(PatientModel.id, PatientModel.name).filter(PatientModel.id.in_(patient_ids)).all()
    return {p.id: p.name for p in patients}



class AnalyticsSummary(BaseModel):
    total_patients: int
    avg_age: float
    common_diagnoses: List[str]


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(db: Session = Depends(get_db)):
    total = db.query(func.count(PatientModel.id)).scalar() or 0
    avg_result = db.query(func.avg(PatientModel.age)).scalar()
    avg_age = float(avg_result) if avg_result is not None else 0.0
    # Top diagnoses (non-empty, grouped)
    diag_rows = (
        db.query(PatientModel.diagnosis, func.count(PatientModel.id))
        .filter(PatientModel.diagnosis.isnot(None), PatientModel.diagnosis != "")
        .group_by(PatientModel.diagnosis)
        .order_by(func.count(PatientModel.id).desc())
        .limit(10)
        .all()
    )
    common_diagnoses = [d[0] for d in diag_rows if d[0]]
    return {"total_patients": total, "avg_age": round(avg_age, 1), "common_diagnoses": common_diagnoses}


@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    return {"trends": []}


@router.get("/cohorts")
def get_cohorts(db: Session = Depends(get_db)):
    return {"cohorts": []}
