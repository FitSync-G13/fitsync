@echo off
REM FitSync - Secret Detection Script (Windows)
REM Run this before uploading to GitHub to check for accidentally committed secrets

echo ========================================
echo FitSync Secret Detection
echo ========================================
echo.

set ISSUES_FOUND=0

echo Checking for .env files (should not be committed)...
dir /s /b .env 2>nul | findstr /v "node_modules .git venv .env.example" >nul
if %errorlevel%==0 (
    echo [ERROR] Found .env files that should not be committed:
    dir /s /b .env 2>nul | findstr /v "node_modules .git venv .env.example"
    set ISSUES_FOUND=1
) else (
    echo [OK] No .env files found
)
echo.

echo Checking for .env.example files (these are OK)...
dir /s /b .env.example 2>nul | findstr /v "node_modules .git" >nul
if %errorlevel%==0 (
    echo [OK] Found .env.example files:
    dir /s /b .env.example 2>nul | findstr /v "node_modules .git"
) else (
    echo [WARNING] No .env.example files found
)
echo.

echo Checking for node_modules directories...
dir /s /b /ad node_modules 2>nul | findstr /v ".git" >nul
if %errorlevel%==0 (
    echo [WARNING] Found node_modules directories (should be in .gitignore):
    dir /s /b /ad node_modules 2>nul | findstr /v ".git"
    echo    Run: git rm -r --cached node_modules
) else (
    echo [OK] No node_modules directories in git
)
echo.

echo Checking for Python cache directories...
dir /s /b /ad __pycache__ 2>nul | findstr /v ".git" >nul
if %errorlevel%==0 (
    echo [WARNING] Found __pycache__ directories (should be in .gitignore):
    dir /s /b /ad __pycache__ 2>nul | findstr /v ".git"
    echo    Run: git rm -r --cached __pycache__
) else (
    echo [OK] No __pycache__ directories in git
)
echo.

echo Checking for certificate files...
dir /s /b *.pem *.key *.cert 2>nul | findstr /v "node_modules .git" >nul
if %errorlevel%==0 (
    echo [ERROR] Found certificate files (should not be committed):
    dir /s /b *.pem *.key *.cert 2>nul | findstr /v "node_modules .git"
    set ISSUES_FOUND=1
) else (
    echo [OK] No certificate files found
)
echo.

echo ========================================
if %ISSUES_FOUND%==1 (
    echo [ERROR] ISSUES FOUND - Do not upload to GitHub yet!
    echo.
    echo Fix the issues above before uploading.
    echo Remove sensitive files with: git rm --cached ^<file^>
    exit /b 1
) else (
    echo [OK] No critical security issues found!
    echo.
    echo Your project looks safe to upload to GitHub.
    echo Next steps:
    echo   1. Run: git add .
    echo   2. Run: git commit -m "Initial commit"
    echo   3. Run: git push origin main
    exit /b 0
)
