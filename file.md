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

- **Dockerfile**: Builds the backend API image using Python 3.11, installs dependencies, and runs the FastAPI app with Uvicorn.
- **requirements.txt**: Lists all Python dependencies for the backend (FastAPI, SQLAlchemy, transformers, etc.).
- **setup_admin.py**: Script to initialize or update the admin user in the database.
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
    - **patient.py**: Patient records.
    - **appointment.py**: Appointments.
    - **medical_act.py**: Medical acts and attached documents.
    - **notification.py**: Notifications.
    - **audit.py**: Audit logs for actions.
    - **llm.py**: LLM (AI model) interface (stub).
  - **services/**: Business logic and helpers:
    - **analytics_service.py**: Analytics calculations (stub).
    - **audit_service.py**: Audit logging.
    - **auth_service.py**: User authentication and password hashing.
    - **chat_service.py**: AI chat logic (calls LLM).
    - **notification_service.py**: Notification management (stub).
    - **patient_service.py**: Patient CRUD and anonymization (stub).
  - **utils/**: Utility functions:
    - **preprocessing.py**: Text cleaning, keyword extraction, anonymization.
    - **security.py**: Password hashing/verification.
  - **tests/**: Backend unit tests for API and services.

**Backend Feature Coverage:**
- Core CRUD for patients, appointments, medical acts, users: **Implemented**
- Authentication & role management: **Implemented**
- Analytics: **Implemented** (Real-time aggregation of demographics, trends, and financial stats)
- AI chat assistant: **Stub** (LLM logic not fully implemented)
- Notifications: **Implemented** (Manual peer-to-peer messaging, categories, sender visibility)
- Audit logging: **Implemented**
- PDF generation: **Implemented** (Medical Act reports and Patient Dossier)
- File/document upload: **Partial** (model exists, endpoints may be incomplete)

---

## Frontend (`frontend/`)

### Mobile (`frontend/mobile/`)
- **App.js**: Entry point for React Native app. Sets up navigation.
- **app.json**: Expo configuration for the mobile app.
- **package.json**: Lists dependencies and scripts for mobile app.
- **src/**: Source code for mobile app.
  - **api/**: API client (axios) for backend communication.
  - **components/**: UI components (Analytics, Dashboard, Notifications, PatientList).
  - **navigation/**: App navigation (stack navigator).
  - **screens/**: Screen components for each app section (Dashboard, Login, Patients, Analytics, Notifications).

**Mobile Feature Coverage:**
- Patient list, analytics, notifications, login: **Implemented**
- Appointments, medical acts, chat, PDF: **Not implemented**

### Web (`frontend/web/`)
- **Dockerfile**: Builds the web frontend image using Node.js.
- **package.json**: Lists dependencies and scripts for web app.
- **public/**: Static files (favicon, index.html).
- **scripts/**: Utility scripts (e.g., copy-favicon.js for favicon generation).
- **src/**: Source code for web app.
  - **api/**: API client (axios) for backend communication.
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

| Area         | Feature                | Status         |
|--------------|------------------------|----------------|
| Backend      | CRUD (patients, etc.)  | Implemented    |
| Backend      | Analytics              | Implemented    |
| Backend      | AI Chat                | Stub           |
| Backend      | Notifications          | Implemented    |
| Backend      | PDF Generation         | Implemented    |
| Backend      | File Upload            | Partial        |
| Mobile       | Patient List           | Implemented    |
| Mobile       | Analytics              | Implemented    |
| Mobile       | Notifications          | Implemented    |
| Mobile       | Appointments           | Not Impl.      |
| Mobile       | Medical Acts           | Not Impl.      |
| Mobile       | Chat                   | Not Impl.      |
| Web          | Admin Dashboard        | Implemented    |
| Web          | User Management        | Implemented    |
| Web          | Analytics              | Implemented    |
| Web          | Logs                   | Implemented    |
| Web          | Patient Management     | Implemented    |
| Web          | Appointments           | Implemented    |
| Web          | Medical Acts           | Implemented    |
| Web          | Notifications          | Implemented    |
| Web          | Chat                   | Implemented    |
| Web          | PDF Generation         | Implemented    |
| Web          | File Upload            | Not Impl.      |

---

**Legend:**
- **Implemented**: Feature is present and functional.
- **Partial/Stub**: Feature is present but incomplete or only a placeholder.
- **Not Impl.**: Feature is not present.

---

*This file is auto-generated. Please update if you add or remove files or features.*
