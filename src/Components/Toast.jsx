/**
 * Frontend module: Components/Toast.jsx
 *
 * Vai trò: Component Toast: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import './Toast.css';

// React component “Toast” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
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
