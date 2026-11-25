import { createContext, useContext, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

// Shows one message at a time at the bottom of the screen (after saving, deleting, ...)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<ToastType>('success');

  function showToast(newMessage: string, newType: ToastType = 'success') {
    setMessage(newMessage);
    setType(newType);
    setTimeout(() => setMessage(''), 4000);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className={`toast toast-${type}`} role="status">
          <span>{message}</span>
          <button className="toast-close" onClick={() => setMessage('')} aria-label="Close">
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext);
}
