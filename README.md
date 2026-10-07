# 🛡️ UPI Shield — Fake UPI Payment Fraud Detection & Prevention

> **College Hackathon Project Prototype**  
> An intelligent cyber-fintech defense platform that detects and prevents fraudulent UPI payment scams in real-time.

---

## 🌟 The Problem
Offline shopkeepers and merchants lose millions every year to sophisticated UPI scams:
1. **Fake UPI Payment Apps (Spoof APKs):** Apps mimicking PhonePe, Paytm, or Google Pay generating deceptive "Payment Successful" screens.
2. **Replayed & Recycled UTR Numbers:** Presenting an old genuine screenshot to different vendors or during rush hours.
3. **Forged UTR Numbers:** Altered payment references without a corresponding bank credit.
4. **Mismatched / Tampered VPAs:** Displaying altered beneficiary IDs to convince merchants money was sent.

---

## 💡 The Solution: UPI Shield
UPI Shield provides a proactive POS verification desk and admin fraud center:
- **UTR Risk Context:** Reference formatting is shown as informational only; bank-specific formats are not treated as proof of fraud.
- **Smart Screenshot Inspector (OCR):** Extracts Amount, UTR, receipt date/time, and Beneficiary VPA. It warns when the receipt date is not today or cannot be read.
- **Replay Review:** A UTR recorded at another merchant or a receipt dated before today is sent for review. A repeat check by the same merchant is not treated as fraud.
- **Malformed UTR Review:** References outside the prototype's common numeric length are sent for review, not declared fake.
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
| **Merchant** | `merchant@upishield.demo` | `Demo@2026` | Test POS verification, upload screenshots, inspect risk scores |
| **Admin** | `admin@upishield.demo` | `Admin@2026` | Configure fraud rule weights, review flagged queue, view system analytics |

### Threat Intelligence Intake (MVP)

The authenticated `/api/intelligence` API accepts a URL or pasted text, queues it in SQLite, extracts URLs/domains, IPv4 addresses, UPI VPAs, and SHA-256 hashes, applies transparent heuristic triage, and stores observable-to-job links for correlation.

```http
POST /api/intelligence/submissions
Authorization: Bearer <token>
Content-Type: application/json

{"source_type":"text","source":"Urgent: verify your account at https://example.test/login or pay to merchant@upi"}
```

The API responds with HTTP `202` and a job ID. Poll `GET /api/intelligence/jobs/<job-id>` until `status` becomes `completed` or `failed`; `GET /api/intelligence/jobs` lists the authenticated user's jobs. The worker uses a durable SQLite queue in this MVP, so no Redis service is required.

This first slice does not fetch submitted URLs, access CT logs or messaging feeds, inspect APKs, or send takedown requests. Scores are triage heuristics, not a finding that a source is malicious. URL fetching and those external integrations require separate, isolated adapters and analyst review.

---

## ⚠️ Hackathon Prototype Disclaimer
This application operates in a **Simulated Sandbox Mode**. Because direct NPCI (National Payments Corporation of India) and Bank core switch APIs require official Payment Aggregator / Bank PSP licensing and regulatory clearance, bank clearing responses are not verified by this prototype. OCR reads receipt text but cannot prove settlement. UTR formats vary by bank; format shape, a low transaction amount, and a repeated manual check are not proof of fraud. A syntactically plausible but invented UTR cannot be distinguished from a real one without a bank/PSP verification API. Medium-risk results are review items, not fraud findings. Confirm credit in the bank app or statement before releasing goods.
