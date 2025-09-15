# Subscription Management Tool

Interview project for Rainmaker (16-20 hours total)

## Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB
- **Queue**: Redis + BullMQ
- **Deployment**: Docker Compose → Coolify + Cloudflare Tunnel

## Prerequisites

### Required Software
- **Node.js**: v18+ (managed via nvm)
- **pnpm**: Package manager for Node.js
- **Docker**: Latest version
- **Docker Compose**: v2.0+

### Development Environment Setup
1. Install Node.js via nvm:
   ```bash
   nvm install 18
   nvm use 18
   ```

2. Install pnpm globally:
   ```bash
   npm install -g pnpm
   ```

3. Verify Docker installation:
   ```bash
   docker --version
   docker-compose --version
   ```

## Directory Structure
```
subscriptions-management/
├── frontend/                 # React+Vite+TS app
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── backend/                  # Node.js+Express+TS API
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── shared/                   # Shared types/utilities
│   └── types/
├── docker/                   # Docker configurations
│   ├── redis.conf
│   └── mongo-init.js
├── docs/                     # Project documentation
├── docker-compose.yml        # Main compose file
├── docker-compose.dev.yml    # Development overrides
├── .env.example
└── README.md
```

## Quick Start

1. Clone the repository
2. Copy environment variables: `cp .env.example .env`
3. Install dependencies: `pnpm install`
4. Start services: `docker-compose up -d`
5. Start development: `pnpm run dev`

## Development Commands

```bash
# Start all services
docker-compose up -d

# Start development servers
pnpm run dev

# Build for production
pnpm run build

# Run tests
pnpm run test

# View logs
docker-compose logs backend
docker-compose logs frontend
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- MongoDB connection string
- Redis connection string
- JWT secret
- API keys

## Priority Order
1. Frontend polish
2. API completeness  
3. System design
4. Tests
