# ThreatShield AI

## Overview

**ThreatShield AI** is a premium‑grade, full‑stack AI‑powered cyber‑threat intelligence platform. It can:
- Detect phishing URLs
- Detect scam SMS messages
- Detect spam emails
- Calculate a threat risk score (0‑100) and severity level
- Provide a real‑time analytics dashboard
- Offer an AI chat assistant (placeholder implementation)
- Export PDF/CSV reports
- Expose browser‑extension ready APIs (`/predict/url`, `/predict/sms`, `/predict/email`)

The stack is:
- **Frontend:** React 18 + Vite + Tailwind CSS (cyber‑punk theme, glassmorphism, neon glow, Framer Motion, Recharts, Lucide Icons)
- **Backend:** FastAPI (Python) with JWT authentication, SQLAlchemy (SQLite for dev, PostgreSQL optional), and pre‑trained ML models (`*.pkl` files) loaded via `joblib`.
- **Deployment:** Backend containerised with Docker (ready for Render, Fly.io, Railway, etc.). Frontend static site can be deployed to Vercel.

---

## Repository Structure
```
ThreatShield AI/
├─ backend/               # FastAPI backend
│   ├─ app.py
│   ├─ requirements.txt
│   ├─ Dockerfile
│   ├─ models/            # .pkl model files (already placed)
│   ├─ routes/            # auth, prediction, analytics, reports
│   ├─ services/          # predictor service
│   ├─ utils/             # security, database helpers
│   └─ models/            # SQLAlchemy models (User, ScanLog)
│
├─ frontend/              # React + Vite UI
│   ├─ package.json
│   ├─ tailwind.config.js
│   ├─ vite.config.js
│   └─ src/
│       ├─ App.jsx
│       ├─ pages/        # Landing, Login, Signup, Dashboard, scanners, analytics
│       ├─ components/   # Card, Button, Sidebar, Gauge, Counter, ChatAssistant …
│       ├─ hooks/        # useAuth, useAxios
│       ├─ services/     # api.js (axios instance)
│       └─ assets/       # placeholder screenshots / UI mock‑ups
│
├─ docker-compose.yml      # Orchestration for local dev
└─ README.md               # (this file)
```
---

## Quick Local Development (Docker)

### Prerequisites
- Docker Desktop (or Docker Engine) installed
- Git (to clone the repo) – optional if you already have the files

### 1️⃣ Clone the repo (if needed)
```bash
git clone <repo‑url>
cd "ThreatShield AI"
```
> *If you already have the files on your machine, simply `cd` into the project root.*

### 2️⃣ Build & run the containers
```bash
# From the project root (contains docker‑compose.yml)
docker compose up --build
```
- The **backend** will be reachable at `http://localhost:8000`
- The **frontend** will be reachable at `http://localhost:5173`
- Both containers share a volume `api-data` that persists the SQLite DB.

### 3️⃣ Verify the API is running
```bash
curl http://localhost:8000/health
# => {"status":"ok"}
```
You can also open the Swagger UI at `http://localhost:8000/docs`.

### 4️⃣ Open the UI
Navigate to `http://localhost:5173` in a browser. You should see the cyber‑punk landing page, be able to **Sign‑up**, **Login**, and use the URL/SMS/Email scanners.

---

## Dummy Data – How to Test the Endpoints
Below are some quick `curl` examples you can run from a terminal (or use Postman). The backend does **not** require a real user for the demo – you can sign‑up a test account first.

### 1️⃣ Sign‑up (creates a user & returns a JWT)
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"DemoPass123"}'
```
Response (example):
```json
{ "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOi...", "token_type": "bearer" }
```
Copy the `access_token` for the protected calls.

### 2️⃣ Login (if you already have a user)
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"DemoPass123"}'
```

### 3️⃣ URL Scan (phishing detection)
```bash
curl -X POST http://localhost:8000/predict/url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT>" \
  -d '{"url":"https://phishing‑example.com/login"}'
```
Typical response:
```json
{
  "prediction": "Phishing",
  "risk_score": 92,
  "confidence": 0.96,
  "severity": "Critical"
}
```

