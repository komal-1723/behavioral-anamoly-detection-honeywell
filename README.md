# AegisUEBA: AI-Powered Behavioral Anomaly Detection & Threat Intelligence Platform

AegisUEBA is an enterprise-grade User and Entity Behavior Analytics (UEBA) platform designed to detect compromised credentials, insider threats, privilege escalation, and zero-day intrusion patterns across enterprise networks, service accounts, and edge devices in real-time.

---

## Key Features & Architecture

### 1. Synthetic Telemetry Generator (HirePro Telemetry Schema)
- Generates realistic enterprise telemetry supporting scaling benchmarks: **100, 1,000, 10,000, and 100,000 records**.
- Includes complete field schema: `entity_id`, `entity_type`, `timestamp`, `source_ip`, `geo_location` (`country`, `city`, `lat`, `lon`), `department`, `role`, `device_id`, `device_type`, `device_fingerprint`, `operating_system`, `browser`, `auth_method`, `mfa_enabled`, `vpn_used`, `session_duration`, `login_status`, `resource_accessed`, `application`, `command_sequence`, `network_protocol`, `risk_features`, `label`.

### 2. Cyber Attack Simulation Suite (17 Cyber Threat Vectors)
Supports realistic live burst injection for:
1. **Credential Misuse**
2. **Brute Force**
3. **Impossible Travel** (Geo-velocity & distance violations)
4. **Password Spraying**
5. **Device Spoofing**
6. **Insider Threat** (Abnormal data exfiltration)
7. **Privilege Escalation** (`sudo su`, `chmod +s`, backdoor users)
8. **Session Hijacking**
9. **Abnormal Data Download**
10. **Lateral Movement** (RDP/SMB psexec movement)
11. **Impossible Login Time** (Off-hours access)
12. **Rare Country Login**
13. **TOR Exit Node Access**
14. **VPN Abuse**
15. **Concurrent Sessions**
16. **Suspicious API Usage** (Kubernetes pod exec)
17. **Multiple Failed Logins**

### 3. Multi-Model Machine Learning Engine
- **Baseline Behavior Profiler**: Builds per-entity statistical representations of habitual hours, top IPs, geographical origins, typical resources, and session durations.
- **Cold-Start Prior Handling**: Assigns role-based baseline priors for brand-new users/devices without historical logs.
- **Ensemble Anomaly Detection**: Combines **Isolation Forest**, **One-Class SVM**, **Local Outlier Factor (LOF)**, and **Statistical Z-Score / Geo-Velocity** models.
- **Top 1% Alert Budget Enforcer**: Uses quantile thresholding to maintain low false positive rates suitable for enterprise SOC analysts.
- **Concept Drift Detection**: Monitors feature distribution shifts using **Population Stability Index (PSI)** and **Kolmogorov-Smirnov (KS)** tests.

### 4. Explainable AI (XAI) & SOC Analyst Workflows
- **Feature Attribution Breakdown**: Percentage contribution weighting for each anomalous feature.
- **Natural Language Narratives**: Human-readable explanations of why an event was flagged.
- **Actionable Analyst Recommendations**: Contextual mitigation playbooks (e.g. "Isolate Endpoint", "Revoke JWT Token").
- **Ranked Incident Queue**: Alert triage states (`Open`, `Investigating`, `Mitigated`, `False Positive`).

---

## Directory Structure

```
behavioral_anomaly_detection/
├── backend/
│   ├── api/
│   │   ├── auth_router.py
│   │   ├── dashboard_router.py
│   │   ├── telemetry_router.py
│   │   ├── incidents_router.py
│   │   ├── ml_router.py
│   │   ├── simulation_router.py
│   │   ├── reports_router.py
│   │   └── stream_router.py
│   ├── engine/
│   │   ├── generator.py
│   │   └── attack_simulator.py
│   ├── ml/
│   │   ├── profiler.py
│   │   ├── anomaly_detector.py
│   │   ├── attack_classifier.py
│   │   ├── explainability.py
│   │   └── concept_drift.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── run_server.py
└── README.md
```

---

## Quick Start Guide

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- (Optional) Docker & Docker Compose

### 1. Running Backend locally
```bash
cd backend
pip install -r requirements.txt
python -m backend.main
# Or run from root: python run_server.py
```
FastAPI interactive docs will be available at `http://localhost:8000/docs`.

### 2. Running Frontend locally
```bash
cd frontend
npm install
npm run dev
```
The React UI will launch at `http://localhost:3000`.

### 3. Running via Docker Compose
```bash
docker compose up --build
```
Access the application at `http://localhost:3000`.

---

## Verification & Testing

1. **Synthetic Generation**: Navigate to `Synthetic Data Engine` and click **Generate & Process Dataset** (1,000 logs).
2. **Attack Simulation**: Navigate to `Cyber Attack Simulator`, choose **Impossible Travel**, and click **Launch Simulation**.
3. **Alert Queue & XAI**: Open `Incident Alert Queue`, click **XAI Drawer** to inspect feature attribution bar charts and natural language narratives.
4. **Export Reports**: Navigate to `Reports & Export` to download PDF executive summaries, CSV incident datasets, or JSON XAI feeds.
