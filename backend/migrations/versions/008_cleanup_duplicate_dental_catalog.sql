-- ============================================================================
-- Migration: Cleanup duplicate dental catalog entries
-- Date: June 10, 2026
-- Description:
--   The dentai DB already had short care codes (exam, soin, endo, ...).
--   Migration 007 added duplicate DENT_* rows. This keeps the native short
--   codes and wires form_dent_* to act types under those care types.
-- ============================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

START TRANSACTION;

-- Deactivate duplicate DENT_* care types added by 007.
UPDATE ref_care_types
SET is_active = 0
WHERE code IN (
  'DENT_EXAM', 'DENT_SOIN', 'DENT_ENDO', 'DENT_EXTRACTION',
  'DENT_PROTHESE', 'DENT_PARO', 'DENT_PLAN'
);

-- Deactivate act types created for the duplicate DENT_* care types.
UPDATE ref_act_types
SET is_active = 0
WHERE code IN (
  'DENT_EXAM_ACT', 'DENT_SOIN_ACT', 'DENT_ENDO_ACT', 'DENT_EXTRACTION_ACT',
  'DENT_PROTHESE_ACT', 'DENT_PARO_ACT', 'DENT_PLAN_ACT'
);

-- Keep native dentai care types active and fix encoding on Prothèse.
UPDATE ref_care_types
SET is_active = 1,
    label = CASE code
      WHEN 'prothese' THEN 'Prothèse'
      ELSE label
    END
WHERE code IN ('exam', 'soin', 'endo', 'extraction', 'prothese', 'paro', 'plan');

-- Activate act types that belong to native care types.
UPDATE ref_act_types rat
JOIN ref_care_types rct ON rat.ref_care_type_id = rct.id
SET rat.is_active = 1
WHERE rct.code IN ('exam', 'soin', 'endo', 'extraction', 'prothese', 'paro', 'plan')
  AND rat.code NOT LIKE 'DENT_%';

-- Ensure each native care type has at least one act type.
INSERT INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, CONCAT(code, '_act'), label, description, 1, 1
FROM ref_care_types
WHERE code IN ('exam', 'soin', 'endo', 'extraction', 'prothese', 'paro', 'plan')
ON DUPLICATE KEY UPDATE
  ref_care_type_id = VALUES(ref_care_type_id),
  label = VALUES(label),
  description = VALUES(description),
  is_active = 1,
  display_order = VALUES(display_order);

-- Helper: re-link each dental form to the first active act type under its care type.
UPDATE ref_form_types
SET ref_act_type_id = (
    SELECT rat.id
    FROM ref_act_types rat
    JOIN ref_care_types rct ON rat.ref_care_type_id = rct.id
    WHERE rct.code = 'exam' AND rat.is_active = 1
    ORDER BY rat.display_order, rat.id
    LIMIT 1
  ),
  is_active = 1,
  form_label = 'Examen & Diagnostic'
WHERE form_name = 'form_dent_exam';

UPDATE ref_form_types
SET ref_act_type_id = (
    SELECT rat.id
    FROM ref_act_types rat
    JOIN ref_care_types rct ON rat.ref_care_type_id = rct.id
    WHERE rct.code = 'soin' AND rat.is_active = 1
    ORDER BY rat.display_order, rat.id
    LIMIT 1
  ),
  is_active = 1,
  form_label = 'Soins Conservateurs'
WHERE form_name = 'form_dent_soin';

UPDATE ref_form_types
SET ref_act_type_id = (
    SELECT rat.id
    FROM ref_act_types rat
    JOIN ref_care_types rct ON rat.ref_care_type_id = rct.id
    WHERE rct.code = 'endo' AND rat.is_active = 1
    ORDER BY rat.display_order, rat.id
    LIMIT 1
  ),
  is_active = 1,
  form_label = 'Endodontie'
WHERE form_name = 'form_dent_endo';

UPDATE ref_form_types
SET ref_act_type_id = (
    SELECT rat.id
    FROM ref_act_types rat
    JOIN ref_care_types rct ON rat.ref_care_type_id = rct.id
    WHERE rct.code = 'extraction' AND rat.is_active = 1
    ORDER BY rat.display_order, rat.id
    LIMIT 1
  ),
  is_active = 1,
  form_label = 'Extraction & Chirurgie'
