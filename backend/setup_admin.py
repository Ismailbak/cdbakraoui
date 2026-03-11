
from sqlalchemy import create_engine
from app.models.user import User
from app.services.auth_service import hash_password
from app.database import Base
from app.config import settings

def setup_admin():
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine) # Ensure tables exist
    
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.username == "admin@chu.ma").first()
        if admin:
            print(f"Admin user already exists: {admin.username}")
            # Ensure it HAS admin privileges
            admin.is_admin = True
            admin.role = "admin"
            db.commit()
            print("Admin privileges confirmed.")
        else:
            print("Creating new admin user...")
            new_admin = User(
                username="admin@chu.ma",
                email="admin@chu.ma",
                hashed_password=hash_password("admin123"),
                is_admin=True,
                role="admin",
                first_name="System",
                last_name="Administrator",
                department="IT"
            )
            db.add(new_admin)
            db.commit()
            print("Admin user created successfully!")
            print("Username: admin@chu.ma")
            print("Password: admin123")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_admin()
