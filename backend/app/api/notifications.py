from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Notification(BaseModel):
    id: int
    title: str
    message: str
    read: bool = False

@router.get("/", response_model=List[Notification])
def get_notifications():
    return []

@router.post("/read/{notification_id}")
def mark_as_read(notification_id: int):
    return {"message": "Marked as read"}
