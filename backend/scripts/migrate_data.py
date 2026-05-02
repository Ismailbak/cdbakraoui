#!/usr/bin/env python3
"""
Data migration script for critical database integrity fixes.
Handles:
1. Migrating assigned_staff_ids JSON → MedicalActStaff junction table
2. Validating FK constraints and data relationships
3. Reporting any issues that need manual attention
"""

import json
import sys
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

def migrate_assigned_staff(db: Session, verbose: bool = True) -> dict:
    """Migrate assigned_staff_ids from JSON text field to MedicalActStaff junction table."""
    stats = {"migrated": 0, "errors": 0, "already_in_table": 0}
    
    try:
        from app.models.medical_act import MedicalAct, MedicalActStaff
        
        acts = db.query(MedicalAct).filter(MedicalAct.assigned_staff_ids.isnot(None)).all()
        
        if verbose:
            print(f"\n📋 Found {len(acts)} medical acts with assigned_staff_ids to migrate...")
        
        for act in acts:
            try:
                staff_ids = json.loads(act.assigned_staff_ids) if act.assigned_staff_ids else []
                
                if not isinstance(staff_ids, list):
                    staff_ids = [staff_ids]
                
                for staff_id in staff_ids:
                    # Check if already exists
                    existing = db.query(MedicalActStaff).filter(
                        MedicalActStaff.medical_act_id == act.id,
                        MedicalActStaff.staff_id == staff_id
                    ).first()
                    
                    if existing:
                        stats["already_in_table"] += 1
                        continue
                    
                    new_staff = MedicalActStaff(
                        medical_act_id=act.id,
                        staff_id=staff_id
                    )
                    db.add(new_staff)
                    stats["migrated"] += 1
                
            except (json.JSONDecodeError, ValueError, TypeError) as e:
                stats["errors"] += 1
                print(f"  ⚠️  Act {act.id}: Invalid JSON in assigned_staff_ids: {act.assigned_staff_ids}")
        
        db.commit()
        if verbose:
            print(f"✅ Migration complete:")
            print(f"   - Migrated: {stats['migrated']} staff assignments")
            print(f"   - Already existed: {stats['already_in_table']}")
            print(f"   - Errors: {stats['errors']}")
        
        return stats
    except Exception as e:
        db.rollback()
        print(f"❌ Migration failed: {e}")
        return stats


