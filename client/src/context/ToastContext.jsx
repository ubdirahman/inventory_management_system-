import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
    FaBan,
    FaCheckCircle,
    FaEdit,
    FaExclamationCircle,
    FaInfoCircle,
    FaSave,
    FaTimes,
    FaTrashAlt
} from 'react-icons/fa';

const ToastContext = createContext(null);

const toastIcons = {
    success: FaCheckCircle,
    save: FaSave,
    update: FaEdit,
    delete: FaTrashAlt,
    error: FaExclamationCircle,
    warning: FaBan,
    info: FaInfoCircle
};

const toastStyles = {
    success: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.28)' },
    save: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.28)' },
    update: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.28)' },
    delete: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.28)' },
    error: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.28)' },
    warning: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.3)' },
    info: { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.28)' }
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismissToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(({ type = 'success', title = 'Done', message = '', duration = 3200 } = {}) => {
        const id = `${Date.now()}-${Math.random()}`;
        const nextToast = { id, type, title, message };

        setToasts((current) => [...current, nextToast].slice(-4));

        if (duration > 0) {
            window.setTimeout(() => dismissToast(id), duration);
        }
    }, [dismissToast]);

    const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-stack" aria-live="polite" aria-atomic="true">
                {toasts.map((toast) => {
                    const Icon = toastIcons[toast.type] || FaInfoCircle;
                    const style = toastStyles[toast.type] || toastStyles.info;

                    return (
                        <div
                            className="toast-card"
                            key={toast.id}
                            style={{
                                '--toast-color': style.color,
                                '--toast-bg': style.bg,
                                '--toast-border': style.border
                            }}
                        >
                            <div className="toast-icon">
                                <Icon />
                            </div>
                            <div className="toast-copy">
                                <strong className="toast-title">{toast.title}</strong>
                                {toast.message && <span className="toast-message">{toast.message}</span>}
                            </div>
                            <button
                                type="button"
                                className="toast-close"
                                aria-label="Close notification"
                                onClick={() => dismissToast(toast.id)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used inside ToastProvider');
    }

    return context;
};
