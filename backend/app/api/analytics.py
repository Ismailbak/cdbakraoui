from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.patient import Patient as PatientModel

router = APIRouter()


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
