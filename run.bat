@echo off
title TalentMosaic - RRHH Launcher
echo ========================================================
echo   INICIANDO PLATAFORMA DE RRHH (TALENTMOSAIC)
echo ========================================================
echo.

echo 1. Iniciando Servidor Backend (FastAPI en http://localhost:8000)...
start "TalentMosaic - Backend (FastAPI)" cmd /k "python Backend\main.py"

echo 2. Iniciando Servidor Frontend (Vite React en http://localhost:5173)...
start "TalentMosaic - Frontend (React)" cmd /k "cd Front-end && npm run dev"

echo.
echo ========================================================
echo   AMBOS SERVICIOS HAN SIDO INICIADOS CORRECTAMENTE
echo   - Backend API: http://localhost:8000 (Swagger: /docs)
echo   - Frontend UI:  http://localhost:5173
echo ========================================================
echo.
pause
