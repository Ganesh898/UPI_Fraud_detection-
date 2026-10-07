/**
 * UPI Shield - Database Seed Script
 * Populates the database with realistic demo data for hackathon presentations.
 * Run: node src/utils/seedData.js
 *
 * Creates:
 *  - 2 demo users (merchant + admin)
 *  - 5 fraud detection rules
 *  - 5 blacklisted VPAs
 *  - 40 transactions (mix of genuine, suspicious, and fraudulent)
 */

const bcrypt = require('bcryptjs');
const path = require('path');

// Bootstrap environment
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const db = require('../config/database');
const { generateAuthenticUtr, decodeUtrJulianDate, getJulianDayOfYear } = require('./julianDecoder');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateFakeUtr() {
  // Deliberately invalid - wrong Julian day
  const yearDigit = new Date().getFullYear() % 10;
  const fakeDay = 400 + Math.floor(Math.random() * 50); // Out-of-bounds Julian day
  const seq = Math.floor(Math.random() * 9000000 + 1000000);
  return `${yearDigit}${fakeDay}${Math.floor(Math.random() * 9 + 1)}${seq}`;
}

function generateOldYearUtr() {
  // Past year digit - year mismatch
  const yearDigit = (new Date().getFullYear() - 2) % 10;
  const julian = String(getJulianDayOfYear()).padStart(3, '0');
  const seq = Math.floor(Math.random() * 9000000 + 1000000);
  return `${yearDigit}${julian}${Math.floor(Math.random() * 9 + 1)}${seq}`;
}

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seedUsers() {
  console.log('👤 Seeding users...');

  const salt = await bcrypt.genSalt(10);

  const users = [
    {
      name: 'Rajesh Kumar',
      email: 'merchant@upishield.demo',
      password: 'Demo@2026',
      role: 'merchant',
      merchant_vpa: 'rajesh.kirana@okhdfc',
      business_name: 'Kumar Kirana Store - Connaught Place',
    },
    {
      name: 'Priya Sharma',
      email: 'admin@upishield.demo',
      password: 'Admin@2026',
      role: 'admin',
      merchant_vpa: 'admin.shield@upi',
      business_name: 'UPI Shield Operations HQ',
    },
    {
      name: 'Suresh Patel',
      email: 'suresh@demo.in',
      password: 'Pass@1234',
      role: 'merchant',
      merchant_vpa: 'suresh.groceries@paytm',
      business_name: 'Patel Supermarket - Andheri West',
    },
  ];

  for (const u of users) {
    const existing = db.get('SELECT id FROM users WHERE email = ?', [u.email.toLowerCase()]);
    if (existing) {
      console.log(`  ⏩ Skipped existing user: ${u.email}`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, salt);
    db.run(
      `INSERT INTO users (name, email, password_hash, role, merchant_vpa, business_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [u.name, u.email.toLowerCase(), hash, u.role, u.merchant_vpa, u.business_name]
    );
    console.log(`  ✅ Created user: ${u.email} (${u.role})`);
  }
}

function seedFraudRules() {
  console.log('\n🔧 Seeding fraud detection rules...');

  const rules = [
    {
      rule_code: 'RULE_JULIAN_SYNTAX',
      rule_name: 'Julian Calendar UTR Syntax Validator',
      description: 'Validates that the UTR Julian day (digits 2-4) falls within 001-366 and matches current year encoding.',
      weight: 35,
      is_enabled: 1,
      threshold_value: '366',
    },
    {
      rule_code: 'RULE_REPLAY_DUP',
      rule_name: 'Cross-Merchant Replay Attack Detector',
      description: 'Flags UTR numbers that have already been redeemed at any merchant on the network. Prevents QR code screenshot reuse.',
      weight: 45,
      is_enabled: 1,
      threshold_value: null,
    },
    {
      rule_code: 'RULE_VPA_INTEGRITY',
      rule_name: 'Receiver Beneficiary VPA Matcher',
      description: "Verifies the payment's receiver VPA exactly matches the merchant's registered UPI handle.",
      weight: 30,
      is_enabled: 1,
      threshold_value: null,
    },
    {
      rule_code: 'RULE_BLACKLIST_CHECK',
      rule_name: 'National Fraud Registry Blacklist',
      description: 'Cross-references the sender VPA against the national cybercrime blacklist database maintained by UPI Shield.',
      weight: 50,
      is_enabled: 1,
      threshold_value: null,
    },
    {
      rule_code: 'RULE_TIME_DELTA',
      rule_name: 'Transaction Velocity Limiter',
      description: 'Detects abnormal transaction volume bursts from the same sender VPA within a short time window.',
      weight: 20,
      is_enabled: 1,
      threshold_value: '5',
    },
  ];

  for (const rule of rules) {
    const existing = db.get('SELECT id FROM fraud_rules WHERE rule_code = ?', [rule.rule_code]);
    if (existing) {
      console.log(`  ⏩ Skipped existing rule: ${rule.rule_code}`);
      continue;
    }
    db.run(
      `INSERT INTO fraud_rules (rule_code, rule_name, description, weight, is_enabled, threshold_value)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [rule.rule_code, rule.rule_name, rule.description, rule.weight, rule.is_enabled, rule.threshold_value]
    );
    console.log(`  ✅ Created rule: ${rule.rule_code}`);
  }
}

function seedBlacklist() {
  console.log('\n🚫 Seeding VPA blacklist...');

  const adminUser = db.get("SELECT id FROM users WHERE email = 'admin@upishield.demo'");
  const adminId = adminUser ? adminUser.id : null;

  const blacklist = [
    { vpa: 'scam.payments@ybl', reason: 'Reported 47 times for UPI QR code screenshot replay fraud across Delhi NCR merchants' },
    { vpa: 'freerecharge99@paytm', reason: 'Phishing VPA mimicking telecom recharge portal. Known fake APK distributor.' },
    { vpa: 'luckydraw.winner@okicici', reason: 'Lottery scam VPA. Collects advance payment under fraudulent prize notification scheme.' },
    { vpa: 'refund.neft@okhdfcbank', reason: 'Fake HDFC refund impersonation VPA. Confirmed banking fraud by cybercrime cell.' },
    { vpa: 'support.paytm@upi', reason: 'Impersonating Paytm customer support to obtain OTPs. CERT-IN advisory issued.' },
    { vpa: 'crypto.profit@ybl', reason: 'Cryptocurrency Ponzi scheme VPA. ED investigation initiated. Multiple victim complaints.' },
    { vpa: 'delivery.cod@icici', reason: 'Fake cash-on-delivery scam. Sends fake delivery updates and collects advance payment.' },
  ];

  for (const b of blacklist) {
    const existing = db.get('SELECT id FROM blacklist_vpas WHERE LOWER(vpa) = LOWER(?)', [b.vpa]);
    if (existing) {
      console.log(`  ⏩ Skipped existing VPA: ${b.vpa}`);
      continue;
    }
    db.run(
      'INSERT INTO blacklist_vpas (vpa, reason, reported_by) VALUES (?, ?, ?)',
      [b.vpa.toLowerCase(), b.reason, adminId]
    );
    console.log(`  ✅ Blacklisted: ${b.vpa}`);
  }
}

function seedTransactions() {
  console.log('\n💳 Seeding transactions...');

  const merchantUser = db.get("SELECT id FROM users WHERE email = 'merchant@upishield.demo'");
  const sureshUser = db.get("SELECT id FROM users WHERE email = 'suresh@demo.in'");
  const userId = merchantUser ? merchantUser.id : 1;
  const userId2 = sureshUser ? sureshUser.id : 1;

  const senderVpas = [
    'customer.1@okhdfcbank', 'ramesh.gupta@ybl', 'priya.jain@oksbi', 'ankit.sharma@okaxis',
    'ritu.mehta@paytm', 'sunil.verma@icici', 'meena.patel@upi', 'arjun.das@okhdfc',
    'kavita.rao@phonepe', 'deep.singh@ybl',
  ];

  const receiverVpa = 'rajesh.kirana@okhdfc';

  // ─── 25 LEGITIMATE Transactions ─────────────────────────────────────────────
  const legitimateTxns = [
    { amount: 150.00, days: 0, sender: senderVpas[0] },
    { amount: 2500.50, days: 0, sender: senderVpas[1] },
    { amount: 75.00, days: 1, sender: senderVpas[2] },
    { amount: 8999.00, days: 1, sender: senderVpas[3] },
    { amount: 345.75, days: 2, sender: senderVpas[4] },
    { amount: 12500.00, days: 2, sender: senderVpas[5] },
    { amount: 499.00, days: 3, sender: senderVpas[6] },
    { amount: 1799.00, days: 4, sender: senderVpas[7] },
    { amount: 50.00, days: 4, sender: senderVpas[8] },
    { amount: 22000.00, days: 5, sender: senderVpas[9] },
    { amount: 300.00, days: 6, sender: senderVpas[0] },
    { amount: 4500.00, days: 7, sender: senderVpas[1] },
    { amount: 850.00, days: 8, sender: senderVpas[2] },
    { amount: 1200.00, days: 9, sender: senderVpas[3] },
    { amount: 6750.00, days: 10, sender: senderVpas[4] },
    { amount: 990.00, days: 12, sender: senderVpas[5] },
    { amount: 450.00, days: 14, sender: senderVpas[6] },
    { amount: 3200.00, days: 15, sender: senderVpas[7] },
    { amount: 175.50, days: 16, sender: senderVpas[8] },
    { amount: 9800.00, days: 18, sender: senderVpas[9] },
    { amount: 550.00, days: 20, sender: senderVpas[0] },
    { amount: 1100.00, days: 22, sender: senderVpas[1] },
    { amount: 2800.00, days: 25, sender: senderVpas[2] },
    { amount: 650.00, days: 28, sender: senderVpas[3] },
    { amount: 14000.00, days: 30, sender: senderVpas[4] },
  ];

  let count = 0;
  for (const t of legitimateTxns) {
    const utr = generateAuthenticUtr();
    const riskFactors = JSON.stringify([
      { code: 'SYNTAX_VERIFIED', title: 'Standard 12-Digit Indian UPI UTR Verified', description: 'Valid Julian calendar settlement encoding and NPCI checksum.', points: 0, severity: 'SAFE' },
      { code: 'NO_REPLAY', title: 'Zero Replay Collisions Found', description: 'Fresh reference number never redeemed before.', points: 0, severity: 'SAFE' },
    ]);

    db.run(
      `INSERT INTO transactions (user_id, utr_number, amount, sender_vpa, receiver_vpa, verification_mode, risk_score, risk_level, verdict, risk_factors, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days', '-' || ? || ' hours'))`,
      [
        userId, utr, t.amount, t.sender, receiverVpa, 'manual',
        Math.floor(Math.random() * 15), 'LOW', 'VERIFIED GENUINE',
        riskFactors, 'verified',
        `Customer purchase - ${t.amount < 500 ? 'small' : t.amount < 5000 ? 'medium' : 'large'} ticket`,
        t.days, Math.floor(Math.random() * 20),
      ]
    );
    count++;
  }

  // ─── 8 SUSPICIOUS / MEDIUM-RISK Transactions ─────────────────────────────────
  const suspiciousTxns = [
    { amount: 5000.00, sender: senderVpas[5], utrFn: generateOldYearUtr, days: 1 },
    { amount: 15000.00, sender: senderVpas[6], utrFn: generateOldYearUtr, days: 3 },
    { amount: 2000.00, sender: 'anon.user123@upi', utrFn: generateAuthenticUtr, days: 5, wrongReceiver: true },
    { amount: 7500.00, sender: senderVpas[7], utrFn: generateOldYearUtr, days: 7 },
    { amount: 18000.00, sender: senderVpas[8], utrFn: generateAuthenticUtr, days: 10, wrongReceiver: true },
    { amount: 3200.00, sender: 'test.account99@paytm', utrFn: generateOldYearUtr, days: 12 },
    { amount: 9900.00, sender: senderVpas[9], utrFn: generateOldYearUtr, days: 15 },
    { amount: 4500.00, sender: 'suspicious.user@okaxis', utrFn: generateAuthenticUtr, days: 20, wrongReceiver: true },
  ];

  for (const t of suspiciousTxns) {
    const utr = t.utrFn();
    const riskFactors = JSON.stringify([
      { code: 'YEAR_MISMATCH', title: 'Year Digit Anomaly', description: 'UTR year digit does not match current banking year.', points: 25, severity: 'MEDIUM' },
    ]);
    const wrongVpa = t.wrongReceiver ? 'wrong.merchant@okhdfcbank' : receiverVpa;

    db.run(
      `INSERT INTO transactions (user_id, utr_number, amount, sender_vpa, receiver_vpa, verification_mode, risk_score, risk_level, verdict, risk_factors, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))`,
      [
        userId2, utr, t.amount, t.sender, wrongVpa, 'manual',
        30 + Math.floor(Math.random() * 35), 'MEDIUM', 'SUSPICIOUS - VERIFY BANK SMS',
        riskFactors, 'flagged',
        'Flagged for manual review by UPI Shield engine',
        t.days,
      ]
    );
    count++;
  }

  // ─── 7 HIGH-RISK / FRAUDULENT Transactions ────────────────────────────────────
  const fraudTxns = [
    { amount: 25000.00, sender: 'scam.payments@ybl', days: 0 },       // Blacklisted
    { amount: 50000.00, sender: 'freerecharge99@paytm', days: 1 },     // Blacklisted
    { amount: 8000.00, sender: 'fraud.upi.now@okicici', days: 2 },     // Fake UTR
    { amount: 12000.00, sender: 'scam.payments@ybl', days: 4 },        // Blacklisted
    { amount: 35000.00, sender: 'refund.neft@okhdfcbank', days: 6 },   // Blacklisted
    { amount: 15500.00, sender: 'phish.attack.2026@ybl', days: 8 },    // Fake UTR
    { amount: 42000.00, sender: 'luckydraw.winner@okicici', days: 12 }, // Blacklisted
  ];

  for (const t of fraudTxns) {
    const utr = generateFakeUtr();
    const riskFactors = JSON.stringify([
      { code: 'BLACKLISTED_SENDER', title: 'National Fraud Registry Blacklist Match', description: `Sender VPA [${t.sender}] is marked in cybercrime fraud database.`, points: 50, severity: 'CRITICAL' },
      { code: 'JULIAN_OUT_OF_BOUNDS', title: 'Julian Day Syntax Out-of-Bounds', description: 'Julian Day > 366. Fails Indian Banking clearing algorithm.', points: 35, severity: 'HIGH' },
    ]);

    db.run(
      `INSERT INTO transactions (user_id, utr_number, amount, sender_vpa, receiver_vpa, verification_mode, risk_score, risk_level, verdict, risk_factors, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))`,
      [
        userId, utr, t.amount, t.sender, receiverVpa, randomFromArray(['manual', 'ocr_screenshot']),
        70 + Math.floor(Math.random() * 30), 'HIGH', 'HIGH RISK FRAUD DETECTED',
        riskFactors, 'flagged',
        'AUTO-QUARANTINED: High risk fraud indicators detected by engine',
        t.days,
      ]
    );
    count++;
  }

  console.log(`  ✅ Created ${count} transactions (25 genuine, 8 suspicious, 7 fraudulent)`);
}

function seedAuditLogs() {
  console.log('\n📋 Seeding audit logs...');

  const adminUser = db.get("SELECT id FROM users WHERE email = 'admin@upishield.demo'");
  const merchantUser = db.get("SELECT id FROM users WHERE email = 'merchant@upishield.demo'");
  const adminId = adminUser ? adminUser.id : null;
  const merchantId = merchantUser ? merchantUser.id : null;

  const logs = [
    { userId: adminId, action: 'SYSTEM_INIT', details: 'UPI Shield v2.0 database schema initialized. WAL journal mode enabled.', ip: '127.0.0.1', daysAgo: 30 },
    { userId: adminId, action: 'RULE_WEIGHT_CHANGE', details: 'Updated RULE_REPLAY_DUP weight from 40 to 45 — increased sensitivity to replay attacks.', ip: '10.0.0.1', daysAgo: 25 },
    { userId: adminId, action: 'BLACKLIST_ADD', details: 'Added VPA [scam.payments@ybl] to blacklist: mass fraud report from Delhi merchants.', ip: '10.0.0.1', daysAgo: 20 },
    { userId: merchantId, action: 'USER_REGISTER', details: 'Registered merchant terminal [merchant@upishield.demo]', ip: '192.168.1.12', daysAgo: 15 },
    { userId: adminId, action: 'BLACKLIST_ADD', details: 'Added VPA [freerecharge99@paytm] to blacklist: phishing VPA mimicking telecom recharge portal.', ip: '10.0.0.1', daysAgo: 10 },
    { userId: merchantId, action: 'FRAUD_FLAGGED', details: 'Flagged fraudulent transaction UTR [6421893214] (Score: 85)', ip: '192.168.1.12', daysAgo: 4 },
    { userId: adminId, action: 'CONFIRM_FRAUD_BLACKLIST', details: 'Confirmed fraud on #12 (UTR: 6421893214) and blacklisted [refund.neft@okhdfcbank]', ip: '10.0.0.1', daysAgo: 3 },
    { userId: merchantId, action: 'USER_LOGIN', details: 'User logged in [merchant@upishield.demo]', ip: '192.168.1.12', daysAgo: 1 },
    { userId: adminId, action: 'USER_LOGIN', details: 'User logged in [admin@upishield.demo]', ip: '10.0.0.1', daysAgo: 0 },
  ];

  for (const log of logs) {
    db.run(
      `INSERT INTO audit_logs (user_id, action, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, datetime('now', '-' || ? || ' days'))`,
      [log.userId, log.action, log.details, log.ip, log.daysAgo]
    );
  }

  console.log(`  ✅ Created ${logs.length} audit log entries`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   UPI Shield - Database Seeder                   ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Initialize schema first
    console.log('📦 Initializing database schema...');
    db.initSchema();
    console.log('✅ Schema ready\n');

    // Run all seed functions
    await seedUsers();
    seedFraudRules();
    seedBlacklist();
    seedTransactions();
    seedAuditLogs();

    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║   ✅  Seeding Complete!                          ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log('║  Demo Credentials:                               ║');
    console.log('║  Merchant: merchant@upishield.demo / Demo@2026   ║');
    console.log('║  Admin:    admin@upishield.demo   / Admin@2026   ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
