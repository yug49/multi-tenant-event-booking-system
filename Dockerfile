# Multi-stage Dockerfile for NestJS Backend
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY backend/ ./

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy source files needed for seeding (ts-node will compile on the fly)
COPY backend/src ./src
COPY backend/tsconfig.json ./tsconfig.json

# Install ts-node and typescript for running seed script
RUN npm install ts-node typescript tsconfig-paths

# Set ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Start script that runs migrations, seeds, then starts the app
CMD ["sh", "-c", "npm run seed && node dist/main"]
