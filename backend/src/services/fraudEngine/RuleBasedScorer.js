/**
 * Rule-Based Scorer for UPI Fraud Detection Engine
 * Evaluates transparent heuristic rules against extracted features.
 * Produces an exact 0-100 composite risk score with full audit reasons.
 */

class RuleBasedScorer {
  /**
   * Evaluates feature vector using transparent rules
   * @param {Object} features Normalized feature dictionary
   * @param {Object} dynamicWeights Optional rule weights configured from database
   * @returns {Object} { baseScore, normalizedScore, riskLevel, detectionReasons, recommendedAction }
   */
  static evaluate(features, dynamicWeights = {}) {
    const reasons = [];
    let rawScore = 0;

    // Helper to apply weighted points
    const addRuleHit = ({
      code,
      name,
      category,
      defaultPoints,
      maxPoints,
      severity,
      description,
      observed,
      baseline,
    }) => {
      const configuredPoints = dynamicWeights[code]?.weight ?? defaultPoints;
      const points = Math.min(maxPoints ?? Infinity, Math.max(0, configuredPoints));
      rawScore += points;
      reasons.push({
        code,
        name,
        category,
        points,
        severity,
        description,
        observed: String(observed),
        baseline: String(baseline),
      });
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. Transaction Amount Anomaly
    // ─────────────────────────────────────────────────────────────────────────────
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
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. Unusual Transaction Amount (Deviation from Sender's Baseline)
    // ─────────────────────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. Transaction Frequency (Hourly Volume)
    // ─────────────────────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. Multiple Transactions within a Short Period (5-Minute Velocity)
    // ─────────────────────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. New Recipient Anomaly
    // ─────────────────────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 6. Transaction Timing (Nocturnal / Off-Peak Hours)
    // ─────────────────────────────────────────────────────────────────────────────
    if (features.isOffHours) {
      addRuleHit({
        code: 'RULE_TIMING_NOCTURNAL',
        name: 'Nocturnal Off-Hours Activity (1 AM – 5 AM)',
        category: 'Temporal Anomaly',
        defaultPoints: 20,
        severity: 'MEDIUM',
        description: `Transaction timestamp falls between 01:00 AM and 05:00 AM IST (${String(features.hour).padStart(2, '0')}:00 hrs). Account takeover transfers frequently target late night hours.`,
        observed: `${String(features.hour).padStart(2, '0')}:00 hrs IST`,
        baseline: 'Daytime / Business hours (06:00 - 23:00)',
      });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 7. Suspicious Transaction Patterns
    // ─────────────────────────────────────────────────────────────────────────────
    if (features.isStructuringPattern) {
      addRuleHit({
        code: 'RULE_PATTERN_STRUCTURING_SMURFING',
        name: 'Structuring / Smurfing Pattern Detected',
        category: 'Suspicious Pattern',
        defaultPoints: 35,
        severity: 'HIGH',
        description: `Transfer amount (₹${features.amount}) is intentionally tailored just below statutory threshold (₹50,000 PAN reporting limit) to avoid automatic scrutiny.`,
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 8. Device / Session Anomaly
    // ─────────────────────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 9. Previous Fraud History & Blacklists
    // ─────────────────────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────────────────────
    // 10. UTR Replay & Structural Integrity (Core Banking Checks)
    // ─────────────────────────────────────────────────────────────────────────────
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

    if (features.isCrossMerchantDuplicateUtr) {
      addRuleHit({
        code: 'RULE_CROSS_MERCHANT_UTR_REUSE',
        name: 'UTR Previously Recorded at Another Merchant',
        category: 'Replay Review',
        defaultPoints: 45,
        maxPoints: 45,
        severity: 'MEDIUM',
        description: 'This UTR was recorded for another merchant account. A reused receipt is possible; verify the payment in your own bank account before releasing goods.',
        observed: 'Same UTR linked to a different merchant',
        baseline: 'Unique payment reference for this checkout',
      });
    }

    if (features.isReceiptDateMismatch) {
      addRuleHit({
        code: 'RULE_RECEIPT_DATE_MISMATCH',
        name: 'Receipt Is Not Dated Today',
        category: 'Receipt Freshness',
        defaultPoints: 40,
        maxPoints: 40,
        severity: 'MEDIUM',
        description: 'The receipt date differs from today. It may be an old receipt; verify the credit in your bank account before releasing goods.',
        observed: features.receiptDate || 'Receipt date differs from today',
        baseline: 'Today in India Standard Time',
      });
    }

    if (!features.isNumericOnly || features.utrLength < 8 || features.utrLength > 16) {
      addRuleHit({
        code: 'RULE_UTR_SYNTAX_VIOLATION',
        name: 'UTR Format Needs Verification',
        category: 'Banking Integrity',
        defaultPoints: 35,
        maxPoints: 35,
        severity: 'LOW',
        description: `Reference "${features.utr}" is outside the prototype's common 8-16 digit check. Bank reference formats vary; this needs verification and does not alone prove fraud.`,
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

    // ─────────────────────────────────────────────────────────────────────────────
    // Score Normalization & Risk Level Classification
    // ─────────────────────────────────────────────────────────────────────────────
    // Cap score strictly between 0 and 100
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

module.exports = RuleBasedScorer;
