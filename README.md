# Automated Software Bug Detection and Secure Deployment Using Multi-Agent AI
**System Codename:** `SecureAI DevGuard`  
**Academic Level:** College Final-Year Capstone Project / Live Jury Demonstration

---

## 1. System Overview & Core Architecture

This project implements an end-to-end, multi-agent AI DevSecOps platform that continuously analyzes reported software issues, locates underlying syntax/runtime/security defects in source code, synthesizes verified program patches, tests them in an isolated sandbox, performs rigorous binary risk evaluation, and controls automated vs. administrator-gated production releases.

### Strict Architectural Separation
To mirror real-world production environments and fulfill project requirements, the codebase is strictly segregated into two completely independent web applications:

```
                            [ STUDENTHUB PORTAL ] (Port 5173)
                            - Realistic student course portal
                            - Courses, Cart, Checkout, Profiles
                            - Contains intentional demonstration bugs
                            - ZERO AI internal information visible
                                      │
                                      │ 1. User encounters defect & submits problem
                                      ▼
                        [ PROBLEM REPORTING BRIDGE ]
                                      │
                                      ▼
             [ FASTAPI ASYNC BACKEND & ORCHESTRATOR ] (Port 8000)
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        ▼                                                           ▼
  [ AGENT 1: REPORT SUMMARIZER ]                             [ AGENT 2: BUG REPAIR ]
  - Maps report to source files                              - AST & SAST code scanning
  - Extracts architecture & LOC                              - Pinpoints exact line numbers
  - Identifies sensitive modules                             - Synthesizes unified diff patch
        │                                                           │
        └─────────────────────────────┬─────────────────────────────┘
                                      ▼
                        [ PATCH VALIDATION PIPELINE ]
                        - AST & Bytecode Compilation
                        - Unit Testing Suite in Sandbox
                        - Static Security (SAST) Scanner
                        - Regression Invariance Verification
                                      │
                                      ▼
                        [ AGENT 3: RISK ASSESSMENT ]
                        - Evaluates severity, blast radius, auth impact
                        - Strict Binary Classification: LOW RISK vs HIGH RISK
                                      │
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
                 [ LOW RISK ]                [ HIGH RISK ]
                        │                           │
                        ▼                           ▼
               AUTOMATIC DEPLOYMENT         DEPLOYMENT BLOCKED
               - Patches live StudentHub    - Requires Security Officer Sign-Off
               - User sees fixed portal     - [Approve & Deploy] / [Reject]
                                                    │
                                                    ▼
                                     [ MAIN AI PLATFORM ] (Port 5174)
                                     - Full DevSecOps Command Center
                                     - Monaco Editor Side-by-Side Diff
                                     - 10 Key DevSecOps Metrics
                                     - Real-Time SSE Event Stream
                                     - Immutable Audit Log Ledger
```

---

## 2. Multi-Agent AI Architecture

### Agent 1 — Report Summarization Agent
- **Input:** Incident reports submitted by students on StudentHub.
- **Workflow:** Correlates the user's reported problem against the application's source modules (`cart_service.py`, `auth_service.py`, `payment_service.py`, `profile_service.py`, `admin_service.py`).
- **Output:** Structured architectural technical summary containing:
  - Project Overview & detected tech stack
  - Affected Component & target repository file
  - Lines of Code & identified functions
  - Security classification & attack surface rating
  - Incident correlation analysis

### Agent 2 — Bug Detection + Patch Generation Agent (Combined)
- **Input:** Agent 1 structured report + live source code.
- **Workflow:** 
  1. Parses source code into Python Abstract Syntax Trees (AST) and comment-stripped token streams.
  2. Runs pattern matching against formal CWE rules (`CWE-193`, `CWE-287`, `CWE-20`, `CWE-79`, `CWE-285`).
  3. Formulates a complete bug record (ID, title, severity, file, line number, enclosing function, evidence, root cause, suggested fix).
  4. Generates an exact drop-in patch and computes a unified git diff.
- **Output:** Formatted BEFORE code, AFTER code, Unified Diff string, and logic explanation.

### Validation Engine — Multi-Stage Testing Sandbox
Before any patch is considered for deployment, it undergoes automated verification:
1. **Syntax Verification:** AST parse check with zero tolerance for syntax errors.
2. **Bytecode Compilation:** Tested with Python `py_compile`.
3. **Targeted Sandbox Unit Tests:** Verifies the bug condition is resolved without breaking functionality.
4. **SAST Security Scan:** Ensures no hardcoded credentials, dynamic code execution (`eval`), or shell injections were introduced.
5. **Regression Invariance Check:** Confirms all existing function signatures remain intact.
- **Outcome:** Strictly tagged as `VALIDATED` or `FAILED`.

### Agent 3 — Risk Assessment + Secure Deployment Agent
- **Policy Enforcement:** Strict binary output — **`LOW RISK`** or **`HIGH RISK`** (Medium risk is prohibited).
- **Evaluation Criteria:**
  - Bug severity points (High vs Low)
  - Security sensitivity (Authentication, RBAC, Financial payment logic, Input sanitization)
  - Lines changed (Blast radius)
  - Validation test results (Unit test pass rate, SAST clean scan, Regression results)
