const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const env = require('./env');

// Ensure database directory exists
const dbDir = path.dirname(env.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(env.DB_PATH);
    // Enable WAL mode for high concurrency
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

function initSchema() {
  const db = getDatabase();
  const schemaPath = path.resolve(__dirname, '..', '..', '..', 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
    migrateTransactionReviewStatus(db);
  } else {
    console.warn(`Schema file not found at ${schemaPath}, checking fallback path`);
  }
}

function migrateTransactionReviewStatus(database) {
  const table = database.prepare(
    "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'transactions'"
  ).get();
  if (!table || /\breview\b/i.test(table.sql)) return;

  database.exec('PRAGMA foreign_keys = OFF; BEGIN IMMEDIATE;');
  try {
    database.exec(`
      ALTER TABLE transactions RENAME TO transactions_before_review_status;
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
        status TEXT CHECK(status IN ('verified', 'review', 'flagged', 'rejected', 'disputed')) DEFAULT 'verified',
        screenshot_url TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      INSERT INTO transactions (
        id, user_id, utr_number, amount, sender_vpa, receiver_vpa, timestamp,
        verification_mode, risk_score, risk_level, verdict, risk_factors, status,
        screenshot_url, notes, created_at
      )
      SELECT
        id, user_id, utr_number, amount, sender_vpa, receiver_vpa, timestamp,
        verification_mode, risk_score, risk_level, verdict, risk_factors, status,
        screenshot_url, notes, created_at
      FROM transactions_before_review_status;
      DROP TABLE transactions_before_review_status;
      CREATE INDEX IF NOT EXISTS idx_transactions_utr ON transactions(utr_number);
      CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_risk ON transactions(risk_level);
      COMMIT;
    `);
  } catch (error) {
    database.exec('ROLLBACK;');
    throw error;
  } finally {
    database.exec('PRAGMA foreign_keys = ON;');
  }
}

// Database helper utilities
const db = {
  getInstance: getDatabase,
  initSchema,
  
  query: (sql, params = []) => {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.all(...params);
  },

  get: (sql, params = []) => {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.get(...params);
  },

  run: (sql, params = []) => {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.run(...params);
  },

  exec: (sql) => {
    const database = getDatabase();
    return database.exec(sql);
  },
};

module.exports = db;
