"""Agent 1 — Report Summarization Agent

Analyzes incoming problem reports from StudentHub, correlates them with project architecture,
identifies affected modules, source files, and produces an in-depth structured technical summary.
"""

from pathlib import Path
import re

from engine.paths import get_studenthub_src_dir

def get_src_dir() -> Path:
    return get_studenthub_src_dir()

PAGE_TO_FILE = {
    "cart": "cart_service.py",
    "cart page": "cart_service.py",
    "login": "auth_service.py",
    "login page": "auth_service.py",
    "authentication": "auth_service.py",
    "payment": "payment_service.py",
    "payment page": "payment_service.py",
    "payment simulation": "payment_service.py",
    "profile": "profile_service.py",
    "profile page": "profile_service.py",
    "student profile": "profile_service.py",
    "admin": "admin_service.py",
    "admin page": "admin_service.py",
    "authorization": "admin_service.py",
}

COMPONENT_METADATA = {
    "cart_service.py": {
        "name": "Cart & Pricing Engine",
        "description": "Calculates course order totals, handles course cart additions and removals.",
        "sensitivity": "MEDIUM (Financial calculation logic)",
        "security_critical": False,
    },
    "auth_service.py": {
        "name": "User Authentication & Session Provider",
        "description": "Authenticates student and admin credentials, validates passwords, provides session tokens.",
        "sensitivity": "CRITICAL (Authentication & Credential Gate)",
        "security_critical": True,
    },
    "payment_service.py": {
        "name": "Payment Gateway Simulation & Settlement",
        "description": "Processes payment transactions, validates credit card numbers, coordinates refunds.",
        "sensitivity": "HIGH (Financial transactions & accounting ledger)",
        "security_critical": True,
    },
    "profile_service.py": {
        "name": "Student Profile & Display Service",
        "description": "Handles student biographical information, profile updates, and avatar uploads.",
        "sensitivity": "HIGH (User input rendering & injection prevention)",
        "security_critical": True,
    },
    "admin_service.py": {
        "name": "Administrative Control & RBAC Service",
        "description": "Enforces role-based permissions, serves platform metrics, handles administrative actions.",
        "sensitivity": "CRITICAL (Platform Authorization & RBAC)",
        "security_critical": True,
    },
}

async def run_agent1(incident) -> dict:
    """Agent 1: Ingests the incident report and generates a comprehensive technical architectural summary."""
    affected_page_clean = incident.affected_page.lower().strip()
    
    # 1. Match source file from page mapping
    affected_file = PAGE_TO_FILE.get(affected_page_clean)
    
    if not affected_file:
        for key, fname in PAGE_TO_FILE.items():
            if key in affected_page_clean:
                affected_file = fname
                break
                
    # Fallback: check keywords in title or description
    if not affected_file:
        blob = f"{incident.title} {incident.description} {incident.actual_behavior}".lower()
        if any(w in blob for w in ["cart", "total", "sum", "price", "course add"]):
            affected_file = "cart_service.py"
        elif any(w in blob for w in ["login", "password", "auth", "bypass", "credential", "sign in"]):
            affected_file = "auth_service.py"
        elif any(w in blob for w in ["pay", "payment", "card", "negative", "refund", "amount"]):
            affected_file = "payment_service.py"
        elif any(w in blob for w in ["profile", "bio", "xss", "script", "html", "name"]):
            affected_file = "profile_service.py"
        elif any(w in blob for w in ["admin", "role", "access", "permission", "rbac", "dashboard"]):
            affected_file = "admin_service.py"
        else:
            affected_file = "cart_service.py"
            
    file_path = get_src_dir() / affected_file
    source_code = ""
    lines = []
    if file_path.exists():
        source_code = file_path.read_text(encoding="utf-8")
        lines = source_code.splitlines()
        
    funcs = [l.strip().split("(")[0].replace("def ", "") for l in lines if l.strip().startswith("def ")]
    meta = COMPONENT_METADATA.get(affected_file, {
        "name": "Core Application Service",
        "description": "Application logic module",
        "sensitivity": "MEDIUM",
        "security_critical": False
    })
    
    summary = {
        "report_id": incident.human_id,
        "title": incident.title,
        "project_name": "StudentHub Educational Portal",
        "project_overview": "StudentHub is a multi-tier educational portal serving students with course discovery, enrollment cart processing, payment simulation, and student profiles.",
        "affected_component": meta["name"],
        "affected_file": affected_file,
        "component_description": meta["description"],
        "security_classification": meta["sensitivity"],
        "is_security_critical": meta["security_critical"],
        "technologies_used": ["Python 3", "FastAPI", "React 18", "TypeScript", "Tailwind CSS", "SQLite / aiosqlite"],
        "main_modules": [
            "cart_service.py (Cart Total Calculation)",
            "auth_service.py (User Authentication & RBAC)",
            "payment_service.py (Financial Processing)",
            "profile_service.py (User Bio & Display)",
            "admin_service.py (Administrative Management)"
        ],
        "application_workflow": "Student discovers course -> Adds to Cart -> Reviews Cart Total -> Enters Payment -> Accesses Enrolled Content -> Manages Profile.",
        "security_sensitive_components": [
            "auth_service.py (Authentication Gate)",
            "payment_service.py (Transaction Verification)",
            "admin_service.py (Privilege Boundary Enforcement)"
        ],
        "incident_analysis": (
            f"Problem '{incident.title}' was triggered on page '{incident.affected_page}'. "
            f"User expects: '{incident.expected_behavior}', but observed: '{incident.actual_behavior}'. "
            f"Agent 1 traced the fault domain to '{affected_file}' in the StudentHub application layer."
        ),
        "potential_bug_areas": funcs if funcs else ["Main function dispatch"],
        "source_loc": len(lines),
        "identified_functions": funcs,
    }
    
    return summary
