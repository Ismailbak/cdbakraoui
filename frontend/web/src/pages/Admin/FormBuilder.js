import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import './FormBuilder.css';
import { getDynamicTemplates, createDynamicTemplate, updateDynamicTemplate } from '../../api/api';

const FIELD_TYPES = [
  { value: 'text', label: 'Texte court' },
  { value: 'textarea', label: 'Texte long' },
  { value: 'number', label: 'Nombre' },
  { value: 'select', label: 'Liste déroulante' },
  { value: 'checkbox', label: 'Case à cocher' },
  { value: 'date', label: 'Date' }
];

const FormBuilder = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentTemplate, setCurrentTemplate] = useState({
    title: '',
    schema_json: [],
    is_active: true
  });
  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getDynamicTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setCurrentTemplate({
      ...currentTemplate,
      schema_json: [
        ...currentTemplate.schema_json,
        { id: Date.now().toString(), name: '', label: '', type: 'text', required: false, options: [] }
      ]
    });
  };

  const handleRemoveField = (id) => {
    setCurrentTemplate({
      ...currentTemplate,
      schema_json: currentTemplate.schema_json.filter(f => f.id !== id)
    });
  };

  const handleFieldChange = (id, key, value) => {
    setCurrentTemplate({
      ...currentTemplate,
      schema_json: currentTemplate.schema_json.map(f => 
        f.id === id ? { ...f, [key]: value } : f
      )
    });
  };

  const handleSave = async () => {
    if (!currentTemplate.title.trim()) {
      alert("Veuillez entrer un titre pour le formulaire.");
      return;
    }
    
    // Validate fields have names
    const hasEmptyNames = currentTemplate.schema_json.some(f => !f.name.trim() || !f.label.trim());
    if (hasEmptyNames) {
      alert("Tous les champs doivent avoir un nom (identifiant) et un libellé.");
      return;
    }

    try {
      if (currentTemplate.id) {
        await updateDynamicTemplate(currentTemplate.id, currentTemplate);
      } else {
        // Create and broadcast the created template id/title so other windows can auto-select it
        const res = await createDynamicTemplate(currentTemplate);
        try {
          const created = res.data;
          localStorage.setItem('dynamic_templates_updated', JSON.stringify({ id: created.id, title: created.title, ts: Date.now() }));
        } catch (e) {
          // ignore
        }
      }
      setIsEditing(false);
      setCurrentTemplate({ title: '', schema_json: [], is_active: true });
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert(error.response?.data?.detail || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const editExisting = (template) => {
    setCurrentTemplate(template);
    setIsEditing(true);
  };

  const startNew = () => {
    setCurrentTemplate({ title: '', schema_json: [], is_active: true });
    setIsEditing(true);
  };

  return (
    <Layout>
      <div className="form-builder-page">
        <div className="builder-header">
          <button className="back-btn" onClick={() => navigate('/admin')}>
            <FiArrowLeft /> Retour à l'administration
          </button>
          <h1>Générateur de Formulaires Dynamiques</h1>
          <p>Créez des formulaires sur mesure qui apparaîtront comme de nouveaux types de soins lors de la création d'un acte médical.</p>
        </div>

        {!isEditing ? (
          <div className="templates-dashboard">
            <div className="dashboard-actions">
              <h2>Formulaires Existants</h2>
              <button className="primary-btn" onClick={startNew}>
                <FiPlus /> Nouveau Formulaire
              </button>
            </div>
            
            {loading ? (
              <div className="empty-state"><p>Chargement...</p></div>
            ) : templates.length === 0 ? (
              <div className="empty-state">
                <p>Aucun formulaire dynamique n'a été créé pour le moment.</p>
              </div>
            ) : (
              <div className="templates-grid">
                {templates.map(t => (
                  <div key={t.id} className="template-card">
                    <div className="card-header">
                      <h3>{t.title}</h3>
                      <span className={`status-badge ${t.is_active ? 'active' : 'inactive'}`}>
                        {t.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <p>{t.schema_json.length} champs définis</p>
                    <button className="edit-btn" onClick={() => editExisting(t)}>
                      <FiEdit2 /> Modifier
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="builder-workspace">
            <div className="workspace-header">
              <h2>{currentTemplate.id ? 'Modifier le formulaire' : 'Créer un nouveau formulaire'}</h2>
              <div className="workspace-actions">
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>Annuler</button>
                <button className="save-btn" onClick={handleSave}><FiSave /> Enregistrer</button>
              </div>
            </div>

            <div className="form-metadata">
              <div className="form-group">
                <label>Titre du formulaire (Sera affiché comme Type de Soin) *</label>
                <input 
                  type="text" 
                  value={currentTemplate.title} 
                  onChange={(e) => setCurrentTemplate({...currentTemplate, title: e.target.value})}
                  placeholder="Ex: Suivi Infiltration Genou"
                />
              </div>
              <div className="form-group checkbox">
                <input 
                  type="checkbox" 
                  checked={currentTemplate.is_active}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, is_active: e.target.checked})}
                />
                <label>Formulaire actif (visible par les médecins)</label>
              </div>
            </div>

            <div className="fields-builder">
              <h3>Champs du formulaire</h3>
              
              {currentTemplate.schema_json.length === 0 ? (
                <div className="no-fields">
                  <p>Ce formulaire est vide. Ajoutez des champs pour commencer.</p>
                </div>
              ) : (
                <div className="fields-list">
                  {currentTemplate.schema_json.map((field, index) => (
                    <div key={field.id} className="field-editor">
                      <div className="field-editor-header">
                        <h4>Champ #{index + 1}</h4>
                        <button className="delete-field-btn" onClick={() => handleRemoveField(field.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                      
                      <div className="field-editor-grid">
                        <div className="form-group">
                          <label>Libellé (affiché à l'utilisateur) *</label>
                          <input 
                            type="text" 
                            value={field.label} 
                            onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                            placeholder="Ex: Tension Artérielle"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Identifiant (nom technique unique) *</label>
                          <input 
                            type="text" 
                            value={field.name} 
                            onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                            placeholder="Ex: tension_arterielle"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Type de champ *</label>
                          <select 
                            value={field.type} 
                            onChange={(e) => handleFieldChange(field.id, 'type', e.target.value)}
                          >
                            {FIELD_TYPES.map(ft => (
                              <option key={ft.value} value={ft.value}>{ft.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="form-group checkbox-wrapper">
                          <label className="checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={field.required}
                              onChange={(e) => handleFieldChange(field.id, 'required', e.target.checked)}
                            />
                            Champ obligatoire
                          </label>
                        </div>
                      </div>
                      
                      {field.type === 'select' && (
                        <div className="options-editor">
                          <label>Options (séparées par des virgules) *</label>
                          <input 
                            type="text" 
                            value={field.options?.join(', ') || ''} 
                            onChange={(e) => {
                              const opts = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                              handleFieldChange(field.id, 'options', opts);
                            }}
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <button className="add-field-btn" onClick={handleAddField}>
                <FiPlus /> Ajouter un champ
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FormBuilder;
