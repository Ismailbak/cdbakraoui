# RhumatoAI Medical System - Complete Documentation

**Project:** RhumatoAI - AI-assisted Rheumatology Medical Assistant  
**Client:** CHU Ibn Rochd (Casablanca)  
**Timeline:** Feb 2026 – July 2026  
**Status:** Active Development (Structured RAG default, semantic RAG feature-flagged)
**Last Updated:** May 21, 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Directory Structure](#directory-structure)
4. [Backend System](#backend-system)
5. [Frontend Web System](#frontend-web-system)
6. [Frontend Mobile System](#frontend-mobile-system)
7. [Data Models & Database](#data-models--database)
8. [Core Features](#core-features)
9. [API Endpoints](#api-endpoints)
10. [Deployment & Configuration](#deployment--configuration)
11. [Known Issues & Cleanup Candidates](#known-issues--cleanup-candidates)
12. [Development Workflow](#development-workflow)

---

## Project Overview

### Mission
Provide a locally-deployed, GDPR-compliant AI assistant to support rheumatology clinicians with:
- Patient record management
- Appointment scheduling
- Medical act tracking and billing
- Lab result management
- RAG-based grounded chat (medical Q&A with source citations)
- Audit logging for compliance

### Key Principles
- **Local Deployment:** All data stays on-premises; no cloud dependencies.
- **GDPR Compliance:** Audit trails, data retention policies, consent tracking.
- **Role-Based Access:** Admin, Doctor, Department Head roles with fine-grained permissions.
- **Safety-First AI:** Retrieval-Augmented Generation (RAG) with authorization guards and insufficient-data fallbacks.

### Current Status (May 21, 2026)
✅ **Completed:**
- Core database schema with all entity models
- JWT-based authentication and role management
- Patient CRUD, appointment scheduling, medical act management
- Lab results (ActResults) with abnormality flags
- Analytics and audit logging
- PDF generation (dossiers, medical acts)
- AI chat with Ollama backend (BioMistral/Gemma tested)
- RAG Phase 1: Structured retrieval from patients, appointments, medical acts, and act results
- RAG Phase 2 scaffolding: Qdrant/semantic retrieval code exists, but local runtime keeps it disabled with `RAG_SEMANTIC_ENABLED=false`
- Web frontend: All major pages implemented
- Mobile frontend: Core modules marked implemented

⚠️ **In Progress / Partial:**
- File/document upload workflows (endpoints partial, UI incomplete)
- Mobile UI polish (emoji → icons, color palette alignment)
- RAG Phase 2 validation: semantic retrieval requires explicit enablement, Qdrant availability, and embedding memory validation

❌ **Not Started:**
- Mobile analytics charts (needs react-native-chart-kit integration)
- Mobile admin features

---

## Architecture & Technology Stack

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                          │
├─────────────────────┬───────────────────────────────────────┤
│  Web (React 18)    │  Mobile (React Native / Expo 54)      │
│  Port 3000         │  Port 8081 / 192.168.x.x              │
│  Recharts          │  Async Storage, React Navigation      │
│  React Router      │                                        │
└──────────────┬──────┴────────────────────────┬──────────────┘
               │                               │
        HTTP / REST                    HTTP / REST
               │                               │
┌──────────────▼──────────────────────────────▼──────────────┐
│              API LAYER (FastAPI Backend)                   │
│              Port 8000                                      │
├──────────────────────────────────────────────────────────────┤
│  Auth  │ Patients │ Appointments │ Medical Acts │ Chat/RAG │
│ Forms  │ Analytics│ Notifications│  Lab Results │ PDF Gen  │
└──────────────┬───────────────────────────────────────────────┘
               │
        SQLAlchemy ORM
               │
┌──────────────▼──────────────────────────────────────────────┐
│           DATABASE LAYER (MySQL 8)                          │
│           Port 3306                                         │
├──────────────────────────────────────────────────────────────┤
│  Users │ Patients │ Appointments │ MedicalActs │ ActResults │
│  Audits│ Chat Msgs│ Forms        │ Allergies   │ Notifications
└────────────────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│     EXTERNAL SERVICES (Optional / Feature-Flagged)          │
├──────────────────────────────────────────────────────────────┤
│  Ollama LLM (localhost:11434)  │  Qdrant Vector DB (semantic RAG)
└────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | FastAPI 0.100+ | REST API framework |
| | SQLAlchemy 2.0 | ORM |
| | MySQL 8 | Primary database |
| | Alembic | Schema migrations |
| | PyJWT | Authentication tokens |
| | ReportLab | PDF generation |
| | Ollama | Local LLM inference |
| **Web Frontend** | React 18 | UI framework |
| | React Router 6 | Client routing |
| | Axios | HTTP client |
| | Recharts | Analytics charts |
| | CSS3 | Styling |
| **Mobile Frontend** | React Native | Cross-platform UI |
| | Expo 54 | Build/test tooling |
| | React Navigation | Mobile routing |
| | Async Storage | Local persistence |
| **Deployment** | Docker Compose | Local orchestration |
| | Docker | Container images |

---

## Directory Structure

```
IA-medical/
├── backend/
│   ├── app/
│   │   ├── main.py                           # FastAPI entry point
│   │   ├── core/
│   │   │   ├── config.py                     # Environment settings
│   │   │   ├── config_rag.py                 # RAG parameters
│   │   │   ├── database.py                   # SQLAlchemy setup
│   │   │   ├── schemas/
│   │   │   │   ├── rag_response.py           # RAG request/response schemas
│   │   │   │   └── chat_session.py           # Chat session schemas
│   │   │   └── utils/
│   │   │       ├── security.py               # Password hashing, JWT
│   │   │       ├── rate_limiting.py          # SlowAPI quotas
│   │   │       └── preprocessing.py          # Text cleaning
│   │   ├── models/                           # SQLAlchemy ORM entities
│   │   │   ├── user.py                       # User, auth roles
│   │   │   ├── patient.py                    # Patient demographics
│   │   │   ├── patient_allergy.py            # Allergies
│   │   │   ├── appointment.py                # Appointments
│   │   │   ├── medical_act.py                # Procedures, documents
│   │   │   ├── act_result.py                 # Lab results
│   │   │   ├── notification.py               # Messages
│   │   │   ├── audit.py                      # Audit logs
│   │   │   ├── chat_message.py               # Chat history
│   │   │   ├── chat_session.py               # Chat sessions
│   │   │   ├── llm.py                        # LLM singleton (Ollama)
│   │   │   ├── rag_chunk.py                  # RAG chunks (Phase 2)
│   │   │   ├── form_system.py                # Dynamic forms
│   │   │   └── additional_forms.py           # Rheumatology forms
│   │   ├── auth/
│   │   │   ├── router.py                     # Login, signup, admin endpoints
│   │   │   └── service.py                    # JWT, bcrypt helpers
│   │   ├── patients/
│   │   │   ├── router.py                     # Patient CRUD
│   │   │   └── service.py                    # Patient queries, auth
│   │   ├── appointments/
│   │   │   └── router.py                     # Appointment CRUD
│   │   ├── medical_acts/
│   │   │   └── router.py                     # Medical act CRUD
│   │   ├── act_results/
│   │   │   └── router.py                     # Lab result CRUD
│   │   ├── forms/
│   │   │   └── router.py                     # Dynamic form CRUD
│   │   ├── chat/
│   │   │   ├── router.py                     # Chat endpoints
│   │   │   ├── service.py                    # Chat session persistence
│   │   │   └── rag/
│   │   │       ├── orchestrator.py           # RAG coordinator
│   │   │       ├── chat_service.py           # RAG chat execution
│   │   │       └── retrievers/
│   │   │           ├── query_classifier.py   # Intent detection
│   │   │           ├── structured_retriever.py # ORM retrieval
│   │   │           └── prompt_builder.py     # Prompt assembly
│   │   ├── analytics/
│   │   │   ├── router.py                     # Stats, audit logs
│   │   │   ├── service.py                    # Aggregation queries
│   │   │   └── audit.py                      # Audit logging
│   │   ├── notifications/
│   │   │   ├── router.py                     # Notification endpoints
│   │   │   └── service.py                    # Message queries
│   │   └── pdf/
│   │       └── service.py                    # PDF generation
│   ├── migrations/
│   │   ├── env.py                            # Alembic environment
│   │   ├── versions/
│   │   │   ├── 001_create_form_system.sql    # Forms schema
│   │   │   ├── 002_seed_form_system_data.sql # Forms seed data
│   │   │   ├── 003_create_*.sql              # Rheumatology forms
│   │   │   ├── 004_create_rag_tables.py      # RAG tables
│   │   │   ├── add_chat_sessions_table.py    # Chat sessions
│   │   │   └── b5add256af78_*.py             # Data integrity fixes
│   │   └── script.py.mako                    # Alembic template
│   ├── tests/
│   │   ├── test_api.py                       # API smoke tests
│   │   ├── test_services.py                  # Service unit tests
│   │   ├── test_rag_structured.py            # RAG contract tests
│   │   └── test_rag_evaluation.py            # RAG acceptance tests
│   ├── scripts/
│   │   └── setup_admin.py                    # Bootstrap admin user
│   ├── requirements.txt                      # Python dependencies
│   ├── Dockerfile                            # Backend container
│   ├── alembic.ini                           # Alembic config
│   └── data/uploads/                         # File upload storage
│
├── frontend/
│   ├── web/
│   │   ├── src/
│   │   │   ├── index.js                      # ReactDOM entry
│   │   │   ├── App.js                        # Root router + auth guard
│   │   │   ├── api/
│   │   │   │   └── api.js                    # Axios client + endpoints
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Header.js             # Top navigation bar
│   │   │   │   │   ├── Sidebar.js            # Left navigation drawer
│   │   │   │   │   └── Layout.js             # Page shell
│   │   │   │   ├── common/
│   │   │   │   │   ├── Toast.js              # Toast notifications
│   │   │   │   │   ├── Skeleton.js           # Loading skeletons
│   │   │   │   │   ├── EmptyState.js         # Empty states
│   │   │   │   │   ├── ConfirmDialog.js      # Confirm modals
│   │   │   │   │   ├── Breadcrumb.js         # Breadcrumb nav
│   │   │   │   │   ├── SourceCitationPanel.js # RAG citations
│   │   │   │   │   └── index.js              # Barrel export
│   │   │   │   ├── cards/
│   │   │   │   │   └── StatCard.js           # KPI cards
│   │   │   │   └── MedicalForms/
│   │   │   │       └── AllForms.js           # Form registry
│   │   │   ├── pages/
│   │   │   │   ├── Login/
│   │   │   │   │   ├── LoginPage.js          # Login form
│   │   │   │   │   └── index.js              # Barrel
│   │   │   │   ├── Signup/
│   │   │   │   │   ├── SignupPage.js         # Registration form
│   │   │   │   │   └── index.js
│   │   │   │   ├── Dashboard/
│   │   │   │   │   ├── DashboardPage.js      # Main dashboard
│   │   │   │   │   ├── Dashboard.js          # Legacy component
│   │   │   │   │   └── index.js
│   │   │   │   ├── Analytics/
│   │   │   │   │   ├── AnalyticsPage.js      # Analytics dashboard
│   │   │   │   │   ├── Analytics.js          # Legacy component
│   │   │   │   │   └── index.js
│   │   │   │   ├── Patients/
│   │   │   │   │   ├── PatientsPage.js       # Patient list/crud
│   │   │   │   │   ├── PatientDetailPage.js  # Patient dossier
│   │   │   │   │   ├── PatientForm.js        # Patient edit form
│   │   │   │   │   ├── LabResultForm.js      # Lab result form
│   │   │   │   │   ├── PatientList.js        # Subcomponent
│   │   │   │   │   ├── PatientPage.js        # Legacy component
│   │   │   │   │   └── index.js
│   │   │   │   ├── Appointments/
│   │   │   │   │   ├── AppointmentsPage.js   # Calendar view
│   │   │   │   │   ├── AppointmentForm.js    # Create/edit
│   │   │   │   │   ├── AppointmentList.js    # List subcomponent
│   │   │   │   │   └── index.js
│   │   │   │   ├── MedicalActs/
│   │   │   │   │   ├── MedicalActsPage.js    # Acts list + details
│   │   │   │   │   ├── MedicalActForm.js     # Create/edit acts
│   │   │   │   │   ├── MedicalActList.js     # List subcomponent
│   │   │   │   │   ├── DynamicFormRenderer.js # Render linked forms
│   │   │   │   │   └── index.js
│   │   │   │   ├── Assistant/
│   │   │   │   │   ├── AssistantPage.js      # Chat shell
│   │   │   │   │   ├── Chat.js               # Chat UI
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── ChatAssistant.js  # Chat panel
│   │   │   │   │   │   └── ChatSessions.js   # Session sidebar
│   │   │   │   │   └── index.js
│   │   │   │   ├── Chat/
│   │   │   │   │   └── ChatPage.js           # Patient-scoped chat
│   │   │   │   ├── Notifications/
│   │   │   │   │   ├── NotificationsPage.js  # Notifications center
│   │   │   │   │   ├── Notifications.js      # Legacy component
│   │   │   │   │   ├── CreateNotificationModal.js # Compose
│   │   │   │   │   └── index.js
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── AdminDashboard.js     # Admin overview
│   │   │   │   │   ├── AdminUsers.js         # User management
│   │   │   │   │   ├── AdminUserDetail.js    # User detail
│   │   │   │   │   ├── AdminAnalytics.js     # Admin analytics
│   │   │   │   │   ├── AdminSecurity.js      # Security settings
│   │   │   │   │   ├── AdminSettings.js      # Global config
│   │   │   │   │   ├── FormBuilder.js        # Form designer
│   │   │   │   │   └── AdminDashboard.css
│   │   │   │   ├── Profile/
│   │   │   │   │   ├── ProfilePage.js        # User profile
│   │   │   │   │   └── index.js
│   │   │   │   ├── Legal/
│   │   │   │   │   ├── TermsPage.js          # Terms of service
│   │   │   │   │   ├── PrivacyPage.js        # Privacy policy
│   │   │   │   │   └── index.js
│   │   │   ├── assets/
│   │   │   │   ├── images/
│   │   │   │   │   ├── logo.png              # Used in sidebar
│   │   │   │   │   ├── app-logo.png          # Unused
│   │   │   │   │   └── *-removebg-*.png      # Tech logos, unused
│   │   │   │   └── icons/favicon.png         # Unused
│   │   │   ├── styles/
│   │   │   │   └── main.css                  # Global styles
│   │   │   └── index.css                     # Global CSS
│   │   ├── public/
│   │   │   ├── index.html                    # HTML shell
│   │   │   └── favicon-logo.png
│   │   ├── package.json                      # Dependencies + scripts
│   │   ├── Dockerfile                        # Web container
│   │   └── scripts/
│   │       └── clear-webpack-cache.js        # CRA cache cleanup
│   │
│   └── mobile/
│       ├── src/
│       │   ├── api/api.js                    # Axios wrapper
│       │   ├── styles/theme.js               # Design tokens
│       │   ├── navigation/
│       │   │   └── AppNavigator.js           # Tab + stack navigation
│       │   ├── components/
│       │   │   ├── common/
│       │   │   │   ├── Card.js               # Reusable card
│       │   │   │   ├── Input.js              # Text input
│       │   │   │   └── PrimaryButton.js      # CTA button
│       │   │   ├── navigation/
│       │   │   │   └── MoreMenuItemButton.js # More menu item
│       │   │   ├── Dashboard.js              # Legacy
│       │   │   ├── Analytics.js              # Legacy
│       │   │   ├── Notifications.js          # Legacy
│       │   │   └── PatientList.js            # Legacy
│       │   └── screens/
│       │       ├── Login/LoginScreen.js
│       │       ├── Dashboard/DashboardScreen.js
│       │       ├── Patients/
│       │       │   ├── PatientScreen.js      # List
│       │       │   ├── PatientDetailScreen.js # Detail
│       │       │   └── AddMedicalActScreen.js # Create act
│       │       ├── Appointments/AppointmentsScreen.js
│       │       ├── Analytics/AnalyticsScreen.js
│       │       ├── Notifications/NotificationsScreen.js
│       │       ├── Assistant/ChatAssistantScreen.js
│       │       └── Settings/SettingsScreen.js
│       ├── App.js                            # Expo entry point
│       ├── app.json                          # Expo metadata
│       └── package.json                      # Dependencies
│
├── data/
│   └── uploads/                              # File upload storage
│
├── Diagrams/                                 # Architecture diagrams
├── Presentations/                            # Project presentation decks
├── docker-compose.yml                        # Local orchestration
├── readme.md                                 # Project overview
├── RAG.md                                    # RAG design documentation
├── file.md                                   # File inventory
└── SYSTEM.md                                 # This file
```

---

## Backend System

### FastAPI Entry Point (`backend/app/main.py`)

```python
# Bootstraps:
# 1. SQLAlchemy tables from ORM models
# 2. Router registration (auth, patients, appointments, etc.)
# 3. Middleware (CORS, rate limiting)
# 4. File upload directory mount
# 5. Health check endpoint
# 6. Ollama LLM health probe on startup
```

### Authentication & Authorization

**Router:** `backend/app/auth/router.py`  
**Service:** `backend/app/auth/service.py`

- **JWT tokens** issued on login; stored client-side
- **bcrypt** password hashing with salt
- **Roles:** admin, doctor, department_head
- **Endpoints:**
  - `POST /api/auth/login` — username + password → JWT token
  - `POST /api/auth/signup` — register new user
  - `GET /api/auth/me` — current user profile
  - `GET /api/auth/doctors` — list doctors (for medical act assignment)
  - `POST /api/auth/admin/users` — admin: create user
  - `GET /api/auth/admin/users` — admin: list users

### Patient Management

**Router:** `backend/app/patients/router.py`  
**Service:** `backend/app/patients/service.py`  
**Model:** `backend/app/models/patient.py`

**Entities:**
- **Patient:** demographics (IPP ID, name, DOB, gender), insurance, emergency contact, clinical notes
- **PatientAllergy:** allergy records with severity, onset date

**Endpoints:**
- `GET /api/patients/` — search/list patients (with filtering)
- `POST /api/patients/` — create patient
- `GET /api/patients/{id}` — get patient detail
- `PUT /api/patients/{id}` — update patient
- `DELETE /api/patients/{id}` — delete (soft-delete with audit)
- `GET /api/patients/{id}/dossier/export` — export PDF dossier
- `GET /api/patients/search?q=query` — full-text search

### Appointment Management

**Router:** `backend/app/appointments/router.py`  
**Model:** `backend/app/models/appointment.py`

**Entities:**
- **Appointment:** scheduled datetime, reason, status (pending, confirmed, completed, cancelled)

**Endpoints:**
- `GET /api/appointments/` — list appointments
- `POST /api/appointments/` — create appointment
- `GET /api/appointments/today` — today's appointments
- `PUT /api/appointments/{id}` — update appointment
- `DELETE /api/appointments/{id}` — cancel/delete

### Medical Acts Management

**Router:** `backend/app/medical_acts/router.py`  
**Model:** `backend/app/models/medical_act.py`

**Entities:**
- **MedicalAct:** procedure records with:
  - Date, diagnosis, treatment, clinical notes
  - Assigned doctor (required)
  - Associated documents (file paths)
  - Linked dynamic forms
  - Related staff (nurses, technicians)

**Endpoints:**
- `GET /api/medical-acts/` — list acts
- `POST /api/medical-acts/` — create act
- `GET /api/medical-acts/{id}` — get act detail
- `PUT /api/medical-acts/{id}` — update act
- `DELETE /api/medical-acts/{id}` — delete act
- `POST /api/medical-acts/{id}/link-form` — attach dynamic form
- `GET /api/medical-acts/{id}/documents` — list documents

### Lab Results (ActResults)

**Router:** `backend/app/act_results/router.py`  
**Model:** `backend/app/models/act_result.py`

**Entities:**
- **ActResult:** lab test results tied to medical acts and patients
  - Result value, units, reference range
  - Abnormality flag (normal, low, high, critical)
  - Test date, physician interpretation

**Endpoints:**
- `GET /api/act-results/` — list results
- `POST /api/act-results/` — create result
- `GET /api/act-results/patient/{id}` — results for patient (DESC by date)
- `GET /api/act-results/act/{id}` — results for act
- `GET /api/act-results/{id}` — get result detail
- `PUT /api/act-results/{id}` — update result
- `DELETE /api/act-results/{id}` — delete result

### Dynamic Forms System

**Router:** `backend/app/forms/router.py`  
**Models:** `backend/app/models/form_system.py`, `backend/app/models/additional_forms.py`

**Supported Forms:**
- General patient assessment
- Pain assessment (CS Douleur)
- Rheumatology-specific forms
- Dynamically extensible via form system tables

**Endpoints:**
- `GET /api/forms/schemas` — list available form templates
- `GET /api/forms/reference-data` — lookup data (diagnoses, treatments, etc.)
- `POST /api/forms/` — create form response
- `GET /api/forms/{id}` — get form response
- `PUT /api/forms/{id}` — update form response

### Chat & RAG System

**Routers:**
- `backend/app/chat/router.py` — endpoints
- `backend/app/chat/rag/orchestrator.py` — RAG coordinator
- `backend/app/chat/rag/chat_service.py` — chat execution

**Retrievers:**
- `query_classifier.py` — Intent detection (PATIENT_SPECIFIC, GENERAL_MEDICAL, MIXED_AMBIGUOUS)
- `structured_retriever.py` — 4 retrieval strategies:
  - PatientRetriever: demographics, allergies, diagnoses
  - AppointmentRetriever: appointment history
  - MedicalActRetriever: procedures and findings
  - ActResultRetriever: lab results with abnormality flags
- `prompt_builder.py` — Deterministic prompt assembly with source citations

**Endpoints:**
- `POST /api/chat/` — plain LLM chat (no grounding)
- `POST /api/chat/grounded` — RAG chat with sources and confidence
- `GET /api/chat/sessions/` — list chat sessions
- `GET /api/chat/sessions/{id}/messages` — get chat history
- `POST /api/chat/sessions/` — create new chat session

**RAG Response Structure:**
```json
{
  "response": "generated answer",
  "sources": [
    {
      "source_type": "patient",
      "source_id": 1,
      "label": "Patient Record",
      "timestamp": "2026-04-15T10:30:00",
      "snippet": "excerpt from source",
      "score": 1.0
    }
  ],
  "confidence": "high|medium|low",
  "warnings": [],
  "tokens": 156,
  "model": "biomistral",
  "language": "fr|en|ar",
  "retrieval_type": "structured"
}
```

### Analytics & Audit

**Router:** `backend/app/analytics/router.py`  
**Service:** `backend/app/analytics/service.py`  
**Audit Helper:** `backend/app/analytics/audit.py`

**Endpoints:**
- `GET /api/analytics/summary` — KPI summaries (patients, appointments, revenue trends)
- `GET /api/analytics/recent-activity` — recent patient/appointment activity
- `GET /api/analytics/admin-stats` — admin dashboard stats
- `GET /api/analytics/audit-logs` — filtered audit log retrieval
- `GET /api/analytics/audit-logs/export` — export audit CSV
- `GET /api/analytics/settings` — system configuration
- `POST /api/analytics/broadcast` — admin: send broadcast notification

**Audit Logging:**
- Every action (create, update, delete) is logged with: user, action, resource, timestamp, IP, status, change delta

### Notifications

**Router:** `backend/app/notifications/router.py`  
**Service:** `backend/app/notifications/service.py`  
**Model:** `backend/app/models/notification.py`

**Types:** Personal, broadcast, system alerts

**Endpoints:**
- `GET /api/notifications/` — list unread notifications
- `POST /api/notifications/` — create notification (admin only for broadcast)
- `POST /api/notifications/read/{id}` — mark read
- `DELETE /api/notifications/{id}` — delete

### PDF Generation

**Service:** `backend/app/pdf/service.py`

**Supported PDFs:**
- **Patient Dossier:** demographics, allergies, emergency contact, medical history, recent results, lab values
- **Medical Act Report:** procedure details, diagnoses, treatments, findings, assigned staff, billing info

---

## Frontend Web System

### Entry Points

**File:** `frontend/web/src/index.js`
- Renders React app into DOM root
- Initializes global providers (auth, toast, theme)

**File:** `frontend/web/src/App.js`
- Top-level React Router configuration
- Inactivity timeout guard (logout after 15 min idle)
- Route definitions: login, dashboard, patients, appointments, etc.

### Page Structure

All pages follow a consistent pattern:

```
Page Container
├── Layout (Sidebar + Header + Breadcrumb)
├── Page Content (cards, forms, tables)
└── Modals (confirm dialogs, detail views)
```

### Dashboard (`frontend/web/src/pages/Dashboard/`)

**Main Page:** `DashboardPage.js`

**Displays:**
- KPI cards: total patients, today's appointments, revenue (6-month trend)
- Recent activity: new patients, upcoming appointments
- Common diagnoses: top-5 list
- System health: Ollama LLM status

**Data Sources:**
- `getAnalyticsSummary()` — 6-month stats
- `getPatients()` — patient count
- `getAppointments()` — appointment list
- `getRecentActivity()` — activity feed

### Patients (`frontend/web/src/pages/Patients/`)

**Main Pages:**
- `PatientsPage.js` — list/search/filter patients with inline actions
- `PatientDetailPage.js` — patient dossier with:
  - Demographics and allergies
  - Appointment history
  - Medical acts and procedures
  - Lab results with abnormality flags
  - PDF export button
- `PatientForm.js` — create/edit patient (form validation, error handling)
- `LabResultForm.js` — add lab result to patient

**Key Behaviors:**
- Search bar filters by name, IPP ID, phone
- Inline edit/delete with confirmation dialogs
- Detail view shows complete medical history
- Forms auto-save via API on submit

### Appointments (`frontend/web/src/pages/Appointments/`)

**Main Pages:**
- `AppointmentsPage.js` — calendar view + list view
- `AppointmentForm.js` — create/edit appointment with:
  - Date/time picker
  - Patient search dropdown
  - Reason dropdown
  - Status selector

**Key Behaviors:**
- Click calendar day to create appointment
- Drag-to-reschedule (if implemented)
- Color-coded status (pending = yellow, confirmed = green)

### Medical Acts (`frontend/web/src/pages/MedicalActs/`)

**Main Pages:**
- `MedicalActsPage.js` — list acts with detail modal
- `MedicalActForm.js` — create/edit act with:
  - Patient search
  - Doctor assignment (required)
  - Diagnosis/treatment input
  - Dynamic form linking
  - Document upload
- `DynamicFormRenderer.js` — renders linked clinical forms in modal

**Key Behaviors:**
- Form linking allows attaching pain assessment, rheumatology forms
- Doctor assignment enforced
- PDF export from detail view

### Chat & Assistant (`frontend/web/src/pages/Assistant/`)

**Pages:**
- `AssistantPage.js` — page shell
- `Chat.js` — main chat UI with:
  - Message history (grouped by date)
  - Input box with send button
  - Regenerate, copy, feedback buttons
- `ChatSessions.js` — session sidebar with new chat button
- `SourceCitationPanel.js` — expandable panel showing RAG sources:
  - Confidence badge (green=high, amber=medium, red=low)
  - Source list with snippets and metadata
  - Warning section (insufficient data)

**Key Behaviors:**
- Auto-fetch latest chat session on mount
- Message display includes: timestamp, user/assistant indicator, content
- RAG responses show source citations with confidence score
- Copy-to-clipboard for messages
- Delete message option (soft-delete with audit)

### Admin Pages (`frontend/web/src/pages/Admin/`)

**Pages:**
- `AdminDashboard.js` — admin overview: user count, system health, quick stats
- `AdminUsers.js` — user management (list, create, edit, delete)
- `AdminUserDetail.js` — user profile (roles, permissions, reset password)
- `AdminAnalytics.js` — detailed analytics (trends, top patients, revenue)
- `AdminSecurity.js` — security settings and audit logs
- `AdminSettings.js` — global system config (notifications, system health)
- `FormBuilder.js` — form template designer (create/edit custom forms)

### Shared Components

**Layout:**
- `Header.js` — top navigation, search bar, user menu
- `Sidebar.js` — left navigation drawer with role-based links
- `Layout.js` — page wrapper combining header/sidebar/breadcrumb

**Common Components:**
- `Toast.js` — notification provider and UI
- `Skeleton.js` — loading placeholders
- `EmptyState.js` — empty list state
- `ConfirmDialog.js` — confirmation modal
- `Breadcrumb.js` — breadcrumb navigation
- `StatCard.js` — KPI card component
- `SourceCitationPanel.js` — RAG source display

**Barrel Exports:**
- `components/common/index.js` — export all common components for easy import

### Styling

**CSS Organization:**
- Global: `index.css`, `styles/main.css`
- Per-component: `ComponentName.css` co-located
- CSS Modules: `SourceCitationPanel.module.css` (scoped styles)
- Variables: color palette, spacing, typography defined in Layout.css

---

## Frontend Mobile System

### Entry Point

**File:** `frontend/mobile/App.js` (Expo entry point)
- Initializes React Native app
- Registers screens and navigation

### Navigation Structure

**File:** `frontend/mobile/src/navigation/AppNavigator.js`

```
AppNavigator (Root)
├── Auth Stack
│   └── LoginScreen
└── App Stack
    ├── Dashboard Tab
    │   └── DashboardScreen
    ├── Patients Tab
    │   ├── PatientScreen (list)
    │   ├── PatientDetailScreen (detail)
    │   └── AddMedicalActScreen
    ├── Appointments Tab
    │   └── AppointmentsScreen
    ├── Analytics Tab
    │   └── AnalyticsScreen
    ├── Notifications Tab
    │   └── NotificationsScreen
    ├── Assistant Tab
    │   └── ChatAssistantScreen
    └── Settings Tab
        └── SettingsScreen
```

### Screen Components

**Login:**
- `LoginScreen.js` — username/password input, login button, auth token storage

**Dashboard:**
- `DashboardScreen.js` — similar KPIs to web (total patients, appointments, trends)

**Patients:**
- `PatientScreen.js` — patient list with search
- `PatientDetailScreen.js` — patient detail view (demographics, history, allergies)
- `AddMedicalActScreen.js` — quick form to add medical act for patient

**Appointments:**
- `AppointmentsScreen.js` — list upcoming appointments

**Analytics:**
- `AnalyticsScreen.js` — stats dashboard (not yet integrated with charts library)

**Notifications:**
- `NotificationsScreen.js` — notification list with read/delete actions

**Chat:**
- `ChatAssistantScreen.js` — chat interface (similar to web, but mobile-optimized)

**Settings:**
- `SettingsScreen.js` — profile, preferences, logout

### Shared Mobile Components

**Common:**
- `Card.js` — reusable card container
- `Input.js` — labeled text input with validation
- `PrimaryButton.js` — primary action button with loading state

**Navigation:**
- `MoreMenuItemButton.js` — item for "More" menu tab

### Design Tokens

**File:** `frontend/mobile/src/styles/theme.js`

Defines:
- Color palette (primary, secondary, danger, etc.)
- Spacing scale (padding, margins)
- Typography (fonts, sizes, weights)
- Border radius

### API Wrapper

**File:** `frontend/mobile/src/api/api.js`

- Axios instance configured for mobile backend URL (e.g., `http://192.168.1.199:8000/api`)
- All API endpoints mirrored from web frontend

### Known Limitations

- ⚠️ Analytics charts not yet implemented (needs react-native-chart-kit)
- ⚠️ Mobile admin features not yet implemented
- ⚠️ UI polish needed (emoji → icons, color consistency)
- ⚠️ Legacy components in `src/components/` not used by current navigator

---

## Data Models & Database

### Core Entities

**User**
```
- id (PK)
- username (unique)
- email (unique)
- password_hash (bcrypt)
- role (admin | doctor | department_head)
- is_active (boolean)
- created_at, updated_at
```

**Patient**
```
- id (PK)
- ipp_id (unique, clinic ID)
- first_name, last_name
- date_of_birth
- gender (M | F | Other)
- phone, email, address
- insurance_provider, insurance_number
- emergency_contact_name, emergency_contact_phone
- clinical_notes
- created_by (FK User)
- created_at, updated_at
```

**PatientAllergy**
```
- id (PK)
- patient_id (FK Patient)
- allergen (name)
- severity (mild | moderate | severe)
- onset_date
- notes
```

**Appointment**
```
- id (PK)
- patient_id (FK Patient)
- datetime_scheduled
- reason (text)
- status (pending | confirmed | completed | cancelled)
- doctor_id (FK User, optional)
- created_by (FK User)
- created_at, updated_at
```

**MedicalAct**
```
- id (PK)
- patient_id (FK Patient)
- act_date
- diagnosis (text)
- treatment (text)
- clinical_notes (text)
- doctor_id (FK User, required)
- documents (JSON list of file paths)
- linked_forms (JSON list of form IDs)
- staff_assigned (JSON list of staff user IDs)
- created_by (FK User)
- created_at, updated_at
```

**ActResult**
```
- id (PK)
- medical_act_id (FK MedicalAct)
- patient_id (FK Patient)
- test_name
- result_value
- units
- reference_min, reference_max
- abnormality_flag (normal | low | high | critical)
- test_date
- physician_interpretation
- created_at, updated_at
```

**ChatSession**
```
- id (PK)
- user_id (FK User)
- title (auto-generated from first message)
- created_at, updated_at
```

**ChatMessage**
```
- id (PK)
- session_id (FK ChatSession)
- role (user | assistant)
- content (text)
- model_name (e.g., "biomistral", "gemma4:e4b")
- token_count (int)
- created_at
```

**Notification**
```
- id (PK)
- recipient_id (FK User, null = broadcast)
- sender_id (FK User, null = system)
- title, message (text)
- category (appointment | alert | result | system)
- is_read (boolean)
- created_at, updated_at
```

**AuditLog**
```
- id (PK)
- user_id (FK User)
- action (create | update | delete | login | export)
- resource_type (patient | appointment | medical_act | etc.)
- resource_id (int)
- change_delta (JSON, before/after values)
- ip_address
- status (success | failure)
- timestamp
```

**RAGChunk (Phase 2)**
```
- id (PK)
- chunk_text
- source_type (patient | appointment | medical_act | lab_result)
- source_id (int)
- embedding (vector, 384 dims from sentence-transformers)
- created_at
```

### Database Migrations

Alembic handles schema versioning:
- `001_create_form_system.sql` — initial forms schema
- `002_seed_form_system_data.sql` — seed form definitions
- `003_create_*.sql` — rheumatology-specific forms
- `004_create_rag_tables.py` — RAG chunk and cache tables
- `add_chat_sessions_table.py` — chat history tables
- `b5add256af78_*.py` — data integrity fixes (datetime, FK constraints)

**Run migrations:**
```bash
cd backend
alembic upgrade head
```

---

## Core Features

### 1. Patient Management

**What it does:**
- Centralized patient record system with IPP ID, demographics, allergies
- Search/filter by name, ID, phone
- PDF dossier export with medical history

**Key Components:**
- Patient CRUD API
- Allergy tracking
- Patient service with auth checks

### 2. Appointment Scheduling

**What it does:**
- Calendar-based appointment system
- Status tracking (pending, confirmed, completed, cancelled)
- Doctor assignment (optional)

**Key Components:**
- Appointment router + model
- Calendar UI in web frontend
- Appointment queries by date, patient, doctor

### 3. Medical Acts & Procedures

**What it does:**
- Track procedures with:
  - Assigned doctor (required)
  - Diagnosis and treatment
  - Associated documents
  - Linked clinical forms
  - Related lab results

**Key Components:**
- MedicalAct model + router
- Dynamic form linking
- Document storage

### 4. Lab Results Management

**What it does:**
- Store lab test results tied to medical acts and patients
- Flag abnormal results (low, high, critical)
- Track test dates and reference ranges

**Key Components:**
- ActResult model + router
- Abnormality flags in RAG retrieval

### 5. Dynamic Forms System

**What it does:**
- Registry of clinical assessment forms (pain, rheumatology, general)
- Form responses linked to medical acts
- Extensible form templates

**Key Components:**
- form_system.py, additional_forms.py models
- Forms router for CRUD
- DynamicFormRenderer on web

### 6. AI Chat with RAG

**What it does:**
- Grounded medical Q&A using patient data
- Safe fallback when data insufficient
- Confidence scoring and source citations

**Key Components:**
- Ollama LLM backend (configurable model)
- Query classifier (intent detection)
- Structured retrievers (patient, appointment, medical act, lab result)
- Prompt builder with deterministic templates
- RAG orchestrator coordinating all steps

**Safety Features:**
- Authorization guard (user → patient access check)
- Insufficient-data fallback when fact count < threshold
- Confidence-based answer policies
- Source citation for transparency

### 7. Analytics & Reporting

**What it does:**
- KPI dashboard: patient count, appointment trends, revenue
- Admin analytics: user activity, system health
- Audit log retrieval and export

**Key Components:**
- Analytics service (aggregation queries)
- Admin endpoints
- Audit helper for logging

### 8. Audit Logging

**What it does:**
- Complete action trail: who, what, when, where (IP), why
- Soft-delete tracking (resources marked deleted, not removed)
- Compliance-ready export to CSV

**Key Components:**
- AuditLog model
- audit.py service helpers
- Audit log retrieval + export endpoints

### 9. Notifications

**What it does:**
- Personal notifications (appointment reminders, alerts)
- System broadcasts (announcements)
- Read/unread tracking

**Key Components:**
- Notification model
- Notification service (query, create, mark read)
- Notification router

### 10. PDF Export

**What it does:**
- Patient dossier PDF: demographics, allergies, emergency contact, medical history, lab results
- Medical act PDF: procedure details, diagnoses, treatments, assigned staff, billing

**Key Components:**
- PDF service using ReportLab
- API endpoints for dossier/act export

---

## API Endpoints

### Authentication
- `POST /api/auth/login` — login
- `POST /api/auth/signup` — register
- `GET /api/auth/me` — current user
- `GET /api/auth/doctors` — doctor list
- `POST /api/auth/admin/users` — admin: create user
- `GET /api/auth/admin/users` — admin: list users

### Patients
- `GET /api/patients/` — list/search
- `POST /api/patients/` — create
- `GET /api/patients/{id}` — detail
- `PUT /api/patients/{id}` — update
- `DELETE /api/patients/{id}` — delete
- `GET /api/patients/{id}/dossier/export` — PDF export

### Appointments
- `GET /api/appointments/` — list
- `POST /api/appointments/` — create
- `GET /api/appointments/today` — today's list
- `PUT /api/appointments/{id}` — update
- `DELETE /api/appointments/{id}` — delete

### Medical Acts
- `GET /api/medical-acts/` — list
- `POST /api/medical-acts/` — create
- `GET /api/medical-acts/{id}` — detail
- `PUT /api/medical-acts/{id}` — update
- `DELETE /api/medical-acts/{id}` — delete
- `POST /api/medical-acts/{id}/link-form` — attach form

### Lab Results
- `GET /api/act-results/` — list
- `POST /api/act-results/` — create
- `GET /api/act-results/patient/{id}` — patient's results
- `GET /api/act-results/act/{id}` — act's results
- `GET /api/act-results/{id}` — detail
- `PUT /api/act-results/{id}` — update
- `DELETE /api/act-results/{id}` — delete

### Forms
- `GET /api/forms/schemas` — list form templates
- `GET /api/forms/reference-data` — lookup data
- `POST /api/forms/` — create form response
- `GET /api/forms/{id}` — get response
- `PUT /api/forms/{id}` — update response

### Chat & RAG
- `POST /api/chat/` — plain chat
- `POST /api/chat/grounded` — RAG chat
- `GET /api/chat/sessions/` — list sessions
- `GET /api/chat/sessions/{id}/messages` — get history
- `POST /api/chat/sessions/` — new session

### Analytics
- `GET /api/analytics/summary` — KPI summary
- `GET /api/analytics/recent-activity` — activity feed
- `GET /api/analytics/admin-stats` — admin dashboard
- `GET /api/analytics/audit-logs` — audit log retrieval
- `GET /api/analytics/audit-logs/export` — audit export (CSV)
- `GET /api/analytics/settings` — system config
- `POST /api/analytics/broadcast` — send broadcast

### Notifications
- `GET /api/notifications/` — list
- `POST /api/notifications/` — create
- `POST /api/notifications/read/{id}` — mark read
- `DELETE /api/notifications/{id}` — delete

---

## Deployment & Configuration

### Local Development (Docker Compose)

**File:** `docker-compose.yml`

**Services:**
```yaml
backend:
  image: rhumatoai-backend
  ports: 8000
  environment:
    DATABASE_URL=mysql+pymysql://admin:changeme@db:3306/medical_ai
    OLLAMA_HOST=http://ollama:11434
    RAG_SEMANTIC_ENABLED=false

db:
  image: mysql:8
  ports: 3306
  environment:
    MYSQL_DATABASE=medical_ai
    MYSQL_USER=admin
    MYSQL_PASSWORD=changeme

web:
  image: rhumatoai-web
  ports: 3000
  environment:
    REACT_APP_API_URL=http://localhost:8000/api
```

**Start local stack:**
```bash
docker-compose up -d
```

### Environment Configuration

**Backend:** `backend/app/core/config.py`
```python
DATABASE_URL = "mysql+pymysql://user:pass@host:3306/db"
SECRET_KEY = "your-secret-key"
CORS_ORIGINS = ["http://localhost:3000"]
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_MODEL = "biomistral"  # or gemma4:e4b
RAG_SEMANTIC_ENABLED = false
```

**Web Frontend:** `frontend/web/.env`
```
REACT_APP_API_URL=http://localhost:8000/api
```

**Mobile Frontend:** `frontend/mobile/.env`
```
REACT_APP_API_URL=http://192.168.1.199:8000/api
```

### Running Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Web Frontend

```bash
cd frontend/web
npm install
npm start
# Opens http://localhost:3000
```

### Running Mobile Frontend

```bash
cd frontend/mobile
npm install
npm start
# Scan QR code with Expo Go app on mobile device
```

### Database Migrations

```bash
cd backend
alembic upgrade head  # apply migrations
alembic downgrade -1  # rollback last migration
```

### Create Admin User

```bash
cd backend
python scripts/setup_admin.py
# Creates admin user with username: admin, password: (prompted)
```

---

## Known Issues & Cleanup Candidates

### Files that do nothing or are obsolete

1. **Backend:**
   - `backend/app/models/llm.py#L138` — stray string literal `"15 souffre de quoi?"` at end of file (no runtime effect, should be removed)
   - `backend/app/__init__.py` and all `__init__.py` in packages — comment-only markers (Python 3.3+ doesn't require them, but they're harmless)

2. **Web Frontend:**
   - `frontend/web/src/pages/Dashboard/Dashboard.js` — older component; current router imports `DashboardPage`
   - `frontend/web/src/pages/Analytics/Analytics.js` — older component; current router imports `AnalyticsPage`
   - `frontend/web/src/pages/Notifications/Notifications.js` — older component; current router imports `NotificationsPage`
   - `frontend/web/src/pages/Patients/PatientPage.js` — older component; current router imports from `Patients` barrel
   - All index.js re-exports in pages (pure barrel files, can be cleaned to import directly)
   - `frontend/web/src/components/common/index.js` — barrel export (harmless but unnecessary)
   - **Unused images:** Most asset images in `frontend/web/src/assets/images/` except `logo.png` (app-logo, docker-removebg, fastapi-removebg, etc.)
   - **Unused favicon:** `frontend/web/src/assets/icons/favicon.png`

3. **Mobile Frontend:**
   - `frontend/mobile/src/components/Dashboard.js` — legacy component not used by current navigator
   - `frontend/mobile/src/components/Analytics.js` — legacy component
   - `frontend/mobile/src/components/Notifications.js` — legacy component
   - `frontend/mobile/src/components/PatientList.js` — legacy component

4. **Migrations:**
   - `backend/migrations/README` — Alembic boilerplate documentation
   - `backend/migrations/script.py.mako` — Alembic revision template

### Partially Implemented Features

- **File Upload:** Endpoints exist but UI incomplete on all surfaces
- **Mobile Analytics:** Screen exists but no chart library integrated
- **Mobile Admin Features:** Not implemented
- **RAG Phase 2:** Semantic search with Qdrant is implemented behind `RAG_SEMANTIC_ENABLED`; keep disabled locally until embeddings and Qdrant indexing are validated

### Test Coverage

- RAG tests use the current `app.chat.rag` paths and cover structured retrieval plus semantic-disabled/hybrid behavior
- No comprehensive integration tests for full user workflows

---

## Development Workflow

### Adding a New Patient Field

1. **Backend Model** (`backend/app/models/patient.py`)
   ```python
   class Patient:
       new_field = Column(String)
   ```

2. **Migration** (`backend/migrations/versions/`)
   ```bash
   cd backend
   alembic revision --autogenerate -m "add new_field to patient"
   alembic upgrade head
   ```

3. **API** (`backend/app/patients/router.py`)
   ```python
   patient.new_field = request.new_field
   db.commit()
   ```

4. **Web Frontend** (`frontend/web/src/pages/Patients/PatientForm.js`)
   ```jsx
   <input name="new_field" value={patient.new_field} onChange={handleChange} />
   ```

5. **Mobile Frontend** (`frontend/mobile/src/screens/Patients/PatientDetailScreen.js`)
   ```jsx
   <Text>{patient.new_field}</Text>
   ```

### Adding a New RAG Retriever

1. **Create Retriever** (`backend/app/chat/rag/retrievers/new_retriever.py`)
   ```python
   class NewRetriever:
       def retrieve(self, query, patient_id):
           return [{"text": "...", "score": 1.0}]
   ```

2. **Register in Orchestrator** (`backend/app/chat/rag/orchestrator.py`)
   ```python
   self.retrievers = [
       PatientRetriever(),
       NewRetriever(),  # Add here
       ...
   ]
   ```

3. **Update Prompt Builder** (`backend/app/chat/rag/retrievers/prompt_builder.py`)
   ```python
   # Add section for new retriever output
   ```

4. **Test** (`backend/tests/test_rag_*.py`)
   ```python
   # Add test cases for new retriever
   ```

### Deploying to Production

1. **Backup Database:**
   ```bash
   docker exec rhumatoai_db pg_dump -U user rhumatoai > backup.sql
   ```

2. **Build Docker Images:**
   ```bash
   docker build -t rhumatoai-backend backend/
   docker build -t rhumatoai-web frontend/web/
   ```

3. **Start Services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Run Migrations:**
   ```bash
   docker exec rhumatoai_backend alembic upgrade head
   ```

5. **Create Admin User:**
   ```bash
   docker exec -it rhumatoai_backend python scripts/setup_admin.py
   ```

6. **Verify Health:**
   - API: `curl http://localhost:8000/`
   - Web: Open `http://localhost:3000` in browser
   - Ollama: `curl http://localhost:11434/api/tags`

---

## Version History & Key Milestones

| Date | Milestone |
|------|-----------|
| Feb 2026 | Project kickoff; schema design |
| Mar 2026 | Auth, Patient CRUD, Appointments complete |
| Apr 10, 2026 | Lab Results (ActResults) API & frontend |
| Apr 24, 2026 | Backend forms system + RAG Phase 1 MVP |
| Apr 28, 2026 | RAG Phase 1 complete + test suite (15 scenarios, 9.5/10 code review score) |
| May 10, 2026 | System documentation; cleanup planning |
| May 2026 | RAG Phase 2 scaffolding added (Qdrant, embeddings, ingestion), disabled locally by default |
| July 2026 | Final testing, go-live preparation |

---

## Contact & Support

**Project Lead:** [Your Name]  
**Client:** CHU Ibn Rochd (Casablanca)  
**Git Repository:** (internal deployment)  
**Documentation:** This file (SYSTEM.md)

---

**Last Updated:** May 21, 2026
**Next Review:** After semantic/Qdrant validation
