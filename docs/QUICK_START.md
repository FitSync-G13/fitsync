# FitSync Quick Start Guide

Get FitSync up and running in 5 minutes!

## Prerequisites

Before you begin, ensure you have:
- ✅ **Docker** installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- ✅ **Docker Compose** (included with Docker Desktop)
- ✅ At least **4GB RAM** available for Docker
- ✅ Ports **3000-3005**, **4000**, **5432-5435**, **6379**, **8003-8004** available

## Installation Methods

### Method 1: Docker Compose (Recommended - Fastest)

This method starts everything with a single command:

```bash
# Navigate to the project directory
cd fitsync

# Start all services (build images first)
docker-compose up -d --build

# Wait 30-60 seconds for all services to initialize

# Check that all services are running
docker-compose ps
```

**Note:** The `--build` flag ensures all Docker images are built with the latest dependencies. This is essential when running for the first time after cloning the repository.

**Expected output:**
```
NAME                    STATUS    PORTS
fitsync-api-gateway     Up        0.0.0.0:4000->4000/tcp
fitsync-user-service    Up        0.0.0.0:3001->3001/tcp
fitsync-training        Up        0.0.0.0:3002->3002/tcp
fitsync-schedule        Up        0.0.0.0:8003->8003/tcp
fitsync-progress        Up        0.0.0.0:8004->8004/tcp
fitsync-notification    Up        0.0.0.0:3005->3005/tcp
fitsync-frontend        Up        0.0.0.0:3000->3000/tcp
fitsync-userdb          Up        5432/tcp
fitsync-trainingdb      Up        5433/tcp
fitsync-scheduledb      Up        5434/tcp
fitsync-progressdb      Up        5435/tcp
fitsync-redis           Up        6379/tcp
```

### Method 2: Automated Scripts

**For Windows:**
```cmd
cd fitsync
start-services.bat
```

**For Mac/Linux:**
```bash
cd fitsync
chmod +x start-all-services.sh
./start-all-services.sh
```

### Method 3: Manual Local Development

If you want to run services locally without Docker:

#### Step 1: Start Infrastructure
```bash
# Start only databases and Redis
docker-compose up -d userdb trainingdb scheduledb progressdb redis
```

#### Step 2: Start Backend Services

**Terminal 1 - User Service:**
```bash
cd services/user-service
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

**Terminal 2 - Training Service:**
```bash
cd services/training-service
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

**Terminal 3 - Schedule Service:**
```bash
cd services/schedule-service
pip install -r requirements.txt
cp .env.example .env
python migrate.py
python seed.py
python main.py
```

**Terminal 4 - Progress Service:**
```bash
cd services/progress-service
pip install -r requirements.txt
cp .env.example .env
python migrate.py
python seed.py
python main.py
```

**Terminal 5 - Notification Service:**
```bash
cd services/notification-service
npm install
cp .env.example .env
npm run dev
```

**Terminal 6 - API Gateway:**
```bash
cd services/api-gateway
npm install
cp .env.example .env
npm run dev
```

**Terminal 7 - Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## Verify Installation

### 1. Check Service Health

```bash
# Check API Gateway
curl http://localhost:4000/health

# Check individual services
curl http://localhost:3001/health  # User Service
curl http://localhost:3002/health  # Training Service
curl http://localhost:8003/health  # Schedule Service
curl http://localhost:8004/health  # Progress Service
curl http://localhost:3005/health  # Notification Service
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "user-service",
  "timestamp": "2025-11-24T12:00:00.000Z"
}
```

### 2. Access the Frontend

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the FitSync login page with a gradient background.

## Your First Login

### Quick Login (Demo Mode)

The login page has quick login buttons for testing:

1. Click **"Client"** button
   - Logs in as: client@fitsync.com
   - You'll see the Client Dashboard

2. Click **"Trainer"** button
   - Logs in as: trainer@fitsync.com
   - You'll see the Trainer Dashboard

3. Click **"Admin"** button
   - Logs in as: admin@fitsync.com
   - You'll see the Admin Dashboard

4. Click **"Gym Owner"** button
   - Logs in as: gym@fitsync.com
   - You'll see the Gym Owner Dashboard

### Manual Login

You can also manually enter credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fitsync.com | Admin@123 |
| Trainer | trainer@fitsync.com | Trainer@123 |
| Client | client@fitsync.com | Client@123 |
| Gym Owner | gym@fitsync.com | Gym@123 |

## Explore the Application

### As a Client

After logging in as a client, you can:

1. **View Dashboard**
   - See workout statistics
   - View upcoming sessions
   - Check active programs
   - Monitor current weight

2. **Book Sessions** (via API or upcoming UI)
   ```bash
   curl -X POST http://localhost:4000/api/bookings \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "trainer_id": "uuid-of-trainer",
       "booking_date": "2025-12-01",
       "start_time": "10:00:00",
       "end_time": "11:00:00"
     }'
   ```

