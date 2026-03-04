# ─── routers/medical_acts.py ─────────────────────────────────────────────────
# FastAPI router for all /medical-acts endpoints.
# Handles CRUD for medical acts, per-patient queries, documents, and stats.

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload  # joinedload used to avoid N+1 queries

from app.database import get_db
from app.models.medical_act import MedicalAct as MedicalActModel, ActDocument as ActDocumentModel
from app.models.patient import Patient as PatientModel

router = APIRouter()


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class ActDocumentOut(BaseModel):
    id: int
    act_id: int
    filename: str
    file_path: str
    mime_type: Optional[str] = None

    class Config:
        from_attributes = True


class MedicalActBase(BaseModel):
    patient_id: int
    act_type: str
    description: Optional[str] = None
    report: Optional[str] = None
    date: str  # TODO: change to `datetime.date` for proper validation
    notes: Optional[str] = None
    status: str = "completed"
    doctor_id: Optional[int] = None
    assigned_staff_ids: Optional[str] = None  # JSON-encoded list e.g. "[1,2,3]"
    amount: Optional[str] = None
    category: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None


class MedicalActCreate(MedicalActBase):
    """Schema used for POST /  (creation only)."""
    pass


class MedicalActOut(MedicalActBase):
    """Schema used for all responses — extends base with read-only fields."""
    id: int
    patient_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Internal Helper ──────────────────────────────────────────────────────────

def _act_to_dict(act: MedicalActModel, patient_name: Optional[str]) -> dict:
    """
    Converts a MedicalActModel ORM row to a plain dict, injecting patient_name.
    Used by every endpoint that returns a MedicalActOut.
    """
    return {
        "id": act.id,
        "patient_id": act.patient_id,
        "patient_name": patient_name,
        "act_type": act.act_type,
        "description": act.description,
        "report": act.report,
        "date": act.date,
        "notes": act.notes,
        "status": act.status,
        "doctor_id": act.doctor_id,
        "assigned_staff_ids": act.assigned_staff_ids,
        "amount": act.amount,
        "category": act.category,
        "diagnosis": act.diagnosis,
        "treatment": act.treatment,
        "created_at": act.created_at.isoformat() if act.created_at else None,
    }


def _enrich_acts(db: Session, rows: List[MedicalActModel]) -> List[dict]:
    """
    Enriches a list of acts with patient names in a single query (avoids N+1).
    Instead of querying the DB once per act, we collect all unique patient IDs,
    fetch them in one query, then do a dictionary lookup per act.
    """
    if not rows:
        return []

    # Collect unique patient IDs from this batch of acts
    patient_ids = {row.patient_id for row in rows}

    # One DB query for all relevant patients
    patients = (
        db.query(PatientModel)
        .filter(PatientModel.id.in_(patient_ids))
        .all()
    )
    patient_map = {p.id: p.name for p in patients}

    return [_act_to_dict(row, patient_map.get(row.patient_id)) for row in rows]


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_medical_acts_stats(db: Session = Depends(get_db)):
    """Returns aggregate counts used by the dashboard stat cards."""
    total = db.query(MedicalActModel).count()
    consultations = db.query(MedicalActModel).filter(MedicalActModel.act_type == "Consultation").count()
    interventions = db.query(MedicalActModel).filter(MedicalActModel.act_type == "Intervention").count()
    treated_patients = db.query(MedicalActModel.patient_id).distinct().count()
    return {
        "total": total,
        "consultations": consultations,
        "interventions": interventions,
        "treatedPatients": treated_patients,
    }


# ─── Act Types ────────────────────────────────────────────────────────────────

# FIX: This route MUST be defined before /{act_id} — otherwise FastAPI will try
# to match "types" as an integer act_id and return a 422 Unprocessable Entity.
@router.get("/types", response_model=List[str])
def get_act_types():
    """Returns the list of valid act type values."""
    # FIX: These values now match the French labels used in the frontend.
    # Previously the backend returned English strings that didn't match the frontend constants.
    return ["Consultation", "Examen", "Infiltration", "Bilan", "Suivi"]


# ─── List & Create ────────────────────────────────────────────────────────────

