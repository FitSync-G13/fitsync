# FitSync Multi-Repo Migration - Quick Start Guide

**Version:** 1.0
**Last Updated:** 2025-12-08

This is a condensed guide for getting started with the multi-repo migration. For complete details, see [MULTI_REPO_MIGRATION_PLAN.md](./MULTI_REPO_MIGRATION_PLAN.md).

---

## Prerequisites

- [x] AWS infrastructure deployed (Hub-Spoke architecture with K3s cluster)
- [x] ECR repository created (`fitsync-ecr`)
- [x] Helm chart repository exists (`fitsync-helm-chart`)
- [x] CD orchestration repository exists (`fitsync-cd`)
- [x] CD templates repository exists (`fitsync-cd-templates`)
- [x] GitHub organization: `FitSync-G13`
- [ ] Decide on shared library distribution method

---

## Current vs Target State

### Current State
```
✅ AWS Infrastructure (Terraform)
   ├── Hub VPC with Transit Gateway, Bastion, Public ALB
   └── Spoke VPC with K3s cluster (Cilium + Istio + cert-manager)

✅ Platform Deployed
   ├── Cilium CNI
   ├── Istio service mesh
   ├── cert-manager
   └── Wildcard TLS cert for fitsync.online

⚠️  Sample App Running
   └── Istio Bookinfo (placeholder)

❌ FitSync Application
   └── Still in mono-repo, not deployed
```

### Target State
```
✅ 7 Service Repositories
   ├── fitsync-api-gateway
   ├── fitsync-user-service
   ├── fitsync-training-service
   ├── fitsync-schedule-service
   ├── fitsync-progress-service
   ├── fitsync-notification-service
   └── fitsync-frontend

✅ 2 Shared Library Repositories
   ├── fitsync-common (Node.js)
   └── fitsync-common-py (Python)

✅ GitOps Repository
   └── fitsync-gitops

✅ FitSync Deployed on AWS
   └── Accessible at https://fitsync.online
```

---

## Migration Checklist

### Week 1: Foundation

#### Day 1-2: Create Shared Libraries
```bash
# 1. Create fitsync-common repository
gh repo create FitSync-G13/fitsync-common --public
git clone https://github.com/FitSync-G13/fitsync-common.git
cd fitsync-common

# Copy common code from mono-repo
# - src/middleware/auth.js
# - src/config/logger.js
# - src/config/redis.js
# - src/utils/*

# Create package.json with publishConfig for GitHub Packages
npm init -y
# Edit package.json: add name "@fitsync/common"
# Add publishConfig.registry

# Publish
npm publish

# 2. Create fitsync-common-py repository
gh repo create FitSync-G13/fitsync-common-py --public
# Repeat for Python

# See detailed steps in MULTI_REPO_MIGRATION_PLAN.md Section: Step-by-Step Migration
```

#### Day 3-4: Update Mono-Repo Services
```bash
# Update each Node.js service
cd fitsync/services/user-service
npm install @fitsync/common@^1.0.0
# Update imports
# Remove duplicated files
npm test
git commit -m "Use @fitsync/common shared library"

# Repeat for: training-service, notification-service, api-gateway

# Update each Python service
cd fitsync/services/schedule-service
pip install fitsync-common
# Update imports
pytest
git commit -m "Use fitsync-common shared library"

# Repeat for: progress-service
```

#### Day 5: Extract Service Repositories
```bash
# Install git-filter-repo
pip install git-filter-repo

# Extract each service (example: user-service)
git clone https://github.com/FitSync-G13/fitsync.git fitsync-user-service
cd fitsync-user-service
git filter-repo --path services/user-service/ --path-rename services/user-service/:

# Create GitHub repository
gh repo create FitSync-G13/fitsync-user-service --public

# Push
git remote add origin https://github.com/FitSync-G13/fitsync-user-service.git
git push -u origin main

# Repeat for all 7 services
```

### Week 2: CI/CD & Helm Updates

#### Day 1-3: Add GitHub Actions
```bash
# For each service repository
cd fitsync-user-service

# Create .github/workflows/ci.yml
mkdir -p .github/workflows
# Copy CI workflow template from MULTI_REPO_MIGRATION_PLAN.md

# Set repository secrets
gh secret set AWS_ACCOUNT_ID --repo FitSync-G13/fitsync-user-service
gh secret set GITOPS_PAT --repo FitSync-G13/fitsync-user-service

# Test workflow
git commit --allow-empty -m "Test CI workflow"
git push
gh run watch
```

