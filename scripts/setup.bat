@echo off
REM PolyLearn Backend - Quick Start Script (Windows)

echo ================================
echo PolyLearn Backend - Quick Start
echo ================================
echo.

REM Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 20+ from https://nodejs.org/
    exit /b 1
)

echo [OK] Node.js is installed
node --version

echo.
echo Installing dependencies...
call npm install

REM Check .env file
if not exist .env (
    echo.
    echo [WARNING] .env file not found
    echo Copying .env.example to .env...
    copy .env.example .env
    echo.
    echo Please edit .env with your configuration
    echo Opening .env...
    start notepad .env
    echo.
    pause
)

echo.
echo Building TypeScript...
call npm run build

echo.
echo ================================
echo Setup complete!
echo ================================
echo.
echo Next steps:
echo   1. Make sure PostgreSQL and Redis are running
echo   2. Run migrations: npm run migrate:up
echo   3. Start dev server: npm run dev
echo.
pause