@router.get("/", response_model=List[MedicalActOut])
def get_medical_acts(
    db: Session = Depends(get_db),
    patient_id: Optional[int] = Query(None),
    act_type: Optional[str] = Query(None),
):
    """
    Returns all medical acts, optionally filtered by patient_id and/or act_type.
    Results are ordered by date descending (most recent first).
    """
    query = db.query(MedicalActModel)
    if patient_id is not None:
        query = query.filter(MedicalActModel.patient_id == patient_id)
    if act_type:
        query = query.filter(MedicalActModel.act_type == act_type)

    rows = query.order_by(MedicalActModel.date.desc()).all()
    # FIX: use batch enrichment instead of one DB query per act
    return _enrich_acts(db, rows)


@router.post("/", response_model=MedicalActOut, status_code=201)  # FIX: return 201 Created
def create_medical_act(act: MedicalActCreate, db: Session = Depends(get_db)):
    """Creates a new medical act and returns the saved record with patient_name."""
    # Removed debug print — use proper logging in production
    db_act = MedicalActModel(**act.model_dump())
    db.add(db_act)
    db.commit()
    db.refresh(db_act)

    # Look up patient name for the response
    patient = db.query(PatientModel).filter(PatientModel.id == db_act.patient_id).first()
    return _act_to_dict(db_act, patient.name if patient else None)


# ─── Per-Patient ──────────────────────────────────────────────────────────────

@router.get("/patient/{patient_id}", response_model=List[MedicalActOut])
def get_patient_medical_acts(patient_id: int, db: Session = Depends(get_db)):
    """Returns all acts for a specific patient, ordered by date descending."""
    rows = (
        db.query(MedicalActModel)
        .filter(MedicalActModel.patient_id == patient_id)
        .order_by(MedicalActModel.date.desc())
        .all()
    )
    return _enrich_acts(db, rows)


# ─── Single Act ───────────────────────────────────────────────────────────────

@router.get("/{act_id}", response_model=MedicalActOut)
def get_medical_act(act_id: int, db: Session = Depends(get_db)):
    """Returns a single act by ID. Raises 404 if not found."""
    row = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medical act not found")
    patient = db.query(PatientModel).filter(PatientModel.id == row.patient_id).first()
    return _act_to_dict(row, patient.name if patient else None)


@router.put("/{act_id}", response_model=MedicalActOut)
def update_medical_act(act_id: int, act: MedicalActBase, db: Session = Depends(get_db)):
    """Updates all fields of an existing act. Raises 404 if not found."""
    row = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medical act not found")
    for k, v in act.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    patient = db.query(PatientModel).filter(PatientModel.id == row.patient_id).first()
    return _act_to_dict(row, patient.name if patient else None)


@router.delete("/{act_id}", status_code=204)  # FIX: 204 No Content is the correct status for DELETE
def delete_medical_act(act_id: int, db: Session = Depends(get_db)):
    """Deletes an act by ID. Raises 404 if not found."""
    row = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medical act not found")
    db.delete(row)
    db.commit()
    # FIX: No response body for 204; returning {"message": "Deleted"} with 204 is invalid HTTP


# ─── Documents ────────────────────────────────────────────────────────────────

class ActDocumentCreate(BaseModel):
    filename: str
    file_path: str
    mime_type: Optional[str] = None


@router.get("/{act_id}/documents", response_model=List[ActDocumentOut])
def get_act_documents(act_id: int, db: Session = Depends(get_db)):
    """Returns all documents attached to a specific act."""
    # FIX: raise 404 if the act itself doesn't exist
    act = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Medical act not found")
    return db.query(ActDocumentModel).filter(ActDocumentModel.act_id == act_id).all()


@router.post("/{act_id}/documents", response_model=ActDocumentOut, status_code=201)
def add_act_document(act_id: int, doc: ActDocumentCreate, db: Session = Depends(get_db)):
    """Attaches a document record to an existing act."""
    act = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Medical act not found")
    db_doc = ActDocumentModel(
        act_id=act_id,
        filename=doc.filename,
        file_path=doc.file_path,
        mime_type=doc.mime_type,
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc