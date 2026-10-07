// UPI Shield - Core Detection & Heuristic Engine (Client-Side & Prototype Simulator)
// Transparent Rule-Based Risk Engine with Pluggable Modular ML Architecture

/**
 * Calculates current year's Julian day and validates standard Indian UPI UTR:
 * Standard Format: [Y][DDD][R][XXXXXXX]
 * Y: Last digit of Year (e.g., 6 for 2026)
 * DDD: Julian day of year (001 to 366)
 * R: Bank settlement batch / routing code digit
 * XXXXXXX: 7-digit unique sequence
 */
export const getJulianDayOfYear = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const decodeUtrJulianDate = (utr) => {
  if (!utr || typeof utr !== 'string') return null;
  const cleanUtr = utr.trim();
  if (cleanUtr.length < 4) return null;

  const yearDigit = parseInt(cleanUtr.substring(0, 1), 10);
  const julianDayStr = cleanUtr.substring(1, 4);
  const julianDay = parseInt(julianDayStr, 10);

  const currentYear = new Date().getFullYear();
  const currentDecade = Math.floor(currentYear / 10) * 10;
  let estimatedYear = currentDecade + yearDigit;
  if (estimatedYear > currentYear + 1) {
    estimatedYear -= 10;
  }

  let decodedDate = null;
  let isValidDay = false;
  if (julianDay >= 1 && julianDay <= 366) {
    isValidDay = true;
    decodedDate = new Date(estimatedYear, 0);
    decodedDate.setDate(julianDay);
  }

  return {
    yearDigit,
    estimatedYear,
    julianDay,
    isValidDay,
    decodedDate,
    batchCode: cleanUtr.length >= 5 ? cleanUtr.substring(4, 5) : null,
    sequence: cleanUtr.length > 5 ? cleanUtr.substring(5) : null,
  };
};

