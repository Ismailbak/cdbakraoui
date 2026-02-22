from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from app.database import get_db
from app.api.auth import get_current_user_orm
from app.models.user import User
from app.models.notification import Notification as NotificationModel
from sqlalchemy.orm import Session

router = APIRouter()


class Notification(BaseModel):
    id: int
    title: str
    message: str
    read: bool = False

    class Config:
        from_attributes = True


@router.get("/", response_model=List[Notification])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    rows = db.query(NotificationModel).filter(NotificationModel.user_id == current_user.id).order_by(NotificationModel.id.desc()).all()
    return [{"id": r.id, "title": r.title, "message": r.message, "read": r.read} for r in rows]


@router.post("/read/{notification_id}")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    row = db.query(NotificationModel).filter(NotificationModel.id == notification_id, NotificationModel.user_id == current_user.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Notification not found")
    row.read = True
    db.commit()
    return {"message": "Marked as read"}
