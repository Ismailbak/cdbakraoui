"""
Additional Form Models for All Care Types
Date: April 22, 2026
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, DECIMAL, Date, JSON, Time, func
from sqlalchemy.dialects.mysql import TINYINT
from app.core.database import Base
from datetime import datetime

class FormCsRic(Base):
    """Rhumatismes Inflammatoires Chroniques (Inflammatory Arthritis)"""
    __tablename__ = "form_cs_ric"
    
    id = Column(Integer, primary_key=True)
    crp_value = Column(DECIMAL(10, 2))
    crp_date = Column(Date)
    esr_value = Column(DECIMAL(10, 2))
    esr_date = Column(Date)
    das28_score = Column(DECIMAL(5, 2))
    tender_joint_count = Column(Integer)
    swollen_joint_count = Column(Integer)
    morning_stiffness_duration = Column(Integer)
    affected_joints = Column(JSON)
    joint_deformity_present = Column(TINYINT, default=0)
    joint_deformity_description = Column(Text)
    fever_present = Column(TINYINT, default=0)
    fatigue_level = Column(Integer)
    weight_loss_present = Column(TINYINT, default=0)
    weight_loss_amount = Column(DECIMAL(10, 2))
    dmards_json = Column(JSON)
    biologics_json = Column(JSON)
    nsaids_json = Column(JSON)
    corticosteroids_json = Column(JSON)
    rheumatoid_factor = Column(String(50))
    anti_ccp = Column(String(50))
    ana_present = Column(TINYINT, default=0)
    treatment_adherence = Column(String(50))
    adverse_effects = Column(Text)
    treatment_response = Column(String(50))
    clinical_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FormCsOs(Base):
    """Ostéopathies Fragilisantes (Fragility Bone Disease)"""
    __tablename__ = "form_cs_os"
    
    id = Column(Integer, primary_key=True)
    dxa_date = Column(Date)
    spine_tscore = Column(DECIMAL(5, 2))
    spine_zscore = Column(DECIMAL(5, 2))
    hip_tscore = Column(DECIMAL(5, 2))
    hip_zscore = Column(DECIMAL(5, 2))
    femoral_neck_tscore = Column(DECIMAL(5, 2))
    total_body_bmd = Column(DECIMAL(5, 2))
    fracture_history_present = Column(TINYINT, default=0)
    fracture_sites = Column(JSON)
    vertebral_fracture_present = Column(TINYINT, default=0)
    vertebral_fracture_count = Column(Integer)
    frax_major_osteoporotic = Column(DECIMAL(5, 2))
    frax_hip_fracture = Column(DECIMAL(5, 2))
    risk_factors = Column(JSON)
    fall_risk = Column(String(50))
    fall_history_present = Column(TINYINT, default=0)
    fall_count_past_year = Column(Integer)
    p1np_value = Column(DECIMAL(10, 2))
    ctx_value = Column(DECIMAL(10, 2))
    p1np_date = Column(Date)
    ctx_date = Column(Date)
    calcium_level = Column(DECIMAL(10, 2))
    vitamin_d_level = Column(DECIMAL(10, 2))
    supplementation_json = Column(JSON)
    bisphosphonates_json = Column(JSON)
    hormone_therapy_json = Column(JSON)
    other_medications_json = Column(JSON)
    physical_activity = Column(String(50))
    smoking_status = Column(String(50))
    alcohol_consumption = Column(String(50))
    height_cm = Column(DECIMAL(5, 2))
    kyphosis_present = Column(TINYINT, default=0)
    back_pain_present = Column(TINYINT, default=0)
    back_pain_severity = Column(Integer)
    clinical_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FormCsEcho(Base):
    """Échographie (Ultrasound Imaging)"""
    __tablename__ = "form_cs_echo"
    
    id = Column(Integer, primary_key=True)
    echo_date = Column(Date, nullable=False)
    anatomical_region = Column(String(255), nullable=False)
    indication = Column(Text)
    machine_type = Column(String(100))
    probe_frequency = Column(String(50))
    technique_used = Column(Text)
    side_examined = Column(String(50))
    comparison_with_opposite_side = Column(TINYINT, default=0)
    synovitis_present = Column(TINYINT, default=0)
    synovitis_grade = Column(String(50))
    synovitis_description = Column(Text)
    effusion_present = Column(TINYINT, default=0)
    effusion_volume = Column(String(50))
    effusion_description = Column(Text)
    tendinopathy_present = Column(TINYINT, default=0)
    tendinopathy_sites = Column(JSON)
    tendinopathy_description = Column(Text)
    bursitis_present = Column(TINYINT, default=0)
    bursitis_sites = Column(JSON)
    bursitis_description = Column(Text)
    bone_erosions_present = Column(TINYINT, default=0)
    erosion_count = Column(Integer)
    erosion_severity = Column(String(50))
    erosion_locations = Column(JSON)
    osteophytes_present = Column(TINYINT, default=0)
    osteophyte_description = Column(Text)
    cartilage_damage_present = Column(TINYINT, default=0)
    cartilage_thinning = Column(TINYINT, default=0)
    cartilage_description = Column(Text)
    measurements_json = Column(JSON)
    doppler_performed = Column(TINYINT, default=0)
    doppler_hyperemia_present = Column(TINYINT, default=0)
    doppler_grade = Column(String(50))
    doppler_findings = Column(Text)
    primary_pathology = Column(Text)
    secondary_findings = Column(JSON)
    impression = Column(Text, nullable=False)
    recommendations = Column(Text)
    image_urls = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FormCsGeste(Base):
    """Gestes Techniques (Procedures)"""
    __tablename__ = "form_cs_geste"
    
    id = Column(Integer, primary_key=True)
    procedure_date = Column(DateTime, nullable=False)
    procedure_type = Column(String(100), nullable=False)
    anatomical_site = Column(String(255), nullable=False)
    side = Column(String(50))
    clinical_indication = Column(Text, nullable=False)
    diagnostic_purpose = Column(TINYINT, default=0)
    therapeutic_purpose = Column(TINYINT, default=0)
    guidance_method = Column(String(50))
    needle_size = Column(String(50))
    approach = Column(String(100))
    technique_notes = Column(Text)
    anesthesia_used = Column(TINYINT, default=0)
    anesthesia_type = Column(String(100))
    anesthesia_agent = Column(String(100))
    anesthesia_dose = Column(String(50))
    product_injected = Column(JSON)
    fluid_aspirated_volume = Column(DECIMAL(10, 2))
    fluid_appearance = Column(String(100))
    cell_count = Column(Integer)
    crystal_analysis = Column(Text)
    culture_done = Column(TINYINT, default=0)
    culture_organism = Column(Text)
    biopsy_sample_obtained = Column(TINYINT, default=0)
    biopsy_location_description = Column(Text)
    histology_findings = Column(Text)
    complications_present = Column(TINYINT, default=0)
    complications_json = Column(JSON)
    patient_tolerance = Column(String(50))
    pain_during_procedure = Column(Integer)
    pain_post_procedure = Column(Integer)
    swelling_post_procedure = Column(TINYINT, default=0)
    bleeding_post_procedure = Column(TINYINT, default=0)
    follow_up_recommended = Column(TINYINT, default=0)
    follow_up_instructions = Column(Text)
    clinical_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FormCsSeances(Base):
    """Séances Thérapeutiques (Therapeutic Sessions)"""
    __tablename__ = "form_cs_seances"
    
    id = Column(Integer, primary_key=True)
    session_date = Column(Date, nullable=False)
    session_start_time = Column(Time)
    session_duration = Column(Integer)
    therapist_name = Column(String(255))
    session_type = Column(String(100), nullable=False)
    modality_description = Column(Text)
    anatomical_regions = Column(JSON)
    side_treated = Column(String(50))
    frequency_hz = Column(DECIMAL(10, 2))
    intensity_level = Column(String(50))
    pulse_width_microseconds = Column(Integer)
    temperature_celsius = Column(DECIMAL(5, 1))
    duration_per_area = Column(Integer)
    pain_before_session = Column(Integer)
    pain_after_session = Column(Integer)
    pain_relief_achieved = Column(TINYINT, default=0)
    functional_improvement = Column(String(100))
    patient_comfort_level = Column(String(50))
    adverse_reactions = Column(TINYINT, default=0)
    adverse_reactions_description = Column(Text)
    swelling_before = Column(Integer)
    swelling_after = Column(Integer)
    range_of_motion_before = Column(String(255))
    range_of_motion_after = Column(String(255))
    muscle_strength_before = Column(String(50))
    muscle_strength_after = Column(String(50))
    patient_compliance = Column(String(50))
    recommendations_given = Column(Text)
    home_exercises_prescribed = Column(TINYINT, default=0)
    session_number_in_series = Column(Integer)
    total_sessions_planned = Column(Integer)
    next_session_date = Column(Date)
    progress_notes = Column(Text)
    clinical_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FormCsDxa(Base):
    """Ostéodensitométrie (DXA/DEXA Bone Density Scan)"""
    __tablename__ = "form_cs_dxa"
    
    id = Column(Integer, primary_key=True)
    scan_date = Column(Date, nullable=False)
    machine_manufacturer = Column(String(100))
    machine_model = Column(String(100))
    software_version = Column(String(50))
    scan_quality = Column(String(50))
    positioning_issues = Column(Text)
    artifacts_present = Column(TINYINT, default=0)
    artifacts_description = Column(Text)
    spine_bmd = Column(DECIMAL(5, 2))
    spine_tscore = Column(DECIMAL(5, 2))
    spine_zscore = Column(DECIMAL(5, 2))
    spine_young_adult_percent = Column(DECIMAL(5, 1))
    spine_age_matched_percent = Column(DECIMAL(5, 1))
    spine_fracture_risk = Column(String(50))
    femoral_neck_bmd = Column(DECIMAL(5, 2))
    femoral_neck_tscore = Column(DECIMAL(5, 2))
    femoral_neck_zscore = Column(DECIMAL(5, 2))
    femoral_neck_fracture_risk = Column(String(50))
    total_hip_bmd = Column(DECIMAL(5, 2))
    total_hip_tscore = Column(DECIMAL(5, 2))
    total_hip_zscore = Column(DECIMAL(5, 2))
    total_hip_fracture_risk = Column(String(50))
    forearm_scanned = Column(TINYINT, default=0)
    forearm_one_third_bmd = Column(DECIMAL(5, 2))
    forearm_one_third_tscore = Column(DECIMAL(5, 2))
    total_body_measured = Column(TINYINT, default=0)
    total_body_lean_mass = Column(DECIMAL(10, 2))
    total_body_fat_mass = Column(DECIMAL(10, 2))
    total_body_fat_percent = Column(DECIMAL(5, 1))
    vfa_performed = Column(TINYINT, default=0)
    vfa_findings = Column(Text)
    vertebral_deformities_present = Column(TINYINT, default=0)
    vertebral_deformity_count = Column(Integer)
    who_diagnosis_spine = Column(String(50))
    who_diagnosis_hip = Column(String(50))
    who_diagnosis_femoral_neck = Column(String(50))
    frax_major_fracture_probability = Column(DECIMAL(5, 2))
    frax_hip_fracture_probability = Column(DECIMAL(5, 2))
    previous_scan_date = Column(Date)
    previous_scan_spine_tscore = Column(DECIMAL(5, 2))
    previous_scan_hip_tscore = Column(DECIMAL(5, 2))
    bmd_change_spine = Column(DECIMAL(5, 2))
    bmd_change_hip = Column(DECIMAL(5, 2))
    annual_bmd_change_percent = Column(DECIMAL(5, 2))
    indication = Column(Text)
    risk_factors = Column(JSON)
    current_medications_relevant = Column(JSON)
    impression = Column(Text, nullable=False)
    recommendations = Column(Text)
    follow_up_interval = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FormCsDouleur(Base):
    """Unité de la Douleur (Pain Management Unit)"""
    __tablename__ = "form_cs_douleur"
    
    id = Column(Integer, primary_key=True)
    # SECTION 1: PAIN ASSESSMENT
    pain_locations = Column(JSON)  # Array of locations
    pain_intensity_vas = Column(Integer)  # 0-10 scale
    pain_duration = Column(String(255))  # acute/chronic description
    pain_character = Column(JSON)  # Array: sharp, dull, burning, etc.
    onset_type = Column(String(50))  # sudden/gradual
    
    # SECTION 2: PAIN HISTORY
    initial_pain_date = Column(Date)
    previous_treatments_json = Column(JSON)  # Array of {treatment, duration}
    pain_progression = Column(String(50))  # stable/worsening/improving
    
    # SECTION 3: TRIGGERING FACTORS
    aggravating_factors = Column(JSON)  # Array
    relieving_factors = Column(JSON)  # Array
    time_of_day_pattern = Column(String(255))  # better/worse description
    
    # SECTION 4: FUNCTIONAL IMPACT
    functional_limitation_score = Column(Integer)  # 0-10
    sleep_disturbance_present = Column(TINYINT, default=0)
    sleep_quality = Column(String(50))  # poor/fair/good
    work_impact = Column(Text)
    daily_activity_limitations = Column(Text)
    
    # SECTION 5: CURRENT MEDICATIONS
    analgesics_json = Column(JSON)  # Array
    nsaids_json = Column(JSON)  # Array
    other_medications_json = Column(JSON)  # Array
    
    # SECTION 6: PHYSICAL EXAM
    tender_points_locations = Column(JSON)  # Array
    range_of_motion_findings = Column(Text)
    neurological_exam_findings = Column(Text)
    
    # SECTION 7: PSYCHOSOCIAL
    anxiety_level = Column(Integer)  # 0-10
    depression_screening = Column(String(50))  # negative/mild/moderate/severe
    catastrophizing_score = Column(Integer)  # 0-52
    coping_mechanisms = Column(JSON)  # Array
    
    # SECTION 8: MANAGEMENT PLAN
    recommended_interventions = Column(JSON)  # Array
    referrals_needed = Column(JSON)  # Array
    follow_up_plan = Column(Text)
    clinical_notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
