# Backend Development Workflow

## Core Philosophy
**Practical type-safe development** with validation at logical checkpoints. Focus on getting working code committed efficiently while maintaining quality.

## Development Workflow

### Step 1: Make Changes
- Work on your feature/fix
- Edit files as needed
- No need to stage immediately

### Step 2: Validate Changes
```bash
# From backend directory
pnpm run typecheck    # Check all files for TypeScript errors
pnpm run build        # Ensure production build works
```

### Step 3: Stage and Commit
```bash
# Stage relevant files
git add backend/src/routes/subscriptions.ts backend/src/services/subscription.ts

# Or stage all changes
git add .

# Commit with conventional format
git commit -m "feat(backend): implement subscription CRUD endpoints"
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

### Git Workflow
```bash
git --no-pager status              # Check status (no pager)
git --no-pager diff               # See changes
git --no-pager log --oneline -10   # See recent commits
```

## Commit Convention
```
<type>[scope]: <description>

Types:
feat: New feature
fix: Bug fix
docs: Documentation
style: Code style
refactor: Code restructuring
test: Testing
chore: Build/process changes

Examples:
feat(backend): add subscription create endpoint
fix(api): handle missing subscription id validation
docs: update API documentation
refactor(backend): extract subscription service layer
```

## Environment Setup
- **Node Version**: v22+ (`nvm use 22`)
- **Package Manager**: pnpm
- **Database**: MongoDB (running in Docker)
- **Authentication**: JWT + bcryptjs

## Troubleshooting
- Type errors: Check imports and TypeScript types
- Build fails: Verify all dependencies are installed
- Database connection: Ensure Docker containers are running
- Port conflicts: Check if ports 3000/27017 are available

---

*This workflow emphasizes practical development while maintaining type safety and code quality for the interview project timeline.*