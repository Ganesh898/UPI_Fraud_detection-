import React, { useEffect, useState } from 'react';
import {
  ScanLine,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Cpu,
  Clock,
  Shield,
  FileCheck,
  Sliders,
  Smartphone,
  History,
  Activity,
  Layers,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { JulianDateDecoder } from '../components/verification/JulianDateDecoder';
import { OcrInspector } from '../components/verification/OcrInspector';
import { VerificationResultCard } from '../components/verification/VerificationResultCard';
import { generateAuthenticUtr, defaultEngine } from '../services/fraudEngine';

export const VerifyPage = () => {
  const { user } = useAuth();
  const { verifyPayment, addBlacklistVpa } = useTransactions();

  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'manual' | 'ocr'

  // Manual Form State
  const [utrInput, setUtrInput] = useState('628109482914');
  const [amountInput, setAmountInput] = useState('1450');
  const [senderVpaInput, setSenderVpaInput] = useState('customer@okaxis');
  const [notesInput, setNotesInput] = useState('');

  // OCR state
  const [isScanning, setIsScanning] = useState(false);

  // Result state
  const [activeResult, setActiveResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [simulatorRunRequested, setSimulatorRunRequested] = useState(false);

  // ─── Simulator State (All 9 Demo Features) ──────────────────────────────────
  const [simAmount, setSimAmount] = useState(1450);
  const [simSenderAvg, setSimSenderAvg] = useState(850);
  const [simTxnFrequency1h, setSimTxnFrequency1h] = useState(2);
  const [simTxnVelocity5m, setSimTxnVelocity5m] = useState(1);
  const [simIsNewRecipient, setSimIsNewRecipient] = useState(false);
  const [simIsOffHours, setSimIsOffHours] = useState(false);
  const [simPatternType, setSimPatternType] = useState('normal'); // 'normal' | 'structuring' | 'escalating' | 'repeated'
  const [simDeviceRooted, setSimDeviceRooted] = useState(false);
  const [simDeviceNew, setSimDeviceNew] = useState(false);
  const [simDeviceVpn, setSimDeviceVpn] = useState(false);
  const [simDeviceGeoMismatch, setSimDeviceGeoMismatch] = useState(false);
  const [simReceiverBlacklisted, setSimReceiverBlacklisted] = useState(false);
  const [simSenderFraudHistory, setSimSenderFraudHistory] = useState(0);
  const [simScoringMode, setSimScoringMode] = useState('RULE_BASED'); // 'RULE_BASED' | 'ML_MODEL' | 'HYBRID_ENSEMBLE'
  const [simUtr, setSimUtr] = useState('628109482914');
  const [simSenderVpa, setSimSenderVpa] = useState('priya.retail@okhdfcbank');
  const [simReceiverVpa, setSimReceiverVpa] = useState('merchant.pos@okhdfcbank');

  const runManualPreset = async ({ utr, amount, senderVpa, notes, customFeatures = {} }) => {
    setUtrInput(utr);
    setAmountInput(String(amount));
    setSenderVpaInput(senderVpa);
    setNotesInput(notes);
    setActiveResult(null);
    setIsScanning(true);
    try {
      const result = await verifyPayment({
        utr,
        amount,
        senderVpa,
        receiverVpa: user?.merchant_vpa || 'apex.retail@okhdfcbank',
        mode: 'manual',
        notes,
        customFeatures,
      });
      setActiveResult(result);
    } catch (error) {
      setAnalysisError(error.message || 'Preset verification failed.');
    } finally {
      setIsScanning(false);
    }
  };

  // Quick preset scenario loaders for demo judges
  const handleLoadAuthentic = () => runManualPreset({
    utr: generateAuthenticUtr(),
    amount: 850,
    senderVpa: 'kavita.nair@okhdfcbank',
    notes: 'Valid in-store payment',
  });

  const handleLoadReplay = () => runManualPreset({
    utr: '628109482914',
    amount: 1450,
    senderVpa: 'recycled.scammer@ybl',
    notes: 'Attempted duplicate presentation',
  });

  const handleLoadInvalidJulian = () => runManualPreset({
    utr: '639908123456',
    amount: 3200,
    senderVpa: 'fake.generator@paytm',
    notes: 'Impossible Julian day artifact',
  });

  const handleLoadSpoof10Digit = () => runManualPreset({
    utr: '9381029481',
    amount: 4500,
    senderVpa: 'spoof.apk@ybl',
    notes: 'Paytm Spoof APK signature',
    customFeatures: { isKnownSpoofDemo: true },
  });

  // ─── Simulator Preset Scenarios ─────────────────────────────────────────────
  const applySimPreset = (presetName) => {
    switch (presetName) {
      case 'SAFE_PURCHASE':
        setSimAmount(350);
        setSimSenderAvg(400);
        setSimTxnFrequency1h(1);
        setSimTxnVelocity5m(1);
        setSimIsNewRecipient(false);
        setSimIsOffHours(false);
        setSimPatternType('normal');
        setSimDeviceRooted(false);
        setSimDeviceNew(false);
        setSimDeviceVpn(false);
        setSimDeviceGeoMismatch(false);
        setSimReceiverBlacklisted(false);
        setSimSenderFraudHistory(0);
        setSimUtr(generateAuthenticUtr());
        setSimSenderVpa('kavita.nair@okhdfcbank');
        setSimReceiverVpa('merchant.pos@okhdfcbank');
        break;

      case 'NOCTURNAL_NEW_RECIPIENT':
        setSimAmount(65000);
        setSimSenderAvg(1200);
        setSimTxnFrequency1h(2);
        setSimTxnVelocity5m(1);
        setSimIsNewRecipient(true);
        setSimIsOffHours(true); // 3:00 AM
        setSimPatternType('normal');
        setSimDeviceRooted(false);
        setSimDeviceNew(true);
        setSimDeviceVpn(false);
        setSimDeviceGeoMismatch(false);
        setSimReceiverBlacklisted(false);
        setSimSenderFraudHistory(0);
        setSimUtr(generateAuthenticUtr());
        setSimSenderVpa('sleepy.user@paytm');
        setSimReceiverVpa('unknown.shady@axl');
        break;

      case 'VELOCITY_BURST_SMURFING':
        setSimAmount(49990); // Structuring just below 50,000 PAN threshold
        setSimSenderAvg(800);
        setSimTxnFrequency1h(9);
        setSimTxnVelocity5m(4); // 4 transfers in 5 minutes
        setSimIsNewRecipient(true);
        setSimIsOffHours(false);
        setSimPatternType('structuring');
        setSimDeviceRooted(false);
        setSimDeviceNew(false);
        setSimDeviceVpn(true);
        setSimDeviceGeoMismatch(false);
        setSimReceiverBlacklisted(false);
        setSimSenderFraudHistory(0);
        setSimUtr(generateAuthenticUtr());
        setSimSenderVpa('burst.smurfer@ybl');
        setSimReceiverVpa('cash.mule@icici');
        break;

      case 'MICRO_PROBE_ESCALATION':
        setSimAmount(75000);
        setSimSenderAvg(500);
        setSimTxnFrequency1h(4);
        setSimTxnVelocity5m(2);
        setSimIsNewRecipient(true);
        setSimIsOffHours(true);
        setSimPatternType('escalating');
        setSimDeviceRooted(false);
        setSimDeviceNew(true);
        setSimDeviceVpn(true);
        setSimDeviceGeoMismatch(true);
        setSimReceiverBlacklisted(false);
        setSimSenderFraudHistory(1);
        setSimUtr(generateAuthenticUtr());
        setSimSenderVpa('probe.carder@freecharge');
        setSimReceiverVpa('crypto.otc@axis');
        break;

      case 'ROOTED_EMULATOR_BLACKLIST':
        setSimAmount(32000);
        setSimSenderAvg(1500);
        setSimTxnFrequency1h(6);
        setSimTxnVelocity5m(3);
        setSimIsNewRecipient(true);
        setSimIsOffHours(false);
        setSimPatternType('normal');
        setSimDeviceRooted(true); // Rooted Android spoof tool
        setSimDeviceNew(true);
        setSimDeviceVpn(true);
        setSimDeviceGeoMismatch(true);
        setSimReceiverBlacklisted(true); // Blacklisted recipient
        setSimSenderFraudHistory(2);
        setSimUtr('639908123456'); // Invalid Julian UTR
        setSimSenderVpa('spoof.apk@ybl');
        setSimReceiverVpa('cybercrime.fraud@paytm');
        break;

      case 'UNUSUAL_AMOUNT_SPIKE':
        setSimAmount(52000);
        setSimSenderAvg(250); // 208x deviation
        setSimTxnFrequency1h(1);
        setSimTxnVelocity5m(1);
        setSimIsNewRecipient(true);
        setSimIsOffHours(false);
        setSimPatternType('normal');
        setSimDeviceRooted(false);
        setSimDeviceNew(true);
        setSimDeviceVpn(false);
        setSimDeviceGeoMismatch(false);
        setSimReceiverBlacklisted(false);
        setSimSenderFraudHistory(0);
        setSimUtr(generateAuthenticUtr());
        setSimSenderVpa('regular.shopper@okhdfc');
        setSimReceiverVpa('jeweller.highval@axis');
        break;

      default:
        break;
    }
    setActiveResult(null);
    setSimulatorRunRequested(true);
  };

  // Run the Simulator Evaluation
  const handleRunSimulator = (e) => {
    if (e) e.preventDefault();
    setIsScanning(true);

    setTimeout(() => {
      const evaluation = defaultEngine.evaluate({
        amount: simAmount,
        utr: simUtr,
        senderVpa: simSenderVpa,
        receiverVpa: simReceiverVpa,
        timestamp: (() => {
          const timestamp = new Date();
          if (simIsOffHours) timestamp.setHours(3, 15, 0, 0);
          return timestamp.toISOString();
        })(),
        txnCountLast1Hour: simTxnFrequency1h,
        txnCountLast5Min: simTxnVelocity5m,
        senderHistoricalAvg: simSenderAvg,
        isNewRecipient: simIsNewRecipient,
        isStructuringPattern: simPatternType === 'structuring',
        isEscalatingPattern: simPatternType === 'escalating',
        isRepeatedIdenticalAmount: simPatternType === 'repeated',
        isRootedOrEmulator: simDeviceRooted,
        isNewDevice: simDeviceNew,
        isVpnOrProxy: simDeviceVpn,
        isLocationMismatch: simDeviceGeoMismatch,
        receiverIsBlacklisted: simReceiverBlacklisted,
        senderPastFraudCount: simSenderFraudHistory,
        scoring_mode: simScoringMode,
      });

      const syntheticTxn = {
        id: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        utr_number: simUtr,
        amount: simAmount,
        sender_vpa: simSenderVpa,
        receiver_vpa: simReceiverVpa,
        created_at: new Date().toISOString(),
        timestamp: new Date().toLocaleTimeString(),
        verification_mode: 'simulator',
        risk_score: evaluation.riskScore,
        risk_level: evaluation.riskLevel,
        verdict: evaluation.riskScore >= 71
          ? 'HIGH RISK FRAUD DETECTED'
          : evaluation.riskScore >= 31
            ? 'SUSPICIOUS - VERIFY BANK SMS'
            : 'LOW RISK - CONFIRM BANK CREDIT',
        status: evaluation.riskScore >= 71 ? 'flagged' : evaluation.riskScore >= 31 ? 'review' : 'verified',
        notes: `Simulated via ${simScoringMode} engine`,
      };

      setActiveResult({ transaction: syntheticTxn, evaluation });
      setIsScanning(false);
    }, 350);
  };

  useEffect(() => {
    if (!simulatorRunRequested) return;
    setSimulatorRunRequested(false);
    handleRunSimulator();
  }, [simulatorRunRequested]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!utrInput) return;

    setIsScanning(true);
    try {
      const result = await verifyPayment({
        utr: utrInput,
        amount: amountInput,
        senderVpa: senderVpaInput,
        receiverVpa: user?.merchant_vpa || 'apex.retail@okhdfcbank',
        mode: 'manual',
        notes: notesInput || 'Manual Counter Check',
      });
      setActiveResult(result);
    } finally {
      setIsScanning(false);
    }
  };

  const handleOcrAnalyze = async (sampleReceipt) => {
    setIsScanning(true);
    setAnalysisError('');
    try {
      if (sampleReceipt.file) {
        const result = await verifyPayment({
          utr: '',
          amount: 0,
          mode: 'ocr_screenshot',
          screenshotFile: sampleReceipt.file,
          notes: `OCR receipt: ${sampleReceipt.name}`,
        });
        setActiveResult(result);
        return;
      }

      const cleanAmt = (sampleReceipt.amount || '').replace(/[^0-9.]/g, '');
      const result = await verifyPayment({
        utr: sampleReceipt.utr,
        amount: cleanAmt,
        senderVpa: sampleReceipt.sender,
        receiverVpa: sampleReceipt.receiver,
        mode: 'ocr_screenshot',
        notes: sampleReceipt.name,
        customFeatures: { isKnownSpoofDemo: sampleReceipt.isKnownSpoofDemo },
      });
      setActiveResult(result);
    } catch (error) {
      const extracted = error.errors;
      const extractionSummary = extracted
        ? ` OCR read UTR: ${extracted.extractedUtr || 'not detected'}; amount: ${extracted.extractedAmount ?? 'not detected'} (${Math.round(extracted.confidence || 0)}% text confidence).`
        : '';
      setAnalysisError(`${error.message || 'Receipt analysis failed. Please check the image and try again.'}${extractionSummary}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setActiveResult(null);
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
              UPI Fraud Detection Engine Desk
            </h1>
            <span className="badge badge-warning" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              PROTOTYPE / DEMO SYSTEM
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>0–30: Low</span>
            <span>|</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>31–70: Medium</span>
            <span>|</span>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>71–100: High</span>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Transparent rule-based scoring engine with modular ML model interface across transaction amount, velocity, timing, and anomalies.
        </p>
      </div>

      {/* Show Verification Result Banner if active */}
      {activeResult ? (
        <VerificationResultCard
          result={activeResult.evaluation}
          transaction={activeResult.transaction}
          onReset={handleReset}
          onBlacklistSender={(vpa) => addBlacklistVpa(vpa, 'Flagged during POS verification')}
        />
      ) : (
        <>
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, flexWrap: 'wrap' }}>
            <button
              className={`btn ${activeTab === 'simulator' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('simulator')}
              style={{ gap: 8 }}
            >
              <Sliders size={16} />
              <span>Multi-Feature Fraud Engine Simulator (Judge Playground)</span>
            </button>
            <button
              className={`btn ${activeTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('manual')}
              style={{ gap: 8 }}
            >
              <Cpu size={16} />
              <span>Manual POS Verification & Julian Decoder</span>
            </button>
            <button
              className={`btn ${activeTab === 'ocr' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('ocr')}
              style={{ gap: 8 }}
            >
              <ImageIcon size={16} />
              <span>Screenshot OCR Inspector</span>
            </button>
          </div>

          {/* TAB 1: INTERACTIVE MULTI-FEATURE FRAUD SIMULATOR */}
          {activeTab === 'simulator' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Presets Header */}
              <div className="cyber-card" style={{ padding: '16px 20px', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={16} color="#818cf8" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      1-Click Test Scenarios (All 9 Demo Features)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Select a scenario to populate features automatically
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => applySimPreset('SAFE_PURCHASE')}
                    style={{ fontSize: '0.72rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981' }}
                  >
                    <CheckCircle2 size={13} />
                    <span>1. Legitimate Purchase (Score ~0-10)</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => applySimPreset('NOCTURNAL_NEW_RECIPIENT')}
                    style={{ fontSize: '0.72rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}
                  >
                    <Clock size={13} />
                    <span>2. Nocturnal Transfer (3 AM) + New Recipient</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => applySimPreset('VELOCITY_BURST_SMURFING')}
                    style={{ fontSize: '0.72rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                  >
                    <Zap size={13} />
                    <span>3. Velocity Burst (4 in 5m) + Smurfing ₹49,990</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => applySimPreset('MICRO_PROBE_ESCALATION')}
                    style={{ fontSize: '0.72rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                  >
                    <Activity size={13} />
                    <span>4. Micro-Probe Validation Escalation</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => applySimPreset('ROOTED_EMULATOR_BLACKLIST')}
                    style={{ fontSize: '0.72rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                  >
                    <AlertOctagon size={13} />
                    <span>5. Rooted Device / Spoof APK + Blacklist Match</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => applySimPreset('UNUSUAL_AMOUNT_SPIKE')}
                    style={{ fontSize: '0.72rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}
                  >
                    <Sliders size={13} />
                    <span>6. Unusual Amount Spike (208x Baseline)</span>
                  </button>
                </div>
              </div>

              {/* Main Controls Grid */}
              <form onSubmit={handleRunSimulator} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {/* Column 1: Transaction Amount, Baseline & Velocity */}
                <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sliders size={15} />
                    <span>Amount & Velocity Features</span>
                  </div>

                  {/* 1. Transaction Amount */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label className="form-label" style={{ margin: 0 }}>Transaction Amount (₹)</label>
                      <span className="text-mono" style={{ color: '#00f2fe', fontWeight: 700 }}>
                        ₹{Number(simAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="120000"
                      step="50"
                      value={simAmount}
                      onChange={(e) => setSimAmount(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#00f2fe' }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {['5', '350', '49990', '95000'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => setSimAmount(Number(amt))}
                          style={{ fontSize: '0.65rem' }}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Sender Historical Average (Unusual Amount Feature) */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label className="form-label" style={{ margin: 0 }}>Sender Historical Avg (₹)</label>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        ₹{simSenderAvg} (Deviation: {(simAmount / Math.max(1, simSenderAvg)).toFixed(1)}x)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="50"
                      value={simSenderAvg}
                      onChange={(e) => setSimSenderAvg(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#818cf8' }}
                    />
                  </div>

                  {/* 3. Transaction Frequency (1-Hour) */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label className="form-label" style={{ margin: 0 }}>Frequency in Last 1 Hour</label>
                      <span style={{ color: simTxnFrequency1h >= 5 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                        {simTxnFrequency1h} txns / hr
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={simTxnFrequency1h}
                      onChange={(e) => setSimTxnFrequency1h(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#f59e0b' }}
                    />
                  </div>

                  {/* 4. Multiple Transactions in Short Period (5-Minute Velocity) */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label className="form-label" style={{ margin: 0 }}>Velocity in Last 5 Minutes</label>
                      <span style={{ color: simTxnVelocity5m >= 3 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                        {simTxnVelocity5m} txns in 5 min
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={simTxnVelocity5m}
                      onChange={(e) => setSimTxnVelocity5m(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#ef4444' }}
                    />
                  </div>
                </div>

                {/* Column 2: Timing, Recipient & Suspicious Patterns */}
                <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={15} />
                    <span>Behavioral & Pattern Features</span>
                  </div>

                  {/* 5. New Recipient */}
                  <div style={{ padding: '10px 12px', borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', margin: 0 }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>New Recipient (First-Time Payee)</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Never transferred to this beneficiary VPA before</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={simIsNewRecipient}
                        onChange={(e) => setSimIsNewRecipient(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#00f2fe', cursor: 'pointer' }}
                      />
                    </label>
                  </div>

                  {/* 6. Transaction Timing (Nocturnal) */}
                  <div style={{ padding: '10px 12px', borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', margin: 0 }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>Nocturnal Hours (1:00 AM – 5:00 AM)</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Stealth off-peak window when users are asleep</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={simIsOffHours}
                        onChange={(e) => setSimIsOffHours(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#f59e0b', cursor: 'pointer' }}
                      />
                    </label>
                  </div>

                  {/* 7. Suspicious Transaction Pattern */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Suspicious Transaction Pattern</label>
                    <select
                      className="input-field"
                      value={simPatternType}
                      onChange={(e) => setSimPatternType(e.target.value)}
                    >
                      <option value="normal">Normal Organic Payment Pattern</option>
                      <option value="structuring">Structuring / Smurfing (₹49,990 just below PAN threshold)</option>
                      <option value="escalating">Micro-Probe Escalation (₹1 probe then large transfer)</option>
                      <option value="repeated">Repeated Split Amounts in Minutes</option>
                    </select>
                  </div>

                  {/* Past Fraud History */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label className="form-label" style={{ margin: 0 }}>Sender Past Fraud Incident Reports</label>
                      <span style={{ color: simSenderFraudHistory > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                        {simSenderFraudHistory} incident(s)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      value={simSenderFraudHistory}
                      onChange={(e) => setSimSenderFraudHistory(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#ef4444' }}
                    />
                  </div>
                </div>

                {/* Column 3: Device / Session & Fraud History */}
                <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Smartphone size={15} />
                    <span>Device & Fraud History Anomaly</span>
                  </div>

                  {/* 8. Device Anomaly Checkboxes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: '#f1f5f9', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={simDeviceRooted}
                        onChange={(e) => setSimDeviceRooted(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#ef4444' }}
                      />
                      <span>Rooted / Android Emulator (Fake APK tool flag)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: '#f1f5f9', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={simDeviceVpn}
                        onChange={(e) => setSimDeviceVpn(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#ef4444' }}
                      />
                      <span>Anonymous VPN / Datacenter Proxy Relay</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: '#f1f5f9', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={simDeviceNew}
                        onChange={(e) => setSimDeviceNew(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#f59e0b' }}
                      />
                      <span>Unfamiliar New Device (First-time IMEI/hardware)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: '#f1f5f9', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={simDeviceGeoMismatch}
                        onChange={(e) => setSimDeviceGeoMismatch(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#f59e0b' }}
                      />
                      <span>Geolocation Mismatch / Impossible Travel Velocity</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: '#f87171', fontWeight: 700, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={simReceiverBlacklisted}
                        onChange={(e) => setSimReceiverBlacklisted(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#ef4444' }}
                      />
                      <span>Recipient VPA Blacklisted in National Fraud Registry</span>
                    </label>
                  </div>

                  {/* Engine Mode Selection (Modular Architecture) */}
                  <div className="form-group" style={{ margin: 0, marginTop: 'auto' }}>
                    <label className="form-label">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Layers size={14} color="#818cf8" />
                        <span>Modular Engine Architecture Mode</span>
                      </span>
                    </label>
                    <select
                      className="input-field"
                      value={simScoringMode}
                      onChange={(e) => setSimScoringMode(e.target.value)}
                    >
                      <option value="RULE_BASED">Rule-Based Engine (Transparent Rules & Auditing)</option>
                      <option value="ML_MODEL">Modular ML Scorer (XGBoost / GBDT Model)</option>
                      <option value="HYBRID_ENSEMBLE">Hybrid Ensemble (Rules + ML Model)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isScanning}
                    style={{ gap: 10 }}
                  >
                    <ScanLine size={18} />
                    <span>{isScanning ? 'Executing Risk Matrix...' : 'Run Fraud Detection Engine'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MANUAL POS VERIFICATION & JULIAN DECODER */}
          {activeTab === 'manual' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
              {/* Left Column: Manual Form */}
              <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1-Click POS Presets
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleLoadAuthentic}
                      style={{ fontSize: '0.72rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981' }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Authentic (Low Risk)</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleLoadReplay}
                      style={{ fontSize: '0.72rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                    >
                      <AlertTriangle size={13} />
                      <span>Replay Duplicate</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleLoadInvalidJulian}
                      style={{ fontSize: '0.72rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}
                    >
                      <Cpu size={13} />
                      <span>Julian Day 399</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleLoadSpoof10Digit}
                      style={{ fontSize: '0.72rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                    >
                      <AlertTriangle size={13} />
                      <span>10-Digit Spoof APK</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">
                      <span>12-Digit Indian UPI UTR Number</span>
                      <span style={{ fontSize: '0.72rem', color: '#00f2fe' }}>
                        Length: {utrInput.length}/12
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input-field mono"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="e.g. 628109482914"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Amount (₹)</label>
                      <input
                        type="number"
                        className="input-field"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="850"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Sender UPI ID</label>
                      <input
                        type="text"
                        className="input-field"
                        value={senderVpaInput}
                        onChange={(e) => setSenderVpaInput(e.target.value)}
                        placeholder="customer@okhdfcbank"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Cashier / Terminal Note</label>
                    <input
                      type="text"
                      className="input-field"
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Counter terminal 1..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isScanning}
                    style={{ marginTop: 8, gap: 10 }}
                  >
                    <ScanLine size={18} />
                    <span>{isScanning ? 'Executing Risk Analysis...' : 'Verify Transaction Authenticity'}</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Live Julian Decoder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <JulianDateDecoder utr={utrInput} />

                <div
                  className="cyber-card"
                  style={{
                    backgroundColor: 'rgba(10, 16, 29, 0.7)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={16} color="#00f2fe" />
                    <span>Transparent Rule Thresholds</span>
                  </div>
                  <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: 18, lineHeight: 1.6 }}>
                    <li><strong>0–30 Low Risk:</strong> Instant approval & merchandise handoff.</li>
                    <li><strong>31–70 Medium Risk:</strong> Step-up 2FA re-verification & 15m delay.</li>
                    <li><strong>71–100 High Risk:</strong> Immediate transaction block and freeze.</li>
                    <li>Modular adapter architecture ready for live ML model inference.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCREENSHOT OCR INSPECTOR */}
          {activeTab === 'ocr' && (
            <OcrInspector
              onAnalyze={handleOcrAnalyze}
              isScanning={isScanning}
              analysisError={analysisError}
            />
          )}
        </>
      )}
    </div>
  );
};
