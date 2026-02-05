from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes, auth, patients, chat, analytics, notifications, appointments, medical_acts

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

@app.get("/")
def root():
    return {"message": "Medical AI Assistant API"}

@app.get("/health")
def health():
    return {"status": "ok"}
