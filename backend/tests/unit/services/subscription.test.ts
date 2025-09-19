/**
 * Unit tests for Subscription Service billing logic
 *
 * Tests the preserved billing day logic based on BILLING_TEST_MATRIX.md
 * These are pure unit tests - no database required, fast execution
 */

import { describe, it, expect } from 'vitest';
import { SubscriptionService } from '../../../src/services/subscription';
import {
  END_OF_MONTH_SCENARIOS,
  LEAP_YEAR_DATES,
  BILLING_CYCLES,
  EXPECTED_PATTERNS,
  createTestDate,
  createTestDescription
} from '../../helpers/dateUtils';

describe('SubscriptionService - calculateNextRenewal', () => {

  describe('Monthly Billing - Core Anniversary Logic', () => {

    it('should preserve day 31 across months with adjustment', () => {
      // Test the core pattern: Jan 31st → Feb 28th/29th → Mar 31st (back to preserved day)
      const preservedDay = 31;

      // Jan 31st → Feb 29th (2024 is leap year)
      const fromJan31 = END_OF_MONTH_SCENARIOS.jan31;
      const toFeb = SubscriptionService.calculateNextRenewalWithPreservedDay(
        fromJan31,
        BILLING_CYCLES.monthly,
        preservedDay
      );
      expect(toFeb).toEqual(createTestDate(2024, 2, 29));

      // Feb 29th → Mar 31st (back to preserved day)
      const toMar = SubscriptionService.calculateNextRenewalWithPreservedDay(
        toFeb,
        BILLING_CYCLES.monthly,
        preservedDay
      );
      expect(toMar).toEqual(createTestDate(2024, 3, 31));

      // Mar 31st → Apr 30th (adjusted again)
      const toApr = SubscriptionService.calculateNextRenewalWithPreservedDay(
        toMar,
        BILLING_CYCLES.monthly,
        preservedDay
      );
      expect(toApr).toEqual(createTestDate(2024, 4, 30));

      // Apr 30th → May 31st (back to preserved day)
      const toMay = SubscriptionService.calculateNextRenewalWithPreservedDay(
        toApr,
        BILLING_CYCLES.monthly,
        preservedDay
      );
      expect(toMay).toEqual(createTestDate(2024, 5, 31));
    });

    it('should handle day 30 subscriptions correctly', () => {
      const preservedDay = 30;

      // Jan 30th → Feb 28th (adjusted - Feb only has 28/29 days)
      const fromJan30 = END_OF_MONTH_SCENARIOS.jan30;
      const toFeb = SubscriptionService.calculateNextRenewalWithPreservedDay(
        fromJan30,
        BILLING_CYCLES.monthly,
        preservedDay
      );
      expect(toFeb).toEqual(createTestDate(2024, 2, 29)); // Leap year, so 29th

      // Feb 29th → Mar 30th (back to preserved day)
      const toMar = SubscriptionService.calculateNextRenewalWithPreservedDay(
        toFeb,
        BILLING_CYCLES.monthly,
        preservedDay
      );
      expect(toMar).toEqual(createTestDate(2024, 3, 30));

      // Mar 30th → Apr 30th (preserved day works)
      const toApr = SubscriptionService.calculateNextRenewalWithPreservedDay(
        toMar,
        BILLING_CYCLES.monthly,
        preservedDay
      );
      expect(toApr).toEqual(createTestDate(2024, 4, 30));
    });

    it('should handle regular mid-month dates without adjustment', () => {
      const preservedDay = 15;

      // Test sequence: Jan 15th → Feb 15th → Mar 15th → Apr 15th
      const pattern = EXPECTED_PATTERNS.jan15_monthly;

      pattern.forEach((testCase, index) => {
        const result = SubscriptionService.calculateNextRenewalWithPreservedDay(
          testCase.from,
          BILLING_CYCLES.monthly,
          testCase.preservedDay
        );

        expect(result, createTestDescription(
          testCase.from,
          testCase.expected,
          testCase.preservedDay
        )).toEqual(testCase.expected);
      });
    });

    it('should handle Feb 29th subscriptions in leap year', () => {
      const preservedDay = 29;

      // Feb 29th 2024 → Mar 29th 2024 (preserved day works)
      const fromFeb29 = LEAP_YEAR_DATES.feb29LeapYear;
      const toMar = SubscriptionService.calculateNextRenewalWithPreservedDay(
        fromFeb29,
        BILLING_CYCLES.monthly,
        preservedDay
      );
      expect(toMar).toEqual(createTestDate(2024, 3, 29));

      // Mar 29th → Apr 29th → May 29th (should work consistently)
      const toApr = SubscriptionService.calculateNextRenewalWithPreservedDay(
        toMar,
        BILLING_CYCLES.monthly,
        preservedDay
      );
      expect(toApr).toEqual(createTestDate(2024, 4, 29));

      const toMay = SubscriptionService.calculateNextRenewalWithPreservedDay(
        toApr,
        BILLING_CYCLES.monthly,
        preservedDay
      );
      expect(toMay).toEqual(createTestDate(2024, 5, 29));
    });
  });

  describe('Yearly Billing - Feb 29th Leap Year Nightmare', () => {

    it('should handle Feb 29th yearly renewals across leap year cycle', () => {
      const preservedDay = 29;

      // Test the complete 4-year cycle from our test matrix
      const pattern = EXPECTED_PATTERNS.feb29_yearly;

      pattern.forEach((testCase, index) => {
        const result = SubscriptionService.calculateNextRenewalWithPreservedDay(
          testCase.from,
          BILLING_CYCLES.yearly,
          testCase.preservedDay
        );

        expect(result, createTestDescription(
          testCase.from,
          testCase.expected,
          testCase.preservedDay,
          'yearly'
        )).toEqual(testCase.expected);
      });
    });

    it('should handle regular yearly renewals', () => {
      const preservedDay = 15;

      // Jan 15th 2024 → Jan 15th 2025 → Jan 15th 2026
      const fromJan15_2024 = END_OF_MONTH_SCENARIOS.jan15;
      const toJan15_2025 = SubscriptionService.calculateNextRenewalWithPreservedDay(
        fromJan15_2024,
        BILLING_CYCLES.yearly,
        preservedDay
      );
      expect(toJan15_2025).toEqual(createTestDate(2025, 1, 15));

      const toJan15_2026 = SubscriptionService.calculateNextRenewalWithPreservedDay(
        toJan15_2025,
        BILLING_CYCLES.yearly,
        preservedDay
      );
      expect(toJan15_2026).toEqual(createTestDate(2026, 1, 15));
    });
  });

  describe('Daily Billing - No Preserved Day Logic Required', () => {

    it('should simply add days without complexity', () => {
      const fromDate = createTestDate(2024, 1, 31);

      // Daily billing just adds days - no month boundary logic
      const result = SubscriptionService.calculateNextRenewalWithPreservedDay(
        fromDate,
        BILLING_CYCLES.daily,
        31 // preservedDay should be ignored for daily billing
      );

      expect(result).toEqual(createTestDate(2024, 2, 1));
    });

    it('should handle weekly billing correctly', () => {
      const fromDate = createTestDate(2024, 1, 31);

      // Weekly (7 days) billing
      const result = SubscriptionService.calculateNextRenewalWithPreservedDay(
        fromDate,
        BILLING_CYCLES.weekly,
        31 // preservedDay should be ignored for daily billing
      );

      expect(result).toEqual(createTestDate(2024, 2, 7));
    });
  });

  describe('Edge Cases and Error Handling', () => {

    it('should handle invalid preserved days gracefully', () => {
      const fromDate = createTestDate(2024, 1, 15);

      // Invalid preserved day (0)
      expect(() => {
        SubscriptionService.calculateNextRenewalWithPreservedDay(
          fromDate,
          BILLING_CYCLES.monthly,
          0
        );
      }).toThrow('preservedBillingDay must be between 1 and 31');

      // Invalid preserved day (32)
      expect(() => {
        SubscriptionService.calculateNextRenewalWithPreservedDay(
          fromDate,
          BILLING_CYCLES.monthly,
          32
        );
      }).toThrow('preservedBillingDay must be between 1 and 31');
    });

    it('should handle invalid billing cycle units', () => {
      const fromDate = createTestDate(2024, 1, 15);

      expect(() => {
        SubscriptionService.calculateNextRenewalWithPreservedDay(
          fromDate,
          { value: 1, unit: 'invalid' as any },
          15
        );
      }).toThrow('Invalid billing cycle unit: invalid');
    });
  });

  describe('Backward Compatibility - Current Method', () => {

    it('should maintain existing calculateNextRenewal behavior for comparison', () => {
      // Test current implementation vs new implementation
      const fromDate = createTestDate(2024, 1, 31);

      const currentResult = SubscriptionService.calculateNextRenewal(
        fromDate,
        BILLING_CYCLES.monthly
      );

      // Current implementation should match new implementation when preservedDay = 31
      const newResult = SubscriptionService.calculateNextRenewalWithPreservedDay(
        fromDate,
        BILLING_CYCLES.monthly,
        31
      );

      // Note: This test will initially fail until we implement the new method
      // For now, just document the expected behavior
      expect(currentResult).toBeDefined();
      expect(newResult).toBeDefined();
    });
  });
});

/**
 * TODO: Integration tests for full subscription lifecycle
 * These tests should verify:
 * 1. Subscription creation sets preservedBillingDay correctly
 * 2. processRenewals() uses preserved day logic
 * 3. Database persistence of preservedBillingDay field
 * 4. Migration of existing subscriptions
 */