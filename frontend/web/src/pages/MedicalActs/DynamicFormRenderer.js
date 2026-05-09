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
      <h4>{template.title}</h4>
      <div className="form-row">
        {template.schema_json.map((field) => (
          <div key={field.id} className="form-group half-width">
            <label>
              {field.label} {field.required && <span className="required-asterisk">*</span>}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'textarea' && (
              <textarea
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                rows={3}
              />
            )}
            
            {field.type === 'number' && (
              <input
                type="number"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'date' && (
              <input
                type="date"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}
            
            {field.type === 'select' && (
              <select
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
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData[field.name] || false}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  required={field.required}
                />
                <span style={{ fontWeight: 'normal', color: '#64748b' }}>Oui / Non</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicFormRenderer;
