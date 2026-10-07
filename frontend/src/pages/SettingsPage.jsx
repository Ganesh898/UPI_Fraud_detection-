import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Shield,
  Sliders,
  Bell,
  RefreshCw,
  Save,
  Radio,
  Lock,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { useTransactions } from '../context/TransactionContext';

export const SettingsPage = () => {
  const { soundEnabled, setSoundEnabled, voiceEnabled, setVoiceEnabled, volume, setVolume, triggerSafeAlert } = useSound();
  const { isLiveStreamActive, setIsLiveStreamActive, resetToFactoryDefaults, addToast } = useTransactions();

  const [sensitivity, setSensitivity] = useState('strict'); // 'strict' | 'standard' | 'relaxed'
  const [sandboxSimulation, setSandboxSimulation] = useState(true);
  const [autoQuarantineThreshold, setAutoQuarantineThreshold] = useState(70);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaved(true);
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Platform preferences updated successfully.',
    });
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
          Platform & Audio Preferences
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Control acoustic soundbox thresholds, heuristic sensitivity parameters, and sandbox simulation mode.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Audio & Alert Settings */}
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Volume2 size={18} color="#00f2fe" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>POS Audio & Soundbox Feedback</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Master Sound Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  Acoustic Chime & Siren Feedback
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Plays real-time verification tones (pleasant chime for genuine, emergency siren for fraud)
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${soundEnabled ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  if (next) triggerSafeAlert();
                }}
              >
                {soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>

            {/* Voice Announcements */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  Hardware Soundbox Voice Announcement
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Synthesizes verbal announcement (e.g., "Payment of ₹500 verified safely")
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${voiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? 'Active' : 'Disabled'}
              </button>
            </div>

            {/* Master Volume Slider */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Alert Master Volume
                </span>
                <span className="text-mono" style={{ fontSize: '0.85rem', color: '#00f2fe', fontWeight: 700 }}>
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <VolumeX size={16} color="var(--text-muted)" />
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#00f2fe', cursor: 'pointer' }}
                />
                <Volume2 size={16} color="#00f2fe" />
              </div>
            </div>
          </div>
        </div>

        {/* Detection Sensitivity & Thresholds */}
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Sliders size={18} color="#8b5cf6" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Heuristic Engine Sensitivity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Scoring Sensitivity Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 4 }}>
                {[
                  { id: 'strict', label: 'Strict (Bank Tier)', desc: 'Zero tolerance for syntax deviations' },
                  { id: 'standard', label: 'Standard (Retail)', desc: 'Balanced commercial threshold' },
                  { id: 'relaxed', label: 'Relaxed (Express)', desc: 'Low-friction fast queue mode' },
                ].map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => setSensitivity(mode.id)}
                    style={{
                      padding: '12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      backgroundColor: sensitivity === mode.id ? 'rgba(0, 242, 254, 0.1)' : 'var(--bg-surface-elevated)',
                      border: sensitivity === mode.id ? '1px solid #00f2fe' : '1px solid var(--border-subtle)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: sensitivity === mode.id ? '#00f2fe' : '#ffffff' }}>
                      {mode.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {mode.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                    Auto-Quarantine Score Threshold
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Transactions scoring at or above this threshold trigger automatic terminal hold
                  </div>
                </div>
                <span className="text-mono" style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444' }}>
                  {autoQuarantineThreshold} Pts
                </span>
              </div>

              <input
                type="range"
                min="50"
                max="90"
                step="5"
                value={autoQuarantineThreshold}
                onChange={(e) => setAutoQuarantineThreshold(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Sandbox & Developer Mode */}
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Cpu size={18} color="#10b981" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Sandbox & Simulation Controls</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  NPCI Simulated Clearing Mode
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Enables regulatory sandbox environment for demonstration and merchant testing
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${sandboxSimulation ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSandboxSimulation(!sandboxSimulation)}
              >
                {sandboxSimulation ? 'Sandbox Active' : 'Production Switch'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  Continuous Threat Stream Inflow
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Periodically injects realistic synthetic transactions to demonstrate live detection
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${isLiveStreamActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
              >
                {isLiveStreamActive ? 'Stream ON' : 'Stream OFF'}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>
                  Restore Factory Fixtures
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Reset local transactions, rules, and blacklists to initial demo state
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={resetToFactoryDefaults}
                style={{ gap: 6 }}
              >
                <RefreshCw size={13} />
                <span>Reset Database</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="submit" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
            <Save size={18} />
            <span>{isSaved ? 'Preferences Saved!' : 'Save System Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
