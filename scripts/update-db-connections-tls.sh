#!/bin/bash

# Script to update database connection strings to use TLS
# This script updates all services to use PostgreSQL connection strings with TLS enabled

set -e

WORK_DIR="/d/Courses/WSO2_Linux/GP/GitHub/fitsync-separated"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Update User Service
update_user_service() {
    print_info "Updating User Service database configuration..."

    local service_dir="${WORK_DIR}/fitsync-user-service"
    if [ ! -d "$service_dir" ]; then
        print_warning "User service directory not found: $service_dir"
        return
    fi

    cd "$service_dir"

    # Update database.js
    cat > src/config/database.js <<'EOF'
const { Pool } = require('pg');
const logger = require('./logger');

// Support both connection string and individual parameters
const getConnectionConfig = () => {
  if (process.env.DATABASE_URL) {
    // Use connection string if provided
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false  // Allow insecure certs for development
      }
    };
  }

  // Build connection string from individual parameters
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require`;

  return {
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false  // Allow insecure certs for development
    }
  };
};

const config = getConnectionConfig();

const pool = new Pool(config);

pool.on('connect', () => {
  logger.info('Database connection established with TLS');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
EOF

    # Update .env.example
    cat > .env.example <<'EOF'
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (Option 1: Use connection string)
DATABASE_URL=postgresql://fitsync:password@localhost:5432/userdb?sslmode=require

# Database Configuration (Option 2: Use individual parameters)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=userdb
# DB_USER=fitsync
# DB_PASSWORD=password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Logging
LOG_LEVEL=info
EOF

    git add src/config/database.js .env.example
    git commit -m "Update database configuration to use TLS connection strings" || true

    print_info "✓ User Service updated"
}

# Update Training Service
update_training_service() {
    print_info "Updating Training Service database configuration..."

    local service_dir="${WORK_DIR}/fitsync-training-service"
    if [ ! -d "$service_dir" ]; then
        print_warning "Training service directory not found: $service_dir"
        return
    fi

    cd "$service_dir"

    # Update database.js (same as user service)
    cat > src/config/database.js <<'EOF'
const { Pool } = require('pg');
const logger = require('./logger');

// Support both connection string and individual parameters
const getConnectionConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    };
  }

  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require`;

  return {
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  };
};

const config = getConnectionConfig();
const pool = new Pool(config);

