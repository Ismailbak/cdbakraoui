
# RhumatoAI: Full-Stack Medical AI Assistant 🏥

**Designed and implemented a full-stack clinical AI system supporting 20+ doctors, with on-prem LLM inference (BioMistral via Ollama), FastAPI backend, React/React Native frontends, and MySQL database. Achieves ~2–5s response latency under typical clinic concurrency on local hardware. Supports on-prem deployment aligned with healthcare data sovereignty requirements.**

*Target: Rheumatology clinic (CHU Ibn Rochd, Casablanca) | Feb–July 2026*

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├────────────────────────┬────────────────────────────────────────┤
│  React Web (Port 3000) │  React Native Mobile (via LAN)        │
│  - Dashboard           │  - Dashboard (KPIs)                    │
│  - Patient Mgmt        │  - Patient List & Details              │
│  - Medical Acts        │  - Appointments & Medical Acts         │
│  - Chat Assistant      │  - Chat Assistant                      │
│  - Analytics           │  - Notifications                       │
│  - Admin Panel         │  - PDF Export (native linking)         │
│  (Recharts, React Router)  │  (Async Storage, Feather icons)   │
└────────────────────────┴────────────────────────────────────────┘
                             ↕ (HTTPS/JWT Auth)
┌─────────────────────────────────────────────────────────────────┐
│                     API LAYER (FastAPI)                         │
├─────────────────────────────────────────────────────────────────┤
│  Routes: /api/auth, /api/patients, /api/appointments,           │
│          /api/medical-acts, /api/notifications, /api/chat,      │
│          /api/analytics, /api/audit                             │
│  - JWT token validation (HS256)                                 │
│  - Pydantic request/response validation                         │
│  - Role-based access (admin, doctor, dept_head)                 │
│  - Audit logging on all write operations                        │
└─────────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Services:                                                      │
│  - chat_service.py: LLM integration (Ollama → BioMistral)       │
│  - patient_service.py: Patient CRUD & history                   │
│  - auth_service.py: JWT generation & password hashing (bcrypt)  │
│  - pdf_service.py: ReportLab PDF generation                     │
│  - analytics_service.py: Revenue/demographic aggregation        │
│  - notification_service.py: P2P messaging                       │
│  - audit_service.py: Action logging                             │
└─────────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (ORM)                             │
├─────────────────────────────────────────────────────────────────┤
│  SQLAlchemy models:                                             │
│  - User (role-based), Patient (IPP ID), Appointment, MedicalAct │
│  - Notification, AuditLog, ChatHistory                          │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
                             ↕
         MySQL 8 (Internal LAN Only)
         Volume: mysql_data
