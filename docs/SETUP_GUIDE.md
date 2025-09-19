# Complete Setup Guide

## Prerequisites

- **Node.js 22+** (use `nvm use 22`)
- **Docker and Docker Compose**
- **pnpm package manager**

## Environment Configuration

**Three configuration files are required:**

### 1. Root `.env` (Docker infrastructure)
```bash
cp .env.example .env
```
Contains credentials for MongoDB, Mongo Express, and Redis Commander admin interfaces.

### 2. Backend `.env` (Application config)
```bash
cp backend/.env.example backend/.env
```
Pre-configured with development settings. Key variables:
- `MONGODB_URI`: Database connection
- `JWT_SECRET`: Authentication token secret
- `RESEND_API_KEY`: Email service (optional for development)
- `REDIS_URL`: Redis connection (infrastructure ready, not currently used for jobs)

### 3. Frontend `.env` (Client config)
```bash
cp frontend/.env.example frontend/.env
```
Simple configuration pointing to local backend API.

## Development Setup

### 1. Install Dependencies
```bash
# Frontend
cd frontend && pnpm install

# Backend
cd backend && pnpm install
```

### 2. Start Infrastructure
```bash
# Start MongoDB + Redis + admin tools
docker-compose -f docker-compose.dev.yml up -d
```

**Services started:**
- MongoDB on port 27017
- Redis on port 6379
- Mongo Express on port 8081 (MongoDB GUI)
- Redis Commander on port 8082 (Redis GUI)

### 3. Start Development Servers
```bash
# Terminal 1: Frontend
cd frontend && pnpm run dev

# Terminal 2: Backend
cd backend && pnpm run dev
```

### 4. Verify Setup
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **MongoDB Admin**: http://localhost:8081
- **Redis Admin**: http://localhost:8082

## Available Scripts

### Frontend
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run typecheck` - TypeScript validation
- `pnpm run test` - Run test suite

### Backend
- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run typecheck` - TypeScript validation
- `pnpm run test` - Run test suite with coverage

## API Testing Examples

### Authentication Flow

#### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get User Profile (requires token)
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Subscription Management
```bash
# List subscriptions (requires auth token)
curl -X GET http://localhost:3001/api/subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create subscription
curl -X POST http://localhost:3001/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "service": "Netflix",
    "cost": {"amount": 1299, "currency": "USD"},
    "billingCycle": {"value": 1, "unit": "month"},
    "firstBillingDate": "2024-01-15"
  }'
```

## Troubleshooting

### Port Conflicts
If ports are in use:
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database Issues
Check MongoDB status:
```bash
# View container status
docker-compose -f docker-compose.dev.yml ps

# View MongoDB logs
docker-compose -f docker-compose.dev.yml logs mongodb

# Access MongoDB shell
docker-compose -f docker-compose.dev.yml exec mongodb mongosh
```

### Redis Issues
Check Redis status:
```bash
# View Redis logs
docker-compose -f docker-compose.dev.yml logs redis

# Access Redis CLI
docker-compose -f docker-compose.dev.yml exec redis redis-cli
```

### TypeScript Errors
Run type checking:
```bash
# Frontend
cd frontend && pnpm run typecheck

# Backend
cd backend && pnpm run typecheck
```

### Clear Everything and Restart
```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Remove volumes (clears database)
docker-compose -f docker-compose.dev.yml down -v

# Restart fresh
docker-compose -f docker-compose.dev.yml up -d
```

## Project Structure

```
subscription-tracker/
├── frontend/                # React Router 7 + TypeScript + TanStack Query
│   ├── app/                # Route components
│   ├── src/                # Components, services, utilities
│   ├── package.json
│   └── tsconfig.json
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── models/         # Mongoose schemas (User, Subscription)
│   │   ├── routes/         # API routes (auth, subscriptions, users)
│   │   ├── services/       # Business logic (email, background jobs)
│   │   ├── middleware/     # Authentication, validation
│   │   ├── utils/          # Database, config, logging
│   │   └── server.ts       # Express application
│   ├── package.json
│   └── tsconfig.json
├── shared/                  # Shared TypeScript types
├── docs/                    # Documentation
├── docker-compose.dev.yml   # Development infrastructure
├── docker-compose.prod.yml  # Production infrastructure
└── .env files              # Environment configuration
```

## Docker Configurations

### Development (`docker-compose.dev.yml`)
- Includes admin tools (Mongo Express, Redis Commander)
- Volume mounts for data persistence
- Optimized for development workflow

### Production (`docker-compose.prod.yml`)
- Minimal runtime containers
- No admin interfaces
- Production-optimized settings

## Next Steps

1. **Explore the API**: Visit http://localhost:3001/api-docs for interactive documentation
2. **Run tests**: `pnpm run test` in both frontend and backend directories
3. **Check background jobs**: View application logs (jobs use node-cron, not Redis queues yet)
4. **Review architecture**: See [Technical Decisions](./TECHNICAL_DECISIONS.md) for design rationale

## Additional Resources

- **[Development Workflow](../AGENTS.md)** - Detailed development practices
- **[API Documentation](http://localhost:3001/api-docs)** - Interactive Swagger UI (when running)
- **[Deployment Guide](./DEPLOYMENT_OPTIONS.md)** - Production deployment options
- **[Technical Decisions](./TECHNICAL_DECISIONS.md)** - Architecture and design choices