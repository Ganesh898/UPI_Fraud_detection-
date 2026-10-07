-- UPI Shield Database Schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('merchant', 'admin')) NOT NULL DEFAULT 'merchant',
  merchant_vpa TEXT,
  business_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
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
  risk_factors TEXT, -- JSON string storing detailed check results
  status TEXT CHECK(status IN ('verified', 'flagged', 'rejected', 'disputed')) DEFAULT 'verified',
  screenshot_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS fraud_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_code TEXT UNIQUE NOT NULL,
  rule_name TEXT NOT NULL,
  description TEXT,
  weight INTEGER NOT NULL DEFAULT 20,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  threshold_value TEXT
);

CREATE TABLE IF NOT EXISTS blacklist_vpas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vpa TEXT UNIQUE NOT NULL,
  reason TEXT NOT NULL,
  reported_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast lookups & duplicate detection
CREATE INDEX IF NOT EXISTS idx_transactions_utr ON transactions(utr_number);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_risk ON transactions(risk_level);
CREATE INDEX IF NOT EXISTS idx_blacklist_vpa ON blacklist_vpas(vpa);
