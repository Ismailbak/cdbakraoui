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
    - **medical_acts.py**: CRUD for medical acts and documents.
    - **notifications.py**: User notifications endpoints.
    - **patients.py**: CRUD for patient records.
    - **routes.py**: Root API router.
  - **models/**: SQLAlchemy models for DB tables:
    - **user.py**: User accounts and roles.
    - **patient.py**: Patient records (includes `date_of_birth` field; age is calculated dynamically).
    - **appointment.py**: Appointments (uses `datetime_scheduled` DateTime field for consolidated date/time).
    - **medical_act.py**: Medical acts and attached documents (uses `act_date` Date field; `amount` is Decimal(10,2) for currency precision).
    - **notification.py**: Notifications.
    - **audit.py**: Audit logs for actions.
    - **llm.py**: LLM (AI model) interface (stub).
    - **Note on Recent Schema Changes (April 10, 2026)**: Consolidated datetime fields, removed age column from patients (calculated dynamically), added `medical_act_staff` junction table for doctor assignments, added FK constraints for data integrity.
  - **services/**: Business logic and helpers:
    - **analytics_service.py**: Analytics calculations (queries use `act_date` for medical acts, `datetime_scheduled` for appointments).
    - **audit_service.py**: Audit logging.
    - **auth_service.py**: User authentication and password hashing.
    - **chat_service.py**: AI chat logic (calls LLM).
    - **notification_service.py**: Notification management.
    - **patient_service.py**: Patient CRUD, dynamic age calculation, and anonymization (stub).
    - **pdf_service.py**: Generates PDF reports for Medical Acts and Patient Dossiers (handles `datetime_scheduled` and `act_date` fields).
  - **utils/**: Utility functions:
    - **preprocessing.py**: Text cleaning, keyword extraction, anonymization.
    - **security.py**: Password hashing/verification.

**Backend Feature Coverage:**
- Core CRUD for patients, appointments, medical acts, users: **Implemented** ✅
- Authentication & role management: **Implemented** ✅
- Analytics: **Implemented** ✅ (Real-time aggregation of demographics, trends, financial stats with corrected date/datetime fields)
- AI chat assistant: **Stub** (LLM logic not fully implemented)
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
  - **styles/**: Global CSS styles.

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
| Backend      | CRUD (patients, etc.)  | Implemented    | April 14, 2026 | Schema corrected (act_date, datetime_scheduled, date_of_birth); Patient dossier export enhanced |
| Backend      | Analytics              | Implemented    | April 10, 2026 | Updated for consolidated datetime/date fields |
| Backend      | AI Chat                | Implemented    | April 10, 2026 | ✅ Working (BioMistral & Gemma4B tested; RAG system in development) |
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
| Mobile       | Medical Acts           | Implemented    | April 10, 2026 | ✅ act_date field, amount as Decimal(10,2) |
| Mobile       | Chat                   | Implemented    | April 4, 2026  | ✅ Ready to use |
| Mobile       | PDF Generation         | Implemented    | April 4, 2026  | ✅ Integrated |
| Mobile       | More Menu Component    | Implemented    | April 4, 2026  | ✅ New MoreMenuItemButton created |
| Web          | Admin Dashboard        | Implemented    | -              | -     |
| Web          | User Management        | Implemented    | -              | -     |
| Web          | Analytics              | Implemented    | -              | -     |
| Web          | Logs                   | Implemented    | -              | -     |
| Web          | Patient Management     | Implemented    | April 14, 2026 | Schema corrected, age calculated from date_of_birth, consolidated datetime, dossier export enhanced |
| Web          | Patient Dossier Export | Implemented    | April 14, 2026 | ✅ Fixed appointment_date field bug, added allergies, emergency contact, lab results, comprehensive PDF |
| Web          | Appointments           | Implemented    | April 10, 2026 | DateTime consolidated into datetime_scheduled field |
| Web          | Medical Acts           | Implemented    | April 10, 2026 | Column corrected (act_date), amount as Decimal(10,2) |
| Web          | Notifications          | Implemented    | April 10, 2026 | ✅ P2P & broadcast messaging with categories |
| Web          | Chat                   | Implemented    | April 14, 2026 | ✅ Enhanced with history dropdown, new chat button, feedback system (like/dislike), improved message cards |
| Web          | Chat Assistant UX      | Implemented    | April 14, 2026 | ✅ Doctor context in header, copy/regenerate/feedback buttons with proper hover visibility |
| Web          | PDF Generation         | Implemented    | April 14, 2026 | Updated for consolidated datetime/date fields; comprehensive dossier with all patient info |
| Web          | File Upload            | Not Impl.      | -              | -     |

---

**Legend:**
- **Implemented**: Feature is present and functional.
- **Partial/Stub**: Feature is present but incomplete or only a placeholder.
- **Not Impl.**: Feature is not present.

---

*This file is auto-generated. Please update if you add or remove files or features.*
