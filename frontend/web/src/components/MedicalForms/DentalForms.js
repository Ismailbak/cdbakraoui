import React, { useState, useRef } from 'react';
import { useFormNavigation } from '../../hooks/useFormNavigation';
import './AllForms.css';

export const CLINICAL_FORM_AUTOSAVE_EVENT = 'clinical-form-autosave';

const useClinicalFormAutoSave = (formData, onSubmit) => {
  React.useEffect(() => {
    const handler = () => onSubmit?.(formData);
    window.addEventListener(CLINICAL_FORM_AUTOSAVE_EVENT, handler);
    return () => window.removeEventListener(CLINICAL_FORM_AUTOSAVE_EVENT, handler);
  }, [formData, onSubmit]);
};

const DentalFormShell = ({ title, fields, onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    form_date: initialData.form_date || new Date().toISOString().split('T')[0],
    clinical_notes: initialData.clinical_notes || '',
    ...fields.reduce((acc, field) => {
      acc[field.name] = initialData[field.name] ?? field.default ?? '';
      return acc;
    }, {}),
  });
  const formRef = useRef(null);
  useFormNavigation(formRef);
  useClinicalFormAutoSave(formData, onSubmit);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(formData);
  };

  return (
    <div className="medical-form" ref={formRef}>
      <div className="form-header">
        <h2>{title}</h2>
        <div className="form-row" style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.form_date}
              onChange={(e) => handleChange('form_date', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="section-content">
          {fields.map((field) => (
            <div key={field.name} className={`form-group ${field.fullWidth ? 'form-group-full' : ''}`}>
              <label>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  className="form-input"
                  rows={field.rows || 3}
                  value={formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              ) : field.type === 'select' ? (
                <select
                  className="form-input"
                  value={formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                >
                  <option value="">-- Sélectionner --</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={!!formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.checked ? 1 : 0)}
                  />
                  {field.checkboxLabel || field.label}
                </label>
              ) : (
                <input
                  type={field.type || 'text'}
                  className="form-input"
                  value={formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
          <div className="form-group form-group-full">
            <label>Notes cliniques</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.clinical_notes}
              onChange={(e) => handleChange('clinical_notes', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-primary" onClick={handleSubmit}>
          Enregistrer le formulaire
        </button>
      </div>
    </div>
  );
};

export const FormDentExam = (props) => (
  <DentalFormShell
    title="Examen & Diagnostic"
    {...props}
    fields={[
      { name: 'chief_complaint', label: 'Motif de consultation', type: 'textarea', fullWidth: true },
      { name: 'pain_present', label: 'Douleur présente', type: 'checkbox', checkboxLabel: 'Oui' },
      { name: 'pain_intensity_vas', label: 'Intensité douleur (VAS 0-10)', type: 'number' },
      { name: 'medical_history', label: 'Antécédents médicaux', type: 'textarea', fullWidth: true },
      { name: 'allergies', label: 'Allergies', type: 'textarea', fullWidth: true },
      { name: 'oral_hygiene', label: 'Hygiène bucco-dentaire', type: 'select', options: ['Bonne', 'Moyenne', 'Mauvaise'] },
      { name: 'occlusion', label: 'Occlusion', type: 'text' },
      { name: 'dmft_score', label: 'Score DMFT', type: 'number' },
      { name: 'radio_panoramique', label: 'Panoramique', type: 'checkbox', checkboxLabel: 'Réalisée' },
      { name: 'radio_retroalveolaire', label: 'Rétro-alvéolaire', type: 'checkbox', checkboxLabel: 'Réalisée' },
      { name: 'radio_findings', label: 'Résultats radiographiques', type: 'textarea', fullWidth: true },
      { name: 'diagnosis', label: 'Diagnostic', type: 'textarea', fullWidth: true },
      { name: 'treatment_plan_summary', label: 'Résumé du plan de traitement', type: 'textarea', fullWidth: true },
    ]}
  />
);

export const FormDentSoin = (props) => (
  <DentalFormShell
    title="Soins Conservateurs"
    {...props}
    fields={[
      { name: 'tooth_number', label: 'Numéro de dent (FDI)', type: 'text' },
      { name: 'caries_class', label: 'Classe de carie', type: 'text' },
      { name: 'caries_depth', label: 'Profondeur', type: 'select', options: ['Superficielle', 'Moyenne', 'Profonde'] },
      { name: 'pulp_status', label: 'État pulpaire', type: 'text' },
      { name: 'anesthesia', label: 'Anesthésie', type: 'checkbox', checkboxLabel: 'Réalisée' },
      { name: 'anesthesia_type', label: 'Type d\'anesthésie', type: 'text' },
      { name: 'restoration_material', label: 'Matériau de restauration', type: 'text' },
      { name: 'restoration_shade', label: 'Teinte', type: 'text' },
      { name: 'post_op_instructions', label: 'Consignes post-opératoires', type: 'textarea', fullWidth: true },
    ]}
  />
);

export const FormDentEndo = (props) => (
  <DentalFormShell
    title="Endodontie"
    {...props}
    fields={[
      { name: 'tooth_number', label: 'Numéro de dent (FDI)', type: 'text' },
      { name: 'diagnosis', label: 'Diagnostic', type: 'text' },
      { name: 'pulp_vitality_test', label: 'Test de vitalité pulpaire', type: 'text' },
      { name: 'canal_count', label: 'Nombre de canaux', type: 'number' },
      { name: 'working_length', label: 'Longueur de travail', type: 'text' },
      { name: 'obturation_material', label: 'Matériau d\'obturation', type: 'text' },
      { name: 'session_number', label: 'Numéro de séance', type: 'number' },
      { name: 'treatment_complete', label: 'Traitement terminé', type: 'checkbox', checkboxLabel: 'Oui' },
      { name: 'post_op_instructions', label: 'Consignes post-opératoires', type: 'textarea', fullWidth: true },
    ]}
  />
);

export const FormDentExtraction = (props) => (
  <DentalFormShell
    title="Extraction & Chirurgie"
    {...props}
    fields={[
      { name: 'tooth_number', label: 'Numéro de dent (FDI)', type: 'text' },
      { name: 'extraction_reason', label: 'Motif d\'extraction', type: 'textarea', fullWidth: true },
      { name: 'extraction_type', label: 'Type d\'extraction', type: 'select', options: ['Simple', 'Chirurgicale', 'Avulsion'] },
      { name: 'anesthesia_type', label: 'Anesthésie', type: 'text' },
      { name: 'sutures', label: 'Sutures', type: 'checkbox', checkboxLabel: 'Posées' },
      { name: 'sutures_count', label: 'Nombre de sutures', type: 'number' },
      { name: 'complications', label: 'Complications', type: 'textarea', fullWidth: true },
      { name: 'medications_prescribed', label: 'Médicaments prescrits', type: 'textarea', fullWidth: true },
      { name: 'post_op_instructions', label: 'Soins post-opératoires', type: 'textarea', fullWidth: true },
      { name: 'followup_date', label: 'Date de contrôle', type: 'date' },
    ]}
  />
);

export const FormDentProthese = (props) => (
  <DentalFormShell
    title="Prothèse"
    {...props}
    fields={[
      { name: 'prosthesis_type', label: 'Type de prothèse', type: 'select', options: ['Couronne', 'Bridge', 'Prothèse amovible', 'Inlay/Onlay'] },
      { name: 'material', label: 'Matériau', type: 'text' },
      { name: 'shade', label: 'Teinte', type: 'text' },
      { name: 'lab_name', label: 'Laboratoire', type: 'text' },
      { name: 'step', label: 'Étape', type: 'text' },
      { name: 'impression_taken', label: 'Empreinte prise', type: 'checkbox', checkboxLabel: 'Oui' },
      { name: 'delivery_date', label: 'Date de pose', type: 'date' },
    ]}
  />
);

export const FormDentParo = (props) => (
  <DentalFormShell
    title="Parodontologie"
    {...props}
    fields={[
      { name: 'diagnosis', label: 'Diagnostic parodontal', type: 'text' },
      { name: 'procedure', label: 'Procédure', type: 'text' },
      { name: 'bleeding_on_probing', label: 'Saignement au sondage (%)', type: 'number' },
      { name: 'gingival_recession', label: 'Récession gingivale', type: 'checkbox', checkboxLabel: 'Présente' },
      { name: 'mobility_present', label: 'Mobilité', type: 'checkbox', checkboxLabel: 'Présente' },
      { name: 'ultrasonic_used', label: 'Détartrage ultrasonique', type: 'checkbox', checkboxLabel: 'Réalisé' },
      { name: 'recall_interval_months', label: 'Intervalle de rappel (mois)', type: 'number' },
      { name: 'oral_hygiene_instructions', label: 'Instructions d\'hygiène', type: 'textarea', fullWidth: true },
    ]}
  />
);

export const FormDentPlan = (props) => (
  <DentalFormShell
    title="Plan de Traitement"
    {...props}
    fields={[
      { name: 'summary', label: 'Résumé du plan', type: 'textarea', fullWidth: true },
      { name: 'priority', label: 'Priorité', type: 'select', options: ['Urgente', 'Haute', 'Moyenne', 'Basse'] },
      { name: 'estimated_sessions', label: 'Nombre de séances estimé', type: 'number' },
      { name: 'total_estimate', label: 'Coût total estimé (MAD)', type: 'number' },
      { name: 'amount_paid', label: 'Montant payé (MAD)', type: 'number' },
      { name: 'insurance_covered', label: 'Prise en charge assurance', type: 'checkbox', checkboxLabel: 'Oui' },
      { name: 'patient_consent', label: 'Consentement patient', type: 'checkbox', checkboxLabel: 'Obtenu' },
      { name: 'consent_date', label: 'Date du consentement', type: 'date' },
    ]}
  />
);

export default {
  FormDentExam,
  FormDentSoin,
  FormDentEndo,
  FormDentExtraction,
  FormDentProthese,
  FormDentParo,
  FormDentPlan,
};
