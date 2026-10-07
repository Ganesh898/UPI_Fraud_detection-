import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  variant = 'cyan', // 'cyan', 'green', 'amber', 'red', 'purple'
  onClick,
}) => {
  const variantStyles = {
    cyan: {
      border: 'rgba(0, 242, 254, 0.2)',
      glow: 'rgba(0, 242, 254, 0.15)',
      iconBg: 'rgba(0, 242, 254, 0.1)',
      iconColor: '#00f2fe',
    },
    green: {
      border: 'rgba(16, 185, 129, 0.25)',
      glow: 'rgba(16, 185, 129, 0.15)',
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconColor: '#10b981',
    },
    amber: {
      border: 'rgba(245, 158, 11, 0.25)',
      glow: 'rgba(245, 158, 11, 0.15)',
      iconBg: 'rgba(245, 158, 11, 0.12)',
      iconColor: '#f59e0b',
    },
    red: {
      border: 'rgba(239, 68, 68, 0.25)',
      glow: 'rgba(239, 68, 68, 0.2)',
      iconBg: 'rgba(239, 68, 68, 0.15)',
      iconColor: '#ef4444',
    },
    purple: {
      border: 'rgba(139, 92, 246, 0.25)',
      glow: 'rgba(139, 92, 246, 0.15)',
      iconBg: 'rgba(139, 92, 246, 0.12)',
      iconColor: '#8b5cf6',
    },
  }[variant] || {};

  return (
    <div
      className="cyber-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${variantStyles.border}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: variantStyles.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: variantStyles.iconColor,
              border: `1px solid ${variantStyles.border}`,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 10, marginTop: 4 }}>
        {change !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: isPositive ? 'var(--safe)' : 'var(--fraud)', fontWeight: 600 }}>
            {change === 0 ? (
              <Minus size={14} />
            ) : isPositive ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{change}</span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Status Active</span>
        )}

        {subtitle && (
          <div style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
