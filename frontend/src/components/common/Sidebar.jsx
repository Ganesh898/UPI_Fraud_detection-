import React from 'react';
import {
  Shield,
  LayoutDashboard,
  ScanLine,
  History,
  AlertTriangle,
  BarChart3,
  Sliders,
  User,
  Settings,
  LogIn,
  LogOut,
  ExternalLink,
  Lock,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';

export const Sidebar = ({ currentPath, onNavigate, mobileOpen, onCloseMobile }) => {
  const { user, isAdmin, logout } = useAuth();
  const { transactions } = useTransactions();

  const flaggedCount = transactions.filter(
    (t) => t.risk_level === 'HIGH' || t.status === 'flagged' || t.status === 'review'
  ).length;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/verify', label: 'Verify Payment', icon: ScanLine, highlight: true },
    { path: '/history', label: 'Transactions', icon: History },
    { path: '/alerts', label: 'Risk Review', icon: AlertTriangle, badge: flaggedCount },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin', label: 'Admin Rules', icon: Sliders, adminOnly: true },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (path) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 140,
          }}
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#0a0f1d',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 150,
          transform: mobileOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)',
        }}
        className={mobileOpen ? 'mobile-sidebar-open' : 'desktop-sidebar'}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--navbar-height)',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}
          onClick={() => handleNav('/')}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070b14',
              boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)',
              flexShrink: 0,
            }}
          >
            <Shield size={22} strokeWidth={2.5} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                UPI SHIELD
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '1px 5px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(0, 242, 254, 0.15)',
                  color: '#00f2fe',
                  fontWeight: 800,
                }}
              >
                PRO
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              AI Fraud Prevention
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav
          style={{
            flex: 1,
            padding: '16px 12px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 12px', letterSpacing: '0.06em' }}>
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive
                    ? 'rgba(0, 242, 254, 0.12)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(0, 242, 254, 0.3)'
                    : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
                className="sidebar-link"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon
                    size={18}
                    color={isActive ? '#00f2fe' : 'currentColor'}
                    style={{ strokeWidth: isActive ? 2.5 : 2 }}
                  />
                  <span>{item.label}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.adminOnly && (
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        color: '#8b5cf6',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                  {item.badge > 0 && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: 'var(--fraud)',
                        color: '#ffffff',
                        padding: '1px 6px',
                        borderRadius: 999,
                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <div style={{ margin: '12px 0', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Quick Landing Page link */}
          <button
            onClick={() => handleNav('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              backgroundColor: 'transparent',
            }}
          >
            <ExternalLink size={16} />
            <span>Landing Page</span>
          </button>
        </nav>

        {/* User Card & Logout in Footer */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(7, 11, 20, 0.6)',
          }}
        >
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', overflow: 'hidden' }}
                onClick={() => handleNav('/profile')}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isAdmin ? 'var(--accent-purple)' : 'var(--primary)',
                    color: 'var(--text-inverted)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {user.avatar || 'US'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.merchant_vpa || user.email}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  handleNav('/login');
                }}
                style={{ padding: 6 }}
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleNav('/login')}
              >
                <LogIn size={14} />
                <span>Log In</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
