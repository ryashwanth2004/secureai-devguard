"""Analysis Inspection & Code Diff API Router

Powers the Main Platform's deep technical inspection views:
Agent 1 Architecture Summary, Agent 2 Bug & Patch Data, Monaco Diff Views, Test Validation.
"""

import json
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from database.models import AnalysisRun, IncidentReport, RiskAssessment, Deployment, AuditLog
from engine.orchestrator import run_analysis_pipeline

router = APIRouter()

@router.get("/{incident_id}")
async def get_analysis_by_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Fetches the latest multi-agent analysis run data for a given incident."""
    res = await db.execute(
        select(AnalysisRun)
        .where(AnalysisRun.incident_id == incident_id)
        .order_by(AnalysisRun.created_at.desc())
    )
    analysis = res.scalar_one_or_none()
    
    # Also fetch incident
    inc_res = await db.execute(select(IncidentReport).where(IncidentReport.id == incident_id))
    incident = inc_res.scalar_one_or_none()
    
    if not analysis:
        # Check if incident is currently pending or queued
        if incident:
            return {
                "incident": {
                    "id": incident.id,
                    "human_id": incident.human_id,
                    "title": incident.title,
                    "status": incident.status
                },
                "status": incident.status,
                "agent1_summary": None,
                "agent2_bugs": [],
                "agent2_patches": [],
                "validation_results": None,
                "agent3_risk": None,
                "risk_assessment": None,
                "deployment": None
            }
        raise HTTPException(status_code=404, detail="Analysis run not found for this incident")

    # Fetch RiskAssessment
    risk_res = await db.execute(select(RiskAssessment).where(RiskAssessment.analysis_id == analysis.id))
    risk = risk_res.scalar_one_or_none()

    # Fetch Deployment
    deploy_res = await db.execute(select(Deployment).where(Deployment.incident_id == incident_id))
    deploy = deploy_res.scalar_one_or_none()

    return {
        "analysis_id": analysis.id,
        "incident_id": incident_id,
        "status": analysis.status,
        "incident": {
            "id": incident.id if incident else incident_id,
            "human_id": incident.human_id if incident else "SH-UNKNOWN",
            "title": incident.title if incident else "",
            "description": incident.description if incident else "",
            "affected_page": incident.affected_page if incident else "",
            "expected_behavior": incident.expected_behavior if incident else "",
            "actual_behavior": incident.actual_behavior if incident else "",
            "status": incident.status if incident else "unknown"
        },
        "agent1_summary": json.loads(analysis.agent1_summary) if analysis.agent1_summary else None,
        "agent2_bugs": json.loads(analysis.agent2_bugs) if analysis.agent2_bugs else [],
        "agent2_patches": json.loads(analysis.agent2_patches) if analysis.agent2_patches else [],
        "validation_results": json.loads(analysis.validation_results) if analysis.validation_results else None,
        "agent3_risk": json.loads(analysis.agent3_risk) if analysis.agent3_risk else None,
        "risk_assessment": {
            "risk_level": risk.risk_level,
            "score": risk.score,
            "reason": risk.reason,
            "factors": json.loads(risk.factors) if risk.factors else [],
            "confidence": risk.confidence,
            "deployment_decision": risk.deployment_decision
        } if risk else None,
        "deployment": {
            "id": deploy.id,
            "status": deploy.status,
            "deployed_at": deploy.deployed_at.isoformat() if deploy.deployed_at else None,
            "approved_by": deploy.approved_by,
            "notes": deploy.notes
        } if deploy else None,
        "created_at": analysis.created_at.isoformat(),
        "completed_at": analysis.completed_at.isoformat() if analysis.completed_at else None
    }

@router.get("/{incident_id}/diff")
async def get_code_diff(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Returns side-by-side Before / After source code and unified diff for code editors."""
    res = await db.execute(
        select(AnalysisRun)
        .where(AnalysisRun.incident_id == incident_id)
        .order_by(AnalysisRun.created_at.desc())
    )
    analysis = res.scalar_one_or_none()
    if not analysis or not analysis.agent2_patches:
        raise HTTPException(status_code=404, detail="No patches found for this incident")
        
    patches = json.loads(analysis.agent2_patches)
    return {
        "incident_id": incident_id,
        "patches": patches,
        "total_patches": len(patches)
    }

@router.get("/{incident_id}/audit")
async def get_audit_trail(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Returns the immutable lifecycle audit log for an incident."""
    res = await db.execute(
        select(AuditLog)
        .where(AuditLog.incident_id == incident_id)
        .order_by(AuditLog.created_at.asc())
    )
    logs = res.scalars().all()
    return [
        {
            "id": l.id,
            "event_type": l.event_type,
            "event_data": json.loads(l.event_data),
            "timestamp": l.created_at.isoformat()
        }
        for l in logs
    ]

@router.post("/{incident_id}/run")
async def trigger_reanalysis(
    incident_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Manually re-run the multi-agent analysis pipeline."""
    res = await db.execute(select(IncidentReport).where(IncidentReport.id == incident_id))
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Incident not found")
        
    background_tasks.add_task(run_analysis_pipeline, incident_id)
    return {"status": "success", "message": "Multi-agent pipeline re-triggered."}
