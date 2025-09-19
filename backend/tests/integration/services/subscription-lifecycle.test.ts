/**
 * Subscription Lifecycle Integration Tests
 *
 * Tests the complete subscription lifecycle with real database operations:
 * - Subscription creation with preservedBillingDay
 * - Multiple renewal cycles preserving the billing day
 * - End-of-month edge cases across months
 * - Feb 29th leap year scenarios
 *
 * These tests require MongoDB and validate the entire flow from creation to renewals.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SubscriptionService } from '../../../src/services/subscription.js';
import { SubscriptionModel } from '../../../src/models/Subscription.js';
import { createTestDate, LEAP_YEAR_DATES, END_OF_MONTH_SCENARIOS } from '../../helpers/dateUtils.js';

let mongoServer: MongoMemoryServer;

describe('Subscription Lifecycle Integration Tests', () => {
  beforeAll(async () => {
    try {
      // Start in-memory MongoDB
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      // Connect to the in-memory database
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB Memory Server for integration tests');
    } catch (error) {
      console.error('Failed to setup MongoDB Memory Server:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await mongoServer.stop();
      console.log('Cleaned up MongoDB Memory Server');
    } catch (error) {
      console.error('Failed to cleanup MongoDB Memory Server:', error);
    }
  });

  beforeEach(async () => {
    // Clean up before each test
    await SubscriptionModel.deleteMany({});
  });

  describe('End-of-Month Subscription Lifecycle', () => {
    it('should handle Jan 31st subscription through full cycle (31st -> Feb 28th -> 31st -> 30th)', async () => {
      const userId = 'test-user-jan31';

      // Create subscription on Jan 31st, 2024
      const jan31 = createTestDate(2024, 1, 31);
      const subscription = await SubscriptionService.createSubscription(userId, {
        service: 'Netflix',
        cost: { amount: 1599, currency: 'USD' },
        billingCycle: { value: 1, unit: 'month' },
        firstBillingDate: jan31
      });

      // Verify initial state
      expect(subscription.preservedBillingDay).toBe(31);
      expect(subscription.firstBillingDate.getDate()).toBe(31);
      expect(subscription.nextRenewal.getDate()).toBe(29); // Feb 29th 2024 (leap year)

      // Simulate Feb renewal processing
      subscription.nextRenewal = createTestDate(2024, 2, 29);
      await subscription.save();

      // Process renewal (Feb -> Mar)
      const renewalResult = await SubscriptionService.processRenewals();
      expect(renewalResult.renewed).toBe(1);
      expect(renewalResult.failed).toBe(0);

      // Fetch updated subscription
      const updatedSub = await SubscriptionModel.findById(subscription._id);
      expect(updatedSub).toBeTruthy();
      expect(updatedSub!.preservedBillingDay).toBe(31); // Preserved
      expect(updatedSub!.nextRenewal.getDate()).toBe(31); // Back to 31st in March

      // Simulate Mar renewal processing (Mar -> Apr)
      updatedSub!.nextRenewal = createTestDate(2024, 3, 31);
      await updatedSub!.save();

      await SubscriptionService.processRenewals();
      const aprSub = await SubscriptionModel.findById(subscription._id);
      expect(aprSub!.preservedBillingDay).toBe(31); // Still preserved
      expect(aprSub!.nextRenewal.getDate()).toBe(30); // April has only 30 days
    });

    it('should handle day 30 subscription correctly', async () => {
      const userId = 'test-user-day30';

      // Create subscription on Jan 30th
      const jan30 = createTestDate(2024, 1, 30);
      const subscription = await SubscriptionService.createSubscription(userId, {
        service: 'Spotify',
        cost: { amount: 999, currency: 'USD' },
        billingCycle: { value: 1, unit: 'month' },
        firstBillingDate: jan30
      });

      expect(subscription.preservedBillingDay).toBe(30);
      expect(subscription.nextRenewal.getDate()).toBe(29); // Feb 29th 2024 (adjusted)

      // Process Feb -> Mar renewal
      subscription.nextRenewal = createTestDate(2024, 2, 29);
      await subscription.save();

      await SubscriptionService.processRenewals();
      const marSub = await SubscriptionModel.findById(subscription._id);

      expect(marSub!.preservedBillingDay).toBe(30); // Still preserved
      expect(marSub!.nextRenewal.getDate()).toBe(30); // Back to 30th in March
    });
  });

  describe('Feb 29th Leap Year Lifecycle', () => {
    it('should handle Feb 29th monthly subscription correctly', async () => {
      const userId = 'test-user-feb29';

      // Create subscription on Feb 29th, 2024 (leap year)
      const feb29 = LEAP_YEAR_DATES.feb29LeapYear;
      const subscription = await SubscriptionService.createSubscription(userId, {
        service: 'Adobe Creative',
        cost: { amount: 5299, currency: 'USD' },
        billingCycle: { value: 1, unit: 'month' },
        firstBillingDate: feb29
      });

      expect(subscription.preservedBillingDay).toBe(29);
      expect(subscription.nextRenewal.getDate()).toBe(29); // Mar 29th works fine

      // Process multiple renewals
      let currentSub = subscription;
      const expectedDays = [29, 29, 29, 29]; // Mar, Apr, May, Jun - all should be 29th

      for (let i = 0; i < expectedDays.length; i++) {
        // Simulate time passing to renewal date
        currentSub.nextRenewal = createTestDate(2024, 3 + i, expectedDays[i]);
        await currentSub.save();

        await SubscriptionService.processRenewals();
        currentSub = (await SubscriptionModel.findById(subscription._id))!;

        expect(currentSub.preservedBillingDay).toBe(29);
        expect(currentSub.nextRenewal.getDate()).toBe(expectedDays[i]);
      }
    });

    it('should handle Feb 29th yearly subscription across leap year cycle', async () => {
      const userId = 'test-user-feb29-yearly';

      // Create subscription on Feb 29th, 2024 (leap year)
      const feb29_2024 = LEAP_YEAR_DATES.feb29LeapYear;
      const subscription = await SubscriptionService.createSubscription(userId, {
        service: 'Annual Software License',
        cost: { amount: 99900, currency: 'USD' },
        billingCycle: { value: 1, unit: 'year' },
        firstBillingDate: feb29_2024
      });

      expect(subscription.preservedBillingDay).toBe(29);
      expect(subscription.nextRenewal.getFullYear()).toBe(2025);
      expect(subscription.nextRenewal.getMonth()).toBe(1); // February (0-indexed)
      expect(subscription.nextRenewal.getDate()).toBe(28); // Feb 28th 2025 (non-leap)

      // Process 2025 renewal (non-leap year)
      subscription.nextRenewal = createTestDate(2025, 2, 28);
      await subscription.save();

      await SubscriptionService.processRenewals();
      let renewedSub = (await SubscriptionModel.findById(subscription._id))!;

      expect(renewedSub.preservedBillingDay).toBe(29); // Still preserved!
      expect(renewedSub.nextRenewal.getFullYear()).toBe(2026);
      expect(renewedSub.nextRenewal.getDate()).toBe(28); // Feb 28th 2026 (non-leap)

      // Process 2026 renewal (non-leap year)
      renewedSub.nextRenewal = createTestDate(2026, 2, 28);
      await renewedSub.save();

      await SubscriptionService.processRenewals();
      renewedSub = (await SubscriptionModel.findById(subscription._id))!;

      expect(renewedSub.preservedBillingDay).toBe(29); // Still preserved!
      expect(renewedSub.nextRenewal.getFullYear()).toBe(2027);
      expect(renewedSub.nextRenewal.getDate()).toBe(28); // Feb 28th 2027 (non-leap)

      // Skip to 2028 (next leap year)
      renewedSub.nextRenewal = createTestDate(2028, 2, 28);
      await renewedSub.save();

      await SubscriptionService.processRenewals();
      const leapYearSub = (await SubscriptionModel.findById(subscription._id))!;

      expect(leapYearSub.preservedBillingDay).toBe(29); // Still preserved!
      expect(leapYearSub.nextRenewal.getFullYear()).toBe(2029);
      expect(leapYearSub.nextRenewal.getDate()).toBe(28); // Back to Feb 28th (non-leap)
    });
  });

  describe('Subscription Update Lifecycle', () => {
    it('should update preservedBillingDay when firstBillingDate changes', async () => {
      const userId = 'test-user-update';

      // Create subscription on 15th
      const jan15 = createTestDate(2024, 1, 15);
      const subscription = await SubscriptionService.createSubscription(userId, {
        service: 'Test Service',
        cost: { amount: 1000, currency: 'USD' },
        billingCycle: { value: 1, unit: 'month' },
        firstBillingDate: jan15
      });

      expect(subscription.preservedBillingDay).toBe(15);

      // Update to 31st
      const jan31 = createTestDate(2024, 1, 31);
      const updatedSub = await SubscriptionService.updateSubscription(
        subscription._id.toString(),
        userId,
        { firstBillingDate: jan31 }
      );

      expect(updatedSub).toBeTruthy();
      expect(updatedSub!.preservedBillingDay).toBe(31); // Updated
      expect(updatedSub!.nextRenewal.getDate()).toBe(29); // Feb 29th 2024
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle subscriptions without preservedBillingDay in renewal processing', async () => {
      const userId = 'test-user-legacy';

      // Create subscription manually without preservedBillingDay (simulating old data)
      const jan31 = createTestDate(2024, 1, 31);
      const legacySub = new SubscriptionModel({
        userId,
        service: 'Legacy Service',
        cost: { amount: 1500, currency: 'USD' },
        billingCycle: { value: 1, unit: 'month' },
        firstBillingDate: jan31,
        nextRenewal: createTestDate(2024, 2, 29),
        status: 'active'
        // Note: no preservedBillingDay set
      });
      await legacySub.save();

      expect(legacySub.preservedBillingDay).toBeUndefined();

      // Simulate renewal processing - should set preservedBillingDay
      legacySub.nextRenewal = createTestDate(2024, 2, 29);
      await legacySub.save();

      await SubscriptionService.processRenewals();
      const renewedSub = await SubscriptionModel.findById(legacySub._id);

      expect(renewedSub!.preservedBillingDay).toBe(29); // Set from nextRenewal date
      expect(renewedSub!.nextRenewal.getDate()).toBe(31); // March 31st
    });
  });

  describe('Daily Billing (No Preserved Day Logic)', () => {
    it('should handle daily billing without preserved day complexity', async () => {
      const userId = 'test-user-daily';

      const jan15 = createTestDate(2024, 1, 15);
      const subscription = await SubscriptionService.createSubscription(userId, {
        service: 'Daily Service',
        cost: { amount: 299, currency: 'USD' },
        billingCycle: { value: 7, unit: 'day' }, // Weekly
        firstBillingDate: jan15
      });

      expect(subscription.preservedBillingDay).toBe(15); // Set but not used for daily
      expect(subscription.nextRenewal.getDate()).toBe(22); // 7 days later

      // Process renewal
      subscription.nextRenewal = createTestDate(2024, 1, 22);
      await subscription.save();

      await SubscriptionService.processRenewals();
      const renewedSub = await SubscriptionModel.findById(subscription._id);

      expect(renewedSub!.nextRenewal.getDate()).toBe(29); // Another 7 days
    });
  });
});