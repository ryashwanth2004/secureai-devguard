"""Multi-Agent Orchestration Engine

Sequences the multi-agent pipeline:
Incident -> Agent 1 (Summarizer) -> Agent 2 (Bug Detection & Patch) ->
Validation -> Agent 3 (Risk Assessment) -> Low-Risk Auto Deploy OR High-Risk Admin Gate.
"""

import asyncio
import json
import logging
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from sqlalchemy import select, update
from database.db import AsyncSessionLocal
from database.models import IncidentReport, AnalysisRun, RiskAssessment, Deployment, AuditLog
from agents.agent1_summarizer import run_agent1
from agents.agent2_bug_repair import run_agent2
from agents.agent3_risk_deploy import run_agent3
from engine.patch_validator import validate_patch
from routers.sse import notify_clients
from engine.paths import get_studenthub_src_dir

logger = logging.getLogger("orchestrator")

async def apply_patches_to_studenthub(patches: list):
    """Writes candidate patch modifications directly to StudentHub source files."""
    src_dir = get_studenthub_src_dir()
    for patch in patches:
        file_name = patch.get("file_name")
        patched_code = patch.get("patched_code")
        if file_name and patched_code:
            target = src_dir / file_name
            target.write_text(patched_code, encoding="utf-8")
            logger.info(f"Successfully applied patch to {file_name}")

def reset_studenthub_src_to_backup():
    """Resets all studenthub source files back to their original buggy baseline from backup."""
    src_dir = get_studenthub_src_dir()
    backup_dir = src_dir / "backup"
    if backup_dir.exists():
        for backup_file in backup_dir.glob("*.py"):
            target = src_dir / backup_file.name
            shutil.copy2(str(backup_file), str(target))
        logger.info("Reset StudentHub source files to pristine demonstration state.")

async def record_audit(db, incident_id: str, event_type: str, data: dict):
    """Appends an immutable audit log record."""
    log = AuditLog(
        id=str(uuid.uuid4()),
        incident_id=incident_id,
        event_type=event_type,
        event_data=json.dumps(data)
    )
    db.add(log)
    await db.commit()

