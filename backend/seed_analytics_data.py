"""
Seed analytics data for dashboard testing.
Populates the database with realistic medical data.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import random
from app.core.database import Base
from app.core.config import settings
from app.models.user import User
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.medical_act import MedicalAct
from app.models.act_result import ActResult
from app.auth.service import hash_password

def seed_data():
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create admin user if not exists
        admin = db.query(User).filter(User.username == "admin@chu.ma").first()
        if not admin:
            admin = User(
                username="admin@chu.ma",
                email="admin@chu.ma",
                hashed_password=hash_password("admin123"),
                is_admin=True,
                role="admin",
                first_name="System",
                last_name="Administrator"
            )
            db.add(admin)
        
        # Create test doctor
        doctor = db.query(User).filter(User.username == "doctor1").first()
        if not doctor:
            doctor = User(
                username="doctor1",
                email="doctor1@chu.ma",
                hashed_password=hash_password("doctor123"),
                role="doctor",
                first_name="Ahmed",
                last_name="Hassan",
                specialty="Rheumatology"
            )
            db.add(doctor)
        
        db.commit()
        
        # Check if data already exists
        patient_count = db.query(Patient).count()
        if patient_count > 0:
            print(f"Data already exists ({patient_count} patients). Skipping seeding.")
            return
        
        print("Seeding analytics data...")
        
        # Create sample patients with realistic data
        diagnoses = [
            "Arthritis",
            "Osteoarthritis", 
            "Rheumatoid Arthritis",
            "Lupus",
            "Gout",
            "Psoriasis",
            "Ankylosing Spondylitis"
        ]
        
        genders = ["M", "F"]
        statuses = ["Actif", "Suivi", "Arrêt"]
        
        for i in range(1, 17):  # Create 16 patients to match dashboard
            dob = datetime.now().date() - timedelta(days=random.randint(20*365, 75*365))
            patient = Patient(
                first_name=f"Patient{i}",
                last_name=f"Test{i}",
                gender=random.choice(genders),
                date_of_birth=dob,
                email=f"patient{i}@example.com",
                phone=f"06{random.randint(10000000, 99999999)}",
                primary_diagnosis=random.choice(diagnoses),
                status=random.choice(statuses),
                ipp=f"IPP{i:03d}"
            )
            db.add(patient)
        
        db.commit()
        patients = db.query(Patient).all()
        print(f"Created {len(patients)} patients")
        
        # Create appointments over the last 6 months
        appointment_types = ["Consultation", "Suivi", "Urgence"]
        today = datetime.now()
        
        for _ in range(30):
            patient = random.choice(patients)
            appt_date = today - timedelta(days=random.randint(0, 180))
            appointment = Appointment(
                patient_id=patient.id,
                doctor_id=doctor.id,
                datetime_scheduled=appt_date,
                reason=random.choice(appointment_types),
                notes="Sample appointment for testing analytics"
            )
            db.add(appointment)
        
        db.commit()
        print(f"Created {db.query(Appointment).count()} appointments")
        
        # Create medical acts
        act_types = [
            "Consultation",
            "Radiography",
            "Ultrasound",
            "Lab Test",
            "Therapy",
            "Injection"
        ]
        
        for _ in range(25):
            patient = random.choice(patients)
            act_date = today - timedelta(days=random.randint(0, 180))
            medical_act = MedicalAct(
                patient_id=patient.id,
                doctor_id=doctor.id,
                act_type=random.choice(act_types),
                act_date=act_date,
                status="completed"
            )
            db.add(medical_act)
        
        db.commit()
        print(f"Created {db.query(MedicalAct).count()} medical acts")
        
        # Create act results
        for _ in range(20):
            medical_act = db.query(MedicalAct).order_by(MedicalAct.id.desc()).first()
            if medical_act:
                result = ActResult(
                    medical_act_id=medical_act.id,
                    result_text=f"Result sample {random.randint(1, 100)}",
                    result_date=medical_act.act_date,
                    status="completed"
                )
                db.add(result)
        
        db.commit()
        print(f"Created {db.query(ActResult).count()} act results")
        print("✓ Data seeding complete!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
