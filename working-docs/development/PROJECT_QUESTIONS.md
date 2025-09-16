# Key Questions for Subscription Management Tool

## Oracle's Strategic Questions (45 Total - Key Ones Below)

### 1. Core Product Scope (time-boxed to 16–20 h)
- Which ONE user flow must work flawlessly for demo day?  
- What can be stubbed or mocked (e.g. email/SMS delivery) without losing interview value?  
- What non-functional goals (perf, security, tests) will you sacrifice first if hours run out?  

### 2. Success Criteria
- How will the interviewer evaluate "done"? Unit tests? Live demo? PR review?  
- Do you need seed data + a Postman collection or just README instructions?  

### 3. Supabase Auth
- Will you use Supabase JWTs as bearer tokens directly, or mint your own session cookies?  
- How will the backend verify JWTs—Supabase SDK inside API, or JWKS introspection?  
- Any multi-tenant concerns (orgs / workspaces) that Supabase row-level security could simplify?  

### 4. Data Model – Users
- Do you store a copy of Supabase user id/email in Mongo, or treat Supabase as source of truth?  
- How will you handle Supabase user deletion → cascading cleanup in Mongo?  

### 5. Data Model – Subscriptions
- Precise fields for renewal logic: "billingCycle.value/unit", "nextRenewal", "firstBillingDate"?  
- Money representation—integer minor units + currency code?  
- Time-zone field per subscription or per user? DST edge cases?  

### 6. Aggregation Queries
- List the 3 analytics queries you must ship (e.g. monthly cost by category).  
- Have you sketched their $match/$group pipelines and verified they hit the indexes above?  

### 7. Notification System
- Job runner choice: BullMQ/Redis vs cron-inside-API pod—what fits 20 h best?  
- How frequently will the worker run and what sliding window ("renewals in next 24 h")?  
- Idempotency: how do you prevent double-sending if a job retries?  
- Where will you log notification attempts for debugging (Mongo "notifications" collection?)  

### 8. Testing Plan
- Unit tests for pure logic (nextRenewal calculator) – how many minutes will you allocate?  
- Integration tests: will you run mongodb-memory-server or Docker Mongo in CI?  
- Critical E2E path—Cypress vs Playwright vs skipped due to time?  

### 9. Time Management
- What is your 20-hour budget per task (schema 2 h, API 5 h, notifications 4 h, tests 4 h, docs 2 h, slack 3 h)?  
- Which backlog items are explicitly "stretch goals" so interviewers know scope control?  

### 10. Demo Script
- Have you written a 3-minute clickable path: sign-up → add subscription → see upcoming renewals → receive mock email?  
- Backup plan if email fails—console log or in-app toast?  

## Amp's Strategic Questions

### Core Scope Priority
- Which single user flow must be bulletproof for the demo? (Add subscription → view dashboard → get notification)

### Supabase Integration 
- How will you verify JWTs in your backend? Supabase SDK or JWKS introspection?

### Data Model Precision
- Do you store Supabase user data in Mongo too, or treat Supabase as source of truth?

### Aggregation Reality Check
- Have you sketched the actual MongoDB pipelines for your 3 core analytics queries and confirmed they hit your planned indexes?

### Notification Idempotency
- How do you prevent duplicate emails if notification jobs retry?

### Time Budget
- What's your hour allocation per major component (API: 5h, notifications: 4h, etc.)?

## Strategic Questions Back to You

- Since you have 16-20 hours total, **what's the minimum viable demo path** that showcases your skills without over-engineering?
- For the Supabase auth integration, do you want to **proxy all user data through your API** or let the frontend hit Supabase directly for some operations?
- Given DocumentDB limitations, should you **pre-calculate analytics** in background jobs rather than real-time aggregation?
- What's your **backup plan if email notifications fail** during the demo?

## Questions to Address During Implementation

### Phase 1: Foundation
- [ ] Define the single critical user flow for demo
- [ ] Choose auth solution and integration approach
- [ ] Sketch MongoDB aggregation pipelines for analytics
- [ ] Define time budget per component

### Phase 2: Core Development  
- [ ] Implement notification idempotency strategy
- [ ] Set up proper error handling and logging
- [ ] Create seed data for demo
- [ ] Test aggregation query performance

### Phase 3: Demo Preparation
- [ ] Write 3-minute demo script
- [ ] Set up backup plans for failure scenarios
- [ ] Document key technical decisions made
- [ ] Prepare talking points for scaling discussion

## Notes Section
(Add your answers and decisions here as you work through the questions)
