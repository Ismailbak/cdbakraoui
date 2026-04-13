import React, { useState, useEffect } from 'react';
import {
  FiUser, FiCalendar, FiActivity, FiCheck, FiX,
  FiChevronRight, FiChevronLeft, FiSearch, FiAlertCircle, FiPlus,
  FiImage, FiZap, FiTarget, FiDollarSign, FiClock, FiEdit3
} from 'react-icons/fi';
import { getPatients, createMedicalAct, updateMedicalAct, getDoctors, createActResult } from '../../api/api';
import './MedicalActForm.css';

const CATEGORY_OPTIONS = [
  { value: 'rheumatology', label: 'Rhumatologie' },
  { value: 'imaging', label: 'Imagerie' },
  { value: 'intervention', label: 'Intervention' },
  { value: 'laboratory', label: 'Laboratoire' },
];

const ACT_TYPES = [
  { value: 'Consultation', label: 'Consultation', icon: <FiUser /> },
  { value: 'Examen', label: 'Examen', icon: <FiActivity /> },
  { value: 'Infiltration', label: 'Infiltration', icon: <FiZap /> },
  { value: 'Échographie', label: 'Échographie', icon: <FiImage /> },
  { value: 'Soin', label: 'Soin', icon: <FiTarget /> },
];

const STEPS = [
  { id: 1, label: 'Patient', icon: FiUser },
  { id: 2, label: 'Clinique', icon: FiActivity },
  { id: 3, label: 'Labo', icon: FiTarget },
  { id: 4, label: 'Facturation', icon: FiDollarSign },
];

const EMPTY_FORM = {
  patientId: '',
  patientName: '',
  doctorId: '',
  date: new Date().toISOString().split('T')[0],
  actType: 'Consultation',
  category: 'rheumatology',
  diagnosis: '',
  report: '',
  amount: '',
  status: 'pending',
  treatment: '',
  notes: '',
  labResults: [],
};