```

---

## ⚙️ Tech Stack

### Backend
- **Framework**: FastAPI (async Python)
- **Database**: MySQL 8, SQLAlchemy ORM
- **Auth**: JWT (HS256), bcrypt password hashing
- **LLM**: Ollama (local container) + BioMistral model
- **PDF**: ReportLab (medical acts, patient dossiers)
- **Validation**: Pydantic v2
- **Server**: Uvicorn (ASGI)

### Frontend Web
- **Framework**: React 18 + React Router v6
- **Analytics Chart**: Recharts
- **HTTP Client**: Axios with interceptors (JWT token refresh)
- **Styling**: Custom CSS with glass morphism, gradients, cubic-bezier animations
- **Icons**: React Icons (Feather), HeroIcons
- **Build**: Create React App / Vite-compatible

### Frontend Mobile
- **Framework**: React Native (Expo 54)
- **Storage**: AsyncStorage (persistent token/session)
- **Navigation**: React Navigation (Stack + Bottom Tab)
- **HTTP Client**: Axios (same auth interceptors as web)
- **Icons**: Feather icons via react-native-feather
- **Theme**: Centralized design system (colors, typography, spacing)

### Infrastructure
- **Orchestration**: Docker Compose (backend, db, optional Qdrant, frontend)
- **Deployment**: Local / On-Premise only (GDPR data sovereignty)
- **Networking**: Internal LAN only (database port 3306 not exposed to public internet)

---

## 🖼️ Visuals

Add screenshots for credibility and quick scanning:

- Web dashboard
- Patient management
- Chat assistant (grounded response + citations)
- Medical act form
- Mobile app home + assistant
- PDF export preview

![App general diagram](Diagrams/App%20general%20diagram.png)

---

---

### AI & LLM Development
- **Clinical Chat Assistant**: Operational on web and mobile.
- **LLM Model Evaluation**: Ongoing comparison of BioMistral vs Gemma for clinical workflows.
- **RAG (Structured, Phase 1)**: ✅ Live and grounded
  - Explicit IPP and full-name matching with ambiguity guardrails
  - Patient context carryover for follow-up questions
  - Multi-source retrieval: patients, appointments, medical acts, lab results
  - Deterministic prompts with evidence sections and citations
  - General medical mode when no patient context exists
  - Clean user-facing responses (no internal IDs)
- **RAG (Semantic, Phase 2)**: Implemented behind a feature flag, disabled locally by default (`RAG_SEMANTIC_ENABLED=false`) because embedding model loading can be memory-heavy. Keep using structured RAG unless semantic search is explicitly re-enabled.

### Deployment & Infrastructure
- **Proxmox VM Deployment**: Complete application stack being deployed on dedicated Proxmox virtual machine with resources provisioned for LLM inference engine.
- **Mobile Demo Ready**: React Native mobile application (Expo 54) fully functional and ready for clinic demonstrations.
- **Security Testing**: Continuous security testing throughout deployment phase covering JWT authentication, role-based access, audit logging, and GDPR compliance.

### Notifications
- **Peer-to-Peer & Broadcast Messaging**: Notification system supports both direct staff-to-staff messaging and general broadcast announcements to clinic users.
- **Implemented on All Platforms**: Consistent notification delivery across web and mobile interfaces.

---

## 🧠 System Design Decisions

### 1. **Local-First Deployment (Data Sovereignty)**
**Decision**: No cloud hosting, entirely on-premise.  
**Why**: GDPR/CNIL compliance for patient PII in Morocco. Hospital controls all infrastructure.  
**Tradeoff**: Lose auto-scaling and global CDN, gain data ownership and zero external dependencies.

### 2. **JWT Stateless Auth (No Session Server)**
**Decision**: JWT tokens stored in browser/AsyncStorage, no session table.  
**Why**: Reduces backend state complexity, easier to scale if needed, works fine for 10-20 concurrent users.  
**Tradeoff**: Token revocation requires blacklist (not implemented yet). Token theft = access until expiry.

### 3. **Synchronous LLM Inference (No Queue)**
**Decision**: Chat requests block until BioMistral returns (2-5s typical).  
**Why**: Simple UX (users wait, see response stream), no job queue infrastructure needed.  
**Tradeoff**: Concurrent requests serialize. Slow inference blocks API. Fix: Add Celery/Redis if >50 concurrent users.

### 4. **SQLAlchemy + Pydantic (No GraphQL)**
**Decision**: RESTful API with Pydantic models for validation.  
**Why**: Simpler than GraphQL for CRUD-heavy medical app, easier for mobile HTTP clients.  
**Tradeoff**: No overfetching prevention, but dataset sizes are small per request anyway.

### 5. **ReportLab for PDF (No Headless Browser)**
**Decision**: Programmatic PDF generation instead of HTML→PDF conversion.  
**Why**: ~500ms per PDF (fast), no browser dependency, full control of layout.  
**Tradeoff**: More code for formatting, harder to change layouts. But medical docs are template-heavy.

### 6. **React Native + React Web (Code Duplication)**
**Decision**: Separate codebases for web and mobile (different DX, platforms).  
**Why**: Mobile needs native feel (Bottom Tab Nav, AsyncStorage), web needs full browser APIs.  
**Tradeoff**: Business logic duplicated (auth, API calls). Fix: Extract to shared TS library (future).

### 7. **Structured RAG First, Semantic RAG Optional**
**Decision**: Structured RAG is the default path; semantic/Qdrant retrieval is available but disabled locally.
**Why**: Current clinical questions are served reliably from MySQL records while avoiding local embedding memory pressure.
**Tradeoff**: Fuzzy search across unstructured notes and PDFs remains limited until semantic search is deliberately enabled and indexed.

---

## ⚠️ Engineering Challenges

### 1. **GDPR Audit Trail Complexity**
**Problem**: Every action (GET, POST, DELETE) must log user, timestamp, IP, role, result.  
**Impact**: Audit table grows 10x faster than business data.  
**Solution**: Implemented AuditLog model with comprehensive tracking. Pre-compute analytics queries instead of scanning audit logs.

### 2. **LLM Latency Under Concurrent Load**
**Problem**: BioMistral runs in single container. 5 concurrent requests = 25s wait for last user.  
**Impact**: Mobile users see 5-10s spinners under clinic-wide usage.  
**Solution**: (In progress) Add async queue + streaming responses. Consider splitting LLM across multiple instances.

### 3. **Mobile Multi-Role Access Control**
**Problem**: Admin features (user mgmt, audit logs) look wrong on small screens. Role permissions not enforced in UI.  
**Impact**: Mobile shows incomplete/broken admin panel.  
**Solution**: Hide admin screens on mobile, restrict to web. Role checks added to API endpoints.

### 4. **PDF Generation Bottleneck**
**Problem**: Generating 100-page patient dossier takes 2-3s per request.  
**Impact**: Slow exports, blocks API if multiple users export simultaneously.  
**Solution**: Implement async PDF generation + background job queue (future).

### 5. **Chat History Message Pairing (FIXED April 8)**
**Problem**: Initial implementation used `concat()` instead of `flatMap()`, causing duplicate messages and chronological disorder.  
**Impact**: Chat history showed garbled conversations, tokens counts incorrect.  
**Solution**: Changed to `.flatMap()` to properly pair user/assistant messages. Added tokens_used and model fields to ChatHistoryItem.

### 6. **Breadcrumb Duplication on Patient Pages (FIXED April 8)**
**Problem**: Both Layout.js auto-breadcrumb AND PatientDetailPage explicit breadcrumb rendering simultaneously.  
**Impact**: Two breadcrumb lines showing patient ID + name redundantly.  
**Solution**: Added regex check in Layout.js to skip auto-breadcrumb on `/patients/[id]` pattern. PatientDetailPage renders explicit breadcrumb with patient name.

---

## 📊 Performance & Scale

### Real-World Numbers (As of April 10, 2026)

| Metric | Value | Notes |
|--------|-------|-------|
| **Concurrent Users** | 10–20 | Tested in clinic environment |
| **Chat Response Latency** | 2–5s | BioMistral on-device inference |
| **Patient Load Latency** | 50–200ms | MySQL query + JSON serialization |
| **PDF Generation Time** | 500ms–3s | Depends on dossier length (single-threaded) |
| **Database Size** | ~50MB | 100 patients + 1000 appointments + 2000 medical acts |
| **API Memory Usage** | ~400MB | FastAPI + SQLAlchemy session pool |
| **LLM Memory Usage** | ~8GB | BioMistral model loaded in Ollama container |
| **Chat History Growth** | ~500 messages/month | Per clinic, not problematic |
| **Total Docker Stack** | 12–16GB RAM required | Backend + MySQL + Ollama |

### Bottlenecks Identified

1. **Chat serialization** — Single LLM instance, requests queue serially
2. **PDF generation** — Synchronous, blocks API worker
3. **Analytics queries** — No caching, recomputed per request
4. **Patient history fetch** — Returns full record, not paginated

### Scalability Path

| Cap | Current | Fix | Timeline |
|-----|---------|-----|----------|
| **50 users** | ⚠️ LLM queue | Add async queue + streaming | Q3 2026 |
| **200 patients** | ✅ Fine | None (DB scales) | N/A |
| **10,000 patients** | ❌ Search slow | Enable/index Qdrant semantic search | Post-July 2026 |

---



## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for frontend builds)
- Git

### Quick Start

```bash
# 1. Clone repo
git clone <repo> && cd IA-medical

