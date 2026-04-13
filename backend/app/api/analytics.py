
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, text
from app.database import get_db, engine
from app.models.patient import Patient as PatientModel
from app.models.appointment import Appointment as AppointmentModel
from app.models.medical_act import MedicalAct as MedicalActModel
from app.models.audit import AuditLog
from app.models.notification import Notification as NotificationModel
from app.models.user import User
from datetime import datetime, timedelta
from app.api.auth import get_current_user_orm, RoleChecker, require_admin
from app.services import analytics_service
import csv
import io
import json

router = APIRouter()

@router.get("/recent-activity")
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_orm),
):
    # Get latest 5 patients
    recent_patients = db.query(PatientModel).order_by(PatientModel.created_at.desc()).limit(5).all()
    # Get latest 5 appointments
    recent_appointments = db.query(AppointmentModel).order_by(AppointmentModel.datetime_scheduled.desc()).limit(5).all()
    # Get latest 5 medical acts
    recent_acts = db.query(MedicalActModel).order_by(MedicalActModel.act_date.desc()).limit(5).all()

    activities = []
    for p in recent_patients:
        activities.append({
            "type": "patient",
            "title": "Nouveau patient ajouté",
            "subtitle": getattr(p, "name", None) or f"ID {p.id}",
            "time": _to_iso(getattr(p, "created_at", None))
        })
    for a in recent_appointments:
        activities.append({
            "type": "appointment",
            "title": "Rendez-vous confirmé",
            "subtitle": f"Patient ID {a.patient_id} - {a.datetime_scheduled.strftime('%Y-%m-%d %H:%M') if a.datetime_scheduled else 'N/A'}",
            "time": _to_iso(getattr(a, "datetime_scheduled", None))
        })
    for m in recent_acts:
        activities.append({
            "type": "medical_act",
            "title": "Acte médical créé",
            "subtitle": f"{m.act_type} (Patient ID {m.patient_id})",
            "time": _to_iso(getattr(m, "act_date", None))
        })

    # Sort all activities by time descending (most recent first)
    activities = [a for a in activities if a["time"]]
    activities.sort(key=lambda x: x["time"], reverse=True)
    return {"activities": activities[:10]}  # Return the 10 most recent activities

def _to_iso(dt):
    if hasattr(dt, 'isoformat'):
        return dt.isoformat()
    return str(dt) if dt else None

def get_patient_names(db, patient_ids):
    patients = db.query(PatientModel.id, PatientModel.first_name, PatientModel.last_name).filter(PatientModel.id.in_(patient_ids)).all()
    return {p.id: f"{p.first_name} {p.last_name}" for p in patients}



class AnalyticsSummary(BaseModel):
    total_patients: int
    avg_age: float
    common_diagnoses: List[str]
    weekly_activity: List[dict]
    demographics: List[dict]
    activity_trends: List[dict]
    revenue_trends: List[dict]
    treatments: List[dict]


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "doctor", "department_head"])),
):
    stats = analytics_service.get_summary_stats(db)
    return stats


@router.get("/trends")
def get_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "doctor", "department_head"])),
):
    return {"trends": []}


@router.get("/cohorts")
def get_cohorts(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "doctor", "department_head"])),
):
    return {"cohorts": []}


@router.get("/admin-stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"])),
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0

    today = datetime.now().date()
    today_logins = (
        db.query(func.count(AuditLog.id))
        .filter(
            AuditLog.action == "LOGIN_SUCCESS",
            cast(AuditLog.timestamp, Date) == today,
        )
        .scalar() or 0
    )

    month_start = today.replace(day=1)
    monthly_actions = (
        db.query(func.count(AuditLog.id))
        .filter(cast(AuditLog.timestamp, Date) >= month_start)
        .scalar() or 0
    )

    # Activity by day (last 7 days)
    day_names_fr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    activity_by_day = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        logins = (
            db.query(func.count(AuditLog.id))
            .filter(
                AuditLog.action == "LOGIN_SUCCESS",
                cast(AuditLog.timestamp, Date) == d,
            )
            .scalar() or 0
        )
        actions = (
            db.query(func.count(AuditLog.id))
            .filter(cast(AuditLog.timestamp, Date) == d)
            .scalar() or 0
        )
        activity_by_day.append({
            "day": day_names_fr[d.weekday()],
            "connexions": logins,
            "actions": actions,
        })

    # Compute 7-day activity rate
    week_ago = today - timedelta(days=7)
    users_active_7d = (
        db.query(func.count(func.distinct(AuditLog.user_id)))
        .filter(
            AuditLog.user_id.isnot(None),
            cast(AuditLog.timestamp, Date) >= week_ago,
        )
        .scalar() or 0
    )
    activity_rate = round((users_active_7d / total_users * 100) if total_users > 0 else 0)

    return {
        "total_users": total_users,
        "active_users": active_users,
        "today_logins": today_logins,
        "monthly_actions": monthly_actions,
        "activity_rate": activity_rate,
        "activity_by_day": activity_by_day,
    }


