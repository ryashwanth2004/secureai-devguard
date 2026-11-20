@echo off
title SecureAI DevGuard - Launcher
echo ===================================================================
echo   Automated Software Bug Detection and Secure Deployment Using Multi-Agent AI
echo   Starting Backend (8000), StudentHub (5173), Main Platform (5174)
echo ===================================================================

start "SecureAI Backend (8000)" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul

start "StudentHub Portal (5173)" cmd /k "%~dp0start-studenthub.bat"
timeout /t 2 /nobreak >nul

start "DevGuard Platform (5174)" cmd /k "%~dp0start-platform.bat"

echo.
echo All three services have been launched in separate terminal windows:
echo - Backend API:        http://localhost:8000/docs
echo - StudentHub:         http://localhost:5173
echo - Main AI Platform:   http://localhost:5174
echo.
pause
