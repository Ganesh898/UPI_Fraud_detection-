/**
 * Feature Extractor for UPI Fraud Detection Engine
 * Normalizes raw transaction inputs, database history, and session context into a rich feature vector.
 */

class FeatureExtractor {
  /**
   * Extracts and normalizes features from raw input and historical context
   * @param {Object} input
   * @returns {Object} normalizedFeatureVector
   */
  static extractFeatures(input = {}) {
    const amount = Math.max(0, parseFloat(input.amount) || 0);
    const utr = (input.utr || input.utr_number || '').trim();
    const senderVpa = (input.senderVpa || input.sender_vpa || '').trim().toLowerCase();
    const receiverVpa = (input.receiverVpa || input.receiver_vpa || '').trim().toLowerCase();
    const timestamp = input.timestamp ? new Date(input.timestamp) : new Date();

    // 1. Timing features
    const hour = timestamp.getHours();
    const isOffHours = hour >= 1 && hour <= 5; // 01:00 AM - 05:00 AM off-peak nocturnal hours
    const isPeakBusinessHours = hour >= 9 && hour <= 21;

    // 2. Frequency & Velocity metrics (can be passed in or calculated from history)
    const txnCountLast1Hour = parseInt(input.txnCountLast1Hour ?? input.txns_last_hour ?? 1, 10);
    const txnCountLast5Min = parseInt(input.txnCountLast5Min ?? input.txns_last_5min ?? 1, 10);
    const secondsSinceLastTxn = parseInt(input.secondsSinceLastTxn ?? 1800, 10);

    // 3. Amount & Historical comparison
    const senderHistoricalAvg = Math.max(1, parseFloat(input.senderHistoricalAvg ?? input.avg_amount ?? 850));
    const amountRatio = amount / senderHistoricalAvg; // e.g., 10x or 30x historical average
    const isExtremeAmount = amount >= 100000;
    const isHighValue = amount >= 50000;
    const isMicroTestingAmount = amount > 0 && amount <= 10; // Potential ₹1 or ₹5 card/UPI validation test

    // 4. Counterparty & Recipient status
    const isNewRecipient = Boolean(input.isNewRecipient ?? input.is_new_recipient ?? false);

    // 5. Behavioral pattern indicators
    // Structuring / Smurfing: Transfers just beneath ₹50,000 regulatory/PAN compliance limit
    const isStructuringPattern = (amount >= 48000 && amount <= 49999) || (amount >= 19500 && amount <= 19999);
    const isEscalatingPattern = Boolean(input.isEscalatingPattern ?? input.is_escalating_pattern ?? false);
    const isRepeatedIdenticalAmount = Boolean(input.isRepeatedIdenticalAmount ?? false);

    // 6. Device & Session anomalies
    const isNewDevice = Boolean(input.isNewDevice ?? input.device_info?.is_new_device ?? false);
    const isRootedOrEmulator = Boolean(input.isRootedOrEmulator ?? input.device_info?.is_rooted ?? false);
    const isVpnOrProxy = Boolean(input.isVpnOrProxy ?? input.device_info?.is_vpn ?? false);
    const isLocationMismatch = Boolean(input.isLocationMismatch ?? input.device_info?.location_mismatch ?? false);

    // 7. Fraud history flags
    const senderPastFraudCount = parseInt(input.senderPastFraudCount ?? input.sender_fraud_count ?? 0, 10);
    const receiverIsBlacklisted = Boolean(input.receiverIsBlacklisted ?? input.receiver_blacklisted ?? false);
    const senderIsBlacklisted = Boolean(input.senderIsBlacklisted ?? input.sender_blacklisted ?? false);
    const disputeRatio = parseFloat(input.disputeRatio ?? 0); // e.g. 0.25 = 25% chargebacks

    // 8. UTR integrity & Julian syntax
    const utrLength = utr.length;
    const isNumericOnly = /^\d+$/.test(utr);
    const isDuplicateUtr = Boolean(input.isDuplicateUtr ?? false);

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
      secondsSinceLastTxn,
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
      disputeRatio,
      utrLength,
      isNumericOnly,
      isDuplicateUtr,
    };
  }
}

module.exports = FeatureExtractor;