# 2. Start all services
docker-compose up --build

# 3. Backend init (optional: create admin user)
docker exec -it backend python setup_admin.py

# 4. Access
# Web: http://localhost:3000
# API: http://localhost:8000/docs (Swagger)
# Mobile: connect to http://<LOCAL_NETWORK_IP>:8000 (replace with your LAN IP)
```


---

## 📋 Implementation Status

| Feature | Status | Last Updated |
|---------|--------|--------------|
| Patient CRUD | ✅ Implemented | April 10, 2026 |
| Appointments | ✅ Implemented | April 10, 2026 |
| Medical Acts (+ PDF) | ✅ Implemented | April 10, 2026 |
| Auth (JWT + roles) | ✅ Implemented | — |
| Audit Logging | ✅ Implemented | — |
| Chat (LLM + structured RAG) | ✅ Implemented | May 21, 2026 |
| Grounded chat (sources, IPP detect) | ✅ Implemented | May 21, 2026 |
| Analytics | ✅ Implemented | April 10, 2026 |
| Notifications | ✅ Implemented (P2P + Broadcast) | April 10, 2026 |
| Web UI | ✅ Production Ready | April 10, 2026 |
| Mobile UI | ✅ Demo Ready | April 10, 2026 |
| File Upload | ⚠️ Partial | — |
| CI/CD Pipeline | ❌ None | — |
| Load Testing | ❌ None | — |

---

## 🔧 Known Limitations & Future Improvements

- **RAG Phase 2** (Available, disabled locally): Semantic retrieval code, Qdrant integration, ingestion helpers, and chunk metadata exist, but local runtime defaults to `RAG_SEMANTIC_ENABLED=false`.
- **LLM Model Selection** (In Progress): Ongoing comparison of BioMistral vs Gemma.
- **No multi-agent reasoning** (single LLM instance; async queue planned for Q3 2026)
- **No active vector search locally** (structured RAG remains the default until semantic search is requested)
- **No background job queue** (async tasks planned for scaling phase)

---

## 🔐 Security & Compliance Notes

- JWT auth with role-based access (admin, doctor, dept_head)
- Password hashing via bcrypt
- Authorization checks before any patient-bound retrieval
- Audit logging on write operations
- CORS configured for web/mobile clients
- Deployment designed for on-prem, internal LAN

---

## 🧪 Testing

- **Backend**: pytest suite with structured RAG, hybrid gating, and evaluation tests
- **Coverage**: `42 passed` locally; RAG tests cover structured retrieval, hybrid gating, and semantic-disabled behavior
- **Web**: `npm run build` succeeds after assistant/dashboard updates

---


## 🗓️ Development Timeline (High-Level)

- **Feb–Apr 2026**: Core CRUD, auth, analytics, PDF generation
- **Apr–May 2026**: RAG Phase 1 (structured retrieval, grounded prompts)
- **May 2026**: RAG Phase 2 scaffolding (Qdrant, ingestion, embeddings) added but disabled locally by default
- **May 21, 2026**: Assistant chat UX (scrollable history, short titles, auto-growing composer), patient context carryover for follow-ups, dashboard activity name fix

---

*Developed Feb–July 2026 | CHU Ibn Rochd, Casablanca*  