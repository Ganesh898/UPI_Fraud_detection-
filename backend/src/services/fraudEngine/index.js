const FeatureExtractor = require('./FeatureExtractor');
const RuleBasedScorer = require('./RuleBasedScorer');
const MLModelScorer = require('./MLModelScorer');
const FraudDetectionEngine = require('./FraudDetectionEngine');

const defaultEngine = new FraudDetectionEngine();

module.exports = {
  FeatureExtractor,
  RuleBasedScorer,
  MLModelScorer,
  FraudDetectionEngine,
  defaultEngine,
};
