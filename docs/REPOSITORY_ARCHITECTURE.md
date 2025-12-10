# FitSync Multi-Repo Architecture

**Version:** 1.0
**Last Updated:** 2025-12-08

Visual reference guide showing all repositories and their relationships.

---

## Complete Repository Map

```
FitSync-G13 Organization
│
├── APPLICATION SERVICES (7 repositories)
│   │
│   ├── fitsync-api-gateway
│   │   ├── Port: 4000
│   │   ├── Tech: Node.js/Express
│   │   ├── Purpose: API routing, rate limiting, composition
│   │   ├── Depends on: ALL backend services
│   │   └── CI/CD: GitHub Actions → ECR → GitOps
│   │
│   ├── fitsync-user-service
│   │   ├── Port: 3001
│   │   ├── Tech: Node.js/Express
│   │   ├── Purpose: Authentication, user management, RBAC
│   │   ├── Database: PostgreSQL (userdb)
│   │   ├── Depends on: @fitsync/common, Redis
│   │   └── CI/CD: GitHub Actions → ECR → GitOps
│   │
│   ├── fitsync-training-service
│   │   ├── Port: 3002
│   │   ├── Tech: Node.js/Express
│   │   ├── Purpose: Workouts, programs, exercises
│   │   ├── Database: PostgreSQL (trainingdb)
│   │   ├── Depends on: @fitsync/common, user-service, notification-service
│   │   └── CI/CD: GitHub Actions → ECR → GitOps
│   │
│   ├── fitsync-schedule-service
│   │   ├── Port: 8003
│   │   ├── Tech: Python/FastAPI
│   │   ├── Purpose: Bookings, availability, scheduling
│   │   ├── Database: PostgreSQL (scheduledb)
│   │   ├── Depends on: fitsync-common-py, user-service, training-service
│   │   └── CI/CD: GitHub Actions → ECR → GitOps
│   │
│   ├── fitsync-progress-service
│   │   ├── Port: 8004
│   │   ├── Tech: Python/FastAPI
│   │   ├── Purpose: Progress tracking, analytics, achievements
│   │   ├── Database: PostgreSQL (progressdb)
│   │   ├── Depends on: fitsync-common-py, user-service, schedule-service, training-service
│   │   └── CI/CD: GitHub Actions → ECR → GitOps
│   │
│   ├── fitsync-notification-service
│   │   ├── Port: 3005
│   │   ├── Tech: Node.js/Express
│   │   ├── Purpose: Email, SMS, push notifications
│   │   ├── Database: None (stateless)
│   │   ├── Depends on: @fitsync/common, Redis (Pub/Sub subscriber)
│   │   └── CI/CD: GitHub Actions → ECR → GitOps
│   │
│   └── fitsync-frontend
│       ├── Port: 3000
│       ├── Tech: React 18, Tailwind CSS
│       ├── Purpose: Web application UI
│       ├── Depends on: API Gateway (for all backend calls)
│       └── CI/CD: GitHub Actions → ECR → GitOps
│
├── SHARED LIBRARIES (2 repositories)
│   │
│   ├── fitsync-common
│   │   ├── Type: NPM Package (@fitsync/common)
│   │   ├── Tech: Node.js
│   │   ├── Purpose: Shared utilities for Node.js services
│   │   ├── Contains: auth middleware, logger, redis client, event publisher
│   │   ├── Distribution: GitHub Packages
│   │   ├── Versioning: Semantic versioning (1.0.0)
│   │   └── Used by: api-gateway, user-service, training-service, notification-service
│   │
│   └── fitsync-common-py
│       ├── Type: Python Package (fitsync-common)
│       ├── Tech: Python 3.11
│       ├── Purpose: Shared utilities for Python services
│       ├── Contains: http client, event publisher, auth helpers
│       ├── Distribution: GitHub Packages / PyPI
│       ├── Versioning: Semantic versioning (1.0.0)
│       └── Used by: schedule-service, progress-service
│
├── INFRASTRUCTURE AS CODE (1 repository)
│   │
│   └── fitsync-aws-terraform-modules
│       ├── Purpose: AWS infrastructure provisioning
│       ├── Tech: Terraform, Bash
│       ├── Structure:
│       │   ├── modules/
│       │   │   ├── shared/     → ECR repository
│       │   │   ├── hub/        → Hub VPC, Transit Gateway, Bastion, ALB
│       │   │   └── spoke/      → Spoke VPC, K3s cluster, NLB
│       │   └── live/
│       │       ├── 00-shared-global/  → ECR deployment
│       │       ├── 01-hub-prod/       → Hub infrastructure
│       │       └── 02-spoke-prod/     → K3s cluster
│       ├── Provisions:
│       │   ├── ECR: fitsync-ecr (for Docker images)
│       │   ├── VPCs: Hub (10.0.0.0/16) + Spoke (10.1.0.0/16)
│       │   ├── Transit Gateway: Cross-VPC routing
│       │   ├── Public ALB: Internet-facing with ACM wildcard cert
│       │   ├── Bastion Host: SSH access to private cluster
│       │   ├── K3s Cluster: 1 master + 1 worker + 1 db node
│       │   ├── VPC Endpoints: ECR access from private subnets
│       │   └── GitHub OIDC: For CI/CD authentication
│       └── Outputs: Instance IDs, NLB DNS, ECR URL
│
├── CI/CD ORCHESTRATION (1 repository)
│   │
│   └── fitsync-cd
│       ├── Purpose: Main deployment orchestration
│       ├── Tech: GitHub Actions
│       ├── Workflows:
│       │   ├── k3s-deploy.yml → Orchestrates full stack deployment
│       │   ├── setup-https.yml → HTTPS configuration
│       │   └── test-connectivity.yml → Infrastructure testing
│       ├── Deployment Sequence:
│       │   1. Query AWS for infrastructure info
│       │   2. Install K3s cluster (via template)
│       │   3. Install Cilium CNI (via template)
│       │   4. Install Istio service mesh (via template)
│       │   5. Install cert-manager (via template)
│       │   6. Create wildcard certificate (via template)
│       │   7. Deploy Istio Gateway (via template)
│       │   8. Deploy FitSync application (via template) ← NEW
│       └── Triggers: Manual (workflow_dispatch)
│
├── CI/CD TEMPLATES (1 repository)
│   │
│   └── fitsync-cd-templates
│       ├── Purpose: Reusable GitHub Actions workflow templates
│       ├── Tech: GitHub Actions (workflow_call)
│       ├── Templates:
│       │   ├── k3s-install-modular.yml → K3s cluster installation
│       │   ├── cilium-install.yml → Cilium CNI setup
│       │   ├── istio-install.yml → Istio service mesh
│       │   ├── cert-manager-install.yml → Certificate manager
│       │   ├── wildcard-cert.yml → Wildcard TLS certificate
│       │   ├── istio-gateway-https.yml → Istio Gateway with HTTPS
│       │   ├── istio-sample-app.yml → Bookinfo sample (TO BE REMOVED)
│       │   └── fitsync-app-deploy.yml → FitSync Helm deployment (NEW)
│       └── Called by: fitsync-cd workflows
│
├── KUBERNETES DEPLOYMENT (1 repository)
│   │
│   └── fitsync-helm-chart
│       ├── Purpose: Kubernetes deployment configuration
│       ├── Tech: Helm 3
│       ├── Structure:
│       │   ├── templates/
│       │   │   ├── deployment.yaml → All 7 microservices
│       │   │   ├── service.yaml → ClusterIP services
│       │   │   ├── istio-gateway.yaml → Istio Gateway (NEW)
│       │   │   ├── istio-virtualservice.yaml → Traffic routing (NEW)
│       │   │   ├── dev-databases.yaml → PostgreSQL x4 + Redis
│       │   │   └── secrets.yaml → JWT secrets
│       │   ├── values.yaml → Development configuration
│       │   └── values-production.yaml → Production configuration (NEW)
│       ├── Dependencies:
│       │   └── Bitnami Redis 17.3.2 (via subchart)
│       ├── Deployed by: fitsync-app-deploy.yml template
│       └── Namespace: fitsync
│
└── GITOPS CONFIGURATION (1 repository) - TO BE CREATED
    │
    └── fitsync-gitops
        ├── Purpose: GitOps deployment configurations
        ├── Tech: ArgoCD (optional), YAML manifests
        ├── Structure:
        │   ├── applications/
        │   │   ├── fitsync-dev.yaml → Dev ArgoCD app
        │   │   ├── fitsync-staging.yaml → Staging ArgoCD app
        │   │   └── fitsync-prod.yaml → Prod ArgoCD app
        │   └── environments/
        │       ├── dev/
        │       │   ├── api-gateway/values.yaml
        │       │   ├── user-service/values.yaml
        │       │   └── ... (all services)
        │       ├── staging/
        │       └── prod/
        ├── Updated by: Service CI/CD workflows (on successful build)
        └── Synced to: K3s cluster (via ArgoCD or manual helm upgrade)
```

