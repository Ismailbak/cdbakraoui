from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from jose import jwt
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_user,
    get_user_by_username,
    get_user_by_email,
)

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
        return user
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


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
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username})
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
