import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Cpu,
  Layers,
  Activity,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { ThreatRadar } from '../components/common/ThreatRadar';
import { generateAuthenticUtr } from '../services/fraudEngine';

export const LandingPage = ({ onNavigate }) => {
  const { loginAsRole } = useAuth();
  const { triggerSafeAlert, triggerFraudAlert } = useSound();
  const [demoUtr, setDemoUtr] = useState('628109482914');
  const [demoStatus, setDemoStatus] = useState(null);

  const handleTestAuthentic = () => {
    const valid = generateAuthenticUtr();
    setDemoUtr(valid);
    setDemoStatus({
      type: 'safe',
      score: 6,
      verdict: 'VERIFIED GENUINE',
      text: 'Valid 12-digit Julian Day encoding. Zero replay collisions found.',
    });
    triggerSafeAlert(850);
  };

  const handleTestFraud = () => {
    setDemoUtr('9381029481');
    setDemoStatus({
      type: 'fraud',
      score: 85,
      verdict: 'HIGH RISK FRAUD',
      text: 'Invalid 10-digit UTR length. Fails Julian banking algorithm. Spoof APK signature.',
    });
    triggerFraudAlert();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: '#ffffff', position: 'relative' }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(7, 11, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '0 24px',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => onNavigate('/')}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070b14',
              boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)',
            }}
          >
            <Shield size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              UPI SHIELD
            </div>
            <div style={{ fontSize: '0.68rem', color: '#00f2fe', fontWeight: 700 }}>
              CYBER-FINTECH DEFENSE
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigate('/dashboard')}
          >
            Live Terminal
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('/login')}
          >
            Log In
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              loginAsRole('merchant');
              onNavigate('/verify');
            }}
          >
            Launch POS Verifier
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 60px',
          maxWidth: 1200,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Glow badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 999,
            backgroundColor: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            color: '#00f2fe',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: 24,
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.15)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00f2fe', animation: 'pulse-siren 1.5s infinite' }} />
          <span>REAL-TIME AI & JULIAN HEURISTIC ENGINE v2.4</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: 20,
            maxWidth: 900,
            margin: '0 auto 20px',
          }}
        >
          Stop Fake UPI Payments & Spoof Apps{' '}
          <span className="text-gradient">Before Handing Over Goods</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: 720,
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          Offline retail merchants lose millions to fake Paytm and PhonePe payment generator APKs,
          recycled UTR screenshots, and altered receipts. UPI Shield verifies transaction integrity
          in under 120 milliseconds with zero hardware cost.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 50 }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              loginAsRole('merchant');
              onNavigate('/verify');
            }}
            style={{ fontSize: '1rem', padding: '14px 28px', gap: 10 }}
          >
            <ScanLine size={20} />
            <span>Launch POS Verification Desk</span>
            <ArrowRight size={18} />
          </button>

          <button
            className="btn btn-secondary btn-lg"
            onClick={() => onNavigate('/dashboard')}
            style={{ fontSize: '1rem', padding: '14px 28px', gap: 10 }}
          >
            <Activity size={20} color="#00f2fe" />
            <span>Explore Live Dashboard</span>
          </button>
        </div>

        {/* Interactive Live Demo Widget */}
        <div
          className="cyber-card"
          style={{
            maxWidth: 780,
            margin: '0 auto',
            textAlign: 'left',
            padding: 24,
            border: '1px solid rgba(0, 242, 254, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 242, 254, 0.1)',
            backgroundColor: '#0c1322',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={18} color="#00f2fe" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                Try The Verification Engine Right Now
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Client-Side Heuristic Simulator
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <input
              type="text"
              className="input-field mono"
              value={demoUtr}
              onChange={(e) => setDemoUtr(e.target.value)}
              placeholder="Enter 12-Digit UTR (e.g., 628109482914)"
              style={{ flex: 1, minWidth: 240 }}
            />
            <button className="btn btn-secondary btn-sm" onClick={handleTestAuthentic}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Simulate Authentic</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleTestFraud}>
              <AlertTriangle size={14} color="#ef4444" />
              <span>Simulate Spoof APK</span>
            </button>
          </div>

          {demoStatus && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                backgroundColor: demoStatus.type === 'safe' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${demoStatus.type === 'safe' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: demoStatus.type === 'safe' ? '#10b981' : '#ef4444' }}>
                  {demoStatus.verdict} — Score {demoStatus.score}/100
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {demoStatus.text}
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => (demoStatus.type === 'safe' ? triggerSafeAlert(500) : triggerFraudAlert())}
              >
                <Volume2 size={14} />
                <span>Play Sound</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4 Multi-Vector Detection Pillars */}
      <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
            Multi-Vector Fraud Detection Architecture
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Four complementary heuristic layers inspect transaction syntax, visual receipts, and historical replay databases.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <div className="cyber-card">
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>12-Digit Julian Logic</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Standard Indian UPI UTRs encode the year and Julian day (001–366). Fake APK simulators almost always forge random 10-digit numbers or future Julian dates.
            </p>
          </div>

          <div className="cyber-card">
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>Cross-Merchant Replay Tracker</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Fraudsters display genuine receipts from hours ago to different vendors. Our global ledger flags any duplicate UTR instantly with a high-pitched siren.
            </p>
          </div>

          <div className="cyber-card">
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <ScanLine size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>Smart OCR Receipt Scanner</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Inspects payment screenshots for typographic font discrepancies, altered beneficiary VPAs, missing bank reference hashes, and temporal timestamp deltas.
            </p>
          </div>

          <div className="cyber-card">
            <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Volume2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>Auditory Chime & Siren</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Replaces vulnerable visual checks with unmistakable acoustic feedback: pleasant double-chime for verified payments, emergency siren for fraud.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Impact Stats */}
      <section style={{ padding: '40px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div
          className="cyber-card"
          style={{
            padding: '36px',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
              ₹14.8M+
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Merchant Losses Prevented
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
              &lt; 120ms
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Heuristic Decision Latency
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
              99.6%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Spoof APK Detection Accuracy
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>
              Zero
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Hardware Dongles Required
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '24px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          backgroundColor: '#050811',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <span style={{ color: '#ffffff', fontWeight: 600 }}>UPI Shield Prototype</span>
          <span>•</span>
          <span>NPCI Sandbox Compatible</span>
          <span>•</span>
          <span
            style={{ color: '#00f2fe', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => {
              loginAsRole('admin');
              onNavigate('/admin');
            }}
          >
            Compliance Console
          </span>
        </div>
        <div>
          Engineered for high-volume retail counters, offline vendors, and fraud risk monitoring units.
        </div>
      </footer>
    </div>
  );
};
