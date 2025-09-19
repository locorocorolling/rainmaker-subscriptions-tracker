# Backend Testing Guide

## Test Directory Structure
```
backend/tests/
├── unit/services/           # Fast unit tests (no DB)
├── integration/routes/      # API integration tests (DB required)
├── integration/services/    # Service integration tests (DB required)
├── helpers/                 # Test utilities and fixtures
├── setup.ts                # Global test setup
└── BILLING_TEST_MATRIX.md  # Business logic documentation
```

## Working Test Commands
```bash
# All tests
pnpm run test

# Specific test files
pnpm run test tests/unit/services/subscription.test.ts
pnpm run test tests/integration/routes/user.test.ts

# Watch mode for development
pnpm run test:watch

# Coverage reports
pnpm run test:coverage
```

## Test Categories

### Unit Tests (Fast)
- **Location**: `tests/unit/`
- **Purpose**: Test business logic in isolation
- **Dependencies**: None (no database required)
- **Example**: Preserved billing day calculation logic

### Integration Tests (Slow)
- **Location**: `tests/integration/`
- **Purpose**: Test complete workflows with database
- **Dependencies**: MongoDB Memory Server (requires 65MB binary download)
- **Example**: Subscription lifecycle from creation through multiple renewals

## TDD Implementation Example
The preserved billing day feature was implemented using Test-Driven Development:
1. **Tests first**: Comprehensive unit tests covering edge cases (BILLING_TEST_MATRIX.md)
2. **Implementation**: Business logic to make tests pass
3. **Integration**: End-to-end workflow validation

## MongoDB Memory Server Notes
- **Binary requirement**: 65MB MongoDB binary download on first run
- **Auto-download**: Happens during `pnpm install` or first test run
- **Fallback**: Integration tests documented as TODOs if binary unavailable
- **Performance**: Tests run in-memory for speed

## Business Logic Documentation
- **File**: `tests/BILLING_TEST_MATRIX.md`
- **Purpose**: Comprehensive edge case documentation for Monthly Anniversary Date billing
- **Covers**: Jan 31st → Feb 28th/29th → Mar 31st cycles, leap year scenarios
- **Use**: Reference for implementing billing logic and validating test coverage