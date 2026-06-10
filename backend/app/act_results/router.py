# ─── routers/act_results.py ─────────────────────────────────────────────────
# FastAPI router for lab results endpoints.
# Handles CRUD for act_results (laboratory test results).

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.act_result import ActResult as ActResultModel
from app.models.medical_act import MedicalAct
from app.models.patient import Patient
from app.auth.router import get_current_user_orm
from app.models.user import User
from app.analytics.audit import log_action

router = APIRouter()


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class ActResultBase(BaseModel):
    result_date: Optional[date] = None
    result_name: str
    result_value: str
    result_unit: Optional[str] = None
    is_abnormal: bool = False
    result_category: Optional[str] = None
    notes: Optional[str] = None


class ActResultCreate(ActResultBase):
    act_id: int
    patient_id: int


class ActResultUpdate(BaseModel):
    result_date: Optional[date] = None
    result_name: Optional[str] = None
    result_value: Optional[str] = None
    result_unit: Optional[str] = None
    is_abnormal: Optional[bool] = None
    result_category: Optional[str] = None
    notes: Optional[str] = None


class ActResultOut(ActResultBase):
    id: int
    act_id: int
    patient_id: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── CRUD Endpoints ───────────────────────────────────────────────────────────

@router.post("/", response_model=ActResultOut, status_code=201)
def create_act_result(
    result: ActResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Create a new lab result for a medical act."""
    # Verify act and patient exist
    act = db.query(MedicalAct).filter(MedicalAct.id == result.act_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Medical act not found")
    
    patient = db.query(Patient).filter(Patient.id == result.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Create result
    db_result = ActResultModel(
        act_id=result.act_id,
        patient_id=result.patient_id,
        result_date=result.result_date,
        result_name=result.result_name,
        result_value=result.result_value,
        result_unit=result.result_unit,
        is_abnormal=result.is_abnormal,
        result_category=result.result_category,
        notes=result.notes,
        created_by=current_user.id,
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    
    log_action(
        db,
        action="CREATE_ACT_RESULT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="act_result",
        resource_id=str(db_result.id),
        details=f"Created lab result: {result.result_name}",
    )
    
    return db_result


@router.get("/act/{act_id}", response_model=List[ActResultOut])
def get_act_results(
    act_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Get all lab results for a specific medical act."""
    act = db.query(MedicalAct).filter(MedicalAct.id == act_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Medical act not found")
    
    results = db.query(ActResultModel).filter(ActResultModel.act_id == act_id).all()
    return results


@router.get("/patient/{patient_id}", response_model=List[ActResultOut])
def get_patient_results(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Get all lab results for a specific patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    results = db.query(ActResultModel).filter(ActResultModel.patient_id == patient_id).order_by(ActResultModel.result_date.desc()).all()
    return results


@router.get("/{result_id}", response_model=ActResultOut)
def get_act_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Get a specific lab result."""
    result = db.query(ActResultModel).filter(ActResultModel.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    return result


@router.put("/{result_id}", response_model=ActResultOut)
def update_act_result(
    result_id: int,
    result_update: ActResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Update a lab result."""
    result = db.query(ActResultModel).filter(ActResultModel.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    # Update fields
    for key, value in result_update.model_dump(exclude_unset=True).items():
        setattr(result, key, value)
    
    db.commit()
    db.refresh(result)
    
    log_action(
        db,
        action="UPDATE_ACT_RESULT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="act_result",
        resource_id=str(result_id),
        details=f"Updated lab result: {result.result_name}",
    )
    
    return result


@router.delete("/{result_id}", status_code=204)
def delete_act_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Delete a lab result."""
    result = db.query(ActResultModel).filter(ActResultModel.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    db.delete(result)
    db.commit()
    
    log_action(
        db,
        action="DELETE_ACT_RESULT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="act_result",
        resource_id=str(result_id),
        details=f"Deleted lab result: {result.result_name}",
    )
    
    return None
