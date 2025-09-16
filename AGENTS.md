# AI Agent Instructions for Subscription Management Tool

## Project Context
- **Interview project** with Rainmaker (16-20 hours total)
- **Tech Stack**: React+Vite+TS frontend, Node.js+Express+TS backend, MongoDB, Redis, BullMQ
- **Deployment**: Docker Compose → Coolify + Cloudflare Tunnel
- **Priority**: Frontend polish > API completeness > System design > Tests

## Required Deliverables Documentation

### 1. README.md Content Capture
**File**: `README_NOTES.md`
**Append whenever you encounter:**
- Setup/installation steps that work
- Environment variables needed
- Docker commands that are important
- API endpoint examples that work
- Troubleshooting steps you discover
- Prerequisites (Node version, Docker, etc.)

### 2. Technical Document Content
**File**: `TECHNICAL_DECISIONS.md` 
**Append whenever you make/discuss:**
- **Key design decisions**: Why MongoDB over SQL, why BullMQ over simple cron, auth approach chosen
- **Challenges and solutions**: Date calculation edge cases, aggregation performance, notification deduplication
- **Future scaling considerations**: Connection pooling, read replicas, microservices split, caching strategies

### 3. Demo Video Talking Points
**File**: `DEMO_SCRIPT_NOTES.md`
**Append whenever you implement:**
- Cool features worth demonstrating (real-time updates, smart date handling)
- Technical highlights that show engineering skill (proper error handling, job queues, API design)
- User experience flows that look polished
- System design aspects visible in the demo (Docker setup, API docs, monitoring)

## Implementation Notes Capture

### Commands That Work
**Keep a running list in README_NOTES.md:**
```bash
# Commands that actually work for setup
pnpm install
docker-compose up -d
pnpm run dev
```

### Technical Decisions Made
**Keep logging in TECHNICAL_DECISIONS.md:**
- Date: Decision made
- Context: What problem you were solving
- Decision: What you chose
- Reasoning: Why you chose it
- Alternatives: What else you considered

### Demo-Worthy Features
**Keep noting in DEMO_SCRIPT_NOTES.md:**
- Features that show engineering depth
- UX details that impress
- Technical implementation highlights
- System architecture visible elements

## File Structure for Documentation
```
docs/
├── README_NOTES.md           # Running setup instructions
├── TECHNICAL_DECISIONS.md    # Design decisions log
├── DEMO_SCRIPT_NOTES.md      # Demo talking points
└── API_EXAMPLES.md           # Working API calls for docs
```

## Time Tracking Reminder
**Always note time spent on major tasks for the technical document:**
- Authentication implementation: X hours
- Database schema design: X hours  
- Frontend components: X hours
- Notification system: X hours
- Docker setup: X hours

This helps show project management skills in the technical document.

## Common Commands to Document
```bash
# Development
pnpm run dev          # Start dev servers
pnpm run build        # Build for production
pnpm run test         # Run tests

# Docker
docker-compose up -d               # Start services
docker-compose logs backend        # Check logs
docker-compose exec mongo mongosh  # Access MongoDB

# Database
# MongoDB connection strings, index creation commands
# Redis commands for queue inspection
```

## Testing Notes
**Document working test commands:**
- Unit test commands that pass
- E2E test setup that works
- Test data setup scripts

## Git Commit Convention

**All commits must follow Conventional Commits format:**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(frontend): add subscription list component
fix(api): handle missing subscription id in delete endpoint
docs: update README with setup instructions
style: format code with prettier
refactor: extract subscription service layer
test: add unit tests for subscription validation
chore: update dependencies to latest versions
```

---

# Iterative Development Workflow

## 🎯 **Core Philosophy**

Use **small, focused changes** with type safety at every step. The goal is to keep the surface area manageable for verification, whether by humans or AI agents.

## 🚀 **The Iterative Process**

### **Step 1: Make Focused Changes**
Modify one or more related files to implement a single logical change. Examples:
- Add a new component import to existing files
- Update component usage across multiple related files
- Create a new feature with its components and routes

**Key**: Keep changes focused and related. Don't mix unrelated features in the same iteration.

### **Step 2: Stage Changes**
```bash
# Stage all files involved in this iteration
git add path/to/file1.tsx path/to/file2.tsx
```

### **Step 3: Validate with Typechecking and Build**
```bash
# Run typecheck on all files
pnpm run typecheck