#### Day 4-5: Update Helm Chart
```bash
cd fitsync-helm-chart

# 1. Create values-production.yaml
# - Set domain: fitsync.online
# - Configure ECR registry
# - Enable persistent storage
# - Externalize secrets

# 2. Replace Gateway API with Istio Gateway
# - Delete templates/gateway.yaml
# - Delete templates/httproute.yaml
# - Create templates/istio-gateway.yaml
# - Create templates/istio-virtualservice.yaml

# 3. Update deployment.yaml to use ECR images
# image: {{ .Values.images.registry }}/{{ .Values.images.userService.repository }}:{{ .Values.images.userService.tag }}

# Test
helm lint .
helm template fitsync . --values values-production.yaml

git commit -am "Production configuration with Istio Gateway"
git push
```

### Week 3: GitOps & Deployment

#### Day 1-2: Create GitOps Repository
```bash
gh repo create FitSync-G13/fitsync-gitops --private
git clone https://github.com/FitSync-G13/fitsync-gitops.git
cd fitsync-gitops

mkdir -p {applications,environments/{dev,staging,prod}}

# Create ArgoCD application (optional)
# OR create environment-specific values for manual deployment

git add .
git commit -m "Initial GitOps configuration"
git push
```

#### Day 3-4: Create FitSync App Deploy Workflow
```bash
cd fitsync-cd-templates

# Create .github/workflows/fitsync-app-deploy.yml
# See template in MULTI_REPO_MIGRATION_PLAN.md

git add .
git commit -m "Add FitSync application deployment template"
git push
```

#### Day 5: Update Main Orchestration
```bash
cd fitsync-cd

# Edit .github/workflows/k3s-deploy.yml
# Replace "deploy-sample-app" job with "deploy-fitsync-app"

git commit -am "Deploy FitSync instead of Bookinfo"
git push
```

### Week 4: Deploy & Validate

#### Day 1-2: Build and Push Images
```bash
# Trigger CI for all services to build and push to ECR
gh workflow run ci.yml --repo FitSync-G13/fitsync-api-gateway
gh workflow run ci.yml --repo FitSync-G13/fitsync-user-service
gh workflow run ci.yml --repo FitSync-G13/fitsync-training-service
gh workflow run ci.yml --repo FitSync-G13/fitsync-schedule-service
gh workflow run ci.yml --repo FitSync-G13/fitsync-progress-service
gh workflow run ci.yml --repo FitSync-G13/fitsync-notification-service
gh workflow run ci.yml --repo FitSync-G13/fitsync-frontend

# Verify images in ECR
aws ecr describe-images --repository-name fitsync-ecr --region us-east-2
```

#### Day 3: Deploy FitSync
```bash
# Trigger deployment
gh workflow run k3s-deploy.yml \
  --repo FitSync-G13/fitsync-cd \
  -f deploy_full_stack=false \
  -f deploy_fitsync_app=true

# Monitor
gh run watch --repo FitSync-G13/fitsync-cd
```

#### Day 4: Verify Deployment
```bash
# SSH to master node via bastion
ssh -i ~/.ssh/fitsync-bastion.pem ubuntu@<BASTION-IP>
ssh -i ~/.ssh/fitsync-cluster.pem ubuntu@<MASTER-PRIVATE-IP>

# Check pods
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl get pods -n fitsync
kubectl get gateway -n fitsync
kubectl get virtualservice -n fitsync

# Test endpoints
curl https://fitsync.online
curl https://fitsync.online/api/health
```

#### Day 5: Archive Mono-Repo
```bash
cd fitsync

# Add archive notice to README
cat >> README.md <<'EOF'

---
## ⚠️ ARCHIVED REPOSITORY
This repository has been migrated to multi-repo architecture.
See: https://github.com/FitSync-G13
EOF

git add README.md
git commit -m "Archive repository - migrated to multi-repo"
git push

# Archive repository
gh repo archive FitSync-G13/fitsync
```

---

## Critical Decisions

### 1. Shared Library Distribution

**Recommended**: GitHub Packages

**Setup**:
```bash
# Configure NPM to use GitHub Packages
echo "@fitsync:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}" >> .npmrc

# Services can install with:
npm install @fitsync/common@^1.0.0
```

