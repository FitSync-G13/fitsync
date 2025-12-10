# FitSync Multi-Repo Migration Plan

**Version:** 2.0
**Last Updated:** 2025-12-08
**Status:** Planning Phase
**Purpose:** Comprehensive guide for migrating FitSync from mono-repo to multi-repo architecture with AWS deployment integration

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Target Architecture](#target-architecture)
4. [Repository Structure](#repository-structure)
5. [Infrastructure Integration](#infrastructure-integration)
6. [Migration Strategy](#migration-strategy)
7. [GitHub Actions CI/CD](#github-actions-cicd)
8. [Shared Libraries Strategy](#shared-libraries-strategy)
9. [Deployment Workflow](#deployment-workflow)
10. [Step-by-Step Migration](#step-by-step-migration)
11. [Production Hardening](#production-hardening)
12. [Rollback Plan](#rollback-plan)

---

## Executive Summary

### Current State
- **Mono-repo**: All 7 services in single repository (`fitsync/`)
- **Existing Infrastructure**: AWS hub-and-spoke architecture with K3s, Istio, Cilium
- **Current Deployment**: Bookinfo sample application (placeholder)
- **CI/CD**: CircleCI with path-based filtering
- **Container Registry**: AWS ECR (`fitsync-ecr`)

### Target State
- **Multi-repo**: 11 separate repositories (7 services + 4 infrastructure)
- **Production Deployment**: FitSync microservices on AWS K3s cluster
- **CI/CD**: GitHub Actions with per-repo workflows
- **GitOps**: ArgoCD for continuous deployment
- **Domain**: fitsync.online with wildcard TLS

### Key Changes
1. Split mono-repo into 7 service repositories
2. Replace CircleCI with GitHub Actions
3. Replace Bookinfo sample app with FitSync Helm chart
4. Integrate per-service CI/CD with existing AWS infrastructure
5. Implement GitOps deployment pattern
6. Create shared library packages for common code

---

## Current State Analysis

### Existing Repository Structure

```
d:\Courses\WSO2_Linux\GP\GitHub\
├── fitsync/                          # MONO-REPO (to be split)
│   ├── services/
│   │   ├── api-gateway/
│   │   ├── user-service/
│   │   ├── training-service/
│   │   ├── schedule-service/
│   │   ├── progress-service/
│   │   └── notification-service/
│   ├── frontend/
│   └── docs/
│
├── fitsync-aws-terraform-modules/    # ✅ READY
│   ├── modules/
│   │   ├── shared/                   # ECR repository
│   │   ├── hub/                      # Hub VPC, Transit Gateway, Bastion
│   │   └── spoke/                    # K3s cluster, ALB, databases
│   └── live/
│       ├── 00-shared-global/         # ECR: fitsync-ecr
│       ├── 01-hub-prod/              # Hub infrastructure
│       └── 02-spoke-prod/            # K3s cluster (1 master, 1 worker, 1 db)
│
├── fitsync-cd/                       # ✅ READY (needs updates)
│   └── .github/workflows/
│       └── k3s-deploy.yml            # Main orchestration workflow
│
├── fitsync-cd-templates/             # ✅ READY (needs new template)
│   └── .github/workflows/
│       ├── k3s-install-modular.yml
│       ├── cilium-install.yml
│       ├── istio-install.yml
│       ├── cert-manager-install.yml
│       ├── wildcard-cert.yml
│       ├── istio-gateway-https.yml
│       └── istio-sample-app.yml      # ⚠️ TO BE REPLACED
│
└── fitsync-helm-chart/               # ✅ READY (needs production config)
    ├── templates/
    │   ├── deployment.yaml           # All 7 microservices
    │   ├── service.yaml
    │   ├── gateway.yaml              # ⚠️ Using Gateway API (need Istio Gateway)
    │   ├── httproute.yaml
    │   └── dev-databases.yaml        # PostgreSQL x4 + Redis
    └── values.yaml                   # ⚠️ Development config
```

### Existing AWS Infrastructure (Provisioned)

**Region**: us-east-2

**Hub VPC (10.0.0.0/16)**:
- Transit Gateway for cross-VPC routing
- NAT Gateways (multi-AZ) for internet egress
- Bastion host (t3.micro, Ubuntu 24.04)
- Public ALB (internet-facing) with ACM wildcard cert
- GitHub OIDC provider for CI/CD authentication

**Spoke VPC (10.1.0.0/16)**:
- K3s cluster: 1 master, 1 worker, 1 database node (all t3.medium)
- Internal NLB for K3s API (port 6443)
- VPC Endpoints for ECR (ecr.api, ecr.dkr, s3)
- Security groups for cluster, ALB, VPC endpoints

**Platform Services** (Deployed via fitsync-cd):
- Cilium CNI (1.18.4)
- Istio service mesh with mTLS
- cert-manager for TLS certificates
- Wildcard certificate for *.fitsync.online

**Traffic Flow**:
```
Internet → Public ALB (Hub VPC) → TLS Termination →
Transit Gateway → NodePort 30443 (Spoke VPC) →
Istio Ingress Gateway → Application Pods
```

### Current Deployment Gap

**Currently Deployed**: Istio Bookinfo sample application
**Needs**: FitSync microservices via Helm chart
**Blocker**: No CI/CD pipeline to build and push FitSync images to ECR

---

## Target Architecture

### Multi-Repo Structure

#### Application Repositories (7)

| Repository | Description | Technology | Port |
|------------|-------------|------------|------|
| `fitsync-api-gateway` | API Gateway & request routing | Node.js/Express | 4000 |
| `fitsync-user-service` | Authentication & user management | Node.js/Express | 3001 |
| `fitsync-training-service` | Training programs & workouts | Node.js/Express | 3002 |
| `fitsync-schedule-service` | Booking & availability | Python/FastAPI | 8003 |
| `fitsync-progress-service` | Progress tracking & analytics | Python/FastAPI | 8004 |
| `fitsync-notification-service` | Multi-channel notifications | Node.js/Express | 3005 |
| `fitsync-frontend` | React SPA | React 18 | 3000 |

#### Shared Library Repositories (2)

| Repository | Description | Type |
|------------|-------------|------|
| `fitsync-common` | Shared Node.js utilities | NPM Package |
| `fitsync-common-py` | Shared Python utilities | Python Package |

#### Infrastructure Repositories (4) - Already Exist

| Repository | Description | Status |
|------------|-------------|--------|
| `fitsync-aws-terraform-modules` | AWS infrastructure as code | ✅ Deployed |
| `fitsync-cd` | Main deployment orchestration | ✅ Ready |
| `fitsync-cd-templates` | Reusable GitHub Actions workflows | ✅ Ready |
| `fitsync-helm-chart` | Kubernetes Helm chart | ⚠️ Needs updates |

#### GitOps Repository (1) - To Be Created

| Repository | Description | Purpose |
|------------|-------------|---------|
| `fitsync-gitops` | ArgoCD application manifests | GitOps deployments |

---

## Repository Structure

### Service Repository Template

Each service repository will follow this structure:

```
fitsync-{service-name}/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Build, test, security scan
│       ├── build-push.yml            # Docker build and push to ECR
│       └── promote.yml               # Promote images across envs
├── src/                              # Application source code
├── tests/                            # Unit and integration tests
├── migrations/                       # Database migrations (if applicable)
├── Dockerfile                        # Multi-stage production Dockerfile
├── Dockerfile.dev                    # Development Dockerfile
├── docker-compose.yml                # Local development
├── .dockerignore
├── .gitignore
├── .env.example
├── package.json                      # Node.js services
├── requirements.txt                  # Python services
├── README.md
├── CHANGELOG.md
├── API.md                            # API documentation
└── LICENSE
```

### Shared Library Repository Structure

#### fitsync-common (Node.js)
```
fitsync-common/
├── .github/
│   └── workflows/
│       └── publish.yml               # Publish to GitHub Packages
├── src/
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── config/
│   │   ├── logger.js                 # Winston logger
│   │   ├── redis.js                  # Redis client
│   │   └── database.js               # PostgreSQL pool
│   ├── utils/
│   │   ├── httpClient.js
│   │   └── eventPublisher.js
│   └── index.js
├── tests/
├── package.json
├── .npmrc                            # GitHub Packages config
└── README.md
```

#### fitsync-common-py (Python)
```
fitsync-common-py/
├── .github/
│   └── workflows/
│       └── publish.yml               # Publish to GitHub Packages
├── fitsync_common/
│   ├── __init__.py
│   ├── http_client.py
│   ├── event_publisher.py
│   ├── auth.py
│   └── logger.py
├── tests/
├── setup.py
├── pyproject.toml
└── README.md
```

---

## Infrastructure Integration

### ECR Repository Structure

**ECR URL**: `{account-id}.dkr.ecr.us-east-2.amazonaws.com/fitsync-ecr`

**Image Naming Convention**:
```
fitsync-ecr:api-gateway-{git-sha}
fitsync-ecr:user-service-{git-sha}
fitsync-ecr:training-service-{git-sha}
fitsync-ecr:schedule-service-{git-sha}
fitsync-ecr:progress-service-{git-sha}
fitsync-ecr:notification-service-{git-sha}
fitsync-ecr:frontend-{git-sha}
```

**Tagging Strategy**:
- `{service-name}-{git-sha}` - Immutable build identifier
- `{service-name}-dev` - Latest dev branch
- `{service-name}-staging` - Latest staging branch
- `{service-name}-prod` - Latest production release
- `{service-name}-v{semver}` - Semantic version tag

### GitHub OIDC Integration

**Existing Configuration** (via Terraform):
- GitHub OIDC provider configured in AWS
- IAM role: `github-actions-role` with permissions:
  - EC2 read/write
  - SSM access
  - ELB management
  - ECR push/pull

**Required Addition**:
- Add ECR push permissions to `github-actions-role`
- Configure trust policy for all service repositories

### Helm Chart Integration

**Current State**:
- Chart configured for development (`fitsync.local`)
- Uses Gateway API (needs Istio Gateway)
- Hardcoded secrets
- Ephemeral databases

**Required Updates**:
1. Replace Gateway API with Istio Gateway resource
2. Configure for production domain (`fitsync.online`)
3. Externalize secrets (AWS Secrets Manager)
4. Configure persistent storage for databases
5. Update image references to use ECR

---

## Migration Strategy

### Migration Phases

#### Phase 0: Shared Libraries (Week 1)
- Extract common code from services
- Create `fitsync-common` and `fitsync-common-py` repositories
- Publish to GitHub Packages
- Update mono-repo services to use shared libraries
- Test in mono-repo environment

#### Phase 1: Service Repository Creation (Week 1-2)
- Create 7 service repositories in GitHub
- Extract service code with git history preservation
- Configure repository settings and branch protection
- Add README and documentation

#### Phase 2: CI/CD Implementation (Week 2)
- Create GitHub Actions workflows for each service
- Implement build, test, security scanning
- Configure ECR push workflows
- Test image builds and pushes

#### Phase 3: Helm Chart Updates (Week 2)
- Update Helm chart for production
- Replace Gateway API with Istio Gateway
- Configure external database connections
- Externalize secrets
- Update image references to ECR

#### Phase 4: GitOps Setup (Week 3)
- Create `fitsync-gitops` repository
- Configure ArgoCD applications
- Set up environment-specific configurations
- Test GitOps deployment flow

#### Phase 5: Infrastructure Integration (Week 3)
- Create `fitsync-app-deploy.yml` workflow template
- Update `fitsync-cd` to deploy FitSync instead of Bookinfo
- Test end-to-end deployment
- Validate application accessibility

#### Phase 6: Testing & Validation (Week 4)
- Full stack integration testing
- Performance testing
- Security scanning
- Documentation updates

#### Phase 7: Cutover (Week 4)
- Archive mono-repo (mark read-only)
- Update external references
- Team announcement and training

---

## GitHub Actions CI/CD

### Per-Service CI/CD Workflow

Each service repository will have these workflows:

#### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers**: Pull requests, push to dev/staging/main

**Jobs**:
1. **Test**
   - Lint code
   - Run unit tests
   - Run integration tests
   - Upload coverage to Codecov

2. **Security Scan**
   - Trivy filesystem scan
   - Snyk dependency scan
   - SAST analysis

3. **Build**
   - Build Docker image
   - Scan Docker image with Trivy
   - Push to ECR (if on dev/staging/main)

**Example**:
```yaml
name: CI

on:
  pull_request:
    branches: [dev, staging, main]
  push:
    branches: [dev, staging, main]

permissions:
  id-token: write
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

  build:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/github-actions-role
          aws-region: us-east-2

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: fitsync-ecr
          IMAGE_TAG: user-service-${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
                     $ECR_REGISTRY/$ECR_REPOSITORY:user-service-${{ github.ref_name }}
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:user-service-${{ github.ref_name }}

      - name: Scan Docker image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ steps.login-ecr.outputs.registry }}/fitsync-ecr:user-service-${{ github.sha }}
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
```

#### 2. GitOps Update Workflow (`.github/workflows/gitops-update.yml`)

**Triggers**: Successful build on dev/staging/main

**Purpose**: Update GitOps repository with new image tags

```yaml
name: Update GitOps

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [dev, staging, main]

jobs:
  update-gitops:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - name: Checkout GitOps repo
        uses: actions/checkout@v4
        with:
          repository: FitSync-G13/fitsync-gitops
          token: ${{ secrets.GITOPS_PAT }}

      - name: Update image tag
        run: |
          ENV="${{ github.ref_name }}"
          if [ "$ENV" = "main" ]; then ENV="prod"; fi

          SERVICE="user-service"
          IMAGE_TAG="${SERVICE}-${{ github.event.workflow_run.head_sha }}"

          sed -i "s|tag: ${SERVICE}-.*|tag: ${IMAGE_TAG}|g" \
            environments/${ENV}/${SERVICE}/values.yaml

          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "Update ${SERVICE} to ${IMAGE_TAG} in ${ENV}"
          git push
```

### Orchestration Workflows

#### fitsync-cd Updates

**Current**: Deploys Bookinfo sample app
**Target**: Deploy FitSync application via Helm

**Updated Workflow** (`.github/workflows/k3s-deploy.yml`):
```yaml
name: K3s Deploy

on:
  workflow_dispatch:
    inputs:
      deploy_full_stack:
        type: boolean
        default: true
      deploy_fitsync_app:
        type: boolean
        default: true
      # ... other inputs

jobs:
  # ... existing jobs (get-infrastructure-info, install-k3s, etc.)

  deploy-fitsync-app:
    needs: [deploy-istio-gateway]
    if: ${{ inputs.deploy_fitsync_app }}
    uses: FitSync-G13/fitsync-cd-templates/.github/workflows/fitsync-app-deploy.yml@main
    with:
      aws_region: ${{ needs.get-infrastructure-info.outputs.aws_region }}
      domain_name: ${{ needs.get-infrastructure-info.outputs.domain_name }}
      ecr_registry: ${{ secrets.ECR_REGISTRY }}
    secrets:
      aws_role: ${{ secrets.AWS_ROLE_ARN }}
```

#### New Template: fitsync-app-deploy.yml

**Location**: `fitsync-cd-templates/.github/workflows/fitsync-app-deploy.yml`

**Purpose**: Deploy FitSync Helm chart to K3s cluster

```yaml
name: Deploy FitSync Application

on:
  workflow_call:
    inputs:
      aws_region:
        required: true
        type: string
      domain_name:
        required: true
        type: string
      ecr_registry:
        required: true
        type: string
      environment:
        required: false
        type: string
        default: "production"
    secrets:
      aws_role:
        required: true

permissions:
  id-token: write
  contents: read

jobs:
  deploy-fitsync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout fitsync-helm-chart
        uses: actions/checkout@v4
        with:
          repository: FitSync-G13/fitsync-helm-chart
          ref: main

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.aws_role }}
          aws-region: ${{ inputs.aws_region }}

      - name: Get K3s master instance ID
        id: get-master
        run: |
          INSTANCE_ID=$(aws ec2 describe-instances \
            --filters "Name=tag:Role,Values=master" \
                      "Name=instance-state-name,Values=running" \
            --query 'Reservations[0].Instances[0].InstanceId' \
            --output text)
          echo "master_id=$INSTANCE_ID" >> $GITHUB_OUTPUT

      - name: Update Helm values for production
        run: |
          cat > values-prod.yaml <<EOF
          environment: ${{ inputs.environment }}
          domain: ${{ inputs.domain_name }}

          images:
            registry: ${{ inputs.ecr_registry }}
            tag: latest  # Or specific versions from GitOps

          gateway:
            type: istio
            className: istio

          databases:
            # Use external databases or persistent volumes
            persistence: true

          secrets:
            # Reference AWS Secrets Manager
            external: true
          EOF

      - name: Deploy via Helm
        run: |
          INSTALL_CMD=$(cat <<'SCRIPT'
          export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

          # Add Helm repo for dependencies
          helm repo add bitnami https://charts.bitnami.com/bitnami
          helm repo update

          # Install or upgrade FitSync
          helm upgrade --install fitsync /tmp/fitsync-helm-chart \
            --namespace fitsync \
            --create-namespace \
            --values /tmp/fitsync-helm-chart/values-prod.yaml \
            --wait \
            --timeout 10m

          # Verify deployment
          kubectl get pods -n fitsync
          kubectl get gateway -n fitsync
          SCRIPT
          )

          # Copy Helm chart to master
          aws ssm send-command \
            --instance-ids ${{ steps.get-master.outputs.master_id }} \
            --document-name "AWS-RunShellScript" \
            --parameters "commands=[\"rm -rf /tmp/fitsync-helm-chart\"]"

          # Deploy using SSM
          aws ssm send-command \
            --instance-ids ${{ steps.get-master.outputs.master_id }} \
            --document-name "AWS-RunShellScript" \
            --parameters "commands=[\"$INSTALL_CMD\"]" \
            --output text

      - name: Wait for deployment
        run: |
          sleep 60

          # Check deployment status
          aws ssm send-command \
            --instance-ids ${{ steps.get-master.outputs.master_id }} \
            --document-name "AWS-RunShellScript" \
            --parameters 'commands=["export KUBECONFIG=/etc/rancher/k3s/k3s.yaml && kubectl get pods -n fitsync"]' \
            --output text
```

---

## Shared Libraries Strategy

### GitHub Packages Configuration

**Registry**: `ghcr.io/FitSync-G13`

**Authentication**:
```bash
# NPM (.npmrc)
@fitsync:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

# Python (pip.conf)
[global]
extra-index-url = https://<PAT>@ghcr.io/FitSync-G13/simple/
```

### Publishing Workflows

#### fitsync-common (Node.js)

**`.github/workflows/publish.yml`**:
```yaml
name: Publish Package

on:
  release:
    types: [created]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          registry-url: 'https://npm.pkg.github.com'
          scope: '@fitsync'

      - run: npm ci
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**`package.json`**:
```json
{
  "name": "@fitsync/common",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/@fitsync"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/FitSync-G13/fitsync-common.git"
  }
}
```

#### fitsync-common-py (Python)

**`.github/workflows/publish.yml`**:
```yaml
name: Publish Package

on:
  release:
    types: [created]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Build package
        run: |
          pip install build twine
          python -m build

      - name: Publish to GitHub Packages
        env:
          TWINE_USERNAME: __token__
          TWINE_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
          TWINE_REPOSITORY_URL: https://upload.pypi.org/legacy/
        run: twine upload dist/*
```

---

## Deployment Workflow

### End-to-End Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Developer pushes code to service repository (e.g., user-    │
│ service)                                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions CI Workflow                                  │
│ 1. Run tests                                                │
│ 2. Security scan                                            │
│ 3. Build Docker image                                       │
│ 4. Push to ECR: user-service-{sha}                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ GitOps Update Workflow                                      │
│ 1. Clone fitsync-gitops repository                          │
│ 2. Update image tag in environment values                   │
│ 3. Commit and push changes                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ ArgoCD (if configured)                                      │
│ 1. Detects changes in GitOps repo                           │
│ 2. Syncs to K3s cluster                                     │
│ 3. Updates deployment with new image                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ K3s Cluster                                                 │
│ 1. Pulls new image from ECR                                 │
│ 2. Performs rolling update                                  │
│ 3. Health checks pass                                       │
│ 4. Service is live                                          │
└─────────────────────────────────────────────────────────────┘
```

### Manual Deployment Trigger

For initial deployment or full stack refresh:

```bash
# Trigger full stack deployment via fitsync-cd
gh workflow run k3s-deploy.yml \
  --repo FitSync-G13/fitsync-cd \
  -f deploy_full_stack=true \
  -f deploy_fitsync_app=true
```

---

## Step-by-Step Migration

### Week 1: Shared Libraries & Repository Setup

#### Day 1-2: Create Shared Libraries

**Task 1: Create fitsync-common repository**

```bash
# Create repository
gh repo create FitSync-G13/fitsync-common --public

# Clone and set up
git clone https://github.com/FitSync-G13/fitsync-common.git
cd fitsync-common

# Create directory structure
mkdir -p src/{middleware,config,utils} tests
touch src/index.js

# Copy common code from mono-repo
cp ../fitsync/services/user-service/src/middleware/auth.js src/middleware/
cp ../fitsync/services/user-service/src/config/logger.js src/config/
cp ../fitsync/services/user-service/src/config/redis.js src/config/
# ... etc

# Create package.json
cat > package.json <<'EOF'
{
  "name": "@fitsync/common",
  "version": "1.0.0",
  "description": "Shared utilities for FitSync microservices",
  "main": "src/index.js",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/@fitsync"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/FitSync-G13/fitsync-common.git"
  },
  "dependencies": {
    "winston": "^3.11.0",
    "redis": "^4.6.11",
    "jsonwebtoken": "^9.0.2"
  }
}
EOF

# Create publish workflow
mkdir -p .github/workflows
# (Add publish.yml workflow from earlier section)

# Commit and push
git add .
git commit -m "Initial commit: shared Node.js utilities"
git push -u origin main

# Publish initial version
npm publish
```

**Task 2: Create fitsync-common-py repository**

```bash
# Create repository
gh repo create FitSync-G13/fitsync-common-py --public

# Clone and set up
git clone https://github.com/FitSync-G13/fitsync-common-py.git
cd fitsync-common-py

# Create directory structure
mkdir -p fitsync_common tests
touch fitsync_common/__init__.py

# Copy common code
cp ../fitsync/services/schedule-service/utils/http_client.py fitsync_common/
cp ../fitsync/services/progress-service/utils/event_publisher.py fitsync_common/

# Create setup.py
cat > setup.py <<'EOF'
from setuptools import setup, find_packages

setup(
    name="fitsync-common",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "httpx>=0.25.2",
        "redis>=5.0.1",
        "python-jose>=3.3.0",
    ],
)
EOF

# Commit and push
git add .
git commit -m "Initial commit: shared Python utilities"
git push -u origin main

# Publish initial version
python -m build
twine upload dist/*
```

#### Day 3-4: Update Mono-Repo to Use Shared Libraries

**Update Node.js services**:

```bash
cd fitsync/services/user-service

# Add dependency
npm install @fitsync/common@^1.0.0

# Update code to import from shared library
# Example: src/middleware/auth.js
# Before: const authenticate = require('./middleware/auth');
# After:  const { authenticate } = require('@fitsync/common');

# Remove duplicated files
rm src/middleware/auth.js
rm src/config/logger.js
rm src/config/redis.js

# Test locally
npm test

# Commit changes
git add .
git commit -m "Use @fitsync/common shared library"
```

Repeat for training-service, notification-service, api-gateway.

**Update Python services**:

```bash
cd fitsync/services/schedule-service

# Add dependency
pip install fitsync-common

# Update requirements.txt
echo "fitsync-common>=1.0.0" >> requirements.txt

# Update code to import from shared library
# Example: main.py
# Before: from utils.http_client import validate_user
# After:  from fitsync_common.http_client import validate_user

# Remove duplicated files
rm utils/http_client.py

# Test locally
pytest

# Commit changes
git add .
git commit -m "Use fitsync-common shared library"
```

Repeat for progress-service.

#### Day 5: Extract Service Repositories

**Install git-filter-repo**:
```bash
pip install git-filter-repo
```

**Extract user-service**:

```bash
# Clone mono-repo
git clone https://github.com/FitSync-G13/fitsync.git fitsync-user-service
cd fitsync-user-service

# Extract only user-service directory
git filter-repo --path services/user-service/ --path-rename services/user-service/:

# Create repository on GitHub
gh repo create FitSync-G13/fitsync-user-service --public

# Add remote and push
git remote add origin https://github.com/FitSync-G13/fitsync-user-service.git
git push -u origin main
```

**Repeat for all services**:
- training-service
- schedule-service
- progress-service
- notification-service
- api-gateway
- frontend

### Week 2: CI/CD Implementation & Helm Chart Updates

#### Day 1-3: Add GitHub Actions to Each Service

**For each service repository**:

1. **Create `.github/workflows/ci.yml`** (use template from earlier section)
2. **Configure repository secrets**:
   ```bash
   gh secret set AWS_ACCOUNT_ID --repo FitSync-G13/fitsync-user-service
   gh secret set GITOPS_PAT --repo FitSync-G13/fitsync-user-service
   ```
3. **Test workflow**:
   ```bash
   # Make a small change and push
   git commit --allow-empty -m "Test CI workflow"
   git push

   # Monitor workflow
   gh run watch
   ```

#### Day 4-5: Update Helm Chart for Production

**Update fitsync-helm-chart repository**:

```bash
cd fitsync-helm-chart

# 1. Update Chart.yaml
cat > Chart.yaml <<'EOF'
apiVersion: v2
name: fitsync
description: FitSync Personal Training Management System
type: application
version: 1.0.0
appVersion: "1.0.0"

dependencies:
  - name: redis
    version: 17.3.2
    repository: https://charts.bitnami.com/bitnami
EOF

# 2. Create values-production.yaml
cat > values-production.yaml <<'EOF'
environment: production

domain: fitsync.online
subdomain: ""  # Root domain for production

images:
  registry: <AWS-ACCOUNT-ID>.dkr.ecr.us-east-2.amazonaws.com/fitsync-ecr
  pullPolicy: IfNotPresent

  apiGateway:
    repository: fitsync-ecr
    tag: api-gateway-latest

  userService:
    repository: fitsync-ecr
    tag: user-service-latest

  trainingService:
    repository: fitsync-ecr
    tag: training-service-latest

  scheduleService:
    repository: fitsync-ecr
    tag: schedule-service-latest

  progressService:
    repository: fitsync-ecr
    tag: progress-service-latest

  notificationService:
    repository: fitsync-ecr
    tag: notification-service-latest

  frontend:
    repository: fitsync-ecr
    tag: frontend-latest

gateway:
  enabled: true
  type: istio
  className: istio
  tls:
    enabled: true
    secretName: wildcard-cert-tls

databases:
  # Use RDS or persistent volumes in production
  userdb:
    host: userdb.fitsync-prod.svc.cluster.local
    port: 5432
    name: userdb
    persistence:
      enabled: true
      size: 20Gi

  trainingdb:
    host: trainingdb.fitsync-prod.svc.cluster.local
    port: 5432
    name: trainingdb
    persistence:
      enabled: true
      size: 20Gi

  scheduledb:
    host: scheduledb.fitsync-prod.svc.cluster.local
    port: 5432
    name: scheduledb
    persistence:
      enabled: true
      size: 20Gi

  progressdb:
    host: progressdb.fitsync-prod.svc.cluster.local
    port: 5432
    name: progressdb
    persistence:
      enabled: true
      size: 20Gi

redis:
  master:
    persistence:
      enabled: true
      size: 8Gi

secrets:
  external: true  # Use AWS Secrets Manager
  awsSecretsManager:
    region: us-east-2
    jwtSecretName: fitsync/prod/jwt-secret
    jwtRefreshSecretName: fitsync/prod/jwt-refresh-secret
EOF

# 3. Replace Gateway API with Istio Gateway
cat > templates/istio-gateway.yaml <<'EOF'
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: fitsync-gateway
  namespace: {{ .Values.namespace | default "fitsync" }}
spec:
  selector:
    istio: ingressgateway
  servers:
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        credentialName: {{ .Values.gateway.tls.secretName }}
      hosts:
        - "{{ .Values.subdomain }}{{ if .Values.subdomain }}.{{ end }}{{ .Values.domain }}"
        - "*.{{ .Values.subdomain }}{{ if .Values.subdomain }}.{{ end }}{{ .Values.domain }}"
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: fitsync-routes
  namespace: {{ .Values.namespace | default "fitsync" }}
spec:
  hosts:
    - "{{ .Values.subdomain }}{{ if .Values.subdomain }}.{{ end }}{{ .Values.domain }}"
  gateways:
    - fitsync-gateway
  http:
    - match:
        - uri:
            prefix: /api
      route:
        - destination:
            host: api-gateway
            port:
              number: 4000
    - match:
        - uri:
            prefix: /
      route:
        - destination:
            host: frontend
            port:
              number: 3000
EOF

# 4. Update deployment.yaml to use ECR images
# Edit templates/deployment.yaml to reference:
# image: {{ .Values.images.registry }}/{{ .Values.images.userService.repository }}:{{ .Values.images.userService.tag }}

# 5. Test Helm chart locally
helm lint .
helm template fitsync . --values values-production.yaml

# 6. Commit and push
git add .
git commit -m "Production configuration with Istio Gateway and ECR images"
git push
```

### Week 3: GitOps & Infrastructure Integration

#### Day 1-2: Create GitOps Repository

```bash
# Create repository
gh repo create FitSync-G13/fitsync-gitops --private

git clone https://github.com/FitSync-G13/fitsync-gitops.git
cd fitsync-gitops

# Create directory structure
mkdir -p {applications,environments/{dev,staging,prod},base}

# Create ArgoCD application for production
cat > applications/fitsync-prod.yaml <<'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: fitsync-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/FitSync-G13/fitsync-helm-chart.git
    targetRevision: main
    path: .
    helm:
      valueFiles:
        - values-production.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: fitsync
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
EOF

# Create environment-specific values
cat > environments/prod/values.yaml <<'EOF'
# Environment-specific overrides
images:
  apiGateway:
    tag: api-gateway-abc123
  userService:
    tag: user-service-def456
  # ... etc
EOF

# Commit and push
git add .
git commit -m "Initial GitOps configuration"
git push -u origin main
```

#### Day 3-4: Create FitSync App Deploy Template

**In fitsync-cd-templates repository**:

```bash
cd fitsync-cd-templates

# Create new workflow template
cat > .github/workflows/fitsync-app-deploy.yml
# (Use the template from the "GitHub Actions CI/CD" section)

git add .
git commit -m "Add FitSync application deployment template"
git push
```

#### Day 5: Update Main Orchestration Workflow

**In fitsync-cd repository**:

```bash
cd fitsync-cd

# Update .github/workflows/k3s-deploy.yml
# Replace deploy-sample-app job with deploy-fitsync-app
# (See updated workflow in "GitHub Actions CI/CD" section)

git add .
git commit -m "Replace Bookinfo with FitSync application deployment"
git push
```

### Week 4: Testing, Validation & Cutover

#### Day 1-2: Build and Push Initial Images

**For each service**:

```bash
# Trigger CI workflow for each service repository
gh workflow run ci.yml --repo FitSync-G13/fitsync-user-service
gh workflow run ci.yml --repo FitSync-G13/fitsync-training-service
gh workflow run ci.yml --repo FitSync-G13/fitsync-schedule-service
gh workflow run ci.yml --repo FitSync-G13/fitsync-progress-service
gh workflow run ci.yml --repo FitSync-G13/fitsync-notification-service
gh workflow run ci.yml --repo FitSync-G13/fitsync-api-gateway
gh workflow run ci.yml --repo FitSync-G13/fitsync-frontend

# Verify images in ECR
aws ecr describe-images \
  --repository-name fitsync-ecr \
  --region us-east-2
```

#### Day 3: Deploy FitSync Application

```bash
# Trigger full stack deployment
gh workflow run k3s-deploy.yml \
  --repo FitSync-G13/fitsync-cd \
  -f deploy_full_stack=false \
  -f deploy_fitsync_app=true

# Monitor deployment
gh run watch --repo FitSync-G13/fitsync-cd

# Verify deployment on K3s cluster
# SSH to bastion host
ssh -i ~/.ssh/fitsync-bastion.pem ubuntu@<BASTION-IP>

# From bastion, SSH to master node
ssh -i ~/.ssh/fitsync-cluster.pem ubuntu@<MASTER-PRIVATE-IP>

# Check pods
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get pods -n fitsync
kubectl get gateway -n fitsync
kubectl get virtualservice -n fitsync

# Check Istio ingress
kubectl get svc -n istio-system
```

#### Day 4: Integration Testing

```bash
# Test API endpoints
curl https://fitsync.online/api/health
curl https://fitsync.online/api/users/health

# Test frontend
curl https://fitsync.online

# Check logs
kubectl logs -n fitsync -l app=api-gateway --tail=100
kubectl logs -n fitsync -l app=user-service --tail=100

# Performance testing
# Use k6, Artillery, or JMeter
k6 run load-test.js
```

#### Day 5: Cutover

**1. Archive mono-repo**:

```bash
cd fitsync

# Add archive notice to README
cat >> README.md <<'EOF'

---

## ⚠️ ARCHIVED REPOSITORY

This repository has been archived and is now read-only.

**Migration Date**: December 8, 2025

**New Repositories**:
- [fitsync-api-gateway](https://github.com/FitSync-G13/fitsync-api-gateway)
- [fitsync-user-service](https://github.com/FitSync-G13/fitsync-user-service)
- [fitsync-training-service](https://github.com/FitSync-G13/fitsync-training-service)
- [fitsync-schedule-service](https://github.com/FitSync-G13/fitsync-schedule-service)
- [fitsync-progress-service](https://github.com/FitSync-G13/fitsync-progress-service)
- [fitsync-notification-service](https://github.com/FitSync-G13/fitsync-notification-service)
- [fitsync-frontend](https://github.com/FitSync-G13/fitsync-frontend)

**Infrastructure**:
- [fitsync-helm-chart](https://github.com/FitSync-G13/fitsync-helm-chart)
- [fitsync-gitops](https://github.com/FitSync-G13/fitsync-gitops)
EOF

git add README.md
git commit -m "Archive repository - migrated to multi-repo"
git push

# Archive via GitHub UI or CLI
gh repo archive FitSync-G13/fitsync
```

**2. Update documentation**:

- Update main README in each service repository
- Create comprehensive architecture documentation
- Update team onboarding guides
- Document new development workflow

**3. Team announcement**:

- Send migration announcement email
- Host team training session
- Update CI/CD dashboard links
- Update monitoring/alerting configurations

---

## Production Hardening

### Security Best Practices

#### 1. Secrets Management

**Use AWS Secrets Manager**:

```bash
# Create secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name fitsync/prod/jwt-secret \
  --secret-string "$(openssl rand -base64 32)" \
  --region us-east-2

aws secretsmanager create-secret \
  --name fitsync/prod/jwt-refresh-secret \
  --secret-string "$(openssl rand -base64 32)" \
  --region us-east-2

aws secretsmanager create-secret \
  --name fitsync/prod/database-credentials \
  --secret-string '{"username":"fitsync","password":"<STRONG-PASSWORD>"}' \
  --region us-east-2
```

**Update Helm chart to use External Secrets Operator**:

```yaml
# Install External Secrets Operator
helm install external-secrets \
  external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace

# Create SecretStore
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets
  namespace: fitsync
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-2
      auth:
        jwt:
          serviceAccountRef:
            name: fitsync-sa

# Create ExternalSecret
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: jwt-secrets
  namespace: fitsync
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets
    kind: SecretStore
  target:
    name: jwt-secrets
  data:
    - secretKey: JWT_SECRET
      remoteRef:
        key: fitsync/prod/jwt-secret
    - secretKey: JWT_REFRESH_SECRET
      remoteRef:
        key: fitsync/prod/jwt-refresh-secret
```

#### 2. Network Policies

**Implement Cilium Network Policies**:

```yaml
# templates/networkpolicy.yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: api-gateway-policy
  namespace: fitsync
spec:
  endpointSelector:
    matchLabels:
      app: api-gateway
  egress:
    - toEndpoints:
        - matchLabels:
            app: user-service
        - matchLabels:
            app: training-service
        - matchLabels:
            app: schedule-service
        - matchLabels:
            app: progress-service
        - matchLabels:
            app: notification-service
      toPorts:
        - ports:
            - port: "3001"
            - port: "3002"
            - port: "8003"
            - port: "8004"
            - port: "3005"
```

#### 3. RBAC & Service Accounts

**Least Privilege Access**:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: fitsync-sa
  namespace: fitsync
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<ACCOUNT-ID>:role/fitsync-app-role
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: fitsync-role
  namespace: fitsync
rules:
  - apiGroups: [""]
    resources: ["secrets", "configmaps"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: fitsync-binding
  namespace: fitsync
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: fitsync-role
subjects:
  - kind: ServiceAccount
    name: fitsync-sa
    namespace: fitsync
```

#### 4. Image Scanning

**Automated Vulnerability Scanning**:

```yaml
# Add to CI workflow
- name: Run Trivy scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.ECR_REGISTRY }}/fitsync-ecr:${{ env.IMAGE_TAG }}
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'

- name: Upload Trivy results to GitHub Security
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-results.sarif'
```

### Monitoring & Observability

#### 1. Install Prometheus & Grafana

```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

# Install Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set adminPassword='<STRONG-PASSWORD>'
```

#### 2. Service Mesh Observability (Istio)

```bash
# Install Kiali, Jaeger, Prometheus for Istio
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/kiali.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/jaeger.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/addons/prometheus.yaml

# Access Kiali dashboard
kubectl port-forward svc/kiali -n istio-system 20001:20001
```

#### 3. Logging with Loki

```bash
# Install Loki stack
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set grafana.enabled=false \
  --set promtail.enabled=true
```

### Database Strategy

#### Option 1: In-Cluster PostgreSQL with Persistence

```yaml
# Use StatefulSet with persistent volumes
databases:
  userdb:
    persistence:
      enabled: true
      storageClass: gp3
      size: 20Gi
    backup:
      enabled: true
      schedule: "0 2 * * *"  # Daily at 2 AM
```

#### Option 2: Amazon RDS (Recommended for Production)

```bash
# Create RDS instances via Terraform
# Add to fitsync-aws-terraform-modules/modules/spoke/rds.tf

resource "aws_db_instance" "userdb" {
  identifier           = "fitsync-userdb-prod"
  engine              = "postgres"
  engine_version      = "15.4"
  instance_class      = "db.t3.medium"
  allocated_storage   = 100
  storage_encrypted   = true

  db_name  = "userdb"
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  multi_az = true

  tags = {
    Name = "fitsync-userdb-prod"
  }
}
```

**Update Helm chart to use RDS**:

```yaml
databases:
  external: true
  userdb:
    host: fitsync-userdb-prod.xxxx.us-east-2.rds.amazonaws.com
    port: 5432
    name: userdb
    credentialsSecret: rds-credentials
```

---

## Rollback Plan

### Rollback Scenarios

#### Scenario 1: Service-Level Rollback

**Issue**: Single service deployment fails or introduces bugs

**Solution**: Revert image tag in GitOps repository

```bash
cd fitsync-gitops

# Revert to previous image tag
git log environments/prod/user-service/values.yaml
git revert <commit-sha>
git push

# Or manually update
sed -i 's/user-service-new-sha/user-service-old-sha/g' \
  environments/prod/user-service/values.yaml
git commit -am "Rollback user-service to previous version"
git push

# ArgoCD will auto-sync or manually sync
kubectl -n argocd exec -it <argocd-pod> -- \
  argocd app sync fitsync-prod
```

#### Scenario 2: Full Application Rollback

**Issue**: Multiple services failing, need to revert entire deployment

**Solution**: Redeploy Bookinfo sample app

```bash
# Trigger deployment with Bookinfo
gh workflow run k3s-deploy.yml \
  --repo FitSync-G13/fitsync-cd \
  -f deploy_fitsync_app=false \
  -f deploy_sample_app=true

# Or manually deploy Bookinfo
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.20/samples/bookinfo/platform/kube/bookinfo.yaml
```

#### Scenario 3: Infrastructure Rollback

**Issue**: K3s cluster or infrastructure issues

**Solution**: Terraform state rollback

```bash
cd fitsync-aws-terraform-modules/live/02-spoke-prod

# View state history
terraform state list

# Import previous state
# Or recreate infrastructure
terraform destroy -auto-approve
terraform apply -auto-approve
```

#### Scenario 4: Complete Rollback to Mono-Repo

**Issue**: Multi-repo migration proves problematic, need to return to mono-repo

**Solution**:

1. **Unarchive mono-repo**:
   ```bash
   gh repo unarchive FitSync-G13/fitsync
   ```

2. **Update CircleCI configuration** (if still exists)

3. **Deploy from mono-repo**:
   ```bash
   cd fitsync
   docker-compose up -d
   ```

4. **Archive multi-repo repositories**

---

## Post-Migration Checklist

### Per Service Repository

- [ ] Git history preserved
- [ ] README.md with service-specific documentation
- [ ] CHANGELOG.md initialized
- [ ] API.md with endpoint documentation
- [ ] Dockerfile optimized for production
- [ ] GitHub Actions CI/CD workflows configured
- [ ] Branch protection rules set (main, dev, staging)
- [ ] Dependabot enabled for dependency updates
- [ ] CODEOWNERS file added
- [ ] Repository secrets configured (AWS_ACCOUNT_ID, etc.)
- [ ] First successful CI build completed
- [ ] Docker image pushed to ECR
- [ ] Service deployed and accessible

### Shared Libraries

- [ ] `fitsync-common` published to GitHub Packages
- [ ] `fitsync-common-py` published to GitHub Packages
- [ ] All services updated to use shared libraries
- [ ] Versioning strategy documented
- [ ] Automated publishing workflow configured

### Infrastructure

- [ ] `fitsync-gitops` repository created
- [ ] ArgoCD applications configured (optional)
- [ ] Environment-specific values files created
- [ ] `fitsync-app-deploy.yml` template created in cd-templates
- [ ] `k3s-deploy.yml` updated to deploy FitSync app
- [ ] Helm chart updated for production (Istio Gateway, ECR images)
- [ ] Secrets externalized (AWS Secrets Manager)
- [ ] Database strategy decided (in-cluster vs RDS)

### Deployment Validation

- [ ] All 7 microservices deployed successfully
- [ ] Frontend accessible at https://fitsync.online
- [ ] API Gateway routing correctly to backend services
- [ ] Inter-service communication working (Redis Pub/Sub)
- [ ] Database connections established
- [ ] Authentication flow working (JWT tokens)
- [ ] TLS certificate valid (wildcard cert)
- [ ] Health checks passing for all services
- [ ] Logs accessible via kubectl/Loki
- [ ] Metrics collected in Prometheus
- [ ] Grafana dashboards created

### Security & Compliance

- [ ] All secrets stored in AWS Secrets Manager
- [ ] Network policies implemented (Cilium)
- [ ] RBAC configured (least privilege)
- [ ] Service mesh mTLS enabled (Istio)
- [ ] Image scanning in CI/CD pipelines
- [ ] Vulnerability scanning automated (Trivy, Snyk)
- [ ] IAM roles follow least privilege
- [ ] Security groups properly configured

### Monitoring & Observability

- [ ] Prometheus installed and scraping metrics
- [ ] Grafana dashboards configured
- [ ] Loki collecting logs
- [ ] Istio observability enabled (Kiali, Jaeger)
- [ ] Alerting rules configured
- [ ] On-call rotation updated

### Documentation

- [ ] Architecture documentation updated
- [ ] Development workflow documented
- [ ] Deployment process documented
- [ ] Rollback procedures documented
- [ ] Troubleshooting guide created
- [ ] Team onboarding guide updated
- [ ] API contracts documented (OpenAPI/Swagger)

### Team Enablement

- [ ] All team members have repository access
- [ ] GitHub Packages access configured
- [ ] AWS console access granted
- [ ] K3s cluster access provided (kubectl config)
- [ ] Training session conducted
- [ ] Migration announcement sent
- [ ] External stakeholders notified

### Legacy Cleanup

- [ ] Mono-repo archived (read-only)
- [ ] CircleCI configuration disabled
- [ ] Old documentation links updated
- [ ] Monitoring dashboards updated
- [ ] CI/CD dashboard links updated
- [ ] Wiki/Confluence pages updated

---

## Conclusion

This migration plan provides a comprehensive roadmap for transitioning FitSync from a mono-repo to a multi-repo microservices architecture, fully integrated with your existing AWS infrastructure.

**Key Success Factors**:
1. Incremental migration (shared libraries first)
2. Leveraging existing infrastructure (Terraform, Helm chart)
3. Replacing sample app with production FitSync deployment
4. GitHub Actions for modern CI/CD
5. GitOps for automated deployments
6. Comprehensive testing and validation

**Timeline**: 4 weeks (can be accelerated or extended based on team capacity)

**Next Steps**:
1. Review and approve this plan
2. Decide on shared library distribution method (GitHub Packages recommended)
3. Start with Phase 0: Create shared libraries
4. Proceed with phased migration

---

**Document Version:** 2.0
**Last Updated:** 2025-12-08
**Maintained By:** FitSync DevOps Team
**Contact:** devops@fitsync.online
