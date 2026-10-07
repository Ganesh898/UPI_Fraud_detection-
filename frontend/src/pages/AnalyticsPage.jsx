import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  PieChart,
  Clock,
  Calendar,
  Layers,
  ArrowUpRight,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { MetricCard } from '../components/common/MetricCard';

export const AnalyticsPage = () => {
  const { transactions, blacklist } = useTransactions();
  const [timeRange, setTimeRange] = useState('7D');

  const totalPrevented = transactions
    .filter((t) => t.risk_level === 'HIGH' || t.status === 'flagged' || t.status === 'rejected')
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  const fraudCount = transactions.filter((t) => t.risk_level === 'HIGH').length;

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            Cyber Risk & Loss Prevention Intelligence
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Quantitative telemetry on fake UPI exploits, capital protected, and vector frequencies
          </p>
        </div>

        {/* Time Filter Pills */}
        <div style={{ display: 'flex', gap: 6, backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 4, borderRadius: 8 }}>
          {['24H', '7D', '30D', 'YTD'].map((range) => (
            <button
              key={range}
              className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTimeRange(range)}
              style={{ padding: '4px 12px', fontSize: '0.75rem' }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <MetricCard
          title="Net Capital Saved"
          value={`₹${totalPrevented.toLocaleString('en-IN')}`}
          subtitle="Direct Retail Protection"
          change="+100% Defense"
          isPositive={true}
          icon={ShieldCheck}
          variant="green"
        />

        <MetricCard
          title="Exploits Intercepted"
          value={fraudCount}
          subtitle="Spoofs & Replays"
          change="0 Losses Incurred"
          isPositive={true}
          icon={ShieldAlert}
          variant="red"
        />

        <MetricCard
          title="Average Latency"
          value="114 ms"
          subtitle="Edge OCR + Checksum"
          change="-12ms vs v2.2"
          isPositive={true}
          icon={Clock}
          variant="cyan"
        />

        <MetricCard
          title="Blacklist Coverage"
          value={`${blacklist.length} VPAs`}
          subtitle="National Cyber Feed"
          change="Real-Time Sync"
          isPositive={true}
          icon={Layers}
          variant="purple"
        />
      </div>

      {/* 2 Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Cumulative Savings Chart */}
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Cumulative Loss Prevention (₹ INR)</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Protected merchant capital growth</p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
              +₹{totalPrevented.toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ width: '100%', height: 200, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255, 255, 255, 0.05)" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255, 255, 255, 0.05)" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255, 255, 255, 0.05)" />

              {/* Area */}
              <path
                d="M 0,180 L 80,150 L 160,130 L 250,90 L 340,70 L 420,40 L 500,20 L 500,200 L 0,200 Z"
                fill="url(#savingsGrad)"
              />
              {/* Stroke */}
              <path
                d="M 0,180 L 80,150 L 160,130 L 250,90 L 340,70 L 420,40 L 500,20"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="250" cy="90" r="5" fill="#10b981" />
              <circle cx="500" cy="20" r="5" fill="#10b981" />
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Today</span>
          </div>
        </div>

        {/* Attack Vector Distribution Donut Chart */}
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Exploit Vector Breakdown</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Detected scam techniques distribution</p>
            </div>
            <PieChart size={18} color="#00f2fe" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, gap: 24 }}>
            {/* SVG Donut */}
            <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              {/* Spoof APK (45%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#ef4444"
                strokeWidth="14"
                strokeDasharray="107 238"
                strokeDashoffset="0"
              />
              {/* Replay Attack (35%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="14"
                strokeDasharray="83 238"
                strokeDashoffset="-107"
              />
              {/* Receiver VPA mismatch (20%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="14"
                strokeDasharray="48 238"
                strokeDashoffset="-190"
              />
            </svg>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#ef4444' }} />
                <span>Fake Spoof APK (45%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#f59e0b' }} />
                <span>Replay UTR Recycled (35%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#8b5cf6' }} />
                <span>Mismatched VPA (20%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Flagged VPAs Leaderboard */}
      <div className="cyber-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>High-Risk Counterparty Registry</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Frequently reported fraudulent UPI addresses
            </p>
          </div>
          <span className="badge badge-fraud" style={{ fontSize: '0.72rem' }}>
            REGISTRY SYNCED
          </span>
        </div>

        <div className="table-container">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Target VPA</th>
                <th>Primary Exploit Reason</th>
                <th>Reporting Entity</th>
                <th>Added Timestamp</th>
                <th>Threat Level</th>
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
                  <td>
                    <span className="badge badge-fraud" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      {item.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
