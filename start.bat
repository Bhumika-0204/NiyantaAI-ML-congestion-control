@echo off
echo =========================================
echo   Starting Niyanta AI Enterprise Gateway
echo =========================================

echo.
echo [1/3] Starting Python Backend API...
start "Niyanta Backend (API Gateway)" cmd /k "cd backend && ..\.venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload"

echo [2/3] Starting React Dashboard...
start "Niyanta Dashboard (Frontend)" cmd /k "cd frontend && npm run dev"

echo [3/3] Starting Live Attack Simulator...
start "Niyanta Traffic Simulator" cmd /k ".\.venv\Scripts\activate.bat && python attack_simulator.py"

echo.
echo All services have been launched in new windows!
echo - Dashboard: http://localhost:5173
echo - API Docs:  http://localhost:8000/docs
echo.
pause
