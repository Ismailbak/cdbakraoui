-- Create form_cs_douleur table for Unité de la Douleur (Pain Management Unit)
-- Stores comprehensive pain assessment and management data

CREATE TABLE IF NOT EXISTS form_cs_douleur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Pain Assessment
    pain_locations JSON COMMENT 'Array of pain locations (e.g., cervical, lumbar)',
    pain_intensity_vas INT COMMENT 'Visual Analog Scale 0-10',
    pain_duration VARCHAR(255) COMMENT 'Duration description (e.g., chronic for 2 years)',
    pain_character JSON COMMENT 'Array of pain descriptors',
    onset_type VARCHAR(100) COMMENT 'Onset type: sudden or gradual',
    
    -- Pain History
    initial_pain_date DATE COMMENT 'Date when pain started',
    pain_progression VARCHAR(100) COMMENT 'Progression status: stable, worsening, improving',
    
    -- Triggering Factors
    aggravating_factors JSON COMMENT 'Array of factors that worsen pain',
    relieving_factors JSON COMMENT 'Array of factors that relieve pain',
    time_of_day_pattern VARCHAR(255) COMMENT 'Time of day when pain is worse',
    
    -- Functional Impact
    functional_limitation_score INT COMMENT 'Score 0-10 for functional limitation',
    sleep_disturbance_present TINYINT DEFAULT 0 COMMENT 'Does patient have sleep disturbance',
    sleep_quality VARCHAR(100) COMMENT 'Sleep quality: Good, Fair, Poor',
    work_impact LONGTEXT COMMENT 'Impact on work activities',
    daily_activity_limitations LONGTEXT COMMENT 'Limitations in daily activities',
    
    -- Medications (previously used and current)
    analgesics_json JSON COMMENT 'Array of analgesic medications',
    nsaids_json JSON COMMENT 'Array of NSAID medications',
    other_medications_json JSON COMMENT 'Array of other pain medications',
    
    -- Physical Examination Findings
    tender_points_locations JSON COMMENT 'Array of tender points found',
    range_of_motion_findings LONGTEXT COMMENT 'ROM examination findings',
    neurological_exam_findings LONGTEXT COMMENT 'Neurological examination results',
    
    -- Psychosocial Assessment
    anxiety_level INT COMMENT 'Anxiety score 0-10',
    depression_screening VARCHAR(100) COMMENT 'Depression screening result: negative, mild, moderate, severe',
    catastrophizing_score INT COMMENT 'Catastrophizing score 0-52',
    coping_mechanisms JSON COMMENT 'Array of coping strategies used by patient',
    
    -- Management Plan
    recommended_interventions JSON COMMENT 'Array of recommended interventions',
    referrals_needed JSON COMMENT 'Array of specialist referrals needed',
    follow_up_plan LONGTEXT COMMENT 'Follow-up plan description',
    clinical_notes LONGTEXT COMMENT 'Additional clinical notes',
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Unité de la Douleur - Pain Management assessment and management form';
