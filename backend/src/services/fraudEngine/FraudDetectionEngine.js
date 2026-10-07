/**
 * UPI Shield - Fraud Detection Engine (Master Orchestrator)
 *
 * Clearly labeled Prototype / Demo Fraud Detection System
 * Bridges transparent Rule-Based heuristics with a modular Machine Learning scoring layer.
 */

const FeatureExtractor = require('./FeatureExtractor');
const RuleBasedScorer = require('./RuleBasedScorer');
const MLModelScorer = require('./MLModelScorer');

class FraudDetectionEngine {
  constructor(options = {}) {
    this.mlScorer = new MLModelScorer(options.mlOptions);
    this.defaultMode = options.defaultMode || 'RULE_BASED'; // 'RULE_BASED' | 'ML_MODEL' | 'HYBRID_ENSEMBLE'
  }

  /**
   * Main evaluation entry point
   * @param {Object} input Raw transaction data & context
   * @param {Object} options Dynamic rule configurations, mode override
   */
  evaluate(input = {}, options = {}) {
    const mode = options.mode || input.scoring_mode || this.defaultMode;

    // 1. Extract standardized feature vector
    const features = FeatureExtractor.extractFeatures(input);

    // 2. Compute transparent rule-based score & reasons
    const ruleResult = RuleBasedScorer.evaluate(features, options.dynamicWeights || {});

    // 3. Compute modular ML prediction
    const mlResult = this.mlScorer.predictRisk(features);

    // 4. Resolve final risk score based on selected scoring mode
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
      // Hybrid Ensemble: 60% Rule-based weight + 40% ML model weight
      let blended = Math.round(0.6 * ruleResult.riskScore + 0.4 * mlResult.mlScore);

      // Hard safety guardrails (if critical compliance rule triggers, override to High Risk)
      const hasCriticalHit = ruleResult.detectionReasons.some(
        (r) => r.severity === 'CRITICAL' || r.code === 'RULE_RECIPIENT_BLACKLISTED'
      );
      if (hasCriticalHit && blended < 75) {
        blended = Math.max(85, blended);
      }

      finalScore = Math.min(100, Math.max(0, blended));

      if (finalScore >= 71) {
        finalLevel = 'High Risk';
        finalAction = ruleResult.recommendedAction;
      } else if (finalScore >= 31) {
        finalLevel = 'Medium Risk';
        finalAction = ruleResult.recommendedAction;
      } else {
        finalLevel = 'Low Risk';
        finalAction = ruleResult.recommendedAction;
      }
    }

    return {
      // Prototype & Demo Metadata
      isPrototype: true,
      systemMode: 'PROTOTYPE_DEMO_SANDBOX',
      prototypeNotice: '⚠️ PROTOTYPE / DEMO UPI FRAUD DETECTION ENGINE — Transparent rule scoring with pluggable ML pipeline',
      version: '2.4.0-demo',

      // Core Required Outputs
      riskScore: finalScore,
      riskLevel: finalLevel,
      detectionReasons: ruleResult.detectionReasons,
      recommendedAction: finalAction,

      // Scoring Breakdown & Architecture Visibility
      scoringMode: mode,
      ruleScore: ruleResult.riskScore,
      mlScore: mlResult.mlScore,
      rulesTriggeredCount: ruleResult.rulesTriggeredCount,

      // Pluggable ML Model Insights
      mlModelInsights: {
        modelVersion: mlResult.modelVersion,
        modelType: mlResult.modelType,
        fraudProbability: mlResult.fraudProbability,
        confidence: mlResult.confidence,
        topFeatureContributions: mlResult.topFeatureContributions,
        inferenceLatencyMs: mlResult.inferenceLatencyMs,
        readyForProductionModel: true,
      },

      // Extracted Feature Snapshot
      features,
      evaluatedAt: new Date().toISOString(),
    };
  }
}

module.exports = FraudDetectionEngine;
