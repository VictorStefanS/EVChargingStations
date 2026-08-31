import { useEffect, useState } from 'react';
import type { ToastMessage } from '../lib/notifications';

const EVENT_NAME = 'app:toast';

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ToastMessage>).detail;
      if (!detail) return;

      setToasts((current) => [...current, detail]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== detail.id));
      }, 4000);
    };

    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            minWidth: '220px',
            maxWidth: '340px',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: toast.type === 'error' ? '#b91c1c' : toast.type === 'success' ? '#166534' : '#1f2937',
            color: '#fff',
            boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
