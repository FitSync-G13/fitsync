# Service Network Architecture & Deployment

**Version:** 1.0
**Last Updated:** 2025-12-07
**Status:** Planning Phase
**Purpose:** Kubernetes, Istio Service Mesh, and Network Segmentation Guide

---

## Table of Contents

1. [Overview](#overview)
2. [Service Communication Matrix](#service-communication-matrix)
3. [Network Segmentation Strategy](#network-segmentation-strategy)
4. [Istio Service Mesh Configuration](#istio-service-mesh-configuration)
5. [Security Architecture](#security-architecture)
6. [Observability & Monitoring](#observability--monitoring)
7. [Deployment Topology](#deployment-topology)

---

## Overview

### Architecture Principles

FitSync follows a **Zero Trust** microservices architecture with the following principles:

- **Single Entry Point**: API Gateway is the only public-facing backend service
- **mTLS Everywhere**: All inter-service communication uses mutual TLS via Istio
- **Defense in Depth**: Multiple layers of security (Network Policies, Service Mesh, Application Auth)
- **Database Isolation**: Each service has its own database instance
- **Event-Driven Decoupling**: Asynchronous communication via Redis Pub/Sub

### Infrastructure Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Container Orchestration** | K3s (Kubernetes) | Lightweight container orchestration |
| **Service Mesh** | Istio | mTLS, traffic management, observability |
| **CNI** | Cilium | Network policies, eBPF-based networking |
| **Ingress** | Istio Ingress Gateway | Public traffic entry point |
| **Message Broker** | Redis Pub/Sub | Event-driven communication |
| **Monitoring** | Prometheus + Grafana | Metrics and dashboards |
| **Logging** | OpenSearch + Fluent Bit | Centralized logging |

---

## Service Communication Matrix

### External-Facing Services (Public)

These services are exposed to the internet via Istio Ingress Gateway:

| Service | Port | Protocol | Exposure | DNS | Purpose |
|---------|------|----------|----------|-----|---------|
| **API Gateway** | 4000 | HTTP/HTTPS | Public | `api.fitsync.com` | Unified API for all backend services |
| **Frontend** | 3000 | HTTP/HTTPS | Public | `app.fitsync.com` | React SPA for end users |

### Internal Services (Cluster-Only)

These services are NEVER directly exposed to the internet:

| Service | Port | Language/Framework | Database | Purpose |
|---------|------|-------------------|----------|---------|
| **User Service** | 3001 | Node.js/Express | PostgreSQL:5432 | Authentication, user management, RBAC |
| **Training Service** | 3002 | Node.js/Express | PostgreSQL:5433 | Exercises, workouts, diet plans, programs |
| **Schedule Service** | 8003 | Python/FastAPI | PostgreSQL:5434 | Bookings, availability, sessions |
| **Progress Service** | 8004 | Python/FastAPI | PostgreSQL:5435 | Metrics, logs, analytics, achievements |
| **Notification Service** | 3005 | Node.js/Express | None (in-memory) | Event-driven notifications |

### Infrastructure Services (Private)

| Service | Port | Purpose | Access |
|---------|------|---------|--------|
| **Redis** | 6379 | Pub/Sub messaging & caching | Cluster-internal only |
| **PostgreSQL - userdb** | 5432 | User service data | User Service only |
| **PostgreSQL - trainingdb** | 5433 | Training service data | Training Service only |
| **PostgreSQL - scheduledb** | 5434 | Schedule service data | Schedule Service only |
| **PostgreSQL - progressdb** | 5435 | Progress service data | Progress Service only |

---

## Service Communication Patterns

### 1. Synchronous HTTP Communication

```
┌──────────┐
│ Frontend │ (Port 3000)
└────┬─────┘
     │ HTTPS
     ▼
┌──────────────┐
│ API Gateway  │ (Port 4000)
└──────┬───────┘
       │ HTTP (Istio mTLS)
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌─────────────┐                      ┌──────────────┐
│ User Service│                      │   Training   │
│   :3001     │◄────────────────────┤│   Service    │
└─────────────┘  User Validation     │    :3002     │
                                     └──────────────┘
```

**Inter-Service HTTP Dependencies:**

- Training Service → User Service (user validation)
- Schedule Service → User Service (user validation)
- Schedule Service → Training Service (verify active program)
- Progress Service → User Service (user validation)
- Progress Service → Schedule Service (fetch booking details)
- Progress Service → Training Service (fetch program details)
- Notification Service → User Service (fetch contact info)
- Notification Service → Training Service (enrich notifications)
- Notification Service → Schedule Service (enrich notifications)

### 2. Asynchronous Event-Driven Communication (Redis Pub/Sub)

```
┌──────────────┐         ┌─────────────┐         ┌──────────────┐
│   Schedule   │         │    Redis    │         │ Notification │
│   Service    │────────►│   Pub/Sub   │────────►│   Service    │
└──────────────┘ Publish └─────────────┘ Subscribe└──────────────┘
  booking.created
```

**Event Channels:**

| Publisher | Events | Subscribers |
|-----------|--------|-------------|
| **Schedule Service** | `booking.created`, `booking.cancelled`, `booking.completed` | Notification, Progress |
| **Training Service** | `program.assigned`, `program.completed` | Notification, Progress |
| **Progress Service** | `achievement.earned`, `milestone.reached` | Notification |

### 3. Caching Pattern (Redis)

All services use Redis for:
- JWT token blacklisting
- Rate limiting counters
- User profile caching (TTL: 15 minutes)
- Session management

---

## Network Segmentation Strategy

### Hub-and-Spoke VPC Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         HUB VPC                             │
│  ┌──────────────┐  ┌──────────┐  ┌────────────────┐       │
│  │ Bastion Host │  │ VPN GW   │  │ Istio Ingress  │       │
│  └──────────────┘  └──────────┘  └────────┬───────┘       │
└────────────────────────────────────────────┼───────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
         ┌──────────▼──────────┐  ┌─────────▼────────┐  ┌───────────▼────────┐
         │   Prod Spoke VPC    │  │ Stage Spoke VPC  │  │   Dev Spoke VPC    │
         │                     │  │                  │  │                    │
         │  ┌────────────────┐ │  │ ┌──────────────┐│  │ ┌────────────────┐ │
         │  │ K3s Cluster    │ │  │ │ K3s Cluster  ││  │ │ K3s Cluster    │ │
         │  │ (Production)   │ │  │ │ (Staging)    ││  │ │ (Development)  │ │
         │  └────────────────┘ │  │ └──────────────┘│  │ └────────────────┘ │
         │                     │  │                  │  │                    │
         │  ┌────────────────┐ │  │ ┌──────────────┐│  │ ┌────────────────┐ │
         │  │ Database Tier  │ │  │ │ Database Tier││  │ │ Database Tier  │ │
         │  │ (EC2 Instances)│ │  │ │(EC2 Instances)││ │ │(EC2 Instances) │ │
         │  └────────────────┘ │  │ └──────────────┘│  │ └────────────────┘ │
         └─────────────────────┘  └──────────────────┘  └────────────────────┘
```

### Subnet Layout (Per Spoke VPC)

| Subnet | CIDR | Purpose | Resources |
|--------|------|---------|-----------|
| **Public Subnet** | 10.0.1.0/24 | NAT Gateway, Load Balancer | Istio Ingress Gateway |
| **Private K8s Subnet** | 10.0.2.0/24 | K3s worker nodes | Application pods |
| **Private DB Subnet** | 10.0.3.0/24 | Database instances | PostgreSQL EC2s, Redis |

### Security Group Rules

#### 1. Istio Ingress Gateway (Public-facing)

```yaml
Ingress:
  - Port 80 (HTTP) from 0.0.0.0/0
  - Port 443 (HTTPS) from 0.0.0.0/0
Egress:
  - All traffic to K8s Subnet (10.0.2.0/24)
```

#### 2. K3s Worker Nodes (Application Tier)

```yaml
Ingress:
  - All traffic from K8s Subnet (10.0.2.0/24)
  - Port 443 from Istio Ingress Gateway
Egress:
  - All traffic to DB Subnet (10.0.3.0/24)
  - All traffic to K8s Subnet (10.0.2.0/24)
  - Port 443 to internet (for image pulls, external APIs)
```

#### 3. Database Tier (PostgreSQL & Redis)

```yaml
Ingress:
  - Port 5432 from K8s Subnet (10.0.2.0/24)
  - Port 6379 from K8s Subnet (10.0.2.0/24)
Egress:
  - None (fully isolated)
```

---

## Istio Service Mesh Configuration

### Gateway Configuration (Entry Point)

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: fitsync-gateway
  namespace: fitsync
spec:
  selector:
    istio: ingressgateway
  servers:
  # Frontend (app.fitsync.com)
  - port:
      number: 80
      name: http-frontend
      protocol: HTTP
    hosts:
    - "app.fitsync.com"
    tls:
      httpsRedirect: true
  - port:
      number: 443
      name: https-frontend
      protocol: HTTPS
    hosts:
    - "app.fitsync.com"
    tls:
      mode: SIMPLE
      credentialName: frontend-tls-cert

  # API Gateway (api.fitsync.com)
  - port:
      number: 80
      name: http-api
      protocol: HTTP
    hosts:
    - "api.fitsync.com"
    tls:
      httpsRedirect: true
  - port:
      number: 443
      name: https-api
      protocol: HTTPS
    hosts:
    - "api.fitsync.com"
    tls:
      mode: SIMPLE
      credentialName: api-tls-cert
```

### VirtualService Configuration (Routing)

```yaml
---
# Frontend Routing
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: frontend
  namespace: fitsync
spec:
  hosts:
  - "app.fitsync.com"
  gateways:
  - fitsync-gateway
  http:
  - match:
    - uri:
        prefix: /
    route:
    - destination:
        host: frontend.fitsync.svc.cluster.local
        port:
          number: 3000

---
# API Gateway Routing
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-gateway
  namespace: fitsync
spec:
  hosts:
  - "api.fitsync.com"
  gateways:
  - fitsync-gateway
  http:
  - match:
    - uri:
        prefix: /api
    route:
    - destination:
        host: api-gateway.fitsync.svc.cluster.local
        port:
          number: 4000
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
      retryOn: 5xx,reset,connect-failure,refused-stream
```

### Internal Service VirtualServices

```yaml
---
# User Service (Internal Only - No Gateway)
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-service
  namespace: fitsync
spec:
  hosts:
  - user-service.fitsync.svc.cluster.local
  http:
  - route:
    - destination:
        host: user-service.fitsync.svc.cluster.local
        port:
          number: 3001
    timeout: 10s

---
# Training Service (Internal Only)
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: training-service
  namespace: fitsync
spec:
  hosts:
  - training-service.fitsync.svc.cluster.local
  http:
  - route:
    - destination:
        host: training-service.fitsync.svc.cluster.local
        port:
          number: 3002
    timeout: 10s
```

### DestinationRule (mTLS & Traffic Policies)

```yaml
---
# Enforce mTLS for all internal services
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: fitsync-mtls
  namespace: fitsync
spec:
  host: "*.fitsync.svc.cluster.local"
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL  # Enforce mutual TLS
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
        maxRequestsPerConnection: 2
    loadBalancer:
      simple: ROUND_ROBIN
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50

---
# User Service - Circuit Breaker
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: user-service
  namespace: fitsync
spec:
  host: user-service.fitsync.svc.cluster.local
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL
    connectionPool:
      http:
        http1MaxPendingRequests: 100
        maxRequestsPerConnection: 1
    outlierDetection:
      consecutiveErrors: 3
      interval: 10s
      baseEjectionTime: 30s
```

---

## Security Architecture

### 1. Cilium Network Policies (L3/L4)

#### API Gateway Ingress Policy

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: api-gateway-ingress
  namespace: fitsync
spec:
  endpointSelector:
    matchLabels:
      app: api-gateway
  ingress:
  # Allow from Istio Ingress Gateway
  - fromEndpoints:
    - matchLabels:
        istio: ingressgateway
    toPorts:
    - ports:
      - port: "4000"
        protocol: TCP
  # Allow from Frontend (for SSR scenarios)
  - fromEndpoints:
    - matchLabels:
        app: frontend
    toPorts:
    - ports:
      - port: "4000"
        protocol: TCP
```

#### User Service Policy (Most Restrictive)

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: user-service-policy
  namespace: fitsync
spec:
  endpointSelector:
    matchLabels:
      app: user-service
  ingress:
  # Only API Gateway can call User Service
  - fromEndpoints:
    - matchLabels:
        app: api-gateway
    toPorts:
    - ports:
      - port: "3001"
        protocol: TCP
  # Allow other services for inter-service calls
  - fromEndpoints:
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
        protocol: TCP
  egress:
  # Allow to database
  - toEndpoints:
    - matchLabels:
        app: userdb
    toPorts:
    - ports:
      - port: "5432"
        protocol: TCP
  # Allow to Redis
  - toEndpoints:
    - matchLabels:
        app: redis
    toPorts:
    - ports:
      - port: "6379"
        protocol: TCP
  # Allow DNS
  - toEndpoints:
    - matchLabels:
        "k8s:io.kubernetes.pod.namespace": kube-system
        "k8s:k8s-app": kube-dns
    toPorts:
    - ports:
      - port: "53"
        protocol: UDP
      rules:
        dns:
        - matchPattern: "*"
```

#### Redis Policy (All Services Can Access)

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: redis-policy
  namespace: fitsync
spec:
  endpointSelector:
    matchLabels:
      app: redis
  ingress:
  # All application services can access Redis
  - fromEndpoints:
    - matchLabels:
        tier: application
    toPorts:
    - ports:
      - port: "6379"
        protocol: TCP
  egress:
  # Redis doesn't need outbound access
  - {}
```

### 2. Istio Authorization Policies (L7)

#### Default Deny All

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
  namespace: fitsync
spec:
  {}  # Empty policy denies all by default
```

#### API Gateway Authorization

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: api-gateway-authz
  namespace: fitsync
spec:
  selector:
    matchLabels:
      app: api-gateway
  action: ALLOW
  rules:
  # Allow from Istio Ingress Gateway
  - from:
    - source:
        principals: ["cluster.local/ns/istio-system/sa/istio-ingressgateway-service-account"]
  # Allow from Frontend
  - from:
    - source:
        principals: ["cluster.local/ns/fitsync/sa/frontend"]
```

#### User Service Authorization

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: user-service-authz
  namespace: fitsync
spec:
  selector:
    matchLabels:
      app: user-service
  action: ALLOW
  rules:
  # Allow API Gateway
  - from:
    - source:
        principals: ["cluster.local/ns/fitsync/sa/api-gateway"]
  # Allow other services
  - from:
    - source:
        principals:
        - "cluster.local/ns/fitsync/sa/training-service"
        - "cluster.local/ns/fitsync/sa/schedule-service"
        - "cluster.local/ns/fitsync/sa/progress-service"
        - "cluster.local/ns/fitsync/sa/notification-service"
```

### 3. PeerAuthentication (mTLS Mode)

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: fitsync-mtls
  namespace: fitsync
spec:
  mtls:
    mode: STRICT  # Enforce mTLS for all workloads
```

---

## Observability & Monitoring

### Prometheus ServiceMonitor

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: fitsync-services
  namespace: fitsync
spec:
  selector:
    matchLabels:
      monitoring: enabled
  endpoints:
  - port: metrics
    interval: 15s
    path: /metrics
```

### Key Metrics to Track

#### 1. Service-to-Service Metrics (Istio)

```promql
# Request success rate by service
sum(rate(istio_requests_total{reporter="source",destination_service_namespace="fitsync",response_code!~"5.*"}[1m])) by (destination_service_name)
/
sum(rate(istio_requests_total{reporter="source",destination_service_namespace="fitsync"}[1m])) by (destination_service_name)

# P95 latency by service
histogram_quantile(0.95,
  sum(rate(istio_request_duration_milliseconds_bucket{reporter="source",destination_service_namespace="fitsync"}[1m]))
  by (destination_service_name, le)
)

# mTLS verification status
sum(istio_requests_total{reporter="destination",connection_security_policy="mutual_tls"}) by (destination_service_name)
```

#### 2. Application Metrics

- **API Gateway**: Request count, response time, rate limit hits
- **User Service**: Login attempts, JWT validations, cache hit ratio
- **Training Service**: Programs created, program assignments
- **Schedule Service**: Bookings created, booking cancellations
- **Progress Service**: Metrics recorded, achievements earned
- **Notification Service**: Events processed, notifications sent

#### 3. Infrastructure Metrics

- **Redis**: Memory usage, pub/sub message rate, connected clients
- **PostgreSQL**: Connection pool usage, query duration, database size
- **K3s**: Node CPU/memory, pod restarts, persistent volume usage

### Grafana Dashboards

#### Dashboard 1: Service Mesh Overview

- Global request volume (requests/sec)
- Global success rate (percentage)
- P50/P95/P99 latencies
- Service dependency graph (from Istio)

#### Dashboard 2: Business Metrics

- Active users (by role)
- Bookings per day
- Programs assigned per week
- Achievements earned

#### Dashboard 3: Security Dashboard

- mTLS connection status
- Authorization policy denials
- JWT validation failures
- Rate limit violations

### OpenSearch Logging

#### Log Collection with Fluent Bit

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
  namespace: logging
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush         5
        Daemon        off
        Log_Level     info

    [INPUT]
        Name              tail
        Path              /var/log/containers/*fitsync*.log
        Parser            docker
        Tag               kube.*
        Refresh_Interval  5
        Mem_Buf_Limit     50MB
        Skip_Long_Lines   On

    [FILTER]
        Name                kubernetes
        Match               kube.*
        Kube_URL            https://kubernetes.default.svc:443
        Merge_Log           On
        Keep_Log            Off
        K8S-Logging.Parser  On
        K8S-Logging.Exclude On

    [OUTPUT]
        Name            es
        Match           kube.*
        Host            opensearch.logging.svc.cluster.local
        Port            9200
        Index           fitsync-logs
        Type            _doc
        Logstash_Format On
        Logstash_Prefix fitsync
        Retry_Limit     5
```

---

## Deployment Topology

### Kubernetes Resources per Service

```yaml
# Example: User Service
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: user-service
  namespace: fitsync

---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: fitsync
  labels:
    app: user-service
    tier: application
    monitoring: enabled
spec:
  type: ClusterIP
  selector:
    app: user-service
  ports:
  - name: http
    port: 3001
    targetPort: 3001
  - name: metrics
    port: 9090
    targetPort: 9090

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: fitsync
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        tier: application
        version: v1
      annotations:
        sidecar.istio.io/inject: "true"
    spec:
      serviceAccountName: user-service
      containers:
      - name: user-service
        image: fitsync/user-service:latest
        ports:
        - containerPort: 3001
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3001"
        - name: DB_HOST
          value: "userdb.database.internal"
        - name: REDIS_HOST
          value: "redis.fitsync.svc.cluster.local"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
```

### Database Deployment (External to K8s)

**PostgreSQL on EC2 (Recommended for Production)**

```bash
# Security Group: db-postgresql-sg
# Ingress: Port 5432 from K8s Subnet (10.0.2.0/24)
# Egress: None

# User Service DB
Instance Type: t3.medium
Storage: 100GB GP3 SSD
Backup: Automated daily snapshots
Multi-AZ: Enabled (for HA)
Connection: userdb.database.internal:5432
```

**Alternative: PostgreSQL StatefulSet in K8s**

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: userdb
  namespace: fitsync
spec:
  serviceName: userdb
  replicas: 1
  selector:
    matchLabels:
      app: userdb
  template:
    metadata:
      labels:
        app: userdb
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: userdb
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        ports:
        - containerPort: 5432
          name: postgres
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: local-path
      resources:
        requests:
          storage: 20Gi
```

---

## Summary: What to Expose

### Public (Internet-Facing)

| Service | Port | Protocol | Via |
|---------|------|----------|-----|
| Frontend | 3000 | HTTPS | Istio Ingress Gateway → `app.fitsync.com` |
| API Gateway | 4000 | HTTPS | Istio Ingress Gateway → `api.fitsync.com` |

### Internal (Kubernetes Cluster Only)

All backend microservices communicate via Istio service mesh with mTLS:

- `user-service.fitsync.svc.cluster.local:3001`
- `training-service.fitsync.svc.cluster.local:3002`
- `schedule-service.fitsync.svc.cluster.local:8003`
- `progress-service.fitsync.svc.cluster.local:8004`
- `notification-service.fitsync.svc.cluster.local:3005`
- `redis.fitsync.svc.cluster.local:6379`

### Private (Database Tier)

Database instances in separate subnet/EC2:

- `userdb.database.internal:5432`
- `trainingdb.database.internal:5432`
- `scheduledb.database.internal:5432`
- `progressdb.database.internal:5432`

---

## Next Steps

1. **Implement Terraform modules** for VPC, subnets, security groups
2. **Create Ansible playbooks** for K3s installation with Cilium CNI
3. **Deploy Istio** and configure Gateway, VirtualServices, DestinationRules
4. **Apply Cilium NetworkPolicies** for L3/L4 security
5. **Configure Istio AuthorizationPolicies** for L7 security
6. **Set up Prometheus/Grafana** for monitoring
7. **Deploy OpenSearch stack** for centralized logging

---

**Document Version:** 1.0
**Last Updated:** 2025-12-07
**Maintained By:** FitSync DevOps Team
