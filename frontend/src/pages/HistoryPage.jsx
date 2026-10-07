import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  Calendar,
  Layers,
  Flag,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { RiskMeter } from '../components/common/RiskMeter';

export const HistoryPage = () => {
  const { transactions, updateTransactionStatus } = useTransactions();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL'); // ALL, LOW, MEDIUM, HIGH
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, verified, review, flagged, disputed, rejected
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tx.utr_number.toLowerCase().includes(q) ||
      (tx.sender_vpa && tx.sender_vpa.toLowerCase().includes(q)) ||
      tx.id.toLowerCase().includes(q) ||
      (tx.notes && tx.notes.toLowerCase().includes(q));

    const matchesRisk = riskFilter === 'ALL' || tx.risk_level === riskFilter;
    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const handleExportCsv = () => {
    const headers = ['ID,UTR,Amount,Sender,RiskScore,RiskLevel,Verdict,Status,Timestamp\n'];
    const rows = filtered.map(
      (t) =>
        `"${t.id}","${t.utr_number}",${t.amount},"${t.sender_vpa}",${t.risk_score},"${t.risk_level}","${t.verdict}","${t.status}","${t.timestamp}"\n`
    );
    const blob = new Blob([headers.concat(rows)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upi-shield-ledger-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            Transaction Ledger & Audit Trail
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Showing {filtered.length} of {transactions.length} verified checkout records
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={handleExportCsv} style={{ gap: 8 }}>
          <Download size={15} />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="cyber-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          backgroundColor: '#0c1322',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <input
            type="text"
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by UTR number, VPA handle, Txn ID..."
            style={{ paddingLeft: 38 }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
        </div>

        {/* Risk Level Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Risk:</span>
          <select
            className="input-field"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low (Safe)</option>
            <option value="MEDIUM">Medium (Suspicious)</option>
            <option value="HIGH">High (Fraud)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="review">Needs Review</option>
            <option value="flagged">Flagged</option>
            <option value="disputed">Disputed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {(searchQuery || riskFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSearchQuery('');
              setRiskFilter('ALL');
              setStatusFilter('ALL');
            }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Transactions Table or Empty State */}
      <div className="cyber-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              No Matching Transactions Found
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 400 }}>
              No records match your query "{searchQuery}". Try clearing filters or verify a new payment at the counter.
            </p>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setRiskFilter('ALL');
                setStatusFilter('ALL');
              }}
              style={{ marginTop: 8 }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>ID</th>
                  <th>12-Digit UTR</th>
                  <th>Amount</th>
                  <th>Counterparty VPA</th>
                  <th>Mode</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => {
                  const scoreColor =
                    tx.risk_score >= 70 ? '#ef4444' : tx.risk_score >= 30 ? '#f59e0b' : '#10b981';

                  return (
                    <tr key={tx.id}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {tx.timestamp}
                      </td>
                      <td>
                        <span className="text-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {tx.id}
                        </span>
                      </td>
                      <td>
                        <span className="text-mono" style={{ color: '#00f2fe', fontWeight: 700 }}>
                          {tx.utr_number}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#ffffff' }}>
                          ₹{parseFloat(tx.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {tx.sender_vpa || 'Anonymous Counterparty'}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {tx.verification_mode === 'ocr_screenshot' ? 'OCR SCAN' : 'MANUAL'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div
                            style={{
                              width: 32,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${tx.risk_score}%`,
                                height: '100%',
                                backgroundColor: scoreColor,
                              }}
                            />
                          </div>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: scoreColor }}>
                            {tx.risk_score}
                          </span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge
                          type={tx.status === 'review' ? 'review' : tx.risk_level}
                          text={tx.status === 'review' ? 'Needs Review' : tx.status}
                          size="sm"
                        />
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedTxn(tx)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
                <span style={{ color: 'var(--text-muted)' }}>Payee (Receiver): </span>
                <span style={{ color: '#ffffff' }}>{selectedTxn.receiver_vpa}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Payer (Sender): </span>
                <span style={{ color: '#ffffff' }}>{selectedTxn.sender_vpa}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                <StatusBadge
                  type={selectedTxn.status === 'review' ? 'review' : selectedTxn.risk_level}
                  text={selectedTxn.status === 'review' ? 'Needs Review' : selectedTxn.status}
                  size="sm"
                />
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Timestamp: </span>
                <span style={{ color: 'var(--text-secondary)' }}>{selectedTxn.timestamp}</span>
              </div>
            </div>

            {selectedTxn.notes && (
              <div style={{ fontSize: '0.78rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: 10, borderRadius: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Cashier Notes: </span>
                <span style={{ color: '#ffffff' }}>{selectedTxn.notes}</span>
              </div>
            )}

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

            {/* Quick Status Modifiers */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  updateTransactionStatus(selectedTxn.id, 'disputed', 'Marked for bank investigation');
                  setSelectedTxn(null);
                }}
              >
                Mark as Disputed
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  updateTransactionStatus(selectedTxn.id, 'rejected', 'Quarantined fake payment');
                  setSelectedTxn(null);
                }}
              >
                Reject / Quarantine
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedTxn(null)}
                style={{ marginLeft: 'auto' }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
