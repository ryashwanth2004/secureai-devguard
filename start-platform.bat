@echo off
title SecureAI DevGuard - Main AI Platform (Port 5174)
cd /d "%~dp0platform"
echo ========================================================
echo  Starting SecureAI DevGuard Main Platform (Port 5174)
echo ========================================================
npm.cmd run dev
pause
