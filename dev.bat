@echo off
echo 🚀 Starting development servers...

REM Start backend in new window
start "Backend" cmd /c "cd backend && php -S localhost:8000 -t ./"

REM Pause briefly for backend to initialize
timeout /t 2 >nul

REM Start frontend in current window
cd frontend
pnpm dev
