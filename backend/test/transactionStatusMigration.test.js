const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const databasePath = path.join(os.tmpdir(), `upishield-review-${randomUUID()}.sqlite`);
process.env.DB_PATH = databasePath;

const db = require('../src/config/database');

test('schema migration preserves transactions and permits review status', (t) => {
  t.after(() => {
    db.getInstance().close();
    for (const suffix of ['', '-shm', '-wal']) {
      const filePath = `${databasePath}${suffix}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });

  const database = db.getInstance();
  database.exec(`
    CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT);
    CREATE TABLE transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      utr_number TEXT NOT NULL,
      amount REAL NOT NULL,
      sender_vpa TEXT,
      receiver_vpa TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      verification_mode TEXT CHECK(verification_mode IN ('manual', 'ocr_screenshot', 'qr_scanner')) DEFAULT 'manual',
      risk_score INTEGER NOT NULL,
      risk_level TEXT CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH')) NOT NULL,
      verdict TEXT NOT NULL,
      risk_factors TEXT,
      status TEXT CHECK(status IN ('verified', 'flagged', 'rejected', 'disputed')) DEFAULT 'verified',
      screenshot_url TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    INSERT INTO transactions (utr_number, amount, risk_score, risk_level, verdict, status)
    VALUES ('123456789012', 100, 0, 'LOW', 'LOW RISK', 'verified');
  `);

  db.initSchema();
  const saved = db.get('SELECT * FROM transactions WHERE utr_number = ?', ['123456789012']);
  assert.equal(saved.amount, 100);
  assert.equal(saved.status, 'verified');
  assert.doesNotThrow(() => db.run(
    `INSERT INTO transactions (utr_number, amount, risk_score, risk_level, verdict, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['987654321012', 100, 35, 'MEDIUM', 'SUSPICIOUS', 'review']
  ));
});
