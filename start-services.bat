@echo off
REM FitSync - Start All Services (Windows)
REM This script starts all FitSync services using Docker Compose

echo ========================================
echo     FitSync Service Startup
echo ========================================
echo.

REM Check if Docker is running
docker version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/4] Starting infrastructure services...
docker-compose up -d userdb trainingdb scheduledb progressdb redis

echo.
echo [2/4] Waiting for databases to be ready (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo [3/4] Starting microservices (building images)...
docker-compose up -d --build user-service training-service schedule-service progress-service notification-service api-gateway

echo.
echo [4/4] Checking service status...
timeout /t 5 /nobreak >nul
docker-compose ps

echo.
echo ========================================
echo     FitSync Services Started!
echo ========================================
echo.
echo API Gateway:       http://localhost:4000
echo User Service:      http://localhost:3001
echo Training Service:  http://localhost:3002
echo Schedule Service:  http://localhost:8003
echo Progress Service:  http://localhost:8004
echo Notification Svc:  http://localhost:3005
echo.
echo Test the system:
echo   curl http://localhost:4000/health
echo.
echo Login Credentials:
echo   Admin:    admin@fitsync.com / Admin@123
echo   Trainer:  trainer@fitsync.com / Trainer@123
echo   Client:   client@fitsync.com / Client@123
echo.
echo View logs:
echo   docker-compose logs -f
echo.
echo Stop services:
echo   docker-compose down
echo.
pause
