from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.api.auth import get_current_user_orm, RoleChecker
from app.services import notification_service

router = APIRouter()


class Notification(BaseModel):
    id: int
    title: str
    message: str
    read: bool = False
    is_public: bool = False
    sender_id: Optional[int] = None
    sender_name: Optional[str] = None
    category: str = "message"
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    recipient_id: Optional[int] = None
    title: str
    message: str
    is_public: bool = False
    category: str = "message"


@router.get("/", response_model=List[Notification])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    rows = notification_service.get_user_notifications(db, current_user.id)
    result = []
    for r in rows:
        sender_name = "Système"
        if r.sender_id:
            sender = db.query(User).filter(User.id == r.sender_id).first()
            if sender:
                sender_name = f"Dr. {sender.last_name}" if sender.last_name else sender.username
        
        result.append({
            "id": r.id,
            "title": r.title,
            "message": r.message,
            "read": r.read,
            "is_public": r.is_public,
            "sender_id": r.sender_id,
            "sender_name": sender_name,
            "category": r.category,
            "created_at": r.created_at
        })
    return result


@router.post("/", response_model=List[Notification])
def send_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    # Only allow doctors or admins to send manual notifications
    if current_user.role not in ["doctor", "admin", "department_head"]:
        raise HTTPException(status_code=403, detail="Only medical staff can send notifications")
    
    new_notifs = notification_service.send_manual_notification(
        db, 
        sender_id=current_user.id, 
        recipient_id=data.recipient_id, 
        title=data.title, 
        message=data.message, 
        is_public=data.is_public,
        category=data.category
    )
    return [Notification.from_orm(n) for n in new_notifs]


@router.post("/read/{notification_id}")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    success = notification_service.mark_notification_read(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}