# Run build to ensure production readiness
pnpm run build
```

This validates your changes using the full project configuration, ensuring:
- Path aliases resolve correctly (`@/components/ui/card`)
- JSX configuration works properly
- React Router route types are available
- All imports and dependencies are satisfied
- Production build completes successfully

### **Step 3.5: Browser Validation (If Available)**
When Playwright MCP tools are available, AI agents can enhance the workflow with automated browser testing:
- Navigate to the dev server URL and verify changes
- Perform visual validation with screenshot capture
- Test user interactions and navigation flows
- Monitor console output and network activity
- Generate automated documentation and test results

This provides an alternative workflow with comprehensive browser automation and quality assurance capabilities.

### **Step 4: Evaluate and Commit**
- **✅ Passes**: Commit with confidence
  ```bash
  git commit -m "feat: implement focused change description"
  ```
- **❌ Fails**: Fix the identified type errors, then repeat from Step 2

## 📝 **Example Iterations**

### **Single Component Iteration**
```bash
# Add Card component to home route
git add src/components/ui/card.tsx src/lib/utils.ts
pnpm run typecheck
pnpm run build
git commit -m "feat: integrate Card components in home page"
```

### **Multi-Component Iteration**
```bash
# Add Button component and update pages to use it
git add src/components/ui/button.tsx app/routes/home.tsx
pnpm run typecheck
pnpm run build
git commit -m "feat: integrate Button components in home page"
```

### **Feature Iteration**
```bash
# Complete feature: new component + route + integration
git add src/components/ui/badge.tsx app/routes/subscriptions.tsx
pnpm run typecheck
pnpm run build
git commit -m "feat: enhance subscriptions page with Card, Button, and Badge components"
```

## ⚠️ **Important: TypeScript CLI Limitations**

**Do not use single file CLI typechecking:**
```bash
# ❌ These don't work properly:
npx tsc --noEmit app/routes/subscriptions.tsx
npx tsc --noEmit -p tsconfig.json app/routes/subscriptions.tsx
```

**Why**: TypeScript CLI doesn't allow mixing project configuration with source files, so single file typechecking doesn't load tsconfig.json properly.

**Solution**: Always use `pnpm run typecheck` for full project validation.

## 🔗 **Related Documentation**

- **[Frontend Development Workflow](frontend/AGENTS.md)**: Detailed frontend-specific workflow, typecheck commands, infrastructure setup, troubleshooting, and best practices
- **[Typecheck Commands](frontend/AGENTS.md#typecheck-commands)**: Available commands and their use cases
- **[Infrastructure Setup](frontend/AGENTS.md#infrastructure)**: Path aliases, route types, and configuration
- **[Troubleshooting](frontend/AGENTS.md#troubleshooting)**: Common issues and solutions
- **[Best Practices](frontend/AGENTS.md#best-practices)**: Guidelines for humans and AI agents

## 🎯 **Benefits**

- **Zero Broken Commits**: Typechecking and build prevent committing broken code
- **Manageable Verification**: Small surface area is easy to review and validate
- **Fast Feedback**: Typechecking provides quick validation
- **Type Safety**: All dependencies and imports are validated at each step
- **Production Ready**: Build step ensures changes work in production
- **Consistent**: Works identically for human contributors and AI agents

This workflow ensures that all changes, whether single file or multi-file, are properly validated before being committed to the codebase.

---

Remember: This is an **append-only log** - don't worry about organization, just capture everything relevant. The user will clean it up later.
