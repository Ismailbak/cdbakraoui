# ─── routers/medical_acts.py ─────────────────────────────────────────────────
# FastAPI router for all /medical-acts endpoints.
# Handles CRUD for medical acts, per-patient queries, documents, and stats.

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import shutil
import uuid
from sqlalchemy.orm import Session, joinedload  # joinedload used to avoid N+1 queries

from app.database import get_db
from app.models.medical_act import MedicalAct as MedicalActModel, ActDocument as ActDocumentModel
from app.models.patient import Patient as PatientModel
from app.api.auth import get_current_user_orm
from app.models.user import User
from app.services.audit_service import log_action

# Ensure upload directory exists
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

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
    documents: List[ActDocumentOut] = []

    class Config:
        from_attributes = True


# ─── Internal Helper ──────────────────────────────────────────────────────────

def _act_to_dict(act: MedicalActModel, patient_name: Optional[str], documents: List[ActDocumentModel] = None) -> dict:
    """
    Converts a MedicalActModel ORM row to a plain dict, injecting patient_name.
    Used by every endpoint that returns a MedicalActOut.
    """
    doc_dicts = []
    if documents:
        doc_dicts = [{"id": d.id, "act_id": d.act_id, "filename": d.filename, "file_path": d.file_path, "mime_type": d.mime_type} for d in documents]
        
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
        "documents": doc_dicts,
    }


def _enrich_acts(db: Session, rows: List[MedicalActModel]) -> List[dict]:
    """
    Enriches a list of acts with patient names and documents in a single query (avoids N+1).
    Instead of querying the DB once per act, we collect all unique patient IDs,
    fetch them in one query, then do a dictionary lookup per act.
    We do the same for documents.
    """
    if not rows:
        return []

    # Collect unique patient IDs from this batch of acts
    patient_ids = {row.patient_id for row in rows}
    act_ids = {row.id for row in rows}

    # One DB query for all relevant patients
    patients = (
        db.query(PatientModel)
        .filter(PatientModel.id.in_(patient_ids))
        .all()
    )
    patient_map = {p.id: p.name for p in patients}
    
    # One DB query for all relevant documents
    documents = (
        db.query(ActDocumentModel).filter(ActDocumentModel.act_id.in_(act_ids)).all()
    )
    doc_map = {}
    for doc in documents:
        doc_map.setdefault(doc.act_id, []).append(doc)

    return [_act_to_dict(row, patient_map.get(row.patient_id), doc_map.get(row.id, [])) for row in rows]


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_medical_acts_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
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
def get_act_types(current_user: User = Depends(get_current_user_orm)):
    """Returns the list of valid act type values."""
    # FIX: These values now match the French labels used in the frontend.
    # Previously the backend returned English strings that didn't match the frontend constants.
    return ["Consultation", "Examen", "Infiltration", "Bilan", "Suivi"]


# ─── List & Create ────────────────────────────────────────────────────────────

