# SecureAI DevGuard — Deployment & Hosting Guide

This guide provides step-by-step instructions to deploy **SecureAI DevGuard** (both the **StudentHub** portal and the **Main Multi-Agent AI Platform**, along with the **FastAPI Backend**).

---

## 🏗 System Architecture Overview

The system consists of 3 distinct applications:

| Application | Technology | Role | Deployment Target |
| :--- | :--- | :--- | :--- |
| **StudentHub** | React 18 + Vite + Tailwind | Demo User Academic Portal (zero AI info) | **Vercel** |
| **Main AI Platform** | React 18 + Monaco Editor + Tailwind | DevSecOps Multi-Agent Operations Console | **Vercel** |
| **Backend API** | Python FastAPI + SQLite + SSE | Agent 1, Agent 2, Agent 3 Orchestration | **Render / Railway / ngrok** |

> **Why Frontend on Vercel and Backend on Render/Railway?**  
> Vercel is the industry gold standard for hosting Vite/React single-page applications with instant global CDN distribution.  
> The Python backend executes **dynamic code rewriting on disk (`studenthub_src/`)**, maintains an **SQLite database**, and streams **persistent Server-Sent Events (SSE)**. Vercel Serverless Functions have ephemeral (read-only) disks and 10s execution timeouts, whereas **Render.com** and **Railway.app** provide persistent container processes for free.

---

## 🚀 Step 1: Push Project to GitHub

1. Open PowerShell or Terminal in the project root:
   ```bash
   cd C:\Users\ryash\.gemini\antigravity\scratch\secureai-devguard
   ```
2. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: complete SecureAI DevGuard multi-agent system"
   ```
3. Push to your GitHub repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/secureai-devguard.git
   git push -u origin main
   ```

---

## ⚡ Step 2: Deploy Backend (Choose Option A or Option B)

### Option A: Render.com (Recommended — 100% Free 24/7 Cloud Host)

1. Sign up or log into [Render.com](https://render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `secureai-devguard`.
4. Configure the settings:
   - **Name:** `secureai-devguard-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. In **Environment Variables**, add:
   - `ADMIN_USERNAME` = `admin`
   - `ADMIN_PASSWORD` = `admin123`
   - `SECRET_KEY` = `your-super-secret-jwt-key`
6. Click **Deploy Web Service**.
7. Once deployed, Render will provide a public URL:  
   👉 `https://secureai-devguard-backend.onrender.com`

---

### Option B: Localhost + ngrok Tunnel (Fastest for College Presentation / Viva)

If you are presenting in front of evaluators and want your local laptop to execute the agents while frontends are live on public Vercel links:

1. Keep your backend running locally:
   ```bash
   cd backend
   python -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```
2. In a second terminal, start an ngrok tunnel:
   ```bash
   ngrok http 8000
   ```
3. Copy the public forwarding URL (e.g. `https://xxxx-xx-xx.ngrok-free.app`).  
   Use this as your backend URL in Step 3!

---

## 🌐 Step 3: Deploy Frontends to Vercel

Since both frontends are in subfolders of your repository (`studenthub` and `platform`), you deploy them as two separate projects on Vercel.

### Project 1: StudentHub (Demo Portal)

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `secureai-devguard`.
4. Under **Project Name**, enter: `studenthub-portal`.
5. Under **Root Directory**, click **Edit** and select: `studenthub`.
6. Framework Preset will automatically detect **Vite**.
7. Expand **Environment Variables** and add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://secureai-devguard-backend.onrender.com` *(or your ngrok URL)*
8. Click **Deploy**.

> Vercel will build and provide your live URL, e.g., `https://studenthub-portal.vercel.app`.

---

### Project 2: Main Multi-Agent AI Platform

1. In Vercel, click **Add New...** → **Project** again.
2. Select the same GitHub repository: `secureai-devguard`.
3. Under **Project Name**, enter: `secureai-platform`.
4. Under **Root Directory**, click **Edit** and select: `platform`.
5. Framework Preset will automatically detect **Vite**.
6. Expand **Environment Variables** and add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://secureai-devguard-backend.onrender.com` *(or your ngrok URL)*
7. Click **Deploy**.

> Vercel will build and provide your live URL, e.g., `https://secureai-platform.vercel.app`.

---

## ⚙️ Configuration Files Already Included in the Project

The project is pre-configured with all necessary deployment specifications:

1. **`studenthub/vercel.json`**:
   Configured with SPA rewrite rule (`"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]`) to prevent 404 errors on browser refresh.
2. **`platform/vercel.json`**:
   Configured with SPA rewrite rule for all client-side routes.
3. **`studenthub/src/config/api.ts` & `platform/src/config/api.ts`**:
   Dynamically reads `import.meta.env.VITE_API_URL`. Defaults to `http://localhost:8000` when running locally, and switches to your cloud backend when deployed.
4. **`backend/Procfile` & `backend/Dockerfile`**:
   Pre-configured container recipes for Render, Railway, Fly.io, or Heroku.
5. **`render.yaml`**:
   Blueprint for instant 1-click cloud service provisioning on Render.
6. **`.gitignore`**:
   Excludes `node_modules`, `.env`, `dist`, SQLite databases, and caches from GitHub.

---

## ✅ Deployment Verification Checklist

Once deployed, perform this quick 2-minute test:

1. Open your Vercel **StudentHub** link (`https://studenthub-portal.vercel.app`).
2. Navigate to **Cart** → Notice the calculation bug ($199.98 vs $129.98).
3. Click **Report a Problem** → Fill in the issue or click a quick-fill template → Click **Submit Problem**.
4. Open your Vercel **Platform** link (`https://secureai-platform.vercel.app`).
5. Notice the report instantly appears under **Incoming Reports** via real-time stream.
6. Click into the report to watch **Agent 1** (Summarizer), **Agent 2** (Bug Detection + Monaco Diff), **Validation Engine**, and **Agent 3** (Risk Assessment).
7. If **LOW RISK** → See **Automatic Deployment** update live.
8. If **HIGH RISK** → Unlock Admin Gate with `admin` / `admin123` → Click **Approve & Deploy**.
9. Refresh **StudentHub** → Verify the bug is resolved!
