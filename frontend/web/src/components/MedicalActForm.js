import React, { useState, useEffect } from 'react';
import {
  FiUser, FiCalendar, FiActivity, FiClipboard, FiCheck, FiX,
  FiChevronRight, FiChevronLeft, FiSearch, FiAlertCircle, FiPlus,
  FiFileText, FiImage, FiZap, FiTarget, FiDollarSign, FiClock, FiEdit3
} from 'react-icons/fi';
import { getPatients, createMedicalAct, updateMedicalAct } from '../api/api';
import './MedicalActForm.css';

const CATEGORY_OPTIONS = [
  { value: 'rheumatology', label: 'Rhumatologie', color: 'rheumatology' },
  { value: 'imaging', label: 'Imagerie', color: 'imaging' },
  { value: 'intervention', label: 'Intervention', color: 'intervention' },
  { value: 'laboratory', label: 'Laboratoire', color: 'laboratory' },
];

const ACT_TYPES = [
  { value: 'Consultation', label: 'Consultation', icon: <FiUser /> },
  { value: 'Examen', label: 'Examen', icon: <FiActivity /> },
  { value: 'Infiltration', label: 'Infiltration', icon: <FiZap /> },
  { value: 'Échographie', label: 'Échographie', icon: <FiImage /> },
  { value: 'Soin', label: 'Soin', icon: <FiTarget /> },
];

const STEPS = [
  { id: 1, label: 'Patient & Date', icon: FiUser },
  { id: 2, label: 'Détails', icon: FiActivity },
  { id: 3, label: 'Facturation', icon: FiDollarSign },
];

const EMPTY_FORM = {
  patientId: '',
  patientName: '',
  date: new Date().toISOString().split('T')[0],
  actType: 'Consultation',
  category: 'rheumatology',
  diagnosis: '',
  report: '',
  amount: '',
  status: 'pending',
  treatment: '',
  notes: '',
};

