# ---------------------------------------
# Stage 1: Builder
# ---------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the static files
RUN npm run build

# ---------------------------------------
# Stage 2: Runtime
# ---------------------------------------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install a simple static file server
RUN npm install -g serve

USER node

# Copy the build output from the builder stage
# Note: Check if your project builds to "build" or "dist" and adjust below
COPY --from=builder --chown=node:node /app/build ./build

EXPOSE 3000

# Serve the static build folder on port 3000
CMD ["serve", "-s", "build", "-l", "3000"]
