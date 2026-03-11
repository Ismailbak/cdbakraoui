import React, { useState, useEffect } from 'react';
import {
  FiUser, FiPhone, FiMail, FiMapPin, FiShield,
  FiFileText, FiChevronRight, FiChevronLeft, FiCheck, FiX,
  FiAlertCircle, FiUserPlus, FiEdit2, FiHeart, FiAlertTriangle, FiHome
} from 'react-icons/fi';
import { createPatient, updatePatient } from '../../api/api';
import './PatientForm.css';


const INSURANCE_OPTIONS = [
  { value: '', label: 'Sélectionner une assurance' },
  { value: 'CNSS', label: 'CNSS' },
  { value: 'CNOPS', label: 'CNOPS' },
  { value: 'RAMED', label: 'RAMED' },
  { value: 'FAR', label: 'FAR' },
  { value: 'Assurance privée', label: 'Assurance privée' },
  { value: 'Sans assurance', label: 'Sans assurance' },
  { value: 'Autre', label: 'Autre' },
];

const DIAGNOSIS_OPTIONS = [
  { value: '', label: 'Sélectionner un diagnostic' },
  { value: 'Polyarthrite rhumatoïde', label: 'Polyarthrite rhumatoïde' },
  { value: 'Lupus érythémateux', label: 'Lupus érythémateux' },
  { value: 'Arthrose', label: 'Arthrose' },
  { value: 'Fibromyalgie', label: 'Fibromyalgie' },
  { value: 'Spondylarthrite', label: 'Spondylarthrite' },
  { value: 'Sclérodermie', label: 'Sclérodermie' },
  { value: 'Goutte', label: 'Goutte' },
  { value: 'Autre', label: 'Autre' },
];

