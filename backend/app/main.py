from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import routes, auth, patients, chat, analytics, notifications, appointments, medical_acts, act_results
from app.database import engine, Base
from app.models import user, patient, appointment, medical_act, act_result, notification, audit  # noqa: F401 - register models
from app.models.chat_message import ChatMessage  # noqa: F401 - register model
from app.models.llm import llm
from app.utils.rate_limiting import setup_rate_limiting, get_rate_limiter
from pathlib import Path

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

# Setup rate limiting
limiter = setup_rate_limiting(app)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(patients.router, prefix="/api/patients", tags=["patients"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(medical_acts.router, prefix="/api/medical-acts", tags=["medical-acts"])
app.include_router(act_results.router, prefix="/api/act-results", tags=["act-results"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

# Serve static files (uploads)
uploads_dir = Path("data/uploads")
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


@app.on_event("startup")
def on_startup():
    import logging
    import threading
    log = logging.getLogger("uvicorn.error")
    try:
        Base.metadata.create_all(bind=engine)
        log.info("Database tables created or already exist.")
        
        # Run LLM health check in background — don't block startup
        def _check_llm():
            log.info("Checking AI Assistant (BioMistral via Ollama) in background...")
            if llm.load():
                log.info(f"✅ AI Assistant ready: {llm.model_name}")
            else:
                log.warning("⚠️ Ollama not responding at startup. Chat will still attempt connections on demand.")
        
        threading.Thread(target=_check_llm, daemon=True).start()
            
    except Exception as e:
        log.error(
            "Startup error: %s. "
            "Check that MySQL is running and DATABASE_URL in .env is correct (user, password, host, database name).",
            e,
        )


@app.get("/")
def root():
    return {"message": "Medical AI Assistant API"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "ai_assistant": "ready" if llm.is_available else "unavailable"
    }

