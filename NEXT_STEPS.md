# FitSync Repository Separation - Ready to Execute

## ✅ What's Been Prepared

I've created the following for you:

### 1. Automated Scripts
- **[scripts/separate-repositories.sh](scripts/separate-repositories.sh)** - Automated repository extraction script
- **[scripts/update-db-connections-tls.sh](scripts/update-db-connections-tls.sh)** - Automated TLS configuration script

### 2. Documentation
- **[docs/REPOSITORY_SEPARATION_STEPS.md](docs/REPOSITORY_SEPARATION_STEPS.md)** - Complete step-by-step manual guide
- **[docs/MULTI_REPO_MIGRATION_PLAN.md](docs/MULTI_REPO_MIGRATION_PLAN.md)** - Full migration strategy (for future reference)
- **[docs/MIGRATION_QUICK_START.md](docs/MIGRATION_QUICK_START.md)** - Quick reference guide
- **[docs/REPOSITORY_ARCHITECTURE.md](docs/REPOSITORY_ARCHITECTURE.md)** - Architecture documentation

### 3. Prerequisites Completed
- ✅ git-filter-repo installed
- ✅ Scripts ready to run
- ✅ Documentation complete

---

## 🚀 Quick Start - Execute Now

### Step 1: Create GitHub Repositories (5 minutes)

Go to GitHub and create these **8 new repositories** in the **FitSync-G13** organization:

1. **fitsync-api-gateway** - Public repository
2. **fitsync-user-service** - Public repository
3. **fitsync-training-service** - Public repository
4. **fitsync-schedule-service** - Public repository
5. **fitsync-progress-service** - Public repository
6. **fitsync-notification-service** - Public repository
7. **fitsync-frontend** - Public repository
8. **fitsync-docker-compose** - Public repository

**Create each repository:**
1. Go to: https://github.com/organizations/FitSync-G13/repositories/new
2. Enter repository name (e.g., `fitsync-api-gateway`)
3. Select **Public**
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

**Repeat for all 8 repositories**

### Step 2: Run the Separation Script (10 minutes)

```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync

# Make script executable
chmod +x scripts/separate-repositories.sh

# Run the script
./scripts/separate-repositories.sh
```

**What the script does:**
1. Extracts each service with full git history
2. Extracts frontend with full git history
3. Creates docker-compose repository
4. Pushes all repositories to GitHub

The script will create all extracted repositories in:
```
/d/Courses/WSO2_Linux/GP/GitHub/fitsync-separated/
```

### Step 3: Update Database Connections for TLS (5 minutes)

```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync

# Make script executable
chmod +x scripts/update-db-connections-tls.sh

# Run the script
./scripts/update-db-connections-tls.sh
```

**What this script does:**
- Updates all Node.js services to use PostgreSQL connection strings with TLS
- Updates all Python services to use PostgreSQL connection strings with TLS
- Adds support for both `DATABASE_URL` environment variable and individual parameters
- Commits changes to each repository

### Step 4: Push TLS Changes to GitHub (2 minutes)

```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync-separated

# Push each repository
cd fitsync-user-service && git push && cd ..
cd fitsync-training-service && git push && cd ..
cd fitsync-schedule-service && git push && cd ..
cd fitsync-progress-service && git push && cd ..
```

### Step 5: Verify on GitHub (2 minutes)

Check that all repositories are visible and have code:
- https://github.com/FitSync-G13/fitsync-api-gateway
- https://github.com/FitSync-G13/fitsync-user-service
- https://github.com/FitSync-G13/fitsync-training-service
- https://github.com/FitSync-G13/fitsync-schedule-service
- https://github.com/FitSync-G13/fitsync-progress-service
- https://github.com/FitSync-G13/fitsync-notification-service
- https://github.com/FitSync-G13/fitsync-frontend
- https://github.com/FitSync-G13/fitsync-docker-compose

---

## 📋 Database Configuration

All services have been configured to support TLS connections using connection strings.

### Connection String Format

**For development (insecure certificates allowed):**
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

**For production (with certificate validation):**
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=verify-full&sslrootcert=/path/to/ca.crt
```

### Database Server Setup

If you haven't set up your PostgreSQL server with TLS yet, here's a quick guide:

#### 1. Generate Self-Signed Certificate (Development)

```bash
# On your database server
cd /var/lib/postgresql/data

