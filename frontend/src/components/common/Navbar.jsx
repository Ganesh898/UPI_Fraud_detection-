import React, { useState } from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  Radio,
  Bell,
  UserCheck,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  AlertOctagon,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { useTransactions } from '../../context/TransactionContext';

export const Navbar = ({ currentPath, onNavigate, onToggleMobileMenu }) => {
  const { user, isAdmin, loginAsRole } = useAuth();
  const { soundEnabled, setSoundEnabled, triggerSafeAlert, triggerFraudAlert } = useSound();
  const { transactions, isLiveStreamActive, setIsLiveStreamActive } = useTransactions();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);

  const flaggedTransactions = transactions.filter((t) => t.risk_level === 'HIGH' || t.status === 'flagged');

  const pageNames = {
    '/': 'Home',
    '/dashboard': 'Operational Command Center',
    '/verify': 'POS Real-Time Payment Verifier',
    '/history': 'Immutable Transaction Ledger',
    '/alerts': 'Threat Intelligence & Alerts',
    '/analytics': 'Cyber Risk & Loss Analytics',
    '/admin': 'Admin Rules & Compliance Suite',
    '/profile': 'Merchant Terminal Profile',
    '/settings': 'Platform & Audio Preferences',
  };

  const handleRoleToggle = async () => {
    const result = await loginAsRole(isAdmin ? 'merchant' : 'admin');
    if (!result.success) {
      addToast({ type: 'danger', title: 'Role switch failed', message: result.error });
    }
  };

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'rgba(10, 16, 29, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          className="btn btn-ghost"
          onClick={onToggleMobileMenu}
          style={{ display: 'none', padding: 8 }}
          id="mobile-menu-toggle-btn"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>UPI Shield</span>
          <ChevronRight size={14} color="var(--text-muted)" />
          <span style={{ color: '#ffffff', fontWeight: 600 }}>
            {pageNames[currentPath] || 'Overview'}
          </span>
        </div>

        {/* Sandbox badge */}
        <div
          onClick={() => setShowSandboxModal(!showSandboxModal)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            fontSize: '0.72rem',
            color: '#a5b4fc',
            fontWeight: 800,
            cursor: 'pointer',
            marginLeft: 8,
          }}
          title="Click to view Prototype Engine & NPCI simulation architecture"
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#818cf8', boxShadow: '0 0 6px #818cf8' }} />
          <span>PROTOTYPE / DEMO ENGINE</span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Live Attack Stream Toggle */}
        <button
          className={`btn ${isLiveStreamActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
          title="Simulate continuous background transactions inflow"
          style={{ gap: 6 }}
        >
          <Radio size={14} className={isLiveStreamActive ? 'animate-radar' : ''} />
          <span style={{ fontSize: '0.75rem' }}>
            {isLiveStreamActive ? 'Live Stream: ON' : 'Live Stream: OFF'}
          </span>
        </button>

        {/* Audio Toggle */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) triggerSafeAlert();
          }}
          title={soundEnabled ? 'Audio Chimes Active (Click to Mute)' : 'Audio Muted (Click to Enable)'}
        >
          {soundEnabled ? <Volume2 size={15} color="#10b981" /> : <VolumeX size={15} color="#ef4444" />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative', padding: '6px 10px' }}
          >
            <Bell size={16} />
            {flaggedTransactions.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: 'var(--fraud)',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
                }}
              >
                {flaggedTransactions.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className="cyber-card"
              style={{
                position: 'absolute',
                top: 42,
                right: 0,
                width: 320,
                padding: '12px',
                zIndex: 200,
                backgroundColor: 'rgba(12, 19, 34, 0.98)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>High-Risk Threats</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{flaggedTransactions.length} unresolved</span>
              </div>

              {flaggedTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  All systems clear. Zero active threats.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                  {flaggedTransactions.slice(0, 4).map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('/alerts');
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>
                        <span>{tx.id}</span>
                        <span>₹{tx.amount}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {tx.verdict}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowNotifications(false);
                  onNavigate('/alerts');
                }}
                style={{ width: '100%', marginTop: 8, fontSize: '0.75rem' }}
              >
                View Threat Center →
              </button>
            </div>
          )}
        </div>

        {/* Quick Role Switcher */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleRoleToggle}
          title={`Currently logged in as ${user?.role}. Click to switch role.`}
          style={{
            borderColor: isAdmin ? 'rgba(139, 92, 246, 0.4)' : 'rgba(0, 242, 254, 0.3)',
            backgroundColor: isAdmin ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 242, 254, 0.05)',
          }}
        >
          <UserCheck size={14} color={isAdmin ? '#8b5cf6' : '#00f2fe'} />
          <span style={{ fontSize: '0.75rem', color: isAdmin ? '#8b5cf6' : '#00f2fe', fontWeight: 700 }}>
            {isAdmin ? 'ADMIN' : 'MERCHANT'}
          </span>
        </button>

        {/* User Profile Pill */}
        <div
          onClick={() => onNavigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 8,
            transition: 'background 0.2s',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: isAdmin ? 'var(--accent-purple)' : 'var(--primary)',
              color: 'var(--text-inverted)',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user?.avatar || 'US'}
          </div>
          <div style={{ display: 'none', flexDirection: 'column' }} className="user-profile-name">
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>
              {user?.name?.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
