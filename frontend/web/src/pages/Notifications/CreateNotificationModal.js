import React, { useState, useEffect } from 'react';
import { FiX, FiSend, FiUser, FiUsers, FiInfo } from 'react-icons/fi';
import { getDoctors, createNotification } from '../../api/api'; 

const CreateNotificationModal = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('all'); // 'all' or 'specific'
  const [recipientId, setRecipientId] = useState('');
  const [category, setCategory] = useState('message');
  const [doctors, setDoctors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      getDoctors()
        .then(res => {
          setDoctors(res.data || []);
        })
        .catch(err => console.error('Error fetching doctors:', err));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (recipientType === 'specific' && !recipientId) {
      setError('Veuillez sélectionner un destinataire.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createNotification({
        title,
        message,
        is_public: recipientType === 'all',
        recipient_id: recipientType === 'specific' ? parseInt(recipientId) : null,
        category
      });
      
      onCreated();
      onClose();
      // Reset form
      setTitle('');
      setMessage('');
      setRecipientId('');
      setCategory('message');
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue lors de l\'envoi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content notification-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-group">
            <FiSend className="header-icon" />
            <h2>Nouvelle Notification</h2>
          </div>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="notification-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <label>Catégorie</label>
            <div className="recipient-toggle">
              <button 
                type="button" 
                className={category === 'patients' ? 'active' : ''} 
                onClick={() => setCategory('patients')}
              >
                Patients
              </button>
              <button 
                type="button" 
                className={category === 'results' ? 'active' : ''} 
                onClick={() => setCategory('results')}
              >
                Résultats
              </button>
              <button 
                type="button" 
                className={category === 'message' ? 'active' : ''} 
                onClick={() => setCategory('message')}
              >
                Message
              </button>
            </div>
          </div>

          <div className="form-section">
            <label>Destinataire</label>
            <div className="recipient-toggle">
              <button 
                type="button" 
                className={recipientType === 'all' ? 'active' : ''} 
                onClick={() => setRecipientType('all')}
              >
                <FiUsers /> Tous les médecins
              </button>
              <button 
                type="button" 
                className={recipientType === 'specific' ? 'active' : ''} 
                onClick={() => setRecipientType('specific')}
              >
                <FiUser /> Médecin spécifique
              </button>
            </div>

            {recipientType === 'specific' && (
              <select 
                value={recipientId} 
                onChange={(e) => setRecipientId(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Sélectionner un médecin...</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.last_name || doc.username} ({doc.specialty || 'Généraliste'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notif-title">Titre</label>
            <input 
              id="notif-title"
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réunion de service, Patient urgent..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notif-message">Message</label>
            <textarea 
              id="notif-message"
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Saisissez votre message ici..."
              rows={4}
              required
            />
          </div>

          <div className="notif-info-box">
            <FiInfo />
            <span>Les notifications publiques seront visibles par l'ensemble du staff médical.</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi...' : 'Envoyer la notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationModal;