---

## Data Flow Architecture

### 1. Code to Production Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Developer Workflow                                               │
└──────────────────────────────────────────────────────────────────┘
         │
         ├─► Developer pushes code to service repo (e.g., user-service)
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Service Repository CI/CD                                         │
│ (fitsync-user-service/.github/workflows/ci.yml)                  │
├──────────────────────────────────────────────────────────────────┤
│ 1. Run tests (unit + integration)                                │
│ 2. Security scan (Trivy, Snyk)                                   │
│ 3. Build Docker image                                            │
│ 4. Scan Docker image                                             │
│ 5. Push to ECR: fitsync-ecr:user-service-{sha}                   │
│ 6. Tag: user-service-dev, user-service-{sha}                     │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ GitOps Update                                                    │
│ (fitsync-user-service/.github/workflows/gitops-update.yml)       │
├──────────────────────────────────────────────────────────────────┤
│ 1. Clone fitsync-gitops repository                               │
│ 2. Update image tag in environments/dev/user-service/values.yaml │
│ 3. Commit: "Update user-service to {sha} in dev"                 │
│ 4. Push to fitsync-gitops                                        │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ ArgoCD Sync (Optional)                                           │
├──────────────────────────────────────────────────────────────────┤
│ 1. ArgoCD detects change in fitsync-gitops                       │
│ 2. Pulls new Helm values                                         │
│ 3. Applies to K3s cluster                                        │
│ 4. Rolling update of user-service pods                           │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ K3s Cluster (AWS Spoke VPC)                                      │
├──────────────────────────────────────────────────────────────────┤
│ 1. Pull image from ECR via VPC endpoint                          │
│ 2. Terminate old pod (graceful shutdown)                         │
│ 3. Start new pod with new image                                  │
│ 4. Health checks pass                                            │
│ 5. Update complete                                               │
└──────────────────────────────────────────────────────────────────┘
```

### 2. Infrastructure Provisioning Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ fitsync-aws-terraform-modules                                    │
└──────────────────────────────────────────────────────────────────┘
         │
         ├─► terraform apply (manual or via GitHub Actions)
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ AWS Resources Created                                            │
├──────────────────────────────────────────────────────────────────┤
│ Shared Layer (00-shared-global):                                 │
│   └─► ECR Repository: fitsync-ecr                                │
│                                                                   │
│ Hub Layer (01-hub-prod):                                         │
│   ├─► VPC: 10.0.0.0/16                                           │
│   ├─► Internet Gateway                                           │
│   ├─► NAT Gateways (multi-AZ)                                    │
│   ├─► Transit Gateway                                            │
│   ├─► Bastion Host (t3.micro)                                    │
│   ├─► Public ALB with ACM wildcard cert                          │
│   └─► GitHub OIDC Provider + IAM Role                            │
│                                                                   │
│ Spoke Layer (02-spoke-prod):                                     │
│   ├─► VPC: 10.1.0.0/16 (private subnets only)                    │
│   ├─► Transit Gateway Attachment                                 │
│   ├─► EC2 Instances: 1 master + 1 worker + 1 db (t3.medium)      │
│   ├─► Internal NLB for K3s API (port 6443)                       │
│   ├─► VPC Endpoints: ECR, S3                                     │
│   └─► Security Groups                                            │
└──────────────────────────────────────────────────────────────────┘
         │
         ├─► Outputs: Instance IDs, NLB DNS, ECR URL
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ GitHub Secrets/Environments Configured                           │
├──────────────────────────────────────────────────────────────────┤
│ Variables set in fitsync-cd repository:                          │
│   ├─► AWS_REGION: us-east-2                                      │
│   ├─► PROJECT_NAME: fitsync                                      │
│   ├─► DOMAIN_NAME: fitsync.online                                │
│   └─► HUB_ENV, SPOKE_ENV: prod-hub, prod-spoke                   │
└──────────────────────────────────────────────────────────────────┘
```