@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"])),
    limit: int = Query(50),
    skip: int = Query(0),
    status_filter: Optional[str] = Query(None, alias="status"),
    action_filter: Optional[str] = Query(None, alias="action"),
    username_filter: Optional[str] = Query(None, alias="username"),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
):
    q = db.query(AuditLog)
    if status_filter and status_filter != "all":
        q = q.filter(AuditLog.status == status_filter)
    if action_filter:
        q = q.filter(AuditLog.action == action_filter)
    if username_filter:
        q = q.filter(AuditLog.username.ilike(f"%{username_filter}%"))
    if date_from:
        q = q.filter(cast(AuditLog.timestamp, Date) >= date_from)
    if date_to:
        q = q.filter(cast(AuditLog.timestamp, Date) <= date_to)
    logs = q.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "username": log.username,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "status": log.status,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
        for log in logs
    ]


@router.get("/audit-logs/export")
def export_audit_logs_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"])),
    status_filter: Optional[str] = Query(None, alias="status"),
    action_filter: Optional[str] = Query(None, alias="action"),
    username_filter: Optional[str] = Query(None, alias="username"),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
):
    q = db.query(AuditLog)
    if status_filter and status_filter != "all":
        q = q.filter(AuditLog.status == status_filter)
    if action_filter:
        q = q.filter(AuditLog.action == action_filter)
    if username_filter:
        q = q.filter(AuditLog.username.ilike(f"%{username_filter}%"))
    if date_from:
        q = q.filter(cast(AuditLog.timestamp, Date) >= date_from)
    if date_to:
        q = q.filter(cast(AuditLog.timestamp, Date) <= date_to)
    logs = q.order_by(AuditLog.timestamp.desc()).limit(5000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Date", "Utilisateur", "Action", "Statut", "IP", "Détails"])
    for log in logs:
        writer.writerow([
            log.id,
            log.timestamp.isoformat() if log.timestamp else "",
            log.username or "",
            log.action or "",
            log.status or "",
            log.ip_address or "",
            log.details or "",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit-logs.csv"},
    )


# ─── System Health ─────────────────────────────────────────────────────────────

@router.get("/system-health")
def get_system_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # DB check
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_patients = db.query(func.count(PatientModel.id)).scalar() or 0
    total_appointments = db.query(func.count(AppointmentModel.id)).scalar() or 0
    total_medical_acts = db.query(func.count(MedicalActModel.id)).scalar() or 0
    total_audit_logs = db.query(func.count(AuditLog.id)).scalar() or 0

    return {
        "database": "connected" if db_ok else "disconnected",
        "api": "running",
        "total_users": total_users,
        "total_patients": total_patients,
        "total_appointments": total_appointments,
        "total_medical_acts": total_medical_acts,
        "total_audit_logs": total_audit_logs,
    }


# ─── Settings (persisted as JSON in a simple table) ───────────────────────────

# We use a simple key-value approach with a single settings row in audit_logs
# is overkill — instead use a file-based approach for simplicity.
import os

SETTINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "platform_settings.json")

DEFAULT_SETTINGS = {
    "platformName": "RhumatoAI",
    "notifications": True,
    "maintenanceMode": False,
    "emailAlerts": True,
    "sessionTimeout": 30,
    "backupFrequency": "quotidien",
}


def _load_settings():
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return DEFAULT_SETTINGS.copy()


def _save_settings(data):
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@router.get("/settings")
def get_settings(current_user: User = Depends(require_admin)):
    return _load_settings()


@router.put("/settings")
def save_settings(
    data: dict,
    current_user: User = Depends(require_admin),
):
    _save_settings(data)
    return {"message": "Settings saved", "settings": data}


# ─── Broadcast Notification ────────────────────────────────────────────────────

class BroadcastRequest(BaseModel):
    title: str
    message: str


@router.post("/broadcast")
def broadcast_notification(
    data: BroadcastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    users = db.query(User).filter(User.is_active == True).all()
    count = 0
    for u in users:
        notif = NotificationModel(
            user_id=u.id,
            title=data.title,
            message=data.message,
        )
        db.add(notif)
        count += 1
    db.commit()
    from app.services.audit_service import log_action
    log_action(db, action="BROADCAST_NOTIFICATION", user_id=current_user.id,
               username=current_user.username, status="success",
               details=f"Sent to {count} users: {data.title}")
    return {"message": f"Notification envoyée à {count} utilisateurs", "count": count}
