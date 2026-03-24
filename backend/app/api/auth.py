from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from jose import jwt
from typing import Optional
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.audit import AuditLog
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_user,
    get_user_by_username,
    get_user_by_email,
    hash_password,
)
from app.services.audit_service import log_action

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user_orm(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = get_user_by_username(db, username)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Votre compte est désactivé.")
        return user
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user_orm)):
        if user.is_admin:
            return user
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have the required permissions.",
            )
        return user


def require_admin(user: User = Depends(get_current_user_orm)):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return user


class Token(BaseModel):
    access_token: str
    token_type: str


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    username: str | None = None  # default to email if not provided
    role: str = "doctor"
    first_name: str | None = None
    last_name: str | None = None
    specialty: str | None = None
    phone: str | None = None
    department: str | None = None


@router.post("/login", response_model=Token)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else None
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        log_action(db, action="LOGIN_FAILURE", username=form_data.username, status="failure", details="Invalid credentials", ip_address=client_ip)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active and user.role != "admin":
        log_action(db, action="LOGIN_FAILURE", user_id=user.id, username=user.username, status="failure", details="Account deactivated", ip_address=client_ip)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Votre compte est désactivé. Contactez un administrateur.")
    
    access_token = create_access_token(data={"sub": user.username})
    log_action(db, action="LOGIN_SUCCESS", user_id=user.id, username=user.username, status="success", ip_address=client_ip)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    username = data.username or data.email
    if get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(
        db,
        username=username,
        email=data.email,
        password=data.password,
        role=data.role,
        first_name=data.first_name,
        last_name=data.last_name,
        specialty=data.specialty,
        phone=data.phone,
        department=data.department,
    )
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "specialty": user.specialty,
        "phone": user.phone,
        "department": user.department,
        "message": "Account created",
    }


@router.get("/me")
def get_current_user(current_user: User = Depends(get_current_user_orm)):
    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role,
            "is_admin": current_user.is_admin,
            "is_active": current_user.is_active,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "specialty": current_user.specialty,
            "phone": current_user.phone,
            "department": current_user.department,
        }
    }


@router.get("/doctors")
def list_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    """Allows any authenticated user to see the list of doctors for peer-to-peer features."""
    doctors = db.query(User).filter(User.role == "doctor").all()
    return [
        {
            "id": d.id,
            "first_name": d.first_name,
            "last_name": d.last_name,
            "specialty": d.specialty,
            "username": d.username,
        }
        for d in doctors
    ]


# ─── Admin: User Management ───────────────────────────────────────────────────

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    users = db.query(User).order_by(User.id).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "specialty": u.specialty,
            "phone": u.phone,
            "department": u.department,
        }
        for u in users
    ]


@router.patch("/users/{user_id}/toggle")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active}


class UpdateUserRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    specialty: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    data: UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.email and data.email != user.email:
        existing = get_user_by_email(db, data.email)
        if existing and existing.id != user.id:
            raise HTTPException(status_code=400, detail="Email already in use")
    for field in ["first_name", "last_name", "email", "role", "specialty", "phone", "department"]:
        val = getattr(data, field, None)
        if val is not None:
            setattr(user, field, val)
    db.commit()
    db.refresh(user)
    log_action(db, action="UPDATE_USER", user_id=current_user.id, username=current_user.username,
               resource_type="user", resource_id=str(user.id), status="success")
    return {
        "id": user.id, "username": user.username, "email": user.email,
        "role": user.role, "is_admin": user.is_admin, "is_active": user.is_active,
        "first_name": user.first_name, "last_name": user.last_name,
        "specialty": user.specialty, "phone": user.phone, "department": user.department,
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    # Remove related audit logs first (FK constraint)
    db.query(AuditLog).filter(AuditLog.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User deleted", "id": user_id}


class ResetPasswordRequest(BaseModel):
    new_password: str


@router.post("/users/{user_id}/reset-password")
def reset_password(
    user_id: int,
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    log_action(db, action="RESET_PASSWORD", user_id=current_user.id, username=current_user.username,
               resource_type="user", resource_id=str(user.id), status="success")
    return {"message": "Password reset", "id": user_id}


@router.get("/users/{user_id}")
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Get user's recent activity
    activity = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user_id)
        .order_by(AuditLog.timestamp.desc())
        .limit(50)
        .all()
    )
    return {
        "user": {
            "id": user.id, "username": user.username, "email": user.email,
            "role": user.role, "is_admin": user.is_admin, "is_active": user.is_active,
            "first_name": user.first_name, "last_name": user.last_name,
            "specialty": user.specialty, "phone": user.phone, "department": user.department,
        },
        "activity": [
            {
                "id": a.id, "action": a.action, "resource_type": a.resource_type,
                "resource_id": a.resource_id, "details": a.details,
                "ip_address": a.ip_address, "status": a.status,
                "timestamp": a.timestamp.isoformat() if a.timestamp else None,
            }
            for a in activity
        ],
    }
