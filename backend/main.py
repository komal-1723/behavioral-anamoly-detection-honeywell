import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.config import settings
from backend.database import engine, Base, SessionLocal
from backend.models import User, TelemetryLog, SystemSetting
from backend.security import get_password_hash

# Routers
from backend.api import (
    auth_router,
    dashboard_router,
    telemetry_router,
    incidents_router,
    ml_router,
    simulation_router,
    reports_router,
    stream_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB Tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed admin user and default dataset on first startup
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "admin@cyber.sec").first()
        if not admin_user:
            admin = User(
                email="admin@cyber.sec",
                hashed_password=get_password_hash("admin123"),
                full_name="SOC Lead Administrator",
                role="Admin"
            )
            db.add(admin)
            
            analyst = User(
                email="analyst@cyber.sec",
                hashed_password=get_password_hash("analyst123"),
                full_name="Senior SOC Analyst",
                role="SOC_Analyst"
            )
            db.add(analyst)
            db.commit()
            print("[INFO] Created default seed users (admin@cyber.sec, analyst@cyber.sec).")

        # Check if telemetry logs exist, seed initial synthetic dataset if empty
        log_cnt = db.query(TelemetryLog).count()
        if log_cnt == 0:
            print("[INFO] Database empty. Seeding initial 500 synthetic access logs & baseline profiles...")
            from backend.engine.generator import generator_instance
            from backend.schemas import DataGenerationRequest
            from backend.api.telemetry_router import generate_synthetic_data

            generate_synthetic_data(DataGenerationRequest(count=500, anomaly_rate=0.04), db)
            print("[INFO] Initial dataset auto-seeded successfully!")

    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router.router, prefix=settings.API_V1_STR)
app.include_router(telemetry_router.router, prefix=settings.API_V1_STR)
app.include_router(incidents_router.router, prefix=settings.API_V1_STR)
app.include_router(ml_router.router, prefix=settings.API_V1_STR)
app.include_router(simulation_router.router, prefix=settings.API_V1_STR)
app.include_router(reports_router.router, prefix=settings.API_V1_STR)
app.include_router(stream_router.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
