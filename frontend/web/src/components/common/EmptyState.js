import React from 'react';
import './EmptyState.css';

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state-block" role="status">
      <div className="empty-state-icon">
        {Icon ? <Icon /> : null}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {actionLabel && onAction && (
        <button type="button" className="empty-state-cta" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
