import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Flag,
  RotateCcw,
  Eye,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useSound } from '../context/SoundContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ThreatRadar } from '../components/common/ThreatRadar';
import { Modal } from '../components/common/Modal';
import { RiskMeter } from '../components/common/RiskMeter';

export const AlertsPage = () => {
  const { transactions, updateTransactionStatus, addBlacklistVpa } = useTransactions();
  const { soundEnabled, setSoundEnabled, triggerFraudAlarm, volume, setVolume } = useSound();
  const [selectedTxn, setSelectedTxn] = useState(null);

  const flaggedList = transactions.filter(
    (t) => t.risk_level === 'HIGH' || t.risk_level === 'MEDIUM' || t.status === 'review' || t.status === 'flagged' || t.status === 'disputed'
  );

  const criticalCount = flaggedList.filter((t) => t.risk_level === 'HIGH').length;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              Risk Review & Fraud Alerts
            </h1>
            <span className="badge badge-fraud" style={{ fontSize: '0.72rem' }}>
              {criticalCount} CRITICAL THREATS
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Review heuristic risk signals here; receipt OCR and UTR format checks cannot independently verify bank settlement.
          </p>
        </div>

        {/* Audio Siren Feedback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 size={15} color="#10b981" /> : <VolumeX size={15} color="#ef4444" />}
            <span>{soundEnabled ? 'Alert Sirens Active' : 'Muted'}</span>
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={triggerFraudAlarm}
            title="Test emergency siren sound"
          >
            <ShieldAlert size={15} />
            <span>Sound Siren Alarm</span>
          </button>
        </div>
      </div>

      {/* Flashing Cyber Threat Alert Banner if Critical threats exist */}
      {criticalCount > 0 && (
        <div
          className="cyber-card"
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                animation: 'pulse-siren 1.5s infinite',
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ef4444' }}>
                ACTION REQUIRED: {criticalCount} High-Risk Transactions Need Investigation
              </div>
              <div style={{ fontSize: '0.78rem', color: '#fca5a5' }}>
                High risk is not proof of fraud. Confirm the payment in your bank account and inspect the evidence before taking action.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Live Radar on Left, Stats on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <ThreatRadar activeThreats={criticalCount} />

        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Radio size={16} color="#00f2fe" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Telemetry & Threat Response Metrics</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: '12px', borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mean Intercept Time</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#00f2fe' }}>84 ms</div>
                <div style={{ fontSize: '0.68rem', color: '#10b981' }}>Near Instantaneous</div>
              </div>
              <div style={{ padding: '12px', borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Defense Rules</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#a855f7' }}>5 / 5</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>All Pipelines Live</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '10px 12px', borderRadius: 8, backgroundColor: 'rgba(0, 242, 254, 0.04)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
            🛡️ <strong>Zero-Trust POS Protocol:</strong> Any transaction scoring above 70 is locked from clearing until secondary merchant inspection.
          </div>
        </div>
      </div>

      {/* Flagged Incidents Queue */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Risk Review & Incident Queue</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Review medium-risk transactions; investigate high-risk or disputed transactions
            </p>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
            {flaggedList.length} Queue Items
          </span>
        </div>

        {flaggedList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckCircle2 size={28} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Review Queue is Clear
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              No transactions currently require manual review or investigation.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {flaggedList.map((tx) => (
              <div
                key={tx.id}
                style={{
                  padding: '16px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(12, 19, 34, 0.8)',
                  border: `1px solid ${tx.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: tx.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tx.risk_level === 'HIGH' ? '#ef4444' : '#f59e0b',
                      flexShrink: 0,
                    }}
                  >
                    {tx.risk_level === 'HIGH' ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span className="text-mono" style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                        {tx.id}
                      </span>
                      <span className="text-mono" style={{ color: '#00f2fe', fontWeight: 700, fontSize: '0.85rem' }}>
                        UTR: {tx.utr_number}
                      </span>
                      <StatusBadge type={tx.status === 'review' ? 'review' : tx.risk_level} size="sm" />
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 700, marginTop: 4 }}>
                      ₹{parseFloat(tx.amount || 0).toLocaleString('en-IN')} — {tx.verdict}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Counterparty: {tx.sender_vpa} • {tx.timestamp}
                    </div>
                  </div>
                </div>

                {/* Triage Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedTxn(tx)}
                  >
                    <Eye size={13} />
                    <span>Inspect</span>
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      if (tx.sender_vpa) {
                        addBlacklistVpa(tx.sender_vpa, `Flagged in ${tx.id} for ${tx.verdict}`);
                      }
                      updateTransactionStatus(tx.id, 'rejected', 'Confirmed fraud & blacklisted');
                    }}
                    title="Permanently reject payment and blacklist sender handle"
                  >
                    <Flag size={13} />
                    <span>Confirm Fraud</span>
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => updateTransactionStatus(tx.id, 'verified', 'Overridden by cashier')}
                    title="False positive manual release"
                    style={{ color: '#10b981' }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Release</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Forensic Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Forensic Threat Analysis: ${selectedTxn.id}`}
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
                <span style={{ color: 'var(--text-muted)' }}>Sender: </span>
                <span style={{ color: '#ffffff' }}>{selectedTxn.sender_vpa}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Time: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{selectedTxn.timestamp}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                Detected Fraud Signatures
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedTxn.risk_factors && selectedTxn.risk_factors.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#fca5a5',
                    }}
                  >
                    <span>{f.title}</span>
                    <span style={{ fontWeight: 700 }}>+{f.points} Pts</span>
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
