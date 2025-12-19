# Dockerfile for Hugging Face Spaces - AbleSpace Application
# Multi-stage build: Build frontend, then run backend serving static files

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source
COPY backend/ ./

# Build backend TypeScript
RUN npm run build

# Stage 3: Production Image
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security (required by HF Spaces)
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser

# Copy backend build and dependencies
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./

# Copy frontend build to be served as static files
COPY --from=frontend-builder /app/frontend/dist ./public

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Hugging Face Spaces uses port 7860 by default
ENV PORT=7860
ENV NODE_ENV=production

# Expose the port
EXPOSE 7860

# Start the backend server
CMD ["node", "dist/server.js"]
