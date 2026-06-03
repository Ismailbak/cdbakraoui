-- ============================================================================
-- Migration: Restore Rheumatology Form Catalog
-- Date: June 3, 2026
-- Description:
--   Replaces accidental dental reference catalog entries with the rheumatology
--   care/form catalog used by the application UI and form components.
-- ============================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

START TRANSACTION;

-- Hide accidental dental catalog rows without deleting any historical data.
UPDATE ref_form_types
SET is_active = 0
WHERE form_name LIKE 'form_dent_%'
   OR form_name LIKE 'dynamic_template_%'
   OR form_label IN (
      'Examen & Diagnostic',
      'Soins Conservateurs',
      'Endodontie',
      'Extraction & Chirurgie',
      'Prothèse',
      'Parodontologie',
      'Plan de Traitement'
   );

UPDATE ref_act_types
SET is_active = 0
WHERE code LIKE 'DENT_%'
   OR code = 'dynamic_template_act'
   OR label IN (
      'Examen & Diagnostic',
      'Soins Conservateurs',
      'Endodontie',
      'Extraction & Chirurgie',
      'Prothèse',
      'Parodontologie',
      'Plan de Traitement'
   );

UPDATE ref_care_types
SET is_active = 0
WHERE code LIKE 'DENT_%'
   OR code IN ('dynamic_templates', 'prothese')
   OR label IN (
      'Examen & Diagnostic',
      'Soins Conservateurs',
      'Endodontie',
      'Extraction & Chirurgie',
      'Prothèse',
      'Parodontologie',
      'Plan de Traitement'
   );

-- Hide accidental custom dental/test templates from the personalized section.
UPDATE dynamic_form_templates
SET is_active = 0
WHERE LOWER(title) LIKE '%dent%'
   OR title IN ('Form test', 'FORM Test 2', 'FORM 3');

-- Restore rheumatology care types.
INSERT INTO ref_care_types (code, label, description, is_active, display_order)
VALUES
  ('RIC', 'Rhumatismes Inflammatoires Chroniques', 'Consultation pour rhumatismes inflammatoires chroniques', 1, 1),
  ('RD', 'Rhumatismes Dégénératifs', 'Consultation pour rhumatismes dégénératifs (arthroses)', 1, 2),
  ('OS', 'Pathologie Osseuse', 'Consultation pour pathologies osseuses (ostéoporose, etc)', 1, 3),
  ('DOULEUR', 'Lombalgie/Cervisalgie', 'Consultation pour lombalgies et cervicalgies chroniques', 1, 4),
  ('ECHO', 'Échographie', 'Séance d''échographie ostéo-articulaire', 1, 5),
  ('GESTE', 'Gestes Thérapeutiques', 'Infiltrations et autres gestes thérapeutiques', 1, 6),
  ('SEANCES', 'Séances de Réadaptation', 'Séances de kinésithérapie et réadaptation', 1, 7),
  ('DXA', 'Densitométrie Osseuse', 'Mesure de densité osseuse (DXA/DEXA)', 1, 8)
ON DUPLICATE KEY UPDATE
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

-- Restore rheumatology act types.
INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'CS_RIC', 'Consultation RIC', 'Consultation Rhumatismes Inflammatoires Chroniques', 1, 1
FROM ref_care_types WHERE code = 'RIC'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'CS_RD', 'Consultation RD', 'Consultation Rhumatismes Dégénératifs', 1, 1
FROM ref_care_types WHERE code = 'RD'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'CS_OS', 'Consultation OS', 'Consultation Pathologie Osseuse', 1, 1
FROM ref_care_types WHERE code = 'OS'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'CS_DOULEUR', 'Consultation Douleur', 'Consultation Lombalgie/Cervisalgie', 1, 1
FROM ref_care_types WHERE code = 'DOULEUR'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'ECHO', 'Échographie', 'Séance d''échographie', 1, 1
FROM ref_care_types WHERE code = 'ECHO'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'INFILT', 'Infiltration', 'Infiltration intra-articulaire', 1, 1
FROM ref_care_types WHERE code = 'GESTE'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'SEANCE_KIN', 'Séance Kinésithérapie', 'Séance de kinésithérapie', 1, 1
FROM ref_care_types WHERE code = 'SEANCES'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'DXA_MEASURE', 'Mesure DXA', 'Mesure de densité osseuse', 1, 1
FROM ref_care_types WHERE code = 'DXA'
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = VALUES(is_active),
  display_order = VALUES(display_order);

-- Restore rheumatology form mappings. These names must match FORM_COMPONENT_MAP
-- in frontend/web/src/pages/MedicalActs/MedicalActForm.js.
INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_ric', 'Consultation Rhumatismes Inflammatoires Chroniques', 1, 1
FROM ref_act_types WHERE code = 'CS_RIC'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_rd', 'Consultation Rhumatisme Dégénératif', 1, 1
FROM ref_act_types WHERE code = 'CS_RD'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_os', 'Consultation Pathologie Osseuse', 1, 1
FROM ref_act_types WHERE code = 'CS_OS'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_douleur', 'Consultation Unité de la Douleur', 1, 1
FROM ref_act_types WHERE code = 'CS_DOULEUR'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_echo', 'Séance d''Échographie', 1, 1
FROM ref_act_types WHERE code = 'ECHO'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_geste', 'Infiltration Intra-Articulaire', 1, 1
FROM ref_act_types WHERE code = 'INFILT'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_seances', 'Séance de Kinésithérapie', 1, 1
FROM ref_act_types WHERE code = 'SEANCE_KIN'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_dxa', 'Densitométrie Osseuse DXA', 1, 1
FROM ref_act_types WHERE code = 'DXA_MEASURE'
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  form_order = VALUES(form_order),
  is_active = VALUES(is_active);

COMMIT;

-- Verification:
-- SELECT code, label, is_active FROM ref_care_types ORDER BY display_order, id;
-- SELECT rct.label AS care_type, rat.label AS act_type, rft.form_name, rft.form_label
-- FROM ref_form_types rft
-- JOIN ref_act_types rat ON rft.ref_act_type_id = rat.id
-- JOIN ref_care_types rct ON rat.ref_care_type_id = rct.id
-- WHERE rct.is_active = 1 AND rat.is_active = 1 AND rft.is_active = 1
-- ORDER BY rct.display_order, rat.display_order, rft.form_order;
