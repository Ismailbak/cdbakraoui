import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { createActResult, getPatientMedicalActs } from '../../api/api';
import './LabResultForm.css';

function LabResultForm({ patientId, onSuccess, onClose }) {
  const [form, setForm] = useState({
    act_id: '',
    result_date: new Date().toISOString().split('T')[0],
    result_name: '',
    result_value: '',
    result_unit: '',
    result_category: '',
    is_abnormal: false,
    notes: '',
  });

  const [medicalActs, setMedicalActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchMedicalActs = async () => {
      try {
        const res = await getPatientMedicalActs(patientId);
        setMedicalActs(res.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des actes:', error);
      }
    };
    fetchMedicalActs();
  }, [patientId]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.act_id) newErrors.act_id = 'Sélectionnez un acte médical';
    if (!form.result_name) newErrors.result_name = 'Le nom de l\'analyse est requis';
    if (!form.result_value) newErrors.result_value = 'La valeur du résultat est requise';
    if (!form.result_date) newErrors.result_date = 'La date est requise';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        act_id: parseInt(form.act_id),
        patient_id: patientId,
        result_date: form.result_date,
        result_name: form.result_name,
        result_value: form.result_value,
        result_unit: form.result_unit || null,
        result_category: form.result_category || null,
        is_abnormal: form.is_abnormal,
        notes: form.notes || null,
      };

      await createActResult(submissionData);
      setSuccessMessage('Résultat de laboratoire ajouté avec succès!');
      
      // Reset form
      setForm({
        act_id: '',
        result_date: new Date().toISOString().split('T')[0],
        result_name: '',
        result_value: '',
        result_unit: '',
        result_category: '',
        is_abnormal: false,
        notes: '',
      });
      setErrors({});

      // Call onSuccess callback
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la création du résultat:', error);
      setErrors({ submit: error.message || 'Une erreur est survenue' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lab-result-form-container">
      <div className="form-header">
        <h2>Ajouter un résultat de laboratoire</h2>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          <FiCheck /> {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="error-message">
          <FiAlertCircle /> {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="lab-result-form">
        <div className="form-section">
          <h3>Informations du résultat</h3>

          {/* Medical Act Selection */}
          <div className="form-group">
            <label htmlFor="act_id">Acte médical *</label>
            <select
              id="act_id"
              name="act_id"
              value={form.act_id}
              onChange={handleChange}
              className={errors.act_id ? 'error' : ''}
            >
              <option value="">-- Sélectionnez un acte --</option>
              {medicalActs.map(act => (
                <option key={act.id} value={act.id}>
                  {act.act_type} - {new Date(act.date).toLocaleDateString('fr-FR')}
                </option>
              ))}
            </select>
            {errors.act_id && <span className="error-text">{errors.act_id}</span>}
          </div>

          {/* Result Date */}
          <div className="form-group">
            <label htmlFor="result_date">Date du résultat *</label>
            <input
              id="result_date"
              type="date"
              name="result_date"
              value={form.result_date}
              onChange={handleChange}
              className={errors.result_date ? 'error' : ''}
            />
            {errors.result_date && <span className="error-text">{errors.result_date}</span>}
          </div>

          {/* Result Name */}
          <div className="form-group">
            <label htmlFor="result_name">Nom de l'analyse *</label>
            <input
              id="result_name"
              type="text"
              name="result_name"
              placeholder="Ex: Glycémie, Créatinine, etc."
              value={form.result_name}
              onChange={handleChange}
              className={errors.result_name ? 'error' : ''}
            />
            {errors.result_name && <span className="error-text">{errors.result_name}</span>}
          </div>

          {/* Result Value */}
          <div className="form-group">
            <label htmlFor="result_value">Valeur du résultat *</label>
            <input
              id="result_value"
              type="text"
              name="result_value"
              placeholder="Ex: 95, 1.2, etc."
              value={form.result_value}
              onChange={handleChange}
              className={errors.result_value ? 'error' : ''}
            />
            {errors.result_value && <span className="error-text">{errors.result_value}</span>}
          </div>

          {/* Result Unit */}
          <div className="form-group">
            <label htmlFor="result_unit">Unité</label>
            <input
              id="result_unit"
              type="text"
              name="result_unit"
              placeholder="Ex: mg/dL, mmol/L, etc."
              value={form.result_unit}
              onChange={handleChange}
            />
          </div>

          {/* Result Category */}
          <div className="form-group">
            <label htmlFor="result_category">Catégorie</label>
            <select
              id="result_category"
              name="result_category"
              value={form.result_category}
              onChange={handleChange}
            >
              <option value="">-- Sélectionnez une catégorie --</option>
              <option value="Hématologie">Hématologie</option>
              <option value="Biochimie">Biochimie</option>
              <option value="Immunologie">Immunologie</option>
              <option value="Microbiologie">Microbiologie</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Abnormal Flag */}
          <div className="form-group checkbox">
            <label htmlFor="is_abnormal">
              <input
                id="is_abnormal"
                type="checkbox"
                name="is_abnormal"
                checked={form.is_abnormal}
                onChange={handleChange}
              />
              <span>Résultat anormal</span>
            </label>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">Notes supplémentaires</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Ajoutez des notes si nécessaire..."
              value={form.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Ajout en cours...' : 'Ajouter le résultat'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LabResultForm;
