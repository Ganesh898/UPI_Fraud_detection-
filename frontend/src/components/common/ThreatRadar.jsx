import React, { useState, useEffect } from 'react';
import { Radio, AlertCircle, Shield } from 'lucide-react';

export const ThreatRadar = ({ activeThreats = 2, size = 200 }) => {
  const [blips, setBlips] = useState([
    { id: 1, x: 65, y: 35, type: 'critical', pulse: true, label: 'Spoof APK' },
    { id: 2, x: 28, y: 72, type: 'warning', pulse: true, label: 'Replay UTR' },
    { id: 3, x: 80, y: 80, type: 'safe', pulse: false, label: 'Genuine' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      // subtly shift blips to feel live
      setBlips((prev) =>
        prev.map((b) => ({
          ...b,
          x: Math.min(85, Math.max(15, b.x + (Math.random() * 4 - 2))),
          y: Math.min(85, Math.max(15, b.y + (Math.random() * 4 - 2))),
        }))
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, rgba(7, 11, 20, 0.8) 70%)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 242, 254, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#00f2fe' }}>
          <Radio size={16} className="badge-dot" style={{ animation: 'pulse-siren 1.5s infinite' }} />
          <span>CYBER THREAT RADAR</span>
        </div>
        <span className="badge badge-fraud" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
          {activeThreats} THREATS
        </span>
      </div>

      {/* Circular Radar Container */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(10, 16, 29, 0.8)',
          boxShadow: 'inset 0 0 20px rgba(0, 242, 254, 0.1)',
        }}
      >
        {/* Concentric Circles */}
        <div style={{ position: 'absolute', inset: '18%', borderRadius: '50%', border: '1px dashed rgba(0, 242, 254, 0.2)' }} />
        <div style={{ position: 'absolute', inset: '38%', borderRadius: '50%', border: '1px solid rgba(0, 242, 254, 0.25)' }} />
        <div style={{ position: 'absolute', inset: '58%', borderRadius: '50%', border: '1px dashed rgba(0, 242, 254, 0.15)' }} />

        {/* Crosshair Lines */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(0, 242, 254, 0.2)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(0, 242, 254, 0.2)' }} />

        {/* Rotating Radar Sweep Cone */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(0, 242, 254, 0.35) 0deg, transparent 60deg, transparent 360deg)',
            animation: 'radar-sweep 3.5s linear infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Blips */}
        {blips.map((blip) => {
          const color = blip.type === 'critical' ? '#ef4444' : blip.type === 'warning' ? '#f59e0b' : '#10b981';
          return (
            <div
              key={blip.id}
              style={{
                position: 'absolute',
                left: `${blip.x}%`,
                top: `${blip.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
              }}
              title={blip.label}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 8px ${color}`,
                }}
              />
              {blip.pulse && (
                <div
                  style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    border: `1px solid ${color}`,
                    animation: 'pulse-siren 1.5s infinite',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Center Radar Station */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#00f2fe',
            boxShadow: '0 0 10px #00f2fe',
          }}
        />
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
          Spoof/Replay
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
          Suspicious
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
          Verified
        </span>
      </div>
    </div>
  );
};