def validate_data_integrity(db: Session, verbose: bool = True) -> dict:
    """Validate data relationships after migration."""
    issues = {
        "appointments_missing_datetime": 0,
        "appointments_null_patient": 0,
        "patients_null_dob": 0,
        "medical_acts_invalid_doctor": 0,
        "medical_acts_invalid_patient": 0,
        "orphaned_staff_records": 0,
        "warnings": []
    }
    
    try:
        from app.models.appointment import Appointment
        from app.models.patient import Patient
        from app.models.medical_act import MedicalAct, MedicalActStaff
        from app.models.user import User
        
        if verbose:
            print(f"\n🔍 Validating data integrity...")
        
        # Check appointments
        appointments = db.query(Appointment).count()
        appts_no_datetime = db.query(Appointment).filter(
            Appointment.datetime_scheduled.isnull()
        ).count()
        issues["appointments_missing_datetime"] = appts_no_datetime
        
        appts_no_patient = db.query(Appointment).filter(
            Appointment.patient_id.isnull()
        ).count()
        issues["appointments_null_patient"] = appts_no_patient
        
        if verbose:
            print(f"  📅 Appointments: {appointments} total")
            if appts_no_datetime > 0:
                print(f"     ⚠️  {appts_no_datetime} missing datetime_scheduled")
            if appts_no_patient > 0:
                print(f"     ⚠️  {appts_no_patient} missing patient_id")
        
        # Check patients
        patients = db.query(Patient).count()
        patients_with_dob = db.query(Patient).filter(Patient.date_of_birth.isnot(None)).count()
        
        if verbose:
            print(f"  👥 Patients: {patients} total, {patients_with_dob} with date_of_birth")
        
        # Check medical acts
        medical_acts = db.query(MedicalAct).count()
        
        # Check for invalid doctor IDs
        invalid_doctors = db.query(MedicalAct).filter(
            MedicalAct.doctor_id.isnot(None)
        ).all()
        for act in invalid_doctors:
            doctor = db.query(User).filter(User.id == act.doctor_id).first()
            if not doctor:
                issues["medical_acts_invalid_doctor"] += 1
        
        # Check for invalid patient IDs
        invalid_patients = db.query(MedicalAct).filter(
            MedicalAct.patient_id.isnull()
        ).count()
        issues["medical_acts_invalid_patient"] = invalid_patients
        
        if verbose:
            print(f"  🏥 Medical Acts: {medical_acts} total")
            if issues["medical_acts_invalid_doctor"] > 0:
                print(f"     ⚠️  {issues['medical_acts_invalid_doctor']} with invalid doctor_id")
            if invalid_patients > 0:
                print(f"     ⚠️  {invalid_patients} missing patient_id")
        
        # Check medical act staff
        total_staff_assignments = db.query(MedicalActStaff).count()
        orphaned_staff = db.query(MedicalActStaff).filter(
            ~MedicalActStaff.medical_act_id.in_(db.query(MedicalAct.id))
        ).count()
        issues["orphaned_staff_records"] = orphaned_staff
        
        if verbose:
            print(f"  👨‍⚕️  Medical Act Staff: {total_staff_assignments} total")
            if orphaned_staff > 0:
                print(f"     ⚠️  {orphaned_staff} orphaned records (no parent act)")
        
        # Summary
        has_issues = any(v > 0 for k, v in issues.items() if k != "warnings")
        
        if verbose:
            if not has_issues:
                print(f"\n✅ Data integrity validation: NO ISSUES FOUND")
            else:
                print(f"\n⚠️  Data integrity validation: ISSUES DETECTED")
                print(f"   Please review and fix before proceeding to production.")
        
        return issues
        
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        return issues


def generate_health_report(db: Session) -> str:
    """Generate a detailed health report."""
    report = []
    report.append("\n" + "="*60)
    report.append("DATABASE HEALTH REPORT - Critical Integrity Fixes")
    report.append("="*60)
    
    try:
        from app.models.appointment import Appointment
        from app.models.patient import Patient
        from app.models.medical_act import MedicalAct, MedicalActStaff
        
        # Stats
        stats = {
            "total_appointments": db.query(Appointment).count(),
            "total_patients": db.query(Patient).count(),
            "total_medical_acts": db.query(MedicalAct).count(),
            "total_staff_assignments": db.query(MedicalActStaff).count(),
        }
        
        report.append("\nBasic Statistics:")
        for key, value in stats.items():
            report.append(f"  {key}: {value}")
        
        # Run validation
        issues = validate_data_integrity(db, verbose=False)
        
        report.append("\nData Integrity Status:")
        if any(v > 0 for k, v in issues.items() if k != "warnings"):
            report.append("  ❌ Issues detected:")
            for key, value in issues.items():
                if key != "warnings" and value > 0:
                    report.append(f"     - {key}: {value}")
        else:
            report.append("  ✅ All checks passed")
        
        report.append("\n" + "="*60 + "\n")
        
    except Exception as e:
        report.append(f"\n❌ Error generating report: {e}\n")
    
    return "\n".join(report)


def main():
    """Main entry point."""
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    
    try:
        print("🚀 Starting database migration...")
        print(f"Timestamp: {datetime.now().isoformat()}")
        
        # Run migration
        migrate_assigned_staff(db, verbose=True)
        
        # Validate
        validate_data_integrity(db, verbose=True)
        
        # Generate report
        report = generate_health_report(db)
        print(report)
        
        print("✅ Migration process complete!")
        print("\nNext steps:")
        print("  1. Review any warnings above")
        print("  2. Run backend tests: pytest backend/tests/ -v")
        print("  3. Test all API endpoints")
        print("  4. Update frontend to handle new schemas")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
