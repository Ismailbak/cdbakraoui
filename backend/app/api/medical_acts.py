from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

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
    assigned_staff_ids: Optional[str] = None  # JSON array e.g. "[1,2,3]"


class MedicalAct(MedicalActBase):
    id: int
    patient_name: Optional[str] = None

    class Config:
        from_attributes = True


class MedicalActCreate(MedicalActBase):
    pass


@router.get("/", response_model=List[MedicalAct])
def get_medical_acts():
    return []


@router.get("/patient/{patient_id}", response_model=List[MedicalAct])
def get_patient_medical_acts(patient_id: int):
    return []


@router.get("/{act_id}", response_model=MedicalAct)
def get_medical_act(act_id: int):
    return {"id": act_id, "patient_id": 0, "act_type": "", "date": "", "status": "completed"}


@router.post("/", response_model=MedicalAct)
def create_medical_act(act: MedicalActCreate):
    return act


@router.put("/{act_id}", response_model=MedicalAct)
def update_medical_act(act_id: int, act: MedicalActBase):
    return act


@router.delete("/{act_id}")
def delete_medical_act(act_id: int):
    return {"message": "Deleted"}


@router.get("/{act_id}/documents", response_model=List[ActDocumentOut])
def get_act_documents(act_id: int):
    return []


class ActDocumentCreate(BaseModel):
    filename: str
    file_path: str
    mime_type: Optional[str] = None


@router.post("/{act_id}/documents", response_model=ActDocumentOut)
def add_act_document(act_id: int, doc: ActDocumentCreate):
    return {"id": 0, "act_id": act_id, "filename": doc.filename, "file_path": doc.file_path, "mime_type": doc.mime_type}


@router.get("/types", response_model=List[str])
def get_act_types():
    return ["consultation", "examination", "procedure", "follow-up", "emergency"]
