# System Architecture & Tech Stack

## Final Tech Stack Decisions

### Frontend
- **Framework:** React 18 + Vite + TypeScript
- **Recommended Template:** `@vitejs/create-vite` with React-TS template
- **Alternative:** Vite + React + TypeScript + TailwindCSS template
- **UI Library:** Consider TailwindCSS or Chakra UI for rapid development

### Backend
- **Runtime:** Node.js 18+ with Express + TypeScript
- **Database:** MongoDB (DocumentDB compatible)
- **Cache/Queue:** Redis + BullMQ
- **API Documentation:** OpenAPI/Swagger with swagger-jsdoc
- **Package Manager:** pnpm

### Infrastructure
- **Development:** Docker Compose
- **Deployment:** Coolify (self-hosted) + Cloudflare Tunnel
- **Email:** Mock/console.log → Nodemailer (if time permits)

### Priority Order
1. **Frontend Polish & UX** (good first impression)
2. **API Completeness** (all CRUD + analytics)
3. **System Design** (caching, queues, documentation)
4. **Tests** (E2E core flow + critical unit tests)

## Recommended React Template

**Option 1: Vite + React-TS (Clean start)**
```bash
pnpm create vite subscription-tracker --template react-ts
```

**Option 2: Vite + React-TS + TailwindCSS**
```bash
pnpm create vite subscription-tracker --template react-ts
cd subscription-tracker
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Option 3: T3 Stack (Established, but might be overkill)**
- Includes TypeScript, tRPC, Prisma, NextAuth
- Might be too much for 16-20 hours

**Recommendation:** Go with **Option 2** - Vite + React-TS + TailwindCSS for rapid UI development.

## Project Structure

```
subscription-tracker/
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API calls
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── jobs/          # BullMQ job processors
│   │   ├── utils/         # Helper functions
│   │   └── types/         # TypeScript definitions
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml       # Development environment
├── docker-compose.prod.yml  # Production environment
├── README.md               # Setup instructions
└── docs/                   # Technical documentation
    ├── API.md
    └── DEPLOYMENT.md
```

## Docker Compose Architecture

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:4000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/subscription_tracker
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret-change-in-production
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6-jammy
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=subscription_tracker

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # BullMQ Dashboard (optional, for debugging)
  bull-dashboard:
    build:
      context: ./backend
      dockerfile: Dockerfile.worker
    ports:
      - "3001:3001"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

volumes:
  mongo_data:
  redis_data:
```

## Testing Strategy

### E2E Tests (Core Flow)
```typescript
// tests/e2e/core-flow.spec.ts
describe('Core Subscription Flow', () => {
  test('User can register, add subscription, view dashboard, get notification', async () => {
    // 1. Register user
    await page.goto('/register');
    await page.fill('[data-testid="email"]', 'test@example.com');
    // ... registration flow
    
    // 2. Add subscription
    await page.click('[data-testid="add-subscription"]');
    await page.fill('[data-testid="service"]', 'Netflix');
    // ... subscription creation
    
    // 3. View dashboard
    await expect(page.locator('[data-testid="total-monthly"]')).toContainText('$15.99');
    
    // 4. Check notification log
    await page.goto('/notifications');
    await expect(page.locator('[data-testid="notification-item"]')).toBeVisible();
  });
});
```

### Unit Tests (Edge Cases)
```typescript
// tests/unit/date-calculations.test.ts
describe('Subscription Date Calculations', () => {
  test('handles end-of-month subscriptions correctly', () => {
    // Subscription created on Jan 31st, monthly billing
    const startDate = new Date('2024-01-31');
    const billingCycle = { value: 1, unit: 'month' };
    
    const nextRenewal = calculateNextRenewal(startDate, billingCycle);
    
    // Should be Feb 29th (or 28th in non-leap year)
    expect(nextRenewal.getDate()).toBeLessThanOrEqual(29);
    expect(nextRenewal.getMonth()).toBe(1); // February
  });
  
  test('handles leap year edge cases', () => {
    const startDate = new Date('2024-02-29'); // Leap year
    const nextYear = calculateNextRenewal(startDate, { value: 1, unit: 'year' });
    
    // Should be Feb 28, 2025 (non-leap year)
    expect(nextYear).toEqual(new Date('2025-02-28'));
  });
});
```

## Coolify + Cloudflare Tunnel Deployment

### Coolify Setup
```yaml
# coolify/docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: subscription-tracker:latest
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_URL=${REDIS_URL}
    labels:
      - "coolify.enabled=true"
      - "coolify.name=subscription-tracker"
      - "coolify.port=4000"
```

### Cloudflare Tunnel
```bash
# Install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Create tunnel
cloudflared tunnel create subscription-tracker
cloudflared tunnel route dns subscription-tracker subscription-tracker.yourdomain.com

# Run tunnel
cloudflared tunnel --config config.yml run
```

## Time Allocation Plan (16-20 hours)

### Phase 1: Foundation (4 hours)
- [x] System design & architecture (1h)
- [ ] Project setup & Docker Compose (1h)
- [ ] Basic auth implementation (2h)

### Phase 2: Core Features (8 hours)
- [ ] Database models & migrations (1h)
- [ ] Subscription CRUD APIs (2h)
- [ ] Analytics APIs (2h)
- [ ] Frontend components & pages (3h)

### Phase 3: Advanced Features (4 hours)
- [ ] BullMQ job queue setup (1h)
- [ ] Notification system (1h)
- [ ] Frontend polish & UX (2h)

### Phase 4: Testing & Documentation (2-4 hours)
- [ ] E2E tests for core flow (1h)
- [ ] Critical unit tests (1h)
- [ ] OpenAPI documentation (1h)
- [ ] README & deployment docs (1h)

### Stretch Goals (if time permits)
- [ ] Email integration (Nodemailer)
- [ ] Advanced analytics charts
- [ ] Mobile responsiveness polish
- [ ] Performance optimizations

## Interview Demo Script (3 minutes)

1. **Show running application** (30s)
   - docker-compose up
   - Open app in browser

2. **User registration & login** (30s)
   - Register new user
   - Show JWT token storage

3. **Add subscriptions** (60s)
   - Add Netflix ($15.99/month)
   - Add GitHub Pro ($4/month)
   - Show real-time dashboard updates

4. **Analytics demo** (60s)
   - Show monthly spending breakdown
   - Category analysis
   - Upcoming renewals

5. **Technical highlights** (30s)
   - Show API documentation at /api-docs
   - Demonstrate job queue with notification scheduling
   - Show MongoDB aggregation results

## Next Steps

1. **Set up React + Vite project**
2. **Configure Docker Compose environment**
3. **Implement basic auth system**
4. **Create MongoDB schemas**

Would you like me to start with the React + Vite setup or the Docker Compose configuration first?
