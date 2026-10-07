import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Activity,
  ScanLine,
  Volume2,
  DollarSign,
  ArrowRight,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useSound } from '../context/SoundContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ThreatRadar } from '../components/common/ThreatRadar';
import { Modal } from '../components/common/Modal';
import { RiskMeter } from '../components/common/RiskMeter';

export const DashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { transactions, verifyPayment } = useTransactions();
  const { triggerSafeAlert, triggerFraudAlert } = useSound();

  // Quick verify form state in dashboard
  const [quickUtr, setQuickUtr] = useState('');
  const [quickAmount, setQuickAmount] = useState('850');
  const [quickResult, setQuickResult] = useState(null);

  // Inspection modal state
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Compute metrics
  const totalCount = transactions.length;
  const highRiskCount = transactions.filter(
    (t) => t.risk_level === 'HIGH' || t.risk_level === 'High Risk' || (t.risk_score || 0) >= 71
  ).length;
  const totalVolume = transactions.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
  const preventedLoss = transactions
    .filter(
      (t) =>
        t.risk_level === 'HIGH' ||
        t.risk_level === 'High Risk' ||
        (t.risk_score || 0) >= 71 ||
        t.status === 'flagged' ||
        t.status === 'rejected'
    )
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (!quickUtr) return;
    const res = verifyPayment({
      utr: quickUtr,
      amount: quickAmount,
      mode: 'manual',
      notes: 'Dashboard Quick POS check',
    });
    setQuickResult(res);
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Banner & Audio Soundbox bar */}
      <div
        className="cyber-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(14, 22, 38, 0.9) 0%, rgba(15, 30, 56, 0.85) 100%)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              Terminal Command Desk
            </h1>
            <span className="badge badge-safe" style={{ fontSize: '0.72rem' }}>
              <span className="badge-dot" /> LIVE DEFENSE ACTIVE
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Merchant: <strong style={{ color: '#ffffff' }}>{user?.business_name || 'Retail Terminal'}</strong></span>
            <span>•</span>
            <span className="text-mono" style={{ color: '#00f2fe' }}>VPA: {user?.merchant_vpa || 'apex.retail@okhdfcbank'}</span>
          </div>
        </div>

        {/* Audio Quick Test Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => triggerSafeAlert(500)}
            title="Play verified payment double-chime"
          >
            <Volume2 size={14} color="#10b981" />
            <span>Test Safe Chime</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={triggerFraudAlert}
            title="Play emergency fraud siren"
            style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <Volume2 size={14} color="#ef4444" />
            <span>Test Fraud Siren</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('/verify')}
          >
            <ScanLine size={15} />
            <span>Full POS Verifier</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Total Inflow Processed"
          value={`₹${totalVolume.toLocaleString('en-IN')}`}
          subtitle={`${totalCount} Total Transactions`}
          change="+18.4% today"
          isPositive={true}
          icon={Activity}
          variant="cyan"
        />

        <MetricCard
          title="Fraud Losses Prevented"
          value={`₹${preventedLoss.toLocaleString('en-IN')}`}
          subtitle="Direct Cash Saved"
          change={`+₹${preventedLoss.toLocaleString('en-IN')}`}
          isPositive={true}
          icon={ShieldCheck}
          variant="green"
        />

        <MetricCard
          title="Threat Attacks Intercepted"
          value={highRiskCount}
          subtitle="Spoof APKs & Replays"
          change={highRiskCount > 0 ? `${highRiskCount} Blocked` : '0 Attacks'}
          isPositive={highRiskCount === 0}
          icon={ShieldAlert}
          variant="red"
        />

        <MetricCard
          title="Julian Integrity Index"
          value="98.7%"
          subtitle="12-Digit Syntax Precision"
          change="Optimal"
          isPositive={true}
          icon={TrendingUp}
          variant="purple"
        />
      </div>

      {/* Main Grid: Quick POS Desk on left, Threat Radar on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Quick POS Desk Widget */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ScanLine size={18} color="#00f2fe" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Quick UTR Verification Desk</h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>POS Speed Mode</span>
          </div>

          <form onSubmit={handleQuickVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">12-Digit UPI UTR</label>
                <input
                  type="text"
                  className="input-field mono"
                  value={quickUtr}
                  onChange={(e) => setQuickUtr(e.target.value)}
                  placeholder="e.g. 628109482914"
                  maxLength={16}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  placeholder="850"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setQuickUtr('628109482914')}
                style={{ fontSize: '0.72rem' }}
              >
                Insert Replay Test
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setQuickUtr('9381029481')}
                style={{ fontSize: '0.72rem' }}
              >
                Insert Fake APK
              </button>
              <button type="submit" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', gap: 6 }}>
                <ScanLine size={14} />
                <span>Verify Now</span>
              </button>
            </div>
          </form>

          {/* Quick verification result snippet */}
          {quickResult && (
            <div
              style={{
                marginTop: 16,
                padding: '12px 14px',
                borderRadius: 8,
                backgroundColor:
                  quickResult.evaluation.riskLevel === 'HIGH'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : quickResult.evaluation.riskLevel === 'MEDIUM'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(16, 185, 129, 0.12)',
                border: `1px solid ${
                  quickResult.evaluation.riskLevel === 'HIGH'
                    ? 'rgba(239, 68, 68, 0.35)'
                    : quickResult.evaluation.riskLevel === 'MEDIUM'
                    ? 'rgba(245, 158, 11, 0.35)'
                    : 'rgba(16, 185, 129, 0.35)'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: quickResult.evaluation.riskLevel === 'HIGH' ? '#ef4444' : quickResult.evaluation.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981' }}>
                  {quickResult.evaluation.verdict} (Score: {quickResult.evaluation.score}/100)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {quickResult.evaluation.factors[0]?.title}
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedTxn(quickResult.transaction)}
                style={{ fontSize: '0.72rem' }}
              >
                Inspect
              </button>
            </div>
          )}
        </div>

        {/* Threat Radar Visualizer */}
        <ThreatRadar activeThreats={highRiskCount} />
      </div>

      {/* Loss Prevention & Volume Trend Visualization (SVG Chart) */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>24-Hour Transaction & Fraud Threat Trajectory</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Real-time heuristic traffic vs detected spoofing vectors
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#00f2fe' }} />
              Volume Inflow
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#ef4444' }} />
              Spoof / Fraud Attacks
            </span>
          </div>
        </div>

        {/* Responsive Custom SVG Area / Bar Chart */}
        <div style={{ width: '100%', height: 180, position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cyanVolGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(255, 255, 255, 0.05)" />
            <line x1="0" y1="90" x2="800" y2="90" stroke="rgba(255, 255, 255, 0.05)" />
            <line x1="0" y1="140" x2="800" y2="140" stroke="rgba(255, 255, 255, 0.05)" />

            {/* Smooth Volume Curve */}
            <path
              d="M 0,140 Q 100,110 200,90 T 400,60 T 600,40 T 800,70 L 800,180 L 0,180 Z"
              fill="url(#cyanVolGrad)"
            />
            <path
              d="M 0,140 Q 100,110 200,90 T 400,60 T 600,40 T 800,70"
              fill="none"
              stroke="#00f2fe"
              strokeWidth="2.5"
            />

            {/* Fraud Attack Spikes */}
            <line x1="280" y1="180" x2="280" y2="50" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            <circle cx="280" cy="50" r="5" fill="#ef4444" />

            <line x1="560" y1="180" x2="560" y2="35" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            <circle cx="560" cy="35" r="5" fill="#ef4444" />
          </svg>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
          <span>10:00 AM (Store Opening)</span>
          <span>12:00 PM (Lunch Rush)</span>
          <span>02:00 PM (Peak Inflow)</span>
          <span>04:00 PM (Current Hour)</span>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent POS Ledger Activity</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Live verification audit trail
            </p>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigate('/history')}
            style={{ fontSize: '0.78rem' }}
          >
            <span>View Full Ledger</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>UTR Reference</th>
                <th>Amount</th>
                <th>Risk Score</th>
                <th>Verdict</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span className="text-mono" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {tx.id}
                    </span>
                  </td>
                  <td>
                    <span className="text-mono" style={{ color: '#00f2fe', fontWeight: 700 }}>
                      {tx.utr_number}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>
                      ₹{parseFloat(tx.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: tx.risk_score >= 70 ? '#ef4444' : tx.risk_score >= 30 ? '#f59e0b' : '#10b981',
                      }}
                    >
                      {tx.risk_score}/100
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {tx.verdict}
                    </span>
                  </td>
                  <td>
                    <StatusBadge type={tx.risk_level} text={tx.status} size="sm" />
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedTxn(tx)}
                      style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Forensic Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Forensic Inspection: ${selectedTxn.id}`}
          maxWidth={640}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RiskMeter score={selectedTxn.risk_score} size={160} />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                padding: 12,
                borderRadius: 8,
                fontSize: '0.78rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>UTR: </span>
                <span className="text-mono" style={{ color: '#00f2fe', fontWeight: 700 }}>
                  {selectedTxn.utr_number}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Amount: </span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>
                  ₹{parseFloat(selectedTxn.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>From: </span>
                <span style={{ color: '#ffffff' }}>{selectedTxn.sender_vpa}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Time: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{selectedTxn.timestamp}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                Forensic Check Factors
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedTxn.risk_factors && selectedTxn.risk_factors.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      backgroundColor: f.severity === 'SAFE' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${f.severity === 'SAFE' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                      fontSize: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: f.severity === 'SAFE' ? '#86efac' : '#fca5a5',
                    }}
                  >
                    <span>{f.title}</span>
                    <span style={{ fontWeight: 700 }}>{f.points > 0 ? `+${f.points} Pts` : 'CLEARED'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTxn(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
