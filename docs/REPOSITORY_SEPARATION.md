# Repository Separation Guide

**Version:** 1.0
**Last Updated:** 2025-12-07
**Status:** Planning Phase
**Purpose:** Guide for splitting FitSync monorepo into individual service repositories

---

## Table of Contents

1. [Overview](#overview)
2. [Repository Structure](#repository-structure)
3. [Migration Strategy](#migration-strategy)
4. [Step-by-Step Separation Process](#step-by-step-separation-process)
5. [CI/CD Configuration per Repository](#cicd-configuration-per-repository)
6. [Shared Resources Management](#shared-resources-management)
7. [GitOps Repository Structure](#gitops-repository-structure)
8. [Post-Separation Checklist](#post-separation-checklist)

---

## Overview

### Why Separate Repositories?

**Benefits:**
- **Independent Deployment**: Each service can be deployed without affecting others
- **Team Ownership**: Clear ownership boundaries for different teams
- **Access Control**: Fine-grained permissions per service
- **CI/CD Optimization**: Faster builds (only affected service rebuilds)
- **Versioning**: Independent semantic versioning per service
- **Technology Freedom**: Different tech stacks without monorepo complexity

**Trade-offs:**
- **Cross-Repo Changes**: Harder to make changes across multiple services
- **Dependency Management**: Need to manage inter-service dependencies explicitly
- **Shared Code**: Requires separate shared libraries

### Current Monorepo Structure

```
fitsync/
├── services/
│   ├── api-gateway/
│   ├── user-service/
│   ├── training-service/
│   ├── schedule-service/
│   ├── progress-service/
│   └── notification-service/
├── frontend/
├── docs/
├── scripts/
└── docker-compose.yml
```

---

## Repository Structure

### Target Repository Layout

After separation, you will have **9 repositories**:

#### 1. Core Application Repositories (7)

| Repository | Description | Technology | Team Owner |
|------------|-------------|------------|------------|
| `fitsync-api-gateway` | API Gateway & request orchestration | Node.js/Express | Platform |
| `fitsync-user-service` | Authentication & user management | Node.js/Express | Backend |
| `fitsync-training-service` | Training programs & workouts | Node.js/Express | Backend |
| `fitsync-schedule-service` | Booking & availability | Python/FastAPI | Backend |
| `fitsync-progress-service` | Progress tracking & analytics | Python/FastAPI | Backend |
| `fitsync-notification-service` | Multi-channel notifications | Node.js/Express | Backend |
| `fitsync-frontend` | React SPA | React/TypeScript | Frontend |

#### 2. Infrastructure Repositories (2)

| Repository | Description | Contents |
|------------|-------------|----------|
| `fitsync-infrastructure` | Terraform modules & Ansible playbooks | IaC code |
| `fitsync-gitops` | Kubernetes manifests & Helm values | K8s configs |

---

## Migration Strategy

### Phase 1: Preparation (Week 1)

**Tasks:**
1. Create GitHub organization: `FitSync-G13` (already exists)
2. Define repository naming convention
3. Document shared dependencies
4. Plan CI/CD workflows
5. Set up branch protection rules template

### Phase 2: Create Empty Repositories (Week 1)

**Tasks:**
1. Create all 9 repositories in GitHub
2. Initialize with README, LICENSE, .gitignore
3. Configure repository settings (branch protection, webhooks)
4. Set up team access permissions

### Phase 3: Extract Service Code (Week 2)

**Tasks:**
1. Extract each service with Git history preservation
2. Create service-specific Dockerfiles
3. Add service-specific CI/CD workflows
4. Update documentation

### Phase 4: Infrastructure Separation (Week 2)

**Tasks:**
1. Extract Terraform code to `fitsync-infrastructure`
2. Create GitOps repository structure
3. Configure ArgoCD applications

### Phase 5: Testing & Validation (Week 3)

**Tasks:**
1. Test CI/CD pipelines for each repository
2. Validate Docker image builds
3. Test inter-service communication with new image tags
4. Update documentation

### Phase 6: Cutover (Week 3)

**Tasks:**
1. Archive monorepo (mark as read-only)
2. Update all external references
3. Announce migration to team

---

## Step-by-Step Separation Process

### Step 1: Create New Repositories

```bash
# Using GitHub CLI
gh repo create FitSync-G13/fitsync-api-gateway --public
gh repo create FitSync-G13/fitsync-user-service --public
gh repo create FitSync-G13/fitsync-training-service --public
gh repo create FitSync-G13/fitsync-schedule-service --public
gh repo create FitSync-G13/fitsync-progress-service --public
gh repo create FitSync-G13/fitsync-notification-service --public
gh repo create FitSync-G13/fitsync-frontend --public
gh repo create FitSync-G13/fitsync-infrastructure --public
gh repo create FitSync-G13/fitsync-gitops --private
```

### Step 2: Extract Service with Git History

**Method: Git Filter-Repo (Preserves History)**

```bash
# Install git-filter-repo
pip install git-filter-repo

# Clone the monorepo
git clone https://github.com/FitSync-G13/fitsync.git fitsync-user-service
cd fitsync-user-service

# Extract only user-service directory
git filter-repo --path services/user-service/ --path-rename services/user-service/:

# Add new remote
git remote add origin https://github.com/FitSync-G13/fitsync-user-service.git

# Push to new repository
git push -u origin main
```

**Repeat for each service:**

```bash
# Training Service
git clone https://github.com/FitSync-G13/fitsync.git fitsync-training-service
cd fitsync-training-service
git filter-repo --path services/training-service/ --path-rename services/training-service/:
git remote add origin https://github.com/FitSync-G13/fitsync-training-service.git
git push -u origin main

# Schedule Service
git clone https://github.com/FitSync-G13/fitsync.git fitsync-schedule-service
cd fitsync-schedule-service
git filter-repo --path services/schedule-service/ --path-rename services/schedule-service/:
git remote add origin https://github.com/FitSync-G13/fitsync-schedule-service.git
git push -u origin main

# Progress Service
git clone https://github.com/FitSync-G13/fitsync.git fitsync-progress-service
cd fitsync-progress-service
git filter-repo --path services/progress-service/ --path-rename services/progress-service/:
git remote add origin https://github.com/FitSync-G13/fitsync-progress-service.git
git push -u origin main

# Notification Service
git clone https://github.com/FitSync-G13/fitsync.git fitsync-notification-service
cd fitsync-notification-service
git filter-repo --path services/notification-service/ --path-rename services/notification-service/:
git remote add origin https://github.com/FitSync-G13/fitsync-notification-service.git
git push -u origin main

# API Gateway
git clone https://github.com/FitSync-G13/fitsync.git fitsync-api-gateway
cd fitsync-api-gateway
git filter-repo --path services/api-gateway/ --path-rename services/api-gateway/:
git remote add origin https://github.com/FitSync-G13/fitsync-api-gateway.git
git push -u origin main

# Frontend
git clone https://github.com/FitSync-G13/fitsync.git fitsync-frontend
cd fitsync-frontend
git filter-repo --path frontend/ --path-rename frontend/:
git remote add origin https://github.com/FitSync-G13/fitsync-frontend.git
git push -u origin main
```

### Step 3: Create Service-Specific Structure

Each service repository should have this structure:

```
fitsync-user-service/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Build, test, scan
│       ├── cd-dev.yml          # Auto-deploy to dev
│       ├── cd-stage.yml        # Auto-deploy to stage
│       └── cd-prod.yml         # Manual deploy to prod
├── src/                        # Application code
├── tests/                      # Unit & integration tests
├── migrations/                 # Database migrations
├── Dockerfile                  # Production Dockerfile
├── Dockerfile.dev              # Development Dockerfile
├── docker-compose.yml          # Local development compose
├── .dockerignore
├── .gitignore
├── .env.example
├── package.json / requirements.txt
├── README.md
├── CHANGELOG.md
└── LICENSE
```

### Step 4: Update Dockerfiles

**Example: User Service Dockerfile**

```dockerfile
# fitsync-user-service/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3001

CMD ["node", "src/index.js"]
```

### Step 5: Create README for Each Repository

**Template: fitsync-user-service/README.md**

```markdown
# FitSync User Service

Authentication, authorization, and user management microservice for FitSync.

## Features

- JWT-based authentication (access + refresh tokens)
- Role-based access control (RBAC)
- User CRUD operations
- Password hashing with bcrypt
- Redis-based caching

## Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: Knex.js

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15
- Redis 7

### Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start development server
npm run dev
```

### Docker Development

```bash
docker-compose up -d
```

### Run Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

## API Documentation

See [API.md](./API.md) for detailed endpoint documentation.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | 3001 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | userdb |
| `REDIS_HOST` | Redis host | localhost |
| `JWT_SECRET` | JWT signing secret | (required) |

## Deployment

This service is deployed via GitOps using ArgoCD.

- **Dev**: Auto-deployed on merge to `dev` branch
- **Stage**: Auto-deployed on merge to `stage` branch
- **Prod**: Manual promotion via GitHub Actions

## Contributing

1. Create feature branch from `dev`
2. Make changes and add tests
3. Run `npm run lint` and `npm test`
4. Submit PR to `dev` branch

## License

MIT
```

---

## CI/CD Configuration per Repository

### GitHub Actions Workflow Structure

Each service repository should have 4 workflows:

#### 1. CI Workflow (.github/workflows/ci.yml)

```yaml
name: CI

on:
  pull_request:
    branches: [dev, stage, main]
  push:
    branches: [dev, stage, main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm test

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: ${{ github.ref == 'refs/heads/main' || github.ref == 'refs/heads/dev' || github.ref == 'refs/heads/stage' }}
          tags: |
            fitsync/user-service:${{ github.sha }}
            fitsync/user-service:${{ github.ref_name }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Scan Docker image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: fitsync/user-service:${{ github.sha }}
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
```

#### 2. CD Dev Workflow (.github/workflows/cd-dev.yml)

```yaml
name: Deploy to Dev

on:
  push:
    branches: [dev]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: dev
    steps:
      - uses: actions/checkout@v3

      - name: Update GitOps repository
        run: |
          git clone https://${{ secrets.GITOPS_TOKEN }}@github.com/FitSync-G13/fitsync-gitops.git
          cd fitsync-gitops

          # Update image tag in dev values
          sed -i "s|tag:.*|tag: ${{ github.sha }}|g" environments/dev/user-service/values.yaml

          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "Update user-service to ${{ github.sha }} in dev"
          git push

      - name: Wait for ArgoCD sync
        run: |
          # Wait for ArgoCD to sync (optional)
          sleep 30

      - name: Run smoke tests
        run: |
          curl -f https://dev-api.fitsync.com/api/users/health || exit 1
```

#### 3. CD Stage Workflow (.github/workflows/cd-stage.yml)

```yaml
name: Deploy to Stage

on:
  push:
    branches: [stage]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: stage
    steps:
      - uses: actions/checkout@v3

      - name: Update GitOps repository
        run: |
          git clone https://${{ secrets.GITOPS_TOKEN }}@github.com/FitSync-G13/fitsync-gitops.git
          cd fitsync-gitops

          sed -i "s|tag:.*|tag: ${{ github.sha }}|g" environments/stage/user-service/values.yaml

          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "Update user-service to ${{ github.sha }} in stage"
          git push

      - name: Run smoke tests
        run: |
          curl -f https://stage-api.fitsync.com/api/users/health || exit 1

      - name: Run E2E tests
        run: |
          npm run test:e2e
```

#### 4. CD Prod Workflow (.github/workflows/cd-prod.yml)

```yaml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Docker image SHA to deploy'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      # Requires manual approval
    steps:
      - uses: actions/checkout@v3

      - name: Validate image exists
        run: |
          docker manifest inspect fitsync/user-service:${{ github.event.inputs.version }}

      - name: Update GitOps repository
        run: |
          git clone https://${{ secrets.GITOPS_TOKEN }}@github.com/FitSync-G13/fitsync-gitops.git
          cd fitsync-gitops

          sed -i "s|tag:.*|tag: ${{ github.event.inputs.version }}|g" environments/prod/user-service/values.yaml

          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "Deploy user-service ${{ github.event.inputs.version }} to production"
          git push

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ github.run_number }}
          release_name: Release v${{ github.run_number }}
          body: |
            Deployed to production: ${{ github.event.inputs.version }}
          draft: false
          prerelease: false
```

---

## Shared Resources Management

### Option 1: Shared Library NPM Package

Create `@fitsync/common` package for shared utilities:

```bash
# Create new repository
gh repo create FitSync-G13/fitsync-common --public

# Structure
fitsync-common/
├── src/
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── utils/
│   │   ├── redis.js
│   │   └── httpClient.js
│   └── index.js
├── package.json
└── README.md
```

**Publish to NPM:**

```bash
npm publish --access public
```

**Use in services:**

```json
{
  "dependencies": {
    "@fitsync/common": "^1.0.0"
  }
}
```

### Option 2: Git Submodules

```bash
# In each service repo
git submodule add https://github.com/FitSync-G13/fitsync-common.git shared
```

---

## GitOps Repository Structure

### fitsync-gitops Repository Layout

```
fitsync-gitops/
├── applications/                  # ArgoCD Application definitions
│   ├── dev-apps.yaml
│   ├── stage-apps.yaml
│   └── prod-apps.yaml
├── environments/
│   ├── dev/
│   │   ├── api-gateway/
│   │   │   └── values.yaml
│   │   ├── user-service/
│   │   │   └── values.yaml
│   │   ├── training-service/
│   │   │   └── values.yaml
│   │   ├── schedule-service/
│   │   │   └── values.yaml
│   │   ├── progress-service/
│   │   │   └── values.yaml
│   │   ├── notification-service/
│   │   │   └── values.yaml
│   │   └── frontend/
│   │       └── values.yaml
│   ├── stage/
│   │   └── [same structure]
│   └── prod/
│       └── [same structure]
├── base/                          # Base Helm charts
│   ├── microservice/              # Generic microservice chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── hpa.yaml
│   │       ├── istio-virtualservice.yaml
│   │       └── cilium-networkpolicy.yaml
│   └── frontend/
│       └── [frontend-specific chart]
└── README.md
```

### Example: Dev User Service Values

```yaml
# environments/dev/user-service/values.yaml
replicaCount: 2

image:
  repository: fitsync/user-service
  tag: abc123  # Updated by CI/CD pipeline
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 3001

env:
  - name: NODE_ENV
    value: "development"
  - name: PORT
    value: "3001"
  - name: DB_HOST
    value: "userdb-dev.database.internal"
  - name: REDIS_HOST
    value: "redis.fitsync-dev.svc.cluster.local"

resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "250m"

istio:
  enabled: true
  mtls: true

monitoring:
  enabled: true
```

### ArgoCD Application Definition

```yaml
# applications/dev-apps.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: dev-user-service
  namespace: argocd
spec:
  project: fitsync-dev
  source:
    repoURL: https://github.com/FitSync-G13/fitsync-gitops.git
    targetRevision: main
    path: base/microservice
    helm:
      valueFiles:
        - ../../environments/dev/user-service/values.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: fitsync-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

---

## Post-Separation Checklist

### Per Service Repository

- [ ] Git history preserved
- [ ] README.md created
- [ ] CHANGELOG.md initialized
- [ ] Dockerfile optimized
- [ ] CI/CD workflows configured
- [ ] Branch protection rules set
- [ ] Dependabot enabled
- [ ] Code owners file added
- [ ] Secrets configured in GitHub
- [ ] First successful build completed

### Infrastructure Repository

- [ ] Terraform modules extracted
- [ ] Ansible playbooks organized
- [ ] Documentation updated
- [ ] CI/CD for infrastructure added
- [ ] State backend configured

### GitOps Repository

- [ ] Base Helm charts created
- [ ] Environment-specific values files added
- [ ] ArgoCD applications configured
- [ ] Sync policies tested
- [ ] Access controls configured

### General

- [ ] All team members have access
- [ ] Monorepo archived (read-only)
- [ ] Documentation updated
- [ ] External links updated
- [ ] Stakeholders notified

---

## Example Migration Timeline

### Week 1: Preparation
- **Day 1-2**: Create all GitHub repositories
- **Day 3-4**: Extract services with git-filter-repo
- **Day 5**: Create infrastructure & GitOps repos

### Week 2: Configuration
- **Day 1-2**: Set up CI/CD workflows for each service
- **Day 3-4**: Test Docker builds and pushes
- **Day 5**: Configure ArgoCD applications

### Week 3: Testing & Cutover
- **Day 1-3**: Integration testing with new repos
- **Day 4**: Final validation
- **Day 5**: Archive monorepo, announce completion

---

## Troubleshooting

### Issue: Git filter-repo fails

**Solution:**
```bash
# Clear git-filter-repo cache
rm -rf ~/.git-filter-repo

# Try again with force
git filter-repo --force --path services/user-service/
```

### Issue: CI/CD fails after separation

**Checklist:**
- Verify GitHub secrets are set
- Check Docker Hub credentials
- Ensure GITOPS_TOKEN has write access
- Validate workflow YAML syntax

### Issue: ArgoCD not syncing

**Solution:**
```bash
# Check ArgoCD application status
kubectl get applications -n argocd

# Force sync
argocd app sync dev-user-service

# Check logs
kubectl logs -n argocd deployment/argocd-application-controller
```

---

## References

- [Git Filter-Repo Documentation](https://github.com/newren/git-filter-repo)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)
- [Helm Chart Best Practices](https://helm.sh/docs/chart_best_practices/)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-07
**Maintained By:** FitSync DevOps Team
