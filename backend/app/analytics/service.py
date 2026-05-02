from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc, cast, Float, case, Date
from app.models.patient import Patient
from app.models.medical_act import MedicalAct, ActTreatment
from app.models.appointment import Appointment
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

def calculate_age(date_of_birth):
    """Calculate age from date of birth."""
    if not date_of_birth:
        return None
    today = datetime.now().date()
    return today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))

def get_summary_stats(db: Session, date_range: str = "6months") -> Dict:
    """Calculates top-level summary statistics directly from the database."""
    # Calculate date range
    today = datetime.now().date()
    if date_range == "7days":
        start_date = today - timedelta(days=7)
    elif date_range == "30days":
        start_date = today - timedelta(days=30)
    elif date_range == "3months":
        start_date = today - relativedelta(months=3)
    elif date_range == "1year":
        start_date = today - relativedelta(years=1)
    else:  # 6months is default
        start_date = today - relativedelta(months=6)
    
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    
    # Calculate average age from all patients with date_of_birth (within date range)
    patients_with_dob = db.query(Patient).filter(Patient.date_of_birth.isnot(None)).all()
    avg_age = 0.0
    if patients_with_dob:
        ages = [calculate_age(p.date_of_birth) for p in patients_with_dob if calculate_age(p.date_of_birth) is not None]
        avg_age = sum(ages) / len(ages) if ages else 0.0
    
    # Top 5 diagnoses (from medical acts within date range)
    top_diagnoses = (
        db.query(Patient.primary_diagnosis, func.count(Patient.primary_diagnosis))
        .filter(Patient.primary_diagnosis != "", Patient.primary_diagnosis.isnot(None))
        .group_by(Patient.primary_diagnosis)
        .order_by(desc(func.count(Patient.primary_diagnosis)))
        .limit(5)
        .all()
    )
    common_diagnoses = [d[0] for d in top_diagnoses if d[0]]

    # Weekly Activity (current week, filtered by date range)
    week_start = today - timedelta(days=today.weekday())
    
    daily_activity = []
    days_fr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    for i in range(7):
        current_date = week_start + timedelta(days=i)
        if current_date < start_date:
            continue
        
        # Query by date range for the current date
        day_start = datetime.combine(current_date, datetime.min.time())
        day_end = datetime.combine(current_date, datetime.max.time())
        
        count_cons = db.query(func.count(Appointment.id)).filter(
            Appointment.datetime_scheduled >= day_start,
            Appointment.datetime_scheduled <= day_end,
            Appointment.reason.ilike("%Consultation%")
        ).scalar() or 0
        count_suivi = db.query(func.count(Appointment.id)).filter(
            Appointment.datetime_scheduled >= day_start,
            Appointment.datetime_scheduled <= day_end,
            Appointment.reason.ilike("%Suivi%")
        ).scalar() or 0
        count_urge = db.query(func.count(Appointment.id)).filter(
            Appointment.datetime_scheduled >= day_start,
            Appointment.datetime_scheduled <= day_end,
            Appointment.reason.ilike("%Urgence%")
        ).scalar() or 0
        
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
        # Get patients with date_of_birth and calculate age in Python
        patients_in_range = db.query(Patient).filter(Patient.date_of_birth.isnot(None)).all()
        males = sum(1 for p in patients_in_range if calculate_age(p.date_of_birth) and group["min"] <= calculate_age(p.date_of_birth) <= group["max"] and p.gender and p.gender.lower() in ["homme", "m"])
        females = sum(1 for p in patients_in_range if calculate_age(p.date_of_birth) and group["min"] <= calculate_age(p.date_of_birth) <= group["max"] and p.gender and p.gender.lower() in ["femme", "f"])
        demographics.append({"age": group["label"], "male": males, "female": females})

    # Monthly Trends (within date range)
    months_fr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    activity_trends = []
    revenue_trends = []
    
    # Determine months to display based on date range
    current_month = today.month
    current_year = today.year
    
    if date_range == "7days" or date_range == "30days":
        # Show last 4 weeks
        num_periods = 4
        period_type = "week"
    elif date_range == "3months":
        # Show last 3 months
        num_periods = 3
        period_type = "month"
    elif date_range == "1year":
        # Show all 12 months
        num_periods = 12
        period_type = "month"
    else:  # 6months
        num_periods = 6
        period_type = "month"
    
    for i in range(num_periods - 1, -1, -1):
        if period_type == "month":
            month_idx = current_month - i
            year = current_year
            if month_idx <= 0:
                month_idx += 12
                year -= 1
            month_name = months_fr[month_idx - 1]
            
            month_start = datetime(year, month_idx, 1)
            if month_idx == 12:
                month_end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
            else:
                month_end = datetime(year, month_idx + 1, 1) - timedelta(seconds=1)
            
            period_label = month_name
        else:  # week
            week_num = i
            week_date = today - timedelta(weeks=week_num)
            week_start_dt = week_date - timedelta(days=week_date.weekday())
            week_end_dt = week_start_dt + timedelta(days=6)
        # For now, compute a simple activity count for the period using appointments
        try:
            period_count = (
                db.query(func.count(Appointment.id))
                .filter(Appointment.datetime_scheduled >= (month_start if period_type == 'month' else week_start_dt),
                        Appointment.datetime_scheduled <= (month_end if period_type == 'month' else week_end_dt))
                .scalar() or 0
            )
        except Exception:
            period_count = 0
            
        try:
            period_revenue = (
                db.query(func.sum(MedicalAct.amount))
                .filter(MedicalAct.act_date >= (month_start.date() if period_type == 'month' else week_start_dt.date()),
                        MedicalAct.act_date <= (month_end.date() if period_type == 'month' else week_end_dt.date()))
                .scalar() or 0
            )
        except Exception:
            period_revenue = 0
            
        activity_trends.append({"period": period_label, "count": period_count})
        revenue_trends.append({"period": period_label, "revenue": float(period_revenue)})
            
    # Treatments summary (top prescribed medications)
    try:
        top_treatments = (
            db.query(ActTreatment.drug_name, func.count(ActTreatment.drug_name))
            .join(MedicalAct, MedicalAct.id == ActTreatment.act_id)
            .filter(MedicalAct.act_date >= start_date)
            .filter(ActTreatment.drug_name.isnot(None))
            .group_by(ActTreatment.drug_name)
            .order_by(desc(func.count(ActTreatment.drug_name)))
            .limit(10)
            .all()
        )
        treatments = [{"treatment": t[0], "count": t[1]} for t in top_treatments]
    except Exception:
        treatments = []

    # Final assembled stats
    stats = {
        "total_patients": int(total_patients),
        "avg_age": float(avg_age),
        "common_diagnoses": common_diagnoses,
        "weekly_activity": daily_activity,
        "demographics": demographics,
        "activity_trends": activity_trends,
        "revenue_trends": revenue_trends,
        "treatments": treatments,
    }

    return stats
