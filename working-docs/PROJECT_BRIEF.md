# Weekend Project: Subscription Tracker

## Overview
Build a subscription management platform that helps users track their existing subscriptions (Netflix, AWS, domains, etc.), monitor spending, and receive notifications for renewals.

---

## Core Requirements

### Functional Requirements
1. **User Management**  
   a. Registration/authentication  
   b. Profile with notification preferences  

2. **Subscription Management**  
   a. CRUD operations for subscriptions  
   b. Track: service name, cost, billing cycle, renewal dates  
   c. Support multiple currencies  
   d. Status tracking (active/paused/cancelled)  
   e. Support subscriptions billed every N days (not just monthly/yearly)  

3. **Dashboard & Analytics**  
   a. Monthly/yearly spending overview  
   b. Category breakdowns  
   c. Upcoming renewals  
   d. Visual charts for trends  

4. **Notifications**  
   a. Email alerts for upcoming renewals  
   b. Configurable reminder periods  

---

### Technical Requirements
- Backend: Node.js/Express, MongoDB, JWT auth  
- Frontend: React, responsive design  
- Additional: Background job scheduler for notifications  

---

## Deliverables
1. GitHub repository with README  
2. Working application (Docker setup preferred)  
3. API documentation  
4. Short demo video (5-10 min) explaining your implementation  
5. Brief technical document (1-2 pages) covering:  
   a. Key design decisions  
   b. Challenges and solutions  
   c. Future scaling considerations  

---

## Bonus Features (Optional)
- CSV import/export  
- Budget alerts  

---

## Time Expectation
This is designed as a weekend project (~16–20 hours). Focus on core functionality and code quality over feature completeness.

---

## Additional Notes
- Use of AI coding assistants is allowed but must be disclosed:  
  - Which AI tools you used  
  - What you used them for (e.g., "boilerplate generation", "debugging", "schema design")  
  - What you built/modified yourself  

- External libraries are encouraged (explain why you chose them)  
- Focus on demonstrating understanding over feature completeness  
- Production-ready code is not expected, but production considerations should be discussed  
