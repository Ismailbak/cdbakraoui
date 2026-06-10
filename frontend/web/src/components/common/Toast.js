import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';
import './Toast.css';

// Toast Context
const ToastContext = createContext(null);

// Toast types
const TOAST_TYPES = {
  success: {
    icon: FiCheckCircle,
    className: 'toast-success'
  },
  error: {
    icon: FiAlertCircle,
    className: 'toast-error'
  },
  warning: {
    icon: FiAlertTriangle,
    className: 'toast-warning'
  },
  info: {
    icon: FiInfo,
    className: 'toast-info'
  }
};

// Individual Toast component
const Toast = ({ id, type, message, onClose }) => {
  const { icon: Icon, className } = TOAST_TYPES[type] || TOAST_TYPES.info;

  return (
    <div className={`toast ${className}`}>
      <div className="toast-icon">
        <Icon />
      </div>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => onClose(id)}>
        <FiX />
      </button>
    </div>
  );
};

// Toast Container component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods
  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  const value = {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default Toast;
