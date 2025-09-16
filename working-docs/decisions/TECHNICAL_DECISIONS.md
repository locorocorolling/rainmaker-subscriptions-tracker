# Technical Decisions Log

## Shared Types Architecture (2025-09-15, 45 mins)

**Context**: Need robust type system for subscription billing with edge case handling
**Decision**: Comprehensive TypeScript types with three end-of-month strategies
**Reasoning**: 
- Handle Jan 31 subscription edge cases explicitly
- Support every N days/months/years billing cycles
- Money stored in minor units (cents) to avoid floating point errors
- Denormalized fields in PaymentRecord for efficient analytics queries

**Alternatives Considered**: 
- Simple date arithmetic without strategy patterns
- Storing money as floats
- Normalized payment records (require joins)

**Trade-offs**: 
- More complex type system vs robust edge case handling
- Denormalized data vs query performance
- Three strategies vs one-size-fits-all approach

**End-of-Month Strategy Implemented**:
- `last_day_of_month`: Jan 31 → Feb 28/29 → Mar 31 (following Stripe's implementation)
- This is the industry standard approach used by all major payment processors
- Interface kept extensible for future strategies if needed

**Demo Value**: Shows deep understanding of real-world billing complexities and edge cases

**Key Files**:
- `shared/types/subscription.ts` - Complete type definitions
- `shared/utils/dateCalculations.ts` - Edge case handling logic

## Authentication System (2025-09-16, 1.5 hours)

**Context**: Need secure user authentication system for API protection
**Decision**: JWT-based authentication with bcryptjs password hashing
**Reasoning**:
- JWT tokens are stateless and scale well
- bcryptjs provides strong password hashing with salt rounds
- Express middleware pattern for clean route protection
- Joi validation for input sanitization
- Separate auth utilities for reusability

**Alternatives Considered**:
- Session-based authentication (requires server-side state)
- OAuth2 integration (overkill for simple auth)
- Passport.js (additional complexity for this scope)

**Trade-offs**:
- JWT tokens can't be easily revoked (no token blacklist)
- bcryptjs is slower than bcrypt but more compatible
- More files and structure vs monolithic approach

**Implementation Details**:
- JWT tokens expire after 7 days
- Password hashing uses 12 salt rounds
- Two middleware patterns: required and optional auth
- User model includes preferences and account management fields

**Demo Value**: Shows proper security practices and clean code organization

**Key Files**:
- `backend/src/middleware/auth.ts` - Authentication middleware
- `backend/src/routes/auth.ts` - Auth endpoints
- `backend/src/utils/auth.ts` - Auth utilities
- `backend/src/models/User.ts` - User model with password hashing
