from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.medical_act import MedicalAct as MedicalActModel, ActDocument as ActDocumentModel
from app.models.patient import Patient as PatientModel

router = APIRouter()


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
    date: str
    notes: Optional[str] = None
    status: str = "completed"
    doctor_id: Optional[int] = None
    assigned_staff_ids: Optional[str] = None


class MedicalAct(MedicalActBase):
    id: int
    patient_name: Optional[str] = None

    class Config:
        from_attributes = True


class MedicalActCreate(MedicalActBase):
    pass


def _act_with_patient_name(db: Session, row: MedicalActModel) -> dict:
    patient = db.query(PatientModel).filter(PatientModel.id == row.patient_id).first()
    return {
        "id": row.id,
        "patient_id": row.patient_id,
        "patient_name": patient.name if patient else None,
        "act_type": row.act_type,
        "description": row.description,
        "report": row.report,
        "date": row.date,
        "notes": row.notes,
        "status": row.status,
        "doctor_id": row.doctor_id,
        "assigned_staff_ids": row.assigned_staff_ids,
    }


@router.get("/", response_model=List[MedicalAct])
def get_medical_acts(
    db: Session = Depends(get_db),
    patient_id: Optional[int] = Query(None),
    act_type: Optional[str] = Query(None),
):
    query = db.query(MedicalActModel)
    if patient_id is not None:
        query = query.filter(MedicalActModel.patient_id == patient_id)
    if act_type:
        query = query.filter(MedicalActModel.act_type == act_type)
    rows = query.order_by(MedicalActModel.date.desc()).all()
    return [_act_with_patient_name(db, r) for r in rows]


@router.get("/patient/{patient_id}", response_model=List[MedicalAct])
def get_patient_medical_acts(patient_id: int, db: Session = Depends(get_db)):
    rows = db.query(MedicalActModel).filter(MedicalActModel.patient_id == patient_id).order_by(MedicalActModel.date.desc()).all()
    return [_act_with_patient_name(db, r) for r in rows]


@router.get("/{act_id}", response_model=MedicalAct)
def get_medical_act(act_id: int, db: Session = Depends(get_db)):
    row = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medical act not found")
    return _act_with_patient_name(db, row)


@router.post("/", response_model=MedicalAct)
def create_medical_act(act: MedicalActCreate, db: Session = Depends(get_db)):
    db_act = MedicalActModel(**act.model_dump())
    db.add(db_act)
    db.commit()
    db.refresh(db_act)
    return _act_with_patient_name(db, db_act)


@router.put("/{act_id}", response_model=MedicalAct)
def update_medical_act(act_id: int, act: MedicalActBase, db: Session = Depends(get_db)):
    row = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medical act not found")
    for k, v in act.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return _act_with_patient_name(db, row)


@router.delete("/{act_id}")
def delete_medical_act(act_id: int, db: Session = Depends(get_db)):
    row = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Medical act not found")
    db.delete(row)
    db.commit()
    return {"message": "Deleted"}


@router.get("/{act_id}/documents", response_model=List[ActDocumentOut])
def get_act_documents(act_id: int, db: Session = Depends(get_db)):
    docs = db.query(ActDocumentModel).filter(ActDocumentModel.act_id == act_id).all()
    return docs


class ActDocumentCreate(BaseModel):
    filename: str
    file_path: str
    mime_type: Optional[str] = None


@router.post("/{act_id}/documents", response_model=ActDocumentOut)
def add_act_document(act_id: int, doc: ActDocumentCreate, db: Session = Depends(get_db)):
    act = db.query(MedicalActModel).filter(MedicalActModel.id == act_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Medical act not found")
    db_doc = ActDocumentModel(act_id=act_id, filename=doc.filename, file_path=doc.file_path, mime_type=doc.mime_type)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc


@router.get("/types", response_model=List[str])
def get_act_types():
    return ["consultation", "examination", "procedure", "follow-up", "emergency"]
