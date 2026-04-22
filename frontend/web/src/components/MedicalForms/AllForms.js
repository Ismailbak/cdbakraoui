import React, { useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiChevronDown, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import './AllForms.css';

/**
 * RD Form: Consultation Rhumatisme Dégénératif (Degenerative Rheumatism)
 */
export const FormCsRd = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    form_date: initialData.form_date || new Date().toISOString().split('T')[0],
    current_treatment_none: initialData.current_treatment_none || 0,
    current_treatment_json: initialData.current_treatment_json || [],
    arthralgie_present: initialData.arthralgie_present || 0,
    arthralgie_horaire: initialData.arthralgie_horaire || '',
    arthralgie_duration: initialData.arthralgie_duration || '',
    arthralgie_locations: initialData.arthralgie_locations || [],
    joint_swelling_present: initialData.joint_swelling_present || 0,
    joint_swelling_locations: initialData.joint_swelling_locations || [],
    rachialgie_present: initialData.rachialgie_present || 0,
    rachialgie_horaire: initialData.rachialgie_horaire || '',
    rachialgie_duration: initialData.rachialgie_duration || '',
    rachialgie_locations: initialData.rachialgie_locations || [],
    other_signs_text: initialData.other_signs_text || '',
    articular_index: initialData.articular_index || '',
    synovial_index: initialData.synovial_index || '',
    clinical_examination_notes: initialData.clinical_examination_notes || '',
    imaging_xray: initialData.imaging_xray || 0,
    imaging_xray_findings: initialData.imaging_xray_findings || '',
    imaging_ultrasound: initialData.imaging_ultrasound || 0,
    imaging_ultrasound_findings: initialData.imaging_ultrasound_findings || '',
    imaging_mri: initialData.imaging_mri || 0,
    imaging_mri_findings: initialData.imaging_mri_findings || '',
    diagnosis_osteoarthritis_json: initialData.diagnosis_osteoarthritis_json || [],
    diagnosis_other_text: initialData.diagnosis_other_text || '',
    treatment_decision: initialData.treatment_decision || '',
    prescription: initialData.prescription || '',
    additional_notes: initialData.additional_notes || '',
  });

  const [expandedSections, setExpandedSections] = useState({
    treatment: true,
    signs: true,
    exam: false,
    labs: false,
    imaging: false,
    diagnosis: false,
    plan: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({ ...prev, [field]: checked ? 1 : 0 }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const updated = [...(prev[field] || [])];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const handleAddArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultValue]
    }));
  };

  const handleRemoveArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <div className="form-header">
        <h2>🦴 Consultation Rhumatisme Dégénératif</h2>
        <div className="form-row" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <div className="form-group">
            <label>Date de la consultation</label>
            <input
              type="date"
              name="form_date"
              value={formData.form_date}
              onChange={(e) => handleInputChange('form_date', e.target.value)}
              className="form-input"
              style={{ maxWidth: '200px' }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: CURRENT TREATMENT */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('treatment')}>
          <FiChevronDown style={{ transform: expandedSections.treatment ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Traitement en cours</span>
        </button>
        {expandedSections.treatment && (
          <div className="section-content">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.current_treatment_none === 1}
                  onChange={(e) => handleCheckboxChange('current_treatment_none', e.target.checked)}
                />
                <span>Aucun traitement en cours</span>
              </label>
            </div>
            
            {formData.current_treatment_none === 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem', display: 'block' }}>
                  Médicaments actuels
                </label>
                {(formData.current_treatment_json || []).map((med, idx) => (
                  <div key={idx} className="form-row" style={{ alignItems: 'flex-end', marginBottom: '1rem', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 2 }}>
                      <input
                        type="text"
                        placeholder="Nom du médicament"
                        value={med.type || ''}
                        onChange={(e) => handleArrayChange('current_treatment_json', idx, { ...med, type: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input
                        type="date"
                        value={med.start_date || ''}
                        onChange={(e) => handleArrayChange('current_treatment_json', idx, { ...med, start_date: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <button
                      type="button"
                      className="maf-lab-result-remove"
                      onClick={() => handleRemoveArrayItem('current_treatment_json', idx)}
                      style={{ marginBottom: '5px', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-add"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dbeafe', color: '#1e40af', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                  onClick={() => handleAddArrayItem('current_treatment_json', { type: '', start_date: '' })}
                >
                  <FiPlus /> Ajouter un médicament
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: FUNCTIONAL SIGNS */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('signs')}>
          <FiChevronDown style={{ transform: expandedSections.signs ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Signes fonctionnels</span>
        </button>
        {expandedSections.signs && (
          <div className="section-content">
            {/* Arthralgie */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.arthralgie_present === 1}
                  onChange={(e) => handleCheckboxChange('arthralgie_present', e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>Arthralgie (Douleur articulaire)</span>
              </label>
              {formData.arthralgie_present === 1 && (
                <div className="info-box" style={{ flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group">
                      <label>Horaire</label>
                      <select
                        value={formData.arthralgie_horaire}
                        onChange={(e) => handleInputChange('arthralgie_horaire', e.target.value)}
                        className="form-input"
                      >
                        <option value="">Sélectionner</option>
                        <option value="Mecanique">Mécanique</option>
                        <option value="Inflammatoire">Inflammatoire</option>
                        <option value="Mixte">Mixte</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Durée</label>
                      <input
                        type="text"
                        placeholder="ex: 3 mois"
                        value={formData.arthralgie_duration}
                        onChange={(e) => handleInputChange('arthralgie_duration', e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Siège(s) (séparés par des virgules)</label>
                    <input
                      type="text"
                      placeholder="ex: Genoux, Hanches"
                      value={(formData.arthralgie_locations || []).join(', ')}
                      onChange={(e) => handleInputChange('arthralgie_locations', e.target.value.split(',').map(s => s.trim()))}
                      className="form-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Joint Swelling */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.joint_swelling_present === 1}
                  onChange={(e) => handleCheckboxChange('joint_swelling_present', e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>Gonflement articulaire</span>
              </label>
              {formData.joint_swelling_present === 1 && (
                <div className="info-box" style={{ background: '#f8fafc' }}>
                  <div className="form-group">
                    <label>Siège(s)</label>
                    <input
                      type="text"
                      placeholder="Localisation du gonflement..."
                      value={(formData.joint_swelling_locations || []).join(', ')}
                      onChange={(e) => handleInputChange('joint_swelling_locations', e.target.value.split(',').map(s => s.trim()))}
                      className="form-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rachialgie */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.rachialgie_present === 1}
                  onChange={(e) => handleCheckboxChange('rachialgie_present', e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>Rachialgie (Douleur du rachis)</span>
              </label>
              {formData.rachialgie_present === 1 && (
                <div className="info-box" style={{ flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group">
                      <label>Horaire</label>
                      <select
                        value={formData.rachialgie_horaire}
                        onChange={(e) => handleInputChange('rachialgie_horaire', e.target.value)}
                        className="form-input"
                      >
                        <option value="">Sélectionner</option>
                        <option value="Mecanique">Mécanique</option>
                        <option value="Inflammatoire">Inflammatoire</option>
                        <option value="Mixte">Mixte</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Siège</label>
                      <input
                        type="text"
                        placeholder="Cervical, Dorsal, Lombaire"
                        value={(formData.rachialgie_locations || []).join(', ')}
                        onChange={(e) => handleInputChange('rachialgie_locations', e.target.value.split(',').map(s => s.trim()))}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>Autres signes et observations</label>
              <textarea
                placeholder="Notes additionnelles sur les symptômes..."
                value={formData.other_signs_text}
                onChange={(e) => handleInputChange('other_signs_text', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: PHYSICAL EXAMINATION */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('exam')}>
          <FiChevronDown style={{ transform: expandedSections.exam ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Examen clinique</span>
        </button>
        {expandedSections.exam && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Indice articulaire</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.articular_index}
                  onChange={(e) => handleInputChange('articular_index', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Indice synovial</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.synovial_index}
                  onChange={(e) => handleInputChange('synovial_index', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Observations de l'examen physique</label>
              <textarea
                placeholder="Détails de l'examen clinique..."
                value={formData.clinical_examination_notes}
                onChange={(e) => handleInputChange('clinical_examination_notes', e.target.value)}
                className="form-textarea"
                rows={4}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: IMAGING */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('imaging')}>
          <FiChevronDown style={{ transform: expandedSections.imaging ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Imagerie</span>
        </button>
        {expandedSections.imaging && (
          <div className="section-content">
            {/* Radiologie */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.imaging_xray === 1}
                  onChange={(e) => handleCheckboxChange('imaging_xray', e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>Radiologie standard</span>
              </label>
              {formData.imaging_xray === 1 && (
                <textarea
                  placeholder="Résultats radiologiques..."
                  value={formData.imaging_xray_findings}
                  onChange={(e) => handleInputChange('imaging_xray_findings', e.target.value)}
                  className="form-textarea"
                  style={{ marginTop: '0.5rem' }}
                  rows={2}
                />
              )}
            </div>

            {/* Ultrasound */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.imaging_ultrasound === 1}
                  onChange={(e) => handleCheckboxChange('imaging_ultrasound', e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>Échographie</span>
              </label>
              {formData.imaging_ultrasound === 1 && (
                <textarea
                  placeholder="Résultats échographiques..."
                  value={formData.imaging_ultrasound_findings}
                  onChange={(e) => handleInputChange('imaging_ultrasound_findings', e.target.value)}
                  className="form-textarea"
                  style={{ marginTop: '0.5rem' }}
                  rows={2}
                />
              )}
            </div>

            {/* MRI */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.imaging_mri === 1}
                  onChange={(e) => handleCheckboxChange('imaging_mri', e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>IRM / Scanner</span>
              </label>
              {formData.imaging_mri === 1 && (
                <textarea
                  placeholder="Résultats IRM ou Scanner..."
                  value={formData.imaging_mri_findings}
                  onChange={(e) => handleInputChange('imaging_mri_findings', e.target.value)}
                  className="form-textarea"
                  style={{ marginTop: '0.5rem' }}
                  rows={2}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: DIAGNOSIS */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('diagnosis')}>
          <FiChevronDown style={{ transform: expandedSections.diagnosis ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Diagnostic</span>
        </button>
        {expandedSections.diagnosis && (
          <div className="section-content">
            <div className="form-group">
              <label>Arthrose - Détails et Localisations</label>
              {(formData.diagnosis_osteoarthritis_json || []).map((dx, idx) => (
                <div key={idx} className="form-row" style={{ alignItems: 'flex-end', marginBottom: '1rem', gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <input
                      type="text"
                      placeholder="Articulation (ex: Genou droit)"
                      value={dx.joint || ''}
                      onChange={(e) => handleArrayChange('diagnosis_osteoarthritis_json', idx, { ...dx, joint: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <select 
                      value={dx.grade || ''} 
                      onChange={(e) => handleArrayChange('diagnosis_osteoarthritis_json', idx, { ...dx, grade: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Grade K&L</option>
                      <option value="1">I</option>
                      <option value="2">II</option>
                      <option value="3">III</option>
                      <option value="4">IV</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    className="maf-lab-result-remove"
                    onClick={() => handleRemoveArrayItem('diagnosis_osteoarthritis_json', idx)}
                    style={{ marginBottom: '5px', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-add"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dbeafe', color: '#1e40af', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                onClick={() => handleAddArrayItem('diagnosis_osteoarthritis_json', { joint: '', grade: '' })}
              >
                <FiPlus /> Ajouter un diagnostic d'arthrose
              </button>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label>Autres diagnostics et impressions</label>
              <textarea
                placeholder="Autres diagnostics..."
                value={formData.diagnosis_other_text}
                onChange={(e) => handleInputChange('diagnosis_other_text', e.target.value)}
                className="form-textarea"
                rows={4}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: TREATMENT PLAN */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('plan')}>
          <FiChevronDown style={{ transform: expandedSections.plan ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Conduite à tenir</span>
        </button>
        {expandedSections.plan && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Décision thérapeutique</label>
                <select
                  value={formData.treatment_decision}
                  onChange={(e) => handleInputChange('treatment_decision', e.target.value)}
                  className="form-input"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="starting">Démarrage d'un traitement</option>
                  <option value="maintain">Maintien du traitement</option>
                  <option value="stop">Arrêt du traitement</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Prescription</label>
              <textarea
                placeholder="Détails de la prescription (médicaments, doses, durée)..."
                value={formData.prescription}
                onChange={(e) => handleInputChange('prescription', e.target.value)}
                className="form-textarea"
                rows={4}
              />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Conseils et suivi</label>
              <textarea
                placeholder="Notes additionnelles et conseils donnés au patient..."
                value={formData.additional_notes}
                onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT */}
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          <FiCheckCircle /> Enregistrer le formulaire
        </button>
      </div>
    </form>
  );
};

/**
 * RIC Form: Rhumatismes Inflammatoires Chroniques (Inflammatory Arthritis)
 */
export const FormCsRic = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    crp_value: initialData.crp_value || '',
    crp_date: initialData.crp_date || '',
    esr_value: initialData.esr_value || '',
    esr_date: initialData.esr_date || '',
    das28_score: initialData.das28_score || '',
    tender_joint_count: initialData.tender_joint_count || '',
    swollen_joint_count: initialData.swollen_joint_count || '',
    morning_stiffness_duration: initialData.morning_stiffness_duration || '',
    affected_joints: initialData.affected_joints || [],
    fever_present: initialData.fever_present || false,
    fatigue_level: initialData.fatigue_level || 5,
    dmards_json: initialData.dmards_json || [],
    biologics_json: initialData.biologics_json || [],
    treatment_response: initialData.treatment_response || 'Partial',
    clinical_notes: initialData.clinical_notes || '',
  });

  const [expandedSections, setExpandedSections] = useState({
    markers: true,
    activity: true,
    joints: false,
    symptoms: false,
    medications: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <div className="form-header">
        <h2>🔴 Consultation Rhumatismes Inflammatoires Chroniques</h2>
        <p>Évaluation complète de l'arthrite inflammatoire</p>
      </div>

      {/* SECTION 1: INFLAMMATORY MARKERS */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('markers')}
        >
          <FiChevronDown style={{ transform: expandedSections.markers ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Marqueurs Inflammatoires</span>
        </button>
        
        {expandedSections.markers && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>CRP (C-Reactive Protein) - mg/L</label>
                <input 
                  type="number" 
                  step="0.1"
                  name="crp_value" 
                  value={formData.crp_value}
                  onChange={handleInputChange}
                  placeholder="0.0"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Date du dosage CRP</label>
                <input 
                  type="date" 
                  name="crp_date" 
                  value={formData.crp_date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>VSH (Erythrocyte Sedimentation Rate) - mm/h</label>
                <input 
                  type="number" 
                  step="0.1"
                  name="esr_value" 
                  value={formData.esr_value}
                  onChange={handleInputChange}
                  placeholder="0.0"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Date du dosage VSH</label>
                <input 
                  type="date" 
                  name="esr_date" 
                  value={formData.esr_date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: DISEASE ACTIVITY */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('activity')}
        >
          <FiChevronDown style={{ transform: expandedSections.activity ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Activité de la Maladie</span>
        </button>
        
        {expandedSections.activity && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Score DAS28</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="das28_score" 
                  value={formData.das28_score}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="form-input"
                  min="0"
                  max="10"
                />
              </div>
              <div className="form-group">
                <label>Nombre d'articulations sensibles</label>
                <input 
                  type="number" 
                  name="tender_joint_count" 
                  value={formData.tender_joint_count}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="form-input"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Nombre d'articulations gonflées</label>
                <input 
                  type="number" 
                  name="swollen_joint_count" 
                  value={formData.swollen_joint_count}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="form-input"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Durée de la raideur matinale - minutes</label>
              <input 
                type="number" 
                name="morning_stiffness_duration" 
                value={formData.morning_stiffness_duration}
                onChange={handleInputChange}
                placeholder="30"
                className="form-input"
                min="0"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: SYSTEMIC SYMPTOMS */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('symptoms')}
        >
          <FiChevronDown style={{ transform: expandedSections.symptoms ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Symptômes Systémiques</span>
        </button>
        
        {expandedSections.symptoms && (
          <div className="section-content">
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="fever_present" 
                  checked={formData.fever_present}
                  onChange={handleInputChange}
                />
                <span>Fièvre présente</span>
              </label>
            </div>

            <div className="form-group">
              <label>Niveau de fatigue (1-10)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  name="fatigue_level" 
                  value={formData.fatigue_level}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="slider"
                />
                <span className="slider-value">{formData.fatigue_level}/10</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: MEDICATIONS */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('medications')}
        >
          <FiChevronDown style={{ transform: expandedSections.medications ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Traitements</span>
        </button>
        
        {expandedSections.medications && (
          <div className="section-content">
            <div className="form-group">
              <label>Réponse au traitement</label>
              <select 
                name="treatment_response" 
                value={formData.treatment_response}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Excellent">Excellente</option>
                <option value="Good">Bonne</option>
                <option value="Partial">Partielle</option>
                <option value="None">Absence de réponse</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* NOTES */}
      <div className="form-section">
        <label>Notes Cliniques</label>
        <textarea 
          name="clinical_notes" 
          value={formData.clinical_notes}
          onChange={handleInputChange}
          placeholder="Observations cliniques importantes..."
          className="form-textarea"
          rows="4"
        />
      </div>

      {/* SUBMIT */}
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          <FiCheckCircle /> Enregistrer le formulaire
        </button>
      </div>
    </form>
  );
};

/**
 * OS Form: Ostéopathies Fragilisantes (Fragility Bone Disease)
 */
export const FormCsOs = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    dxa_date: initialData.dxa_date || '',
    spine_tscore: initialData.spine_tscore || '',
    hip_tscore: initialData.hip_tscore || '',
    femoral_neck_tscore: initialData.femoral_neck_tscore || '',
    fracture_history_present: initialData.fracture_history_present || false,
    vertebral_fracture_present: initialData.vertebral_fracture_present || false,
    frax_major_osteoporotic: initialData.frax_major_osteoporotic || '',
    frax_hip_fracture: initialData.frax_hip_fracture || '',
    fall_risk: initialData.fall_risk || 'Moderate',
    vitamin_d_level: initialData.vitamin_d_level || '',
    physical_activity: initialData.physical_activity || 'Moderate',
    back_pain_present: initialData.back_pain_present || false,
    back_pain_severity: initialData.back_pain_severity || 5,
    clinical_notes: initialData.clinical_notes || '',
  });

  const [expandedSections, setExpandedSections] = useState({
    dxa: true,
    fractures: true,
    risk: false,
    vitamin: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <div className="form-header">
        <h2>🦴 Consultation Ostéopathies Fragilisantes</h2>
        <p>Évaluation de la santé osseuse et du risque de fracture</p>
      </div>

      {/* SECTION 1: DXA RESULTS */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('dxa')}
        >
          <FiChevronDown style={{ transform: expandedSections.dxa ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Résultats DXA</span>
        </button>
        
        {expandedSections.dxa && (
          <div className="section-content">
            <div className="form-group">
              <label>Date de l'examen DXA</label>
              <input 
                type="date" 
                name="dxa_date" 
                value={formData.dxa_date}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>T-score Colonne lombaire</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="spine_tscore" 
                  value={formData.spine_tscore}
                  onChange={handleInputChange}
                  placeholder="-1.5"
                  className="form-input"
                />
                <small className="help-text">Normal: &gt; -1.0 | Ostéopénie: -1.0 à -2.5 | Ostéoporose: &lt; -2.5</small>
              </div>
              <div className="form-group">
                <label>T-score Hanche totale</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="hip_tscore" 
                  value={formData.hip_tscore}
                  onChange={handleInputChange}
                  placeholder="-1.5"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>T-score Col fémoral</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="femoral_neck_tscore" 
                  value={formData.femoral_neck_tscore}
                  onChange={handleInputChange}
                  placeholder="-1.5"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: FRACTURE HISTORY */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('fractures')}
        >
          <FiChevronDown style={{ transform: expandedSections.fractures ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Historique de Fractures</span>
        </button>
        
        {expandedSections.fractures && (
          <div className="section-content">
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="fracture_history_present" 
                  checked={formData.fracture_history_present}
                  onChange={handleInputChange}
                />
                <span>Antécédent de fracture</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="vertebral_fracture_present" 
                  checked={formData.vertebral_fracture_present}
                  onChange={handleInputChange}
                />
                <span>Fracture vertébrale présente</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: FRAX & RISK */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('risk')}
        >
          <FiChevronDown style={{ transform: expandedSections.risk ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Score FRAX & Évaluation du Risque</span>
        </button>
        
        {expandedSections.risk && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Probabilité FRAX fracture majeure - %</label>
                <input 
                  type="number" 
                  step="0.1"
                  name="frax_major_osteoporotic" 
                  value={formData.frax_major_osteoporotic}
                  onChange={handleInputChange}
                  placeholder="15.2"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Probabilité FRAX fracture de la hanche - %</label>
                <input 
                  type="number" 
                  step="0.1"
                  name="frax_hip_fracture" 
                  value={formData.frax_hip_fracture}
                  onChange={handleInputChange}
                  placeholder="5.0"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Risque de chute</label>
              <select 
                name="fall_risk" 
                value={formData.fall_risk}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Low">Faible</option>
                <option value="Moderate">Modéré</option>
                <option value="High">Élevé</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: VITAMIN D */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('vitamin')}
        >
          <FiChevronDown style={{ transform: expandedSections.vitamin ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Vitamine D & Activité</span>
        </button>
        
        {expandedSections.vitamin && (
          <div className="section-content">
            <div className="form-group">
              <label>Niveau de Vitamine D - ng/mL</label>
              <input 
                type="number" 
                step="0.1"
                name="vitamin_d_level" 
                value={formData.vitamin_d_level}
                onChange={handleInputChange}
                placeholder="25.0"
                className="form-input"
              />
              <small className="help-text">Idéal: 30-100 ng/mL | Insuffisant: &lt; 20 ng/mL</small>
            </div>

            <div className="form-group">
              <label>Activité physique</label>
              <select 
                name="physical_activity" 
                value={formData.physical_activity}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Sedentary">Sédentaire</option>
                <option value="Light">Légère</option>
                <option value="Moderate">Modérée</option>
                <option value="Vigorous">Vigoreuse</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* PAIN ASSESSMENT */}
      <div className="form-section">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="back_pain_present" 
            checked={formData.back_pain_present}
            onChange={handleInputChange}
          />
          <span>Douleur dorsale présente</span>
        </label>

        {formData.back_pain_present && (
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Sévérité de la douleur (1-10)</label>
            <div className="slider-container">
              <input 
                type="range" 
                name="back_pain_severity" 
                value={formData.back_pain_severity}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="slider"
              />
              <span className="slider-value">{formData.back_pain_severity}/10</span>
            </div>
          </div>
        )}
      </div>

      {/* NOTES */}
      <div className="form-section">
        <label>Notes Cliniques</label>
        <textarea 
          name="clinical_notes" 
          value={formData.clinical_notes}
          onChange={handleInputChange}
          placeholder="Observations importantes..."
          className="form-textarea"
          rows="4"
        />
      </div>

      {/* SUBMIT */}
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          <FiCheckCircle /> Enregistrer le formulaire
        </button>
      </div>
    </form>
  );
};

/**
 * ECHO Form: Consultation Échographie (Ultrasound)
 */
export const FormCsEcho = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    echo_date: initialData.echo_date || '',
    anatomical_region: initialData.anatomical_region || 'Shoulder',
    indication: initialData.indication || '',
    side_examined: initialData.side_examined || 'Right',
    synovitis_present: initialData.synovitis_present || false,
    synovitis_grade: initialData.synovitis_grade || '0',
    effusion_present: initialData.effusion_present || false,
    effusion_volume: initialData.effusion_volume || 'None',
    bone_erosions_present: initialData.bone_erosions_present || false,
    doppler_performed: initialData.doppler_performed || false,
    doppler_hyperemia_present: initialData.doppler_hyperemia_present || false,
    impression: initialData.impression || '',
    recommendations: initialData.recommendations || '',
  });

  const [expandedSections, setExpandedSections] = useState({
    general: true,
    findings: true,
    doppler: false,
    impression: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <div className="form-header">
        <h2>🔊 Consultation Échographie (Ultrasound)</h2>
        <p>Évaluation par imagerie ultrasonore</p>
      </div>

      {/* SECTION 1: GENERAL */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('general')}
        >
          <FiChevronDown style={{ transform: expandedSections.general ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Informations Générales</span>
        </button>
        
        {expandedSections.general && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Date de l'examen</label>
                <input 
                  type="date" 
                  name="echo_date" 
                  value={formData.echo_date}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Région anatomique</label>
                <select 
                  name="anatomical_region" 
                  value={formData.anatomical_region}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Shoulder">Épaule</option>
                  <option value="Knee">Genou</option>
                  <option value="Hip">Hanche</option>
                  <option value="Ankle">Cheville</option>
                  <option value="Wrist">Poignet</option>
                  <option value="Elbow">Coude</option>
                  <option value="Foot">Pied</option>
                  <option value="Other">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Côté examiné</label>
                <select 
                  name="side_examined" 
                  value={formData.side_examined}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Right">Droit</option>
                  <option value="Left">Gauche</option>
                  <option value="Bilateral">Bilatéral</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Indication clinique</label>
              <textarea 
                name="indication" 
                value={formData.indication}
                onChange={handleInputChange}
                placeholder="Raison de l'examen..."
                className="form-textarea"
                rows="2"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: FINDINGS */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('findings')}
        >
          <FiChevronDown style={{ transform: expandedSections.findings ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Résultats et Constatations</span>
        </button>
        
        {expandedSections.findings && (
          <div className="section-content">
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="synovitis_present" 
                  checked={formData.synovitis_present}
                  onChange={handleInputChange}
                />
                <span>Synovite présente</span>
              </label>
              {formData.synovitis_present && (
                <select 
                  name="synovitis_grade" 
                  value={formData.synovitis_grade}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ marginTop: '0.75rem' }}
                >
                  <option value="0">Grade 0 - Absent</option>
                  <option value="1">Grade 1 - Faible</option>
                  <option value="2">Grade 2 - Modéré</option>
                  <option value="3">Grade 3 - Sévère</option>
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="effusion_present" 
                  checked={formData.effusion_present}
                  onChange={handleInputChange}
                />
                <span>Épanchement présent</span>
              </label>
              {formData.effusion_present && (
                <select 
                  name="effusion_volume" 
                  value={formData.effusion_volume}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ marginTop: '0.75rem' }}
                >
                  <option value="Small">Petit</option>
                  <option value="Moderate">Modéré</option>
                  <option value="Large">Important</option>
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="bone_erosions_present" 
                  checked={formData.bone_erosions_present}
                  onChange={handleInputChange}
                />
                <span>Érosions osseuses présentes</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: DOPPLER */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('doppler')}
        >
          <FiChevronDown style={{ transform: expandedSections.doppler ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Doppler Couleur</span>
        </button>
        
        {expandedSections.doppler && (
          <div className="section-content">
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="doppler_performed" 
                  checked={formData.doppler_performed}
                  onChange={handleInputChange}
                />
                <span>Doppler effectué</span>
              </label>
            </div>

            {formData.doppler_performed && (
              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="doppler_hyperemia_present" 
                    checked={formData.doppler_hyperemia_present}
                    onChange={handleInputChange}
                  />
                  <span>Hyperhémie détectée</span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 4: IMPRESSION */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('impression')}
        >
          <FiChevronDown style={{ transform: expandedSections.impression ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Conclusion et Recommandations</span>
        </button>
        
        {expandedSections.impression && (
          <div className="section-content">
            <div className="form-group">
              <label>Conclusion clinique *</label>
              <textarea 
                name="impression" 
                value={formData.impression}
                onChange={handleInputChange}
                placeholder="Résumé des constatations et conclusion..."
                className="form-textarea"
                required
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Recommandations</label>
              <textarea 
                name="recommendations" 
                value={formData.recommendations}
                onChange={handleInputChange}
                placeholder="Recommandations pour le suivi..."
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT */}
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          <FiCheckCircle /> Enregistrer le formulaire
        </button>
      </div>
    </form>
  );
};

/**
 * GESTE Form: Consultation Gestes Techniques (Procedures)
 */
export const FormCsGeste = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    procedure_date: initialData.procedure_date || '',
    procedure_type: initialData.procedure_type || 'Injection',
    anatomical_site: initialData.anatomical_site || '',
    side: initialData.side || 'Right',
    clinical_indication: initialData.clinical_indication || '',
    guidance_method: initialData.guidance_method || 'Palpation',
    anesthesia_used: initialData.anesthesia_used || false,
    product_injected: initialData.product_injected || '',
    fluid_aspirated_volume: initialData.fluid_aspirated_volume || '',
    patient_tolerance: initialData.patient_tolerance || 'Good',
    pain_during_procedure: initialData.pain_during_procedure || 5,
    complications_present: initialData.complications_present || false,
    follow_up_recommended: initialData.follow_up_recommended || false,
    clinical_notes: initialData.clinical_notes || '',
  });

  const [expandedSections, setExpandedSections] = useState({
    procedure: true,
    technique: true,
    findings: false,
    complications: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <div className="form-header">
        <h2>💉 Consultation Gestes Techniques</h2>
        <p>Documentation complète des procédures interventionnelles</p>
      </div>

      {/* SECTION 1: PROCEDURE */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('procedure')}
        >
          <FiChevronDown style={{ transform: expandedSections.procedure ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Détails de la Procédure</span>
        </button>
        
        {expandedSections.procedure && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Date et heure</label>
                <input 
                  type="datetime-local" 
                  name="procedure_date" 
                  value={formData.procedure_date}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Type de procédure</label>
                <select 
                  name="procedure_type" 
                  value={formData.procedure_type}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Injection">Injection intra-articulaire</option>
                  <option value="Aspiration">Aspiration</option>
                  <option value="Biopsy">Biopsie</option>
                  <option value="Infiltration">Infiltration</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Site anatomique *</label>
                <input 
                  type="text" 
                  name="anatomical_site" 
                  value={formData.anatomical_site}
                  onChange={handleInputChange}
                  placeholder="ex: Genou droit, Épaule gauche..."
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Côté</label>
                <select 
                  name="side" 
                  value={formData.side}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Right">Droit</option>
                  <option value="Left">Gauche</option>
                  <option value="Bilateral">Bilatéral</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Indication clinique *</label>
              <textarea 
                name="clinical_indication" 
                value={formData.clinical_indication}
                onChange={handleInputChange}
                placeholder="Raison de la procédure..."
                className="form-textarea"
                required
                rows="2"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: TECHNIQUE */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('technique')}
        >
          <FiChevronDown style={{ transform: expandedSections.technique ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Technique et Produits</span>
        </button>
        
        {expandedSections.technique && (
          <div className="section-content">
            <div className="form-group">
              <label>Méthode de guidage</label>
              <select 
                name="guidance_method" 
                value={formData.guidance_method}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Palpation">Palpation</option>
                <option value="Ultrasound">Échographie</option>
                <option value="Fluoroscopy">Radioscopie</option>
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="anesthesia_used" 
                  checked={formData.anesthesia_used}
                  onChange={handleInputChange}
                />
                <span>Anesthésie utilisée</span>
              </label>
            </div>

            <div className="form-group">
              <label>Produit injecté</label>
              <input 
                type="text" 
                name="product_injected" 
                value={formData.product_injected}
                onChange={handleInputChange}
                placeholder="ex: Acide hyaluronique, Corticoïde..."
                className="form-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: FINDINGS */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('findings')}
        >
          <FiChevronDown style={{ transform: expandedSections.findings ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Résultats et Aspirats</span>
        </button>
        
        {expandedSections.findings && (
          <div className="section-content">
            <div className="form-group">
              <label>Volume de liquide aspiré - mL</label>
              <input 
                type="number" 
                step="0.5"
                name="fluid_aspirated_volume" 
                value={formData.fluid_aspirated_volume}
                onChange={handleInputChange}
                placeholder="0.0"
                className="form-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: COMPLICATIONS & TOLERANCE */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('complications')}
        >
          <FiChevronDown style={{ transform: expandedSections.complications ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Tolérance et Complications</span>
        </button>
        
        {expandedSections.complications && (
          <div className="section-content">
            <div className="form-group">
              <label>Tolérance du patient</label>
              <select 
                name="patient_tolerance" 
                value={formData.patient_tolerance}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Excellent">Excellente</option>
                <option value="Good">Bonne</option>
                <option value="Fair">Acceptable</option>
                <option value="Poor">Mauvaise</option>
              </select>
            </div>

            <div className="form-group">
              <label>Douleur pendant la procédure (1-10)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  name="pain_during_procedure" 
                  value={formData.pain_during_procedure}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="slider"
                />
                <span className="slider-value">{formData.pain_during_procedure}/10</span>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="complications_present" 
                  checked={formData.complications_present}
                  onChange={handleInputChange}
                />
                <span>Complications présentes</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="follow_up_recommended" 
                  checked={formData.follow_up_recommended}
                  onChange={handleInputChange}
                />
                <span>Suivi recommandé</span>
              </label>
            </div>

            <div className="form-group">
              <label>Notes cliniques</label>
              <textarea 
                name="clinical_notes" 
                value={formData.clinical_notes}
                onChange={handleInputChange}
                placeholder="Observations importantes..."
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT */}
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          <FiCheckCircle /> Enregistrer le formulaire
        </button>
      </div>
    </form>
  );
};

/**
 * SEANCES Form: Consultation Séances Thérapeutiques
 */
export const FormCsSeances = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    session_date: initialData.session_date || '',
    session_duration: initialData.session_duration || '30',
    therapist_name: initialData.therapist_name || '',
    session_type: initialData.session_type || 'TENS',
    anatomical_regions: initialData.anatomical_regions || '',
    pain_before_session: initialData.pain_before_session || 5,
    pain_after_session: initialData.pain_after_session || 3,
    functional_improvement: initialData.functional_improvement || 'None',
    patient_comfort_level: initialData.patient_comfort_level || 'Good',
    patient_compliance: initialData.patient_compliance || 'Good',
    session_number_in_series: initialData.session_number_in_series || '1',
    progress_notes: initialData.progress_notes || '',
  });

  const [expandedSections, setExpandedSections] = useState({
    session: true,
    parameters: true,
    assessment: false,
    progress: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <div className="form-header">
        <h2>⚡ Consultation Séances Thérapeutiques</h2>
        <p>Suivi des séances de physiothérapie et rééducation</p>
      </div>

      {/* SECTION 1: SESSION DETAILS */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('session')}
        >
          <FiChevronDown style={{ transform: expandedSections.session ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Détails de la Séance</span>
        </button>
        
        {expandedSections.session && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Date de la séance</label>
                <input 
                  type="date" 
                  name="session_date" 
                  value={formData.session_date}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Durée - minutes</label>
                <input 
                  type="number" 
                  name="session_duration" 
                  value={formData.session_duration}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Numéro de séance</label>
                <input 
                  type="number" 
                  name="session_number_in_series" 
                  value={formData.session_number_in_series}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nom du thérapeute</label>
                <input 
                  type="text" 
                  name="therapist_name" 
                  value={formData.therapist_name}
                  onChange={handleInputChange}
                  placeholder="Nom complet..."
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Type de séance</label>
                <select 
                  name="session_type" 
                  value={formData.session_type}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="TENS">TENS (électrostimulation)</option>
                  <option value="Cryotherapy">Cryothérapie (froid)</option>
                  <option value="Heat">Thermothérapie (chaleur)</option>
                  <option value="Massage">Massage thérapeutique</option>
                  <option value="Stretching">Étirements</option>
                  <option value="Strengthening">Renforcement musculaire</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Régions traitées</label>
              <input 
                type="text" 
                name="anatomical_regions" 
                value={formData.anatomical_regions}
                onChange={handleInputChange}
                placeholder="ex: Épaule gauche, Genou droit..."
                className="form-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PARAMETERS */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('parameters')}
        >
          <FiChevronDown style={{ transform: expandedSections.parameters ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Paramètres de Traitement</span>
        </button>
        
        {expandedSections.parameters && (
          <div className="section-content">
            <div className="info-box">
              <FiAlertCircle />
              <span>Remplir selon le type de séance sélectionné</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: CLINICAL ASSESSMENT */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('assessment')}
        >
          <FiChevronDown style={{ transform: expandedSections.assessment ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Évaluation Clinique</span>
        </button>
        
        {expandedSections.assessment && (
          <div className="section-content">
            <div className="form-group">
              <label>Douleur avant la séance (1-10)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  name="pain_before_session" 
                  value={formData.pain_before_session}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="slider"
                />
                <span className="slider-value">{formData.pain_before_session}/10</span>
              </div>
            </div>

            <div className="form-group">
              <label>Douleur après la séance (1-10)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  name="pain_after_session" 
                  value={formData.pain_after_session}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="slider"
                />
                <span className="slider-value">{formData.pain_after_session}/10</span>
              </div>
            </div>

            <div className="form-group">
              <label>Amélioration fonctionnelle</label>
              <select 
                name="functional_improvement" 
                value={formData.functional_improvement}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="None">Aucune</option>
                <option value="Slight">Légère</option>
                <option value="Moderate">Modérée</option>
                <option value="Significant">Importante</option>
              </select>
            </div>

            <div className="form-group">
              <label>Confort du patient</label>
              <select 
                name="patient_comfort_level" 
                value={formData.patient_comfort_level}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Poor">Mauvais</option>
                <option value="Fair">Acceptable</option>
                <option value="Good">Bon</option>
                <option value="Excellent">Excellent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Adhérence du patient</label>
              <select 
                name="patient_compliance" 
                value={formData.patient_compliance}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Poor">Mauvaise</option>
                <option value="Fair">Acceptable</option>
                <option value="Good">Bonne</option>
                <option value="Excellent">Excellente</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: PROGRESS */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('progress')}
        >
          <FiChevronDown style={{ transform: expandedSections.progress ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Notes de Progression</span>
        </button>
        
        {expandedSections.progress && (
          <div className="section-content">
            <div className="form-group">
              <label>Observations et progression</label>
              <textarea 
                name="progress_notes" 
                value={formData.progress_notes}
                onChange={handleInputChange}
                placeholder="Observez la progression du patient, les réactions, les améliorations..."
                className="form-textarea"
                rows="4"
              />
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT */}
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          <FiCheckCircle /> Enregistrer le formulaire
        </button>
      </div>
    </form>
  );
};

/**
 * DXA Form: Consultation Ostéodensitométrie
 */
export const FormCsDxa = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    scan_date: initialData.scan_date || '',
    scan_quality: initialData.scan_quality || 'Good',
    spine_tscore: initialData.spine_tscore || '',
    hip_tscore: initialData.hip_tscore || '',
    femoral_neck_tscore: initialData.femoral_neck_tscore || '',
    who_diagnosis_spine: initialData.who_diagnosis_spine || 'Normal',
    frax_major_fracture_probability: initialData.frax_major_fracture_probability || '',
    frax_hip_fracture_probability: initialData.frax_hip_fracture_probability || '',
    vfa_performed: initialData.vfa_performed || false,
    vertebral_deformities_present: initialData.vertebral_deformities_present || false,
    impression: initialData.impression || '',
    recommendations: initialData.recommendations || '',
  });

  const [expandedSections, setExpandedSections] = useState({
    general: true,
    spine: true,
    hip: false,
    frax: false,
    impression: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <div className="form-header">
        <h2>📊 Consultation Ostéodensitométrie (DXA)</h2>
        <p>Résultats d'examen de densité minérale osseuse</p>
      </div>

      {/* SECTION 1: GENERAL */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('general')}
        >
          <FiChevronDown style={{ transform: expandedSections.general ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Informations Générales</span>
        </button>
        
        {expandedSections.general && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Date du scan</label>
                <input 
                  type="date" 
                  name="scan_date" 
                  value={formData.scan_date}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Qualité du scan</label>
                <select 
                  name="scan_quality" 
                  value={formData.scan_quality}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Excellent">Excellente</option>
                  <option value="Good">Bonne</option>
                  <option value="Fair">Acceptable</option>
                  <option value="Poor">Mauvaise</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="vfa_performed" 
                  checked={formData.vfa_performed}
                  onChange={handleInputChange}
                />
                <span>VFA (Vertebral Fracture Assessment) effectué</span>
              </label>
            </div>

            {formData.vfa_performed && (
              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="vertebral_deformities_present" 
                    checked={formData.vertebral_deformities_present}
                    onChange={handleInputChange}
                  />
                  <span>Déformités vertébrales détectées</span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: SPINE */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('spine')}
        >
          <FiChevronDown style={{ transform: expandedSections.spine ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Colonne Lombaire (L1-L4)</span>
        </button>
        
        {expandedSections.spine && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>T-score colonne</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="spine_tscore" 
                  value={formData.spine_tscore}
                  onChange={handleInputChange}
                  placeholder="-1.5"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Classification WHO</label>
                <select 
                  name="who_diagnosis_spine" 
                  value={formData.who_diagnosis_spine}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Normal">Normal (T-score &gt; -1.0)</option>
                  <option value="Osteopenia">Ostéopénie (-1.0 à -2.5)</option>
                  <option value="Osteoporosis">Ostéoporose (T-score &lt; -2.5)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: HIP */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('hip')}
        >
          <FiChevronDown style={{ transform: expandedSections.hip ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Hanche et Col Fémoral</span>
        </button>
        
        {expandedSections.hip && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>T-score hanche totale</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="hip_tscore" 
                  value={formData.hip_tscore}
                  onChange={handleInputChange}
                  placeholder="-1.5"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>T-score col fémoral</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="femoral_neck_tscore" 
                  value={formData.femoral_neck_tscore}
                  onChange={handleInputChange}
                  placeholder="-1.5"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: FRAX */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('frax')}
        >
          <FiChevronDown style={{ transform: expandedSections.frax ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Score FRAX (10 ans)</span>
        </button>
        
        {expandedSections.frax && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Fracture majeure - %</label>
                <input 
                  type="number" 
                  step="0.1"
                  name="frax_major_fracture_probability" 
                  value={formData.frax_major_fracture_probability}
                  onChange={handleInputChange}
                  placeholder="15.2"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Fracture de hanche - %</label>
                <input 
                  type="number" 
                  step="0.1"
                  name="frax_hip_fracture_probability" 
                  value={formData.frax_hip_fracture_probability}
                  onChange={handleInputChange}
                  placeholder="5.0"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: IMPRESSION */}
      <div className="form-section">
        <button 
          type="button"
          className="section-header"
          onClick={() => toggleSection('impression')}
        >
          <FiChevronDown style={{ transform: expandedSections.impression ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Conclusion et Recommandations</span>
        </button>
        
        {expandedSections.impression && (
          <div className="section-content">
            <div className="form-group">
              <label>Conclusion clinique *</label>
              <textarea 
                name="impression" 
                value={formData.impression}
                onChange={handleInputChange}
                placeholder="Résumé des résultats et diagnostic..."
                className="form-textarea"
                required
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Recommandations de traitement</label>
              <textarea 
                name="recommendations" 
                value={formData.recommendations}
                onChange={handleInputChange}
                placeholder="Plan de gestion et suivi..."
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT */}
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          <FiCheckCircle /> Enregistrer le formulaire
        </button>
      </div>
    </form>
  );
};

/**
 * Douleur Form: Unité de la Douleur (Pain Management)
 */
export const FormCsDouleur = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    pain_locations: initialData.pain_locations || [],
    pain_intensity_vas: initialData.pain_intensity_vas || '',
    pain_duration: initialData.pain_duration || '',
    pain_character: initialData.pain_character || [],
    onset_type: initialData.onset_type || '',
    initial_pain_date: initialData.initial_pain_date || '',
    pain_progression: initialData.pain_progression || 'stable',
    aggravating_factors: initialData.aggravating_factors || [],
    relieving_factors: initialData.relieving_factors || [],
    time_of_day_pattern: initialData.time_of_day_pattern || '',
    functional_limitation_score: initialData.functional_limitation_score || '',
    sleep_disturbance_present: initialData.sleep_disturbance_present || 0,
    sleep_quality: initialData.sleep_quality || 'Good',
    work_impact: initialData.work_impact || '',
    daily_activity_limitations: initialData.daily_activity_limitations || '',
    analgesics_json: initialData.analgesics_json || [],
    anxiety_level: initialData.anxiety_level || '',
    depression_screening: initialData.depression_screening || 'negative',
    catastrophizing_score: initialData.catastrophizing_score || '',
    recommended_interventions: initialData.recommended_interventions || [],
    follow_up_plan: initialData.follow_up_plan || '',
    clinical_notes: initialData.clinical_notes || ''
  });

  const [expandedSections, setExpandedSections] = useState({
    assessment: true,
    history: false,
    triggers: false,
    functional: false,
    medications: false,
    psychosocial: false,
    management: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="medical-form">
      <div className="form-header">
        <h2>🩹 Unité de la Douleur</h2>
        <p>Évaluation et gestion de la douleur chronique</p>
      </div>

      {/* SECTION 1: PAIN ASSESSMENT */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('assessment')}>
          <FiChevronDown style={{ transform: expandedSections.assessment ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Évaluation de la Douleur</span>
        </button>
        {expandedSections.assessment && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Intensité VAS (0-10)</label>
                <input type="number" min="0" max="10" name="pain_intensity_vas" value={formData.pain_intensity_vas} onChange={handleInputChange} className="form-input" />
              </div>
              <div className="form-group">
                <label>Localisation</label>
                <input type="text" name="pain_locations" value={formData.pain_locations.join(', ')} onChange={(e) => setFormData(prev => ({...prev, pain_locations: e.target.value.split(',').map(s => s.trim())}))} placeholder="Cervicale, Lombaire, etc." className="form-input" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Durée</label>
                <input type="text" name="pain_duration" value={formData.pain_duration} onChange={handleInputChange} placeholder="ex: chronique depuis 2 ans" className="form-input" />
              </div>
              <div className="form-group">
                <label>Type d'apparition</label>
                <select name="onset_type" value={formData.onset_type} onChange={handleInputChange} className="form-input">
                  <option value="">Sélectionner</option>
                  <option value="sudden">Soudaine</option>
                  <option value="gradual">Progressive</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PAIN HISTORY */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('history')}>
          <FiChevronDown style={{ transform: expandedSections.history ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Historique de la Douleur</span>
        </button>
        {expandedSections.history && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Date d'apparition</label>
                <input type="date" name="initial_pain_date" value={formData.initial_pain_date} onChange={handleInputChange} className="form-input" />
              </div>
              <div className="form-group">
                <label>Progression</label>
                <select name="pain_progression" value={formData.pain_progression} onChange={handleInputChange} className="form-input">
                  <option value="stable">Stable</option>
                  <option value="worsening">S'aggrave</option>
                  <option value="improving">S'améliore</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: TRIGGERING FACTORS */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('triggers')}>
          <FiChevronDown style={{ transform: expandedSections.triggers ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Facteurs Déclencheurs</span>
        </button>
        {expandedSections.triggers && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Facteurs aggravants</label>
                <textarea name="aggravating_factors" value={formData.aggravating_factors.join(', ')} onChange={(e) => setFormData(prev => ({...prev, aggravating_factors: e.target.value.split(',').map(s => s.trim())}))} placeholder="Mouvement, stress, position, etc." className="form-textarea"></textarea>
              </div>
              <div className="form-group">
                <label>Facteurs soulageurs</label>
                <textarea name="relieving_factors" value={formData.relieving_factors.join(', ')} onChange={(e) => setFormData(prev => ({...prev, relieving_factors: e.target.value.split(',').map(s => s.trim())}))} placeholder="Repos, chaleur, massage, etc." className="form-textarea"></textarea>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: FUNCTIONAL IMPACT */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('functional')}>
          <FiChevronDown style={{ transform: expandedSections.functional ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Impact Fonctionnel</span>
        </button>
        {expandedSections.functional && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Score limitation fonctionnelle (0-10)</label>
                <input type="number" min="0" max="10" name="functional_limitation_score" value={formData.functional_limitation_score} onChange={handleInputChange} className="form-input" />
              </div>
              <div className="form-group">
                <label>Qualité du sommeil</label>
                <select name="sleep_quality" value={formData.sleep_quality} onChange={handleInputChange} className="form-input">
                  <option value="Good">Bonne</option>
                  <option value="Fair">Passable</option>
                  <option value="Poor">Mauvaise</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Impact au travail</label>
                <textarea name="work_impact" value={formData.work_impact} onChange={handleInputChange} className="form-textarea"></textarea>
              </div>
              <div className="form-group">
                <label>Limitations d'activités quotidiennes</label>
                <textarea name="daily_activity_limitations" value={formData.daily_activity_limitations} onChange={handleInputChange} className="form-textarea"></textarea>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: PSYCHOSOCIAL */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('psychosocial')}>
          <FiChevronDown style={{ transform: expandedSections.psychosocial ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Facteurs Psychosociaux</span>
        </button>
        {expandedSections.psychosocial && (
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Niveau d'anxiété (0-10)</label>
                <input type="number" min="0" max="10" name="anxiety_level" value={formData.anxiety_level} onChange={handleInputChange} className="form-input" />
              </div>
              <div className="form-group">
                <label>Dépression</label>
                <select name="depression_screening" value={formData.depression_screening} onChange={handleInputChange} className="form-input">
                  <option value="negative">Négative</option>
                  <option value="mild">Légère</option>
                  <option value="moderate">Modérée</option>
                  <option value="severe">Sévère</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Score de catastrophisation (0-52)</label>
              <input type="number" min="0" max="52" name="catastrophizing_score" value={formData.catastrophizing_score} onChange={handleInputChange} className="form-input" />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: MANAGEMENT */}
      <div className="form-section">
        <button type="button" className="section-header" onClick={() => toggleSection('management')}>
          <FiChevronDown style={{ transform: expandedSections.management ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
          <span>Plan de Traitement</span>
        </button>
        {expandedSections.management && (
          <div className="section-content">
            <div className="form-group">
              <label>Interventions recommandées</label>
              <textarea name="recommended_interventions" value={formData.recommended_interventions.join(', ')} onChange={(e) => setFormData(prev => ({...prev, recommended_interventions: e.target.value.split(',').map(s => s.trim())}))} placeholder="Pharmacologique, PT, psychologique, etc." className="form-textarea"></textarea>
            </div>
            <div className="form-group">
              <label>Plan de suivi</label>
              <textarea name="follow_up_plan" value={formData.follow_up_plan} onChange={handleInputChange} className="form-textarea"></textarea>
            </div>
            <div className="form-group">
              <label>Notes cliniques</label>
              <textarea name="clinical_notes" value={formData.clinical_notes} onChange={handleInputChange} className="form-textarea"></textarea>
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT */}
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          <FiCheckCircle /> Enregistrer le formulaire
        </button>
      </div>
    </form>
  );
};

export default { FormCsRic, FormCsOs, FormCsEcho, FormCsGeste, FormCsSeances, FormCsDxa, FormCsDouleur };
