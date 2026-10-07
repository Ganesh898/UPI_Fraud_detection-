import React from 'react';
import { decodeUtrJulianDate, getJulianDayOfYear } from '../../services/fraudEngine';
import { Calendar, Check, AlertTriangle, Hash, Cpu } from 'lucide-react';

export const JulianDateDecoder = ({ utr = '' }) => {
  const cleanUtr = (utr || '').trim();
  const decoded = decodeUtrJulianDate(cleanUtr);
  const currentJulian = getJulianDayOfYear();
  const currentYearDigit = new Date().getFullYear() % 10;

  if (!cleanUtr || cleanUtr.length < 4) {
    return (
      <div
        style={{
          padding: '16px',
          borderRadius: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border-medium)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Cpu size={18} color="var(--primary)" />
        <span>Enter a 12-digit Indian UPI UTR above to inspect the real-time Julian calendar syntax.</span>
      </div>
    );
  }

  const isDayValid = decoded?.isValidDay;
  const isYearValid = decoded?.yearDigit === currentYearDigit || decoded?.yearDigit === ((currentYearDigit - 1 + 10) % 10);
  const isDateInFuture = decoded?.yearDigit === currentYearDigit && decoded?.julianDay > currentJulian + 1;

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid var(--border-medium)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
          <Calendar size={15} color="#00f2fe" />
          <span>NPCI 12-Digit Julian Architecture Decoder</span>
        </div>
        <span
          className={`badge ${isDayValid && isYearValid && !isDateInFuture ? 'badge-safe' : 'badge-fraud'}`}
          style={{ fontSize: '0.68rem', padding: '2px 8px' }}
        >
          {isDayValid && isYearValid && !isDateInFuture ? 'SYNTAX VALID' : 'SYNTAX ANOMALY'}
        </span>
      </div>

      {/* Visual Digit Segmentation Blocks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          marginBottom: 14,
        }}
      >
        {/* Year Digit */}
        <div
          style={{
            padding: '10px 8px',
            borderRadius: 6,
            backgroundColor: isYearValid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isYearValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            [1] Year Digit
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff', margin: '2px 0' }}>
            {cleanUtr.substring(0, 1)}
          </div>
          <div style={{ fontSize: '0.68rem', color: isYearValid ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {decoded.estimatedYear} {isYearValid ? '✓' : '⚠️'}
          </div>
        </div>

        {/* Julian Days */}
        <div
          style={{
            padding: '10px 8px',
            borderRadius: 6,
            backgroundColor: isDayValid && !isDateInFuture ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isDayValid && !isDateInFuture ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            [2-4] Julian Day
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff', margin: '2px 0' }}>
            {cleanUtr.substring(1, 4)}
          </div>
          <div style={{ fontSize: '0.68rem', color: isDayValid && !isDateInFuture ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            Day {decoded.julianDay} {isDayValid && !isDateInFuture ? '✓' : '⚠️ Out-of-bounds'}
          </div>
        </div>

        {/* Routing / Batch */}
        <div
          style={{
            padding: '10px 8px',
            borderRadius: 6,
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            [5] Route / Batch
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8', margin: '2px 0' }}>
            {cleanUtr.length >= 5 ? cleanUtr.substring(4, 5) : '—'}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Switch Route
          </div>
        </div>

        {/* Sequence */}
        <div
          style={{
            padding: '10px 8px',
            borderRadius: 6,
            backgroundColor: cleanUtr.length === 12 ? 'rgba(139, 92, 246, 0.08)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${cleanUtr.length === 12 ? 'rgba(139, 92, 246, 0.25)' : 'rgba(239, 68, 68, 0.4)'}`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            [6-12] Sequence
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#c084fc', margin: '2px 0' }}>
            {cleanUtr.length > 5 ? cleanUtr.substring(5) : '—'}
          </div>
          <div style={{ fontSize: '0.68rem', color: cleanUtr.length === 12 ? '#a855f7' : '#ef4444' }}>
            {cleanUtr.length === 12 ? '7 Digits ✓' : `${cleanUtr.length}/12 Total`}
          </div>
        </div>
      </div>

      {/* Gregorian Date Translation */}
      {decoded.decodedDate && (
        <div
          style={{
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 8,
          }}
        >
          <span>
            Decoded Calendar Settlement Date:{' '}
            <strong style={{ color: '#ffffff' }}>
              {decoded.decodedDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            System Julian Day: {currentJulian}
          </span>
        </div>
      )}
    </div>
  );
};
