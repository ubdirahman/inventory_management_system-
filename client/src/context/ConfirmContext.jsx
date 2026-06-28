import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { FaExclamationTriangle, FaTimes, FaTrashAlt } from 'react-icons/fa';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
    const [dialog, setDialog] = useState(null);

    const confirm = useCallback((options = {}) => new Promise((resolve) => {
        setDialog({
            title: options.title || 'Are you sure?',
            message: options.message || 'This action needs confirmation.',
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            tone: options.tone || 'danger',
            resolve
        });
    }), []);

    const closeDialog = useCallback((result) => {
        if (dialog?.resolve) {
            dialog.resolve(result);
        }
        setDialog(null);
    }, [dialog]);

    const value = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            {dialog && (
                <div className="modal-backdrop" role="presentation">
                    <div className="confirm-card app-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                        <button className="confirm-close" type="button" aria-label="Close" onClick={() => closeDialog(false)}>
                            <FaTimes />
                        </button>
                        <span className={`soft-icon ${dialog.tone === 'danger' ? 'red' : 'blue'}`}>
                            {dialog.tone === 'danger' ? <FaTrashAlt /> : <FaExclamationTriangle />}
                        </span>
                        <h3 id="confirm-title">{dialog.title}</h3>
                        <p>{dialog.message}</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" type="button" onClick={() => closeDialog(false)}>{dialog.cancelText}</button>
                            <button className={`btn ${dialog.tone === 'danger' ? 'danger-button' : 'btn-primary'}`} type="button" onClick={() => closeDialog(true)}>{dialog.confirmText}</button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);

    if (!context) {
        throw new Error('useConfirm must be used inside ConfirmProvider');
    }

    return context;
};