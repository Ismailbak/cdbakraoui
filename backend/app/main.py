from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes, auth, patients, chat, analytics, notifications, appointments, medical_acts
from app.database import engine, Base
from app.models import user, patient, appointment, medical_act, notification, audit  # noqa: F401 - register models

app = FastAPI(
    title="Medical AI Assistant",
    description="Local AI for Rheumatology EHR",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:19006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(patients.router, prefix="/api/patients", tags=["patients"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(medical_acts.router, prefix="/api/medical-acts", tags=["medical-acts"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])


@app.on_event("startup")
def on_startup():
    import logging
    log = logging.getLogger("uvicorn.error")
    try:
        Base.metadata.create_all(bind=engine)
        log.info("Database tables created or already exist.")
    except Exception as e:
        log.error(
            "Database startup failed: %s. "
            "Check that MySQL is running and DATABASE_URL in .env is correct (user, password, host, database name).",
            e,
        )
        # Server still starts; API calls that need the DB will fail until the connection is fixed.


@app.get("/")
def root():
    return {"message": "Medical AI Assistant API"}

@app.get("/health")
def health():
    return {"status": "ok"}
