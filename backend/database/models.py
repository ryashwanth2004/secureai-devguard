import uuid
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Float, DateTime, ForeignKey

class Base(DeclarativeBase):
    pass

class IncidentReport(Base):
    __tablename__ = "incident_reports"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    human_id: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    affected_page: Mapped[str] = mapped_column(String(100))
    expected_behavior: Mapped[str] = mapped_column(Text)
    actual_behavior: Mapped[str] = mapped_column(Text)
    screenshot_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, analyzing, awaiting_approval, deployed, rejected, error
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("incident_reports.id"), index=True)
    agent1_summary: Mapped[str | None] = mapped_column(Text, nullable=True)     # JSON string
    agent2_bugs: Mapped[str | None] = mapped_column(Text, nullable=True)        # JSON string
    agent2_patches: Mapped[str | None] = mapped_column(Text, nullable=True)     # JSON string
    validation_results: Mapped[str | None] = mapped_column(Text, nullable=True) # JSON string
    agent3_risk: Mapped[str | None] = mapped_column(Text, nullable=True)        # JSON string
    status: Mapped[str] = mapped_column(String(50), default="running")          # running, completed, error
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("analysis_runs.id"), index=True)
    risk_level: Mapped[str] = mapped_column(String(10))                         # LOW or HIGH only
    score: Mapped[float] = mapped_column(Float)
    reason: Mapped[str] = mapped_column(Text)
    factors: Mapped[str] = mapped_column(Text)                                  # JSON string
    confidence: Mapped[float] = mapped_column(Float, default=0.95)
    deployment_decision: Mapped[str] = mapped_column(String(50))                # AUTO_DEPLOY or AWAITING_ADMIN_APPROVAL
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Deployment(Base):
    __tablename__ = "deployments"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("incident_reports.id"), index=True)
    analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("analysis_runs.id"), index=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")          # pending, auto_deployed, awaiting_approval, approved, rejected, deployed
    deployed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    approved_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("incident_reports.id"), index=True)
    event_type: Mapped[str] = mapped_column(String(100))
    event_data: Mapped[str] = mapped_column(Text)                               # JSON string
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