### 3. Platform Setup Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ Manual Trigger: fitsync-cd/k3s-deploy.yml                        │
│ Input: deploy_full_stack=true                                    │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Job 1: Get Infrastructure Info                                   │
├──────────────────────────────────────────────────────────────────┤
│ ├─► Query EC2 for master/worker/db instance IDs                  │
│ ├─► Get NLB DNS name                                             │
│ └─► Export as outputs for subsequent jobs                        │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Job 2: Install K3s Cluster                                       │
│ Calls: fitsync-cd-templates/k3s-install-modular.yml              │
├──────────────────────────────────────────────────────────────────┤
│ ├─► Install K3s on master (--disable-network-policy)             │
│ ├─► Join workers to cluster                                      │
│ └─► Configure kubeconfig                                         │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Job 3: Install Cilium CNI                                        │
│ Calls: fitsync-cd-templates/cilium-install.yml                   │
├──────────────────────────────────────────────────────────────────┤
│ └─► Install Cilium 1.18.4 with kubeProxyReplacement=false        │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Job 4: Install Istio Service Mesh                                │
│ Calls: fitsync-cd-templates/istio-install.yml                    │
├──────────────────────────────────────────────────────────────────┤
│ ├─► Install Istio with default profile                           │
│ ├─► Configure ingress gateway as NodePort (30080/30443)          │
│ └─► Enable sidecar injection in default namespace                │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Job 5: Install cert-manager                                      │
│ Calls: fitsync-cd-templates/cert-manager-install.yml             │
├──────────────────────────────────────────────────────────────────┤
│ └─► Install cert-manager for TLS certificate management          │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Job 6: Create Wildcard Certificate                               │
│ Calls: fitsync-cd-templates/wildcard-cert.yml                    │
├──────────────────────────────────────────────────────────────────┤
│ ├─► Create ClusterIssuer with Cloudflare DNS                     │
│ ├─► Request wildcard cert for *.fitsync.online                   │
│ └─► Store in secret: wildcard-cert-tls                           │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Job 7: Deploy Istio Gateway                                      │
│ Calls: fitsync-cd-templates/istio-gateway-https.yml              │
├──────────────────────────────────────────────────────────────────┤
│ ├─► Create Istio Gateway resource (port 443 with TLS)            │
│ └─► Configure to use wildcard-cert-tls secret                    │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Job 8: Deploy FitSync Application (NEW)                          │
│ Calls: fitsync-cd-templates/fitsync-app-deploy.yml               │
├──────────────────────────────────────────────────────────────────┤
│ ├─► Checkout fitsync-helm-chart repository                       │
│ ├─► Update values-production.yaml with ECR registry              │
│ ├─► helm upgrade --install fitsync ./fitsync-helm-chart          │
│ ├─► Wait for all pods to be ready                                │
│ └─► Verify deployment (kubectl get pods -n fitsync)              │
└──────────────────────────────────────────────────────────────────┘
```

### 4. Traffic Flow (Production)

```
┌──────────────────────────────────────────────────────────────────┐
│ User Browser                                                     │
│ https://fitsync.online                                           │
└──────────────────────────────────────────────────────────────────┘
         │
         │ DNS Resolution (Cloudflare)
         │ fitsync.online → ALB DNS
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Public ALB (Hub VPC)                                             │
│ - Internet-facing                                                │
│ - Listener: HTTPS:443                                            │
│ - TLS Termination with ACM wildcard certificate                  │
└──────────────────────────────────────────────────────────────────┘
         │
         │ Forward to Target Group
         │ Protocol: HTTPS (end-to-end encryption)
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Transit Gateway                                                  │
│ Routes traffic from Hub VPC (10.0.0.0/16)                        │
│              to Spoke VPC (10.1.0.0/16)                          │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ K3s Worker Nodes (Spoke VPC)                                     │
│ NodePort 30443 (HTTPS)                                           │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Istio Ingress Gateway (istio-system namespace)                   │
│ - Receives HTTPS traffic on NodePort 30443                       │
│ - Uses wildcard-cert-tls for TLS                                 │
│ - Matches on host: fitsync.online                                │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│ Istio VirtualService (fitsync namespace)                         │
│ Routing rules:                                                   │
│   /api/* → api-gateway:4000                                      │
│   /*     → frontend:3000                                         │
└──────────────────────────────────────────────────────────────────┘
         │
         ├────► /api/* ───────────────────────────────────────┐
         │                                                     │
         │                                                     ▼
         │                              ┌──────────────────────────────┐
         │                              │ API Gateway (Port 4000)      │
         │                              │ - Request routing            │
         │                              │ - Rate limiting              │
         │                              │ - Composition                │
         │                              └──────────────────────────────┘
         │                                        │
         │                      ┌─────────────────┼─────────────────┐
         │                      │                 │                 │
         │                      ▼                 ▼                 ▼
         │              ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │              │ User Service │  │Training Svc  │  │Schedule Svc  │
         │              │   (3001)     │  │   (3002)     │  │   (8003)     │
         │              └──────────────┘  └──────────────┘  └──────────────┘
         │                      │                 │                 │
         │                      ▼                 ▼                 ▼
         │              ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │              │ PostgreSQL   │  │ PostgreSQL   │  │ PostgreSQL   │
         │              │  (userdb)    │  │ (trainingdb) │  │ (scheduledb) │
         │              └──────────────┘  └──────────────┘  └──────────────┘
         │
         └────► /* ────────────────────────────────────────┐
                                                            │
                                                            ▼
                                          ┌──────────────────────────────┐
                                          │ Frontend (Port 3000)         │
                                          │ - React SPA                  │
                                          │ - Calls API Gateway          │
                                          └──────────────────────────────┘
```

---

## Service Dependency Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│ Service Dependencies (Who calls whom?)                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Frontend                                                               │
│    └──► api-gateway (all API calls)                                    │
│                                                                         │
│  API Gateway                                                            │
│    ├──► user-service (auth, users)                                     │
│    ├──► training-service (workouts, programs)                          │
│    ├──► schedule-service (bookings)                                    │
│    ├──► progress-service (progress, analytics)                         │
│    └──► notification-service (notifications)                           │
│                                                                         │
│  User Service                                                           │
│    ├──► Redis (session cache, user cache)                              │
│    └──► PostgreSQL (userdb)                                            │
│                                                                         │
│  Training Service                                                       │
│    ├──► user-service (validate trainer/client IDs) [HTTP]              │
│    ├──► notification-service (program events) [Redis Pub/Sub]          │
│    ├──► Redis (caching)                                                │
│    └──► PostgreSQL (trainingdb)                                        │
│                                                                         │
│  Schedule Service                                                       │
│    ├──► user-service (validate user IDs) [HTTP]                        │
│    ├──► training-service (verify programs) [HTTP]                      │
│    ├──► notification-service (booking events) [Redis Pub/Sub]          │
│    ├──► Redis (caching)                                                │
│    └──► PostgreSQL (scheduledb)                                        │
│                                                                         │
│  Progress Service                                                       │
│    ├──► user-service (validate client IDs) [HTTP]                      │
│    ├──► schedule-service (fetch bookings) [HTTP]                       │
│    ├──► training-service (fetch programs) [HTTP]                       │
│    ├──► notification-service (achievement events) [Redis Pub/Sub]      │
│    ├──► Redis (caching)                                                │
│    └──► PostgreSQL (progressdb)                                        │
│                                                                         │
│  Notification Service                                                   │
│    ├──► user-service (fetch user contact info) [HTTP]                  │
│    └──► Redis (Pub/Sub subscriber for events)                          │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Package Dependencies

```
┌────────────────────────────────────────────────────────────────────────┐
│ Shared Library Usage                                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  @fitsync/common (NPM Package)                                         │
│    │                                                                    │
│    ├──► Used by: api-gateway                                           │
│    ├──► Used by: user-service                                          │
│    ├──► Used by: training-service                                      │
│    └──► Used by: notification-service                                  │
│                                                                         │
│  fitsync-common-py (Python Package)                                    │
│    │                                                                    │
│    ├──► Used by: schedule-service                                      │
│    └──► Used by: progress-service                                      │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

```
┌────────────────────────────────────────────────────────────────────────┐
│ Environment Variables by Service                                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ALL SERVICES (Common)                                                 │
│    ├─ NODE_ENV / ENVIRONMENT: production, staging, development         │
│    ├─ PORT: Service-specific port                                      │
│    ├─ REDIS_HOST: redis.fitsync.svc.cluster.local                      │
│    ├─ REDIS_PORT: 6379                                                 │
│    └─ LOG_LEVEL: info, debug, error                                    │
│                                                                         │
│  Services with Databases                                               │
│    ├─ DB_HOST: {service}db.fitsync.svc.cluster.local                   │
│    ├─ DB_PORT: 5432                                                    │
│    ├─ DB_NAME: userdb | trainingdb | scheduledb | progressdb           │
│    ├─ DB_USER: from secret                                             │
│    └─ DB_PASSWORD: from secret                                         │
│                                                                         │
│  User Service                                                           │
│    ├─ JWT_SECRET: from AWS Secrets Manager                             │
│    ├─ JWT_REFRESH_SECRET: from AWS Secrets Manager                     │
│    ├─ JWT_EXPIRY: 15m                                                  │
│    └─ JWT_REFRESH_EXPIRY: 7d                                           │
│                                                                         │
│  API Gateway                                                            │
│    ├─ USER_SERVICE_URL: http://user-service:3001                       │
│    ├─ TRAINING_SERVICE_URL: http://training-service:3002               │
│    ├─ SCHEDULE_SERVICE_URL: http://schedule-service:8003               │
│    ├─ PROGRESS_SERVICE_URL: http://progress-service:8004               │
│    └─ NOTIFICATION_SERVICE_URL: http://notification-service:3005       │
│                                                                         │
│  Notification Service                                                   │
│    ├─ SMTP_HOST: from config                                           │
│    ├─ SMTP_PORT: from config                                           │
│    ├─ SMTP_USER: from secret                                           │
│    └─ SMTP_PASSWORD: from secret                                       │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Repository Ownership & Contacts

```
┌────────────────────────────────────────────────────────────────────────┐
│ Repository                        │ Owner Team    │ Primary Contact    │
├────────────────────────────────────────────────────────────────────────┤
│ fitsync-api-gateway               │ Platform      │ @platform-team     │
│ fitsync-user-service              │ Backend       │ @backend-team      │
│ fitsync-training-service          │ Backend       │ @backend-team      │
│ fitsync-schedule-service          │ Backend       │ @backend-team      │
│ fitsync-progress-service          │ Backend       │ @backend-team      │
│ fitsync-notification-service      │ Backend       │ @backend-team      │
│ fitsync-frontend                  │ Frontend      │ @frontend-team     │
│ fitsync-common                    │ Platform      │ @platform-team     │
│ fitsync-common-py                 │ Platform      │ @platform-team     │
│ fitsync-aws-terraform-modules     │ DevOps/Infra  │ @devops-team       │
│ fitsync-cd                        │ DevOps/Infra  │ @devops-team       │
│ fitsync-cd-templates              │ DevOps/Infra  │ @devops-team       │
│ fitsync-helm-chart                │ DevOps/Infra  │ @devops-team       │
│ fitsync-gitops                    │ DevOps/Infra  │ @devops-team       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Links

### Service Repositories
- [fitsync-api-gateway](https://github.com/FitSync-G13/fitsync-api-gateway) - API Gateway
- [fitsync-user-service](https://github.com/FitSync-G13/fitsync-user-service) - User Management
- [fitsync-training-service](https://github.com/FitSync-G13/fitsync-training-service) - Training Programs
- [fitsync-schedule-service](https://github.com/FitSync-G13/fitsync-schedule-service) - Scheduling
- [fitsync-progress-service](https://github.com/FitSync-G13/fitsync-progress-service) - Progress Tracking
- [fitsync-notification-service](https://github.com/FitSync-G13/fitsync-notification-service) - Notifications
- [fitsync-frontend](https://github.com/FitSync-G13/fitsync-frontend) - Web Application

### Shared Libraries
- [fitsync-common](https://github.com/FitSync-G13/fitsync-common) - Node.js Shared Library
- [fitsync-common-py](https://github.com/FitSync-G13/fitsync-common-py) - Python Shared Library

### Infrastructure
- [fitsync-aws-terraform-modules](https://github.com/FitSync-G13/fitsync-aws-terraform-modules) - AWS Infrastructure
- [fitsync-cd](https://github.com/FitSync-G13/fitsync-cd) - CD Orchestration
- [fitsync-cd-templates](https://github.com/FitSync-G13/fitsync-cd-templates) - Reusable Workflows
- [fitsync-helm-chart](https://github.com/FitSync-G13/fitsync-helm-chart) - Kubernetes Deployment
- [fitsync-gitops](https://github.com/FitSync-G13/fitsync-gitops) - GitOps Configuration

---

**Last Updated:** 2025-12-08
**Maintained By:** FitSync DevOps Team
