import React, { useState, useEffect } from 'react';
import {
  FiChevronRight, FiChevronLeft, FiSave, FiX, FiAlertCircle, FiPlus, FiTrash2
} from 'react-icons/fi';
import { updateFormCsRd, getFormCsRd } from '../../api/api';
import './FormCsRd.css';

/**
 * FormCsRd - Consultation Rhumatisme Dégénératif
 * 7-tab form for documenting degenerative rheumatism consultations
 * Tabs: 1.Treatment 2.Signs 3.Exam 4.Labs 5.Imaging 6.Diagnosis 7.Treatment Plan
 */
function FormCsRd({ formId, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(!formId);
  const [isSaving, setIsSaving] = useState(false);

  const TABS = [
    { id: 1, label: 'Traitement en cours', icon: '💊' },
    { id: 2, label: 'Signes fonctionnels', icon: '📋' },
    { id: 3, label: 'Examen clinique', icon: '🔍' },
    { id: 4, label: 'Bilan biologique', icon: '🧪' },
    { id: 5, label: 'Imagerie', icon: '📸' },
    { id: 6, label: 'Diagnostic', icon: '📊' },
    { id: 7, label: 'Conduite à tenir', icon: '💼' },
  ];

  // Initialize form data
  useEffect(() => {
    if (formId) {
      fetchForm();
    } else {
      setFormData({
        form_date: new Date().toISOString().split('T')[0],
        current_treatment_none: 0,
        current_treatment_json: {},
        arthralgie_present: 0,
        arthralgie_horaire: '',
        arthralgie_duration: '',
        arthralgie_locations: [],
        joint_swelling_present: 0,
        joint_swelling_locations: [],
        rachialgie_present: 0,
        rachialgie_horaire: '',
        rachialgie_duration: '',
        rachialgie_locations: [],
        fessialgie_present: 0,
        fessialgie_horaire: '',
        fessialgie_duration: '',
        fessialgie_locations: [],
        enthesalgie_present: 0,
        enthesalgie_locations: [],
        myalgie_present: 0,
        myalgie_horaire: '',
        myalgie_duration: '',
        other_signs_text: '',
        articular_index: '',
        synovial_index: '',
        clinical_examination_notes: '',
        lab_inflammatory_json: {},
        lab_renal_json: {},
        lab_hepatic_json: {},
        lab_metabolic_json: {},
        lab_electrolytes_json: {},
        lab_immunology_json: {},
        lab_infection_json: {},
        imaging_xray: 0,
        imaging_xray_findings: '',
        imaging_ultrasound: 0,
        imaging_ultrasound_findings: '',
        imaging_ct: 0,
        imaging_ct_findings: '',
        imaging_mri: 0,
        imaging_mri_findings: '',
        imaging_other: 0,
        imaging_other_findings: '',
        diagnosis_osteoarthritis_json: [],
        diagnosis_spine_json: {},
        diagnosis_tendinopathy_json: [],
        diagnosis_other_text: '',
        treatment_decision: '',
        treatment_starting_json: {},
        treatment_maintain_reason: '',
        treatment_maintain_remarks: '',
        treatment_stop_reason: '',
        treatment_stop_remarks: '',
        other_therapeutic_decisions: '',
        prescription: '',
        additional_notes: '',
      });
      setIsLoading(false);
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      const response = await getFormCsRd(formId);
      setFormData(response.data);
    } catch (error) {
      console.error('Error loading form:', error);
      alert('Erreur lors du chargement du formulaire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value ? 1 : 0
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const array = Array.isArray(prev[field]) ? prev[field] : [];
      const updated = [...array];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const handleAddArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field]) ? [...prev[field], ''] : ['']
    }));
  };

  const handleRemoveArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field]) ? prev[field].filter((_, i) => i !== index) : []
    }));
  };

  const handleSave = async () => {
    if (!formId) {
      alert('Impossible de sauvegarder: formulaire non initialisé');
      return;
    }

    setIsSaving(true);
    try {
      // Clean form data before sending
      const cleanedData = {};
      
      if (formData) {
        for (const [key, value] of Object.entries(formData)) {
          // Skip internal fields
          if (['id', 'created_by', 'created_at', 'updated_at'].includes(key)) continue;
          
          // Handle numeric fields
          if (key === 'articular_index' || key === 'synovial_index') {
            cleanedData[key] = value ? parseInt(value) : null;
          }
          // Handle boolean/tinyint fields (0 or 1)
          else if (key.includes('_present') || key === 'current_treatment_none' || 
                   (key.includes('imaging_') && !key.includes('_findings'))) {
            cleanedData[key] = value ? 1 : 0;
          }
          // Handle array fields
          else if (Array.isArray(value)) {
            cleanedData[key] = value.length > 0 ? value.filter(v => v !== '') : null;
          }
          // Handle object/dict fields
          else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
            cleanedData[key] = Object.keys(value).length > 0 ? value : null;
          }
          // Handle string fields
          else if (typeof value === 'string') {
            cleanedData[key] = value.trim() || null;
          }
          // Handle date fields
          else if (key === 'form_date') {
            cleanedData[key] = value || null;
          }
          // Keep everything else as-is
          else {
            cleanedData[key] = value;
          }
        }
      }
      
      console.log('Cleaned data being sent:', cleanedData);
      const response = await updateFormCsRd(formId, cleanedData);
      alert('Formulaire sauvegardé avec succès');
      // Pass both the form ID and data back to parent
      if (onSave) onSave({ formCsRdId: formId, ...formData });
    } catch (error) {
      console.error('Error saving form:', error);
      console.error('Form data that failed:', formData);
      alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="fcr-loading">Chargement...</div>;
  }

  return (
    <div className="fcr-wrapper">
      {/* Header */}
      <div className="fcr-header">
        <div className="fcr-header-left">
          <h2 className="fcr-title">Consultation Rhumatisme Dégénératif</h2>
          <input
            type="date"
            value={formData?.form_date || ''}
            onChange={(e) => handleInputChange('form_date', e.target.value)}
            className="fcr-date-input"
          />
        </div>
        <button className="fcr-close-btn" onClick={onClose} type="button">
          <FiX />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="fcr-tabs-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`fcr-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            <span className="fcr-tab-icon">{tab.icon}</span>
            <span className="fcr-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="fcr-tabs-content">
        {/* TAB 1: CURRENT TREATMENT */}
        {activeTab === 1 && (
          <div className="fcr-tab-pane">
            <div className="fcr-section">
              <h3>Traitement en cours</h3>
              <label className="fcr-checkbox">
                <input
                  type="checkbox"
                  checked={formData?.current_treatment_none === 1}
                  onChange={(e) => handleCheckboxChange('current_treatment_none', e.target.checked)}
                />
                Aucun traitement
              </label>
              
              {formData?.current_treatment_none === 0 && (
                <div className="fcr-treatment-list">
                  <p className="fcr-hint">Médicaments en cours</p>
                  {Array.isArray(formData?.current_treatment_json) && formData.current_treatment_json.map((med, idx) => (
                    <div key={idx} className="fcr-treatment-item">
                      <input
                        type="text"
                        placeholder="Nom du médicament"
                        value={med.type || ''}
                        onChange={(e) => handleArrayChange('current_treatment_json', idx, { ...med, type: e.target.value })}
                        className="fcr-input"
                      />
                      <input
                        type="date"
                        value={med.start_date || ''}
                        onChange={(e) => handleArrayChange('current_treatment_json', idx, { ...med, start_date: e.target.value })}
                        className="fcr-input"
                      />
                      <button
                        className="fcr-btn-remove"
                        onClick={() => handleRemoveArrayItem('current_treatment_json', idx)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  <button
                    className="fcr-btn-add"
                    onClick={() => handleAddArrayItem('current_treatment_json')}
                  >
                    <FiPlus /> Ajouter un médicament
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FUNCTIONAL SIGNS */}
        {activeTab === 2 && (
          <div className="fcr-tab-pane">
            <div className="fcr-section">
              <h3>Signes fonctionnels</h3>
              
              {/* Arthralgie */}
              <div className="fcr-subsection">
                <label className="fcr-checkbox">
                  <input
                    type="checkbox"
                    checked={formData?.arthralgie_present === 1}
                    onChange={(e) => handleCheckboxChange('arthralgie_present', e.target.checked)}
                  />
                  Arthralgie (Douleur articulaire)
                </label>
                {formData?.arthralgie_present === 1 && (
                  <div className="fcr-nested-fields">
                    <select
                      value={formData?.arthralgie_horaire || ''}
                      onChange={(e) => handleInputChange('arthralgie_horaire', e.target.value)}
                      className="fcr-input"
                    >
                      <option value="">Horaire</option>
                      <option value="Mecanique">Mécanique</option>
                      <option value="Inflammatoire">Inflammatoire</option>
                      <option value="Mixte">Mixte</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Durée"
                      value={formData?.arthralgie_duration || ''}
                      onChange={(e) => handleInputChange('arthralgie_duration', e.target.value)}
                      className="fcr-input"
                    />
                    <input
                      type="text"
                      placeholder="Siège (ex: genoux, hanches)"
                      value={(formData?.arthralgie_locations || []).join(', ')}
                      onChange={(e) => handleInputChange('arthralgie_locations', e.target.value.split(',').map(s => s.trim()))}
                      className="fcr-input"
                    />
                  </div>
                )}
              </div>

              {/* Joint Swelling */}
              <div className="fcr-subsection">
                <label className="fcr-checkbox">
                  <input
                    type="checkbox"
                    checked={formData?.joint_swelling_present === 1}
                    onChange={(e) => handleCheckboxChange('joint_swelling_present', e.target.checked)}
                  />
                  Gonflement articulaire
                </label>
                {formData?.joint_swelling_present === 1 && (
                  <input
                    type="text"
                    placeholder="Siège(s)"
                    value={(formData?.joint_swelling_locations || []).join(', ')}
                    onChange={(e) => handleInputChange('joint_swelling_locations', e.target.value.split(',').map(s => s.trim()))}
                    className="fcr-input"
                  />
                )}
              </div>

              {/* Rachialgie (Back Pain) */}
              <div className="fcr-subsection">
                <label className="fcr-checkbox">
                  <input
                    type="checkbox"
                    checked={formData?.rachialgie_present === 1}
                    onChange={(e) => handleCheckboxChange('rachialgie_present', e.target.checked)}
                  />
                  Rachialgie (Douleur du rachis)
                </label>
                {formData?.rachialgie_present === 1 && (
                  <div className="fcr-nested-fields">
                    <select
                      value={formData?.rachialgie_horaire || ''}
                      onChange={(e) => handleInputChange('rachialgie_horaire', e.target.value)}
                      className="fcr-input"
                    >
                      <option value="">Horaire</option>
                      <option value="Mecanique">Mécanique</option>
                      <option value="Inflammatoire">Inflammatoire</option>
                      <option value="Mixte">Mixte</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Durée"
                      value={formData?.rachialgie_duration || ''}
                      onChange={(e) => handleInputChange('rachialgie_duration', e.target.value)}
                      className="fcr-input"
                    />
                    <input
                      type="text"
                      placeholder="Siège (Cervical/Thoracic/Lumbar)"
                      value={(formData?.rachialgie_locations || []).join(', ')}
                      onChange={(e) => handleInputChange('rachialgie_locations', e.target.value.split(',').map(s => s.trim()))}
                      className="fcr-input"
                    />
                  </div>
                )}
              </div>

              {/* Other Signs */}
              <div className="fcr-subsection">
                <label>Autres signes</label>
                <textarea
                  placeholder="Décrivez les autres signes..."
                  value={formData?.other_signs_text || ''}
                  onChange={(e) => handleInputChange('other_signs_text', e.target.value)}
                  className="fcr-textarea"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHYSICAL EXAMINATION */}
        {activeTab === 3 && (
          <div className="fcr-tab-pane">
            <div className="fcr-section">
              <h3>Examen clinique</h3>
              <div className="fcr-field">
                <label>Indice articulaire</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData?.articular_index || ''}
                  onChange={(e) => handleInputChange('articular_index', e.target.value)}
                  className="fcr-input"
                />
              </div>
              <div className="fcr-field">
                <label>Indice synovial</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData?.synovial_index || ''}
                  onChange={(e) => handleInputChange('synovial_index', e.target.value)}
                  className="fcr-input"
                />
              </div>
              <div className="fcr-field">
                <label>Notes cliniques</label>
                <textarea
                  placeholder="Résultats de l'examen physique..."
                  value={formData?.clinical_examination_notes || ''}
                  onChange={(e) => handleInputChange('clinical_examination_notes', e.target.value)}
                  className="fcr-textarea"
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LAB RESULTS (SIMPLIFIED - Show collapsible sections) */}
        {activeTab === 4 && (
          <div className="fcr-tab-pane">
            <div className="fcr-section">
              <h3>Bilan biologique</h3>
              <p className="fcr-note">Entrez les résultats de laboratoire dans les champs ci-dessous.</p>
              
              {/* Inflammatory Markers */}
              <details className="fcr-collapsible">
                <summary>Marqueurs inflammatoires</summary>
                <div className="fcr-grid-2">
                  <input type="number" placeholder="Hb (g/dL)" className="fcr-input" />
                  <input type="number" placeholder="VS (mm/h)" className="fcr-input" />
                  <input type="number" placeholder="CRP (mg/L)" className="fcr-input" />
                  <input type="number" placeholder="Plaquettes" className="fcr-input" />
                </div>
              </details>

              {/* Renal Function */}
              <details className="fcr-collapsible">
                <summary>Fonction rénale</summary>
                <div className="fcr-grid-2">
                  <input type="number" placeholder="Urée (mg/dL)" className="fcr-input" />
                  <input type="number" placeholder="Créatinine (mg/dL)" className="fcr-input" />
                  <input type="number" placeholder="DFG (mL/min)" className="fcr-input" />
                  <input type="number" placeholder="Protéinurie 24h (g/24h)" className="fcr-input" />
                </div>
              </details>

              {/* Hepatic Function */}
              <details className="fcr-collapsible">
                <summary>Fonction hépatique</summary>
                <div className="fcr-grid-2">
                  <input type="number" placeholder="ASAT (U/L)" className="fcr-input" />
                  <input type="number" placeholder="ALAT (U/L)" className="fcr-input" />
                  <input type="number" placeholder="GGT (U/L)" className="fcr-input" />
                  <input type="number" placeholder="PAL (U/L)" className="fcr-input" />
                </div>
              </details>
            </div>
          </div>
        )}

        {/* TAB 5: IMAGING */}
        {activeTab === 5 && (
          <div className="fcr-tab-pane">
            <div className="fcr-section">
              <h3>Imagerie</h3>
              
              {/* X-ray */}
              <div className="fcr-subsection">
                <label className="fcr-checkbox">
                  <input
                    type="checkbox"
                    checked={formData?.imaging_xray === 1}
                    onChange={(e) => handleCheckboxChange('imaging_xray', e.target.checked)}
                  />
                  Radiologie standard
                </label>
                {formData?.imaging_xray === 1 && (
                  <textarea
                    placeholder="Résultats radiologiques..."
                    value={formData?.imaging_xray_findings || ''}
                    onChange={(e) => handleInputChange('imaging_xray_findings', e.target.value)}
                    className="fcr-textarea"
                    rows={2}
                  />
                )}
              </div>

              {/* Ultrasound */}
              <div className="fcr-subsection">
                <label className="fcr-checkbox">
                  <input
                    type="checkbox"
                    checked={formData?.imaging_ultrasound === 1}
                    onChange={(e) => handleCheckboxChange('imaging_ultrasound', e.target.checked)}
                  />
                  Échographie ostéo-articulaire
                </label>
                {formData?.imaging_ultrasound === 1 && (
                  <textarea
                    placeholder="Résultats échographiques..."
                    value={formData?.imaging_ultrasound_findings || ''}
                    onChange={(e) => handleInputChange('imaging_ultrasound_findings', e.target.value)}
                    className="fcr-textarea"
                    rows={2}
                  />
                )}
              </div>

              {/* MRI */}
              <div className="fcr-subsection">
                <label className="fcr-checkbox">
                  <input
                    type="checkbox"
                    checked={formData?.imaging_mri === 1}
                    onChange={(e) => handleCheckboxChange('imaging_mri', e.target.checked)}
                  />
                  IRM
                </label>
                {formData?.imaging_mri === 1 && (
                  <textarea
                    placeholder="Résultats IRM..."
                    value={formData?.imaging_mri_findings || ''}
                    onChange={(e) => handleInputChange('imaging_mri_findings', e.target.value)}
                    className="fcr-textarea"
                    rows={2}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DIAGNOSIS */}
        {activeTab === 6 && (
          <div className="fcr-tab-pane">
            <div className="fcr-section">
              <h3>Diagnostic</h3>
              
              <div className="fcr-field">
                <label>Arthrose - Siège et K&L Grade</label>
                <div className="fcr-treatment-list">
                  {Array.isArray(formData?.diagnosis_osteoarthritis_json) && formData.diagnosis_osteoarthritis_json.map((dx, idx) => (
                    <div key={idx} className="fcr-diagnosis-item">
                      <input
                        type="text"
                        placeholder="Articulation (ex: Genou droit)"
                        value={dx.joint || ''}
                        className="fcr-input"
                      />
                      <select className="fcr-input">
                        <option value="">K&L Grade</option>
                        <option value="1">1 (Minimal)</option>
                        <option value="2">2 (Mild)</option>
                        <option value="3">3 (Moderate)</option>
                        <option value="4">4 (Severe)</option>
                      </select>
                      <button
                        className="fcr-btn-remove"
                        onClick={() => handleRemoveArrayItem('diagnosis_osteoarthritis_json', idx)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  <button
                    className="fcr-btn-add"
                    onClick={() => handleAddArrayItem('diagnosis_osteoarthritis_json')}
                  >
                    <FiPlus /> Ajouter une articulation
                  </button>
                </div>
              </div>

              <div className="fcr-field">
                <label>Autres diagnostics</label>
                <textarea
                  placeholder="Autres diagnostics / impressions cliniques..."
                  value={formData?.diagnosis_other_text || ''}
                  onChange={(e) => handleInputChange('diagnosis_other_text', e.target.value)}
                  className="fcr-textarea"
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TREATMENT PLAN */}
        {activeTab === 7 && (
          <div className="fcr-tab-pane">
            <div className="fcr-section">
              <h3>Conduite à tenir</h3>
              
              <div className="fcr-field">
                <label>Décision thérapeutique</label>
                <select
                  value={formData?.treatment_decision || ''}
                  onChange={(e) => handleInputChange('treatment_decision', e.target.value)}
                  className="fcr-input"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="starting">Démarrage d'un traitement</option>
                  <option value="maintain">Maintien du traitement</option>
                  <option value="stop">Arrêt du traitement</option>
                </select>
              </div>

              <div className="fcr-field">
                <label>Prescription</label>
                <textarea
                  placeholder="Détails de la prescription..."
                  value={formData?.prescription || ''}
                  onChange={(e) => handleInputChange('prescription', e.target.value)}
                  className="fcr-textarea"
                  rows={4}
                />
              </div>

              <div className="fcr-field">
                <label>Remarques particulières</label>
                <textarea
                  placeholder="Notes additionnelles..."
                  value={formData?.additional_notes || ''}
                  onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                  className="fcr-textarea"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Save and Navigation */}
      <div className="fcr-footer">
        <div className="fcr-footer-nav">
          <button
            className="fcr-btn fcr-btn-secondary"
            onClick={() => setActiveTab(Math.max(1, activeTab - 1))}
            disabled={activeTab === 1}
          >
            <FiChevronLeft /> Précédent
          </button>
          <button
            className="fcr-btn fcr-btn-secondary"
            onClick={() => setActiveTab(Math.min(TABS.length, activeTab + 1))}
            disabled={activeTab === TABS.length}
          >
            Suivant <FiChevronRight />
          </button>
        </div>
        <button
          className="fcr-btn fcr-btn-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FiSave /> {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}

export default FormCsRd;
