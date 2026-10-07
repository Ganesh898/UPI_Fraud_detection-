# UPI Shield — System Architecture Specification

## 1. Architectural Overview

UPI Shield is a multi-layered fraud detection and verification system engineered to detect fake UPI payments, manipulated payment screenshots, forged UTR (Unique Transaction Reference) numbers, and replay attacks in real time.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER (Frontend)                      │
│                                                                             │
│  React 18 + Vite | Modular Cyber-Fintech UI | Canvas/SVG Gauges & Charts     │
│  ├─ Merchant POS View (Instant UTR Lookup, Screenshot OCR Scanner)         │
│  ├─ Interactive Risk Score Meter (Low / Medium / High Risk with factors)    │
│  ├─ Audio Chime & Siren Feedback (Real-time audible fraud alert)           │
│  ├─ Transaction Ledger & Dispute Manager                                   │
│  └─ Admin Command Center (Telemetry, Rule Configuration, Blacklist VPA)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST / JSON & Multipart
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY & SECURITY                           │
│                                                                             │
│  Express.js | CORS | Helmet Security Headers | JWT Authentication           │
│  ├─ Auth Controller (/api/auth)                                             │
│  ├─ Verification Controller (/api/verify)                                   │
│  ├─ Transaction Controller (/api/transactions)                              │
│  └─ Admin Controller (/api/admin)                                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Internal Pipelines
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CORE DETECTION & RISK SCORING ENGINE                   │
│                                                                             │
│  ├─ OCR Extraction Pipeline (Tesseract.js / Visual Layout Heuristics)        │
│  ├─ UTR Checksum & Julian Date Syntax Validator                            │
│  ├─ Cross-Merchant Duplicate / Replay Detector                              │
│  ├─ Time-Delta Anomaly Engine (Scan time vs Screenshot timestamp)           │
│  ├─ Blacklist & Spoof Fingerprint Matching                                  │
│  └─ Weighted Composite Risk Score Calculator (0 - 100)                      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Query / Write
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER (SQLite)                             │
│                                                                             │
│  Tables: users | transactions | fraud_rules | blacklist_vpas | audit_logs   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Multi-Vector Fraud Detection Heuristics

1. **UTR 12-Digit Syntax & Julian Date Logic**
   - Indian UPI UTRs follow a standardized format: `[Y][DDD][R][XXXXXXX]`
   - `Y`: Last digit of current year (e.g., 6 for 2026, 5 for 2025).
   - `DDD`: Julian day of year (001–366).
   - If the Julian day exceeds 366, is in the far future, or fails length checks, a penalty of **+30 Risk Points** is applied.

2. **Replay & Cross-Merchant Duplicate Detection**
   - In offline retail, fraudsters often show a single legitimate screenshot of a past payment to multiple vendors.
   - The database indexes all processed UTRs. If a UTR was already recorded, it is flagged as **Duplicate Replay Attack (+40 Risk Points)**.

3. **Screenshot OCR & Visual Artifact Inspection**
   - Parses Amount, UTR, Timestamp, Sender VPA, and Receiver VPA.
   - Cross-checks extracted Receiver VPA against the merchant's registered UPI ID.
   - Flags missing bank reference numbers or known fake generator layout quirks.

4. **Time Delta Discrepancy**
   - Calculates difference between transaction timestamp on the screen and the merchant verification timestamp.
   - If delta > 15 minutes without justification, flags temporal anomaly.

5. **Risk Classification Levels**
   - **0 - 29 (SAFE)**: Verified genuine. Positive chime triggered.
   - **30 - 69 (SUSPICIOUS)**: Warning alert. Advice merchant to await bank SMS.
   - **70 - 100 (HIGH RISK FRAUD)**: High-pitched alarm sound, red banner, auto-quarantine into Admin Flagged review queue.
