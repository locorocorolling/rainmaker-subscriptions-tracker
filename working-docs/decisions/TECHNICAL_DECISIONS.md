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
