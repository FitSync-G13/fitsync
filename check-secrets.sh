#!/bin/bash
# FitSync - Secret Detection Script
# Run this before uploading to GitHub to check for accidentally committed secrets

echo "🔍 FitSync Secret Detection"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any issues found
ISSUES_FOUND=0

echo "Checking for .env files (should not be committed)..."
ENV_FILES=$(find . -name ".env" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/venv/*")
if [ -n "$ENV_FILES" ]; then
    echo -e "${RED}❌ Found .env files that should not be committed:${NC}"
    echo "$ENV_FILES"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No .env files found${NC}"
fi
echo ""

echo "Checking for .env.example files (these are OK)..."
EXAMPLE_FILES=$(find . -name ".env.example" -not -path "*/node_modules/*" -not -path "*/.git/*")
if [ -n "$EXAMPLE_FILES" ]; then
    echo -e "${GREEN}✅ Found .env.example files (OK):${NC}"
    echo "$EXAMPLE_FILES"
else
    echo -e "${YELLOW}⚠️  No .env.example files found${NC}"
fi
echo ""

echo "Checking for potential passwords in code..."
PASSWORD_MATCHES=$(git grep -i "password\s*=\s*['\"]" 2>/dev/null | grep -v "example" | grep -v "placeholder" | grep -v "your-password" | grep -v "TODO" || true)
if [ -n "$PASSWORD_MATCHES" ]; then
    echo -e "${RED}❌ Found potential hardcoded passwords:${NC}"
    echo "$PASSWORD_MATCHES"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No hardcoded passwords found${NC}"
fi
echo ""

echo "Checking for API keys in code..."
API_KEY_MATCHES=$(git grep -i "api.*key\s*=\s*['\"]" 2>/dev/null | grep -v "example" | grep -v "placeholder" | grep -v "your-api-key" || true)
if [ -n "$API_KEY_MATCHES" ]; then
    echo -e "${RED}❌ Found potential API keys:${NC}"
    echo "$API_KEY_MATCHES"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No hardcoded API keys found${NC}"
fi
echo ""

echo "Checking for JWT secrets..."
JWT_MATCHES=$(git grep -i "jwt.*secret\s*=\s*['\"]" 2>/dev/null | grep -v "process.env" | grep -v "example" | grep -v "placeholder" || true)
if [ -n "$JWT_MATCHES" ]; then
    echo -e "${RED}❌ Found potential hardcoded JWT secrets:${NC}"
    echo "$JWT_MATCHES"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No hardcoded JWT secrets found${NC}"
fi
echo ""

echo "Checking for database passwords..."
DB_PASS_MATCHES=$(git grep -i "db.*password\s*=\s*['\"]" 2>/dev/null | grep -v "process.env" | grep -v "example" | grep -v "placeholder" || true)
if [ -n "$DB_PASS_MATCHES" ]; then
    echo -e "${RED}❌ Found potential database passwords:${NC}"
    echo "$DB_PASS_MATCHES"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No hardcoded database passwords found${NC}"
fi
echo ""

echo "Checking for node_modules directories (should be ignored)..."
NODE_MODULES=$(find . -type d -name "node_modules" -not -path "*/.git/*" | head -5)
if [ -n "$NODE_MODULES" ]; then
    echo -e "${YELLOW}⚠️  Found node_modules directories (should be in .gitignore):${NC}"
    echo "$NODE_MODULES"
    echo "   Run: git rm -r --cached node_modules"
else
    echo -e "${GREEN}✅ No node_modules directories in git${NC}"
fi
echo ""

echo "Checking for Python cache directories..."
PYCACHE=$(find . -type d -name "__pycache__" -not -path "*/.git/*" | head -5)
if [ -n "$PYCACHE" ]; then
    echo -e "${YELLOW}⚠️  Found __pycache__ directories (should be in .gitignore):${NC}"
    echo "$PYCACHE"
    echo "   Run: git rm -r --cached __pycache__"
else
    echo -e "${GREEN}✅ No __pycache__ directories in git${NC}"
fi
echo ""

echo "Checking for certificate files..."
CERT_FILES=$(find . -name "*.pem" -o -name "*.key" -o -name "*.cert" -not -path "*/.git/*" -not -path "*/node_modules/*")
if [ -n "$CERT_FILES" ]; then
    echo -e "${RED}❌ Found certificate files (should not be committed):${NC}"
    echo "$CERT_FILES"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}✅ No certificate files found${NC}"
fi
echo ""

echo "=========================="
if [ $ISSUES_FOUND -eq 1 ]; then
    echo -e "${RED}❌ ISSUES FOUND - Do not upload to GitHub yet!${NC}"
    echo ""
    echo "Fix the issues above before uploading."
    echo "Remove sensitive files with: git rm --cached <file>"
    exit 1
else
    echo -e "${GREEN}✅ No security issues found!${NC}"
    echo ""
    echo "Your project looks safe to upload to GitHub."
    echo "Next steps:"
    echo "  1. Run: git add ."
    echo "  2. Run: git commit -m 'Initial commit'"
    echo "  3. Run: git push origin main"
    exit 0
fi
