"""SecureAI DevGuard Backend — Main Application Entrypoint

FastAPI server providing multi-agent orchestration, incident reporting bridge,
DevSecOps metrics, patch diff inspections, and administrator approval gates.
"""

import hashlib
import logging
import os
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
import shutil

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("secureai")

from database.db import init_db, AsyncSessionLocal
from database.models import AdminUser
from routers import incidents, analysis, deployment, admin, sse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize SQLite Database Tables
    logger.info("Initializing SecureAI DevGuard database...")
    await init_db()

    # 2. Seed Default Administrator Account
    admin_user = os.getenv("ADMIN_USERNAME", "admin")
    admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")
    
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(AdminUser).where(AdminUser.username == admin_user))
        if not res.scalar_one_or_none():
            admin = AdminUser(
                id=str(uuid.uuid4()),
                username=admin_user,
                password_hash=hashlib.sha256(admin_pass.encode()).hexdigest()
            )
            session.add(admin)
            await session.commit()
            logger.info(f"Default administrator account '{admin_user}' provisioned.")

    # 3. Synchronize StudentHub baseline source files from backup
    from engine.paths import get_studenthub_src_dir
    src_dir = get_studenthub_src_dir()
    backup_dir = src_dir / "backup"
    if backup_dir.exists():
        for bf in backup_dir.glob("*.py"):
            target = src_dir / bf.name
            shutil.copy2(str(bf), str(target))
        logger.info("StudentHub demonstration source modules restored from clean backup.")

    yield
    logger.info("SecureAI DevGuard server shutting down.")

app = FastAPI(
    title="SecureAI DevGuard Multi-Agent API",
    description="Automated Software Bug Detection, Repair, and Secure Deployment Engine",
    version="2.0.0",
    lifespan=lifespan
)

# Open CORS configuration for local demo connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route handlers (with /api and without in case of serverless rewrite stripping)
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents & Reporting"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Multi-Agent Analysis"])
app.include_router(deployment.router, prefix="/api/deployment", tags=["Secure Deployment"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin & Telemetry"])
app.include_router(sse.router, prefix="/api/events", tags=["Real-time SSE Events"])

app.include_router(incidents.router, prefix="/incidents", tags=["Incidents & Reporting"])
app.include_router(analysis.router, prefix="/analysis", tags=["Multi-Agent Analysis"])
app.include_router(deployment.router, prefix="/deployment", tags=["Secure Deployment"])
app.include_router(admin.router, prefix="/admin", tags=["Admin & Telemetry"])
app.include_router(sse.router, prefix="/events", tags=["Real-time SSE Events"])

@app.get("/")
@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SecureAI DevGuard Multi-Agent Engine",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
