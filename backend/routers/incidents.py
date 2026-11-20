"""Incident Reporting API Router

Bridge between user-facing StudentHub and the internal Multi-Agent DevSecOps system.
"""

import json
import random
import uuid
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from database.models import IncidentReport, AuditLog
from engine.orchestrator import run_analysis_pipeline, reset_studenthub_src_to_backup

router = APIRouter()

class IncidentSubmission(BaseModel):
    title: str
    description: str
    affected_page: str
    expected_behavior: str
    actual_behavior: str
    screenshot_url: str | None = None

@router.post("/report")
async def report_problem(
    payload: IncidentSubmission,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """StudentHub problem report submission endpoint.
    
    Returns ONLY neutral user confirmation with report ID.
    Zero internal AI or architectural metadata is exposed here.
    """
    incident_id = str(uuid.uuid4())
    # Human readable identifier like SH-1024
    human_id = f"SH-{random.randint(1000, 9999)}"
    
    incident = IncidentReport(
        id=incident_id,
        human_id=human_id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        affected_page=payload.affected_page.strip(),
        expected_behavior=payload.expected_behavior.strip(),
        actual_behavior=payload.actual_behavior.strip(),
        screenshot_url=payload.screenshot_url,
        status="pending"
    )
    db.add(incident)
    
    audit = AuditLog(
        id=str(uuid.uuid4()),
        incident_id=incident_id,
        event_type="INCIDENT_SUBMITTED_FROM_STUDENTHUB",
        event_data=json.dumps({
            "human_id": human_id,
            "title": payload.title,
            "affected_page": payload.affected_page
        })
    )
    db.add(audit)
    await db.commit()
    
    # Trigger multi-agent pipeline asynchronously in the background
    background_tasks.add_task(run_analysis_pipeline, incident_id)
    
    return {
        "status": "success",
        "human_id": human_id,
        "incident_id": incident_id,
        "message": f"Problem submitted successfully. Report ID: {human_id}. Our support team will review your problem."
    }

@router.get("/")
async def list_incidents(db: AsyncSession = Depends(get_db)):
    """List all submitted incidents for the Main AI Platform dashboard."""
    res = await db.execute(select(IncidentReport).order_by(IncidentReport.created_at.desc()))
    items = res.scalars().all()
    return [
        {
            "id": i.id,
            "human_id": i.human_id,
            "title": i.title,
            "description": i.description,
            "affected_page": i.affected_page,
            "expected_behavior": i.expected_behavior,
            "actual_behavior": i.actual_behavior,
            "status": i.status,
            "created_at": i.created_at.isoformat(),
            "updated_at": i.updated_at.isoformat()
        }
        for i in items
    ]

@router.get("/{incident_id}")
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Get single incident detail."""
    res = await db.execute(select(IncidentReport).where(IncidentReport.id == incident_id))
    item = res.scalar_one_or_none()
    if not item:
        # Also check by human_id
        res2 = await db.execute(select(IncidentReport).where(IncidentReport.human_id == incident_id))
        item = res2.scalar_one_or_none()
        if not item:
            raise HTTPException(status_code=404, detail="Incident report not found")
            
    return {
        "id": item.id,
        "human_id": item.human_id,
        "title": item.title,
        "description": item.description,
        "affected_page": item.affected_page,
        "expected_behavior": item.expected_behavior,
        "actual_behavior": item.actual_behavior,
        "status": item.status,
        "created_at": item.created_at.isoformat(),
        "updated_at": item.updated_at.isoformat()
    }

@router.post("/reset-demo")
async def reset_demo(db: AsyncSession = Depends(get_db)):
    """Reset StudentHub source files back to baseline buggy state and clear past demo runs."""
    from sqlalchemy import delete
    from database.models import Deployment, RiskAssessment, AnalysisRun, AuditLog
    from routers.sse import notify_clients

    # 1. Reset source code files from backup
    reset_studenthub_src_to_backup()

    # 2. Clear past demo incident and deployment records
    await db.execute(delete(Deployment))
    await db.execute(delete(RiskAssessment))
    await db.execute(delete(AnalysisRun))
    await db.execute(delete(AuditLog))
    await db.execute(delete(IncidentReport))
    await db.commit()

    # 3. Notify connected browser clients via SSE
    await notify_clients({"type": "demo_reset", "message": "Demo baseline reset."})

    return {
        "status": "success",
        "message": "StudentHub demonstration source files restored to buggy state and database reset."
    }