pool.on('connect', () => {
  logger.info('Database connection established with TLS');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
EOF

    # Update .env.example
    cat > .env.example <<'EOF'
# Server Configuration
PORT=3002
NODE_ENV=development

# Database Configuration (Option 1: Use connection string)
DATABASE_URL=postgresql://fitsync:password@localhost:5433/trainingdb?sslmode=require

# Database Configuration (Option 2: Use individual parameters)
# DB_HOST=localhost
# DB_PORT=5433
# DB_NAME=trainingdb
# DB_USER=fitsync
# DB_PASSWORD=password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Service URLs
USER_SERVICE_URL=http://localhost:3001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Logging
LOG_LEVEL=info
EOF

    git add src/config/database.js .env.example
    git commit -m "Update database configuration to use TLS connection strings" || true

    print_info "✓ Training Service updated"
}

# Update Schedule Service (Python)
update_schedule_service() {
    print_info "Updating Schedule Service database configuration..."

    local service_dir="${WORK_DIR}/fitsync-schedule-service"
    if [ ! -d "$service_dir" ]; then
        print_warning "Schedule service directory not found: $service_dir"
        return
    fi

    cd "$service_dir"

    # Update config.py
    cat > config/database.py <<'EOF'
import os
from typing import Optional

def get_database_url() -> str:
    """
    Get database connection URL with TLS enabled.
    Supports both DATABASE_URL environment variable and individual parameters.
    """
    # Option 1: Use DATABASE_URL if provided
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Ensure sslmode is set
        if "sslmode" not in database_url:
            database_url += "?sslmode=require" if "?" not in database_url else "&sslmode=require"
        return database_url

    # Option 2: Build from individual parameters
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5434")
    db_name = os.getenv("DB_NAME", "scheduledb")
    db_user = os.getenv("DB_USER", "fitsync")
    db_password = os.getenv("DB_PASSWORD", "password")

    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?sslmode=require"

DATABASE_URL = get_database_url()

# Connection pool settings
MIN_POOL_SIZE = int(os.getenv("DB_POOL_MIN", "10"))
MAX_POOL_SIZE = int(os.getenv("DB_POOL_MAX", "20"))
EOF

    # Update main.py to import from config
    if [ -f "main.py" ]; then
        # Check if already importing from config
        if ! grep -q "from config.database import DATABASE_URL" main.py; then
            # Add import at the top
            sed -i '1i from config.database import DATABASE_URL' main.py
        fi
    fi

    # Update .env.example
    cat > .env.example <<'EOF'
# Server Configuration
PORT=8003
ENVIRONMENT=development

# Database Configuration (Option 1: Use connection string)
DATABASE_URL=postgresql://fitsync:password@localhost:5434/scheduledb?sslmode=require

# Database Configuration (Option 2: Use individual parameters)
# DB_HOST=localhost
# DB_PORT=5434
# DB_NAME=scheduledb
# DB_USER=fitsync
# DB_PASSWORD=password

# Database Pool Settings
DB_POOL_MIN=10
DB_POOL_MAX=20

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Service URLs
USER_SERVICE_URL=http://localhost:3001
TRAINING_SERVICE_URL=http://localhost:3002

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Logging
LOG_LEVEL=info
EOF

    git add config/database.py .env.example
    [ -f "main.py" ] && git add main.py
    git commit -m "Update database configuration to use TLS connection strings" || true

    print_info "✓ Schedule Service updated"
}

# Update Progress Service (Python)
update_progress_service() {
    print_info "Updating Progress Service database configuration..."

    local service_dir="${WORK_DIR}/fitsync-progress-service"
    if [ ! -d "$service_dir" ]; then
        print_warning "Progress service directory not found: $service_dir"
        return
    fi

    cd "$service_dir"

    # Update config.py
    cat > config/database.py <<'EOF'
import os
from typing import Optional

def get_database_url() -> str:
    """
    Get database connection URL with TLS enabled.
    Supports both DATABASE_URL environment variable and individual parameters.
    """
    # Option 1: Use DATABASE_URL if provided
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Ensure sslmode is set
        if "sslmode" not in database_url:
            database_url += "?sslmode=require" if "?" not in database_url else "&sslmode=require"
        return database_url

    # Option 2: Build from individual parameters
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5435")
    db_name = os.getenv("DB_NAME", "progressdb")
    db_user = os.getenv("DB_USER", "fitsync")
    db_password = os.getenv("DB_PASSWORD", "password")

    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?sslmode=require"

DATABASE_URL = get_database_url()

# Connection pool settings
MIN_POOL_SIZE = int(os.getenv("DB_POOL_MIN", "10"))
MAX_POOL_SIZE = int(os.getenv("DB_POOL_MAX", "20"))
EOF

    # Update main.py to import from config
    if [ -f "main.py" ]; then
        if ! grep -q "from config.database import DATABASE_URL" main.py; then
            sed -i '1i from config.database import DATABASE_URL' main.py
        fi
    fi

    # Update .env.example
    cat > .env.example <<'EOF'
# Server Configuration
PORT=8004
ENVIRONMENT=development

# Database Configuration (Option 1: Use connection string)
DATABASE_URL=postgresql://fitsync:password@localhost:5435/progressdb?sslmode=require

# Database Configuration (Option 2: Use individual parameters)
# DB_HOST=localhost
# DB_PORT=5435
# DB_NAME=progressdb
# DB_USER=fitsync
# DB_PASSWORD=password

# Database Pool Settings
DB_POOL_MIN=10
DB_POOL_MAX=20

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Service URLs
USER_SERVICE_URL=http://localhost:3001
SCHEDULE_SERVICE_URL=http://localhost:8003
TRAINING_SERVICE_URL=http://localhost:3002

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Logging
LOG_LEVEL=info
EOF

    git add config/database.py .env.example
    [ -f "main.py" ] && git add main.py
    git commit -m "Update database configuration to use TLS connection strings" || true

    print_info "✓ Progress Service updated"
}

# Main execution
main() {
    print_info "================================================"
    print_info "Updating Database Connections for TLS"
    print_info "================================================"
    echo ""

    if [ ! -d "$WORK_DIR" ]; then
        print_warning "Work directory not found: $WORK_DIR"
        print_warning "Please run separate-repositories.sh first"
        exit 1
    fi

    update_user_service
    echo ""
    update_training_service
    echo ""
    update_schedule_service
    echo ""
    update_progress_service
    echo ""

    print_info "================================================"
    print_info "✓ All services updated to use TLS"
    print_info "================================================"
    echo ""
    print_info "Next steps:"
    echo "  1. Push changes to each repository"
    echo "  2. Update your database server to enable TLS"
    echo "  3. Test each service with TLS-enabled database"
    echo ""
}

main
