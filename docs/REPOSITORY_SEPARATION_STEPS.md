# Repository Separation - Step-by-Step Guide

**Date:** 2025-12-08
**Purpose:** Separate FitSync mono-repo into individual service repositories

---

## Overview

We will create **9 new repositories**:

### Service Repositories (6)
1. `fitsync-api-gateway`
2. `fitsync-user-service`
3. `fitsync-training-service`
4. `fitsync-schedule-service`
5. `fitsync-progress-service`
6. `fitsync-notification-service`

### Frontend Repository (1)
7. `fitsync-frontend`

### Docker Compose Repository (1)
8. `fitsync-docker-compose`

---

## Prerequisites

- [x] Git installed
- [x] git-filter-repo installed (`pip install git-filter-repo`)
- [ ] GitHub account with access to FitSync-G13 organization
- [ ] GitHub CLI installed (optional: `winget install GitHub.cli`)

---

## Option 1: Automated Script (Recommended)

### Step 1: Run the Separation Script

```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync
chmod +x scripts/separate-repositories.sh
./scripts/separate-repositories.sh
```

The script will:
1. Create all GitHub repositories (requires gh CLI or manual creation)
2. Extract each service with git history preservation
3. Extract frontend
4. Create docker-compose repository
5. Push all repositories to GitHub

### Step 2: Verify Repositories

Check that all repositories were created:
- https://github.com/FitSync-G13/fitsync-api-gateway
- https://github.com/FitSync-G13/fitsync-user-service
- https://github.com/FitSync-G13/fitsync-training-service
- https://github.com/FitSync-G13/fitsync-schedule-service
- https://github.com/FitSync-G13/fitsync-progress-service
- https://github.com/FitSync-G13/fitsync-notification-service
- https://github.com/FitSync-G13/fitsync-frontend
- https://github.com/FitSync-G13/fitsync-docker-compose

---

## Option 2: Manual Extraction

### Step 1: Create GitHub Repositories

#### Using GitHub CLI:
```bash
gh repo create FitSync-G13/fitsync-api-gateway --public
gh repo create FitSync-G13/fitsync-user-service --public
gh repo create FitSync-G13/fitsync-training-service --public
gh repo create FitSync-G13/fitsync-schedule-service --public
gh repo create FitSync-G13/fitsync-progress-service --public
gh repo create FitSync-G13/fitsync-notification-service --public
gh repo create FitSync-G13/fitsync-frontend --public
gh repo create FitSync-G13/fitsync-docker-compose --public
```

#### Using GitHub Web UI:
1. Go to https://github.com/organizations/FitSync-G13/repositories/new
2. Create each repository with the names above
3. Select "Public" visibility
4. Do NOT initialize with README, .gitignore, or license

### Step 2: Extract Each Service

#### Extract API Gateway:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub
git clone https://github.com/FitSync-G13/fitsync.git fitsync-api-gateway
cd fitsync-api-gateway

git filter-repo --path services/api-gateway/ --path-rename services/api-gateway/: --force

git remote add origin https://github.com/FitSync-G13/fitsync-api-gateway.git
git push -u origin main
```

#### Extract User Service:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub
git clone https://github.com/FitSync-G13/fitsync.git fitsync-user-service
cd fitsync-user-service

git filter-repo --path services/user-service/ --path-rename services/user-service/: --force

git remote add origin https://github.com/FitSync-G13/fitsync-user-service.git
git push -u origin main
```

#### Extract Training Service:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub
git clone https://github.com/FitSync-G13/fitsync.git fitsync-training-service
cd fitsync-training-service

git filter-repo --path services/training-service/ --path-rename services/training-service/: --force

git remote add origin https://github.com/FitSync-G13/fitsync-training-service.git
git push -u origin main
```

#### Extract Schedule Service:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub
git clone https://github.com/FitSync-G13/fitsync.git fitsync-schedule-service
cd fitsync-schedule-service

git filter-repo --path services/schedule-service/ --path-rename services/schedule-service/: --force

git remote add origin https://github.com/FitSync-G13/fitsync-schedule-service.git
git push -u origin main
```

#### Extract Progress Service:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub
git clone https://github.com/FitSync-G13/fitsync.git fitsync-progress-service
cd fitsync-progress-service

git filter-repo --path services/progress-service/ --path-rename services/progress-service/: --force

git remote add origin https://github.com/FitSync-G13/fitsync-progress-service.git
git push -u origin main
```

#### Extract Notification Service:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub
git clone https://github.com/FitSync-G13/fitsync.git fitsync-notification-service
cd fitsync-notification-service

git filter-repo --path services/notification-service/ --path-rename services/notification-service/: --force

git remote add origin https://github.com/FitSync-G13/fitsync-notification-service.git
git push -u origin main
```

#### Extract Frontend:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub
git clone https://github.com/FitSync-G13/fitsync.git fitsync-frontend
cd fitsync-frontend

git filter-repo --path frontend/ --path-rename frontend/: --force

git remote add origin https://github.com/FitSync-G13/fitsync-frontend.git
git push -u origin main
```

### Step 3: Create Docker Compose Repository

```bash
cd /d/Courses/WSO2_Linux/GP/GitHub
mkdir fitsync-docker-compose
cd fitsync-docker-compose

git init

# Copy files
cp ../fitsync/docker-compose.yml .
cp ../fitsync/setup.sh .
cp ../fitsync/start-all-services.sh .
cp ../fitsync/start-services.bat .

