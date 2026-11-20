@echo off
title SecureAI DevGuard - Backend (Port 8000)
cd /d "%~dp0backend"
echo ========================================================
echo  Starting SecureAI DevGuard FastAPI Backend (Port 8000)
echo ========================================================
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
