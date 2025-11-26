# WSO2 Linux and DevOps Training: FitSync Project Proposal

**Group:** G13
**System:** Personal Training Management System
**Version:** 2.0
**Last updated:** 06.11.2025

---

## Executive Summary

This proposal outlines the development and deployment of a cloud-native Personal Training Management System using modern DevOps practices, microservices architecture, and comprehensive CI/CD pipelines. The system will streamline fitness training operations while demonstrating production-grade deployment strategies on Kubernetes infrastructure.

**Key Highlights:**
* Complete microservices-based architecture with 5 core services.
* Automated CI/CD pipeline with security scanning and GitOps deployment.
* Zero Trust security implementation with mTLS and secrets management.
* Comprehensive monitoring and observability stack.
* Self-hosted Kubernetes cluster with auto-scaling capabilities.

---

## 1. Project Title
**FitSync: Personal Training Management System**

---

## 2. Background / Problem Statement

The fitness and wellness industry has experienced rapid digital transformation, with personal trainers, gyms, and fitness centers requiring comprehensive digital platforms to manage their operations efficiently.

However, many existing solutions suffer from:
* Manual and fragmented management of client profiles, training programs, and schedules.
* Lack of real-time communication and progress tracking between trainers and clients.
* Limited scalability and availability during peak hours.
* Absence of modern DevOps practices leading to slow deployment cycles and system downtime.
* Inadequate security measures for sensitive health and payment data.
* Poor observability and monitoring of system health and performance.

This project addresses these challenges by developing a cloud-native Personal Training Management System with a complete CI/CD pipeline, implementing Zero Trust security principles, and ensuring high availability through container orchestration on Kubernetes.

---

## 3. Objectives

The primary objectives of this project are:
* Develop a microservices-based Personal Training Management System that enables trainers, clients, and gym administrators to efficiently manage training programs, schedules, progress tracking, and notifications.
* Implement a comprehensive CI/CD pipeline using Github Actions, CircleCI, and ArgoCD to automate build, test, security scanning, and deployment processes.
* Deploy on Kubernetes infrastructure with Zero Trust security principles, avoiding cloud-specific managed Kubernetes services.
* Implement horizontal auto-scaling for web application layers based on user traffic and system load.
* Establish comprehensive monitoring using Prometheus for infrastructure and application metrics.
* Implement centralized log management using OpenSearch stack for Kubernetes infrastructure and application logs.
* Ensure security and compliance through container image vulnerability scanning, mTLS encryption, and secrets management using HashiCorp Vault.
* Achieve production-grade deployment with canary/blue-green strategies and automated rollback capabilities.

---

## 4. Scope

### 4.1 In-Scope Deliverables

**Application Development**
* **User Service:** Authentication (JWT, OAuth2), role management (admin, trainer, client, gym), and profile management.
* **Training Program Service:** Workout routine creation, diet plan management, and personalized program assignment.
* **Schedule & Appointment Service:** 1:1 and group session booking, trainer/gym availability management, and rescheduling.
* **Progress Tracking Service:** Client training history, health records, body metrics, and performance analytics.
* **Notification Service:** Email, SMS, and push notifications for reminders, progress updates, and trainer feedback.

**Infrastructure & DevOps**
* **Kubernetes Cluster Setup:** Self-hosted Kubernetes using k3s (not cloud-managed).
* **Container Registry:** Docker registry for storing application images.
* **Database Infrastructure:** PostgreSQL for persistent data (userdb, trainingdb, scheduledb).
* **Caching Layer:** Redis for session management and performance optimization.
* **Message Broker:** RabbitMQ/Redis for inter-service communication.
* **API Gateway:** Istio Ingress with JWT validation and mTLS.

**CI/CD Pipeline**
* **Stage 1 - Source Control Integration:** Github Actions triggering and automated pipeline triggering.
* **Stage 2 - Build & Containerization:** Docker image creation and push to container registry.
* **Stage 3 - Security Scanning:** Trivy vulnerability scanning with automated failure on critical issues.
* **Stage 4 - Staging Deployment:** ArgoCD GitOps deployment with automated smoke testing.
* **Stage 5 - Manual Approval:** Production promotion gate.
* **Stage 6 - Production Deployment:** Canary/Blue-Green deployment with automatic rollback.

**Security Implementation**
* **Zero Trust Architecture:** mTLS between all services using Istio sidecar.
* **Secrets Management:** HashiCorp Vault for credentials and certificates.
* **Network Policies:** Kubernetes Network Policies for service isolation.
* **RBAC:** Role-based access control for Kubernetes resources.

**Monitoring & Observability**
* **Prometheus Stack:** Metrics collection from Kubernetes and applications.
* **Grafana Dashboards:** Visualization of system and application metrics.
* **OpenSearch Stack:** Centralized logging with Fluent Bit log forwarding.
* **Alerting:** Alert manager for critical system notifications.