# Create README
cat > README.md <<'EOF'
# FitSync Docker Compose

Docker Compose configuration for running the complete FitSync application stack locally.

## Quick Start

```bash
docker-compose up -d
```

See docker-compose.yml for all service configurations.
EOF

# Create .gitignore
cat > .gitignore <<'EOF'
.env
*.log
node_modules/
__pycache__/
*.pyc
.DS_Store
EOF

git add .
git commit -m "Initial commit: Docker Compose configuration"

git remote add origin https://github.com/FitSync-G13/fitsync-docker-compose.git
git branch -M main
git push -u origin main
```

---

## Step 3: Update Database Connection Strings

All services must be updated to use PostgreSQL connection strings with TLS enabled.

### Connection String Format:
```
postgresql://username:password@host:port/database?sslmode=require&sslrootcert=/path/to/ca.crt
```

For development with insecure certificates:
```
postgresql://username:password@host:port/database?sslmode=require&sslcert=none&sslkey=none&sslrootcert=none
```

### Services to Update:

#### User Service
File: `src/config/database.js`
```javascript
// Before
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// After
const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=require`;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false  // Allow insecure certs for development
  }
});
```

#### Training Service
Same update as User Service in `src/config/database.js`

#### Schedule Service (Python)
File: `database/connection.py`
```python
# Before
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# After
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"
)
```

#### Progress Service (Python)
Same update as Schedule Service in `database/connection.py`

### Environment Variables:

Update `.env.example` files in each repository:

```env
# Option 1: Use connection string
DATABASE_URL=postgresql://fitsync:password@db-server:5432/userdb?sslmode=require

# Option 2: Use individual parameters (will be combined into connection string)
DB_HOST=db-server
DB_PORT=5432
DB_NAME=userdb
DB_USER=fitsync
DB_PASSWORD=password
```

---

## Step 4: Test Each Repository

### Test User Service:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync-user-service

# Create .env file
cp .env.example .env
# Edit .env with actual database credentials

# Install dependencies
npm install

# Run migrations
npm run migrate

# Start service
npm run dev

# Test
curl http://localhost:3001/health
```

### Test Training Service:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync-training-service

cp .env.example .env
npm install
npm run migrate
npm run dev

curl http://localhost:3002/health
```

### Test Schedule Service:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync-schedule-service

cp .env.example .env
pip install -r requirements.txt
python main.py

curl http://localhost:8003/health
```

### Test Progress Service:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync-progress-service

cp .env.example .env
pip install -r requirements.txt
python main.py

curl http://localhost:8004/health
```

### Test Frontend:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync-frontend

cp .env.example .env
npm install
npm start

# Open http://localhost:3000 in browser
```

### Test Docker Compose:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync-docker-compose

# Update docker-compose.yml to reference new image locations
docker-compose up -d

# Check all services
docker-compose ps
docker-compose logs -f
```

---

## Step 5: Archive Mono-Repo

Once all repositories are working:

```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync

# Add archive notice to README
cat >> README.md <<'EOF'

---

## ⚠️ ARCHIVED REPOSITORY

This repository has been archived and split into individual service repositories.

**Migration Date:** December 8, 2025

### New Repositories:
- [fitsync-api-gateway](https://github.com/FitSync-G13/fitsync-api-gateway)
- [fitsync-user-service](https://github.com/FitSync-G13/fitsync-user-service)
- [fitsync-training-service](https://github.com/FitSync-G13/fitsync-training-service)
- [fitsync-schedule-service](https://github.com/FitSync-G13/fitsync-schedule-service)
- [fitsync-progress-service](https://github.com/FitSync-G13/fitsync-progress-service)
- [fitsync-notification-service](https://github.com/FitSync-G13/fitsync-notification-service)
- [fitsync-frontend](https://github.com/FitSync-G13/fitsync-frontend)
- [fitsync-docker-compose](https://github.com/FitSync-G13/fitsync-docker-compose)
EOF

git add README.md
git commit -m "Archive repository - migrated to multi-repo"
git push

# Archive via GitHub UI or CLI
gh repo archive FitSync-G13/fitsync --yes
```

---

## Troubleshooting

### Issue: git-filter-repo not found
```bash
pip install git-filter-repo
```

### Issue: Remote origin already exists
```bash
git remote remove origin
git remote add origin https://github.com/FitSync-G13/fitsync-{service-name}.git
```

### Issue: Push rejected
```bash
# Force push (only if repository is new and empty)
git push -u origin main --force
```

### Issue: No commits after filter-repo
This means the path was incorrect. Check the exact path in the mono-repo:
```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync
ls -la services/  # Verify service names
ls -la frontend/  # Verify frontend exists
```

---

## Verification Checklist

After separation, verify:

- [ ] All 8 repositories created on GitHub
- [ ] Each repository has git history preserved
- [ ] Each service can be cloned and built independently
- [ ] Database connection strings updated with TLS
- [ ] All environment variables documented in .env.example
- [ ] Each service starts successfully
- [ ] Each service health check passes
- [ ] Docker compose repository works
- [ ] Mono-repo archived
- [ ] Team notified of new repository structure

---

## Next Steps

1. **Set up CI/CD**: Add GitHub Actions workflows to each repository
2. **Update Documentation**: Create README for each service
3. **Configure Secrets**: Set up repository secrets for CI/CD
4. **Branch Protection**: Enable branch protection rules
5. **Team Access**: Grant team members access to repositories

---

**Last Updated:** 2025-12-08
**Maintained By:** FitSync DevOps Team
