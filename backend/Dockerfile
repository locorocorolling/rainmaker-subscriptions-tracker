# Multi-stage build for backend
FROM node:22-alpine AS base

# Install pnpm and curl for health checks
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Development dependencies stage
FROM base AS development-dependencies
RUN pnpm install --frozen-lockfile

# Production dependencies stage
FROM base AS production-dependencies
RUN pnpm install --frozen-lockfile --prod

# Build stage
FROM base AS build
COPY --from=development-dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Development stage
FROM base AS development
COPY --from=development-dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["pnpm", "dev"]

# Production stage
FROM base AS production
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 3001
CMD ["pnpm", "start"]