async def run_analysis_pipeline(incident_id: str):
    """Executes the complete multi-agent pipeline asynchronously."""
    logger.info(f"--- Launching Multi-Agent Pipeline for incident {incident_id} ---")
    
    async with AsyncSessionLocal() as db:
        # Load incident
        res = await db.execute(select(IncidentReport).where(IncidentReport.id == incident_id))
        incident = res.scalar_one_or_none()
        if not incident:
            logger.error(f"Incident {incident_id} not found in database.")
            return

        # Initialize AnalysisRun
        analysis_id = str(uuid.uuid4())
        analysis = AnalysisRun(
            id=analysis_id,
            incident_id=incident_id,
            status="running"
        )
        db.add(analysis)
        
        # Update incident status to analyzing
        incident.status = "analyzing"
        await db.commit()
        
        await notify_clients({
            "type": "pipeline_started",
            "incident_id": incident_id,
            "human_id": incident.human_id,
            "title": incident.title
        })

        try:
            # ----------------------------------------------------
            # STAGE 1: AGENT 1 — REPORT SUMMARIZATION
            # ----------------------------------------------------
            logger.info("[AGENT 1] Summarizing incident and mapping code architecture...")
            await asyncio.sleep(1.0)  # Visual cadence for jury
            agent1_summary = await run_agent1(incident)
            
            analysis.agent1_summary = json.dumps(agent1_summary)
            await db.commit()
            
            await record_audit(db, incident_id, "AGENT_1_SUMMARIZED", {
                "affected_component": agent1_summary["affected_component"],
                "affected_file": agent1_summary["affected_file"]
            })
            await notify_clients({
                "type": "agent1_complete",
                "incident_id": incident_id,
                "summary": agent1_summary
            })

            # ----------------------------------------------------
            # STAGE 2: AGENT 2 — BUG DETECTION + PATCH GENERATION
            # ----------------------------------------------------
            logger.info("[AGENT 2] Running static AST analysis and patch generation...")
            await asyncio.sleep(1.5)  # Visual cadence for jury
            agent2_res = await run_agent2(incident, agent1_summary)
            
            bugs = agent2_res.get("bugs", [])
            patches = agent2_res.get("patches", [])
            
            analysis.agent2_bugs = json.dumps(bugs)
            analysis.agent2_patches = json.dumps(patches)
            await db.commit()
            
            await record_audit(db, incident_id, "AGENT_2_DEFECTS_PATCHED", {
                "bugs_found": len(bugs),
                "patches_generated": len(patches)
            })
            await notify_clients({
                "type": "agent2_complete",
                "incident_id": incident_id,
                "bugs": bugs,
                "patches": patches,
                "bugs_found": len(bugs)
            })

            # ----------------------------------------------------
            # STAGE 3: PATCH VALIDATION PIPELINE
            # ----------------------------------------------------
            logger.info("[VALIDATOR] Validating patch in isolated environment...")
            await asyncio.sleep(1.2)  # Visual cadence for jury
            validation_res = await validate_patch(patches, bugs, agent1_summary.get("affected_file", ""))
            
            analysis.validation_results = json.dumps(validation_res)
            await db.commit()
            
            await record_audit(db, incident_id, "PATCH_VALIDATION_COMPLETED", {
                "status": validation_res["overall_status"],
                "unit_tests_passed": validation_res["unit_tests_passed"]
            })
            await notify_clients({
                "type": "validation_complete",
                "incident_id": incident_id,
                "validation": validation_res
            })

            # ----------------------------------------------------
            # STAGE 4: AGENT 3 — RISK ASSESSMENT + SECURE DEPLOYMENT
            # ----------------------------------------------------
            logger.info("[AGENT 3] Assessing patch risk factors and determining deployment path...")
            await asyncio.sleep(1.0)  # Visual cadence for jury
            agent3_res = await run_agent3(bugs, patches, validation_res)
            
            analysis.agent3_risk = json.dumps(agent3_res)
            analysis.status = "completed"
            analysis.completed_at = datetime.utcnow()
            
            # Save RiskAssessment entity
            risk_record = RiskAssessment(
                id=str(uuid.uuid4()),
                analysis_id=analysis_id,
                risk_level=agent3_res["risk_level"],
                score=agent3_res["score"],
                reason=agent3_res["reason"],
                factors=json.dumps(agent3_res["factors"]),
                confidence=agent3_res["confidence"],
                deployment_decision=agent3_res["deployment_decision"]
            )
            db.add(risk_record)
            await db.commit()
            
            await record_audit(db, incident_id, "RISK_ASSESSED", {
                "risk_level": agent3_res["risk_level"],
                "score": agent3_res["score"],
                "decision": agent3_res["deployment_decision"]
            })
            await notify_clients({
                "type": "risk_assessed",
                "incident_id": incident_id,
                "risk": agent3_res
            })

            # ----------------------------------------------------
            # STAGE 5: DEPLOYMENT EXECUTION / GATE
            # ----------------------------------------------------
            deploy_id = str(uuid.uuid4())
            
            if agent3_res["risk_level"] == "LOW RISK" and validation_res["overall_status"] == "VALIDATED":
                # AUTOMATIC DEPLOYMENT
                logger.info(">>> LOW RISK: Automatically deploying patch to StudentHub environment <<<")
                await apply_patches_to_studenthub(patches)
                
                deployment = Deployment(
                    id=deploy_id,
                    incident_id=incident_id,
                    analysis_id=analysis_id,
                    status="auto_deployed",
                    deployed_at=datetime.utcnow(),
                    notes="Automatic deployment authorized for LOW RISK change with 100% test validation."
                )
                db.add(deployment)
                incident.status = "deployed"
                await db.commit()
                
                await record_audit(db, incident_id, "AUTO_DEPLOYED_SUCCESS", {
                    "deployment_id": deploy_id,
                    "target": "StudentHub Production Simulation"
                })
                await notify_clients({
                    "type": "deployed",
                    "incident_id": incident_id,
                    "status": "auto_deployed",
                    "risk_level": "LOW RISK",
                    "message": "Patch automatically deployed to StudentHub."
                })
            else:
                # HIGH RISK: REQUIRE ADMINISTRATOR REVIEW & APPROVAL
                logger.info(">>> HIGH RISK: Deployment BLOCKED. Awaiting Administrator Approval <<<")
                deployment = Deployment(
                    id=deploy_id,
                    incident_id=incident_id,
                    analysis_id=analysis_id,
                    status="awaiting_approval",
                    notes="HIGH RISK deployment gate engaged. Administrator authorization required."
                )
                db.add(deployment)
                incident.status = "awaiting_approval"
                await db.commit()
                
                await record_audit(db, incident_id, "DEPLOYMENT_BLOCKED_FOR_APPROVAL", {
                    "deployment_id": deploy_id,
                    "risk_level": agent3_res["risk_level"]
                })
                await notify_clients({
                    "type": "awaiting_approval",
                    "incident_id": incident_id,
                    "status": "awaiting_approval",
                    "risk_level": "HIGH RISK",
                    "message": "High-risk patch blocked from automatic deployment. Administrator approval required."
                })

        except Exception as e:
            logger.error(f"Error in multi-agent pipeline: {e}", exc_info=True)
            incident.status = "error"
            analysis.status = "error"
            await db.commit()
            await notify_clients({
                "type": "pipeline_error",
                "incident_id": incident_id,
                "error": str(e)
            })
