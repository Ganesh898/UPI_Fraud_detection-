const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const databasePath = path.join(os.tmpdir(), `upishield-fraud-${randomUUID()}.sqlite`);
process.env.DB_PATH = databasePath;

const db = require('../src/config/database');
const fraudDetectionService = require('../src/services/fraudDetectionService');

test('PhonePe UTR and ₹1 amount are not treated as standalone fraud signals', async (t) => {
  t.after(() => {
    db.getInstance().close();
    for (const suffix of ['', '-shm', '-wal']) {
      const filePath = `${databasePath}${suffix}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });

  db.initSchema();

  const evaluation = await fraudDetectionService.evaluateRisk({
    utr: '400005511557',
    amount: 1,
    customFeatures: { timestamp: '2026-10-08T12:00:00+05:30' },
  });

  assert.equal(evaluation.score, 0);
  assert.equal(evaluation.level, 'LOW');
  assert.equal(evaluation.status, 'verified');
  assert.equal(
    evaluation.factors.some((factor) =>
      ['RULE_MICRO_TESTING_AMOUNT', 'RULE_UTR_JULIAN_DAY_INVALID'].includes(factor.code)
    ),
    false
  );

  const mediumEvaluation = await fraudDetectionService.evaluateRisk({
    utr: '400005511557',
    amount: 1,
    customFeatures: {
      timestamp: '2026-10-08T12:00:00+05:30',
      txnCountLast5Min: 3,
      txnCountLast1Hour: 5,
    },
  });
  assert.equal(mediumEvaluation.level, 'MEDIUM');
  assert.equal(mediumEvaluation.status, 'review');

  const malformedUtr = await fraudDetectionService.evaluateRisk({
    utr: '12345',
    amount: 100,
    customFeatures: { timestamp: '2026-10-08T12:00:00+05:30' },
  });
  assert.equal(malformedUtr.level, 'MEDIUM');
  assert.equal(malformedUtr.status, 'review');
  assert.ok(malformedUtr.factors.some((factor) => factor.code === 'RULE_UTR_SYNTAX_VIOLATION'));

  const oldReceipt = await fraudDetectionService.evaluateRisk({
    utr: '400005511557',
    amount: 1,
    receiptDate: '2020-01-01',
    customFeatures: { timestamp: '2026-10-08T12:00:00+05:30' },
  });
  assert.equal(oldReceipt.level, 'MEDIUM');
  assert.equal(oldReceipt.status, 'review');
  assert.ok(oldReceipt.factors.some((factor) => factor.code === 'RULE_RECEIPT_DATE_MISMATCH'));

  const existingMerchant = db.run(
    `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
    ['Existing Merchant', `existing-${randomUUID()}@example.test`, 'test-hash']
  );
  const otherMerchant = db.run(
    `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
    ['Other Merchant', `other-${randomUUID()}@example.test`, 'test-hash']
  );
  db.run(
    `INSERT INTO transactions (
      user_id, utr_number, amount, risk_score, risk_level, verdict, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [Number(existingMerchant.lastInsertRowid), '555555551234', 100, 0, 'LOW', 'LOW RISK', 'verified']
  );
  const reusedUtr = await fraudDetectionService.evaluateRisk({
    utr: '555555551234',
    amount: 100,
    userId: Number(otherMerchant.lastInsertRowid),
    customFeatures: { timestamp: '2026-10-08T12:00:00+05:30' },
  });
  assert.equal(reusedUtr.level, 'MEDIUM');
  assert.equal(reusedUtr.status, 'review');
  assert.ok(reusedUtr.factors.some((factor) => factor.code === 'RULE_CROSS_MERCHANT_UTR_REUSE'));
});