# Generate private key
openssl genrsa -out server.key 2048
chmod 600 server.key
chown postgres:postgres server.key

# Generate certificate
openssl req -new -key server.key -out server.csr -subj "/CN=your-db-server"
openssl x509 -req -in server.csr -signkey server.key -out server.crt -days 365
chmod 600 server.crt
chown postgres:postgres server.crt
```

#### 2. Update PostgreSQL Configuration

Edit `postgresql.conf`:
```conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = ''  # Empty for self-signed
```

Edit `pg_hba.conf`:
```conf
# TYPE  DATABASE  USER      ADDRESS         METHOD
hostssl all       fitsync   0.0.0.0/0       md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

#### 3. Test TLS Connection

```bash
psql "postgresql://fitsync:password@your-db-server:5432/userdb?sslmode=require"
```

---

## 🧪 Testing Each Service

### Test User Service

```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync-separated/fitsync-user-service

# Create .env file
cat > .env <<EOF
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://fitsync:password@localhost:5432/userdb?sslmode=require
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev-secret
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
LOG_LEVEL=info
EOF

# Install and run
npm install
npm run migrate
npm run dev

# Test
curl http://localhost:3001/health
```

### Test Other Services

Repeat similar steps for:
- `fitsync-training-service` (port 3002)
- `fitsync-schedule-service` (port 8003)
- `fitsync-progress-service` (port 8004)
- `fitsync-notification-service` (port 3005)
- `fitsync-api-gateway` (port 4000)
- `fitsync-frontend` (port 3000)

---

## 🐳 Docker Compose

The `fitsync-docker-compose` repository contains all the docker-compose configuration.

To use it with the new separate repositories:

```bash
cd /d/Courses/WSO2_Linux/GP/GitHub/fitsync-separated/fitsync-docker-compose

# Update docker-compose.yml to build from local service directories or pull images
# Then start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📊 Repository Structure After Separation

```
GitHub Organization: FitSync-G13
│
├── fitsync-api-gateway (Service)
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── fitsync-user-service (Service)
│   ├── src/
│   │   └── config/
│   │       └── database.js  (✅ TLS enabled)
│   ├── Dockerfile
│   └── .env.example
│
├── fitsync-training-service (Service)
│   └── (similar structure)
│
├── fitsync-schedule-service (Service - Python)
│   ├── config/
│   │   └── database.py  (✅ TLS enabled)
│   ├── main.py
│   └── requirements.txt
│
├── fitsync-progress-service (Service - Python)
│   └── (similar structure)
│
├── fitsync-notification-service (Service)
│   └── (Node.js structure)
│
├── fitsync-frontend (Frontend)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── fitsync-docker-compose (Infrastructure)
│   ├── docker-compose.yml
│   ├── setup.sh
│   └── README.md
│
└── fitsync (MONO-REPO - To be archived)
    └── ⚠️ Will be archived after verification
```

---

## ✅ Verification Checklist

After running the scripts, verify:

- [ ] All 8 repositories created on GitHub
- [ ] All repositories have code (not empty)
- [ ] Git history preserved in each repository
- [ ] Database connection files updated with TLS
- [ ] `.env.example` files updated in all services
- [ ] Each repository can be cloned independently
- [ ] Services can build successfully (`npm install` or `pip install`)
- [ ] Services can connect to TLS-enabled database

---

## ❓ Need Help?

### If the automated script fails:

Follow the manual steps in: [docs/REPOSITORY_SEPARATION_STEPS.md](docs/REPOSITORY_SEPARATION_STEPS.md)

### If you encounter issues:

1. **git-filter-repo errors**: Make sure you're cloning fresh copies
2. **Push rejected**: Make sure repositories are empty on GitHub
3. **Database connection fails**: Check TLS configuration on database server
4. **Missing files**: Verify paths in the original mono-repo

---

## 🎯 Summary

**Total Time**: ~25 minutes

1. ✅ **5 min** - Create 8 GitHub repositories
2. ✅ **10 min** - Run separation script
3. ✅ **5 min** - Run TLS update script
4. ✅ **2 min** - Push TLS changes
5. ✅ **3 min** - Verify on GitHub

**You're ready to execute! Start with Step 1 above.**

---

**Questions or Issues?**

Refer to [REPOSITORY_SEPARATION_STEPS.md](docs/REPOSITORY_SEPARATION_STEPS.md) for detailed manual instructions.
