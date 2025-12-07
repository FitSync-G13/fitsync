#!/bin/bash

# FitSync - Start All Services Script
# This script starts all FitSync services in the correct order

set -e

echo "🚀 Starting FitSync Services..."
echo ""

# Colors
GREEN='\033[0.32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Start infrastructure services
echo -e "${BLUE}📦 Starting infrastructure (Databases & Redis)...${NC}"
docker-compose up -d userdb trainingdb scheduledb progressdb redis

echo "⏳ Waiting for databases to be ready (30 seconds)..."
sleep 30

# Check database health
echo -e "${BLUE}🏥 Checking database health...${NC}"
for i in {1..5}; do
    if docker exec fitsync-userdb pg_isready -U fitsync > /dev/null 2>&1; then
        echo "✅ Databases are ready"
        break
    fi
    if [ $i -eq 5 ]; then
        echo "❌ Databases failed to start. Check logs with: docker-compose logs userdb"
        exit 1
    fi
    echo "⏳ Waiting for databases... ($i/5)"
    sleep 5
done

echo ""

# User Service
echo -e "${BLUE}📦 Setting up User Service...${NC}"
cd services/user-service
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "Running migrations..."
npm run migrate
echo "Seeding database..."
npm run seed
cd "$BASE_DIR"
echo "✅ User Service ready"
echo ""

# Training Service
echo -e "${BLUE}📦 Setting up Training Service...${NC}"
cd services/training-service
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "Running migrations..."
npm run migrate
echo "Seeding database..."
npm run seed
cd "$BASE_DIR"
echo "✅ Training Service ready"
echo ""

# Notification Service
echo -e "${BLUE}📦 Setting up Notification Service...${NC}"
cd services/notification-service
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
cd "$BASE_DIR"
echo "✅ Notification Service ready"
echo ""

# API Gateway
echo -e "${BLUE}📦 Setting up API Gateway...${NC}"
cd services/api-gateway
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
cd "$BASE_DIR"
echo "✅ API Gateway ready"
echo ""

# Check Python services
if command_exists python3; then
    PYTHON_CMD=python3
elif command_exists python; then
    PYTHON_CMD=python
else
    echo -e "${YELLOW}⚠️  Python not found. Python services will need to be started manually.${NC}"
    PYTHON_CMD=""
fi

if [ ! -z "$PYTHON_CMD" ]; then
    # Schedule Service
    echo -e "${BLUE}📦 Setting up Schedule Service (Python)...${NC}"
    cd services/schedule-service
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        $PYTHON_CMD -m venv venv
    fi
    source venv/bin/activate || source venv/Scripts/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
    deactivate
    cd "$BASE_DIR"
    echo "✅ Schedule Service ready"
    echo ""

    # Progress Service
    echo -e "${BLUE}📦 Setting up Progress Service (Python)...${NC}"
    cd services/progress-service
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        $PYTHON_CMD -m venv venv
    fi
    source venv/bin/activate || source venv/Scripts/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
    deactivate
    cd "$BASE_DIR"
    echo "✅ Progress Service ready"
    echo ""
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All services are set up and ready!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "📚 Starting services..."
echo ""

echo "1. Infrastructure services (already running):"
echo "   ✅ PostgreSQL databases (ports 5432-5435)"
echo "   ✅ Redis (port 6379)"
echo ""

echo "2. To start the microservices, run these commands in separate terminals:"
echo ""
echo -e "${YELLOW}   # User Service${NC}"
echo "   cd services/user-service && npm run dev"
echo ""
echo -e "${YELLOW}   # Training Service${NC}"
echo "   cd services/training-service && npm run dev"
echo ""
echo -e "${YELLOW}   # Schedule Service${NC}"
echo "   cd services/schedule-service && python main.py"
echo ""
echo -e "${YELLOW}   # Progress Service${NC}"
echo "   cd services/progress-service && python main.py"
echo ""
echo -e "${YELLOW}   # Notification Service${NC}"
echo "   cd services/notification-service && npm run dev"
echo ""
echo -e "${YELLOW}   # API Gateway${NC}"
echo "   cd services/api-gateway && npm run dev"
echo ""

echo -e "${BLUE}Or use Docker Compose to run everything:${NC}"
echo "   docker-compose up -d --build"
echo ""

echo "📊 Service Ports:"
echo "   - API Gateway:      http://localhost:4000"
echo "   - User Service:     http://localhost:3001"
echo "   - Training Service: http://localhost:3002"
echo "   - Schedule Service: http://localhost:8003"
echo "   - Progress Service: http://localhost:8004"
echo "   - Notification Svc: http://localhost:3005"
echo ""

echo "🧪 Test the API Gateway:"
echo "   curl http://localhost:4000/health"
echo ""

echo "🔑 Default Login Credentials:"
echo "   Admin:    admin@fitsync.com / Admin@123"
echo "   Trainer:  trainer@fitsync.com / Trainer@123"
echo "   Client:   client@fitsync.com / Client@123"
echo "   Gym Owner: gym@fitsync.com / Gym@123"
echo ""

echo -e "${GREEN}Happy coding! 🚀${NC}"
