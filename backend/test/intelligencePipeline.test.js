const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const databasePath = path.join(os.tmpdir(), `upishield-intel-${randomUUID()}.sqlite`);
process.env.DB_PATH = databasePath;

const db = require('../src/config/database');
const { extractIndicators, extractUrl } = require('../src/services/intelligencePipeline');
const jobModel = require('../src/models/intelligenceJobModel');
const queue = require('../src/services/intelligenceQueue');

test('URL intake rejects non-http protocols and embedded credentials', () => {
  assert.throws(() => extractUrl('file:///etc/passwd'), { statusCode: 400 });
  assert.throws(() => extractUrl('https://user:secret@example.test'), { statusCode: 400 });
  assert.equal(extractUrl('https://example.test/path').hostname, 'example.test');
});

test('text pipeline extracts and de-duplicates network observables', () => {
  const result = extractIndicators(
    'text',
    'Urgent: verify your account at https://bit.ly/login. Pay merchant@upi from 192.0.2.1.'
  );
  const types = result.indicators.map((indicator) => indicator.type);
  assert.ok(types.includes('url'));
  assert.ok(types.includes('domain'));
  assert.ok(types.includes('vpa'));
  assert.ok(types.includes('ip'));
  assert.ok(result.riskScore >= 30);
  assert.equal(result.riskLevel, 'MEDIUM');
  assert.match(result.assessment, /No remote URL fetch/);
});

test('SQLite queue completes jobs and correlates shared observables', async (t) => {
  db.initSchema();
  const user = db.run(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    ['Intel Test', `intel-${randomUUID()}@example.test`, 'test-hash']
  );
  const first = jobModel.create({
    userId: Number(user.lastInsertRowid),
    sourceType: 'text',
    sourceValue: 'Report https://example.test/a and shared@upi',
  });
  const second = jobModel.create({
    userId: Number(user.lastInsertRowid),
    sourceType: 'text',
    sourceValue: 'Second report https://example.test/b and shared@upi',
  });

  await queue.processNext();
  await queue.processNext();

  const completedSecond = jobModel.findById(second.id, Number(user.lastInsertRowid));
  assert.equal(completedSecond.status, 'completed');
  assert.ok(completedSecond.result.indicators.length >= 3);
  assert.deepEqual(completedSecond.result.relatedJobIds, [first.id]);
  assert.equal(jobModel.findById(first.id, -1), null);
  assert.equal(jobModel.listByUser(Number(user.lastInsertRowid)).length, 2);

  t.after(() => {
    db.getInstance().close();
    for (const suffix of ['', '-shm', '-wal']) {
      const filePath = `${databasePath}${suffix}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });
});
