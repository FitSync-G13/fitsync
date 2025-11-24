#!/bin/bash

# Initialize environment files from examples if they don't exist
# This script should be run before docker-compose up

echo "Initializing environment files..."

# Function to copy .env.example to .env if .env doesn't exist
init_env() {
    local service=$1
    if [ ! -f "services/$service/.env" ]; then
        echo "Creating .env for $service..."
        cp "services/$service/.env.example" "services/$service/.env"
    else
        echo ".env already exists for $service, skipping..."
    fi
}

# Initialize all service .env files
init_env "user-service"
init_env "training-service"
init_env "api-gateway"
init_env "notification-service"
init_env "schedule-service"
init_env "progress-service"

# Initialize frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "Creating .env for frontend..."
    cp "frontend/.env.example" "frontend/.env"
else
    echo ".env already exists for frontend, skipping..."
fi

echo "Environment files initialized!"
echo "You can now run: docker-compose up -d"
