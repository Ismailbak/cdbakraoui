from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Mock users for development
MOCK_USERS = {
    "doctor": {
        "username": "doctor",
        # password123
        "password": "$2b$12$LS103GoXA9t8YgPaxHsy9Oc9F/H.nmNhXe/vrs3YQf6ZVjeZIaMBS",
        "role": "doctor",
        "is_admin": False
    },
    "admin@churochd.ma": {
        "username": "admin@churochd.ma",
        # adminpass2026
        "password": "$2b$12$aZ/mGUKkfailHQa2pppG9.9InvkOc1SJwTEx5gIsRphBaut9pqqkW",
        "role": "admin",
        "is_admin": True
    }
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(username: str, password: str):
    user = MOCK_USERS.get(username)
    if user and verify_password(password, user["password"]):
        return user
    return None

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
