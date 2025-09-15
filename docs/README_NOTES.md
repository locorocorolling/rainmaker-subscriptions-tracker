# README Notes

## Project Structure Setup (2025-09-15)
```bash
# Shared types are in shared/ directory for frontend/backend reuse
shared/
├── types/subscription.ts      # Complete TypeScript definitions
└── utils/dateCalculations.ts  # Edge case handling utilities
```

## Dependencies Added:
- TypeScript shared types (no runtime dependencies)
- Date calculation utilities handle end-of-month edge cases

## Key Features Implemented:
- Three end-of-month billing strategies
- Money stored in minor units (cents) for precision
- Support for every N days/months/years billing cycles
- Comprehensive validation constants
- Type guards for runtime validation

## Edge Cases Handled:
- Jan 31 monthly subscription → Feb 28/29
- Leap year calculations
- Invalid billing dates
- Currency precision issues
