const { randomUUID } = require('node:crypto');
const db = require('../config/database');

const parseJob = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    sourceType: row.source_type,
    status: row.status,
    riskScore: row.risk_score,
    riskLevel: row.risk_level,
    result: row.result_json ? JSON.parse(row.result_json) : null,
    error: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const intelligenceJobModel = {
  create: ({ userId, sourceType, sourceValue }) => {
    const id = randomUUID();
    db.run(
      `INSERT INTO intelligence_jobs (id, user_id, source_type, source_value, status)
       VALUES (?, ?, ?, ?, 'queued')`,
      [id, userId, sourceType, sourceValue]
    );
    return intelligenceJobModel.findById(id, userId);
  },

  findById: (id, userId) => {
    const row = db.get(
      'SELECT * FROM intelligence_jobs WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return parseJob(row);
  },

  listByUser: (userId, limit = 50) => db.query(
    `SELECT id, user_id, source_type, status, risk_score, risk_level, result_json, error_message, created_at, updated_at
     FROM intelligence_jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, Math.min(Math.max(Number(limit) || 50, 1), 100)]
  ).map(parseJob),

  claimNext: () => {
    const row = db.get(
      "SELECT id, user_id, source_type, source_value FROM intelligence_jobs WHERE status = 'queued' ORDER BY created_at, rowid LIMIT 1"
    );
    if (!row) return null;
    const claimed = db.run(
      "UPDATE intelligence_jobs SET status = 'processing', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'queued'",
      [row.id]
    );
    return claimed.changes === 1 ? row : null;
  },

  complete: ({ id, riskScore, riskLevel, result }) => db.run(
    `UPDATE intelligence_jobs
     SET status = 'completed', risk_score = ?, risk_level = ?, result_json = ?, error_message = NULL, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND status = 'processing'`,
    [riskScore, riskLevel, JSON.stringify(result), id]
  ),

  fail: (id, message) => db.run(
    `UPDATE intelligence_jobs
     SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND status = 'processing'`,
    [message, id]
  ),

  recoverProcessing: () => db.run(
    "UPDATE intelligence_jobs SET status = 'queued', updated_at = CURRENT_TIMESTAMP WHERE status = 'processing'"
  ),

  addObservables: (jobId, indicators) => {
    const database = db.getInstance();
    database.exec('BEGIN');
    try {
      for (const indicator of indicators) {
        db.run(
          `INSERT INTO intelligence_observables (observable_type, normalized_value, display_value)
           VALUES (?, ?, ?)
           ON CONFLICT(observable_type, normalized_value) DO NOTHING`,
          [indicator.type, indicator.normalizedValue, indicator.displayValue]
        );
        const observable = db.get(
          'SELECT id FROM intelligence_observables WHERE observable_type = ? AND normalized_value = ?',
          [indicator.type, indicator.normalizedValue]
        );
        db.run(
          `INSERT INTO intelligence_job_observables (job_id, observable_id, evidence)
           VALUES (?, ?, ?)
           ON CONFLICT(job_id, observable_id) DO UPDATE SET evidence = excluded.evidence`,
          [jobId, observable.id, JSON.stringify(indicator.evidence)]
        );
      }
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  },

  listRelatedJobs: (jobId, userId) => db.query(
    `SELECT DISTINCT related.job_id AS id
     FROM intelligence_job_observables current
     JOIN intelligence_job_observables related ON related.observable_id = current.observable_id
     JOIN intelligence_jobs job ON job.id = related.job_id
     WHERE current.job_id = ? AND related.job_id != ? AND job.user_id = ?
     ORDER BY related.job_id`,
    [jobId, jobId, userId]
  ).map((row) => row.id),
};

module.exports = intelligenceJobModel;
