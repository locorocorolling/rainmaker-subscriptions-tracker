# Subscription Tracker - Development Notes

## Setup Instructions

### Prerequisites
- Node.js v22+ (use `nvm use 22`)
- pnpm package manager
- Docker and Docker Compose

### Development Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pnpm install
   ```

2. **Start infrastructure services:**
   ```bash
   docker-compose up -d
   ```
   - MongoDB on port 27017
   - Redis on port 6379
   - Mongo Express on port 8081
   - Redis Commander on port 8082

3. **Start development server:**
   ```bash
   cd backend
   pnpm run dev
   ```

### Environment Variables
- `JWT_SECRET`: Secret key for JWT tokens (default: 'your-secret-key-change-in-production')
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `NODE_ENV`: Environment (development/production)

### Available Scripts
- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run start` - Start production server

### API Endpoints

#### Health Check
- `GET /health` - Health check with database status

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

#### API Info
- `GET /api` - Basic API information

### Working API Examples

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

#### Get User Profile
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Troubleshooting

#### Port Conflicts
If port 3001 is in use:
```bash
lsof -ti:3001 | xargs kill -9
```

#### Database Connection
Ensure MongoDB is running:
```bash
docker-compose ps
docker-compose logs mongo
```

#### Type Errors
Run type checking:
```bash
pnpm run typecheck
```

### Project Structure
```
backend-worktree/
├── backend/                 # Node.js+Express+TS API
│   ├── src/
│   │   ├── models/          # Mongoose schemas (User, Subscription)
│   │   ├── utils/           # Database, config, logging utilities
│   │   ├── middleware/      # Authentication middleware
│   │   ├── routes/          # API routes (auth, subscriptions)
│   │   └── server.ts        # Express server
│   ├── package.json         # Dependencies
│   └── tsconfig.json
├── shared/                  # Shared TypeScript types
├── frontend/                # React+Vite+TS app
└── docker-compose.yml       # Infrastructure
```

### Current Status
✅ Database integration (MongoDB)
✅ Authentication system (JWT)
✅ User management
🚧 Subscription CRUD endpoints (next phase)

### Time Tracking
- Database integration: ~2 hours
- Authentication system: ~1.5 hours
- User model development: ~1 hour

### Next Steps
1. Implement Subscription CRUD endpoints
2. Add request validation with Joi
3. Create API documentation with Swagger
4. Frontend integration