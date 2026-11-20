"""Administrator Authentication & Dashboard Metrics Router

Enforces RBAC on security-sensitive operations and computes DevSecOps operational metrics.
"""

import base64
import hashlib
import hmac
import json
import os
import time
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from database.models import AdminUser, IncidentReport, Deployment, AnalysisRun, RiskAssessment

load_dotenv()

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "secureai_supersecret_production_ready_key_2026_xyz")

def generate_admin_token(username: str) -> str:
    timestamp = str(int(time.time()))
    payload = f"{username}:{timestamp}"
    signature = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    raw = f"{payload}:{signature}"
    return base64.b64encode(raw.encode()).decode()

def verify_admin_token(token: str) -> str | None:
    try:
        raw = base64.b64decode(token.encode()).decode()
        parts = raw.split(":")
        if len(parts) != 3:
            return None
        username, timestamp, signature = parts[0], parts[1], parts[2]
        payload = f"{username}:{timestamp}"
        expected = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if hmac.compare_digest(signature, expected):
            # Check 24 hour expiration
            if int(time.time()) - int(timestamp) < 86400:
                return username
    except Exception:
        pass
    return None

class LoginPayload(BaseModel):
    username: str
    password: str

@router.post("/login")
async def admin_login(payload: LoginPayload):
    """Authenticate administrator credentials for privileged access to the Main AI Platform."""
    expected_user = os.getenv("ADMIN_USERNAME", "admin")
    expected_pass = os.getenv("ADMIN_PASSWORD", "admin123")
    
    if payload.username != expected_user or payload.password != expected_pass:
        raise HTTPException(status_code=401, detail="Invalid administrator credentials.")
        
    token = generate_admin_token(payload.username)
    return {
        "status": "success",
        "token": token,
        "username": payload.username,
        "role": "Platform Security Administrator",
        "expires_in": 86400
    }

@router.get("/pending")
async def get_pending_approvals(db: AsyncSession = Depends(get_db)):
    """Fetches all HIGH RISK incidents waiting in the administrator deployment gate."""
    res = await db.execute(
        select(IncidentReport)
        .where(IncidentReport.status == "awaiting_approval")
        .order_by(IncidentReport.created_at.desc())
    )
    incidents = res.scalars().all()
    
    out = []
    for inc in incidents:
        # Fetch risk assessment
        analysis_res = await db.execute(
            select(AnalysisRun)
            .where(AnalysisRun.incident_id == inc.id)
            .order_by(AnalysisRun.created_at.desc())
        )
        analysis = analysis_res.scalar_one_or_none()
        
        risk_data = {}
        bugs_data = []
        patches_data = []
        if analysis:
            if analysis.agent3_risk:
                risk_data = json.loads(analysis.agent3_risk)
            if analysis.agent2_bugs:
                bugs_data = json.loads(analysis.agent2_bugs)
            if analysis.agent2_patches:
                patches_data = json.loads(analysis.agent2_patches)
                
        out.append({
            "incident_id": inc.id,
            "human_id": inc.human_id,
            "title": inc.title,
            "affected_page": inc.affected_page,
            "status": inc.status,
            "created_at": inc.created_at.isoformat(),
            "risk_level": risk_data.get("risk_level", "HIGH RISK"),
            "risk_reason": risk_data.get("reason", "Awaiting manual review"),
            "risk_score": risk_data.get("score", 75),
            "factors": risk_data.get("factors", []),
            "bugs": bugs_data,
            "patches": patches_data,
            "primary_diff": patches_data[0].get("diff_text") if patches_data else ""
        })
    return out

@router.get("/stats")
async def get_platform_stats(db: AsyncSession = Depends(get_db)):
    """Computes real-time DevSecOps platform telemetry metrics."""
    # Total reports
    total_q = await db.execute(select(func.count(IncidentReport.id)))
    total_reports = total_q.scalar() or 0
    
    # Reports under analysis
    analyzing_q = await db.execute(
        select(func.count(IncidentReport.id)).where(IncidentReport.status.in_(["pending", "analyzing"]))
    )
    reports_under_analysis = analyzing_q.scalar() or 0
    
    # Pending approvals
    pending_q = await db.execute(
        select(func.count(IncidentReport.id)).where(IncidentReport.status == "awaiting_approval")
    )
    pending_approvals = pending_q.scalar() or 0
    
    # Deployments
    auto_dep_q = await db.execute(
        select(func.count(Deployment.id)).where(Deployment.status == "auto_deployed")
    )
    low_risk_deployments = auto_dep_q.scalar() or 0
    
    manual_dep_q = await db.execute(
        select(func.count(Deployment.id)).where(Deployment.status == "deployed")
    )
    manual_deployments = manual_dep_q.scalar() or 0
    
    rejected_q = await db.execute(
        select(func.count(Deployment.id)).where(Deployment.status == "rejected")
    )
    rejected_patches = rejected_q.scalar() or 0
    
    successful_deployments = low_risk_deployments + manual_deployments
    
    # Analyze runs for bugs detected and patches generated
    runs_q = await db.execute(select(AnalysisRun))
    runs = runs_q.scalars().all()
    
    total_bugs_detected = 0
    total_patches_generated = 0
    total_patches_validated = 0
    total_high_risk = 0
    
    for r in runs:
        if r.agent2_bugs:
            try:
                b = json.loads(r.agent2_bugs)
                total_bugs_detected += len(b)
            except Exception:
                pass
        if r.agent2_patches:
            try:
                p = json.loads(r.agent2_patches)
                total_patches_generated += len(p)
            except Exception:
                pass
        if r.validation_results:
            try:
                v = json.loads(r.validation_results)
                if v.get("overall_status") == "VALIDATED":
                    total_patches_validated += 1
            except Exception:
                pass
        if r.agent3_risk:
            try:
                rk = json.loads(r.agent3_risk)
                if rk.get("risk_level") == "HIGH RISK":
                    total_high_risk += 1
            except Exception:
                pass

    return {
        "total_reports": total_reports,
        "reports_under_analysis": reports_under_analysis,
        "bugs_detected": total_bugs_detected,
        "patches_generated": total_patches_generated,
        "patches_validated": total_patches_validated,
        "low_risk_deployments": low_risk_deployments,
        "high_risk_changes": total_high_risk,
        "pending_admin_approvals": pending_approvals,
        "successful_deployments": successful_deployments,
        "rejected_patches": rejected_patches
    }
