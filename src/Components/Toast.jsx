import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'error', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`custom-toast ${type} fade-in-up`}>
      <div className="toast-content">
        {type === 'success' ? (
          <CheckCircle2 className="toast-icon text-success" size={18} />
        ) : (
          <AlertCircle className="toast-icon text-danger" size={18} />
        )}
        <span className="toast-message">{message}</span>
      </div>
      <button onClick={onClose} className="toast-close-btn" aria-label="Close toast">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
