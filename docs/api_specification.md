# UPI Shield — API Specification

Base URL: `http://localhost:5000/api`

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new merchant or admin account.
- **Request Body**:
  ```json
  {
    "name": "Arjun Sharma",
    "email": "merchant@upishield.test",
    "password": "Password123!",
    "role": "merchant",
    "merchant_vpa": "arjunstore@upi",
    "business_name": "Sharma Electronics"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "Arjun Sharma",
      "email": "merchant@upishield.test",
      "role": "merchant",
      "merchant_vpa": "arjunstore@upi"
    }
  }
  ```

### `POST /auth/login`
Authenticates a user and issues a JWT token.
- **Request Body**:
  ```json
  {
    "email": "merchant@upishield.test",
    "password": "Password123!"
  }
  ```

### `GET /auth/me`
Fetches authenticated user profile and merchant settings (Requires Bearer Token).

---

## 2. Verification & Fraud Detection Endpoints

### `POST /verify/utr`
Verifies a transaction using raw UTR and metadata.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "utr_number": "609812345678",
    "amount": 2500,
    "sender_vpa": "customer@oksbi",
    "receiver_vpa": "arjunstore@upi"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "risk_score": 12,
    "risk_level": "LOW",
    "verdict": "VERIFIED_SAFE",
    "transaction_id": 42,
    "factors": {
      "utr_format_valid": true,
      "duplicate_detected": false,
      "julian_date_valid": true,
      "vpa_blacklisted": false,
      "velocity_normal": true
    },
    "simulation_note": "Simulated NPCI Clearance: Active sandbox response"
  }
  ```

### `POST /verify/screenshot`
Uploads a payment screenshot (Paytm / Google Pay / PhonePe) for OCR & heuristic analysis.
- **Headers**: `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`
- **Form Data**:
  - `screenshot`: File (JPG / PNG)
  - `receiver_vpa`: (Optional override)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "extracted_data": {
      "amount": 1500,
      "utr_number": "609812345678",
      "timestamp": "2026-10-07T15:30:00Z",
      "detected_app": "PhonePe"
    },
    "risk_score": 85,
    "risk_level": "HIGH",
    "verdict": "PROBABLE_FRAUD",
    "flags": [
      "Duplicate UTR: This transaction ID was already logged 2 hours ago",
      "Time Anomaly: Screenshot timestamp is 4 hours in the past"
    ]
  }
  ```

---

## 3. Transaction Management Endpoints

### `GET /transactions`
List merchant's transactions with filtering by risk level, date range, or search query.

### `PATCH /transactions/:id/status`
Update transaction status (`verified`, `flagged`, `rejected`, `disputed`).

---

## 4. Admin Endpoints

### `GET /admin/analytics`
System metrics: total verified volume, total fraud prevented, vector breakdown, 24h trends.

### `GET /admin/rules` & `PUT /admin/rules/:id`
Configure dynamic risk engine weights and thresholds.

### `GET /admin/blacklist` & `POST /admin/blacklist`
Manage blacklisted VPAs and fraudulent actors.
