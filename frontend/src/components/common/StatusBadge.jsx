import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle, Clock, XCircle, Flag } from 'lucide-react';

export const StatusBadge = ({ type, text, size = 'md' }) => {
  const normType = (type || '').toLowerCase();

  let badgeClass = 'badge-neutral';
  let Icon = Clock;
  let label = text || type;

  if (normType === 'low' || normType === 'safe' || normType === 'verified') {
    badgeClass = 'badge-safe';
    Icon = normType === 'verified' ? CheckCircle : ShieldCheck;
    if (!text) label = normType === 'verified' ? 'Verified' : 'Safe';
  } else if (normType === 'medium' || normType === 'suspicious' || normType === 'disputed') {
    badgeClass = 'badge-warning';
    Icon = AlertTriangle;
    if (!text) label = normType === 'disputed' ? 'Disputed' : 'Suspicious';
  } else if (normType === 'high' || normType === 'fraud' || normType === 'flagged' || normType === 'quarantined' || normType === 'rejected') {
    badgeClass = 'badge-fraud';
    Icon = normType === 'rejected' ? XCircle : (normType === 'quarantined' ? Flag : ShieldAlert);
    if (!text) label = normType === 'rejected' ? 'Rejected' : (normType === 'quarantined' ? 'Quarantined' : 'High Risk');
  }

  const isSmall = size === 'sm';

  return (
    <span
      className={`badge ${badgeClass}`}
      style={{
        padding: isSmall ? '2px 8px' : '4px 10px',
        fontSize: isSmall ? '0.7rem' : '0.75rem',
      }}
    >
      <span className="badge-dot" />
      <Icon size={isSmall ? 12 : 14} style={{ display: 'inline', strokeWidth: 2.2 }} />
      <span>{label}</span>
    </span>
  );
};
