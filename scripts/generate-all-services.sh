#!/bin/bash

# FitSync Service Generator Script
# This script generates all microservices with complete functionality

set -e

echo "🚀 Generating FitSync Microservices..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE_DIR"

echo -e "${BLUE}📦 Generating Training Service...${NC}"
node scripts/generators/training-service-generator.js

echo -e "${BLUE}📦 Generating Schedule Service...${NC}"
python scripts/generators/schedule-service-generator.py

echo -e "${BLUE}📦 Generating Progress Service...${NC}"
python scripts/generators/progress-service-generator.py

echo -e "${BLUE}📦 Generating Notification Service...${NC}"
node scripts/generators/notification-service-generator.js

echo -e "${BLUE}📦 Generating API Gateway...${NC}"
node scripts/generators/api-gateway-generator.js

echo -e "${BLUE}📦 Generating Frontend Application...${NC}"
node scripts/generators/frontend-generator.js

echo -e "${GREEN}✅ All services generated successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: docker-compose up -d"
echo "2. Wait for services to start (check with: docker-compose ps)"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Default login credentials:"
echo "  Admin:    admin@fitsync.com / Admin@123"
echo "  Trainer:  trainer@fitsync.com / Trainer@123"
echo "  Client:   client@fitsync.com / Client@123"
echo "  Gym Owner: gym@fitsync.com / Gym@123"
