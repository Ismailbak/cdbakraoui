"""Dental form models aligned with the dentai database schema."""

from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Integer, String, Text, DECIMAL
from sqlalchemy.dialects.mysql import JSON, TINYINT

from app.core.database import Base


class _DentalFormBase:
    id = Column(Integer, primary_key=True)
    form_date = Column(Date)
    clinical_notes = Column(Text)
    created_by = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FormDentExam(_DentalFormBase, Base):
    __tablename__ = "form_dent_exam"

    chief_complaint = Column(Text)
    pain_present = Column(TINYINT)
    pain_intensity_vas = Column(Integer)
    pain_teeth = Column(JSON)
    medical_history = Column(Text)
    allergies = Column(Text)
    current_medications = Column(Text)
    smoker = Column(TINYINT)
    pregnant = Column(TINYINT)
    extraoral_findings = Column(Text)
    soft_tissue_findings = Column(Text)
    occlusion = Column(String(100))
    oral_hygiene = Column(String(50))
    odontogram_json = Column(JSON)
    plaque_index = Column(DECIMAL(5, 2))
    bleeding_index = Column(DECIMAL(5, 2))
    dmft_score = Column(Integer)
    radio_panoramique = Column(TINYINT)
    radio_retroalveolaire = Column(TINYINT)
    radio_findings = Column(Text)
    diagnosis = Column(Text)
    treatment_plan_summary = Column(Text)


class FormDentSoin(_DentalFormBase, Base):
    __tablename__ = "form_dent_soin"

    tooth_number = Column(String(10))
    surfaces = Column(JSON)
    caries_class = Column(String(20))
    caries_depth = Column(String(50))
    pulp_status = Column(String(50))
    anesthesia = Column(TINYINT)
    anesthesia_type = Column(String(100))
    restoration_material = Column(String(100))
    restoration_shade = Column(String(20))
    pulp_capping = Column(TINYINT)
    matrix_used = Column(TINYINT)
    complications = Column(Text)
    post_op_instructions = Column(Text)


class FormDentEndo(_DentalFormBase, Base):
    __tablename__ = "form_dent_endo"

    tooth_number = Column(String(10))
    diagnosis = Column(String(150))
    pulp_vitality_test = Column(String(50))
    canal_count = Column(Integer)
    working_length = Column(String(100))
    apex_locator_used = Column(TINYINT)
    rubber_dam_used = Column(TINYINT)
    instrumentation_technique = Column(String(100))
    irrigation_solution = Column(String(100))
    obturation_technique = Column(String(100))
    obturation_material = Column(String(100))
    session_number = Column(Integer)
    treatment_complete = Column(TINYINT)
    complications = Column(Text)
    post_op_instructions = Column(Text)


class FormDentExtraction(_DentalFormBase, Base):
    __tablename__ = "form_dent_extraction"

    tooth_number = Column(String(10))
    extraction_reason = Column(String(150))
    extraction_type = Column(String(50))
    anesthesia_type = Column(String(100))
    surgical_flap = Column(TINYINT)
    bone_removal = Column(TINYINT)
    tooth_sectioning = Column(TINYINT)
    sutures = Column(TINYINT)
    sutures_count = Column(Integer)
    hemostasis_achieved = Column(TINYINT)
    complications = Column(Text)
    medications_prescribed = Column(Text)
    post_op_instructions = Column(Text)
    followup_date = Column(Date)


class FormDentProthese(_DentalFormBase, Base):
    __tablename__ = "form_dent_prothese"

    prosthesis_type = Column(String(100))
    teeth_concerned = Column(JSON)
    material = Column(String(100))
    shade = Column(String(20))
    impression_taken = Column(TINYINT)
    impression_material = Column(String(100))
    provisional_placed = Column(TINYINT)
    occlusion_checked = Column(TINYINT)
    lab_name = Column(String(150))
    step = Column(String(100))
    delivery_date = Column(Date)
    complications = Column(Text)


class FormDentParo(_DentalFormBase, Base):
    __tablename__ = "form_dent_paro"

    diagnosis = Column(String(150))
    plaque_index = Column(DECIMAL(5, 2))
    bleeding_on_probing = Column(DECIMAL(5, 2))
    gingival_recession = Column(TINYINT)
    mobility_present = Column(TINYINT)
    furcation_involvement = Column(TINYINT)
    pocket_depths_json = Column(JSON)
    procedure = Column(String(150))
    quadrants_treated = Column(JSON)
    ultrasonic_used = Column(TINYINT)
    oral_hygiene_instructions = Column(Text)
    medications_prescribed = Column(Text)
    recall_interval_months = Column(Integer)


class FormDentPlan(_DentalFormBase, Base):
    __tablename__ = "form_dent_plan"

    summary = Column(Text)
    plan_items_json = Column(JSON)
    priority = Column(String(50))
    estimated_sessions = Column(Integer)
    total_estimate = Column(DECIMAL(10, 2))
    amount_paid = Column(DECIMAL(10, 2))
    insurance_covered = Column(TINYINT)
    insurance_name = Column(String(150))
    insurance_estimate = Column(DECIMAL(10, 2))
    patient_consent = Column(TINYINT)
    consent_date = Column(Date)


DENTAL_FORM_REGISTRY = {
    "dent-exam": ("form_dent_exam", FormDentExam),
    "dent-soin": ("form_dent_soin", FormDentSoin),
    "dent-endo": ("form_dent_endo", FormDentEndo),
    "dent-extraction": ("form_dent_extraction", FormDentExtraction),
    "dent-prothese": ("form_dent_prothese", FormDentProthese),
    "dent-paro": ("form_dent_paro", FormDentParo),
    "dent-plan": ("form_dent_plan", FormDentPlan),
}
