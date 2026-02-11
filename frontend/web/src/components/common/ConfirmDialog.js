import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="confirm-dialog-backdrop">
      <div className="confirm-dialog-card">
        <h3 className="confirm-dialog-title">{title}</h3>
        <div className="confirm-dialog-message">{message}</div>
        <div className="confirm-dialog-actions">
          <button className="confirm-btn confirm" onClick={onConfirm}>Confirmer</button>
          <button className="confirm-btn cancel" onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
