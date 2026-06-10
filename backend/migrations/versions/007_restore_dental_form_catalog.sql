-- ============================================================================
-- Migration: Restore Dental Form Catalog for Centre Dentaire Bakraoui (dentai)
-- Date: June 10, 2026
-- Description:
--   Activates dental reference catalog and form tables; deactivates rheumatology
--   catalog entries. Form names must match FORM_COMPONENT_MAP in MedicalActForm.js.
-- ============================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

START TRANSACTION;

-- Deactivate rheumatology catalog rows.
UPDATE ref_form_types
SET is_active = 0
WHERE form_name LIKE 'form_cs_%';

UPDATE ref_act_types
SET is_active = 0
WHERE code LIKE 'CS_%'
   OR code IN ('ECHO', 'INFILT', 'SEANCE_KIN', 'DXA_MEASURE');

UPDATE ref_care_types
SET is_active = 0
WHERE code IN ('RIC', 'RD', 'OS', 'DOULEUR', 'ECHO', 'GESTE', 'SEANCES', 'DXA');

-- ────────────────────────────────────────────────────────────────────────
-- Dental form data tables (CREATE IF NOT EXISTS for fresh installs)
-- ────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS form_dent_exam (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_date DATE,
  chief_complaint TEXT,
  medical_history TEXT,
  dental_history TEXT,
  oral_hygiene VARCHAR(100),
  plaque_index VARCHAR(50),
  gingival_status VARCHAR(100),
  teeth_chart_json JSON,
  caries_findings_json JSON,
  periodontal_findings_json JSON,
  radiography_performed TINYINT DEFAULT 0,
  radiography_type VARCHAR(100),
  radiography_findings TEXT,
  diagnosis TEXT,
  recommended_treatment TEXT,
  clinical_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_dent_soin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_date DATE,
  tooth_number VARCHAR(20),
  cavity_location VARCHAR(255),
  anesthesia_type VARCHAR(100),
  material_used VARCHAR(255),
  procedure_description TEXT,
  post_op_instructions TEXT,
  clinical_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_dent_endo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_date DATE,
  tooth_number VARCHAR(20),
  diagnosis TEXT,
  pulp_test_results VARCHAR(255),
  canal_count INT,
  working_length VARCHAR(100),
  obturation_material VARCHAR(255),
  symptoms TEXT,
  clinical_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_dent_extraction (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_date DATE,
  tooth_number VARCHAR(20),
  extraction_type VARCHAR(100),
  indication TEXT,
  anesthesia_type VARCHAR(100),
  complications_present TINYINT DEFAULT 0,
  complications_description TEXT,
  post_op_care TEXT,
  clinical_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_dent_prothese (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_date DATE,
  prosthesis_type VARCHAR(100),
  material VARCHAR(255),
  shade VARCHAR(50),
  laboratory VARCHAR(255),
  impression_date DATE,
  try_in_date DATE,
  delivery_date DATE,
  clinical_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_dent_paro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_date DATE,
  probing_depths_json JSON,
  bleeding_on_probing TINYINT DEFAULT 0,
  recession_present TINYINT DEFAULT 0,
  recession_description TEXT,
  mobility_grade VARCHAR(50),
  plaque_control VARCHAR(100),
  treatment_plan TEXT,
  clinical_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_dent_plan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_date DATE,
  phases_json JSON,
  estimated_cost DECIMAL(10, 2),
  priority VARCHAR(50),
  patient_consent TINYINT DEFAULT 0,
  plan_summary TEXT,
  clinical_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activate dental care types.
INSERT INTO ref_care_types (code, label, description, is_active, display_order)
VALUES
  ('DENT_EXAM', 'Examen & Diagnostic', 'Examen clinique et diagnostic dentaire', 1, 1),
  ('DENT_SOIN', 'Soins Conservateurs', 'Soins conservateurs et obturations', 1, 2),
  ('DENT_ENDO', 'Endodontie', 'Traitements endodontiques', 1, 3),
  ('DENT_EXTRACTION', 'Extraction & Chirurgie', 'Extractions et chirurgie buccale', 1, 4),
  ('DENT_PROTHESE', 'Prothèse', 'Prothèses fixes et amovibles', 1, 5),
  ('DENT_PARO', 'Parodontologie', 'Traitements parodontaux', 1, 6),
  ('DENT_PLAN', 'Plan de Traitement', 'Planification thérapeutique globale', 1, 7)
ON DUPLICATE KEY UPDATE
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

-- Activate dental act types.
INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'DENT_EXAM_ACT', 'Examen & Diagnostic', 'Examen clinique et diagnostic dentaire', 1, 1
FROM ref_care_types WHERE code = 'DENT_EXAM'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'DENT_SOIN_ACT', 'Soins Conservateurs', 'Soins conservateurs et obturations', 1, 1
FROM ref_care_types WHERE code = 'DENT_SOIN'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'DENT_ENDO_ACT', 'Endodontie', 'Traitement endodontique', 1, 1
FROM ref_care_types WHERE code = 'DENT_ENDO'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'DENT_EXTRACTION_ACT', 'Extraction & Chirurgie', 'Extraction ou chirurgie buccale', 1, 1
FROM ref_care_types WHERE code = 'DENT_EXTRACTION'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'DENT_PROTHESE_ACT', 'Prothèse', 'Réalisation ou pose de prothèse', 1, 1
FROM ref_care_types WHERE code = 'DENT_PROTHESE'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'DENT_PARO_ACT', 'Parodontologie', 'Traitement parodontal', 1, 1
FROM ref_care_types WHERE code = 'DENT_PARO'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'DENT_PLAN_ACT', 'Plan de Traitement', 'Élaboration du plan de traitement', 1, 1
FROM ref_care_types WHERE code = 'DENT_PLAN'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

-- Activate dental form mappings.
INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_dent_exam', 'Examen & Diagnostic', 1, 1
FROM ref_act_types WHERE code = 'DENT_EXAM_ACT'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_dent_soin', 'Soins Conservateurs', 1, 1
FROM ref_act_types WHERE code = 'DENT_SOIN_ACT'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_dent_endo', 'Endodontie', 1, 1
FROM ref_act_types WHERE code = 'DENT_ENDO_ACT'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_dent_extraction', 'Extraction & Chirurgie', 1, 1
FROM ref_act_types WHERE code = 'DENT_EXTRACTION_ACT'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_dent_prothese', 'Prothèse', 1, 1
FROM ref_act_types WHERE code = 'DENT_PROTHESE_ACT'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_dent_paro', 'Parodontologie', 1, 1
FROM ref_act_types WHERE code = 'DENT_PARO_ACT'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_dent_plan', 'Plan de Traitement', 1, 1
FROM ref_act_types WHERE code = 'DENT_PLAN_ACT'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

-- Ensure any pre-existing dental rows are active.
UPDATE ref_form_types SET is_active = 1 WHERE form_name LIKE 'form_dent_%';
UPDATE ref_act_types SET is_active = 1 WHERE code LIKE 'DENT_%';
UPDATE ref_care_types SET is_active = 1 WHERE code LIKE 'DENT_%';

COMMIT;
