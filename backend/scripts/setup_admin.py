"""
Bootstrap or update the default admin user.
In production, set ADMIN_PASSWORD in the environment or enter it at the prompt.
"""

import getpass
import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.auth.service import hash_password
from app.core.config import settings
from app.core.database import Base
from app.models.user import User

DEFAULT_DEV_PASSWORD = "admin123"
ADMIN_USERNAME = "admin@cdbakraoui.ma"


def _resolve_password() -> str:
    env_password = os.environ.get("ADMIN_PASSWORD")
    if env_password:
        return env_password

    if settings.is_production:
        password = getpass.getpass("Admin password (required in production): ")
        if not password:
            print("Error: ADMIN_PASSWORD env var or interactive password is required.", file=sys.stderr)
            sys.exit(1)
        return password

    password = getpass.getpass(
        f"Admin password [press Enter for dev default '{DEFAULT_DEV_PASSWORD}']: "
    )
    return password if password else DEFAULT_DEV_PASSWORD


def setup_admin():
    engine = create_engine(settings.DATABASE_URL)
    if settings.create_tables_on_startup:
        Base.metadata.create_all(bind=engine)

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    password = _resolve_password()

    try:
        admin = db.query(User).filter(User.username == ADMIN_USERNAME).first()
        if admin:
            print(f"Admin user already exists: {admin.username}")
            admin.is_admin = True
            admin.role = "admin"
            if os.environ.get("ADMIN_PASSWORD") or settings.is_production:
                admin.hashed_password = hash_password(password)
                print("Admin password updated.")
            db.commit()
            print("Admin privileges confirmed.")
        else:
            print("Creating new admin user...")
            new_admin = User(
                username=ADMIN_USERNAME,
                email=ADMIN_USERNAME,
                hashed_password=hash_password(password),
                is_admin=True,
                role="admin",
                first_name="System",
                last_name="Administrator",
                department="IT",
            )
            db.add(new_admin)
            db.commit()
            print("Admin user created successfully!")
            print(f"Username: {ADMIN_USERNAME}")
            if not settings.is_production and password == DEFAULT_DEV_PASSWORD:
                print(
                    "Warning: using default dev password. "
                    "Set ADMIN_PASSWORD or change password after first login."
                )
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    setup_admin()