**Auto-scaling Configuration**
* **Horizontal Pod Autoscaler (HPA):** CPU and memory-based scaling for web frontend.
* **Custom Metrics:** Request rate and latency-based scaling.

**Documentation**
* Architecture Documentation, Deployment Guide, Operations Manual, and Security Documentation.
* Source Code Repositories: Application code, Terraform scripts, Ansible playbooks, Helm charts.

### 4.2 Out-of-Scope
* Cloud-managed Kubernetes services (EKS, AKS, GKE) - using self-hosted Kubernetes.
* Payment gateway integration - will be simulated.
* Mobile application development - web-based responsive design only.
* Equipment tracking and IoT integration.
* Multi-region deployment and disaster recovery.

---

## 5. Proposed Solution

### 5.1 Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js with responsive design |
| **Backend Services** | Node.js with Express / Python with FastAPI |
| **API Gateway** | Istio Ingress Gateway with JWT validation |
| **Database** | PostgreSQL (separate databases per service) |
| **Caching** | Redis for sessions and frequently accessed data |
| **Message Broker** | RabbitMQ for asynchronous communication |
| **Container Platform** | Docker for containerization (in development) |
| **Orchestration** | Kubernetes (self-hosted) |
| **Service Mesh** | Istio for mTLS and traffic management |
| **CI/CD** | GitHub Actions / CircleCI for pipeline automation |
| **GitOps** | ArgoCD for continuous deployment |
| **Container Registry** | Docker Registry / Harbor |
| **Security Scanning** | Trivy for vulnerability scanning |
| **Secrets Management** | HashiCorp Vault for credentials and certificates |
| **Monitoring** | Hubble + Prometheus + Grafana for metrics and visualization |
| **Logging** | OpenSearch + Fluent Bit for log aggregation |
| **IaC** | Terraform for infrastructure provisioning |

### 5.2 Architecture Overview
The system follows a microservices architecture pattern where user access zones, development/integration zones, and the runtime Kubernetes cluster are distinct.

**Microservices Breakdown:**
* **User Service:** Handles authentication (JWT, OAuth2), manages profiles (trainers, clients, admins), and implements RBAC.
* **Training Program / Workout Plan Service:** Creates/manages exercise routines, diet plans, and assigns personalized programs.
* **Schedule & Appointment Service:** Manages 1:1 sessions, group bookings, trainer calendars, and rescheduling/cancellations.
* **Progress Tracking Service:** Records training history, body metrics, performance, and generates analytics.
* **Notification Service:** Sends reminders via Email/SMS/Push and delivers updates and feedback.

### 5.3 Detailed Microservices Architecture
The system is divided into multiple independent services following cloud-native best practices.

#### Architecture Zones
* **User Access Zone:** Users access the system via HTTPS through a Web Application Firewall (WAF).
* **CI/CD Zone (Development & Integration):** Developers push code to GitHub. Pipelines (GitHub Actions/CircleCI) build, test, and scan code (Trivy) before pushing to the Container Registry. ArgoCD handles GitOps deployment.
* **Runtime Zone (Kubernetes Cluster):** The production environment runs on a self-hosted Kubernetes cluster with Istio service mesh providing mTLS and traffic management.

#### Core Microservices Specifications

**1. User Service**
* **Responsibilities:** Auth (JWT/OAuth2), Registration, Profile Management, RBAC, Session Management.
* **Tech:** Node.js/Express or Python/FastAPI.
* **Database:** userdb (PostgreSQL).
* **Endpoints:** `/api/auth/*`, `/api/users/*`, `/api/profiles/*`.

**2. Training Program Service**
* **Responsibilities:** Workout/Diet plan creation, Personalized assignments, Template management.
* **Tech:** Node.js with Express.js.
* **Database:** trainingdb (PostgreSQL).
* **Endpoints:** `/api/programs/*`, `/api/workouts/*`, `/api/diets/*`.

**3. Schedule & Appointment Service**
* **Responsibilities:** Booking sessions, Availability management, Conflict detection.
* **Tech:** Python with FastAPI.
* **Database:** scheduledb (PostgreSQL).
* **Endpoints:** `/api/bookings/*`, `/api/availability/*`, `/api/sessions/*`.

**4. Progress Tracking Service**
* **Responsibilities:** Record metrics, Track performance, Generate analytics.
* **Tech:** Python with FastAPI.
* **Database:** progressdb (PostgreSQL).
* **Endpoints:** `/api/progress/*`, `/api/metrics/*`, `/api/analytics/*`.

