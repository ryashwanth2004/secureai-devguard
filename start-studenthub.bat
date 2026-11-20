@echo off
title StudentHub - Student Portal (Port 5173)
cd /d "%~dp0studenthub"
echo ========================================================
echo  Starting StudentHub Portal (Port 5173)
echo ========================================================
npm.cmd run dev
pause
