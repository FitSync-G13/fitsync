#!/bin/bash

# Service Template Generator for FitSync
# Usage: ./create-service-template.sh <service-name> <port> <language>
# Example: ./create-service-template.sh training-service 3002 node

SERVICE_NAME=$1
PORT=$2
LANGUAGE=$3

if [ -z "$SERVICE_NAME" ] || [ -z "$PORT" ] || [ -z "$LANGUAGE" ]; then
    echo "Usage: ./create-service-template.sh <service-name> <port> <language>"
    echo "Example: ./create-service-template.sh training-service 3002 node"
    echo "Languages: node | python"
    exit 1
fi

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_DIR="$BASE_DIR/services/$SERVICE_NAME"

echo "Creating $SERVICE_NAME in $SERVICE_DIR..."

if [ "$LANGUAGE" = "node" ]; then
    # Create Node.js service structure
    mkdir -p "$SERVICE_DIR/src/"{config,database,controllers,routes,middleware,utils}

    # Copy config files from user-service
    cp "$BASE_DIR/services/user-service/Dockerfile" "$SERVICE_DIR/"
    cp "$BASE_DIR/services/user-service/src/config"/* "$SERVICE_DIR/src/config/"
    cp "$BASE_DIR/services/user-service/src/middleware/auth.js" "$SERVICE_DIR/src/middleware/"

    # Create package.json
    cat > "$SERVICE_DIR/package.json" <<EOF
{
  "name": "$SERVICE_NAME",
  "version": "1.0.0",
  "description": "FitSync $SERVICE_NAME",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "migrate": "node src/database/migrate.js",
    "seed": "node src/database/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "redis": "^4.6.11",
    "uuid": "^9.0.1",
    "joi": "^17.11.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

    # Create .env.example
    cat > "$SERVICE_DIR/.env.example" <<EOF
NODE_ENV=development
PORT=$PORT

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=${SERVICE_NAME//-/}db
DB_USER=fitsync
DB_PASSWORD=fitsync123

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Other Services
USER_SERVICE_URL=http://localhost:3001
EOF

    # Create basic index.js
    cat > "$SERVICE_DIR/src/index.js" <<'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./config/logger');
const { connectRedis } = require('./config/redis');
const { runMigrations } = require('./database/migrate');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: process.env.npm_package_name,
    timestamp: new Date().toISOString()
  });
});

// TODO: Add your routes here
// app.use('/api/resource', require('./routes/resource'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' }
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }
  });
});

// Start server
async function startServer() {
  try {
    await connectRedis();
    await runMigrations();
    app.listen(PORT, () => {
      logger.info(`${process.env.npm_package_name} running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
EOF

    # Create basic migrate.js
    cat > "$SERVICE_DIR/src/database/migrate.js" <<'EOF'
const db = require('../config/database');
const logger = require('../config/logger');

const migrations = [
  {
    name: 'create_initial_tables',
    up: `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Add your table definitions here
      CREATE TABLE IF NOT EXISTS example_table (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  }
];

async function runMigrations() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const { rows: executed } = await client.query('SELECT name FROM migrations');
    const executedNames = new Set(executed.map(row => row.name));

    for (const migration of migrations) {
      if (!executedNames.has(migration.name)) {
        logger.info(`Running migration: ${migration.name}`);
        await client.query(migration.up);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
      }
    }

    await client.query('COMMIT');
    logger.info('Migrations completed');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigrations };
EOF

    # Create basic seed.js
    cat > "$SERVICE_DIR/src/database/seed.js" <<'EOF'
const db = require('../config/database');
const logger = require('../config/logger');

async function seed() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Add your seed data here

    await client.query('COMMIT');
    logger.info('Seed completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Seed failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seed };
EOF

    echo "✅ Node.js service template created for $SERVICE_NAME"
    echo "Next steps:"
    echo "1. cd $SERVICE_DIR"
    echo "2. npm install"
    echo "3. Update src/database/migrate.js with your schema"
    echo "4. Update src/database/seed.js with sample data"
    echo "5. Create controllers, routes, and middleware"
    echo "6. npm run dev"

elif [ "$LANGUAGE" = "python" ]; then
    # Create Python/FastAPI service structure
    mkdir -p "$SERVICE_DIR/"{config,database,models,routers,middleware}

    # Create requirements.txt
    cat > "$SERVICE_DIR/requirements.txt" <<EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
asyncpg==0.29.0
redis==5.0.1
python-jose[cryptography]==3.3.0
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
EOF

    # Create Dockerfile
    cat > "$SERVICE_DIR/Dockerfile" <<EOF
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE $PORT

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT", "--reload"]
EOF

    # Create .env.example
    cat > "$SERVICE_DIR/.env.example" <<EOF
ENVIRONMENT=development
PORT=$PORT

# Database
DB_HOST=localhost
DB_PORT=5434
DB_NAME=${SERVICE_NAME//-/}db
DB_USER=fitsync
DB_PASSWORD=fitsync123

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Other Services
USER_SERVICE_URL=http://localhost:3001
EOF

    # Create main.py
    cat > "$SERVICE_DIR/main.py" <<'EOF'
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os

from config.database import init_db, close_db
from config.redis import init_redis, close_redis

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await init_redis()
    yield
    # Shutdown
    await close_db()
    await close_redis()

app = FastAPI(
    title=os.getenv("npm_package_name", "FitSync Service"),
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": os.getenv("npm_package_name", "service"),
        "timestamp": datetime.utcnow().isoformat()
    }

# TODO: Include your routers here
# app.include_router(resource_router, prefix="/api/resource", tags=["resource"])

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
EOF

    echo "✅ Python/FastAPI service template created for $SERVICE_NAME"
    echo "Next steps:"
    echo "1. cd $SERVICE_DIR"
    echo "2. pip install -r requirements.txt"
    echo "3. Create config/database.py and config/redis.py"
    echo "4. Create database/migrate.py with your schema"
    echo "5. Create models and routers"
    echo "6. uvicorn main:app --reload --port $PORT"
fi

echo ""
echo "Service template created successfully!"
