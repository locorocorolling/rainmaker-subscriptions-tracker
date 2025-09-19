# Preserved Billing Day Logic - Comprehensive Test Matrix

**Business Rule**: Preserve the original subscription day across months, adjusting only when the target month doesn't have that day.

## Monthly Billing Test Cases

### Core Monthly Anniversary Logic
```
┌─────────────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Subscribe Date  │ Preserved Day  │ 1st Renewal     │ 2nd Renewal     │ 3rd Renewal     │
├─────────────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Jan 31st        │ 31             │ Feb 28th (adj)  │ Mar 31st (back) │ Apr 30th (adj)  │
│ Jan 31st (leap) │ 31             │ Feb 29th (adj)  │ Mar 31st (back) │ Apr 30th (adj)  │
│ Jan 30th        │ 30             │ Feb 28th (adj)  │ Mar 30th (back) │ Apr 30th        │
│ May 31st        │ 31             │ Jun 30th (adj)  │ Jul 31st (back) │ Aug 31st        │
│ Feb 29th (leap) │ 29             │ Mar 29th        │ Apr 29th        │ May 29th        │ ←NEW
│ Jan 15th        │ 15             │ Feb 15th        │ Mar 15th        │ Apr 15th        │
└─────────────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Edge Case Analysis:

**End-of-Month Patterns:**
- Subscribe on 31st → Always try 31st, fallback to last day of month
- Subscribe on 30th → Try 30th, fallback only for February (28/29)
- Subscribe on 29th → Works most months, only issue in non-leap February

**February Leap Year Logic:**
- Jan 31st → Feb 29th (leap) vs Feb 28th (non-leap)
- Both should return to Mar 31st (preserve original day 31)

**Month Length Variations:**
- 31-day months: Jan, Mar, May, Jul, Aug, Oct, Dec
- 30-day months: Apr, Jun, Sep, Nov
- 28/29-day month: Feb

## Yearly Billing Test Cases

### Feb 29th Leap Year Nightmare
```
┌─────────────────┬────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Subscribe Date  │ Preserved Day  │ Year 1 Renewal  │ Year 2 Renewal  │ Year 3 Renewal  │
├─────────────────┼────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Feb 29th 2024   │ 29             │ Feb 28th 2025   │ Feb 28th 2026   │ Feb 28th 2027   │
│ (leap year)     │                │ (non-leap adj)  │ (non-leap adj)  │ (non-leap adj)  │
│                 │                │                 │                 │ Feb 29th 2028   │
│                 │                │                 │                 │ (leap back!)    │
└─────────────────┴────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**Yearly Logic:** Same as monthly but across years - preserve day 29, adjust to 28 in non-leap years, return to 29 in leap years.

## Daily/Every N Days: NO PRESERVED DAY LOGIC

**Rationale:** Daily billing just adds N days - no month boundary complexity.
- Every 7 days: Jan 15th → Jan 22nd → Jan 29th → Feb 5th
- Every 30 days: Jan 15th → Feb 14th → Mar 16th (no preservation needed)

## Test Implementation Strategy

### Unit Tests (Fast, No DB)
1. **`calculateNextRenewal()` function tests**
   - Input: fromDate, billingCycle, preservedBillingDay
   - Output: nextRenewalDate
   - Test each matrix scenario

### Integration Tests (With DB)
1. **Full subscription lifecycle**
   - Create subscription with specific date
   - Process multiple renewals
   - Verify preservedBillingDay persistence

### Test Data Patterns

**Leap Year Dates:**
- 2024: Leap year (Feb 29th exists)
- 2025-2027: Non-leap years (Feb 28th max)
- 2028: Next leap year (Feb 29th returns)

**Month Transition Scenarios:**
- Jan→Feb: 31→28/29 (biggest adjustment)
- Mar→Apr: 31→30 (common adjustment)
- Apr→May: 30→31 (back to preserved day)
- Feb→Mar: 28/29→31 (leap year complexity)

## Expected Behavior Summary

**Key Principle:** Always attempt to bill on `preservedBillingDay`, only adjust when mathematically impossible.

**Algorithm:**
1. Add N months/years to current date
2. Attempt to set day to `preservedBillingDay`
3. If target month doesn't have that day, use last day of month
4. **Preserve original day for future calculations**

**Critical:** Never update `preservedBillingDay` - it remains constant throughout subscription lifecycle.