- **Deployment Decision:**
  - **LOW RISK (Score < 40 & Non-critical):** System authorizes **AUTOMATIC DEPLOYMENT** to the local demonstration environment.
  - **HIGH RISK (Score >= 40 or Auth/RBAC/Payment):** System engages the **DEPLOYMENT BLOCK GATE**. Automatic release is halted until an Administrator reviews the diff and provides cryptographic approval.

---

## 3. Technology Stack

- **Backend:** Python 3, FastAPI, SQLAlchemy 2.0 (Async), aiosqlite, SQLite, Uvicorn, Python-Dotenv, HTTPX.
- **AI Inference Engine:** Configurable LLM abstraction layer supporting:
  - Gemini 1.5 Flash (`GEMINI_API_KEY`)
  - OpenAI GPT-4o-mini (`OPENAI_API_KEY`)
  - Deterministic Offline AST Rule Engine (100% reliable for live juries without external API keys).
- **StudentHub Portal:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router.
- **Main DevSecOps Platform:** React 18, TypeScript, Vite, Tailwind CSS, Monaco Diff Editor (`@monaco-editor/react`), Recharts, Server-Sent Events (SSE).

---

## 4. Quick Start & Execution

### Prerequisites
- Python 3.10+
- Node.js 18+ (npm)

### Option A: Launch All Services in 1-Click (Windows)
Double click `start-all.bat` or run in PowerShell:
```powershell
.\start-all.bat
```

### Option B: Run Services Manually in 3 Terminals

#### Terminal 1 — FastAPI Backend (Port 8000)
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Health Check: `http://localhost:8000/api/health`*  
*Swagger Documentation: `http://localhost:8000/docs`*

#### Terminal 2 — StudentHub Portal (Port 5173)
```powershell
cd studenthub
npm.cmd run dev
```
*Student Portal URL: `http://localhost:5173`*

#### Terminal 3 — Main DevSecOps AI Platform (Port 5174)
```powershell
cd platform
npm.cmd run dev
```
*Main AI Platform URL: `http://localhost:5174`*

---

## 5. Live Jury Demonstration Script

### SCENARIO A: Low-Risk Bug → Automatic Deployment
1. **Open StudentHub** at `http://localhost:5173`.
2. Notice there are 2 courses in your Cart:
   - Course 1: `$89.99`
   - Course 2: `$119.99`
   - **Bug Observed:** Subtotal displays **`$89.99`** instead of **`$209.98`** (off-by-one error excludes last course).
3. Click **"Report a Problem"** in the top navigation.
4. Click the quick preset button: **"🛒 Cart Total Bug (Low Risk Demo)"**.
5. Click **"Submit Problem Report"**. You receive ticket **`SH-XXXX`**.
6. **Switch to Main AI Platform** at `http://localhost:5174`.
7. Watch the live real-time pipeline:
   - **Agent 1** summarizes `cart_service.py` architecture.
   - **Agent 2** pinpoints line 5 in `calculate_total` (`items[0:len(items)-1]`), explains the bug, and synthesizes a patch.
   - Inspect the **Monaco Code Diff** tab to see side-by-side BEFORE vs AFTER.
   - **Validation Engine** verifies AST compilation, unit tests, and SAST scans (`VALIDATED`).
   - **Agent 3** calculates risk score below threshold -> assigns **`LOW RISK`**.
   - System triggers **`AUTOMATIC DEPLOYMENT`**.
8. **Return to StudentHub** (`http://localhost:5173/cart`).
9. Notice the cart total has dynamically updated to **`$209.98`**!
10. The bug is resolved. StudentHub users experience the fix without ever seeing internal AI artifacts.

---

### SCENARIO B: High-Risk Security Bug → Gated Administrator Approval
1. **Open StudentHub** at `http://localhost:5173/login`.
2. Type username `alice` and leave password blank. Notice you can bypass authentication.
3. Go to **"Report a Problem"** and select **"🔐 Empty Password Login Bypass (High Risk Demo)"**.
4. Submit report.
5. **Open Main AI Platform** at `http://localhost:5174`.
6. Watch the pipeline:
   - **Agent 2** detects `CWE-287 Authentication Bypass` in `auth_service.py` (High Severity).
   - Patch validation passes.
   - **Agent 3** classifies as **`HIGH RISK`** due to authentication boundary impact.
   - **AUTOMATIC DEPLOYMENT IS BLOCKED**.
7. Navigate to **"Admin Approval Gate"** on the platform sidebar.
8. Review the high-risk warning and candidate patch diff.
9. Log in as Security Officer (Username: `admin`, Password: `admin123`).
10. Click **`[ APPROVE & DEPLOY PATCH ]`**.
11. The patch is applied, status updates to `deployed`, and the audit trail logs the administrator's sign-off.

---

## 6. Resetting the Demonstration
To rerun the jury demonstration from scratch at any time, click **"Reset Demo Baseline"** at the bottom of the Main AI Platform sidebar, or make an HTTP POST to:
```
POST http://localhost:8000/api/incidents/reset-demo
```
This restores all StudentHub source files from `backend/studenthub_src/backup/` back to their pristine educational buggy state.
