"""
Models for the dynamic form system.
Includes reference catalog tables and form data tables.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from app.database import Base


class RefCareType(Base):
    """Reference table: Care pathways (e.g., RIC, RD, OS, Douleur)"""
    __tablename__ = "ref_care_types"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    label = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    display_order = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())


class RefActType(Base):
    """Reference table: Act types within each care pathway"""
    __tablename__ = "ref_act_types"

    id = Column(Integer, primary_key=True, index=True)
    ref_care_type_id = Column(Integer, ForeignKey("ref_care_types.id"), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    label = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    display_order = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())


class RefFormType(Base):
    """Reference table: Form templates associated with act types"""
    __tablename__ = "ref_form_types"

    id = Column(Integer, primary_key=True, index=True)
    ref_act_type_id = Column(Integer, ForeignKey("ref_act_types.id"), nullable=False, index=True)
    form_name = Column(String(100), unique=True, nullable=False, index=True)
    form_label = Column(String(255), nullable=False)
    form_order = Column(Integer, default=1)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, server_default=func.now())


class ActForm(Base):
    """Bridge table: Links medical_acts to form data"""
    __tablename__ = "act_forms"

    id = Column(Integer, primary_key=True, index=True)
    act_id = Column(Integer, ForeignKey("medical_acts.id"), nullable=False, index=True)
    ref_form_type_id = Column(Integer, ForeignKey("ref_form_types.id"), nullable=False, index=True)
    form_table_id = Column(Integer, nullable=False)  # ID in specific form data table
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class FormCsRd(Base):
    """Form data table: Consultation Rhumatisme Dégénératif (Degenerative Rheumatism)"""
    __tablename__ = "form_cs_rd"

    id = Column(Integer, primary_key=True, index=True)

    # ─── SECTION 1: CURRENT TREATMENT ─────────────────────────────────
    current_treatment_none = Column(Boolean, default=False)
    current_treatment_json = Column(JSON, nullable=True)  # Array of medications

    # ─── SECTION 2: FUNCTIONAL SIGNS ──────────────────────────────────
    arthralgie_present = Column(Boolean, default=False)
    arthralgie_horaire = Column(String(50), nullable=True)  # Mecanique, Inflammatoire, Mixte
    arthralgie_duration = Column(String(255), nullable=True)
    arthralgie_locations = Column(JSON, nullable=True)  # Array of joints

    joint_swelling_present = Column(Boolean, default=False)
    joint_swelling_locations = Column(JSON, nullable=True)

    rachialgie_present = Column(Boolean, default=False)
    rachialgie_horaire = Column(String(50), nullable=True)
    rachialgie_duration = Column(String(255), nullable=True)
    rachialgie_locations = Column(JSON, nullable=True)

    fessialgie_present = Column(Boolean, default=False)
    fessialgie_horaire = Column(String(50), nullable=True)
    fessialgie_duration = Column(String(255), nullable=True)
    fessialgie_locations = Column(JSON, nullable=True)

    enthesalgie_present = Column(Boolean, default=False)
    enthesalgie_locations = Column(JSON, nullable=True)

    myalgie_present = Column(Boolean, default=False)
    myalgie_horaire = Column(String(50), nullable=True)
    myalgie_duration = Column(String(255), nullable=True)

    other_signs_text = Column(Text, nullable=True)

    # ─── SECTION 3: PHYSICAL EXAMINATION ──────────────────────────────
    articular_index = Column(Integer, nullable=True)
    synovial_index = Column(Integer, nullable=True)
    clinical_examination_notes = Column(Text, nullable=True)

    # ─── SECTION 4: LAB RESULTS (JSON) ────────────────────────────────
    lab_inflammatory_json = Column(JSON, nullable=True)
    lab_renal_json = Column(JSON, nullable=True)
    lab_hepatic_json = Column(JSON, nullable=True)
    lab_metabolic_json = Column(JSON, nullable=True)
    lab_electrolytes_json = Column(JSON, nullable=True)
    lab_immunology_json = Column(JSON, nullable=True)
    lab_infection_json = Column(JSON, nullable=True)

    # ─── SECTION 5: IMAGING ───────────────────────────────────────────
    imaging_xray = Column(Boolean, default=False)
    imaging_xray_findings = Column(Text, nullable=True)
    imaging_ultrasound = Column(Boolean, default=False)
    imaging_ultrasound_findings = Column(Text, nullable=True)
    imaging_ct = Column(Boolean, default=False)
    imaging_ct_findings = Column(Text, nullable=True)
    imaging_mri = Column(Boolean, default=False)
    imaging_mri_findings = Column(Text, nullable=True)
    imaging_other = Column(Boolean, default=False)
    imaging_other_findings = Column(Text, nullable=True)

    # ─── SECTION 6: DIAGNOSIS ─────────────────────────────────────────
    diagnosis_osteoarthritis_json = Column(JSON, nullable=True)  # Array of diagnoses
    diagnosis_spine_json = Column(JSON, nullable=True)
    diagnosis_tendinopathy_json = Column(JSON, nullable=True)
    diagnosis_other_text = Column(Text, nullable=True)

    # ─── SECTION 7: TREATMENT PLAN ────────────────────────────────────
    treatment_decision = Column(String(50), nullable=True)  # starting, maintain, stop
    treatment_starting_json = Column(JSON, nullable=True)
    treatment_maintain_reason = Column(String(255), nullable=True)
    treatment_maintain_remarks = Column(Text, nullable=True)
    treatment_stop_reason = Column(String(255), nullable=True)
    treatment_stop_remarks = Column(Text, nullable=True)
    other_therapeutic_decisions = Column(Text, nullable=True)
    prescription = Column(Text, nullable=True)
    additional_notes = Column(Text, nullable=True)

    # ─── METADATA ──────────────────────────────────────────────────────
    form_date = Column(Date, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
