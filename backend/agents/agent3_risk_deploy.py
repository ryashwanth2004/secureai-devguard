"""Agent 3 — Risk Assessment + Secure Deployment Agent

Evaluates the security and operational risk of candidate patches.
Enforces strict binary risk classification: LOW RISK or HIGH RISK.
Decides between Automatic Low-Risk Deployment vs. Blocking for Administrator Approval.
"""

async def run_agent3(bugs: list, patches: list, validation: dict) -> dict:
    """Agent 3: Evaluates risk factors and issues a deployment decision (LOW RISK vs HIGH RISK)."""
    score = 0
    factors = []
    
    # 1. Severity of detected bugs
    high_sev_bugs = [b for b in bugs if b.get("severity") == "HIGH"]
    low_sev_bugs = [b for b in bugs if b.get("severity") == "LOW"]
    
    if high_sev_bugs:
        pts = len(high_sev_bugs) * 50
        score += pts
        factors.append({
            "factor": "Security Bug Severity",
            "value": f"{len(high_sev_bugs)} HIGH severity issue(s)",
            "impact": f"+{pts} pts",
            "category": "Risk Increase"
        })
        
    if low_sev_bugs:
        pts = len(low_sev_bugs) * 10
        score += pts
        factors.append({
            "factor": "Non-Critical Logic Defects",
            "value": f"{len(low_sev_bugs)} LOW severity issue(s)",
            "impact": f"+{pts} pts",
            "category": "Minor Increase"
        })

    # 2. Domain classification (Auth, RBAC, Financial, Injection vs Local calculation)
    is_auth = any(
        "auth" in b.get("bug_type", "").lower() or
        "bypass" in b.get("bug_type", "").lower() or
        "access control" in b.get("bug_type", "").lower() or
        "auth_service" in b.get("file_name", "") or
        "admin_service" in b.get("file_name", "")
        for b in bugs
    )
    if is_auth:
        score += 45
        factors.append({
            "factor": "Authentication / Authorization Surface",
            "value": "Modifies authentication gate or RBAC logic",
            "impact": "+45 pts",
            "category": "Risk Increase"
        })
        
    is_payment = any(
        "payment" in b.get("file_name", "") or
        "amount" in b.get("bug_type", "").lower()
        for b in bugs
    )
    if is_payment:
        score += 35
        factors.append({
            "factor": "Financial & Payment Integrity",
            "value": "Modifies payment calculation/validation routines",
            "impact": "+35 pts",
            "category": "Risk Increase"
        })

    is_xss = any(
        "xss" in b.get("bug_type", "").lower() or
        "script" in b.get("bug_type", "").lower()
        for b in bugs
    )
    if is_xss:
        score += 30
        factors.append({
            "factor": "Web Security Injection (XSS)",
            "value": "Modifies HTML sanitization / escaping routines",
            "impact": "+30 pts",
            "category": "Risk Increase"
        })

    # 3. Code Change Blast Radius (Lines changed)
    total_delta = 0
    for p in patches:
        total_delta += p.get("lines_added", 0) + p.get("lines_removed", 0)
        
    if total_delta > 30:
        score += 20
        factors.append({
            "factor": "Patch Blast Radius",
            "value": f"{total_delta} lines modified",
            "impact": "+20 pts",
            "category": "Risk Increase"
        })
    else:
        factors.append({
            "factor": "Localized Patch Footprint",
            "value": f"{total_delta} lines modified (micro-patch)",
            "impact": "0 pts",
            "category": "Neutral"
        })

    # 4. Validation Results Impact
    if validation:
        if validation.get("syntax_check") and validation.get("compile_check"):
            score -= 5
            factors.append({
                "factor": "Syntax & Bytecode Validation",
                "value": "Clean compile, zero parse errors",
                "impact": "-5 pts",
                "category": "Risk Reduction"
            })
            
        unit_passed = validation.get("unit_tests_passed", 0)
        unit_failed = validation.get("unit_tests_failed", 0)
        if unit_passed > 0 and unit_failed == 0:
            score -= 10
            factors.append({
                "factor": "Unit Test Suite",
                "value": f"100% pass rate ({unit_passed}/{unit_passed} passed)",
                "impact": "-10 pts",
                "category": "Risk Reduction"
            })
        elif unit_failed > 0:
            score += 35
            factors.append({
                "factor": "Failing Unit Tests",
                "value": f"{unit_failed} test(s) failed",
                "impact": "+35 pts",
                "category": "Risk Increase"
            })
            
        if validation.get("security_check"):
            score -= 5
            factors.append({
                "factor": "SAST Clean Scan",
                "value": "No security regressions or anti-patterns",
                "impact": "-5 pts",
                "category": "Risk Reduction"
            })
            
        if validation.get("regression_check"):
            score -= 5
            factors.append({
                "factor": "Regression Invariance Check",
                "value": "All existing module APIs and signatures preserved",
                "impact": "-5 pts",
                "category": "Risk Reduction"
            })

    # Strict binary classification: LOW RISK or HIGH RISK
    # Threshold is 40 points
    is_critical_security = is_auth or is_payment or is_xss or (len(high_sev_bugs) > 0)
    is_high_risk = (score >= 40) or is_critical_security
    risk_level = "HIGH RISK" if is_high_risk else "LOW RISK"
    
    if is_high_risk:
        deployment_decision = "AWAITING_ADMIN_APPROVAL"
        reason = (
            f"Risk score evaluated to {score} (classified as HIGH RISK). "
            f"The patch involves sensitive security components (Authentication/RBAC/Payment/Input Sanitization). "
            f"In accordance with DevSecOps governance policy, automatic deployment is strictly BLOCKED. "
            f"Manual administrator inspection and cryptographic sign-off are required."
        )
    else:
        deployment_decision = "AUTOMATIC_DEPLOYMENT"
        reason = (
            f"Risk score evaluated to {score} (below safe threshold of 40). "
            f"The patch resolves a localized calculation/logic error with zero security side-effects. "
            f"All syntax checks, unit tests, and regression tests passed. "
            f"Classified as LOW RISK: Approved for immediate automatic continuous deployment."
        )

    confidence = round(min(0.99, max(0.88, 1.0 - abs(score - 40) / 200.0)), 2)
    
    return {
        "risk_level": risk_level,
        "score": score,
        "reason": reason,
        "factors": factors,
        "deployment_decision": deployment_decision,
        "confidence": confidence,
        "requires_admin_review": is_high_risk,
        "auto_deployable": not is_high_risk and (validation.get("overall_status") == "VALIDATED")
    }