### 4️⃣ SMS Scan (scam detection)
```bash
curl -X POST http://localhost:8000/predict/sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT>" \
  -d '{"message":"Your bank account is compromised, click https://fake‑bank.com now!"}'
```
Response example:
```json
{ "prediction": "Scam", "risk_score": 85, "confidence": 0.88, "severity": "High" }
```

### 5️⃣ Email Scan (spam detection)
```bash
curl -X POST http://localhost:8000/predict/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT>" \
  -d '{
        "subject":"You won a prize!",
        "body":"Click the link to claim your reward.",
        "sender":"spam@bad‑mailer.com",
        "recipient":"demo@example.com"
      }'
```
Response example:
```json
{ "prediction": "Spam", "risk_score": 78, "confidence": 0.81, "severity": "Medium" }
```

### 6️⃣ Dashboard Metrics
```bash
curl http://localhost:8000/analytics/total-scans
curl http://localhost:8000/analytics/threats-detected
curl http://localhost:8000/analytics/recent-activities
```
These endpoints feed the React dashboard widgets.

### 7️⃣ Generate a PDF Report
```bash
curl -X POST http://localhost:8000/reports/pdf \
  -H "Content-Type: application/json" \
  -d '{"start_date":"2024-01-01T00:00:00","end_date":"2025-01-01T00:00:00"}' \
  -o threat_report.pdf
```
A similar call with `/csv` returns a CSV file.
---

## Deploying the Backend (Render.com)
Render will run your Dockerfile automatically.
1. **Create a new **Web Service** on Render** and point it to the **backend** folder.
2. **Dockerfile** is already present – Render will build it.
3. **Port configuration** – Render provides the port via the `PORT` env variable. The container’s command runs `uvicorn app:app --host 0.0.0.0 --port $PORT`. No changes required.
4. **Environment variables** (optional):
   - `DATABASE_URL` – set to a Postgres URL if you want a managed DB instead of the default SQLite. Example:
     ```
     DATABASE_URL=postgresql://user:password@host:5432/threatshield
     ```
   - `SECRET_KEY` – override the hard‑coded JWT secret.
5. **CORS** – the backend allows `*` origins, which works for Vercel. If you prefer tighter security, set a specific origin via the `ALLOWED_ORIGINS` env var (modify `app.py` accordingly).
6. **Deploy** – after the first build Render will expose the service at `https://<your‑service>.onrender.com`.

## Deploying the Frontend (Vercel)
1. Sign in to Vercel and import the repository.
2. Set the **Root Directory** to `frontend/`.
3. Vercel will run `npm install && npm run build` automatically.
4. **Environment Variable** – create `VITE_API_URL` with the URL of your backend (Render service). Example:
   ```
   VITE_API_URL=https://threatshield-backend.onrender.com
   ```
   In the React code the Axios instance (`src/services/api.js`) reads `import.meta.env.VITE_API_URL`.
5. Deploy – Vercel will publish the static site at `https://<project>.vercel.app`.

---

## Important Checks Before Going Live
- **CORS** – `allow_origins=["*"]` is fine for a public demo, but you may want to restrict it to your Vercel domain in production.
- **Port handling** – The Dockerfile does not hard‑code a port; Render injects `$PORT`. Locally we expose `8000` via Docker compose; this is safe.
- **Static files** – All frontend assets are built into the `dist/` folder; the Vite Docker image serves them with `serve`. No extra server configuration needed.
- **Model files** – Ensure the `.pkl` files are present under `backend/models/`. They are copied into the container during the Docker build.
- **Secret keys** – The JWT secret is currently a hard‑coded placeholder (`supersecretkeychange_me`). Override it with an environment variable (`SECRET_KEY`) on Render for security.
- **Database persistence** – In Render you’ll likely want a managed Postgres instance. Update `DATABASE_URL` accordingly; the SQLite fallback works for quick demos.

---

## TL;DR Commands
```bash
# Local dev (Docker)
docker compose up --build

# Backend only (if you have Python 3.12 locally)
python -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app:app --reload

# Frontend only (Vite dev server)
cd frontend && npm install && npm run dev
```
---

## License
This project is provided as an educational / portfolio example. Feel free to adapt, extend, and deploy it publicly.

---

*Happy hacking and stay secure!*