function MedicalActForm({ onSuccess, onClose, initialData, isEdit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [userIntentToSubmit, setUserIntentToSubmit] = useState(false);

  // Initialize or update form when initialData changes
  useEffect(() => {
    if (initialData && isEdit) {
      // Safely extract diagnosis from multiple sources
      let diagnosisValue = '';
      if (initialData.diagnoses && Array.isArray(initialData.diagnoses) && initialData.diagnoses.length > 0) {
        diagnosisValue = initialData.diagnoses
          .map(d => d.diagnosis_label || d.label || '')
          .filter(d => d)
          .join(', ');
      } else if (initialData.diagnosis) {
        diagnosisValue = String(initialData.diagnosis).trim();
      }

      // Safely extract treatment from multiple sources
      let treatmentValue = '';
      if (initialData.treatments && Array.isArray(initialData.treatments) && initialData.treatments.length > 0) {
        treatmentValue = initialData.treatments
          .map(t => t.drug_name || t.name || '')
          .filter(t => t)
          .join(', ');
      } else if (initialData.treatment) {
        treatmentValue = String(initialData.treatment).trim();
      }

      // Determine actType from various possible field names
      const actType = initialData.act_type 
        || initialData.actType 
        || initialData.type
        || 'Consultation';

      setForm({
        id: initialData.id,
        patientId: initialData.patient_id || initialData.patientId,
        patientName: initialData.patient_name || initialData.patientName,
        doctorId: initialData.doctor_id || initialData.doctorId || '',
        date: initialData.act_date || initialData.date,
        actType: actType,
        category: initialData.category || 'rheumatology',
        diagnosis: diagnosisValue,
        report: initialData.report || '',
        amount: initialData.amount || '',
        status: initialData.status || 'pending',
        treatment: treatmentValue,
        notes: initialData.notes || '',
        labResults: [],
      });
      
      // Reset step to 1 when editing
      setStep(1);
      setErrors({});
      setSubmitted(false);
      // Also clear searchQuery to avoid UI clutter
      setSearchQuery('');
    } else {
      setForm(EMPTY_FORM);
      setStep(1);
      setErrors({});
      setSubmitted(false);
      setSearchQuery('');
    }
  }, [initialData, isEdit]);

  useEffect(() => {
    if (step === 1) {
      loadPatients();
    }
  }, [step]);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const res = await getPatients();
      setPatients(res.data || []);
    } catch (err) {
      console.error("Error loading patients:", err);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await getDoctors();
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Error loading doctors:", err);
    }
  };

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.ipp && p.ipp.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this specific field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const selectPatient = (patient) => {
    setForm(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: `${patient.first_name} ${patient.last_name}`
    }));
    if (errors.patientId) setErrors(prev => ({ ...prev, patientId: '' }));
  };

  const validateStep = (s) => {
    const newErrors = {};
    if (s === 1) {
      if (!form.patientId) newErrors.patientId = 'Veuillez sélectionner un patient';
      if (!form.date) newErrors.date = 'La date est requise';
    }
    if (s === 2) {
      // Ensure diagnosis is a string and validate
      const diagnosisValue = form.diagnosis ? String(form.diagnosis).trim() : '';
      if (!diagnosisValue) {
        newErrors.diagnosis = 'Le diagnostic est requis';
      }
      // actType defaults to 'Consultation' so it should never be empty
      if (!form.actType) {
        newErrors.actType = "Le type d'acte est requis";
      }
      // Doctor is required
      if (!form.doctorId) {
        newErrors.doctorId = 'Veuillez sélectionner un médecin';
      }
    }
    if (s === 3) {
      // Lab results step is optional
      // Just return success here
    }
    if (s === 4) {
      // Require amount only when actually submitting
      const amountValue = String(form.amount || '').trim();
      if (!amountValue) {
        newErrors.amount = 'Le montant est requis';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
      setUserIntentToSubmit(false); // Reset intent when navigating
    }
  };

  const handleBack = () => {
    // Allow going back without validation
    setStep(s => s - 1);
    // Clear errors when going back to allow re-editing
    setErrors({});
    setUserIntentToSubmit(false); // Reset intent when navigating
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only allow submit if we're actually on step 4 AND user clicked submit button
    if (step !== 4 || !userIntentToSubmit) {
      return;
    }
    
    if (!validateStep(4)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patient_id: form.patientId,
        act_date: form.date,
        act_type: form.actType,
        category: form.category,
        diagnosis: form.diagnosis,
        doctor_id: form.doctorId || null,
        report: form.report || null,
        amount: form.amount ? String(form.amount) : null,
        status: form.status,
        treatment: form.treatment || null,
        notes: form.notes || null,
      };

      let actId = form.id;
      if (isEdit && form.id) {
        await updateMedicalAct(form.id, payload);
      } else {
        const res = await createMedicalAct(payload);
        actId = res.data?.id;
      }
      
      // Create lab results if any were added
      if (form.labResults.length > 0 && actId) {
        for (const labResult of form.labResults) {
          await createActResult({
            act_id: actId,
            patient_id: form.patientId,
            result_date: labResult.date,
            result_name: labResult.name,
            result_value: labResult.value,
            result_unit: labResult.unit || null,
            result_category: labResult.category || null,
            is_abnormal: labResult.abnormal || false,
            notes: labResult.notes || null,
          });
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1400);
    } catch (err) {
      setErrors({ submit: "Erreur lors de l'enregistrement de l'acte." });
    } finally {
      setIsSubmitting(false);
      setUserIntentToSubmit(false);
    }
  };

  if (submitted) {
    return (
      <div className="maf-success">
        <div className="maf-success-icon">
          <FiCheck />
        </div>
        <h3>{isEdit ? 'Acte modifié avec succès !' : 'Acte enregistré avec succès !'}</h3>
        <p>L'acte médical pour {form.patientName} a été {isEdit ? 'mis à jour' : 'validé'}.</p>
      </div>
    );
  }

  return (
    <div className="maf-wrapper">
      {/* Header */}
      <div className="maf-header">
        <div className="maf-header-left">
          <div className="maf-header-icon">
            {isEdit ? <FiEdit3 /> : <FiPlus />}
          </div>
          <div>
            <h2 className="maf-title">{isEdit ? 'Modifier l\'acte' : 'Nouvel Acte Médical'}</h2>
            <p className="maf-subtitle">{isEdit ? 'Modifiez les détails de l\'acte' : 'Remplissez les informations de l\'acte'}</p>
          </div>
        </div>
        {onClose && (
          <button className="maf-close-btn" onClick={onClose} type="button" aria-label="Fermer">
            <FiX />
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="maf-steps">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isCompleted = step > s.id;
          const isActive = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className={`maf-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="maf-step-circle">
                  {isCompleted ? <FiCheck /> : <Icon />}
                </div>
                <span className="maf-step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`maf-step-line ${isCompleted ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form */}
      <form className="maf-form" onSubmit={handleSubmit} noValidate>
        {/* Step 1 — Patient & Date */}
        {step === 1 && (
          <div className="maf-section">
            <div className="maf-section-title">
              <FiUser className="maf-section-icon" />
              <span>Sélectionner le patient</span>
            </div>

            {/* Patient Search */}
            <div className="maf-field">
              <label className="maf-label">
                Patient <span className="maf-required">*</span>
              </label>
              <div className="maf-search-wrapper">
                <FiSearch className="maf-search-icon" />
                <input
                  type="text"
                  className="maf-input maf-input-with-icon"
                  placeholder="Rechercher par nom ou IPP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Patient List */}
            <div className="maf-patient-list">
              {isLoadingPatients ? (
                <div className="maf-loading">Chargement des patients...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="maf-empty">Aucun patient trouvé</div>
              ) : (
                filteredPatients.slice(0, 6).map(p => (
                  <div
                    key={p.id}
                    className={`maf-patient-card ${form.patientId === p.id ? 'selected' : ''}`}
                    onClick={() => selectPatient(p)}
                  >
                    <div className="maf-patient-avatar">
                      {p.gender === 'Femme' ? '👩' : '👨'}
                    </div>
                    <div className="maf-patient-info">
                      <span className="maf-patient-name">{p.first_name} {p.last_name}</span>
                      <span className="maf-patient-meta">
                        {p.ipp ? `IPP: ${p.ipp}` : 'Sans IPP'} • {p.age || '?'} ans
                      </span>
                    </div>
                    {form.patientId === p.id && (
                      <div className="maf-patient-check">
                        <FiCheck />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {errors.patientId && <span className="maf-error-msg"><FiAlertCircle />{errors.patientId}</span>}

            {/* Date */}
            <div className="maf-field" style={{ marginTop: '20px' }}>
              <label className="maf-label">
                Date de l'acte <span className="maf-required">*</span>
              </label>
              <div className="maf-input-icon-wrapper">
                <FiCalendar className="maf-input-icon" />
                <input
                  type="date"
                  name="date"
                  className={`maf-input maf-input-with-icon ${errors.date ? 'maf-input-error' : ''}`}
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
              {errors.date && <span className="maf-error-msg"><FiAlertCircle />{errors.date}</span>}
            </div>
          </div>
        )}

        {/* Step 2 — Clinical Details */}
        {step === 2 && (
          <div className="maf-section">
            <div className="maf-section-title">
              <FiActivity className="maf-section-icon" />
              <span>Détails cliniques</span>
            </div>

            {/* Act Type */}
            <div className="maf-field">
              <label className="maf-label">
                Type d'acte <span className="maf-required">*</span>
              </label>
              <div className="maf-type-grid">
                {ACT_TYPES.map(type => (
                  <div
                    key={type.value}
                    className={`maf-type-card ${form.actType === type.value ? 'selected' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, actType: type.value }))}
                  >
                    <span className="maf-type-icon">{type.icon}</span>
                    <span className="maf-type-label">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="maf-field">
              <label className="maf-label">Catégorie</label>
              <div className="maf-category-group">
                {CATEGORY_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={`maf-category-chip ${form.category === opt.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={opt.value}
                      checked={form.category === opt.value}
                      onChange={handleChange}
                      hidden
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Doctor */}
            <div className="maf-field">
              <label className="maf-label">
                Médecin responsable <span className="maf-required">*</span>
              </label>
              <select
                name="doctorId"
                className={`maf-input ${errors.doctorId ? 'maf-input-error' : ''}`}
                value={form.doctorId}
                onChange={handleChange}
              >
                <option value="">-- Sélectionner un médecin --</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.first_name} {doc.last_name} {doc.specialization ? `(${doc.specialization})` : ''}
                  </option>
                ))}
              </select>
              {errors.doctorId && <span className="maf-error-msg"><FiAlertCircle />{errors.doctorId}</span>}
            </div>

            {/* Diagnosis */}
            <div className="maf-field">
              <label className="maf-label">
                Diagnostic <span className="maf-required">*</span>
              </label>
              <input
                type="text"
                name="diagnosis"
                className={`maf-input ${errors.diagnosis ? 'maf-input-error' : ''}`}
                placeholder="Ex: Polyarthrite Rhumatoïde"
                value={form.diagnosis}
                onChange={handleChange}
              />
              {errors.diagnosis && <span className="maf-error-msg"><FiAlertCircle />{errors.diagnosis}</span>}
            </div>

            {/* Report */}
            <div className="maf-field">
              <label className="maf-label">Rapport clinique</label>
              <textarea
                name="report"
                className="maf-textarea"
                placeholder="Détails de l'examen, observations..."
                rows={4}
                value={form.report}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Step 3 — Lab Results */}
        {step === 3 && (
          <div className="maf-section">
            <div className="maf-section-title">
              <FiTarget className="maf-section-icon" />
              <span>Résultats de laboratoire</span>
            </div>
            
            {form.labResults.length > 0 && (
              <div className="maf-lab-results-list">
                {form.labResults.map((result, idx) => (
                  <div key={idx} className="maf-lab-result-item">
                    <div className="maf-lab-result-content">
                      <div className="maf-lab-result-header">
                        <span className="maf-lab-result-name">{result.name}</span>
                        <span className="maf-lab-result-value">{result.value} {result.unit}</span>
                      </div>
                      <span className="maf-lab-result-date">{result.date}</span>
                      {result.abnormal && <span className="maf-lab-result-abnormal">Anormal</span>}
                    </div>
                    <button
                      type="button"
                      className="maf-lab-result-remove"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        labResults: prev.labResults.filter((_, i) => i !== idx)
                      }))}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="maf-lab-result-form">
              <div className="maf-grid-2">
                <div className="maf-field">
                  <label className="maf-label">Analyse</label>
                  <input
                    type="text"
                    id="lab-name"
                    className="maf-input"
                    placeholder="Ex: Glycémie"
                  />
                </div>
                <div className="maf-field">
                  <label className="maf-label">Valeur</label>
                  <input
                    type="text"
                    id="lab-value"
                    className="maf-input"
                    placeholder="Ex: 95"
                  />
                </div>
              </div>
              
              <div className="maf-grid-2">
                <div className="maf-field">
                  <label className="maf-label">Unité</label>
                  <input
                    type="text"
                    id="lab-unit"
                    className="maf-input"
                    placeholder="Ex: mg/dL"
                  />
                </div>
                <div className="maf-field">
                  <label className="maf-label">Date</label>
                  <input
                    type="date"
                    id="lab-date"
                    className="maf-input"
                    defaultValue={form.date}
                  />
                </div>
              </div>
              
              <div className="maf-field">
                <label className="maf-label">Catégorie</label>
                <select id="lab-category" className="maf-input">
                  <option value="">-- Sélectionner --</option>
                  <option value="Hématologie">Hématologie</option>
                  <option value="Biochimie">Biochimie</option>
                  <option value="Immunologie">Immunologie</option>
                  <option value="Microbiologie">Microbiologie</option>
                </select>
              </div>
              
              <div className="maf-field checkbox">
                <label>
                  <input type="checkbox" id="lab-abnormal" />
                  <span>Résultat anormal</span>
                </label>
              </div>
              
              <div className="maf-field">
                <label className="maf-label">Notes</label>
                <textarea
                  id="lab-notes"
                  className="maf-textarea"
                  placeholder="Observations supplémentaires..."
                  rows={2}
                />
              </div>
              
              <button
                type="button"
                className="maf-btn-add-lab"
                onClick={() => {
                  const name = document.getElementById('lab-name').value.trim();
                  const value = document.getElementById('lab-value').value.trim();
                  if (!name || !value) {
                    alert('Veuillez entrer l\'analyse et la valeur');
                    return;
                  }
                  setForm(prev => ({
                    ...prev,
                    labResults: [...prev.labResults, {
                      name,
                      value,
                      unit: document.getElementById('lab-unit').value.trim(),
                      date: document.getElementById('lab-date').value,
                      category: document.getElementById('lab-category').value || null,
                      abnormal: document.getElementById('lab-abnormal').checked,
                      notes: document.getElementById('lab-notes').value.trim() || null,
                    }]
                  }));
                  document.getElementById('lab-name').value = '';
                  document.getElementById('lab-value').value = '';
                  document.getElementById('lab-unit').value = '';
                  document.getElementById('lab-category').value = '';
                  document.getElementById('lab-abnormal').checked = false;
                  document.getElementById('lab-notes').value = '';
                }}
              >
                <FiPlus /> Ajouter un résultat
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Billing */}
        {step === 4 && (
          <div className="maf-section">
            <div className="maf-section-title">
              <FiDollarSign className="maf-section-icon" />
              <span>Facturation & Finalisation</span>
            </div>

            <div className="maf-grid-2">
              {/* Amount */}
              <div className="maf-field">
                <label className="maf-label">
                  Montant (DH) <span className="maf-required">*</span>
                </label>
                <div className="maf-input-icon-wrapper">
                  <FiDollarSign className="maf-input-icon" />
                  <input
                    type="number"
                    name="amount"
                    className={`maf-input maf-input-with-icon ${errors.amount ? 'maf-input-error' : ''}`}
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                  />
                </div>
                {errors.amount && <span className="maf-error-msg"><FiAlertCircle />{errors.amount}</span>}
              </div>

              {/* Status */}
              <div className="maf-field">
                <label className="maf-label">Statut</label>
                <div className="maf-status-group">
                  <label className={`maf-status-chip completed ${form.status === 'completed' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="completed"
                      checked={form.status === 'completed'}
                      onChange={handleChange}
                      hidden
                    />
                    <FiCheck /> Terminé
                  </label>
                  <label className={`maf-status-chip pending ${form.status === 'pending' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="status"
                      value="pending"
                      checked={form.status === 'pending'}
                      onChange={handleChange}
                      hidden
                    />
                    <FiClock /> En cours
                  </label>
                </div>
              </div>
            </div>

            {/* Treatment */}
            <div className="maf-field">
              <label className="maf-label">Traitement / Ordonnance</label>
              <textarea
                name="treatment"
                className="maf-textarea"
                placeholder="Médicaments prescrits, doses..."
                rows={3}
                value={form.treatment}
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div className="maf-field">
              <label className="maf-label">Notes additionnelles</label>
              <textarea
                name="notes"
                className="maf-textarea"
                placeholder="Observations, commentaires..."
                rows={2}
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            {errors.submit && (
              <div className="maf-error-banner">
                <FiAlertCircle /> {errors.submit}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="maf-nav">
          {step > 1 ? (
            <button type="button" className="maf-btn-back" onClick={handleBack}>
              <FiChevronLeft /> Précédent
            </button>
          ) : (
            <div />
          )}

          <div className="maf-nav-right">
            <button type="button" className="maf-btn-cancel" onClick={onClose}>
              Annuler
            </button>
            {step < 4 ? (
              <button type="button" className="maf-btn-next" onClick={handleNext}>
                Suivant <FiChevronRight />
              </button>
            ) : (
              <button 
                type="submit" 
                className="maf-btn-submit" 
                disabled={isSubmitting}
                onClick={() => setUserIntentToSubmit(true)}
              >
                {isSubmitting ? 'Enregistrement...' : (isEdit ? "Modifier l'acte" : "Valider l'acte")}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default MedicalActForm;
