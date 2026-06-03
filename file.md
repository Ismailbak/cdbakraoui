# File Reference for RhumatoAI

This file is a concise inventory of the active repository layout. It is not a generated file; update it when major folders, deployment behavior, or feature ownership changes.

Last updated: June 3, 2026.

---

## Root

- **README.md**: Project overview and high-level usage notes.
- **deploy.md**: On-prem Proxmox/Ubuntu deployment guide for FastAPI + React build + Nginx + managed MySQL.
- **docker-compose.yml**: Local Docker workflow for backend, MySQL, optional Qdrant, and web. MySQL and Qdrant bind to `127.0.0.1` only. Semantic RAG stays disabled unless `RAG_SEMANTIC_ENABLED=true`.
- **RAG.md**: RAG design, phased plan, and safety rules.
- **SYSTEM.md**: Long-form system reference. Some older sections may lag behind the code.
- **data/.gitkeep**: Placeholder for root-level runtime data. Runtime uploads should not be committed.
- **Diagrams/** and **Presentations/**: Project visual/presentation assets.
- **.gitignore**: Ignores local env files, Python/Node caches, build output, runtime uploads, and embedded Qdrant data (`backend/.qdrant/`).

Sensitive local configuration lives in `.env` files and is intentionally ignored by git.

---

## Backend (`backend/`)

- **Dockerfile**: Backend container image definition.
- **requirements.txt**: Backend runtime dependencies, including FastAPI, SQLAlchemy, Alembic, MySQL driver, PDF, RAG/LLM packages.
- **alembic.ini** and **migrations/**: Alembic migration configuration and migration files. `migrations/env.py` reads the app `DATABASE_URL`.
- **scripts/setup_admin.py**: Admin bootstrap/update script. In production, the admin password must be provided by prompt or `ADMIN_PASSWORD`.
- **scripts/ingest_rag.py**: Optional RAG chunk ingestion helper for semantic/Qdrant indexing when enabled.
- **tests/**: Backend tests for API, services, and RAG behavior. Current suite passes locally: `42 passed`.
- **data/uploads/**: Runtime upload storage mounted by FastAPI at `/uploads`; ignored by git except `.gitkeep`.

### Backend App Layout

- **app/main.py**: FastAPI application entry point, CORS, router registration, uploads mount, startup database/LLM checks.
- **app/core/**
  - `config.py`: Environment-driven settings (`DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `OLLAMA_HOST`, `OLLAMA_MODEL`, production flags).
  - `database.py`: SQLAlchemy engine/session setup.
  - `config_rag.py`: RAG thresholds, retrieval configuration, and vector settings (`RAG_SEMANTIC_ENABLED`, `RAG_QDRANT_PATH` for embedded mode, or `RAG_QDRANT_HOST`/`RAG_QDRANT_PORT` for server mode).
  - `schemas/`: Shared Pydantic contracts for chat sessions and RAG responses.
  - `utils/`: Rate limiting, preprocessing, and security helpers.
- **app/auth/**: Login, JWT, current user, user management, password helpers.
- **app/patients/**: Patient CRUD, search, allergies, dossier export, patient authorization helpers.
- **app/appointments/**: Appointment CRUD and date-based appointment endpoints.
- **app/medical_acts/**: Medical acts, linked forms, documents, PDFs, staff/diagnosis/treatment data.
- **app/act_results/**: Lab/act result CRUD and patient/act result lookups.
- **app/forms/**: Dynamic clinical forms, reference data, form templates, responses, and act-form links.
- **app/chat/**: Plain chat, grounded chat, chat history/session endpoints. Grounded responses return `patient_id`, `message_id`, sources, confidence, and warnings.
- **app/chat/rag/**: Structured-first RAG pipeline with semantic/Qdrant code gated by config:
  - `orchestrator.py`: Classification, patient context, retrieval, prompt build, response metadata.
  - `chat_service.py`: Grounded LLM execution and cleanup.
  - `patient_detection.py`: Strict IPP/name auto-detection helpers.
  - `fact_ranking.py`: Fact dedupe, recency weighting, and caps.
  - `embedding_service.py`, `ingestion.py`, `rag_db.py`: Phase 2 semantic support helpers.
  - `retrievers/query_classifier.py`: Rule-based intent and IPP detection.
  - `retrievers/structured_retriever.py`: Patient, appointment, medical act, and lab result facts.
  - `retrievers/semantic_retriever.py`: Qdrant semantic retrieval when enabled; supports embedded local storage or a Qdrant server.
  - `retrievers/prompt_builder.py`: Deterministic evidence prompt generation.
- **app/analytics/**: Summary analytics, admin stats, audit log retrieval/export, broadcast helpers. Recent activity uses patient first/last name (not a legacy `name` field).
- **app/notifications/**: Personal/broadcast notification endpoints and service logic.
- **app/pdf/**: Patient dossier and medical act PDF generation.
- **app/models/**: SQLAlchemy models for users, patients, appointments, medical acts, act results, forms, chat, audit, notifications, and Phase 2 RAG chunks.

### Backend Status

| Area | Status | Notes |
|------|--------|-------|
| Auth/JWT | Implemented | Role-aware user endpoints and token auth |
| Patient records | Implemented | CRUD, search, allergies, dossier PDF |
| Appointments | Implemented | CRUD and today's appointments |
| Medical acts | Implemented | Acts, forms, documents, PDF export |
| Forms | Implemented | Reference data, multiple clinical forms, dynamic templates |
| Analytics/audit | Implemented | KPI/admin stats and audit export |
| Notifications | Implemented | Personal and broadcast messaging |
| Chat/RAG Phase 1 | Implemented | Structured retrieval with citations/metadata |
| File upload | Partial | Upload storage exists; UI coverage is not complete everywhere |
| Semantic RAG Phase 2 | Available, opt-in locally | Embedded Qdrant via `RAG_QDRANT_PATH=.qdrant` or server Qdrant; enable with `RAG_SEMANTIC_ENABLED=true` |

---

## Frontend Web (`frontend/web/`)

- **package.json / package-lock.json**: React 18 / CRA app dependencies and scripts.
- **Dockerfile**: Dev-oriented web container. Production deployment should serve `build/` through Nginx.
- **public/**: Static browser shell and favicon.
- **scripts/clear-webpack-cache.js**: Local cache cleanup helper.
- **src/App.js**: React Router configuration and inactivity guard.
- **src/api/api.js**: Axios client. Development defaults to `http://localhost:8000/api`; production defaults to `/api`.
- **src/components/layout/**: Header, sidebar, layout wrapper.
- **src/components/common/**: Toast, skeletons, breadcrumbs, confirm dialog, empty state, source citation panel, barrel exports.
- **src/components/cards/**: KPI/stat cards.
- **src/components/MedicalForms/**: Clinical form components used by medical acts.
- **src/pages/**: Feature pages:
  - `Login`, `Signup`, `Dashboard`, `Patients`, `Appointments`, `MedicalActs`, `Assistant`, `Chat`, `Analytics`, `Notifications`, `Admin`, `Profile`, `Legal`.
- **src/pages/Assistant/**: Web assistant UI with left history rail (scrollable list, short conversation titles), grounded chat panel, expandable citations (`SourceCitationPanel` in `components/common/`), and auto-resizing message composer. Remembers detected `patient_id` across follow-up messages in the same session.

### Web Status

| Area | Status | Notes |
|------|--------|-------|
| Login/session | Implemented | Uses shared API client |
| Dashboard | Implemented | KPIs, recent activity with correct patient names |
| Patients | Implemented | List/search/detail/forms/PDF |
| Appointments | Implemented | Calendar/list/modal workflow |
| Medical acts/forms | Implemented | Multi-step act form and clinical form linking |
| Assistant/chat | Implemented | History rail, grounded chat, patient context carryover |
| Admin | Implemented | Users, analytics, security/settings/form builder |
| Notifications | Implemented | P2P/broadcast UI |
| Production build | Verified | `npm run build` completed successfully |

---

## Frontend Mobile (`frontend/mobile/`)

- **App.js / app.json**: Expo app entry and metadata.
- **package.json / package-lock.json**: React Native / Expo dependencies.
- **src/api/api.js**: Axios client with AsyncStorage token handling.
- **src/navigation/AppNavigator.js**: Login stack, bottom tabs, patient stack, More stack.
- **src/styles/theme.js**: Mobile design tokens.
- **src/components/navigation/**: Mobile navigation components such as `MoreMenuItemButton`.
- **src/components/common/**: Mobile UI kit:
  - `Card`, `Input`, `PrimaryButton`, `Badge`, `Chip`, `Divider`, `EmptyState`, `ErrorMessage`, `ProgressIndicator`, `SkeletonLoader`, `BottomSheet`, `TabBar`, `Toast`, barrel `index.js`.
- **src/utils/**: Haptics, gestures, toast provider, icon helpers.
- **src/screens/**:
  - `Login`, `Dashboard`, `Patients`, `Appointments`, `Analytics`, `Notifications`, `Assistant`, `Settings`.

### Mobile Status

| Area | Status | Notes |
|------|--------|-------|
| Login/token storage | Implemented | AsyncStorage token flow |
| Dashboard | Implemented | KPI cards, loading/empty states |
| Patients | Implemented | List, details, add medical act |
| Appointments | Implemented | Appointment list/actions |
| Analytics | Implemented | Mobile stats screen |
| Notifications | Implemented | Notification list |
| Assistant | Implemented | Mobile chat screen |
| UI kit | In progress | Components exist; not all are used by screens yet |
| Production mobile build | Not covered | Deployment pass focused on backend + web |

---

## Cleanup Notes

- Keep `.env` files local only; they are ignored by git and may contain secrets or LAN IPs.
- Do not commit generated output: `__pycache__`, `.pytest_cache`, `frontend/web/build`, `node_modules`, cache folders, logs, runtime uploads, or `backend/.qdrant/`.
- `docs/cleanup.md` and `frontend/mobile/UI_COMPONENTS_GUIDE.md` were removed from the active docs set; keep generated/cache cleanup decisions in `.gitignore` and project notes.
- `backend/data/uploads/profiles/user_7.png` was removed from git tracking because it is runtime upload data.

---

## Current Verification

| Check | Result |
|-------|--------|
| Backend tests | `42 passed` |
| Web production build | Successful |
| Assistant UI | Build-verified (history scroll, titles, composer resize) |
| Dashboard activity labels | Fixed (`first_name` + `last_name`) |

---

## Legend

- **Implemented**: Active and wired into the app.
- **Partial**: Present but incomplete or not fully covered across surfaces.
- **Planned**: Designed/configured but not active in runtime.
