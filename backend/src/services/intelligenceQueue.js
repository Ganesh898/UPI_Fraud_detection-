const intelligenceJobModel = require('../models/intelligenceJobModel');
const { extractIndicators } = require('./intelligencePipeline');

class IntelligenceQueue {
  constructor() {
    this.timer = null;
    this.isProcessing = false;
  }

  start() {
    if (this.timer) return;
    intelligenceJobModel.recoverProcessing();
    this.timer = setInterval(() => {
      this.processNext().catch((error) => {
        console.error('[intelligence-queue] Worker iteration failed:', error);
      });
    }, 250);
    this.timer.unref();
  }

  async processNext() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    try {
      const job = intelligenceJobModel.claimNext();
      if (!job) return;
      try {
        const result = extractIndicators(job.source_type, job.source_value);
        intelligenceJobModel.addObservables(job.id, result.indicators);
        intelligenceJobModel.complete({
          id: job.id,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          result: {
            ...result,
            relatedJobIds: intelligenceJobModel.listRelatedJobs(job.id, job.user_id),
          },
        });
      } catch (error) {
        console.error(`[intelligence-queue] Job ${job.id} failed:`, error);
        intelligenceJobModel.fail(job.id, 'Analysis failed. Please resubmit the source.');
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

module.exports = new IntelligenceQueue();
