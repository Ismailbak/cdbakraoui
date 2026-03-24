from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc, cast, Float, case
from app.models.patient import Patient
from app.models.medical_act import MedicalAct
from app.models.appointment import Appointment
from datetime import datetime, timedelta

def get_summary_stats(db: Session) -> Dict:
    """Calculates top-level summary statistics directly from the database."""
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    avg_age = db.query(func.avg(Patient.age)).scalar() or 0.0
    
    # Top 5 diagnoses
    top_diagnoses = (
        db.query(Patient.diagnosis, func.count(Patient.diagnosis))
        .filter(Patient.diagnosis != "", Patient.diagnosis.isnot(None))
        .group_by(Patient.diagnosis)
        .order_by(desc(func.count(Patient.diagnosis)))
        .limit(5)
        .all()
    )
    common_diagnoses = [d[0] for d in top_diagnoses if d[0]]

    # Weekly Activity (current week)
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday()) # Monday
    
    daily_activity = []
    days_fr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    for i in range(7):
        current_date = week_start + timedelta(days=i)
        date_str = current_date.isoformat()
        
        # Note: Appointment model uses 'reason' instead of 'type'. 
        # We'll check for keywords in reason for categorization.
        count_cons = db.query(func.count(Appointment.id)).filter(Appointment.date == date_str, Appointment.reason.ilike("%Consultation%")).scalar() or 0
        count_suivi = db.query(func.count(Appointment.id)).filter(Appointment.date == date_str, Appointment.reason.ilike("%Suivi%")).scalar() or 0
        count_urge = db.query(func.count(Appointment.id)).filter(Appointment.date == date_str, Appointment.reason.ilike("%Urgence%")).scalar() or 0
        
        daily_activity.append({
            "day": days_fr[i],
            "consultations": count_cons,
            "suivis": count_suivi,
            "urgences": count_urge
        })

    # Age Distribution
    age_groups = [
        {"label": "18-30", "min": 18, "max": 30},
        {"label": "31-45", "min": 31, "max": 45},
        {"label": "46-60", "min": 46, "max": 60},
        {"label": "61-75", "min": 61, "max": 75},
        {"label": "75+", "min": 76, "max": 150},
    ]
    demographics = []
    for group in age_groups:
        males = db.query(func.count(Patient.id)).filter(
            Patient.age >= group["min"], 
            Patient.age <= group["max"], 
            Patient.gender.ilike("homme")
        ).scalar() or 0
        females = db.query(func.count(Patient.id)).filter(
            Patient.age >= group["min"], 
            Patient.age <= group["max"], 
            Patient.gender.ilike("femme")
        ).scalar() or 0
        demographics.append({"age": group["label"], "male": males, "female": females})

    # Monthly Trends (current year)
    months_fr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    current_year = today.year
    activity_trends = []
    revenue_trends = []
    
    for i, month_name in enumerate(months_fr):
        month_idx = i + 1
        month_pattern = f"{current_year}-{month_idx:02d}-%"
        
        actes_count = db.query(func.count(MedicalAct.id)).filter(MedicalAct.date.like(month_pattern)).scalar() or 0
        rdv_count = db.query(func.count(Appointment.id)).filter(Appointment.date.like(month_pattern)).scalar() or 0
        
        activity_trends.append({
            "month": month_name,
            "actes": actes_count,
            "rdv": rdv_count
        })
        
        # Revenue calculation
        month_acts = db.query(MedicalAct.amount, MedicalAct.patient_id).filter(MedicalAct.date.like(month_pattern)).all()
        # Robust parsing for amount string
        def parse_amount(val):
            if not val: return 0.0
            # Remove spaces and non-numeric characters except dot
            clean_val = "".join(c for c in str(val) if c.isdigit() or c == '.')
            try:
                return float(clean_val) if clean_val else 0.0
            except ValueError:
                return 0.0

        revenue = sum(parse_amount(a.amount) for a in month_acts)
        unique_patients = len(set(a.patient_id for a in month_acts))
        
        revenue_trends.append({
            "month": month_name,
            "revenue": revenue,
            "patients": unique_patients
        })

    # Top Treatments
    treatment_query = (
        db.query(MedicalAct.treatment, func.count(MedicalAct.id))
        .filter(MedicalAct.treatment != "", MedicalAct.treatment.isnot(None))
        .group_by(MedicalAct.treatment)
        .order_by(desc(func.count(MedicalAct.id)))
        .limit(5)
        .all()
    )
    total_treatments = sum(count for _, count in treatment_query)
    treatments = [
        {"name": t[0], "count": t[1], "percentage": round((t[1] / total_treatments * 100)) if total_treatments > 0 else 0}
        for t in treatment_query
    ]

    return {
        "total_patients": total_patients,
        "avg_age": round(float(avg_age), 1),
        "common_diagnoses": common_diagnoses,
        "weekly_activity": daily_activity,
        "demographics": demographics,
        "activity_trends": activity_trends,
        "revenue_trends": revenue_trends,
        "treatments": treatments
    }
