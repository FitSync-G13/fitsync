# FitSync Development Guide

Complete guide for local development of the FitSync platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running Services Locally](#running-services-locally)
- [Database Management](#database-management)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Python** 3.11+ ([Download](https://python.org/))
- **pip** (comes with Python)
- **Docker** & Docker Compose ([Download](https://docker.com/))
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL Client** (optional, for database inspection)
- **Redis CLI** (optional, for cache inspection)

### Recommended Tools

- **Visual Studio Code** with extensions:
  - ESLint
  - Prettier
  - Python
  - Docker
  - Thunder Client (API testing)
- **Postman** or **Insomnia** (API testing)
- **pgAdmin** or **DBeaver** (database GUI)
- **Redis Desktop Manager** (Redis GUI)

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fitsync
```

### 2. Start Infrastructure Services

Start only databases and Redis:

```bash
docker-compose up -d userdb trainingdb scheduledb progressdb redis
```

Verify they're running:

```bash
docker-compose ps
```

You should see all 5 containers with "Up" status.

### 3. Set Up Node.js Services

#### User Service

```bash
cd services/user-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (defaults work for local development)
# Run migrations
npm run migrate

# Seed database with test data
npm run seed

# Start in development mode
npm run dev
```

The service will start on **http://localhost:3001**

#### Training Service

```bash
cd services/training-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start in development mode
npm run dev
```

The service will start on **http://localhost:3002**

#### Notification Service

```bash
cd services/notification-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start in development mode
npm run dev
```

The service will start on **http://localhost:3005**

#### API Gateway

```bash
cd services/api-gateway

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start in development mode
npm run dev
```

The gateway will start on **http://localhost:4000**

### 4. Set Up Python Services

#### Schedule Service

```bash
cd services/schedule-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run migrations
python migrate.py

# Seed database
python seed.py

# Start service
python main.py
```

The service will start on **http://localhost:8003**

#### Progress Service

```bash
cd services/progress-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run migrations
python migrate.py

# Seed database
python seed.py

# Start service
python main.py
```

The service will start on **http://localhost:8004**

### 5. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

The frontend will start on **http://localhost:3000**

---

## Database Management

### Accessing Databases

Each service has its own PostgreSQL database:

```bash
# User Service DB
docker exec -it fitsync-userdb psql -U postgres -d userdb

# Training Service DB
docker exec -it fitsync-trainingdb psql -U postgres -d trainingdb

# Schedule Service DB
docker exec -it fitsync-scheduledb psql -U postgres -d scheduledb

# Progress Service DB
docker exec -it fitsync-progressdb psql -U postgres -d progressdb
```

### Common PostgreSQL Commands

```sql
-- List all tables
\dt

-- Describe table structure
\d users

-- View table data
SELECT * FROM users LIMIT 10;

-- Count records
SELECT COUNT(*) FROM users;

-- Exit
\q
```

### Running Migrations

**Node.js Services:**
```bash
npm run migrate
```

**Python Services:**
```bash
python migrate.py
```

### Seeding Data

**Node.js Services:**
```bash
npm run seed
```

**Python Services:**
```bash
python seed.py
```

### Resetting Databases

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Start fresh
docker-compose up -d userdb trainingdb scheduledb progressdb redis

# Re-run migrations and seeds for each service
```

---

## Development Workflow

### 1. Start Development Environment

```bash
# Terminal 1: Infrastructure
docker-compose up -d userdb trainingdb scheduledb progressdb redis

# Terminal 2: User Service
cd services/user-service && npm run dev

# Terminal 3: Training Service
cd services/training-service && npm run dev

# Terminal 4: Schedule Service
cd services/schedule-service && python main.py

# Terminal 5: Progress Service
cd services/progress-service && python main.py

# Terminal 6: Notification Service
cd services/notification-service && npm run dev

# Terminal 7: API Gateway
cd services/api-gateway && npm run dev

# Terminal 8: Frontend
cd frontend && npm start
```

### 2. Making Code Changes

All services use hot-reload:

- **Node.js services**: Use `nodemon` - changes are detected automatically
- **Python services**: Use `uvicorn --reload` - changes are detected automatically
- **Frontend**: React dev server reloads automatically

Simply save your file and the service will restart.

### 3. Testing Changes

1. Make code changes in your editor
2. Service automatically restarts
3. Test using:
   - Frontend UI: http://localhost:3000
   - API calls: Postman, Thunder Client, or curl
   - Health check: `curl http://localhost:4000/health`

---

## Code Standards

### JavaScript/Node.js

**Style Guide**: Follow Airbnb JavaScript Style Guide

**Formatting**:
```bash
npm run format  # Format with Prettier
npm run lint    # Check with ESLint
```

**File Structure**:
```
src/
├── controllers/    # Business logic
├── routes/         # API routes
├── middlewares/    # Express middlewares
├── models/         # Data models
├── services/       # External services
├── utils/          # Helper functions
├── config/         # Configuration
└── index.js        # Entry point
```

**Naming Conventions**:
- Files: `camelCase.js` (e.g., `authController.js`)
- Classes: `PascalCase` (e.g., `UserService`)
- Functions: `camelCase` (e.g., `getUserById`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `JWT_SECRET`)

### Python

**Style Guide**: Follow PEP 8

**Formatting**:
```bash
black .         # Format code
flake8 .        # Lint code
```

**File Structure**:
```
/
├── main.py         # Entry point
├── migrate.py      # Migrations
├── seed.py         # Seed data
├── config.py       # Configuration
└── requirements.txt
```

**Naming Conventions**:
- Files: `snake_case.py` (e.g., `user_controller.py`)
- Classes: `PascalCase` (e.g., `BookingService`)
- Functions: `snake_case` (e.g., `get_user_by_id`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `JWT_SECRET`)

### React/Frontend

**Style Guide**: Follow React best practices

**File Structure**:
```
src/
├── components/     # React components
│   ├── auth/
│   └── dashboard/
├── contexts/       # React contexts
├── services/       # API services
├── App.js         # Main component
└── index.js       # Entry point
```

**Naming Conventions**:
- Components: `PascalCase.js` (e.g., `LoginForm.js`)
- Hooks: `useCamelCase` (e.g., `useAuth`)
- CSS classes: `kebab-case` (e.g., `auth-container`)

---

## Testing

### Running Tests

**Node.js Services**:
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Python Services**:
```bash
pytest                    # Run all tests
pytest --cov             # Coverage report
pytest -v tests/         # Verbose output
```

**Frontend**:
```bash
npm test                 # Run tests
npm run test:coverage    # Coverage report
```

### Writing Tests

**Example: Node.js Unit Test**
```javascript
// authController.test.js
const { login } = require('./authController');

describe('Auth Controller', () => {
  test('should login with valid credentials', async () => {
    const req = {
      validatedBody: {
        email: 'test@example.com',
        password: 'Test@123'
      }
    };
    const res = {
      json: jest.fn()
    };

    await login(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
  });
});
```

**Example: Python Unit Test**
```python
# test_booking.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_booking():
    response = client.post("/api/bookings", json={
        "trainer_id": "uuid-here",
        "booking_date": "2025-12-01",
        "start_time": "10:00:00",
        "end_time": "11:00:00"
    })
    assert response.status_code == 201
    assert "booking_id" in response.json()
```

---

## Debugging

### Node.js Services

**VS Code Launch Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug User Service",
      "program": "${workspaceFolder}/services/user-service/src/index.js",
      "envFile": "${workspaceFolder}/services/user-service/.env",
      "console": "integratedTerminal"
    }
  ]
}
```

**Console Debugging**:
```bash
# Set breakpoint in code with debugger; statement
node --inspect src/index.js

# Connect Chrome DevTools to chrome://inspect
```

### Python Services

**VS Code Launch Configuration**:
```json
{
  "type": "python",
  "request": "launch",
  "name": "Debug Schedule Service",
  "program": "${workspaceFolder}/services/schedule-service/main.py",
  "console": "integratedTerminal"
}
```

**Console Debugging**:
```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use built-in debugger
breakpoint()
```

### Logging

All services log to console:

**View Logs**:
```bash
# Docker logs
docker-compose logs -f user-service

# Local service logs
# They output directly to your terminal
```

**Log Levels**:
- `error`: Critical issues
- `warn`: Warnings
- `info`: General information
- `debug`: Detailed debugging (enable in development)

---

## Common Tasks

### Add New API Endpoint

**1. Node.js Service Example (User Service)**

```javascript
// src/controllers/userController.js
exports.updatePassword = async (req, res) => {
  const { current_password, new_password } = req.validatedBody;
  const userId = req.user.id;

  // Verify current password
  // Update password
  // Return success

  res.json({ success: true, message: 'Password updated' });
};

// src/routes/userRoutes.js
const { updatePassword } = require('../controllers/userController');
router.put('/password', authenticate, updatePassword);
```

**2. Python Service Example (Schedule Service)**

```python
# main.py
@app.post("/api/availability")
async def set_availability(
    availability: AvailabilityCreate,
    authorization: str = Depends(get_auth_header)
):
    user = get_current_user(authorization)
    # Create availability
    # Return result
    return {"success": True, "data": availability}
```

### Add Database Migration

**Node.js**:
```javascript
// migrations/003_add_profile_picture.js
exports.up = async (db) => {
  await db.query(`
    ALTER TABLE users
    ADD COLUMN profile_picture_url VARCHAR(255)
  `);
};

exports.down = async (db) => {
  await db.query(`
    ALTER TABLE users
    DROP COLUMN profile_picture_url
  `);
};
```

**Python**:
```python
# migrate.py - add to migrations list
migrations = [
    "ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(255)"
]
```

### Add New Frontend Page

```javascript
// src/components/profile/ProfilePage.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="card">
      <h1>My Profile</h1>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default ProfilePage;

// src/App.js - add route
<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

---

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check database is running
docker-compose ps

# Restart database
docker-compose restart userdb

# Check connection string in .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=userdb
DB_USER=postgres
DB_PASSWORD=postgres
```

### Redis Connection Failed

```bash
# Check Redis is running
docker-compose ps redis

# Restart Redis
docker-compose restart redis

# Test connection
docker exec -it fitsync-redis redis-cli ping
```

### Module Not Found

```bash
# Node.js
rm -rf node_modules package-lock.json
npm install

# Python
pip install -r requirements.txt
```

### Migration Failed

```bash
# Node.js
# Delete migrations table and re-run
npm run migrate:fresh

# Python
# Drop database and recreate
docker-compose down -v
docker-compose up -d scheduledb
python migrate.py
```

---

## Git Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/add-booking-calendar

# Make changes, commit regularly
git add .
git commit -m "feat: add calendar component for bookings"

# Push to remote
git push origin feature/add-booking-calendar

# Create pull request
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile page
fix: resolve booking conflict detection bug
docs: update API documentation
style: format code with prettier
refactor: simplify authentication flow
test: add tests for workout controller
chore: update dependencies
```

---

## Performance Optimization

### Database Query Optimization

```javascript
// Bad - N+1 queries
for (const booking of bookings) {
  const trainer = await getTrainerById(booking.trainer_id);
}

// Good - Single query with JOIN
const bookings = await db.query(`
  SELECT b.*, u.first_name, u.last_name
  FROM bookings b
  JOIN users u ON u.id = b.trainer_id
`);
```

### Caching Strategy

```javascript
// Check cache first
const cached = await redis.get(`user:${userId}`);
if (cached) return JSON.parse(cached);

// Query database
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// Store in cache
await redis.setex(`user:${userId}`, 900, JSON.stringify(user));
```

---

## Next Steps

- **[Quick Start Guide](QUICK_START.md)** - Get up and running quickly
- **[API Documentation](API.md)** - Complete API reference
- **[Architecture Guide](ARCHITECTURE.md)** - System design details
- **[Main README](../README.md)** - Project overview

---

**Happy coding! Build amazing fitness features!** 🚀💪

**Last Updated:** November 24, 2025
