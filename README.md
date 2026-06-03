# RhumatoAI

RhumatoAI is a local-first medical assistant for rheumatology workflows. It combines a FastAPI backend, a React web app, an Expo React Native mobile app, MySQL persistence, and an optional local LLM through Ollama.

This README intentionally avoids unverified usage, latency, doctor-count, and load-testing claims. Add performance numbers only after running and documenting reproducible benchmarks for the target machine and dataset.

## What It Does

- Manages patients, appointments, medical acts, lab results, and related clinical records.
- Provides authenticated web and mobile access with JWT-based sessions.
- Includes role-aware admin areas in the web app.
- Supports analytics screens for operational summaries.
- Generates PDFs for medical documents through the backend.
- Provides notifications for staff messages and broadcast announcements.
- Includes an AI assistant that can answer general medical questions and use structured patient context when available.
- Includes semantic RAG/Qdrant scaffolding, disabled locally by default.

## Project Structure

```text
.
├── backend/          # FastAPI API, SQLAlchemy models, services, migrations, tests
├── frontend/
│   ├── web/          # React web client
│   └── mobile/       # Expo React Native client
├── Diagrams/         # Architecture and project diagrams
└── docker-compose.yml
```

## Architecture

```text
React Web / Expo Mobile
        |
        | HTTP + JWT
        v
FastAPI backend
        |
        +-- MySQL via SQLAlchemy
        +-- Ollama for local LLM responses
        +-- Qdrant for optional semantic retrieval
        +-- ReportLab for PDF generation
```

The API exposes routes for authentication, patients, appointments, medical acts, act results, dynamic forms, chat, analytics, and notifications.

## Tech Stack

### Backend

- FastAPI and Uvicorn
- SQLAlchemy with MySQL through PyMySQL
- Alembic migrations
- JWT authentication with `python-jose`
- Password hashing with `passlib`/bcrypt
- Pydantic settings and schemas
- ReportLab for PDF generation
- Ollama client for local LLM calls
- Optional Qdrant and sentence-transformer based semantic retrieval
- Pytest test suite

### Web

- React 18
- React Router
- Axios
- Recharts
- React Icons
- Create React App tooling

### Mobile

- Expo 54
- React Native
- React Navigation
- AsyncStorage
- Axios
- Expo notifications

## Local Development

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ if running the backend outside Docker
- Node.js 18+ if running frontends outside Docker
- Ollama if using local AI responses outside the Compose setup

### Start With Docker

```bash
docker-compose up --build
```

Services exposed by the checked-in Compose file:

- Web app: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- MySQL: `localhost:3306`
- Qdrant: `http://localhost:6333`

Create or update the development admin user:

```bash
docker-compose exec backend python scripts/setup_admin.py
```

The script creates `admin@chu.ma`. In development it can use the default password shown by the script; in production set `ADMIN_PASSWORD`.

### Run Backend Manually

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Common backend environment variables:

```env
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:3306/DATABASE
SECRET_KEY=change-this-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:19006
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b
APP_ENV=development
RAG_SEMANTIC_ENABLED=false
```

Do not commit real secrets in `.env` files.

### Run Web Manually

```bash
cd frontend/web
npm install
npm start
```

The web app expects the backend API at `http://localhost:8000/api` unless configured otherwise.

### Run Mobile Manually

```bash
cd frontend/mobile
npm install
npm start
```

For physical-device testing, configure the mobile API base URL to use the backend machine's LAN IP instead of `localhost`.

## AI And RAG Behavior

The backend checks Ollama during startup in a background thread. If Ollama is unavailable, the API still starts and chat requests can retry connections later.

Structured RAG is the default retrieval path. It uses patient identifiers and clinical database records to ground assistant responses when a patient context is available.

Semantic RAG support exists through Qdrant and local embeddings, but `RAG_SEMANTIC_ENABLED` defaults to `false` because embedding model loading can be memory-heavy on local machines.

## Security Notes

- JWT auth is used for API access.
- Passwords are hashed before storage.
- CORS origins are configured through environment settings.
- Patient-bound retrieval is expected to pass through authorization checks.
- Write operations include audit logging support.
- Production deployments should set a strong `SECRET_KEY`, use private database credentials, restrict exposed ports, and run migrations explicitly.

## Testing

Backend tests live under `backend/tests`.

```bash
cd backend
pytest
```

Web build verification:

```bash
cd frontend/web
npm run build
```

Mobile verification:

```bash
cd frontend/mobile
npm start
```

## Known Limitations

- No verified performance, latency, or concurrent-user benchmark is documented yet.
- Semantic retrieval is available but disabled by default.
- Background job processing is not currently part of the default stack.
- Docker Compose exposes MySQL and Qdrant ports for local development; lock these down for production.
- Production deployment details should be documented separately for the actual target environment.

## Benchmarking Policy

Do not add claims such as response time, supported doctor count, clinic capacity, database size, or hardware requirements unless the benchmark includes:

- Test date and commit hash.
- Machine CPU, RAM, disk, GPU if relevant, and Ollama model.
- Dataset size and shape.
- Number of concurrent users or requests.
- Exact command or tool used.
- Median, p95, and failure rate where applicable.

Until then, describe capabilities qualitatively and mark performance characteristics as unverified.
