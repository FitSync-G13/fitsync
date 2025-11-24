#!/bin/bash

# FitSync Setup Script - Automated deployment and initialization
# This script sets up the entire FitSync application from scratch

set -e  # Exit on error

echo "========================================"
echo "  FitSync Automated Setup Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "→ $1"
}

# Step 1: Create .env files for all services
print_info "Step 1: Creating .env files for all services..."

# User Service .env
cat > services/user-service/.env <<EOF
NODE_ENV=development
PORT=3001

# Database
DB_HOST=userdb
DB_PORT=5432
DB_NAME=userdb
DB_USER=fitsync
DB_PASSWORD=fitsync123

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
EOF
print_success "User service .env created"

# Training Service .env
cat > services/training-service/.env <<EOF
NODE_ENV=development
PORT=3002

# Database
DB_HOST=trainingdb
DB_PORT=5432
DB_NAME=trainingdb
DB_USER=fitsync
DB_PASSWORD=fitsync123

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Service URLs
USER_SERVICE_URL=http://user-service:3001
EOF
print_success "Training service .env created"

# API Gateway .env
cat > services/api-gateway/.env <<EOF
NODE_ENV=development
PORT=4000

# Service URLs
USER_SERVICE_URL=http://user-service:3001
TRAINING_SERVICE_URL=http://training-service:3002
SCHEDULE_SERVICE_URL=http://schedule-service:8003
PROGRESS_SERVICE_URL=http://progress-service:8004
NOTIFICATION_SERVICE_URL=http://notification-service:3005

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
EOF
print_success "API Gateway .env created"

# Notification Service .env
cat > services/notification-service/.env <<EOF
NODE_ENV=development
PORT=3005

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Service URLs
USER_SERVICE_URL=http://user-service:3001

# SMTP (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@fitsync.com
SMTP_PASSWORD=your-smtp-password
EOF
print_success "Notification service .env created"

# Frontend .env
cat > frontend/.env <<EOF
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_WS_URL=ws://localhost:4000
EOF
print_success "Frontend .env created"

# Step 2: Build and start services
print_info "Step 2: Building and starting Docker containers..."
docker-compose down -v 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

print_success "Docker containers started"

# Step 3: Wait for services to be healthy
print_info "Step 3: Waiting for services to be healthy (30 seconds)..."
sleep 30

# Step 4: Seed databases
print_info "Step 4: Seeding databases with sample data..."

# Seed user database
print_info "Seeding user database..."
docker exec fitsync-user-service npm run seed
print_success "User database seeded"

# Seed training database
print_info "Seeding training database..."
docker exec fitsync-training-service npm run seed
print_success "Training database seeded"

# Seed schedule database
print_info "Seeding schedule database..."
docker exec -i fitsync-scheduledb psql -U fitsync -d scheduledb <<'EOSQL'
INSERT INTO bookings (type, trainer_id, client_id, gym_id, booking_date, start_time, end_time, status)
SELECT
  'one_on_one',
  (SELECT id FROM (VALUES
    ('58e50514-ddec-41d3-9790-b7015bea18c8'),
    ('0da6da83-e24c-4b93-952a-37b0e9f53594')
  ) AS trainers(id) LIMIT 1 OFFSET floor(random() * 2)::int),
  (SELECT id FROM (VALUES
    ('ae66398b-5d22-45dc-8024-59fb1352f121'),
    ('f4ee037d-5953-4fd0-919e-1234f44acafb'),
    ('ecdd961f-9c8f-4c06-968e-c3fead20eae7')
  ) AS clients(id) LIMIT 1 OFFSET floor(random() * 3)::int),
  '65710aef-2ba3-49d1-a4e1-f422dee801d1',
  CURRENT_DATE + (n - 2),
  ('09:00:00'::time + (n * interval '2 hours')),
  ('10:00:00'::time + (n * interval '2 hours')),
  CASE WHEN n <= 0 THEN 'completed' ELSE 'scheduled' END
FROM generate_series(-2, 3) AS n
ON CONFLICT DO NOTHING;
EOSQL
print_success "Schedule database seeded"

# Seed progress database
print_info "Seeding progress database..."
docker exec -i fitsync-progressdb psql -U fitsync -d progressdb <<'EOSQL'
INSERT INTO body_metrics (client_id, recorded_date, weight_kg, height_cm, bmi, body_fat_percentage, measurements)
SELECT
  client_id,
  CURRENT_DATE - (n * 7),
  75.0 - (n * 0.5),
  175.0,
  24.5 - (n * 0.1),
  18.0 - (n * 0.3),
  '{"chest": 95, "waist": 80, "hips": 95}'::jsonb
FROM (VALUES ('ae66398b-5d22-45dc-8024-59fb1352f121')) AS clients(client_id),
     generate_series(0, 4) AS n
ON CONFLICT DO NOTHING;

INSERT INTO workout_logs (client_id, workout_date, exercises_completed, total_duration_minutes, calories_burned, client_notes, mood_rating)
SELECT
  client_id,
  CURRENT_DATE - n,
  '[{"name": "Bench Press", "sets": 4, "reps": 8, "weight": 80}]'::jsonb,
  60,
  450,
  'Great session!',
  5
FROM (VALUES ('ae66398b-5d22-45dc-8024-59fb1352f121')) AS clients(client_id),
     generate_series(1, 3) AS n
ON CONFLICT DO NOTHING;
EOSQL
print_success "Progress database seeded"

# Step 5: Verify services
print_info "Step 5: Verifying all services..."

check_service() {
    local service=$1
    local url=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        print_success "$service is healthy"
        return 0
    else
        print_error "$service is not responding"
        return 1
    fi
}

check_service "API Gateway" "http://localhost:4000/health"
check_service "User Service" "http://localhost:3001/health"
check_service "Training Service" "http://localhost:3002/health"
check_service "Schedule Service" "http://localhost:8003/health"
check_service "Progress Service" "http://localhost:8004/health"
check_service "Notification Service" "http://localhost:3005/health"

echo ""
print_success "Setup complete!"
echo ""
echo "========================================"
echo "  FitSync is ready!"
echo "========================================"
echo ""
echo "Frontend: http://localhost:3000"
echo "API Gateway: http://localhost:4000"
echo ""
echo "Test Credentials:"
echo "  Admin:      admin@fitsync.com / Admin@123"
echo "  Trainer:    trainer@fitsync.com / Trainer@123"
echo "  Client:     client@fitsync.com / Client@123"
echo "  Gym Owner:  gym@fitsync.com / Gym@123"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f              # View all logs"
echo "  docker-compose restart <service>    # Restart a service"
echo "  docker-compose down                 # Stop all services"
echo ""
