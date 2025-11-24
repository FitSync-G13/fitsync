@echo off
REM Initialize environment files from examples if they don't exist
REM This script should be run before docker-compose up

echo Initializing environment files...

REM Function to copy .env.example to .env if .env doesn't exist
if not exist services\user-service\.env (
    echo Creating .env for user-service...
    copy services\user-service\.env.example services\user-service\.env
) else (
    echo .env already exists for user-service, skipping...
)

if not exist services\training-service\.env (
    echo Creating .env for training-service...
    copy services\training-service\.env.example services\training-service\.env
) else (
    echo .env already exists for training-service, skipping...
)

if not exist services\api-gateway\.env (
    echo Creating .env for api-gateway...
    copy services\api-gateway\.env.example services\api-gateway\.env
) else (
    echo .env already exists for api-gateway, skipping...
)

if not exist services\notification-service\.env (
    echo Creating .env for notification-service...
    copy services\notification-service\.env.example services\notification-service\.env
) else (
    echo .env already exists for notification-service, skipping...
)

if not exist services\schedule-service\.env (
    echo Creating .env for schedule-service...
    copy services\schedule-service\.env.example services\schedule-service\.env
) else (
    echo .env already exists for schedule-service, skipping...
)

if not exist services\progress-service\.env (
    echo Creating .env for progress-service...
    copy services\progress-service\.env.example services\progress-service\.env
) else (
    echo .env already exists for progress-service, skipping...
)

if not exist frontend\.env (
    echo Creating .env for frontend...
    copy frontend\.env.example frontend\.env
) else (
    echo .env already exists for frontend, skipping...
)

echo.
echo Environment files initialized!
echo You can now run: docker-compose up -d
echo.
pause
