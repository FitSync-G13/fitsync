#!/bin/bash

# FitSync Repository Separation Script
# This script extracts each service from the mono-repo into separate repositories
# while preserving git history using git-filter-repo

set -e  # Exit on error

# Configuration
ORG="FitSync-G13"
MONO_REPO_URL="https://github.com/${ORG}/fitsync.git"
WORK_DIR="/d/Courses/WSO2_Linux/GP/GitHub/fitsync-separated"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Services to extract
declare -A SERVICES=(
    ["api-gateway"]="services/api-gateway"
    ["user-service"]="services/user-service"
    ["training-service"]="services/training-service"
    ["schedule-service"]="services/schedule-service"
    ["progress-service"]="services/progress-service"
    ["notification-service"]="services/notification-service"
)

# Frontend
FRONTEND_PATH="frontend"

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create GitHub repository
create_github_repo() {
    local repo_name=$1
    print_info "Creating GitHub repository: ${ORG}/${repo_name}"

    if command -v gh &> /dev/null; then
        gh repo create "${ORG}/${repo_name}" --public --confirm 2>/dev/null || print_warning "Repository ${repo_name} may already exist"
    else
        print_warning "GitHub CLI (gh) not installed. Please create repository manually:"
        echo "  Repository: https://github.com/${ORG}/${repo_name}"
        echo "  Visibility: Public"
        read -p "Press Enter after creating the repository..."
    fi
}

# Function to extract service
extract_service() {
    local service_name=$1
    local service_path=$2
    local repo_name="fitsync-${service_name}"

    print_info "================================================"
    print_info "Extracting: ${service_name}"
    print_info "================================================"

    # Create working directory
    mkdir -p "${WORK_DIR}"
    cd "${WORK_DIR}"

    # Remove existing directory if it exists
    if [ -d "${repo_name}" ]; then
        print_warning "Directory ${repo_name} already exists. Removing..."
        rm -rf "${repo_name}"
    fi

    # Clone the mono-repo
    print_info "Cloning mono-repo..."
    git clone "${MONO_REPO_URL}" "${repo_name}"
    cd "${repo_name}"

    # Extract only the service directory
    print_info "Filtering git history for ${service_path}..."
    git filter-repo --path "${service_path}/" --path-rename "${service_path}/:" --force

    # Update remote
    print_info "Setting up remote..."
    git remote add origin "https://github.com/${ORG}/${repo_name}.git"

    print_info "✓ Extracted ${service_name} successfully"
    print_info "  Location: ${WORK_DIR}/${repo_name}"
    echo ""
}

# Function to extract frontend
extract_frontend() {
    local repo_name="fitsync-frontend"

    print_info "================================================"
    print_info "Extracting: frontend"
    print_info "================================================"

    mkdir -p "${WORK_DIR}"
    cd "${WORK_DIR}"

    if [ -d "${repo_name}" ]; then
        print_warning "Directory ${repo_name} already exists. Removing..."
        rm -rf "${repo_name}"
    fi

    print_info "Cloning mono-repo..."
    git clone "${MONO_REPO_URL}" "${repo_name}"
    cd "${repo_name}"

    print_info "Filtering git history for frontend..."
    git filter-repo --path "${FRONTEND_PATH}/" --path-rename "${FRONTEND_PATH}/:" --force

    print_info "Setting up remote..."
    git remote add origin "https://github.com/${ORG}/${repo_name}.git"

    print_info "✓ Extracted frontend successfully"
    print_info "  Location: ${WORK_DIR}/${repo_name}"
    echo ""
}

