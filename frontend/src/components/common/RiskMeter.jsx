import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export const RiskMeter = ({ score = 0, size = 180, showLabel = true }) => {
  const cleanScore = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));

  let color = '#10b981';
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let level = 'LOW RISK';
  let verdict = 'VERIFIED GENUINE';
  let Icon = ShieldCheck;

  // Exact Requested Bands:
  // 0-30 = Low Risk
  // 31-70 = Medium Risk
  // 71-100 = High Risk
  if (cleanScore >= 71) {
    color = '#ef4444';
    glowColor = 'rgba(239, 68, 68, 0.5)';
    level = 'HIGH RISK';
    verdict = 'HIGH RISK FRAUD';
    Icon = ShieldAlert;
  } else if (cleanScore >= 31) {
    color = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.4)';
    level = 'MEDIUM RISK';
    verdict = 'SUSPICIOUS REVIEW';
    Icon = AlertTriangle;
  }

  // SVG Gauge calculations
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const offset = arcLength - (cleanScore / 100) * arcLength;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size * 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(135deg)', overflow: 'visible' }}
        >
          {/* Background Track Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Value Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
              filter: `drop-shadow(0 0 10px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Score Readout */}
        <div
          style={{
            position: 'absolute',
            top: '48%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Icon size={24} color={color} style={{ marginBottom: 4 }} />
          <div style={{ fontSize: size > 160 ? '2.5rem' : '1.8rem', fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-mono)', color }}>
            {cleanScore}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', marginTop: 2 }}>
            / 100
          </div>
        </div>
      </div>

      {showLabel && (
        <div style={{ textAlign: 'center', marginTop: -6 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color, letterSpacing: '0.04em' }}>
            {level}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {cleanScore <= 30 && '0–30: Low Risk'}
            {cleanScore >= 31 && cleanScore <= 70 && '31–70: Medium Risk'}
            {cleanScore >= 71 && '71–100: High Risk'}
          </div>
        </div>
      )}
    </div>
  );
};