**5. Notification Service**
* **Responsibilities:** Email/SMS/Push notifications, Event-driven architecture.
* **Tech:** Node.js with Express.js.
* **Message Queue:** Redis Pub/Sub / RabbitMQ.
* **Endpoints:** `/api/notifications/*`.

### 5.4 Service Communication Patterns
* **Synchronous Communication:** Uses REST APIs and gRPC. Communication is encrypted using mTLS via Istio. The API Gateway validates JWT tokens.
* **Asynchronous Communication:** Services use Redis Pub/Sub or RabbitMQ for decoupled, event-driven tasks (e.g., Schedule Service triggers "Booking Created" event -> Notification Service sends email).

### 5.5 Data Management Strategy

**Database Per Service Pattern**
Each microservice owns its database to ensure loose coupling.

| Service | Database | Data Stored |
| :--- | :--- | :--- |
| **User Service** | userdb | User profiles, credentials, roles, sessions |
| **Training Service** | trainingdb | Workout plans, diet plans, exercises, programs |
| **Schedule Service** | scheduledb | Bookings, appointments, availability, sessions |
| **Progress Service** | progressdb | Metrics, history, achievements, analytics |

**Caching Strategy:** Redis is used for user sessions, availability calendars, and frequently accessed plans to reduce DB load.

### 5.6 Security Architecture
* **Zero Trust Security Model:** No service is trusted by default. All communication is encrypted/authenticated.
    * **API Gateway:** JWT validation, rate limiting.
    * **Service Mesh:** mTLS encryption between services.
    * **Network Policies:** Restrict pod-to-pod communication.
    * **Secrets Management:** HashiCorp Vault stores credentials.
* **Security Scanning:** Trivy scans container images in the CI/CD pipeline, failing builds on critical vulnerabilities.

### 5.7 Deployment Strategy
* **Canary Deployment:** New versions are deployed to 10% of pods. Metrics are monitored for 10 minutes; if healthy, traffic increases to 100%. If errors occur, it rolls back automatically.
* **Blue-Green Deployment:** Used for major releases where a parallel environment is deployed and traffic is switched instantly.

### 5.8 Comprehensive Monitoring & Observability
* **Metrics Collection (Prometheus):** Collects infrastructure (CPU, memory), application (response time, error rate), and business metrics.
* **Visualization (Grafana):** Dashboards for infrastructure overview, application performance, and business analytics.
* **Logging (OpenSearch):** Fluent Bit agents forward logs to OpenSearch for centralized analysis of application, access, and infrastructure logs.
* **Alerting (AlertManager):** Configured for service downtime, high error rates (>5%), resource exhaustion (CPU >80%), and deployment failures.

### 5.9 Infrastructure as Code (IaC)
Infrastructure is defined using Terraform and Ansible.
* **Terraform Modules:** K8s cluster, network (VPC/subnets), load balancer, storage, and DNS.
* **Helm Charts:** Used for application templating with separate values files for staging and production.

---

## 6. Timeline / Milestones
The project is planned for a duration of 2.5 months (10 weeks).

* **Project Planning & Architecture:** 2025-10-12
* **IaC & K8s Cluster Setup:** 2025-10-19
* **Microservices Dev & Containerization:** 2025-10-26
* **CI/CD Pipeline Implementation:** 2025-11-02 to 2025-11-16
* **Observability Stack Integration:** 2025-11-23
* **Security Hardening & Testing:** 2025-11-30
* **Documentation & Demo Prep:** 2025-12-07 to 2025-12-14

---

## 7. Team & Responsibilities
The team consists of 10 developers with strong Linux and DevOps knowledge.

* **Project Lead (1):** Oversees project, milestones, and coordination.
* **DevOps/SRE Specialists (4):** Responsible for IaC, Kubernetes, CI/CD, security (ZTA), and observability.
* **Microservice Developers (5):** Develop application logic for User, Training, Schedule, and Notification services, and containerize applications.

---

## 8. Risks & Mitigation

* **Risk:** Cloud credit exhaustion.
    * **Mitigation:** Strict resource quotas, automate environment shutdown, use local tools like Minikube.
* **Risk:** High complexity in Kubernetes, GitOps, and Zero Trust.
    * **Mitigation:** Assign specialized tasks to DevOps team, conduct knowledge-sharing sessions.
* **Risk:** Scope creep and technical debt.
    * **Mitigation:** Adhere to defined scope, strict change management, and prioritize clean code.

---

## 9. Expected Outcomes / Benefits
Upon completion, the project will deliver:
* A fully functional, highly available Personal Training Management System on a cloud-agnostic platform.
* A scalable architecture that adjusts to user load.
* Automated deployment via CI/CD and GitOps for rapid feature delivery.
* Enhanced security via Zero Trust principles.
* Complete operational visibility via Prometheus and OpenSearch.