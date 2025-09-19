/**
 * Test utilities for date operations and billing logic testing
 */

/**
 * Create dates for specific scenarios in our test matrix
 */
export const createTestDate = (year: number, month: number, day: number): Date => {
  // Month is 0-indexed in JavaScript Date constructor
  return new Date(year, month - 1, day);
};

/**
 * Leap year test dates for comprehensive testing
 */
export const LEAP_YEAR_DATES = {
  // 2024 is a leap year
  leapYear: 2024,
  nonLeapYear: 2025,
  nextLeapYear: 2028,

  // Critical Feb 29th scenarios
  feb29LeapYear: createTestDate(2024, 2, 29),
  feb28NonLeapYear: createTestDate(2025, 2, 28),
  feb29NextLeapYear: createTestDate(2028, 2, 29),
} as const;

/**
 * End-of-month test scenarios from our test matrix
 */
export const END_OF_MONTH_SCENARIOS = {
  // 31st day scenarios
  jan31: createTestDate(2024, 1, 31),
  mar31: createTestDate(2024, 3, 31),
  may31: createTestDate(2024, 5, 31),
  aug31: createTestDate(2024, 8, 31),

  // 30th day scenarios
  jan30: createTestDate(2024, 1, 30),
  apr30: createTestDate(2024, 4, 30),
  jun30: createTestDate(2024, 6, 30),

  // February edge cases
  feb28_2024: createTestDate(2024, 2, 28), // Leap year
  feb29_2024: createTestDate(2024, 2, 29), // Leap year
  feb28_2025: createTestDate(2025, 2, 28), // Non-leap year

  // Regular mid-month dates for control
  jan15: createTestDate(2024, 1, 15),
  feb15: createTestDate(2024, 2, 15),
  mar15: createTestDate(2024, 3, 15),
} as const;

/**
 * Billing cycle test data
 */
export const BILLING_CYCLES = {
  monthly: { value: 1, unit: 'month' as const },
  biMonthly: { value: 2, unit: 'month' as const },
  quarterly: { value: 3, unit: 'month' as const },
  yearly: { value: 1, unit: 'year' as const },
  weekly: { value: 7, unit: 'day' as const },
  daily: { value: 1, unit: 'day' as const },
} as const;

/**
 * Expected behavior patterns from our test matrix
 */
export const EXPECTED_PATTERNS = {
  // Jan 31st monthly renewals
  jan31_monthly: [
    { from: END_OF_MONTH_SCENARIOS.jan31, expected: createTestDate(2024, 2, 29), preservedDay: 31 }, // Feb 29 (leap year)
    { from: createTestDate(2024, 2, 29), expected: createTestDate(2024, 3, 31), preservedDay: 31 }, // Back to 31st
    { from: createTestDate(2024, 3, 31), expected: createTestDate(2024, 4, 30), preservedDay: 31 }, // Apr 30 (adjusted)
    { from: createTestDate(2024, 4, 30), expected: createTestDate(2024, 5, 31), preservedDay: 31 }, // Back to 31st
  ],

  // Feb 29th yearly renewals (leap year nightmare)
  feb29_yearly: [
    { from: LEAP_YEAR_DATES.feb29LeapYear, expected: createTestDate(2025, 2, 28), preservedDay: 29 }, // 2025 non-leap
    { from: createTestDate(2025, 2, 28), expected: createTestDate(2026, 2, 28), preservedDay: 29 }, // 2026 non-leap
    { from: createTestDate(2026, 2, 28), expected: createTestDate(2027, 2, 28), preservedDay: 29 }, // 2027 non-leap
    { from: createTestDate(2027, 2, 28), expected: createTestDate(2028, 2, 29), preservedDay: 29 }, // 2028 leap - back to 29th!
  ],

  // Regular monthly (no adjustment needed)
  jan15_monthly: [
    { from: END_OF_MONTH_SCENARIOS.jan15, expected: createTestDate(2024, 2, 15), preservedDay: 15 },
    { from: createTestDate(2024, 2, 15), expected: createTestDate(2024, 3, 15), preservedDay: 15 },
    { from: createTestDate(2024, 3, 15), expected: createTestDate(2024, 4, 15), preservedDay: 15 },
  ],
} as const;

/**
 * Helper to format dates for test descriptions
 */
export const formatTestDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Helper to create test descriptions from patterns
 */
export const createTestDescription = (
  fromDate: Date,
  expectedDate: Date,
  preservedDay: number,
  cycle: string = 'monthly'
): string => {
  return `${formatTestDate(fromDate)} → ${formatTestDate(expectedDate)} (preserved day: ${preservedDay}, ${cycle})`;
};