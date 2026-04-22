-- ============================================================================
-- Migration: Create Form Tables for All Care Types
-- Date: April 22, 2026
-- Description: Forms for RIC, OS, ECHO, GESTE, SEANCES, DXA
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────
-- 1. form_cs_ric: Consultation Rhumatismes Inflammatoires Chroniques
-- ────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_cs_ric (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- SECTION 1: INFLAMMATORY MARKERS
  crp_value DECIMAL(10, 2),  -- C-Reactive Protein (mg/L)
  crp_date DATE,
  esr_value DECIMAL(10, 2),  -- Erythrocyte Sedimentation Rate (mm/h)
  esr_date DATE,
  
  -- SECTION 2: DISEASE ACTIVITY
  das28_score DECIMAL(5, 2),  -- Disease Activity Score
  tender_joint_count INT,  -- Number of tender joints
  swollen_joint_count INT,  -- Number of swollen joints
  morning_stiffness_duration INT,  -- Duration in minutes
  
  -- SECTION 3: JOINT INVOLVEMENT
  affected_joints JSON,  -- Array of joint locations
  joint_deformity_present TINYINT DEFAULT 0,
  joint_deformity_description TEXT,
  
  -- SECTION 4: SYSTEMIC SYMPTOMS
  fever_present TINYINT DEFAULT 0,
  fatigue_level INT,  -- 1-10 scale
  weight_loss_present TINYINT DEFAULT 0,
  weight_loss_amount DECIMAL(10, 2),  -- kg
  
  -- SECTION 5: CURRENT MEDICATIONS
  dmards_json JSON,  -- Array of {name, start_date, dose, frequency}
  biologics_json JSON,  -- Array of {name, start_date, dose, frequency}
  nsaids_json JSON,  -- Array of {name, dose, frequency}
  corticosteroids_json JSON,  -- Array of {name, dose}
  
  -- SECTION 6: AUTOANTIBODIES
  rheumatoid_factor VARCHAR(50),  -- Positive/Negative/Value
  anti_ccp VARCHAR(50),  -- Positive/Negative/Value
  ana_present TINYINT DEFAULT 0,
  
  -- SECTION 7: TREATMENT RESPONSE
  treatment_adherence VARCHAR(50),  -- Excellent/Good/Fair/Poor
  adverse_effects TEXT,
  treatment_response VARCHAR(50),  -- Excellent/Good/Partial/No response
  
  -- SECTION 8: CLINICAL NOTES
  clinical_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_das28 (das28_score),
  INDEX idx_crp_date (crp_date),
  INDEX idx_esr_date (esr_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────
-- 2. form_cs_os: Consultation Ostéopathies Fragilisantes
-- ────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_cs_os (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- SECTION 1: DXA RESULTS
  dxa_date DATE,
  spine_tscore DECIMAL(5, 2),  -- T-score lumbar spine
  spine_zscore DECIMAL(5, 2),  -- Z-score lumbar spine
  hip_tscore DECIMAL(5, 2),  -- T-score total hip
  hip_zscore DECIMAL(5, 2),  -- Z-score total hip
  femoral_neck_tscore DECIMAL(5, 2),
  total_body_bmd DECIMAL(5, 2),  -- g/cm²
  
  -- SECTION 2: FRACTURE HISTORY
  fracture_history_present TINYINT DEFAULT 0,
  fracture_sites JSON,  -- Array of {site, date, cause}
  vertebral_fracture_present TINYINT DEFAULT 0,
  vertebral_fracture_count INT,
  
  -- SECTION 3: FRAX SCORE (Fracture Risk Assessment)
  frax_major_osteoporotic DECIMAL(5, 2),  -- 10-year risk %
  frax_hip_fracture DECIMAL(5, 2),  -- 10-year risk %
  
  -- SECTION 4: RISK FACTORS
  risk_factors JSON,  -- Array of {factor, value}
  fall_risk VARCHAR(50),  -- Low/Moderate/High
  fall_history_present TINYINT DEFAULT 0,
  fall_count_past_year INT,
  
  -- SECTION 5: BONE TURNOVER MARKERS
  p1np_value DECIMAL(10, 2),  -- Procollagen type I N-terminal propeptide
  ctx_value DECIMAL(10, 2),  -- C-terminal telopeptide of type I collagen
  p1np_date DATE,
  ctx_date DATE,
  
  -- SECTION 6: CALCIUM & VITAMIN D
  calcium_level DECIMAL(10, 2),  -- mg/dL
  vitamin_d_level DECIMAL(10, 2),  -- ng/mL or nmol/L
  supplementation_json JSON,  -- Array of {type, dose, frequency}
  
  -- SECTION 7: MEDICATIONS
  bisphosphonates_json JSON,
  hormone_therapy_json JSON,
  other_medications_json JSON,
  
  -- SECTION 8: LIFESTYLE
  physical_activity VARCHAR(50),  -- Sedentary/Light/Moderate/Vigorous
  smoking_status VARCHAR(50),  -- Never/Former/Current
  alcohol_consumption VARCHAR(50),  -- None/Light/Moderate/Heavy
  
  -- SECTION 9: CLINICAL ASSESSMENT
  height_cm DECIMAL(5, 2),
  kyphosis_present TINYINT DEFAULT 0,
  back_pain_present TINYINT DEFAULT 0,
  back_pain_severity INT,  -- 1-10 scale
  
  clinical_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_dxa_date (dxa_date),
  INDEX idx_hip_tscore (hip_tscore),
  INDEX idx_spine_tscore (spine_tscore)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────
-- 3. form_cs_echo: Consultation Échographie (Ultrasound)
-- ────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_cs_echo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- SECTION 1: EXAMINATION DETAILS
  echo_date DATE NOT NULL,
  anatomical_region VARCHAR(255) NOT NULL,  -- Shoulder, Knee, Hip, Ankle, etc.
  indication TEXT,  -- Clinical reason for ultrasound
  machine_type VARCHAR(100),  -- Model/type of ultrasound machine
  probe_frequency VARCHAR(50),  -- MHz
  
  -- SECTION 2: TECHNIQUE
  technique_used TEXT,  -- B-mode, Doppler, etc.
  side_examined VARCHAR(50),  -- Left/Right/Bilateral
  comparison_with_opposite_side TINYINT DEFAULT 0,
  
  -- SECTION 3: FINDINGS - SOFT TISSUES
  synovitis_present TINYINT DEFAULT 0,
  synovitis_grade VARCHAR(50),  -- Grade 0-3
  synovitis_description TEXT,
  
  effusion_present TINYINT DEFAULT 0,
  effusion_volume VARCHAR(50),  -- Small/Moderate/Large
  effusion_description TEXT,
  
  tendinopathy_present TINYINT DEFAULT 0,
  tendinopathy_sites JSON,  -- Array of tendons
  tendinopathy_description TEXT,
  
  bursitis_present TINYINT DEFAULT 0,
  bursitis_sites JSON,
  bursitis_description TEXT,
  
  -- SECTION 4: FINDINGS - BONE
  bone_erosions_present TINYINT DEFAULT 0,
  erosion_count INT,
  erosion_severity VARCHAR(50),  -- Mild/Moderate/Severe
  erosion_locations JSON,
  
  osteophytes_present TINYINT DEFAULT 0,
  osteophyte_description TEXT,
  
  cartilage_damage_present TINYINT DEFAULT 0,
  cartilage_thinning TINYINT DEFAULT 0,
  cartilage_description TEXT,
  
  -- SECTION 5: MEASUREMENTS
  measurements_json JSON,  -- Array of {structure, value, unit}
  
  -- SECTION 6: VASCULARITY (DOPPLER)
  doppler_performed TINYINT DEFAULT 0,
  doppler_hyperemia_present TINYINT DEFAULT 0,
  doppler_grade VARCHAR(50),
  doppler_findings TEXT,
  
  -- SECTION 7: PATHOLOGY SUMMARY
  primary_pathology TEXT,
  secondary_findings JSON,  -- Array of additional findings
  
  -- SECTION 8: CLINICAL IMPRESSION & RECOMMENDATIONS
  impression TEXT NOT NULL,  -- Doctor's conclusion
  recommendations TEXT,
  
  -- SECTION 9: IMAGES/ATTACHMENTS
  image_urls JSON,  -- Array of image file paths
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_echo_date (echo_date),
  INDEX idx_region (anatomical_region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────
-- 4. form_cs_geste: Consultation Gestes Techniques (Procedures)
-- ────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_cs_geste (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- SECTION 1: PROCEDURE DETAILS
  procedure_date DATETIME NOT NULL,
  procedure_type VARCHAR(100) NOT NULL,  -- Injection, Aspiration, Biopsy, etc.
  anatomical_site VARCHAR(255) NOT NULL,  -- Joint, Bursa, Tendon, etc.
  side VARCHAR(50),  -- Left/Right/Bilateral
  
  -- SECTION 2: INDICATION
  clinical_indication TEXT NOT NULL,
  diagnostic_purpose TINYINT DEFAULT 0,  -- Is it diagnostic?
  therapeutic_purpose TINYINT DEFAULT 0,  -- Is it therapeutic?
  
  -- SECTION 3: TECHNIQUE
  guidance_method VARCHAR(50),  -- Palpation/Ultrasound/Fluoroscopy
  needle_size VARCHAR(50),  -- Gauge
  approach VARCHAR(100),  -- Medial/Lateral/Anterior/Posterior
  technique_notes TEXT,
  
  -- SECTION 4: ANESTHESIA
  anesthesia_used TINYINT DEFAULT 0,
  anesthesia_type VARCHAR(100),  -- Local/Topical/Regional
  anesthesia_agent VARCHAR(100),  -- Lidocaine, etc.
  anesthesia_dose VARCHAR(50),
  
  -- SECTION 5: INJECTED PRODUCTS (if applicable)
  product_injected JSON,  -- Array of {type, name, dose, volume}
  
  -- SECTION 6: FINDINGS (Aspiration/Biopsy)
  fluid_aspirated_volume DECIMAL(10, 2),  -- mL
  fluid_appearance VARCHAR(100),  -- Clear/Turbid/Hemorrhagic/Purulent
  cell_count INT,  -- WBC count if analyzed
  crystal_analysis TEXT,
  culture_done TINYINT DEFAULT 0,
  culture_organism TEXT,
  
  biopsy_sample_obtained TINYINT DEFAULT 0,
  biopsy_location_description TEXT,
  histology_findings TEXT,
  
  -- SECTION 7: COMPLICATIONS
  complications_present TINYINT DEFAULT 0,
  complications_json JSON,  -- Array of {type, severity, management}
  
  -- SECTION 8: POST-PROCEDURE
  patient_tolerance VARCHAR(50),  -- Excellent/Good/Fair/Poor
  pain_during_procedure INT,  -- 1-10 scale
  pain_post_procedure INT,  -- 1-10 scale
  swelling_post_procedure TINYINT DEFAULT 0,
  bleeding_post_procedure TINYINT DEFAULT 0,
  
  -- SECTION 9: FOLLOW-UP
  follow_up_recommended TINYINT DEFAULT 0,
  follow_up_instructions TEXT,
  
  -- SECTION 10: CLINICAL NOTES
  clinical_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_procedure_date (procedure_date),
  INDEX idx_site (anatomical_site)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────
-- 5. form_cs_seances: Consultation Séances Thérapeutiques
-- ────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_cs_seances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- SECTION 1: SESSION DETAILS
  session_date DATE NOT NULL,
  session_start_time TIME,
  session_duration INT,  -- minutes
  therapist_name VARCHAR(255),
  
  -- SECTION 2: SESSION TYPE
  session_type VARCHAR(100) NOT NULL,  -- TENS, Cryotherapy, Heat therapy, Massage, etc.
  modality_description TEXT,
  
  -- SECTION 3: TREATMENT AREA
  anatomical_regions JSON,  -- Array of areas treated
  side_treated VARCHAR(50),  -- Left/Right/Bilateral
  
  -- SECTION 4: PARAMETERS
  frequency_hz DECIMAL(10, 2),  -- For TENS (Hz)
  intensity_level VARCHAR(50),  -- For TENS: Low/Medium/High or mA
  pulse_width_microseconds INT,  -- For TENS
  temperature_celsius DECIMAL(5, 1),  -- For cryo/heat (°C)
  duration_per_area INT,  -- minutes per region
  
  -- SECTION 5: PATIENT TOLERANCE
  pain_before_session INT,  -- 1-10 scale
  pain_after_session INT,  -- 1-10 scale
  pain_relief_achieved TINYINT DEFAULT 0,
  
  functional_improvement VARCHAR(100),  -- None/Slight/Moderate/Significant
  patient_comfort_level VARCHAR(50),  -- Poor/Fair/Good/Excellent
  adverse_reactions TINYINT DEFAULT 0,
  adverse_reactions_description TEXT,
  
  -- SECTION 6: CLINICAL RESPONSE
  swelling_before INT,  -- 1-10 scale
  swelling_after INT,  -- 1-10 scale
  range_of_motion_before VARCHAR(255),  -- Degrees or descriptive
  range_of_motion_after VARCHAR(255),
  muscle_strength_before VARCHAR(50),  -- 0-5 scale
  muscle_strength_after VARCHAR(50),
  
  -- SECTION 7: COMPLIANCE & ADHERENCE
  patient_compliance VARCHAR(50),  -- Excellent/Good/Fair/Poor
  recommendations_given TEXT,
  home_exercises_prescribed TINYINT DEFAULT 0,
  
  -- SECTION 8: PROGRESS TRACKING
  session_number_in_series INT,
  total_sessions_planned INT,
  next_session_date DATE,
  progress_notes TEXT,
  
  -- SECTION 9: CLINICAL NOTES
  clinical_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_session_date (session_date),
  INDEX idx_therapist (therapist_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────
-- 6. form_cs_dxa: Consultation Ostéodensitométrie (DXA/DEXA Scan)
-- ────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS form_cs_dxa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- SECTION 1: SCAN DETAILS
  scan_date DATE NOT NULL,
  machine_manufacturer VARCHAR(100),
  machine_model VARCHAR(100),
  software_version VARCHAR(50),
  
  -- SECTION 2: PATIENT POSITIONING & QUALITY
  scan_quality VARCHAR(50),  -- Excellent/Good/Fair/Poor
  positioning_issues TEXT,
  artifacts_present TINYINT DEFAULT 0,
  artifacts_description TEXT,
  
  -- SECTION 3: LUMBAR SPINE (L1-L4)
  spine_bmd DECIMAL(5, 2),  -- g/cm²
  spine_tscore DECIMAL(5, 2),  -- T-score
  spine_zscore DECIMAL(5, 2),  -- Z-score
  spine_young_adult_percent DECIMAL(5, 1),  -- % of young adult
  spine_age_matched_percent DECIMAL(5, 1),  -- % age-matched
  spine_fracture_risk VARCHAR(50),  -- Low/Intermediate/High
  
  -- SECTION 4: FEMORAL NECK
  femoral_neck_bmd DECIMAL(5, 2),
  femoral_neck_tscore DECIMAL(5, 2),
  femoral_neck_zscore DECIMAL(5, 2),
  femoral_neck_fracture_risk VARCHAR(50),
  
  -- SECTION 5: TOTAL HIP
  total_hip_bmd DECIMAL(5, 2),
  total_hip_tscore DECIMAL(5, 2),
  total_hip_zscore DECIMAL(5, 2),
  total_hip_fracture_risk VARCHAR(50),
  
  -- SECTION 6: FOREARM (if scanned)
  forearm_scanned TINYINT DEFAULT 0,
  forearm_one_third_bmd DECIMAL(5, 2),
  forearm_one_third_tscore DECIMAL(5, 2),
  
  -- SECTION 7: TOTAL BODY COMPOSITION (if measured)
  total_body_measured TINYINT DEFAULT 0,
  total_body_lean_mass DECIMAL(10, 2),  -- kg
  total_body_fat_mass DECIMAL(10, 2),  -- kg
  total_body_fat_percent DECIMAL(5, 1),  -- %
  
  -- SECTION 8: VERTEBRAL FRACTURE ASSESSMENT (VFA)
  vfa_performed TINYINT DEFAULT 0,
  vfa_findings TEXT,
  vertebral_deformities_present TINYINT DEFAULT 0,
  vertebral_deformity_count INT,
  
  -- SECTION 9: WHO CLASSIFICATION
  who_diagnosis_spine VARCHAR(50),  -- Normal/Osteopenia/Osteoporosis
  who_diagnosis_hip VARCHAR(50),
  who_diagnosis_femoral_neck VARCHAR(50),
  
  -- SECTION 10: FRAX SCORE (10-year fracture probability)
  frax_major_fracture_probability DECIMAL(5, 2),  -- %
  frax_hip_fracture_probability DECIMAL(5, 2),  -- %
  
  -- SECTION 11: PREVIOUS SCANS
  previous_scan_date DATE,
  previous_scan_spine_tscore DECIMAL(5, 2),
  previous_scan_hip_tscore DECIMAL(5, 2),
  bmd_change_spine DECIMAL(5, 2),  -- Change in g/cm² or %
  bmd_change_hip DECIMAL(5, 2),
  annual_bmd_change_percent DECIMAL(5, 2),  -- % per year
  
  -- SECTION 12: CLINICAL CONTEXT
  indication TEXT,
  risk_factors JSON,  -- Array of patient risk factors
  current_medications_relevant JSON,  -- Medications affecting bone
  
  -- SECTION 13: CLINICAL IMPRESSION
  impression TEXT NOT NULL,
  recommendations TEXT,
  follow_up_interval VARCHAR(50),  -- e.g., "12 months"
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_scan_date (scan_date),
  INDEX idx_spine_tscore (spine_tscore),
  INDEX idx_hip_tscore (total_hip_tscore)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────
-- 2. Update ref_form_types with new forms
-- ────────────────────────────────────────────────────────────────────────

-- Get the ref_act_type_id for each care type and insert forms
INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT ra.id, 'form_cs_ric', 'Consultation Rhumatismes Inflammatoires', 1, 1
FROM ref_act_types ra JOIN ref_care_types rc ON ra.ref_care_type_id = rc.id
WHERE rc.code = 'RIC' LIMIT 1;

INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT ra.id, 'form_cs_os', 'Consultation Ostéopathies Fragilisantes', 1, 1
FROM ref_act_types ra JOIN ref_care_types rc ON ra.ref_care_type_id = rc.id
WHERE rc.code = 'OS' LIMIT 1;

INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT ra.id, 'form_cs_echo', 'Consultation Échographie', 1, 1
FROM ref_act_types ra JOIN ref_care_types rc ON ra.ref_care_type_id = rc.id
WHERE rc.code = 'ECHO' LIMIT 1;

INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT ra.id, 'form_cs_geste', 'Consultation Gestes Techniques', 1, 1
FROM ref_act_types ra JOIN ref_care_types rc ON ra.ref_care_type_id = rc.id
WHERE rc.code = 'GESTE' LIMIT 1;

INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT ra.id, 'form_cs_seances', 'Consultation Séances Thérapeutiques', 1, 1
FROM ref_act_types ra JOIN ref_care_types rc ON ra.ref_care_type_id = rc.id
WHERE rc.code = 'SEANCES' LIMIT 1;

INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT ra.id, 'form_cs_dxa', 'Consultation Ostéodensitométrie', 1, 1
FROM ref_act_types ra JOIN ref_care_types rc ON ra.ref_care_type_id = rc.id
WHERE rc.code = 'DXA' LIMIT 1;