WHERE form_name = 'form_dent_extraction';

UPDATE ref_form_types
SET ref_act_type_id = (
    SELECT rat.id
    FROM ref_act_types rat
    JOIN ref_care_types rct ON rat.ref_care_type_id = rct.id
    WHERE rct.code = 'prothese' AND rat.is_active = 1
    ORDER BY rat.display_order, rat.id
    LIMIT 1
  ),
  is_active = 1,
  form_label = 'Prothèse'
WHERE form_name = 'form_dent_prothese';

UPDATE ref_form_types
SET ref_act_type_id = (
    SELECT rat.id
    FROM ref_act_types rat
    JOIN ref_care_types rct ON rat.ref_care_type_id = rct.id
    WHERE rct.code = 'paro' AND rat.is_active = 1
    ORDER BY rat.display_order, rat.id
    LIMIT 1
  ),
  is_active = 1,
  form_label = 'Parodontologie'
WHERE form_name = 'form_dent_paro';

UPDATE ref_form_types
SET ref_act_type_id = (
    SELECT rat.id
    FROM ref_act_types rat
    JOIN ref_care_types rct ON rat.ref_care_type_id = rct.id
    WHERE rct.code = 'plan' AND rat.is_active = 1
    ORDER BY rat.display_order, rat.id
    LIMIT 1
  ),
  is_active = 1,
  form_label = 'Plan de Traitement'
WHERE form_name = 'form_dent_plan';

-- Create missing form mappings if they do not exist yet.
INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT rat.id, 'form_dent_exam', 'Examen & Diagnostic', 1, 1
FROM ref_care_types rct
JOIN ref_act_types rat ON rat.ref_care_type_id = rct.id AND rat.is_active = 1
WHERE rct.code = 'exam'
ORDER BY rat.display_order, rat.id
LIMIT 1
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  is_active = 1;

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT rat.id, 'form_dent_soin', 'Soins Conservateurs', 1, 1
FROM ref_care_types rct
JOIN ref_act_types rat ON rat.ref_care_type_id = rct.id AND rat.is_active = 1
WHERE rct.code = 'soin'
ORDER BY rat.display_order, rat.id
LIMIT 1
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  is_active = 1;

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT rat.id, 'form_dent_endo', 'Endodontie', 1, 1
FROM ref_care_types rct
JOIN ref_act_types rat ON rat.ref_care_type_id = rct.id AND rat.is_active = 1
WHERE rct.code = 'endo'
ORDER BY rat.display_order, rat.id
LIMIT 1
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  is_active = 1;

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT rat.id, 'form_dent_extraction', 'Extraction & Chirurgie', 1, 1
FROM ref_care_types rct
JOIN ref_act_types rat ON rat.ref_care_type_id = rct.id AND rat.is_active = 1
WHERE rct.code = 'extraction'
ORDER BY rat.display_order, rat.id
LIMIT 1
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  is_active = 1;

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT rat.id, 'form_dent_prothese', 'Prothèse', 1, 1
FROM ref_care_types rct
JOIN ref_act_types rat ON rat.ref_care_type_id = rct.id AND rat.is_active = 1
WHERE rct.code = 'prothese'
ORDER BY rat.display_order, rat.id
LIMIT 1
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  is_active = 1;

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT rat.id, 'form_dent_paro', 'Parodontologie', 1, 1
FROM ref_care_types rct
JOIN ref_act_types rat ON rat.ref_care_type_id = rct.id AND rat.is_active = 1
WHERE rct.code = 'paro'
ORDER BY rat.display_order, rat.id
LIMIT 1
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  is_active = 1;

INSERT INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT rat.id, 'form_dent_plan', 'Plan de Traitement', 1, 1
FROM ref_care_types rct
JOIN ref_act_types rat ON rat.ref_care_type_id = rct.id AND rat.is_active = 1
WHERE rct.code = 'plan'
ORDER BY rat.display_order, rat.id
LIMIT 1
ON DUPLICATE KEY UPDATE
  ref_act_type_id = VALUES(ref_act_type_id),
  form_label = VALUES(form_label),
  is_active = 1;

-- Deactivate any rheumatology forms still active.
UPDATE ref_form_types SET is_active = 0 WHERE form_name LIKE 'form_cs_%';

COMMIT;
