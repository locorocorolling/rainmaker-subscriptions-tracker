# Backend Development Workflow

## 🚀 **Backend Development Workflow**

### Step 1: Make Backend Changes
- Work on API endpoints, services, models
- Edit backend files as needed

### Step 2: Validate Changes
```bash
# From backend directory
pnpm run typecheck    # Check for TypeScript errors
pnpm run build        # Ensure production build works
```

### Step 3: Follow Main Git Workflow
```bash
# See ../AGENTS.md for complete git workflow
# Use conventional commits: feat(backend):, fix(api):, etc.
```

## Essential Commands

### Development
```bash
cd backend
pnpm run dev          # Start development server
pnpm run typecheck    # TypeScript validation
pnpm run build        # Production build
pnpm run test         # Run tests (when available)
```

### Docker Services
```bash
docker-compose up -d               # Start all services
docker-compose logs backend        # Check backend logs
docker-compose logs mongo          # Check MongoDB logs
docker-compose exec mongo mongosh  # Access MongoDB shell
```

### Development
```bash
cd backend
pnpm run dev          # Start development server (port 3001)
pnpm run typecheck    # TypeScript validation
# Note: Use ../AGENTS.md for git workflow and commit process
```

## 📋 **Related Documentation**
- **[Main AGENTS.md](../AGENTS.md)**: Git workflow, commit conventions, and shared development practices
- **[Commit Workflow](../working-docs/development/COMMIT_WORKFLOW.md)**: Detailed git staging and commit process

## 🔧 **Backend-Specific Commands**

## 🛠 **Environment Setup**
- **Node Version**: v22+ (`nvm use 22`)
- **Package Manager**: pnpm
- **Database**: MongoDB (Docker container)
- **Authentication**: JWT + bcryptjs
- **Port**: 3001 (backend API)

## 🔍 **Backend-Specific Troubleshooting**
- **Type errors**: Check Mongoose schemas and TypeScript types
- **Build fails**: Verify backend dependencies are installed
- **Database connection**: Ensure MongoDB Docker container is running
- **Port conflicts**: Check if port 3001 is available
- **JWT issues**: Verify JWT_SECRET environment variable

---

*This workflow emphasizes practical development while maintaining type safety and code quality for the interview project timeline.*