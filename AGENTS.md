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

Remember: This is an **append-only log** - don't worry about organization, just capture everything relevant. The user will clean it up later.
