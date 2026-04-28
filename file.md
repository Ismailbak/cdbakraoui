# File Reference for Medical AI Assistant Project

This document provides a detailed explanation of every file and directory in the project, including its purpose and whether all features are implemented or not. This is intended to help contributors, maintainers, and users understand the structure and completeness of the project.

---

## Root Directory

- **docker-compose.yml**: Orchestrates multi-container Docker applications. Defines services for backend (API), database (Postgres), and frontend (web). Ensures all components run together for local development or deployment.
- **readme.md**: Main project overview, features, and setup instructions.
- **data/**: Placeholder for persistent data (e.g., database files). Contains `.gitkeep` to ensure the directory exists in version control.
- **Diagrams/**: Contains system diagrams and visual documentation (e.g., class diagrams, system flow images).
- **Presentations/**: PowerPoint presentations related to the project (project defense, documentation, etc.).

---

## Backend (`backend/`)

- **.env**: Environment variables configuration.
- **Dockerfile**: Builds the backend API image using Python 3.11, installs dependencies, and runs the FastAPI app with Uvicorn.
- **requirements.txt**: Lists all Python dependencies for the backend (FastAPI, SQLAlchemy, transformers, etc.).
- **setup_admin.py**: Script to initialize or update the admin user in the database.
- **tests/**: Backend unit tests for API and services.
- **app/**: Main backend application code.
  - **__init__.py**: Marks the directory as a Python package.
  - **config.py**: Loads environment variables and settings (database URL, secret keys, etc.).
  - **database.py**: SQLAlchemy engine/session setup and DB connection utilities.
  - **main.py**: FastAPI entry point. Sets up routes, middleware, and database initialization.
  - **api/**: FastAPI routers for each API domain:
    - **analytics.py**: Endpoints for analytics and reporting.
    - **appointments.py**: CRUD for appointments.
    - **auth.py**: Authentication (login, token, user info).
    - **chat.py**: AI chat assistant endpoints.
    - **forms.py**: Dynamic form system endpoints (reference data, FormCsRd CRUD, form-to-act linking via ActForm bridge).
    - **medical_acts.py**: CRUD for medical acts and documents.
    - **notifications.py**: User notifications endpoints.
    - **patients.py**: CRUD for patient records.
    - **routes.py**: Root API router.
  - **models/**: SQLAlchemy models for DB tables:
    - **user.py**: User accounts and roles.
    - **patient.py**: Patient records (includes `date_of_birth` field; age is calculated dynamically).
    - **appointment.py**: Appointments (uses `datetime_scheduled` DateTime field for consolidated date/time).
    - **medical_act.py**: Medical acts and attached documents (uses `act_date` Date field; `amount` is Decimal(15,2) for higher financial precision).
    - **notification.py**: Notifications.
    - **audit.py**: Audit logs for actions.
    - **llm.py**: LLM (AI model) interface (stub).
    - **form_system.py**: Dynamic clinical form system models (RefCareType, RefActType, RefFormType, FormCsRd, ActForm bridge table). FormCsRd has 58+ fields for 7-tab rheumatology consultation form.
    - **Note on Recent Schema Changes (April 10, 2026)**: Consolidated datetime fields, removed age column from patients (calculated dynamically), added `medical_act_staff` junction table for doctor assignments, added FK constraints for data integrity.
    - **Note on Form System (April 17, 2026)**: Added comprehensive form system with reference data hierarchy (care types → act types → form types) and bridge table for linking forms to medical acts.
  - **services/**: Business logic and helpers:
    - **analytics_service.py**: Analytics calculations (queries use `act_date` for medical acts, `datetime_scheduled` for appointments).
    - **audit_service.py**: Audit logging.
    - **auth_service.py**: User authentication and password hashing.
    - **chat_service.py**: AI chat logic (calls LLM).
    - **rag_chat_service.py**: RAG integration layer for grounded chat responses (Phase 1).
    - **rag_orchestrator.py**: Central coordinator for entire RAG pipeline (query classification, retrieval, authorization, prompt building).
    - **retrievers/query_classifier.py**: Rule-based intent classification with IPP pattern matching.
    - **retrievers/structured_retriever.py**: Four ORM-based fact retrievers (Patient, Appointment, MedicalAct, ActResult).
    - **retrievers/prompt_builder.py**: Deterministic prompt assembly with versioned templates and evidence sections.
    - **notification_service.py**: Notification management.
    - **patient_service.py**: Patient CRUD, dynamic age calculation, authorization checks, and anonymization (stub).
    - **pdf_service.py**: Generates PDF reports for Medical Acts and Patient Dossiers (handles `datetime_scheduled` and `act_date` fields).
  - **utils/**: Utility functions:
    - **preprocessing.py**: Text cleaning, keyword extraction, anonymization.
    - **security.py**: Password hashing/verification.

**Backend Feature Coverage:**
- Core CRUD for patients, appointments, medical acts, users: **Implemented** ✅
- Authentication & role management: **Implemented** ✅
- Analytics: **Implemented** ✅ (Real-time aggregation of demographics, trends, financial stats with corrected date/datetime fields)
- AI chat assistant: **Implemented** ✅ (RAG pipeline with grounded retrieval; LLM adapter pending)
- Notifications: **Implemented** ✅ (Manual peer-to-peer messaging, categories, sender visibility)
- Audit logging: **Implemented** ✅
- PDF generation: **Implemented** ✅ (Medical Act reports and Patient Dossier with corrected field mappings)
- File/document upload: **Partial** (model exists, endpoints may be incomplete)
- **Database Schema Integrity**: **Implemented** ✅ (April 10, 2026: FK constraints, junction tables, consolidated datetime fields, dynamic age calculation)

---

## Frontend (`frontend/`)

### Mobile (`frontend/mobile/`)
- **App.js**: Entry point for React Native app. Sets up NavigationContainer.
- **app.json**: Expo configuration for the mobile app (SDK 54).
- **package.json**: Lists dependencies and scripts for mobile app.
- **src/**: Source code for mobile app.
  - **api/**: API client (axios) for backend communication.
    - **api.js**: Axios instance with AsyncStorage token interceptor. Endpoints for login, patients, analytics, and notifications.
  - **styles/**: Global design system.
    - **theme.js**: Centralized color palette, typography, spacing, shadows, and border radii tokens.
  - **components/**: UI components.
    - **Analytics.js**: Legacy analytics data component.
    - **Dashboard.js**: Legacy dashboard data component.
    - **Notifications.js**: Legacy notifications list component.
    - **PatientList.js**: Legacy patient list component.
    - **common/**: Reusable design-system primitives.
      - **Card.js**: KPI/data card with icon, accent color, and shadow elevation.
      - **PrimaryButton.js**: Styled button with loading spinner and outline variant.
      - **Input.js**: Text input with floating label, focus highlight, and error display.
  - **navigation/**: App navigation.
    - **AppNavigator.js**: Stack navigator (Login → Main) wrapping a Bottom Tab Navigator (Dashboard, Patients, Analytics, Notifications).
  - **screens/**: Screen components (fully redesigned and organized into feature directories).
    - **Login/**: `LoginScreen.js`
    - **Dashboard/**: `DashboardScreen.js`
    - **Analytics/**: `AnalyticsScreen.js`
    - **Patients/**: `PatientScreen.js`, `PatientDetailScreen.js`, `AddMedicalActScreen.js`
    - **Notifications/**: `NotificationsScreen.js`
    - **Appointments/**: `AppointmentsScreen.js`
    - **Assistant/**: `ChatAssistantScreen.js`
    - **Settings/**: `SettingsScreen.js`

**Mobile Feature Coverage:**
- Login & authentication: **Implemented** (with token storage)
- Dashboard with KPIs: **Implemented** (pull-to-refresh, responsive)
- Patient list & details: **Implemented** (avatar initials, medical history, stats)
- Analytics: **Implemented** (demographics, weekly activity, revenue)
- Notifications: **Implemented** (categories, unread badges, sender info)
- Bottom Tab Navigation & Stacks: **Implemented** (5 tabs + nested routing)
- Design System (theme, Card, Button, Input): **Implemented**
- Appointments & Medical Acts: **Implemented** (CRUD)
- AI Chat Assistant: **Implemented** (Chat UI with prompt suggestions)
- PDF Export: **Implemented** (Native Linking to backend dossier generation)
- User Settings: **Implemented** (Logout & metadata display)

### Web (`frontend/web/`)
- **Dockerfile**: Builds the web frontend image using Node.js.
- **package.json**: Lists dependencies and scripts for web app.
- **public/**: Static files (favicon, index.html).
- **scripts/**: Utility scripts (e.g., copy-favicon.js for favicon generation).
- **src/**: Source code for web app.
  - **App.js** / **index.js**: Entry point and main app routing.
  - **api/**: API client (axios) for backend communication.
  - **assets/**: Images and other static assets.
  - **components/**: UI components (cards, common, layout).
  - **pages/**: Page components for each app section (Admin, Analytics, Appointments, Assistant, Dashboard, Legal, Login, MedicalActs, Notifications, Patients, Profile, Signup).
    - **MedicalActs/**: Medical acts pages including:
      - **MedicalActsPage.js**: Medical acts list with clinical availability tags and simplified price display. Includes a detail modal that fetches and maps comprehensive clinical data (Douleur, Echo, DXA, etc.).
      - **MedicalActForm.js**: 6-step workflow for creating/editing acts. Fixed critical bug to correctly link all clinical form types (not just RD) and improved data mapping for edit mode.
      - **FormCsRd.js**: 7-tab clinical form component for rheumatology consultation (Traitement, Signes, Examen, Biologie, Imagerie, Diagnostic, Conduite).
  - **styles/**: Global CSS styles.
  - **Note on Form System (April 17, 2026)**: Complete form integration with FormCsRd component, form-to-act linking, and data display in act details modal.

**Web Feature Coverage:**
- Admin dashboard, user management, analytics, logs, settings: **Implemented**
- Patient management, appointments, medical acts, notifications: **Implemented**
- AI chat assistant: **Implemented**
- PDF generation: **Implemented** (Medical Act reports and Patient Dossier)
- File/document upload: **Not implemented**

---

## Summary Table

| Area         | Feature                | Status         | Last Updated   | Notes |
|--------------|------------------------|----------------|----------------|-------|
| Backend      | CRUD (patients, etc.)  | Implemented    | April 22, 2026 | Schema corrected (act_date, datetime_scheduled, date_of_birth); Amount precision increased to Decimal(15,2) |
| Backend      | Form System (FormCsRd) | Implemented    | April 22, 2026 | ✅ 7-tab clinical form; expanded enrichment logic to include all form types in medical acts |
| Backend      | Analytics              | Implemented    | April 10, 2026 | Updated for consolidated datetime/date fields |
| Backend      | AI Chat (RAG Phase 1)  | Implemented    | April 28, 2026 | ✅ Phase 1 complete: structured retrieval (4 sources), query classification, grounded prompts, citations; 28/28 tests passing |
| Backend      | Notifications          | Implemented    | April 10, 2026 | ✅ Peer-to-peer and broadcast messaging |
| Backend      | PDF Generation         | Implemented    | April 14, 2026 | Enhanced dossier export with allergies, emergency contact, lab results, medical notes |
| Backend      | File Upload            | Partial        | -              | -     |
| Mobile       | Login & Auth           | Implemented    | April 4, 2026  | ✅ Emoji → Feather icon |
| Mobile       | Dashboard (KPIs)       | Implemented    | April 4, 2026  | ✅ Cleaned up, fixed white boxes |
| Mobile       | Patient List           | Implemented    | April 4, 2026  | ✅ getInitials bug fixed |
| Mobile       | Analytics              | Implemented    | -              | -     |
| Mobile       | Notifications          | Implemented    | April 10, 2026 | ✅ P2P & broadcast messaging with categories |
| Mobile       | Design System          | Implemented    | April 4, 2026  | ✅ Complete theme tokens |
| Mobile       | Bottom Tab Nav         | Implemented    | April 4, 2026  | ✅ Larger (80px), centered Assistant, improved icons |
| Mobile       | Appointments           | Implemented    | April 10, 2026 | ✅ DateTime consolidated into datetime_scheduled |
| Mobile       | Medical Acts           | Implemented    | April 22, 2026 | ✅ act_date field, amount as Decimal(15,2) |
| Mobile       | Chat                   | Implemented    | April 4, 2026  | ✅ Ready to use |
| Mobile       | PDF Generation         | Implemented    | April 4, 2026  | ✅ Integrated |
| Mobile       | More Menu Component    | Implemented    | April 4, 2026  | ✅ New MoreMenuItemButton created |
| Web          | Admin Dashboard        | Implemented    | -              | -     |
| Web          | User Management        | Implemented    | -              | -     |
| Web          | Analytics              | Implemented    | -              | -     |
| Web          | Logs                   | Implemented    | -              | -     |
| Web          | Patient Management     | Implemented    | April 14, 2026 | ✅ Dynamic pagination (15/page), header search (API integrated), age calculated from date_of_birth |
| Web          | Patient Search         | Implemented    | April 14, 2026 | ✅ Real-time search across patients, appointments, medical acts; age display in results |
| Web          | Patient Pagination     | Implemented    | April 14, 2026 | ✅ 15 items/page, teal gradient active state, dynamic page buttons |
| Web          | Patient Dossier Export | Implemented    | April 14, 2026 | ✅ Fixed appointment_date field bug, added allergies, emergency contact, lab results, comprehensive PDF |
| Web          | Appointments           | Implemented    | April 15, 2026 | ✅ Fixed datetime_scheduled format (ISO), confirm/cancel/edit all working without 422 errors |
| Web          | Appointment Edit       | Implemented    | April 15, 2026 | ✅ Pre-filled form modal, uses AppointmentForm component, patient name display corrected |
| Web          | Calendar Day Click     | Implemented    | April 15, 2026 | ✅ Click any day in calendar grid to create appointment with pre-filled date; view existing appointments in modal |
| Web          | Calendar Appointment Creation | Implemented | April 15, 2026 | ✅ Modal integration with AppointmentForm; toggle between view/form modes; "Ajouter un rendez-vous" button |
| Web          | Medical Acts           | Implemented    | April 22, 2026 | ✅ Simplified UI (text-based prices, no green boxes); clinical availability tags (📋) added to list |
| Web          | Medical Acts Form      | Implemented    | April 22, 2026 | ✅ Fixed form-to-act linking bug for all form types; improved edit mode initialization |
| Web          | Medical Acts PDF       | Implemented    | April 15, 2026 | ✅ Complete rewrite with lab results section, black text, comprehensive None handling; includes diagnostics, treatments, lab results with table (date, analysis, value, unit, status), and notes |
| Web          | FormCsRd Component     | Implemented    | April 17, 2026 | ✅ 7-tab clinical form (Treatment, Signs, Exam, Labs, Imaging, Diagnosis, Plan); auto-save on tab change |
| Web          | Form Linking to Acts   | Implemented    | April 17, 2026 | ✅ MedicalActForm integrates form creation; LinkFormToAct connects to ActForm bridge table |
| Web          | Form Data Display      | Implemented    | April 22, 2026 | ✅ Expanded labels for all forms (Douleur, Echo, DXA, etc.); handles JSON/Array fields in details view |
| Web          | Medical Acts Diagnostics Spacing | Implemented | April 15, 2026 | ✅ Flex layout with 24px gap for better readability of diagnostics and treatment information |
| Web          | Notifications          | Implemented    | April 10, 2026 | ✅ P2P & broadcast messaging with categories |
| Web          | Chat                   | Implemented    | April 14, 2026 | ✅ Language selector removed; AI auto-detects; doctor last_name shown in header (uppercase) |
| Web          | Chat History           | Implemented    | April 14, 2026 | ✅ History dropdown functional; recent conversations with date grouping and previews |
| Web          | Chat Assistant UX      | Implemented    | April 14, 2026 | ✅ Doctor context in header, copy/regenerate/feedback buttons with proper hover visibility |
| Web          | PDF Generation         | Implemented    | April 15, 2026 | ✅ Enhanced medical acts PDF service: lab results table integration, professional black text, robust None value handling |
| Web          | File Upload            | Not Impl.      | -              | -     |
| Backend      | RAG Query Classifier   | Implemented    | April 28, 2026 | ✅ Rule-based intent detection; 3/3 tests passing |
| Backend      | RAG Structured Retrieval | Implemented    | April 28, 2026 | ✅ Four ORM-based retrievers; 4/4 retriever tests passing |
| Backend      | RAG Prompt Builder     | Implemented    | April 28, 2026 | ✅ Versioned (v0.1) templates; 3/3 tests passing |
| Backend      | RAG Orchestrator       | Implemented    | April 28, 2026 | ✅ Central coordinator with authorization; 3/3 tests passing |
| Backend      | RAG Tests (Full Suite) | Implemented    | April 28, 2026 | ✅ 28/28 tests passing (13 unit + 15 evaluation) |
| Frontend     | SourceCitationPanel    | Implemented    | April 28, 2026 | ✅ Expandable citations, confidence badges, dark mode, accessibility |

---

**Legend:**
- **Implemented**: Feature is present and functional.
- **Partial/Stub**: Feature is present but incomplete or only a placeholder.
- **Not Impl.**: Feature is not present.

---

*This file is auto-generated. Please update if you add or remove files or features.*
