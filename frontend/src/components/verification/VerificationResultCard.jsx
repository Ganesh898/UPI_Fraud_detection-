import React, { useState } from 'react';
import { RiskMeter } from '../common/RiskMeter';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  Flag,
  RotateCcw,
  Sparkles,
  Cpu,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const VerificationResultCard = ({
  result,
  transaction,
  onReset,
  onBlacklistSender,
}) => {
  const { triggerSafeAlert, triggerFraudAlert } = useSound();
  const [showMlDetails, setShowMlDetails] = useState(false);

  if (!result || !transaction) return null;

  const score = result.riskScore ?? result.score ?? 0;
  const isSafe = score <= 30;
  const isSuspicious = score >= 31 && score <= 70;
  const isFraud = score >= 71;

  const riskLevelText = result.riskLevel || (isFraud ? 'High Risk' : isSuspicious ? 'Medium Risk' : 'Low Risk');
  const recommendedAction = result.recommendedAction || (
    isFraud
      ? 'BLOCK & FREEZE: Immediately reject transaction, hold settlement, quarantine UTR, and alert fraud desk.'
      : isSuspicious
      ? 'STEP-UP AUTHENTICATION: Request biometric/PIN step-up verification and enforce 15-minute cooling hold.'
      : 'APPROVE & CLEAR: Real-time straight-through processing. Validated for immediate retail release.'
  );

  const bannerColor = isFraud ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981';
  const bannerBg = isFraud
    ? 'rgba(239, 68, 68, 0.12)'
    : isSuspicious
    ? 'rgba(245, 158, 11, 0.12)'
    : 'rgba(16, 185, 129, 0.12)';
  const bannerBorder = isFraud
    ? 'rgba(239, 68, 68, 0.4)'
    : isSuspicious
    ? 'rgba(245, 158, 11, 0.4)'
    : 'rgba(16, 185, 129, 0.4)';

  const detectionReasons = result.detectionReasons || result.factors || [];

  return (
    <div
      className="cyber-card"
      style={{
        border: `1px solid ${bannerBorder}`,
        backgroundColor: '#0c1322',
        position: 'relative',
        boxShadow: isFraud
          ? '0 10px 40px rgba(239, 68, 68, 0.25)'
          : isSuspicious
          ? '0 10px 40px rgba(245, 158, 11, 0.2)'
          : '0 10px 40px rgba(16, 185, 129, 0.2)',
      }}
    >
      {/* ⚠️ Prototype & Demo Disclaimer Banner */}
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
          margin: '-20px -20px 16px -20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: '0.74rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#818cf8', fontWeight: 700 }}>
          <Sparkles size={14} />
          <span>PROTOTYPE / DEMO FRAUD DETECTION SYSTEM (SIMULATED NPCI & BANKING SANDBOX)</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.68rem' }}>
            Scale: 0–30 Low | 31–70 Medium | 71–100 High
          </span>
          <span className="badge" style={{ backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '0.68rem' }}>
            v2.4 Modular
          </span>
        </div>
      </div>

      {/* Top Banner Verdict */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: bannerBg,
          borderBottom: `1px solid ${bannerBorder}`,
          margin: '0 -20px 20px -20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isFraud ? (
            <ShieldAlert size={32} color="#ef4444" />
          ) : isSuspicious ? (
            <AlertTriangle size={32} color="#f59e0b" />
          ) : (
            <ShieldCheck size={32} color="#10b981" />
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
                {result.verdict || (isFraud ? 'HIGH RISK FRAUD' : isSuspicious ? 'SUSPICIOUS REVIEW' : 'VERIFIED GENUINE')}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4,
                  backgroundColor: bannerColor,
                  color: isFraud || isSafe ? '#ffffff' : '#000000',
                  textTransform: 'uppercase',
                }}
              >
                {riskLevelText} ({score}/100)
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: bannerColor, fontWeight: 600, marginTop: 2 }}>
              {isSafe
                ? 'Payment cleared. Behavioral and structural indicators within safe thresholds.'
                : isSuspicious
                ? 'Elevated risk detected. Hold settlement and execute step-up verification.'
                : 'CRITICAL WARNING: High fraud probability detected. Settlement blocked.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => (isSafe ? triggerSafeAlert(transaction.amount) : triggerFraudAlert())}
            title="Replay Alert Tone"
          >
            <Volume2 size={14} />
            <span>Replay Audio Alert</span>
          </button>
        </div>
      </div>

      {/* 🛡️ Highlighted Recommended Action Box */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          backgroundColor: isFraud
            ? 'rgba(239, 68, 68, 0.08)'
            : isSuspicious
            ? 'rgba(245, 158, 11, 0.08)'
            : 'rgba(16, 185, 129, 0.08)',
          borderLeft: `4px solid ${bannerColor}`,
          borderTop: `1px solid ${bannerBorder}`,
          borderRight: `1px solid ${bannerBorder}`,
          borderBottom: `1px solid ${bannerBorder}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Activity size={16} color={bannerColor} />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: bannerColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Recommended Action
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.4 }}>
          {recommendedAction}
        </div>
      </div>

      {/* Main Grid: Gauge on Left, Forensic Checklist on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24, alignItems: 'flex-start' }}>
        {/* Left: Risk Score Gauge & Transaction Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
          <RiskMeter score={score} size={190} showLabel={true} />

          {/* Quick specs pill */}
          <div
            style={{
              width: '100%',
              marginTop: 14,
              padding: '12px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>UTR Reference:</span>
              <span className="text-mono" style={{ color: '#00f2fe', fontWeight: 700 }}>
                {transaction.utr_number || 'N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>
                ₹{parseFloat(transaction.amount || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sender VPA:</span>
              <span style={{ color: '#ffffff' }}>
                {transaction.sender_vpa || 'Anonymous / Counter'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payee VPA:</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {transaction.receiver_vpa || 'merchant.registered@upi'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Risk Tier:</span>
              <span style={{ color: bannerColor, fontWeight: 700 }}>
                {riskLevelText} ({score}/100)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Transparent Detection Reasons Breakdown */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Transparent Detection Reasons ({detectionReasons.length})
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Explainable Rule Matrix
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
            {detectionReasons && detectionReasons.length > 0 ? (
              detectionReasons.map((factor, idx) => {
                const isCrit = factor.severity === 'CRITICAL' || factor.severity === 'HIGH';
                const isSafeFactor = factor.severity === 'SAFE';
                const factorColor = isSafeFactor ? '#10b981' : isCrit ? '#ef4444' : '#f59e0b';

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      backgroundColor: isSafeFactor
                        ? 'rgba(16, 185, 129, 0.05)'
                        : isCrit
                        ? 'rgba(239, 68, 68, 0.07)'
                        : 'rgba(245, 158, 11, 0.07)',
                      border: `1px solid ${
                        isSafeFactor
                          ? 'rgba(16, 185, 129, 0.2)'
                          : isCrit
                          ? 'rgba(239, 68, 68, 0.25)'
                          : 'rgba(245, 158, 11, 0.25)'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: factorColor,
                          }}
                        >
                          {factor.title || factor.name}
                        </span>
                        {factor.category && (
                          <span
                            style={{
                              fontSize: '0.62rem',
                              padding: '1px 6px',
                              borderRadius: 3,
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {factor.category}
                          </span>
                        )}
                      </div>

                      {factor.points > 0 ? (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            color: factorColor,
                          }}
                        >
                          +{factor.points} Risk Pts
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#10b981',
                          }}
                        >
                          Safe (0 pts)
                        </span>
                      )}
                    </div>

                    {factor.description && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                        {factor.description}
                      </div>
                    )}

                    {(factor.observed || factor.baseline) && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: '0.68rem',
                          display: 'flex',
                          gap: 12,
                          color: 'var(--text-muted)',
                        }}
                      >
                        {factor.observed && (
                          <span>
                            Observed: <strong style={{ color: '#e2e8f0' }}>{factor.observed}</strong>
                          </span>
                        )}
                        {factor.baseline && (
                          <span>
                            Baseline: <strong style={{ color: '#94a3b8' }}>{factor.baseline}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No penalty factors triggered. Baseline clean.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🤖 Pluggable Modular ML Model Insights Accordion */}
      {result.mlModelInsights && (
        <div
          style={{
            marginTop: 18,
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <div
            onClick={() => setShowMlDetails(!showMlDetails)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={16} color="#818cf8" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c7d2fe' }}>
                Modular ML Model Interface: {result.mlModelInsights.modelVersion || 'XGBoost-UPI-v2.1'}
              </span>
              <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontSize: '0.65rem' }}>
                ML Score: {result.mlModelInsights.mlScore ?? 'N/A'}/100
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#818cf8', fontSize: '0.72rem' }}>
              <span>{showMlDetails ? 'Hide ML Architecture' : 'View ML Architecture & SHAP'}</span>
              {showMlDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>

          {showMlDetails && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(99, 102, 241, 0.15)', fontSize: '0.72rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Architecture:</span>{' '}
                  <strong style={{ color: '#ffffff' }}>{result.mlModelInsights.modelType || 'GBDT Classifier'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Fraud Probability:</span>{' '}
                  <strong style={{ color: '#818cf8' }}>
                    {((result.mlModelInsights.fraudProbability || 0) * 100).toFixed(1)}%
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Inference Latency:</span>{' '}
                  <strong style={{ color: '#10b981' }}>{result.mlModelInsights.inferenceLatencyMs || 8} ms</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Ready for Production ONNX:</span>{' '}
                  <strong style={{ color: '#10b981' }}>Yes (Pluggable Adapter)</strong>
                </div>
              </div>

              {result.mlModelInsights.topFeatureContributions && (
                <div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                    Top SHAP Feature Importance Drivers:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.mlModelInsights.topFeatureContributions.map((item, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: '0.68rem',
                          color: '#e2e8f0',
                        }}
                      >
                        <strong>{item.feature}</strong>: {item.value} (+{item.weight.toFixed(1)})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {isFraud && onBlacklistSender && transaction.sender_vpa && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onBlacklistSender(transaction.sender_vpa)}
            >
              <Flag size={14} />
              <span>Blacklist Sender VPA</span>
            </button>
          )}
        </div>

        <button className="btn btn-primary btn-sm" onClick={onReset}>
          <RotateCcw size={14} />
          <span>Verify Next Transaction</span>
        </button>
      </div>
    </div>
  );
};