@router.get("/", response_model=List[MedicalActOut])
def get_medical_acts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
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
def create_medical_act(
    act: MedicalActCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Creates a new medical act and returns the saved record with patient_name."""
    # Removed debug print — use proper logging in production
    db_act = MedicalActModel(**act.model_dump())
    db.add(db_act)
    db.commit()
    db.refresh(db_act)
    log_action(
        db,
        action="CREATE_MEDICAL_ACT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="medical_act",
        resource_id=str(db_act.id),
        details=f"Created medical act: {db_act.act_type}",
    )

    # Look up patient name and docs for the response
    patient = db.query(PatientModel).filter(PatientModel.id == db_act.patient_id).first()
    documents = db.query(ActDocumentModel).filter(ActDocumentModel.act_id == db_act.id).all()
    return _act_to_dict(db_act, patient.name if patient else None, documents)


# ─── Per-Patient ──────────────────────────────────────────────────────────────

@router.get("/patient/{patient_id}", response_model=List[MedicalActOut])
def get_patient_medical_acts(
    patient_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
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
def get_medical_act(
    act_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Returns a single act by ID. Raises 404 if not found."""
    row = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medical act not found")
    patient = db.query(PatientModel).filter(PatientModel.id == row.patient_id).first()
    return _act_to_dict(row, patient.name if patient else None)


@router.put("/{act_id}", response_model=MedicalActOut)
def update_medical_act(
    act_id: int, 
    act: MedicalActBase, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Updates all fields of an existing act. Raises 404 if not found."""
    row = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medical act not found")
    for k, v in act.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    log_action(
        db,
        action="UPDATE_MEDICAL_ACT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="medical_act",
        resource_id=str(act_id),
        details=f"Updated medical act: {row.act_type}",
    )
    patient = db.query(PatientModel).filter(PatientModel.id == row.patient_id).first()
    return _act_to_dict(row, patient.name if patient else None)


@router.delete("/{act_id}", status_code=204)  # FIX: 204 No Content is the correct status for DELETE
def delete_medical_act(
    act_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Deletes an act by ID. Raises 404 if not found."""
    row = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medical act not found")
    act_type = row.act_type
    db.delete(row)
    db.commit()
    log_action(
        db,
        action="DELETE_MEDICAL_ACT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="medical_act",
        resource_id=str(act_id),
        details=f"Deleted medical act: {act_type}",
    )
    # FIX: No response body for 204; returning {"message": "Deleted"} with 204 is invalid HTTP


# ─── Documents ────────────────────────────────────────────────────────────────

class ActDocumentCreate(BaseModel):
    filename: str
    file_path: str
    mime_type: Optional[str] = None


@router.get("/{act_id}/documents", response_model=List[ActDocumentOut])
def get_act_documents(
    act_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Returns all documents attached to a specific act."""
    # FIX: raise 404 if the act itself doesn't exist
    act = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Medical act not found")
    return db.query(ActDocumentModel).filter(ActDocumentModel.act_id == act_id).all()


@router.post("/{act_id}/documents", response_model=ActDocumentOut, status_code=201)
def add_act_document(
    act_id: int, 
    doc: ActDocumentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Attaches a document record to an existing act (Metadata only)."""
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


@router.post("/{act_id}/upload", response_model=ActDocumentOut, status_code=201)
def upload_act_document(
    act_id: int, 
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Uploads a file and attaches it to an existing medical act."""
    act = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Medical act not found")
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_doc = ActDocumentModel(
        act_id=act_id,
        filename=file.filename,
        file_path=file_path,
        mime_type=file.content_type,
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    log_action(
        db,
        action="UPLOAD_MEDICAL_ACT_DOCUMENT",
        user_id=current_user.id,
        username=current_user.username,
        resource_type="act_document",
        resource_id=str(db_doc.id),
        details=f"Uploaded document {file.filename} for act {act_id}",
    )
    return db_doc


@router.get("/{act_id}/documents/{doc_id}/download")
def download_act_document(
    act_id: int,
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Downloads an attached document for a specific medical act."""
    doc = db.query(ActDocumentModel).filter(ActDocumentModel.id == doc_id, ActDocumentModel.act_id == act_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(
        path=doc.file_path, 
        filename=doc.filename, 
        media_type=doc.mime_type or "application/octet-stream"
    )


@router.get("/{act_id}/pdf")
def get_act_pdf(
    act_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Generates and returns a professional PDF for the medical act."""
    row = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medical act not found")
        
    patient = db.query(PatientModel).filter(PatientModel.id == row.patient_id).first()
    
    # Prepare data for the PDF service
    act_data = {
        "id": row.id,
        "patient_id": row.patient_id,
        "patient_name": patient.name if patient else "Inconnu",
        "act_type": row.act_type,
        "date": row.date,
        "diagnosis": row.diagnosis,
        "report": row.report,
        "treatment": row.treatment,
        "notes": row.notes,
        "amount": row.amount
    }
    
    from app.services.pdf_service import generate_medical_act_pdf
    pdf_buffer = generate_medical_act_pdf(act_data)
    
    filename = f"acte_{act_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )