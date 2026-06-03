import React from 'react';

const DynamicFormRenderer = ({ template, formData, setFormData }) => {
  if (!template || !template.schema_json) return null;

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="dynamic-form-renderer">
      <div className="maf-dynamic-form-title">
        <h4>{template.title}</h4>
        <p>Renseignez les champs du formulaire personnalisé.</p>
      </div>
      <div className="maf-grid-2">
        {template.schema_json.map((field) => (
          <div
            key={field.id}
            className={`maf-field ${field.type === 'textarea' ? 'maf-field-full' : ''}`}
          >
            <label className="maf-label">
              {field.label} {field.required && <span className="maf-required">*</span>}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                className="maf-input"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'textarea' && (
              <textarea
                className="maf-textarea"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                rows={3}
              />
            )}
            
            {field.type === 'number' && (
              <input
                type="number"
                className="maf-input"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'date' && (
              <input
                type="date"
                className="maf-input"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'select' && (
              <select
                className="maf-input"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              >
                <option value="">-- Sélectionner --</option>
                {field.options?.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            
            {field.type === 'checkbox' && (
              <label className="maf-checkbox-card">
                <input
                  type="checkbox"
                  checked={formData[field.name] || false}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  required={field.required}
                />
                <span>Oui / Non</span>
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicFormRenderer;
