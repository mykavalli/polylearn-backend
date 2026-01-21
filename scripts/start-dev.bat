@echo off
REM PolyLearn Backend - Development Server (Windows)

echo ================================
echo Starting PolyLearn Backend (Dev)
echo ================================
echo.

REM Check .env
if not exist .env (
    echo [ERROR] .env file not found
    echo Run scripts\setup.bat first
    exit /b 1
)

echo Checking services...
echo.

REM Note: Windows users may need to start PostgreSQL and Redis manually
echo Please ensure:
echo   - PostgreSQL is running (check Services or pgAdmin)
echo   - Redis is running (if using)
echo.

echo Starting development server...
echo Press Ctrl+C to stop
echo.

call npm run dev
