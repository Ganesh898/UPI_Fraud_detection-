import React from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { CheckCircle2, AlertTriangle, ShieldAlert, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useTransactions();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 380,
        width: 'calc(100% - 48px)',
      }}
    >
      {toasts.map((toast) => {
        let borderColor = 'rgba(0, 242, 254, 0.4)';
        let Icon = Info;
        let iconColor = '#00f2fe';

        if (toast.type === 'danger') {
          borderColor = 'rgba(239, 68, 68, 0.6)';
          Icon = ShieldAlert;
          iconColor = '#ef4444';
        } else if (toast.type === 'warning') {
          borderColor = 'rgba(245, 158, 11, 0.6)';
          Icon = AlertTriangle;
          iconColor = '#f59e0b';
        } else if (toast.type === 'success') {
          borderColor = 'rgba(16, 185, 129, 0.6)';
          Icon = CheckCircle2;
          iconColor = '#10b981';
        }

        return (
          <div
            key={toast.id}
            className="cyber-card"
            style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(14, 22, 38, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              borderRadius: 10,
              animation: 'slideUp 0.25s ease',
            }}
          >
            <Icon size={20} color={iconColor} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', color: 'var(--text-muted)', padding: 2, cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
