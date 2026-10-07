# UPI Shield — Hackathon Demo Presentation Guide

This guide provides a structured 3-minute presentation flow for showcasing **UPI Shield** to hackathon judges.

---

## 🎯 3-Minute Demo Pitch & Flow

### Minute 1: The Problem & Live Simulation (The "Hook")
1. **Introduction**:
   - "Every day, small retail merchants face a critical threat: fake payment generator apps that mimic Paytm, PhonePe, and Google Pay with 100% visual fidelity."
   - "Shopkeepers glance at the customer's phone, see 'Payment Successful' in green, and hand over merchandise—only to discover later that no money ever reached their bank account."
2. **Open UPI Shield Dashboard**:
   - Point out the cyber-fintech dashboard, real-time risk gauges, and the prominent **Sandbox Indicator Banner** that clarifies simulated bank clearance while highlighting the active, live heuristic engine.

---

### Minute 2: Demonstration of Verification Engine (The "Core Tech")

#### Scenario A: The Authentic Transaction (Low Risk)
- Navigate to **Quick Verify**.
- Enter a valid UTR: `628109482914` (Valid Julian date, 12 digits, never seen before).
- Amount: `₹850`
- Click **Verify Transaction**.
- **Result**:
  - Score: `8 / 100` (SAFE — Verified Green).
  - Positive chime sounds.
  - Risk factor breakdown shows: Valid 12-digit UTR, Correct Julian date encoding, No duplicate found.

#### Scenario B: The Recycled / Replayed UTR (High Risk Fraud)
- Immediately re-enter the same UTR: `628109482914`.
- Click **Verify Transaction**.
- **Result**:
  - Score: `85 / 100` (HIGH RISK — Probable Replay Attack).
  - Fraud siren sounds.
  - Factor breakdown flags: *Duplicate UTR detected. This transaction was previously cleared 45 seconds ago.*

#### Scenario C: Screenshot OCR Analysis
- Go to **Screenshot Inspector**.
- Click the sample test button: **"Load Spoof APK Sample"** (or upload a receipt).
- The OCR pipeline parses the image text:
  - Extracted UTR: `1234567890` (Only 10 digits instead of standard 12).
  - Font Discrepancy: Detected non-standard typographic artifacts.
  - Time Discrepancy: Receipt generated 3 hours ago.
- **Result**:
  - Score: `95 / 100` (CRITICAL FRAUD ALERT).
  - Transaction automatically sent to the **Admin Quarantine Queue**.

---

### Minute 3: Merchant & Admin Command Center (The "Value Add")
1. **Transaction Ledger**:
   - Show how the merchant can review their full history, filter by risk level, and mark transactions as *Disputed* or *Quarantined*.
2. **Admin Command Center**:
   - Log in as `admin@upishield.demo` with password `Admin@2026`.
   - Show the **Fraud Rule Weight Configurator**: Demonstrate how bank compliance officers can dynamically increase the penalty weight for duplicate UTRs or adjust velocity thresholds in real time without restarting the backend.
   - Show **VPA Blacklist Management**: Add a persistent fraudulent UPI ID to the system-wide blacklist.
   - Merchant demo login: `merchant@upishield.demo` / `Demo@2026`.
3. **Closing Statement**:
   - "UPI Shield turns vulnerable retail counters into intelligent, fraud-resilient checkout terminals with zero hardware cost."
