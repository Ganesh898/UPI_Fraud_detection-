import React, { useState } from 'react';
import { Shield, Building, Mail, Lock, User, AtSign, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';

export const RegisterPage = ({ onNavigate }) => {
  const { register } = useAuth();
  const { addToast } = useTransactions();

  const [formData, setFormData] = useState({
    name: 'Rohit Khandelwal',
    businessName: 'Apex Electronics & Mobile Care',
    merchantVpa: 'apex.retail@okhdfcbank',
    email: 'rohit@apexelectronics.in',
    password: 'Password123!',
    category: 'Consumer Electronics & Gadgets',
  });

  const [vpaError, setVpaError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateVpa = (vpa) => {
    // VPA syntax check: something@handle
    const pattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return pattern.test(vpa.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateVpa(formData.merchantVpa)) {
      setVpaError('Please enter a valid UPI VPA handle (e.g. yourstore@okhdfcbank)');
      return;
    }
    setVpaError('');
    setIsLoading(true);

    setTimeout(() => {
      register(formData);
      setIsLoading(false);
      addToast({
        type: 'success',
        title: 'Merchant Terminal Registered',
        message: `Welcome ${formData.businessName}! POS Shield is now active.`,
      });
      onNavigate('/dashboard');
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        position: 'relative',
      }}
    >
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />

      <div
        className="cyber-card cyber-card-glow"
        style={{
          width: '100%',
          maxWidth: 580,
          padding: '36px',
          backgroundColor: '#0c1322',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 242, 254, 0.1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070b14',
              margin: '0 auto 12px',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
            }}
          >
            <Shield size={30} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            Register Merchant Terminal
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Arm your retail checkout counter with automated fake UPI scam defense
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Proprietor / Manager Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ paddingLeft: 38 }}
                />
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Store / Business Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                  style={{ paddingLeft: 38 }}
                />
                <Building size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Registered Merchant Bank VPA (UPI ID)</span>
              <span style={{ fontSize: '0.72rem', color: '#00f2fe' }}>Critical for fraud checks</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field mono"
                value={formData.merchantVpa}
                onChange={(e) => {
                  setFormData({ ...formData, merchantVpa: e.target.value });
                  if (vpaError) setVpaError('');
                }}
                placeholder="storename@okhdfcbank"
                required
                style={{ paddingLeft: 38 }}
              />
              <AtSign size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
            {vpaError && (
              <span style={{ color: 'var(--fraud)', fontSize: '0.75rem', marginTop: 4 }}>
                {vpaError}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>
              Screenshots where payee VPA does not match this handle will trigger instant +30 fraud score.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ paddingLeft: 38 }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Terminal Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ paddingLeft: 38 }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
              </div>
            </div>
          </div>

          {/* Guaranteed Security Highlights */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 20,
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600 }}>
              <CheckCircle2 size={14} />
              <span>Includes POS Audio Chime & Emergency Fraud Siren engine</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600 }}>
              <CheckCircle2 size={14} />
              <span>Full cross-merchant UTR replay attack quarantine</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            style={{ width: '100%', gap: 8 }}
          >
            <span>{isLoading ? 'Creating Terminal Key...' : 'Activate POS Protection'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Already registered?{' '}
          <span
            style={{ color: '#00f2fe', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => onNavigate('/login')}
          >
            Sign In Here
          </span>
        </div>
      </div>
    </div>
  );
};
