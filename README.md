# 🛡️ UPI Shield — Fake UPI Payment Fraud Detection & Prevention

> **College Hackathon Project Prototype**  
> An intelligent cyber-fintech defense platform that detects and prevents fraudulent UPI payment scams in real-time.

---

## 🌟 The Problem
Offline shopkeepers and merchants lose millions every year to sophisticated UPI scams:
1. **Fake UPI Payment Apps (Spoof APKs):** Apps mimicking PhonePe, Paytm, or Google Pay generating deceptive "Payment Successful" screens.
2. **Replayed & Recycled UTR Numbers:** Presenting an old genuine screenshot to different vendors or during rush hours.
3. **Forged UTR Numbers:** Altered 12-digit reference numbers that fail bank clearing syntax.
4. **Mismatched / Tampered VPAs:** Displaying altered beneficiary IDs to convince merchants money was sent.

---

## 💡 The Solution: UPI Shield
UPI Shield provides a proactive POS verification desk and admin fraud center:
- **Instant UTR Syntax & Julian Date Verification:** Cryptographic and structural verification of standard 12-digit Indian banking reference standards.
- **Smart Screenshot Inspector (OCR):** Extracts Amount, UTR, Timestamp, and Beneficiary VPA from uploaded payment receipts with visual anomaly heuristics.
- **Cross-Merchant Duplicate Tracker:** Prevents replay attacks by detecting if a UTR was previously redeemed.
- **Composite Risk Scoring Engine (0–100):** Real-time weighted evaluation with instant Low / Medium / High Risk categorization.
- **Auditory Chime & Siren Feedback:** Immediate sound alerts for busy store environments (verified chime vs fraud siren).
- **Admin Command & Rules Engine:** Live analytics, dynamic threshold tuning, flagged transaction quarantine, and VPA blacklisting.

---

## 🏗️ Project Architecture

```
UPI-Fraud-Detection/
│
├── frontend/             # React 18 + Vite Cyber-Fintech Client
│   ├── src/
│   │   ├── components/   # Risk Meter, Audio alerts, Quick Verify, OCR Preview
│   │   ├── pages/        # Dashboard, Verify, Transactions, Analytics, Admin, Profile
│   │   ├── layouts/      # MainLayout, Sidebar, Navbar, Sandbox Banner
│   │   ├── services/     # API integration & Auth services
│   │   ├── hooks/        # Sound effects, auth state, transaction polling
│   │   └── assets/       # Badges, icons, sound chimes
│   └── package.json
│
├── backend/              # Node.js + Express REST API Gateway
│   ├── src/
│   │   ├── controllers/  # Auth, Verification, Transactions, Admin
│   │   ├── routes/       # Clean decoupled REST endpoints
│   │   ├── models/       # SQLite schema & query helpers
│   │   ├── services/     # Rule Engine, OCR Service, Risk Scorer
│   │   ├── middleware/   # JWT Auth, Multer file upload, Rate limiter
│   │   └── utils/        # Julian date encoder, UTR validator, seed helpers
│   └── package.json
│
├── database/             # SQLite database file & seed fixtures
├── docs/                 # System Architecture, API Specs & Hackathon Demo Guide
├── .env.example          # Environment variables template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v20+ LTS recommended)
- npm or yarn

### 1. Setup Backend
```bash
cd backend
npm install
npm run seed     # Pre-populates database with demo users, rules, and test transactions
npm run dev      # Starts server on http://localhost:5000
```

### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev      # Starts client on http://localhost:5173
```

### 3. Demo Credentials
| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Merchant** | `merchant@upishield.test` | `Password123!` | Test POS verification, upload screenshots, inspect risk scores |
| **Admin** | `admin@upishield.test` | `Password123!` | Configure fraud rule weights, review flagged queue, view system analytics |

---

## ⚠️ Hackathon Prototype Disclaimer
This application operates in a **Simulated Sandbox Mode**. Because direct NPCI (National Payments Corporation of India) and Bank core switch APIs require official Payment Aggregator / Bank PSP licensing and regulatory clearance, bank clearing responses are realistically simulated. **However, all OCR processing, UTR Julian date validation, duplicate checking, and the composite risk scoring engine are fully operational and live.**
