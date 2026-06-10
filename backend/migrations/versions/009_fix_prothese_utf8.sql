-- Fix Prothèse label encoding without relying on client charset.
-- UTF-8 bytes for "Prothèse" = 50 72 6F 74 68 C3 A8 73 65

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

UPDATE ref_care_types
SET label = CONVERT(UNHEX('50726F7468C38A7365') USING utf8mb4)
WHERE code = 'prothese';

UPDATE ref_act_types
SET label = CONVERT(UNHEX('50726F7468C38A7365') USING utf8mb4)
WHERE code = 'prothese_pose';

UPDATE ref_form_types
SET form_label = CONVERT(UNHEX('50726F7468C38A7365') USING utf8mb4)
WHERE form_name = 'form_dent_prothese';