3. **Track Progress**
   ```bash
   curl -X POST http://localhost:4000/api/metrics \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "weight_kg": 75.5,
       "height_cm": 175,
       "recorded_date": "2025-11-24"
     }'
   ```

### As a Trainer

After logging in as a trainer, you can:

1. **View Schedule**
   - See today's sessions
   - Check total bookings
   - View active programs

2. **Manage Exercises**
   ```bash
   curl -X POST http://localhost:4000/api/exercises \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Barbell Squat",
       "description": "Compound leg exercise",
       "muscle_group": "legs",
       "equipment_needed": "barbell",
       "difficulty_level": "intermediate"
     }'
   ```

3. **Create Workout Plans**
   ```bash
   curl -X POST http://localhost:4000/api/workouts \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Full Body Strength",
       "description": "3x per week full body routine",
       "goal": "muscle_gain",
       "exercises": [
         {"exercise_id": "uuid-1", "sets": 4, "reps": 8, "rest_seconds": 90},
         {"exercise_id": "uuid-2", "sets": 3, "reps": 10, "rest_seconds": 60}
       ]
     }'
   ```

## Testing the API

### Get Access Token

First, login to get an access token:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@fitsync.com",
    "password": "Client@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "client@fitsync.com",
      "role": "client",
      "first_name": "John",
      "last_name": "Client"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

Copy the `access_token` value for use in subsequent requests.

### Make Authenticated Requests

```bash
# Get your profile
curl http://localhost:4000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get exercises
curl http://localhost:4000/api/exercises \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get your bookings
curl http://localhost:4000/api/bookings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get your progress metrics
curl http://localhost:4000/api/metrics/client/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Common Commands

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f user-service

# Restart a service
docker-compose restart user-service

# Rebuild services (after code changes)
docker-compose up -d --build

# Stop and remove all containers, networks, volumes
docker-compose down -v
```

### Development Commands

```bash
# Node.js services
npm install          # Install dependencies
npm run migrate      # Run database migrations
npm run seed         # Seed database with test data
npm run dev          # Start in development mode
npm test             # Run tests

# Python services
pip install -r requirements.txt  # Install dependencies
python migrate.py                # Run migrations
python seed.py                   # Seed database
python main.py                   # Start service
uvicorn main:app --reload        # Start with auto-reload
```

## Troubleshooting

### Services Won't Start

**Problem:** Docker containers fail to start

**Solution:**
```bash
# Check Docker is running
docker ps

# Check logs for errors
docker-compose logs

# Remove old containers and try again
docker-compose down -v
docker-compose up -d --build
```

### Port Already in Use

**Problem:** Error: "Port 3000 is already in use"

**Solution:**

Windows:
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Mac/Linux:
```bash
lsof -i :3000
kill -9 <PID>
```

### Cannot Connect to Database

**Problem:** Services can't connect to PostgreSQL

**Solution:**
```bash
# Check database containers are running
docker-compose ps

# Restart databases
docker-compose restart userdb trainingdb scheduledb progressdb

# Check database logs
docker-compose logs userdb
```

### Frontend Shows "Network Error"

**Problem:** Frontend can't reach backend

**Solution:**
1. Verify API Gateway is running on port 4000:
   ```bash
   curl http://localhost:4000/health
   ```

2. Check `.env` file in frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:4000/api
   ```

3. Restart frontend:
   ```bash
   cd frontend
   npm start
   ```

### Frontend Shows "Cannot find module" Errors

**Problem:** Frontend displays errors like "Cannot find module 'framer-motion'" or other dependency errors

**Solution:**
This happens when Docker containers start without properly installed dependencies. Fix it by rebuilding:

```bash
# Option 1: Rebuild all services
docker-compose down
docker-compose up -d --build

# Option 2: Rebuild only frontend
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d

# Option 3: Install dependencies locally first
cd frontend
npm install
cd ..
docker-compose up -d
```

### Token Expired

**Problem:** Getting 401 Unauthorized errors

**Solution:**
- Access tokens expire after 15 minutes
- The frontend automatically refreshes tokens
- If it fails, log out and log back in

## Next Steps

Now that FitSync is running, you can:

1. **Explore the API**: Check out the [API Documentation](API.md)
2. **Understand the Architecture**: Read the [Architecture Guide](ARCHITECTURE.md)
3. **Set up Development Environment**: Follow the [Development Guide](DEVELOPMENT.md)
4. **Add New Features**: Extend the system with custom functionality

## Getting Help

If you encounter issues:

1. Check service logs: `docker-compose logs -f`
2. Verify all services are healthy: `curl http://localhost:4000/health`
3. Review the [main README](../README.md)
4. Check environment variables in `.env` files

---

**Congratulations! FitSync is now running on your machine!** 🎉

Access the application at: **http://localhost:3000**