function MedicalActForm({ onSuccess, onClose, initialData, isEdit }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (step === 1) {
      loadPatients();
    }
  }, [step]);

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

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.ipp && p.ipp.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const selectPatient = (patient) => {
    setForm(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name
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
      if (!form.diagnosis.trim()) newErrors.diagnosis = 'Le diagnostic est requis';
      if (!form.actType) newErrors.actType = "Le type d'acte est requis";
    }
    if (s === 3) {
      if (!form.amount) newErrors.amount = 'Le montant est requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      // Map form to backend expectations
      const payload = {
        patient_id: form.patientId,
        date: form.date,
        act_type: form.actType,
        category: form.category,
        diagnosis: form.diagnosis,
        report: form.report,
        amount: parseFloat(form.amount),
        status: form.status,
        treatment: form.treatment,
        notes: form.notes,
      };

      if (isEdit && form.id) {
        await updateMedicalAct(form.id, payload);
      } else {
        await createMedicalAct(payload);
      }

      setSubmitted(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setErrors({ submit: "Erreur lors de l'enregistrement de l'acte." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="maf-success">
        <div className="maf-success-icon">
          <FiCheck />
        </div>
        <h3>Acte enregistré !</h3>
        <p>L'acte médical pour {form.patientName} a été validé.</p>
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
            <h2 className="maf-title">{isEdit ? 'Modifier l’Acte' : 'Nouvel Acte Médical'}</h2>
            <p className="maf-subtitle">Remplissez les détails cliniques et facturation</p>
          </div>
        </div>
        <button className="maf-close-btn" onClick={onClose} type="button">
          <FiX />
        </button>
      </div>

      {/* Step Indicator */}
      <div className="maf-steps">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isCompleted = step > s.id;
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

      <form className="maf-form" onSubmit={handleSubmit}>
        {/* Step 1: Patient & Date */}
        {step === 1 && (
          <div className="maf-section">
            <div className="maf-section-title">
              <FiUser className="maf-section-icon" />
              <span>Patient & Date de l'acte</span>
            </div>

            <div className="maf-field">
              <label className="maf-label">Sélectionner un patient <span className="maf-required">*</span></label>
              <div className="maf-search-box">
                <FiSearch className="maf-search-icon" />
                <input
                  type="text"
                  className="maf-search-input"
                  placeholder="Rechercher par nom ou IPP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="maf-patient-list">
                {isLoadingPatients ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Chargement...</div>
                ) : (
                  filteredPatients.map(p => (
                    <div
                      key={p.id}
                      className={`maf-patient-card ${form.patientId === p.id ? 'selected' : ''}`}
                      onClick={() => selectPatient(p)}
                    >
                      <div className="maf-patient-avatar">👤</div>
                      <div className="maf-patient-info">
                        <span className="maf-patient-name">{p.name}</span>
                        <span className="maf-patient-meta">IPP: {p.ipp || 'N/A'} • {p.age} ans</span>
                      </div>
                      {form.patientId === p.id && <FiCheck className="maf-patient-check" />}
                    </div>
                  ))
                )}
                {filteredPatients.length === 0 && !isLoadingPatients && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Aucun patient trouvé</div>
                )}
              </div>
              {errors.patientId && <span className="maf-error-msg"><FiAlertCircle />{errors.patientId}</span>}
            </div>

            <div className="maf-field">
              <label className="maf-label">Date de l'acte <span className="maf-required">*</span></label>
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

        {/* Step 2: Act Details */}
        {step === 2 && (
          <div className="maf-section">
            <div className="maf-section-title">
              <FiActivity className="maf-section-icon" />
              <span>Détails de l'acte médical</span>
            </div>

            <div className="maf-field">
              <label className="maf-label">Type d'acte <span className="maf-required">*</span></label>
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

            <div className="maf-field">
              <label className="maf-label">Catégorie</label>
              <div className="maf-category-group">
                {CATEGORY_OPTIONS.map(opt => (
                  <div
                    key={opt.value}
                    className={`maf-cat-chip ${opt.color} ${form.category === opt.value ? 'selected' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, category: opt.value }))}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="maf-field">
              <label className="maf-label">Diagnostic <span className="maf-required">*</span></label>
              <input
                type="text"
                name="diagnosis"
                placeholder="Ex: Polyarthrite Rhumatoïde"
                className={`maf-input ${errors.diagnosis ? 'maf-input-error' : ''}`}
                value={form.diagnosis}
                onChange={handleChange}
              />
              {errors.diagnosis && <span className="maf-error-msg"><FiAlertCircle />{errors.diagnosis}</span>}
            </div>

            <div className="maf-field">
              <label className="maf-label">Rapport clinique</label>
              <textarea
                name="report"
                placeholder="Détails de l'examen, observations..."
                className="maf-textarea"
                rows={4}
                value={form.report}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Step 3: Billing & Status */}
        {step === 3 && (
          <div className="maf-section">
            <div className="maf-section-title">
              <FiDollarSign className="maf-section-icon" />
              <span>Facturation & Statut final</span>
            </div>

            <div className="maf-row">
              <div className="maf-field">
                <label className="maf-label">Montant (DH) <span className="maf-required">*</span></label>
                <div className="maf-input-icon-wrapper">
                  <FiDollarSign className="maf-input-icon" />
                  <input
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    className={`maf-input maf-input-with-icon ${errors.amount ? 'maf-input-error' : ''}`}
                    value={form.amount}
                    onChange={handleChange}
                  />
                </div>
                {errors.amount && <span className="maf-error-msg"><FiAlertCircle />{errors.amount}</span>}
              </div>

              <div className="maf-field">
                <label className="maf-label">Statut</label>
                <div className="maf-status-toggle">
                  <button
                    type="button"
                    className={`maf-status-btn ${form.status === 'completed' ? 'active completed' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, status: 'completed' }))}
                  >
                    <FiCheck /> Terminé
                  </button>
                  <button
                    type="button"
                    className={`maf-status-btn ${form.status === 'pending' ? 'active pending' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, status: 'pending' }))}
                  >
                    <FiClock /> En cours
                  </button>
                </div>
              </div>
            </div>

            <div className="maf-field">
              <label className="maf-label">Traitement / Ordonnance</label>
              <textarea
                name="treatment"
                placeholder="Médicaments prescrits, doses..."
                className="maf-textarea"
                rows={3}
                value={form.treatment}
                onChange={handleChange}
              />
            </div>

            <div className="maf-field">
              <label className="maf-label">Notes additionnelles</label>
              <textarea
                name="notes"
                placeholder="Observations administratives ou autres..."
                className="maf-textarea"
                rows={2}
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            {errors.submit && <div className="maf-error-banner"><FiAlertCircle /> {errors.submit}</div>}
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
            <button type="button" className="maf-btn-cancel" onClick={onClose}>Annuler</button>
            {step < 3 ? (
              <button type="button" className="maf-btn-next" onClick={handleNext}>
                Suivant <FiChevronRight />
              </button>
            ) : (
              <button type="submit" className="maf-btn-submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : (isEdit ? "Modifier l'acte" : "Valider l'acte")}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default MedicalActForm;
