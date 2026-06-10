-- ============================================================================
-- Migration: Seed Form System Reference Data
-- Date: April 17, 2026
-- Description: Populate ref_care_types, ref_act_types, and ref_form_types
-- ============================================================================

-- Clear existing data (if needed for re-seeding)
-- TRUNCATE TABLE ref_form_types;
-- TRUNCATE TABLE ref_act_types;
-- TRUNCATE TABLE ref_care_types;

-- ────────────────────────────────────────────────────────────────────────
-- 1. Seed Care Types (if not already exists)
-- ────────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO ref_care_types (code, label, description, is_active, display_order)
VALUES
  ('RIC', 'Rhumatismes Inflammatoires Chroniques', 'Consultation pour rhumatismes inflammatoires chroniques', 1, 1),
  ('RD', 'Rhumatismes Dégénératifs', 'Consultation pour rhumatismes dégénératifs (arthroses)', 1, 2),
  ('OS', 'Pathologie Osseuse', 'Consultation pour pathologies osseuses (ostéoporose, etc)', 1, 3),
  ('DOULEUR', 'Lombalgie/Cervisalgie', 'Consultation pour lombalgies et cervicalgies chroniques', 1, 4),
  ('ECHO', 'Échographie', 'Séance d\'échographie ostéo-articulaire', 1, 5),
  ('GESTE', 'Gestes Thérapeutiques', 'Infiltrations et autres gestes thérapeutiques', 1, 6),
  ('SEANCES', 'Séances de Réadaptation', 'Séances de kinésithérapie et réadaptation', 1, 7),
  ('DXA', 'Densitométrie Osseuse', 'Mesure de densité osseuse (DXA/DEXA)', 1, 8);

-- ────────────────────────────────────────────────────────────────────────
-- 2. Seed Act Types (linked to care types)
-- ────────────────────────────────────────────────────────────────────────

-- Get care type IDs dynamically
INSERT IGNORE INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'CS_RIC', 'Consultation RIC', 'Consultation Rhumatismes Inflammatoires Chroniques', 1, 1
FROM ref_care_types WHERE code = 'RIC'
LIMIT 1;

INSERT IGNORE INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'CS_RD', 'Consultation RD', 'Consultation Rhumatismes Dégénératifs', 1, 1
FROM ref_care_types WHERE code = 'RD'
LIMIT 1;

INSERT IGNORE INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'CS_OS', 'Consultation OS', 'Consultation Pathologie Osseuse', 1, 1
FROM ref_care_types WHERE code = 'OS'
LIMIT 1;

INSERT IGNORE INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'CS_DOULEUR', 'Consultation Douleur', 'Consultation Lombalgie/Cervisalgie', 1, 1
FROM ref_care_types WHERE code = 'DOULEUR'
LIMIT 1;

INSERT IGNORE INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'ECHO', 'Échographie', 'Séance d\'échographie', 1, 1
FROM ref_care_types WHERE code = 'ECHO'
LIMIT 1;

INSERT IGNORE INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'INFILT', 'Infiltration', 'Infiltration intra-articulaire', 1, 1
FROM ref_care_types WHERE code = 'GESTE'
LIMIT 1;

INSERT IGNORE INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'SEANCE_KIN', 'Séance Kinésithérapie', 'Séance de kinésithérapie', 1, 1
FROM ref_care_types WHERE code = 'SEANCES'
LIMIT 1;

INSERT IGNORE INTO ref_act_types (ref_care_type_id, code, label, description, is_active, display_order)
SELECT id, 'DXA_MEASURE', 'Mesure DXA', 'Mesure de densité osseuse', 1, 1
FROM ref_care_types WHERE code = 'DXA'
LIMIT 1;

-- ────────────────────────────────────────────────────────────────────────
-- 3. Seed Form Types (Phase 1: Only form_cs_rd for now)
-- ────────────────────────────────────────────────────────────────────────

-- Link form_cs_rd to CS_RD act type
INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_rd', 'Consultation Rhumatisme Dégénératif', 1, 1
FROM ref_act_types WHERE code = 'CS_RD'
LIMIT 1;

-- Link form_cs_ric to CS_RIC act type
INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_ric', 'Consultation Rhumatismes Inflammatoires Chroniques', 1, 1
FROM ref_act_types WHERE code = 'CS_RIC'
LIMIT 1;

-- Link form_cs_os to CS_OS act type
INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_os', 'Consultation Pathologie Osseuse', 1, 1
FROM ref_act_types WHERE code = 'CS_OS'
LIMIT 1;

-- Link form_cs_echo to ECHO act type
INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_echo', 'Séance d\'Échographie', 1, 1
FROM ref_act_types WHERE code = 'ECHO'
LIMIT 1;

-- Link form_cs_geste to INFILT act type
INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_geste', 'Infiltration Intra-Articulaire', 1, 1
FROM ref_act_types WHERE code = 'INFILT'
LIMIT 1;

-- Link form_cs_seances to SEANCE_KIN act type
INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_seances', 'Séance de Kinésithérapie', 1, 1
FROM ref_act_types WHERE code = 'SEANCE_KIN'
LIMIT 1;

-- Link form_cs_dxa to DXA_MEASURE act type
INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_dxa', 'Densitométrie Osseuse DXA', 1, 1
FROM ref_act_types WHERE code = 'DXA_MEASURE'
LIMIT 1;

-- Link form_cs_douleur to CS_DOULEUR act type
INSERT IGNORE INTO ref_form_types (ref_act_type_id, form_name, form_label, form_order, is_active)
SELECT id, 'form_cs_douleur', 'Consultation Unité de la Douleur', 1, 1
FROM ref_act_types WHERE code = 'CS_DOULEUR'
LIMIT 1;

-- ────────────────────────────────────────────────────────────────────────
-- Verification queries (run these to verify data was inserted)
-- ────────────────────────────────────────────────────────────────────────

-- SELECT * FROM ref_care_types ORDER BY id;
-- SELECT * FROM ref_act_types ORDER BY id;
-- SELECT * FROM ref_form_types ORDER BY id;
-- SELECT rct.label as care_type, rat.label as act_type, rft.form_label as form
--   FROM ref_form_types rft
--   JOIN ref_act_types rat ON rft.ref_act_type_id = rat.id
--   JOIN ref_care_types rct ON rat.ref_care_type_id = rct.id
--   ORDER BY rct.id, rat.id;