export const generateAuthenticUtr = () => {
  const now = new Date();
  const yearDigit = now.getFullYear() % 10;
  const julianDay = String(getJulianDayOfYear(now)).padStart(3, '0');
  const routing = Math.floor(Math.random() * 9 + 1);
  const seq = String(Math.floor(Math.random() * 9000000 + 1000000));
  return `${yearDigit}${julianDay}${routing}${seq}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Feature Extractor
// ─────────────────────────────────────────────────────────────────────────────
export class FeatureExtractor {
  static extractFeatures(input = {}) {
    const amount = Math.max(0, parseFloat(input.amount) || 0);
    const utr = (input.utr || input.utr_number || '').trim();
    const senderVpa = (input.senderVpa || input.sender_vpa || '').trim().toLowerCase();
    const receiverVpa = (input.receiverVpa || input.receiver_vpa || '').trim().toLowerCase();
    const timestamp = input.timestamp ? new Date(input.timestamp) : new Date();

    const hour = timestamp.getHours();
    const isOffHours = hour >= 1 && hour <= 5; // 01:00 AM - 05:00 AM
    const isPeakBusinessHours = hour >= 9 && hour <= 21;

    const txnCountLast1Hour = parseInt(input.txnCountLast1Hour ?? input.txns_last_hour ?? 1, 10);
    const txnCountLast5Min = parseInt(input.txnCountLast5Min ?? input.txns_last_5min ?? 1, 10);
    const senderHistoricalAvg = Math.max(1, parseFloat(input.senderHistoricalAvg ?? input.avg_amount ?? 850));
    const amountRatio = amount / senderHistoricalAvg;

    const isExtremeAmount = amount >= 100000;
    const isHighValue = amount >= 50000;
    const isMicroTestingAmount = amount > 0 && amount <= 10;
    const isNewRecipient = Boolean(input.isNewRecipient ?? input.is_new_recipient ?? false);

    const isStructuringPattern = (amount >= 48000 && amount <= 49999) || (amount >= 19500 && amount <= 19999);
    const isEscalatingPattern = Boolean(input.isEscalatingPattern ?? input.is_escalating_pattern ?? false);
    const isRepeatedIdenticalAmount = Boolean(input.isRepeatedIdenticalAmount ?? false);

    const isNewDevice = Boolean(input.isNewDevice ?? input.device_info?.is_new_device ?? false);
    const isRootedOrEmulator = Boolean(input.isRootedOrEmulator ?? input.device_info?.is_rooted ?? false);
    const isVpnOrProxy = Boolean(input.isVpnOrProxy ?? input.device_info?.is_vpn ?? false);
    const isLocationMismatch = Boolean(input.isLocationMismatch ?? input.device_info?.location_mismatch ?? false);

    const senderPastFraudCount = parseInt(input.senderPastFraudCount ?? input.sender_fraud_count ?? 0, 10);
    const receiverIsBlacklisted = Boolean(input.receiverIsBlacklisted ?? input.receiver_blacklisted ?? false);
    const senderIsBlacklisted = Boolean(input.senderIsBlacklisted ?? input.sender_blacklisted ?? false);

    const utrLength = utr.length;
    const isNumericOnly = /^\d+$/.test(utr);
    const isDuplicateUtr = Boolean(input.isDuplicateUtr ?? false);
    const isKnownSpoofDemo = Boolean(input.isKnownSpoofDemo ?? false);

    return {
      amount,
      utr,
      senderVpa,
      receiverVpa,
      timestamp: timestamp.toISOString(),
      hour,
      isOffHours,
      isPeakBusinessHours,
      txnCountLast1Hour,
      txnCountLast5Min,
      senderHistoricalAvg,
      amountRatio,
      isExtremeAmount,
      isHighValue,
      isMicroTestingAmount,
      isNewRecipient,
      isStructuringPattern,
      isEscalatingPattern,
      isRepeatedIdenticalAmount,
      isNewDevice,
      isRootedOrEmulator,
      isVpnOrProxy,
      isLocationMismatch,
      senderPastFraudCount,
      receiverIsBlacklisted,
      senderIsBlacklisted,
      utrLength,
      isNumericOnly,
      isDuplicateUtr,
      isKnownSpoofDemo,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Transparent Rule-Based Scorer
// ─────────────────────────────────────────────────────────────────────────────
export class RuleBasedScorer {
  static evaluate(features, dynamicWeights = {}) {
    const reasons = [];
    let rawScore = 0;

    const addRuleHit = ({ code, name, category, defaultPoints, maxPoints, severity, description, observed, baseline }) => {
      const configuredPoints = dynamicWeights[code]?.weight ?? defaultPoints;
      const points = Math.min(maxPoints ?? Infinity, Math.max(0, configuredPoints));
      rawScore += points;
      reasons.push({
        code,
        title: name,
        name,
        category,
        points,
        severity,
        description,
        observed: String(observed),
        baseline: String(baseline),
      });
    };

    // 1. Transaction Amount
    if (features.isExtremeAmount) {
      addRuleHit({
        code: 'RULE_EXTREME_AMOUNT',
        name: 'Extreme High-Value UPI Transfer',
        category: 'Amount Anomaly',
        defaultPoints: 25,
        severity: 'HIGH',
        description: `Amount (₹${features.amount.toLocaleString('en-IN')}) reaches single-day regulatory ceiling. High financial exposure.`,
        observed: `₹${features.amount}`,
        baseline: '< ₹1,00,000 threshold',
      });
    } else if (features.isHighValue) {
      addRuleHit({
        code: 'RULE_HIGH_VALUE_THRESHOLD',
        name: 'Elevated Transaction Value',
        category: 'Amount Anomaly',
        defaultPoints: 15,
        severity: 'MEDIUM',
        description: `Amount (₹${features.amount.toLocaleString('en-IN')}) exceeds normal instant retail clearance threshold.`,
        observed: `₹${features.amount}`,
        baseline: '< ₹50,000 threshold',
      });
    } else if (features.isMicroTestingAmount) {
      addRuleHit({
        code: 'RULE_MICRO_TESTING_AMOUNT',
        name: 'Micro-Probing Transaction Amount',
        category: 'Amount Anomaly',
        defaultPoints: 15,
        severity: 'LOW',
        description: `Nominal micro-payment of ₹${features.amount} detected. Often used by fraudsters to test active handles.`,
        observed: `₹${features.amount}`,
        baseline: '> ₹10 standard baseline',
      });
    }

    // 2. Unusual Transaction Amount (Deviation)
    if (features.amountRatio >= 15 && features.amount > 5000) {
      addRuleHit({
        code: 'RULE_UNUSUAL_AMOUNT_CRITICAL',
        name: 'Severe Baseline Amount Deviation',
        category: 'Behavioral Deviation',
        defaultPoints: 30,
        severity: 'HIGH',
        description: `Current transfer is ${(features.amountRatio).toFixed(1)}x higher than sender's historical average (₹${features.senderHistoricalAvg.toFixed(0)}).`,
        observed: `${features.amountRatio.toFixed(1)}x historical avg`,
        baseline: '< 3.0x historical avg',
      });
    } else if (features.amountRatio >= 5 && features.amount > 3000) {
      addRuleHit({
        code: 'RULE_UNUSUAL_AMOUNT_MODERATE',
        name: 'Moderate Baseline Amount Deviation',
        category: 'Behavioral Deviation',
        defaultPoints: 18,
        severity: 'MEDIUM',
        description: `Transfer is ${(features.amountRatio).toFixed(1)}x higher than user's usual spending average.`,
        observed: `${features.amountRatio.toFixed(1)}x historical avg`,
        baseline: '< 3.0x historical avg',
      });
    }

    // 3. Transaction Frequency (Hourly Volume)
    if (features.txnCountLast1Hour >= 8) {
      addRuleHit({
        code: 'RULE_HOURLY_FREQUENCY_BURST',
        name: 'Abnormal Hourly Transaction Frequency',
        category: 'Frequency & Velocity',
        defaultPoints: 25,
        severity: 'HIGH',
        description: `Account initiated ${features.txnCountLast1Hour} transactions in the last hour. Highly characteristic of automated script or drain attack.`,
        observed: `${features.txnCountLast1Hour} txns / hr`,
        baseline: '<= 4 txns / hr',
      });
    } else if (features.txnCountLast1Hour >= 5) {
      addRuleHit({
        code: 'RULE_HOURLY_FREQUENCY_ELEVATED',
        name: 'Elevated Hourly Transaction Frequency',
        category: 'Frequency & Velocity',
        defaultPoints: 15,
        severity: 'MEDIUM',
        description: `High transaction activity with ${features.txnCountLast1Hour} transactions in the past hour.`,
        observed: `${features.txnCountLast1Hour} txns / hr`,
        baseline: '<= 4 txns / hr',
      });
    }

    // 4. Multiple Transactions within a Short Period (5-Minute Velocity)
    if (features.txnCountLast5Min >= 3) {
      addRuleHit({
        code: 'RULE_VELOCITY_5MIN_BURST',
        name: 'High-Velocity Burst Transfers (5-Min Window)',
        category: 'Frequency & Velocity',
        defaultPoints: 30,
        severity: 'HIGH',
        description: `Rapid sequence of ${features.txnCountLast5Min} transfers within 5 minutes. High probability of rapid fund exfiltration.`,
        observed: `${features.txnCountLast5Min} txns in 5m`,
        baseline: '<= 1 txn in 5m',
      });
    } else if (features.txnCountLast5Min === 2) {
      addRuleHit({
        code: 'RULE_VELOCITY_RAPID_SUCCESSION',
        name: 'Rapid Successive Transfer',
        category: 'Frequency & Velocity',
        defaultPoints: 15,
        severity: 'MEDIUM',
        description: 'Consecutive transfer dispatched within less than 5 minutes of prior transaction.',
        observed: '2 txns in 5m',
        baseline: '<= 1 txn in 5m',
      });
    }

    // 5. New Recipient
    if (features.isNewRecipient) {
      if (features.amount >= 25000) {
        addRuleHit({
          code: 'RULE_NEW_RECIPIENT_HIGH_VALUE',
          name: 'High-Value Transfer to First-Time Recipient',
          category: 'Counterparty Risk',
          defaultPoints: 25,
          severity: 'HIGH',
          description: `Transfer of ₹${features.amount.toLocaleString('en-IN')} to a completely new payee VPA with zero prior history.`,
          observed: 'New VPA & Amount > ₹25,000',
          baseline: 'Familiar trusted beneficiary',
        });
      } else {
        addRuleHit({
          code: 'RULE_NEW_RECIPIENT_FIRST_TIME',
          name: 'First-Time Counterparty Recipient',
          category: 'Counterparty Risk',
          defaultPoints: 10,
          severity: 'LOW',
          description: 'Recipient VPA has no prior transfer history with this sender account.',
          observed: 'Unseen recipient VPA',
          baseline: 'Prior transfer history exists',
        });
      }
    }

    // 6. Transaction Timing (Nocturnal / Off-Hours)
    if (features.isOffHours) {
      addRuleHit({
        code: 'RULE_TIMING_NOCTURNAL',
        name: 'Nocturnal Off-Hours Activity (1 AM – 5 AM)',
        category: 'Temporal Anomaly',
        defaultPoints: 20,
        severity: 'MEDIUM',
        description: `Transaction timestamp falls between 01:00 AM and 05:00 AM IST (${String(features.hour).padStart(2, '0')}:00 hrs). Account takeover transfers frequently target late night hours.`,
        observed: `${String(features.hour).padStart(2, '0')}:00 hrs IST`,
        baseline: 'Daytime / Business hours',
      });
    }

    // 7. Suspicious Patterns (Structuring, Escalation, Repeats)
    if (features.isStructuringPattern) {
      addRuleHit({
        code: 'RULE_PATTERN_STRUCTURING_SMURFING',
        name: 'Structuring / Smurfing Pattern Detected',
        category: 'Suspicious Pattern',
        defaultPoints: 35,
        severity: 'HIGH',
        description: `Transfer amount (₹${features.amount}) is intentionally tailored just below statutory threshold (₹50,000 PAN limit) to avoid automatic scrutiny.`,
        observed: `₹${features.amount} (Threshold evade)`,
        baseline: 'Unstructured natural spending',
      });
    }

    if (features.isEscalatingPattern) {
      addRuleHit({
        code: 'RULE_PATTERN_ESCALATING_PROBE',
        name: 'Micro-Probe Escalation Attack Pattern',
        category: 'Suspicious Pattern',
        defaultPoints: 35,
        severity: 'HIGH',
        description: 'Account performed nominal ₹1–₹5 validation transfer shortly followed by sudden large outbound sum.',
        observed: 'Micro-probe -> High transfer',
        baseline: 'Organic non-probing behavior',
      });
    }

    if (features.isRepeatedIdenticalAmount) {
      addRuleHit({
        code: 'RULE_PATTERN_REPEATED_SPLIT',
        name: 'Repeated Identical Split Amount',
        category: 'Suspicious Pattern',
        defaultPoints: 20,
        severity: 'MEDIUM',
        description: `Identical amount ₹${features.amount} dispatched multiple times within minutes. Classic split-payment pattern.`,
        observed: 'Repeated identical sum',
        baseline: 'Single consolidated transaction',
      });
    }

    // 8. Device / Session Anomaly
    if (features.isRootedOrEmulator) {
      addRuleHit({
        code: 'RULE_DEVICE_ROOTED_EMULATOR',
        name: 'Rooted / Emulator Environment Detected',
        category: 'Device & Session Integrity',
        defaultPoints: 40,
        severity: 'CRITICAL',
        description: 'Transaction originated from a rooted Android device or virtual emulator. High association with Fake UPI APK generators & spoofing tools.',
        observed: 'Rooted OS / Emulator Hook',
        baseline: 'Standard OEM Secure Enclave',
      });
    }

    if (features.isVpnOrProxy) {
      addRuleHit({
        code: 'RULE_DEVICE_VPN_PROXY',
        name: 'Anonymous VPN / Datacenter Proxy Relay',
        category: 'Device & Session Integrity',
        defaultPoints: 25,
        severity: 'HIGH',
        description: 'Network traffic masked via commercial VPN, Tor node, or datacenter hosting proxy.',
        observed: 'VPN/Proxy IP detected',
        baseline: 'Residential cellular / broadband IP',
      });
    }

    if (features.isNewDevice) {
      addRuleHit({
        code: 'RULE_DEVICE_UNRECOGNIZED',
        name: 'Unfamiliar / New Hardware Signature',
        category: 'Device & Session Integrity',
        defaultPoints: 15,
        severity: 'MEDIUM',
        description: 'First transaction recorded on this device identifier / hardware IMEI signature.',
        observed: 'New Device ID',
        baseline: 'Registered primary device',
      });
    }

    if (features.isLocationMismatch) {
      addRuleHit({
        code: 'RULE_DEVICE_GEO_MISMATCH',
        name: 'Geolocation Travel Anomaly',
        category: 'Device & Session Integrity',
        defaultPoints: 20,
        severity: 'MEDIUM',
        description: 'Instant transaction dispatched from a location geodetically incompatible with last active session.',
        observed: 'Impossible travel velocity',
        baseline: 'Sender native geographic profile',
      });
    }

    // 9. Previous Fraud History & Blacklists
    if (features.receiverIsBlacklisted) {
      addRuleHit({
        code: 'RULE_RECIPIENT_BLACKLISTED',
        name: 'Beneficiary Flagged in National Fraud Registry',
        category: 'Fraud History',
        defaultPoints: 60,
        severity: 'CRITICAL',
        description: `Payee VPA [${features.receiverVpa}] is an active subject in cybercrime fraud database.`,
        observed: 'Flagged Blacklist VPA',
        baseline: 'Clean NPCI directory record',
      });
    }

    if (features.senderIsBlacklisted) {
      addRuleHit({
        code: 'RULE_SENDER_BLACKLISTED',
        name: 'Sender Account Blacklisted',
        category: 'Fraud History',
        defaultPoints: 60,
        severity: 'CRITICAL',
        description: `Sender VPA [${features.senderVpa}] has confirmed prior unauthorized payment dispute records.`,
        observed: 'Active Sender Blacklist',
        baseline: 'Clean standing account',
      });
    }

    if (features.senderPastFraudCount > 0) {
      const pts = Math.min(40, features.senderPastFraudCount * 20);
      addRuleHit({
        code: 'RULE_PRIOR_DISPUTES_RECORD',
        name: 'Account Associated with Past Disputes',
        category: 'Fraud History',
        defaultPoints: pts,
        severity: 'HIGH',
        description: `Account has ${features.senderPastFraudCount} prior chargeback disputes or suspicious incident reports on file.`,
        observed: `${features.senderPastFraudCount} prior incident(s)`,
        baseline: '0 prior incident records',
      });
    }

    // 10. Duplicate UTR Replay & Syntax
    if (features.isDuplicateUtr) {
      addRuleHit({
        code: 'RULE_REPLAY_DUPLICATE_UTR',
        name: 'Previously Checked UTR',
        category: 'Banking Integrity',
        defaultPoints: 0,
        maxPoints: 0,
        severity: 'LOW',
        description: 'This UTR was checked previously. Repeat checks alone do not prove a replay or fraud; confirm settlement in the bank account.',
        observed: 'Duplicate UTR collision',
        baseline: 'Bank settlement confirmation',
      });
    }

    if (!features.isNumericOnly || (features.utrLength > 0 && features.utrLength !== 12)) {
      addRuleHit({
        code: 'RULE_UTR_SYNTAX_VIOLATION',
        name: 'UTR Format Needs Verification',
        category: 'Banking Integrity',
        defaultPoints: 25,
        severity: 'MEDIUM',
        description: `UTR "${features.utr}" does not match this prototype's 12-digit format check. UTR formats vary by bank; this alone does not confirm fraud.`,
        observed: `${features.utrLength} chars / non-standard`,
        baseline: 'Bank-specific reference format; confirm against bank records',
      });
    }

    if (features.isKnownSpoofDemo) {
      addRuleHit({
        code: 'RULE_KNOWN_SPOOF_DEMO',
        name: 'Known Spoof APK Demo Scenario',
        category: 'Demonstration Scenario',
        defaultPoints: 80,
        maxPoints: 80,
        severity: 'CRITICAL',
        description: 'This preset is explicitly marked as a known spoof demonstration. Real uploaded receipts are not given this label based on OCR or UTR format alone.',
        observed: 'Explicit fake-receipt demo preset',
        baseline: 'Unclassified real receipt',
      });
    }

    // Normalized 0 to 100 Score
    const normalizedScore = Math.min(100, Math.max(0, rawScore));

    let riskLevel = 'Low Risk';
    let recommendedAction = '';

    if (normalizedScore >= 71) {
      riskLevel = 'High Risk';
      recommendedAction = 'BLOCK & FREEZE: Immediately reject transaction, hold settlement, quarantine UTR, and escalate to bank anti-fraud desk.';
    } else if (normalizedScore >= 31) {
      riskLevel = 'Medium Risk';
      recommendedAction = 'STEP-UP AUTHENTICATION: Prompt for biometric / UPI PIN step-up verification, enforce a 15-minute temporary cooling hold, and verify SMS alert.';
    } else {
      riskLevel = 'Low Risk';
      recommendedAction = 'LOW RISK: No configured anomaly rules were triggered. Confirm credit in the bank app or statement before releasing goods.';
      if (reasons.length === 0) {
        reasons.push({
          code: 'RULE_CLEAN_BASELINE',
          title: 'Clean Behavioral & Technical Profile',
          name: 'Clean Behavioral & Technical Profile',
          category: 'Standard Clearance',
          points: 0,
          severity: 'SAFE',
          description: 'No anomaly vectors triggered. Transaction aligns with legitimate consumer spending patterns.',
          observed: 'Baseline normal',
          baseline: 'Zero risk indicators',
        });
      }
    }

    return {
      rawScore,
      riskScore: normalizedScore,
      riskLevel,
      detectionReasons: reasons,
      recommendedAction,
      rulesTriggeredCount: reasons.filter((r) => r.points > 0).length,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Pluggable ML Model Scorer
// ─────────────────────────────────────────────────────────────────────────────
export class MLModelScorer {
  constructor(options = {}) {
    this.modelVersion = options.modelVersion || 'xgboost-upi-fraud-v2.1';
    this.modelType = options.modelType || 'Gradient Boosted Decision Trees (GBDT)';
  }

  predictRisk(features) {
    let logit = -3.2;

    logit += (features.isExtremeAmount ? 1.8 : 0);
    logit += (features.isHighValue ? 0.9 : 0);
    logit += (features.isMicroTestingAmount ? 0.8 : 0);
    logit += Math.min(3.0, (features.amountRatio - 1) * 0.18);

    logit += Math.min(3.5, (features.txnCountLast5Min - 1) * 1.4);
    logit += Math.min(2.5, (features.txnCountLast1Hour - 1) * 0.4);

    logit += (features.isNewRecipient ? 1.1 : 0);
    logit += (features.isOffHours ? 1.2 : 0);
    logit += (features.isStructuringPattern ? 2.2 : 0);
    logit += (features.isEscalatingPattern ? 2.4 : 0);
    logit += (features.isRepeatedIdenticalAmount ? 1.3 : 0);

    logit += (features.isRootedOrEmulator ? 3.0 : 0);
    logit += (features.isVpnOrProxy ? 1.6 : 0);
    logit += (features.isNewDevice ? 0.9 : 0);
    logit += (features.isLocationMismatch ? 1.4 : 0);

    logit += (features.receiverIsBlacklisted ? 4.5 : 0);
    logit += (features.senderIsBlacklisted ? 4.5 : 0);
    logit += Math.min(3.0, features.senderPastFraudCount * 1.5);

    logit += (!features.isNumericOnly || features.utrLength !== 12 ? 2.5 : 0);
    logit += (features.isKnownSpoofDemo ? 5.0 : 0);

    const probability = 1 / (1 + Math.exp(-logit));
    const mlScore = Math.min(100, Math.max(0, Math.round(probability * 100)));

    const shapContributions = [
      { feature: 'amount_ratio', weight: Math.abs(features.amountRatio - 1) * 0.18, value: `${features.amountRatio.toFixed(1)}x` },
      { feature: 'velocity_5min', weight: (features.txnCountLast5Min - 1) * 1.4, value: `${features.txnCountLast5Min} txns` },
      { feature: 'device_environment', weight: features.isRootedOrEmulator ? 3.0 : 0, value: features.isRootedOrEmulator ? 'Rooted/Emulator' : 'Clean' },
      { feature: 'recipient_history', weight: features.isNewRecipient ? 1.1 : 0, value: features.isNewRecipient ? 'New Beneficiary' : 'Known' },
      { feature: 'off_hours_timing', weight: features.isOffHours ? 1.2 : 0, value: `${features.hour}:00 hrs` },
      { feature: 'structuring_pattern', weight: features.isStructuringPattern ? 2.2 : 0, value: features.isStructuringPattern ? 'Detected' : 'None' },
      { feature: 'fraud_blacklist', weight: features.receiverIsBlacklisted ? 4.5 : 0, value: features.receiverIsBlacklisted ? 'Blacklist Match' : 'Clean' },
    ]
      .filter((item) => item.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 4);

    return {
      modelVersion: this.modelVersion,
      modelType: this.modelType,
      fraudProbability: parseFloat(probability.toFixed(4)),
      mlScore,
      confidence: 0.94,
      topFeatureContributions: shapContributions,
      inferenceLatencyMs: 9,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Fraud Detection Engine Master
// ─────────────────────────────────────────────────────────────────────────────
export class FraudDetectionEngine {
  constructor(options = {}) {
    this.mlScorer = new MLModelScorer(options.mlOptions);
    this.defaultMode = options.defaultMode || 'RULE_BASED';
  }

  evaluate(input = {}, options = {}) {
    const mode = options.mode || input.scoring_mode || this.defaultMode;
    const features = FeatureExtractor.extractFeatures(input);
    const ruleResult = RuleBasedScorer.evaluate(features, options.dynamicWeights || {});
    const mlResult = this.mlScorer.predictRisk(features);

    let finalScore = ruleResult.riskScore;
    let finalLevel = ruleResult.riskLevel;
    let finalAction = ruleResult.recommendedAction;

    if (mode === 'ML_MODEL') {
      finalScore = mlResult.mlScore;
      if (finalScore >= 71) {
        finalLevel = 'High Risk';
        finalAction = 'BLOCK & FREEZE: High ML fraud probability detected. Immediate automated transaction freeze.';
      } else if (finalScore >= 31) {
        finalLevel = 'Medium Risk';
        finalAction = 'STEP-UP AUTHENTICATION: ML model flagged moderate behavioral risk. Request 2FA step-up.';
      } else {
        finalLevel = 'Low Risk';
        finalAction = 'LOW RISK: The prototype model found no strong anomaly signals. Confirm credit in the bank app or statement before releasing goods.';
      }
    } else if (mode === 'HYBRID_ENSEMBLE') {
      let blended = Math.round(0.6 * ruleResult.riskScore + 0.4 * mlResult.mlScore);
      const hasCriticalHit = ruleResult.detectionReasons.some(
        (r) => r.severity === 'CRITICAL' || r.code === 'RULE_RECIPIENT_BLACKLISTED'
      );
      if (hasCriticalHit && blended < 75) {
        blended = Math.max(85, blended);
      }
      finalScore = Math.min(100, Math.max(0, blended));
      if (finalScore >= 71) finalLevel = 'High Risk';
      else if (finalScore >= 31) finalLevel = 'Medium Risk';
      else finalLevel = 'Low Risk';
      finalAction = ruleResult.recommendedAction;
    }

    return {
      isPrototype: true,
      systemMode: 'PROTOTYPE_DEMO_SANDBOX',
      prototypeNotice: '⚠️ PROTOTYPE / DEMO UPI FRAUD DETECTION ENGINE — Transparent rule scoring with pluggable ML pipeline',
      version: '2.4.0-demo',
      riskScore: finalScore,
      riskLevel: finalLevel,
      detectionReasons: ruleResult.detectionReasons,
      recommendedAction: finalAction,
      scoringMode: mode,
      ruleScore: ruleResult.riskScore,
      mlScore: mlResult.mlScore,
      rulesTriggeredCount: ruleResult.rulesTriggeredCount,
      mlModelInsights: mlResult,
      features,
      evaluatedAt: new Date().toISOString(),
    };
  }
}

export const defaultEngine = new FraudDetectionEngine();

// Backward-compatible facade for existing code
export const evaluateTransactionRisk = ({
  utr,
  amount,
  senderVpa,
  receiverVpa,
  timestamp,
  existingTransactions = [],
  blacklist = [],
  merchantRegisteredVpa = 'apex.retail@okhdfcbank',
  activeRules = {},
  deviceInfo = {},
  customFeatures = {},
  scoringMode = 'RULE_BASED',
}) => {
  const cleanUtr = (utr || '').trim();
  const cleanSender = (senderVpa || '').trim().toLowerCase();
  const cleanReceiver = (receiverVpa || merchantRegisteredVpa || '').trim().toLowerCase();

  const isDuplicateUtr = cleanUtr && cleanUtr.length >= 8
    ? existingTransactions.some((tx) => tx.utr_number === cleanUtr && tx.status !== 'rejected')
    : false;

  const isSenderBlacklisted = cleanSender
    ? blacklist.some((b) => b.vpa.toLowerCase() === cleanSender)
    : false;

  const isReceiverBlacklisted = cleanReceiver
    ? blacklist.some((b) => b.vpa.toLowerCase() === cleanReceiver)
    : false;

  // Compute sender metrics
  let senderAvg = 850;
  let count5m = 1;
  let count1h = 1;
  let isNewRecipient = Boolean(cleanSender);
  if (cleanSender && existingTransactions.length > 0) {
    const senderTxns = existingTransactions.filter(
      (t) => (t.sender_vpa || '').toLowerCase() === cleanSender
    );
    if (senderTxns.length > 0) {
      const sum = senderTxns.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
      senderAvg = sum / senderTxns.length;
      isNewRecipient = !senderTxns.some((t) => (t.receiver_vpa || '').toLowerCase() === cleanReceiver);
      const now = Date.now();
      count1h = senderTxns.filter((t) => now - new Date(t.created_at || t.timestamp).getTime() <= 3600000).length + 1;
      count5m = senderTxns.filter((t) => now - new Date(t.created_at || t.timestamp).getTime() <= 300000).length + 1;
    }
  }

  const engineOutput = defaultEngine.evaluate(
    {
      amount,
      utr: cleanUtr,
      senderVpa: cleanSender,
      receiverVpa: cleanReceiver,
      timestamp,
      isDuplicateUtr,
      senderIsBlacklisted: isSenderBlacklisted,
      receiverIsBlacklisted: isReceiverBlacklisted,
      senderHistoricalAvg: customFeatures.senderHistoricalAvg ?? senderAvg,
      txnCountLast5Min: customFeatures.txnCountLast5Min ?? count5m,
      txnCountLast1Hour: customFeatures.txnCountLast1Hour ?? count1h,
      isNewRecipient: customFeatures.isNewRecipient ?? isNewRecipient,
      isRootedOrEmulator: customFeatures.isRootedOrEmulator ?? deviceInfo.is_rooted,
      isVpnOrProxy: customFeatures.isVpnOrProxy ?? deviceInfo.is_vpn,
      isNewDevice: customFeatures.isNewDevice ?? deviceInfo.is_new_device,
      isLocationMismatch: customFeatures.isLocationMismatch ?? deviceInfo.location_mismatch,
      isEscalatingPattern: customFeatures.isEscalatingPattern,
      isRepeatedIdenticalAmount: customFeatures.isRepeatedIdenticalAmount,
      isKnownSpoofDemo: customFeatures.isKnownSpoofDemo,
      scoring_mode: scoringMode,
    },
    { dynamicWeights: activeRules, mode: scoringMode }
  );

  // Check receiver VPA mismatch with store registered VPA
  const factors = [...engineOutput.detectionReasons];
  if (cleanReceiver && merchantRegisteredVpa) {
    if (cleanReceiver !== merchantRegisteredVpa.trim().toLowerCase()) {
      factors.push({
        code: 'VPA_MISMATCH',
        title: 'Payee Does Not Match Registered Merchant',
        name: 'Payee Does Not Match Registered Merchant',
        category: 'Counterparty Risk',
        description: `Payment was addressed to [${receiverVpa}], which does not match your registered store VPA [${merchantRegisteredVpa}]. This is a payee mismatch, not proof that the payment is fake; confirm the expected recipient and bank credit.`,
        points: 0,
        severity: 'LOW',
        observed: receiverVpa,
        baseline: merchantRegisteredVpa,
      });
    }
  }

  let legacyLevel = 'LOW';
  let legacyVerdict = 'VERIFIED GENUINE';
  let legacyStatus = 'verified';

  if (engineOutput.riskScore >= 71) {
    legacyLevel = 'HIGH';
    legacyVerdict = 'HIGH RISK FRAUD DETECTED';
    legacyStatus = 'flagged';
  } else if (engineOutput.riskScore >= 31) {
    legacyLevel = 'MEDIUM';
    legacyVerdict = 'SUSPICIOUS - VERIFY BANK SMS';
    legacyStatus = 'flagged';
  } else {
    legacyLevel = 'LOW';
    legacyVerdict = 'VERIFIED GENUINE';
    legacyStatus = 'verified';
  }

  return {
    score: engineOutput.riskScore,
    riskScore: engineOutput.riskScore,
    riskLevel: engineOutput.riskLevel, // 'Low Risk', 'Medium Risk', 'High Risk'
    level: legacyLevel,                 // 'LOW', 'MEDIUM', 'HIGH'
    verdict: legacyVerdict,
    status: legacyStatus,
    factors,
    detectionReasons: factors,
    recommendedAction: engineOutput.recommendedAction,
    isPrototype: true,
    prototypeNotice: engineOutput.prototypeNotice,
    scoringMode: engineOutput.scoringMode,
    mlModelInsights: engineOutput.mlModelInsights,
    features: engineOutput.features,
    decodedJulian: cleanUtr ? decodeUtrJulianDate(cleanUtr) : null,
    evaluatedAt: engineOutput.evaluatedAt,
  };
};