const BLOOD_TYPE_OPTIONS = [
  { value: '', label: 'Sélectionner' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const STEPS = [
  { id: 1, label: 'Identité', icon: FiUser },
  { id: 2, label: 'Contact', icon: FiPhone },
  { id: 3, label: 'Assurance', icon: FiShield },
  { id: 4, label: 'Médical', icon: FiHeart },
  { id: 5, label: 'Urgence', icon: FiAlertTriangle },
];

const initialForm = {
  ipp: '',
  name: '',
  birthDate: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  insurance: '',
  insuranceNumber: '',
  bloodType: '',
  allergies: '',
  diagnosis: '',
  notes: '',
  notesAdmin: '',
  emergencyName: '',
  emergencyRelation: '',
  emergencyPhone: '',
};

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function PatientForm({ onSuccess, onClose, initialData = null, isEdit = false }) {
  const getInitialForm = () => {
    if (initialData) {
      return {
        ipp: initialData.ipp || '',
        name: initialData.name || '',
        birthDate: initialData.date_of_birth || initialData.birthDate || '',
        gender: initialData.gender?.toLowerCase() === 'homme' ? 'homme' : 
                initialData.gender?.toLowerCase() === 'femme' ? 'femme' : '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        city: initialData.city || '',
        insurance: initialData.insurance || '',
        insuranceNumber: initialData.insurance_number || initialData.insuranceNumber || '',
        bloodType: initialData.blood_type || initialData.bloodType || '',
        allergies: initialData.allergies || '',
        diagnosis: initialData.diagnosis || '',
        notes: initialData.notes || '',
        notesAdmin: initialData.notes_admin || initialData.notesAdmin || '',
        emergencyName: initialData.emergency_contact_name || initialData.emergencyName || '',
        emergencyRelation: initialData.emergency_contact_relation || initialData.emergencyRelation || '',
        emergencyPhone: initialData.emergency_contact_phone || initialData.emergencyPhone || '',
      };
    }
    return initialForm;
  };

  const [form, setForm] = useState(getInitialForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false); // Only allow submit after step 5 is visible

  // Update form if initialData changes (for reuse in editing different patients)
  useEffect(() => {
    if (initialData) {
      setForm(getInitialForm());
    }
  }, [initialData]);

  // Enable submit only after step 5 is rendered
  useEffect(() => {
    if (step === 5) {
      // Small delay to ensure step 5 is visible before allowing submit
      const timer = setTimeout(() => setCanSubmit(true), 100);
      return () => clearTimeout(timer);
    } else {
      setCanSubmit(false);
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (s) => {
    const newErrors = {};
    if (s === 1) {
      if (!form.name.trim()) newErrors.name = 'Le nom est requis';
      if (!form.birthDate) newErrors.birthDate = 'La date de naissance est requise';
      if (!form.gender) newErrors.gender = 'Le genre est requis';
    }
    if (s === 4) {
      if (!form.diagnosis) newErrors.diagnosis = 'Le diagnostic est requis';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => s - 1);

  // Prevent Enter key from submitting the form before step 5 or when not ready
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (step < 5) {
        handleNext();
      }
      // If step === 5, don't do anything on Enter - user must click the button
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 5 || !canSubmit) {
      if (step < 5) {
        handleNext();
      }
      return;
    }
    if (!validateStep(5)) return;
    setIsSubmitting(true);
    try {
      const age = form.birthDate ? calculateAge(form.birthDate) : 0;
      const genderLabel = form.gender === 'homme' ? 'Homme' : 'Femme';
      const patientData = {
        ipp: form.ipp || null,
        name: form.name,
        age,
        gender: genderLabel,
        date_of_birth: form.birthDate || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        city: form.city || null,
        insurance: form.insurance || null,
        insurance_number: form.insuranceNumber || null,
        blood_type: form.bloodType || null,
        allergies: form.allergies || null,
        diagnosis: form.diagnosis,
        notes: form.notes || null,
        notes_admin: form.notesAdmin || null,
        emergency_contact_name: form.emergencyName || null,
        emergency_contact_relation: form.emergencyRelation || null,
        emergency_contact_phone: form.emergencyPhone || null,
        status: initialData?.status || 'Actif',
      };

      if (isEdit && initialData?.id) {
        await updatePatient(initialData.id, patientData);
      } else {
        await createPatient(patientData);
      }
      setSubmitted(true);
      setTimeout(() => {
        setForm(initialForm);
        setStep(1);
        setSubmitted(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1400);
    } catch {
      setErrors({ submit: isEdit ? 'Erreur lors de la modification du patient. Veuillez réessayer.' : 'Erreur lors de l\'ajout du patient. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pf-success">
        <div className="pf-success-icon">
          <FiCheck />
        </div>
        <h3>{isEdit ? 'Patient modifié avec succès !' : 'Patient ajouté avec succès !'}</h3>
        <p>{form.name} a été {isEdit ? 'mis à jour' : 'enregistré'} dans le système.</p>
      </div>
    );
  }

  return (
    <div className="pf-wrapper">
      {/* Header */}
      <div className="pf-header">
        <div className="pf-header-left">
          <div className="pf-header-icon">
            {isEdit ? <FiEdit2 /> : <FiUserPlus />}
          </div>
          <div>
            <h2 className="pf-title">{isEdit ? 'Modifier Patient' : 'Nouveau Patient'}</h2>
            <p className="pf-subtitle">{isEdit ? 'Modifiez les informations du patient' : 'Remplissez les informations du patient'}</p>
          </div>
        </div>
        {onClose && (
          <button className="pf-close-btn" onClick={onClose} type="button" aria-label="Fermer">
            <FiX />
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="pf-steps">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isCompleted = step > s.id;
          const isActive = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className={`pf-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="pf-step-circle">
                  {isCompleted ? <FiCheck /> : <Icon />}
                </div>
                <span className="pf-step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`pf-step-line ${isCompleted ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form */}
      <form className="pf-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
        {/* Step 1 — Identity */}
        {step === 1 && (
          <div className="pf-section">
            <div className="pf-section-title">
              <FiUser className="pf-section-icon" />
              <span>Informations personnelles</span>
            </div>
            <div className="pf-grid-2">
              <div className="pf-field">
                <label className="pf-label">
                  IPP <span className="pf-optional">(optionnel)</span>
                </label>
                <input
                  className="pf-input"
                  type="text"
                  name="ipp"
                  value={form.ipp}
                  onChange={handleChange}
                  placeholder="Ex: PAT-001"
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">
                  Nom complet <span className="pf-required">*</span>
                </label>
                <input
                  className={`pf-input ${errors.name ? 'pf-input-error' : ''}`}
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Prénom et nom"
                />
                {errors.name && <span className="pf-error-msg"><FiAlertCircle />{errors.name}</span>}
              </div>
              <div className="pf-field">
                <label className="pf-label">
                  Date de naissance <span className="pf-required">*</span>
                </label>
                <input
                  className={`pf-input ${errors.birthDate ? 'pf-input-error' : ''}`}
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                />
                {errors.birthDate && <span className="pf-error-msg"><FiAlertCircle />{errors.birthDate}</span>}
              </div>
              <div className="pf-field">
                <label className="pf-label">
                  Genre <span className="pf-required">*</span>
                </label>
                <div className="pf-radio-group">
                  {[{ value: 'homme', label: '👨 Homme' }, { value: 'femme', label: '👩 Femme' }].map(opt => (
                    <label
                      key={opt.value}
                      className={`pf-radio-card ${form.gender === opt.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={opt.value}
                        checked={form.gender === opt.value}
                        onChange={handleChange}
                        hidden
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {errors.gender && <span className="pf-error-msg"><FiAlertCircle />{errors.gender}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Contact */}
        {step === 2 && (
          <div className="pf-section">
            <div className="pf-section-title">
              <FiPhone className="pf-section-icon" />
              <span>Coordonnées de contact</span>
            </div>
            <div className="pf-grid-2">
              <div className="pf-field">
                <label className="pf-label">Téléphone</label>
                <div className="pf-input-icon-wrapper">
                  <FiPhone className="pf-input-icon" />
                  <input
                    className="pf-input pf-input-with-icon"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+212 6 XX XX XX XX"
                  />
                </div>
              </div>
              <div className="pf-field">
                <label className="pf-label">Email</label>
                <div className="pf-input-icon-wrapper">
                  <FiMail className="pf-input-icon" />
                  <input
                    className="pf-input pf-input-with-icon"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>
              <div className="pf-field pf-field-full">
                <label className="pf-label">Adresse</label>
                <div className="pf-input-icon-wrapper">
                  <FiHome className="pf-input-icon" />
                  <input
                    className="pf-input pf-input-with-icon"
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="123 Rue Example, Apt 4..."
                  />
                </div>
              </div>
              <div className="pf-field pf-field-full">
                <label className="pf-label">Ville</label>
                <div className="pf-input-icon-wrapper">
                  <FiMapPin className="pf-input-icon" />
                  <input
                    className="pf-input pf-input-with-icon"
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Casablanca, Rabat..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Insurance */}
        {step === 3 && (
          <div className="pf-section">
            <div className="pf-section-title">
              <FiShield className="pf-section-icon" />
              <span>Assurance & Mutuelle</span>
            </div>
            <div className="pf-grid-2">
              <div className="pf-field">
                <label className="pf-label">Type d'assurance</label>
                <select
                  className="pf-select"
                  name="insurance"
                  value={form.insurance}
                  onChange={handleChange}
                >
                  {INSURANCE_OPTIONS.map(opt => (
                    <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="pf-field">
                <label className="pf-label">N° carte d'assurance</label>
                <div className="pf-input-icon-wrapper">
                  <FiShield className="pf-input-icon" />
                  <input
                    className="pf-input pf-input-with-icon"
                    type="text"
                    name="insuranceNumber"
                    value={form.insuranceNumber}
                    onChange={handleChange}
                    placeholder="Numéro de carte"
                    disabled={!form.insurance || form.insurance === 'Sans assurance'}
                  />
                </div>
              </div>
            </div>
            {(!form.insurance || form.insurance === 'Sans assurance') && (
              <div className="pf-info-banner">
                <FiAlertCircle />
                <span>Sélectionnez un type d'assurance pour renseigner le numéro de carte.</span>
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Medical */}
        {step === 4 && (
          <div className="pf-section">
            <div className="pf-section-title">
              <FiHeart className="pf-section-icon" />
              <span>Informations médicales</span>
            </div>
            <div className="pf-grid-2">
              <div className="pf-field">
                <label className="pf-label">
                  Diagnostic initial <span className="pf-required">*</span>
                </label>
                <select
                  className={`pf-select ${errors.diagnosis ? 'pf-input-error' : ''}`}
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={handleChange}
                >
                  {DIAGNOSIS_OPTIONS.map(opt => (
                    <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.diagnosis && <span className="pf-error-msg"><FiAlertCircle />{errors.diagnosis}</span>}
              </div>
              <div className="pf-field">
                <label className="pf-label">Groupe sanguin</label>
                <select
                  className="pf-select"
                  name="bloodType"
                  value={form.bloodType}
                  onChange={handleChange}
                >
                  {BLOOD_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="pf-field pf-field-full">
                <label className="pf-label">
                  Allergies <span className="pf-optional">(séparées par des virgules)</span>
                </label>
                <input
                  className="pf-input"
                  type="text"
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  placeholder="Ex: Pénicilline, Aspirine, Latex..."
                />
              </div>
              <div className="pf-field pf-field-full">
                <label className="pf-label">
                  Notes médicales <span className="pf-optional">(optionnel)</span>
                </label>
                <textarea
                  className="pf-textarea"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Antécédents médicaux, observations cliniques..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Emergency Contact */}
        {step === 5 && (
          <div className="pf-section">
            <div className="pf-section-title">
              <FiAlertTriangle className="pf-section-icon" />
              <span>Contact d'urgence & Notes</span>
            </div>
            <div className="pf-grid-2">
              <div className="pf-field">
                <label className="pf-label">Nom du contact</label>
                <input
                  className="pf-input"
                  type="text"
                  name="emergencyName"
                  value={form.emergencyName}
                  onChange={handleChange}
                  placeholder="Nom complet"
                />
              </div>
              <div className="pf-field">
                <label className="pf-label">Relation</label>
                <input
                  className="pf-input"
                  type="text"
                  name="emergencyRelation"
                  value={form.emergencyRelation}
                  onChange={handleChange}
                  placeholder="Ex: Conjoint, Parent, Enfant..."
                />
              </div>
              <div className="pf-field pf-field-full">
                <label className="pf-label">Téléphone d'urgence</label>
                <div className="pf-input-icon-wrapper">
                  <FiPhone className="pf-input-icon" />
                  <input
                    className="pf-input pf-input-with-icon"
                    type="tel"
                    name="emergencyPhone"
                    value={form.emergencyPhone}
                    onChange={handleChange}
                    placeholder="+212 6 XX XX XX XX"
                  />
                </div>
              </div>
              <div className="pf-field pf-field-full">
                <label className="pf-label">
                  Notes administratives <span className="pf-optional">(optionnel)</span>
                </label>
                <textarea
                  className="pf-textarea"
                  name="notesAdmin"
                  value={form.notesAdmin}
                  onChange={handleChange}
                  placeholder="Notes administratives, informations de facturation..."
                  rows={3}
                />
              </div>
            </div>
            {errors.submit && (
              <div className="pf-error-banner">
                <FiAlertCircle />
                <span>{errors.submit}</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="pf-nav">
          {step > 1 ? (
            <button type="button" className="pf-btn-back" onClick={handleBack}>
              <FiChevronLeft /> Précédent
            </button>
          ) : (
            <div />
          )}
          <div className="pf-nav-right">
            {onClose && (
              <button type="button" className="pf-btn-cancel" onClick={onClose}>
                Annuler
              </button>
            )}
            {step < 5 ? (
              <button type="button" className="pf-btn-next" onClick={handleNext}>
                Suivant <FiChevronRight />
              </button>
            ) : (
              <button type="submit" className="pf-btn-submit" disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? (
                  <span className="pf-spinner" />
                ) : (
                  <><FiCheck /> {isEdit ? 'Modifier le patient' : 'Ajouter le patient'}</>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default PatientForm;
