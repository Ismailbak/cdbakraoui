-- ============================================================================
-- Migration: Create Dynamic Form System Tables
-- Date: April 16, 2026
-- Description: Reference catalog, form templates, and form data tables for CS_RD
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────
-- 1. Reference Tables (Catalog)
-- ────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ref_care_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  is_active TINYINT DEFAULT 1,
  display_order INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ref_act_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ref_care_type_id INT NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  is_active TINYINT DEFAULT 1,
  display_order INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ref_care_type_id) REFERENCES ref_care_types(id) ON DELETE CASCADE,
  INDEX idx_code (code),
  INDEX idx_care_type (ref_care_type_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ref_form_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ref_act_type_id INT NOT NULL,
  form_name VARCHAR(100) UNIQUE NOT NULL,
  form_label VARCHAR(255) NOT NULL,
  form_order INT DEFAULT 1,
  is_active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ref_act_type_id) REFERENCES ref_act_types(id) ON DELETE CASCADE,
  INDEX idx_form_name (form_name),
  INDEX idx_act_type (ref_act_type_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────
-- 2. Bridge Table: Links medical_acts to form data
-- ────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS act_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  act_id INT NOT NULL,
  ref_form_type_id INT NOT NULL,
  form_table_id INT NOT NULL,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (act_id) REFERENCES medical_acts(id) ON DELETE CASCADE,
  FOREIGN KEY (ref_form_type_id) REFERENCES ref_form_types(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_act_form (act_id, ref_form_type_id),
  INDEX idx_act (act_id),
  INDEX idx_form_type (ref_form_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────
-- 3. Form Data Table: form_cs_rd (Consultation Rhumatisme Dégénératif)
-- ────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS form_cs_rd (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- SECTION 1: CURRENT TREATMENT
  current_treatment_none TINYINT DEFAULT 0,
  current_treatment_json JSON,  -- Array of {type, start_date, observance, observance_reason, tolerance, tolerance_reason}
  
  -- SECTION 2: FUNCTIONAL SIGNS
  arthralgie_present TINYINT DEFAULT 0,
  arthralgie_horaire VARCHAR(50),  -- 'Mecanique', 'Inflammatoire', 'Mixte'
  arthralgie_duration VARCHAR(255),
  arthralgie_locations JSON,  -- Array of joint names
  
  joint_swelling_present TINYINT DEFAULT 0,
  joint_swelling_locations JSON,
  
  rachialgie_present TINYINT DEFAULT 0,
  rachialgie_horaire VARCHAR(50),
  rachialgie_duration VARCHAR(255),
  rachialgie_locations JSON,
  
  fessialgie_present TINYINT DEFAULT 0,
  fessialgie_horaire VARCHAR(50),
  fessialgie_duration VARCHAR(255),
  fessialgie_locations JSON,
  
  enthesalgie_present TINYINT DEFAULT 0,
  enthesalgie_locations JSON,
  
  myalgie_present TINYINT DEFAULT 0,
  myalgie_horaire VARCHAR(50),
  myalgie_duration VARCHAR(255),
  
  other_signs_text TEXT,
  
  -- SECTION 3: PHYSICAL EXAMINATION
  articular_index INT,
  synovial_index INT,
  clinical_examination_notes TEXT,
  
  -- SECTION 4: LAB RESULTS (JSON for flexibility with collapsible sections)
  lab_inflammatory_json JSON,  -- {Hb, VGM, CCMH, GB, PNN, LYM, PNE, MONO, PLQ, VS, CRP, Ferritin, Fibrinogen, EPP}
  lab_renal_json JSON,         -- {Urea, Creatinine, GFR, Proteinuria24h}
  lab_hepatic_json JSON,       -- {ASAT, ALAT, GGT, ALP}
  lab_metabolic_json JSON,     -- {CPK, Aldolase, LDH, Glycemia, HbA1c, Cholesterol, LDL, HDL, Triglycerides}
  lab_electrolytes_json JSON,  -- {Sodium, Potassium, Calcium, Phosphate, Magnesium, CO2, UA_blood, UA_urine, etc}
  lab_immunology_json JSON,    -- {FR, AntiCCP, ANA, AntiDNA, Complement, ANCA}
  lab_infection_json JSON,     -- {Blood_cultures, Procalcitonin, Urine_culture, HBsAg, AntiHCV, AntiHIV}
  
  -- SECTION 5: IMAGING
  imaging_xray TINYINT DEFAULT 0,
  imaging_xray_findings TEXT,
  imaging_ultrasound TINYINT DEFAULT 0,
  imaging_ultrasound_findings TEXT,
  imaging_ct TINYINT DEFAULT 0,
  imaging_ct_findings TEXT,
  imaging_mri TINYINT DEFAULT 0,
  imaging_mri_findings TEXT,
  imaging_other TINYINT DEFAULT 0,
  imaging_other_findings TEXT,
  
  -- SECTION 6: DIAGNOSIS
  diagnosis_osteoarthritis_json JSON,  -- Array of {joint, kellgren_lawrence_grade}
  diagnosis_spine_json JSON,           -- {discarthrose, hernia_levels, aiap, stenosis_cause, other}
  diagnosis_tendinopathy_json JSON,    -- Array of {location, type}
  diagnosis_other_text TEXT,
  
  -- SECTION 7: TREATMENT PLAN
  treatment_decision VARCHAR(50),      -- 'starting', 'maintain', 'stop'
  treatment_starting_json JSON,        -- {AASAL, analgesics, neuropathic, nsaid, local_gel, other}
  treatment_maintain_reason VARCHAR(255),
  treatment_maintain_remarks TEXT,
  treatment_stop_reason VARCHAR(255),
  treatment_stop_remarks TEXT,
  other_therapeutic_decisions TEXT,
  prescription TEXT,
  additional_notes TEXT,
  
  -- Metadata
  form_date DATE,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_form_date (form_date),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────────────────
-- 4. Seed Reference Data
-- ────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO ref_care_types (code, label, description, display_order) VALUES
('RIC', 'Rhumatismes Inflammatoires Chroniques', 'Inflammatory arthritis (RA, SpA, Sjögren, etc.)', 1),
('RD', 'Rhumatismes Dégénératifs', 'Degenerative/mechanical rheumatism (OA, spondylosis)', 2),
('OS', 'Ostéopathies Fragilisantes', 'Fragility bone disease (osteoporosis, etc.)', 3),
('DOULEUR', 'Unité de la Douleur', 'Pain management unit', 4),
('ECHO', 'Échographie', 'Ultrasound imaging', 5),
('GESTE', 'Gestes Techniques', 'Procedures (injections, aspirations, biopsies)', 6),
('SEANCES', 'Séances Thérapeutiques', 'Therapeutic sessions (TENS, cryo, etc.)', 7),
('DXA', 'Ostéodensitométrie', 'Bone density measurement', 8);

-- Act types for RD (Rhumatisme Dégénératif)
INSERT IGNORE INTO ref_act_types (ref_care_type_id, code, label, display_order) VALUES
((SELECT id FROM ref_care_types WHERE code='RD'), 'CS_RD', 'Consultation RD', 1);

-- Form types for CS_RD
INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order) VALUES
((SELECT id FROM ref_act_types WHERE code='CS_RD'), 'cs_rd', 'Consultation Rhumatisme Dégénératif', 1);

-- ============================================================================
-- END Migration
-- ============================================================================