### 2. Database Strategy

**Options**:
- **In-Cluster PostgreSQL** (4 separate databases) - Good for dev/staging
- **Amazon RDS** (4 RDS instances) - Recommended for production

**Recommendation**: Start with in-cluster, migrate to RDS later

### 3. Secrets Management

**Recommended**: AWS Secrets Manager with External Secrets Operator

```bash
# Create secrets
aws secretsmanager create-secret \
  --name fitsync/prod/jwt-secret \
  --secret-string "$(openssl rand -base64 32)"

# Use External Secrets Operator to sync to K8s
```

---

## Common Commands

### Build and Push Image
```bash
# Using GitHub Actions (recommended)
gh workflow run ci.yml --repo FitSync-G13/fitsync-user-service

# Manually
docker build -t <ECR-URL>/fitsync-ecr:user-service-$(git rev-parse --short HEAD) .
docker push <ECR-URL>/fitsync-ecr:user-service-$(git rev-parse --short HEAD)
```

### Deploy Application
```bash
# Via CD orchestration
gh workflow run k3s-deploy.yml --repo FitSync-G13/fitsync-cd -f deploy_fitsync_app=true

# Manually on K3s master
helm upgrade --install fitsync ./fitsync-helm-chart \
  --namespace fitsync \
  --create-namespace \
  --values values-production.yaml
```

### Check Deployment Status
```bash
# Pods
kubectl get pods -n fitsync

# Services
kubectl get svc -n fitsync

# Ingress
kubectl get gateway -n fitsync
kubectl get virtualservice -n fitsync

# Logs
kubectl logs -n fitsync -l app=user-service --tail=100
```

### Rollback Service
```bash
# Via GitOps
cd fitsync-gitops
git revert <commit-sha>
git push

# Via kubectl
kubectl rollout undo deployment/user-service -n fitsync
```

---

## Troubleshooting

### Images Not Pulling from ECR

**Check**:
1. EC2 instances have IAM role with ECR read permissions
2. VPC endpoints for ECR are configured (ecr.api, ecr.dkr, s3)
3. Image tag is correct in Helm values

**Fix**:
```bash
# Test ECR access from K3s master node
aws ecr describe-repositories --region us-east-2

# Check VPC endpoints
aws ec2 describe-vpc-endpoints --region us-east-2 | grep ecr
```

### Pods CrashLooping

**Check**:
```bash
kubectl describe pod <pod-name> -n fitsync
kubectl logs <pod-name> -n fitsync
```

**Common issues**:
- Database connection failed (check database host/credentials)
- Redis connection failed (check redis service)
- Missing environment variables
- Wrong image tag

### Gateway Not Routing

**Check**:
```bash
kubectl get gateway -n fitsync -o yaml
kubectl get virtualservice -n fitsync -o yaml
kubectl get svc -n istio-system
```

**Verify**:
- Istio Gateway selector matches ingress gateway
- VirtualService hosts match your domain
- TLS certificate exists: `kubectl get secret wildcard-cert-tls -n fitsync`

---

## Success Criteria

- [ ] All 7 services built and pushed to ECR
- [ ] Helm chart deploys successfully
- [ ] All pods running (kubectl get pods -n fitsync)
- [ ] Frontend accessible at https://fitsync.online
- [ ] API health check passes: https://fitsync.online/api/health
- [ ] User can register and login
- [ ] Services can communicate (check logs for inter-service calls)
- [ ] TLS certificate valid (no browser warnings)
- [ ] Mono-repo archived

---

## Next Steps After Migration

1. **Set up ArgoCD** for GitOps continuous deployment
2. **Configure monitoring** (Prometheus, Grafana, Loki)
3. **Implement database backups** (automated snapshots)
4. **Add E2E tests** (Cypress, Playwright)
5. **Set up alerting** (PagerDuty, Slack notifications)
6. **Migrate to RDS** for production databases
7. **Implement auto-scaling** (HPA for services)
8. **Add API rate limiting** (at API Gateway level)
9. **Set up distributed tracing** (Jaeger)
10. **Create runbooks** for common operations

---

**For detailed instructions, see**: [MULTI_REPO_MIGRATION_PLAN.md](./MULTI_REPO_MIGRATION_PLAN.md)

**Questions?** Open an issue in the fitsync-gitops repository
