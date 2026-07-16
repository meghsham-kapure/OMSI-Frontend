import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CircleCheck, CircleX, Info } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

const TOAST_ICONS = {
  success: <CircleCheck size={18} />,
  error: <CircleX size={18} />,
  info: <Info size={18} />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      timersRef.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="admin-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`admin-toast admin-toast--${t.type}`} onClick={() => onDismiss(t.id)}>
          <span className="admin-toast__icon">
            {TOAST_ICONS[t.type]}
          </span>
          <span className="admin-toast__msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
