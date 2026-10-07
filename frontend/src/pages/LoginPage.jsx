import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';

export const LoginPage = ({ onNavigate }) => {
  const { login, loginAsRole } = useAuth();
  const { addToast } = useTransactions();
  const [email, setEmail] = useState('merchant@upishield.demo');
  const [password, setPassword] = useState('Demo@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    addToast({
      type: 'success',
      title: 'Authentication Successful',
      message: 'Welcome back to UPI Shield Fraud Desk.',
    });
    onNavigate('/dashboard');
  };

  const handleQuickDemo = async (role) => {
    setError('');
    setIsLoading(true);
    const result = await loginAsRole(role);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    addToast({
      type: 'info',
      title: 'Demo Session Activated',
      message: `Logged in as ${role === 'admin' ? 'Compliance Admin' : 'Retail Merchant'}.`,
    });
    onNavigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />

      <div
        className="cyber-card cyber-card-glow"
        style={{
          width: '100%',
          maxWidth: 460,
          padding: '36px 32px',
          backgroundColor: '#0c1322',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 242, 254, 0.1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header Logo */}
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Access UPI Shield
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Zero-Trust Payment Authentication & Terminal Defense
          </p>
        </div>

        {/* 1-Click Demo Accounts for Judges */}
        <div style={{ marginBottom: 24, padding: '12px', borderRadius: 8, backgroundColor: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00f2fe', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
            ⚡ Instant 1-Click Demo Logins
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('merchant')}
              style={{ fontSize: '0.75rem', justifyContent: 'center' }}
            >
              <UserCheck size={14} color="#00f2fe" />
              <span>Merchant POS</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickDemo('admin')}
              style={{ fontSize: '0.75rem', justifyContent: 'center', borderColor: 'rgba(139, 92, 246, 0.4)' }}
            >
              <ShieldAlert size={14} color="#8b5cf6" />
              <span>Admin Center</span>
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.8rem',
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span>Work Email Address</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@upishield.demo"
                style={{ paddingLeft: 38 }}
                required
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Account Password</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary)', cursor: 'pointer' }}>
                Forgot Password?
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ paddingLeft: 38, paddingRight: 38 }}
                required
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: 12, background: 'none', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: '#00f2fe' }} />
              <span>Keep terminal authenticated</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            style={{ width: '100%', gap: 8 }}
          >
            <span>{isLoading ? 'Decrypting Session...' : 'Sign In To Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Need a merchant verification counter?{' '}
          <span
            style={{ color: '#00f2fe', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => onNavigate('/register')}
          >
            Register Terminal
          </span>
        </div>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <span
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => onNavigate('/')}
          >
            ← Back to Homepage
          </span>
        </div>
      </div>
    </div>
  );
};