# Function to create docker-compose repository
create_docker_compose_repo() {
    local repo_name="fitsync-docker-compose"

    print_info "================================================"
    print_info "Creating: docker-compose repository"
    print_info "================================================"

    mkdir -p "${WORK_DIR}"
    cd "${WORK_DIR}"

    if [ -d "${repo_name}" ]; then
        print_warning "Directory ${repo_name} already exists. Removing..."
        rm -rf "${repo_name}"
    fi

    # Create new repository from scratch (no history needed)
    mkdir "${repo_name}"
    cd "${repo_name}"
    git init

    # Copy docker-compose files from mono-repo
    print_info "Copying docker-compose files..."
    cp "/d/Courses/WSO2_Linux/GP/GitHub/fitsync/docker-compose.yml" .

    # Copy setup scripts
    if [ -f "/d/Courses/WSO2_Linux/GP/GitHub/fitsync/setup.sh" ]; then
        cp "/d/Courses/WSO2_Linux/GP/GitHub/fitsync/setup.sh" .
    fi

    if [ -f "/d/Courses/WSO2_Linux/GP/GitHub/fitsync/start-all-services.sh" ]; then
        cp "/d/Courses/WSO2_Linux/GP/GitHub/fitsync/start-all-services.sh" .
    fi

    if [ -f "/d/Courses/WSO2_Linux/GP/GitHub/fitsync/start-services.bat" ]; then
        cp "/d/Courses/WSO2_Linux/GP/GitHub/fitsync/start-services.bat" .
    fi

    # Create README
    cat > README.md <<'EOF'
# FitSync Docker Compose

Docker Compose configuration for running the complete FitSync application stack locally.

## Prerequisites

- Docker Desktop
- Docker Compose

## Services

This docker-compose setup includes:
- API Gateway (Port 4000)
- User Service (Port 3001)
- Training Service (Port 3002)
- Schedule Service (Port 8003)
- Progress Service (Port 8004)
- Notification Service (Port 3005)
- Frontend (Port 3000)
- PostgreSQL Databases (4 instances)
- Redis (Port 6379)

## Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Database Connections

All databases are configured with TLS enabled:
- Connection strings use `sslmode=require` for PostgreSQL
- Insecure certificates are allowed for development

## Service URLs

- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- User Service: http://localhost:3001
- Training Service: http://localhost:3002
- Schedule Service: http://localhost:8003
- Progress Service: http://localhost:8004
- Notification Service: http://localhost:3005
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

    # Initial commit
    git add .
    git commit -m "Initial commit: Docker Compose configuration for FitSync"

    # Set up remote
    git remote add origin "https://github.com/${ORG}/${repo_name}.git"
    git branch -M main

    print_info "✓ Created docker-compose repository"
    print_info "  Location: ${WORK_DIR}/${repo_name}"
    echo ""
}

# Function to push repository
push_repository() {
    local repo_name=$1

    cd "${WORK_DIR}/${repo_name}"

    print_info "Pushing ${repo_name} to GitHub..."

    # Try to push
    if git push -u origin main 2>/dev/null; then
        print_info "✓ Successfully pushed ${repo_name}"
    elif git push -u origin master 2>/dev/null; then
        print_info "✓ Successfully pushed ${repo_name}"
    else
        print_warning "Failed to push ${repo_name}. Please push manually:"
        echo "  cd ${WORK_DIR}/${repo_name}"
        echo "  git push -u origin main"
    fi

    echo ""
}

# Main execution
main() {
    print_info "================================================"
    print_info "FitSync Repository Separation"
    print_info "================================================"
    echo ""

    print_info "This script will:"
    echo "  1. Create 9 new GitHub repositories"
    echo "  2. Extract each service with git history"
    echo "  3. Extract frontend with git history"
    echo "  4. Create docker-compose repository"
    echo "  5. Push all repositories to GitHub"
    echo ""

    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Aborted by user"
        exit 0
    fi

    echo ""
    print_info "STEP 1: Creating GitHub Repositories"
    print_info "================================================"

    # Create repositories
    for service in "${!SERVICES[@]}"; do
        create_github_repo "fitsync-${service}"
    done
    create_github_repo "fitsync-frontend"
    create_github_repo "fitsync-docker-compose"

    echo ""
    print_info "STEP 2: Extracting Services"
    print_info "================================================"

    # Extract each service
    for service in "${!SERVICES[@]}"; do
        extract_service "${service}" "${SERVICES[$service]}"
    done

    # Extract frontend
    extract_frontend

    # Create docker-compose repository
    create_docker_compose_repo

    echo ""
    print_info "STEP 3: Pushing to GitHub"
    print_info "================================================"

    # Push all repositories
    for service in "${!SERVICES[@]}"; do
        push_repository "fitsync-${service}"
    done
    push_repository "fitsync-frontend"
    push_repository "fitsync-docker-compose"

    echo ""
    print_info "================================================"
    print_info "✓ Repository Separation Complete!"
    print_info "================================================"
    echo ""
    print_info "All repositories have been created in: ${WORK_DIR}"
    echo ""
    print_info "Next steps:"
    echo "  1. Verify all repositories were pushed successfully"
    echo "  2. Update database connection strings to use TLS"
    echo "  3. Test each service repository"
    echo "  4. Archive the mono-repo"
    echo ""
}

# Run main function
main
