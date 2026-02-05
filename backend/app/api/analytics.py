from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class AnalyticsSummary(BaseModel):
    total_patients: int
    avg_age: float
    common_diagnoses: List[str]

@router.get("/summary", response_model=AnalyticsSummary)
def get_summary():
    return {"total_patients": 0, "avg_age": 0.0, "common_diagnoses": []}

@router.get("/trends")
def get_trends():
    return {"trends": []}

@router.get("/cohorts")
def get_cohorts():
    return {"cohorts": []}
