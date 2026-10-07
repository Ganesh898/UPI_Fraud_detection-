const { decodeUtrJulianDate, getJulianDayOfYear } = require('../utils/julianDecoder');
const transactionModel = require('../models/transactionModel');
const blacklistModel = require('../models/blacklistModel');
const fraudRuleModel = require('../models/fraudRuleModel');
const { defaultEngine } = require('./fraudEngine');

/**
 * UPI Shield - Multi-Vector Composite Fraud Risk Scoring Service
 * Powered by Modular FraudDetectionEngine with Pluggable ML Scorer
 */
const fraudDetectionService = {
  /**
   * Evaluates comprehensive fraud risk for a UPI transaction
   */
  evaluateRisk: async ({
    utr,
    amount,
    userId = null,
    receiptDate = null,
    senderVpa = null,
    receiverVpa = null,
    merchantRegisteredVpa = 'apex.retail@okhdfcbank',
    deviceInfo = {},
    customFeatures = {},
    scoringMode = 'RULE_BASED', // 'RULE_BASED' | 'ML_MODEL' | 'HYBRID_ENSEMBLE'
  }) => {
    const cleanUtr = (utr || '').trim();
    const cleanSender = (senderVpa || '').trim().toLowerCase();
    const cleanReceiver = (receiverVpa || merchantRegisteredVpa || '').trim().toLowerCase();
    const numAmount = parseFloat(amount) || 0;

    // 1. Fetch dynamic rule overrides from database
    const rules = fraudRuleModel.findAll();
    const dynamicWeights = {};
    rules.forEach((r) => {
      dynamicWeights[r.rule_code] = {
        weight: r.weight,
        isEnabled: r.is_enabled === 1,
      };
    });

    // 2. Database lookups: Duplicate UTR replay check
    let isDuplicateUtr = false;
    if (cleanUtr && cleanUtr.length >= 8) {
      const existing = transactionModel.findByUtr(cleanUtr);
      isDuplicateUtr = existing.some((t) => t.status !== 'rejected');
    }
    const isCrossMerchantDuplicateUtr = userId
      ? transactionModel.findCrossMerchantByUtr(cleanUtr, userId).length > 0
      : false;

    const indiaToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    const isReceiptDateMismatch = Boolean(
      receiptDate && /^\d{4}-\d{2}-\d{2}$/.test(receiptDate) && receiptDate !== indiaToday
    );

    // 3. Database lookups: Blacklist check (Sender & Receiver)
    const senderBlacklistRow = cleanSender ? blacklistModel.findByVpa(cleanSender) : null;
    const receiverBlacklistRow = cleanReceiver ? blacklistModel.findByVpa(cleanReceiver) : null;

    // 4. Behavioral & Velocity context from database
    const metrics = transactionModel.getSenderMetrics(cleanSender, cleanReceiver);

    // 5. Julian date decoding
    const decodedJulian = cleanUtr ? decodeUtrJulianDate(cleanUtr) : null;

    // 6. Assemble rich feature input for FraudDetectionEngine
    const engineInput = {
      amount: numAmount,
      utr: cleanUtr,
      senderVpa: cleanSender,
      receiverVpa: cleanReceiver,
      timestamp: customFeatures.timestamp || new Date().toISOString(),

      // Velocity & Frequency
      txnCountLast1Hour: customFeatures.txnCountLast1Hour ?? metrics.count1h,
      txnCountLast5Min: customFeatures.txnCountLast5Min ?? metrics.count5m,
      senderHistoricalAvg: customFeatures.senderHistoricalAvg ?? metrics.avgAmount,
      isNewRecipient: customFeatures.isNewRecipient ?? metrics.isNewRecipient,

      // Behavioral patterns
      isEscalatingPattern: Boolean(customFeatures.isEscalatingPattern),
      isRepeatedIdenticalAmount: Boolean(customFeatures.isRepeatedIdenticalAmount),

      // Device & Session
      isNewDevice: Boolean(deviceInfo.is_new_device ?? customFeatures.isNewDevice),
      isRootedOrEmulator: Boolean(deviceInfo.is_rooted ?? customFeatures.isRootedOrEmulator),
      isVpnOrProxy: Boolean(deviceInfo.is_vpn ?? customFeatures.isVpnOrProxy),
      isLocationMismatch: Boolean(deviceInfo.location_mismatch ?? customFeatures.isLocationMismatch),

      // Blacklist & History
      receiverIsBlacklisted: Boolean(receiverBlacklistRow || customFeatures.receiverIsBlacklisted),
      senderIsBlacklisted: Boolean(senderBlacklistRow || customFeatures.senderIsBlacklisted),
      senderPastFraudCount: metrics.disputeCount + (customFeatures.senderPastFraudCount || 0),

      // Structural
      isDuplicateUtr,
      isCrossMerchantDuplicateUtr,
      isReceiptDateMismatch,
      receiptDate,
      isKnownSpoofDemo: Boolean(customFeatures.isKnownSpoofDemo),
      scoring_mode: scoringMode,
    };

    // 7. Execute Modular Fraud Detection Engine
    const engineOutput = defaultEngine.evaluate(engineInput, {
      dynamicWeights,
      mode: scoringMode,
    });

    // 8. Reconcile factors / detection reasons for backward compatibility
    const factors = engineOutput.detectionReasons.map((r) => ({
      code: r.code,
      title: r.name,
      description: r.description,
      points: r.points,
      severity: r.severity,
      category: r.category,
      observed: r.observed,
      baseline: r.baseline,
    }));

    // Check receiver VPA mismatch with store registered VPA
    let receiverVpaMismatch = false;
    if (cleanReceiver && merchantRegisteredVpa) {
      if (cleanReceiver !== merchantRegisteredVpa.trim().toLowerCase()) {
        receiverVpaMismatch = true;
        const vpaMismatchFactor = {
          code: 'VPA_MISMATCH',
          title: 'Payee Does Not Match Registered Merchant',
          description: `Receipt names payee [${receiverVpa}], not the registered merchant VPA [${merchantRegisteredVpa}]. This mismatch does not by itself prove the receipt is fake; confirm the expected payee and bank credit.`,
          points: 0,
          severity: 'LOW',
          category: 'Counterparty Risk',
          observed: receiverVpa,
          baseline: merchantRegisteredVpa,
        };
        factors.push(vpaMismatchFactor);
      }
    }

    // Determine status & legacy uppercase riskLevel
    let legacyRiskLevel = 'LOW';
    let legacyVerdict = 'LOW RISK - CONFIRM BANK CREDIT';
    let legacyStatus = 'verified';

    if (engineOutput.riskScore >= 71) {
      legacyRiskLevel = 'HIGH';
      legacyVerdict = 'HIGH RISK FRAUD DETECTED';
      legacyStatus = 'flagged';
    } else if (engineOutput.riskScore >= 31) {
      legacyRiskLevel = 'MEDIUM';
      legacyVerdict = engineOutput.detectionReasons.some((factor) => factor.code === 'RULE_RECEIPT_DATE_MISMATCH')
        ? 'OLD RECEIPT DATE - VERIFY BANK CREDIT'
        : engineOutput.detectionReasons.some((factor) => factor.code === 'RULE_CROSS_MERCHANT_UTR_REUSE')
          ? 'UTR USED AT ANOTHER MERCHANT - VERIFY BANK CREDIT'
          : receiverVpaMismatch
            ? 'PAYEE MISMATCH - VERIFY BANK CREDIT'
            : 'SUSPICIOUS - VERIFY BANK SMS';
      legacyStatus = 'review';
    } else {
      legacyRiskLevel = 'LOW';
      legacyVerdict = receiverVpaMismatch
        ? 'PAYEE MISMATCH - CONFIRM RECIPIENT'
        : 'LOW RISK - CONFIRM BANK CREDIT';
      legacyStatus = 'verified';
    }

    return {
      // Required Outputs:
      riskScore: engineOutput.riskScore,
      riskLevel: engineOutput.riskLevel, // e.g., 'High Risk'
      level: legacyRiskLevel,            // 'HIGH', 'MEDIUM', 'LOW' for legacy components
      detectionReasons: factors,
      recommendedAction: engineOutput.recommendedAction,

      // Legacy compatibility fields:
      score: engineOutput.riskScore,
      verdict: legacyVerdict,
      status: legacyStatus,
      factors,

      // Demo & Prototype Transparency:
      isPrototype: true,
      prototypeNotice: engineOutput.prototypeNotice,
      scoringMode: engineOutput.scoringMode,
      mlModelInsights: engineOutput.mlModelInsights,
      features: engineOutput.features,
      decodedJulian,
      evaluatedAt: engineOutput.evaluatedAt,
    };
  },
};

module.exports = fraudDetectionService;
