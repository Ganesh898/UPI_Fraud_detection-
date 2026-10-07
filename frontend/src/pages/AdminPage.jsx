import React, { useState } from 'react';
import {
  Sliders,
  ShieldAlert,
  Plus,
  Trash2,
  RotateCcw,
  Activity,
  Zap,
  CheckCircle2,
  FileText,
  Server,
  Lock,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';

export const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const {
    fraudRules,
    updateRuleWeight,
    toggleRule,
    blacklist,
    addBlacklistVpa,
    removeBlacklistVpa,
    auditLogs,
    resetToFactoryDefaults,
    verifyPayment,
  } = useTransactions();

  const [newVpa, setNewVpa] = useState('');
  const [newReason, setNewReason] = useState('');
  const [showAddBlacklistModal, setShowAddBlacklistModal] = useState(false);

  const handleAddBlacklist = (e) => {
    e.preventDefault();
    if (!newVpa) return;
    addBlacklistVpa(newVpa, newReason);
    setNewVpa('');
    setNewReason('');
    setShowAddBlacklistModal(false);
  };

  const handleTriggerSimulatedAttack = () => {
    // Triggers synthetic replay attack
    verifyPayment({
      utr: '628109482914',
      amount: 4500,
      senderVpa: 'scammer.loot@ybl',
      mode: 'manual',
      notes: 'Admin Simulated Attack Injection',
    });
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              Admin Compliance & Fraud Rules Engine
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                color: '#8b5cf6',
                padding: '3px 8px',
                borderRadius: 4,
                border: '1px solid rgba(139, 92, 246, 0.4)',
              }}
            >
              ADMIN PRIVILEGES ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Dynamically adjust heuristic penalty weights, maintain national VPA blacklists, and inspect audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleTriggerSimulatedAttack} style={{ gap: 6 }}>
            <Zap size={14} color="#f59e0b" />
            <span>Inject Test Attack</span>
          </button>
          <button className="btn btn-ghost btn-sm" onClick={resetToFactoryDefaults} style={{ gap: 6 }}>
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Fraud Rules Weight Sliders Configurator */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Real-Time Fraud Rule Weight Configuration</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Adjust point penalties assigned to each heuristic detection vector
            </p>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
            No Backend Restart Required
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fraudRules.map((rule) => (
            <div
              key={rule.id}
              style={{
                padding: '16px',
                borderRadius: 10,
                backgroundColor: rule.is_enabled ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                border: `1px solid ${rule.is_enabled ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
                opacity: rule.is_enabled ? 1 : 0.6,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                      {rule.rule_name}
                    </span>
                    <span className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      [{rule.rule_code}]
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {rule.description}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Current weight display */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#00f2fe' }}>
                      +{rule.weight}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                      Pts
                    </span>
                  </div>

                  {/* Toggle enable switch */}
                  <button
                    type="button"
                    onClick={() => toggleRule(rule.id)}
                    className={`btn btn-sm ${rule.is_enabled ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                  >
                    {rule.is_enabled ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Slider controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 pts</span>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={rule.weight}
                  disabled={!rule.is_enabled}
                  onChange={(e) => updateRuleWeight(rule.id, e.target.value)}
                  style={{ flex: 1, accentColor: '#00f2fe', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>60 pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VPA Blacklist Management */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>National Fraud Registry VPA Blacklist</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Handles matching these VPAs trigger immediate +50 critical fraud score
            </p>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddBlacklistModal(true)}
            style={{ gap: 6 }}
          >
            <Plus size={14} />
            <span>Add Fraudulent VPA</span>
          </button>
        </div>

        <div className="table-container">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Blacklisted UPI Handle</th>
                <th>Exploit History / Reason</th>
                <th>Reporting Entity</th>
                <th>Added Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {blacklist.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="text-mono" style={{ color: '#ef4444', fontWeight: 700 }}>
                      {item.vpa}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.reason}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {item.reported_by}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.added_at}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeBlacklistVpa(item.id)}
                      style={{ color: '#ef4444', padding: '4px 8px' }}
                      title="Remove from blacklist"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs Table */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Security Engine Audit Logs</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Immutable telemetry log of compliance events
            </p>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="table-container">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Event Time</th>
                <th>Action Code</th>
                <th>Description</th>
                <th>Client IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.timestamp}
                  </td>
                  <td>
                    <span className="text-mono" style={{ fontSize: '0.75rem', color: '#00f2fe', fontWeight: 700 }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {log.details}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {log.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Blacklist VPA Modal */}
      {showAddBlacklistModal && (
        <Modal
          isOpen={showAddBlacklistModal}
          onClose={() => setShowAddBlacklistModal(false)}
          title="Add VPA to Fraud Blacklist"
          maxWidth={480}
        >
          <form onSubmit={handleAddBlacklist} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">UPI ID / VPA Handle</label>
              <input
                type="text"
                className="input-field mono"
                value={newVpa}
                onChange={(e) => setNewVpa(e.target.value)}
                placeholder="scammer.mule@ybl"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Reason / Incident Report</label>
              <textarea
                className="input-field"
                rows={3}
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Multiple spoofed payment receipts presented across retail terminals..."
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddBlacklistModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Add to Blacklist
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
