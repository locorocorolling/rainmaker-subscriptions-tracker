import { SubscriptionModel, ISubscriptionDocument } from '../models/Subscription';
import { CreateSubscriptionInput, UpdateSubscriptionInput, SubscriptionStatus } from '../../../shared/types/subscription';
import { addMonths, addYears, addDays, isLastDayOfMonth, setDate, getDaysInMonth, isLeapYear } from 'date-fns';

export class SubscriptionService {

  /**
   * Create a new subscription with calculated renewal date and preserved billing day
   */
  static async createSubscription(
    userId: string,
    input: CreateSubscriptionInput
  ): Promise<ISubscriptionDocument> {
    // Handle both field names during transition (firstBillingDate is new, nextRenewal is legacy)
    const billingDateValue = input.firstBillingDate || (input as any).nextRenewal;
    if (!billingDateValue) {
      throw new Error('firstBillingDate or nextRenewal is required');
    }

    const firstBillingDate = new Date(billingDateValue);

    // Extract the preserved billing day from the first billing date
    const preservedBillingDay = firstBillingDate.getDate();

    // Calculate next renewal date using the new preserved billing day logic
    const nextRenewal = this.calculateNextRenewalWithPreservedDay(
      firstBillingDate,
      input.billingCycle,
      preservedBillingDay
    );

    const subscriptionData = {
      ...input,
      nextRenewal,
      preservedBillingDay
    };

    const subscription = new SubscriptionModel({
      userId,
      ...subscriptionData
    });

    return subscription.save();
  }

  /**
   * Get all subscriptions for a user with optional filtering
   */
  static async getUserSubscriptions(
    userId: string,
    filters?: {
      status?: SubscriptionStatus;
      category?: string;
      search?: string;
    }
  ): Promise<ISubscriptionDocument[]> {
    const query: any = { userId };

    if (filters?.status) query.status = filters.status;
    if (filters?.category) query.category = filters.category;
    if (filters?.search) {
      query.$or = [
        { service: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { category: { $regex: filters.search, $options: 'i' } }
      ];
    }

    return SubscriptionModel.find(query)
      .sort({ nextRenewal: 1 })
      .exec();
  }

  /**
   * Get a single subscription by ID
   */
  static async getSubscriptionById(
    id: string,
    userId: string
  ): Promise<ISubscriptionDocument | null> {
    return SubscriptionModel.findOne({ _id: id, userId }).exec();
  }

  /**
   * Update a subscription
   */
  static async updateSubscription(
    id: string,
    userId: string,
    updates: UpdateSubscriptionInput
  ): Promise<ISubscriptionDocument | null> {
    // If billing cycle or dates are changing, recalculate next renewal and preserved billing day
    if (updates.billingCycle || updates.firstBillingDate) {
      const subscription = await this.getSubscriptionById(id, userId);
      if (!subscription) return null;

      const billingCycle = updates.billingCycle || subscription.billingCycle;
      const firstBillingDate = new Date(updates.firstBillingDate || subscription.firstBillingDate);

      // Update preserved billing day if first billing date changed
      let preservedBillingDay = subscription.preservedBillingDay;
      if (updates.firstBillingDate) {
        preservedBillingDay = firstBillingDate.getDate();
        updates.preservedBillingDay = preservedBillingDay;
      }

      // Use existing preserved billing day if available, otherwise derive from current date
      const finalPreservedBillingDay = preservedBillingDay || firstBillingDate.getDate();

      updates.nextRenewal = this.calculateNextRenewalWithPreservedDay(
        firstBillingDate,
        billingCycle,
        finalPreservedBillingDay
      );
    }

    return SubscriptionModel.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Cancel a subscription (set status to cancelled)
   */
  static async cancelSubscription(
    id: string,
    userId: string
  ): Promise<ISubscriptionDocument | null> {
    return SubscriptionModel.findOneAndUpdate(
      { _id: id, userId },
      { status: 'cancelled' },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Get upcoming renewals for a user
   */
  static async getUpcomingRenewals(
    userId: string,
    daysAhead: number = 7
  ): Promise<ISubscriptionDocument[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    return SubscriptionModel.find({
      userId,
      status: 'active',
      nextRenewal: { $gte: startDate, $lte: endDate }
    }).sort({ nextRenewal: 1 }).exec();
  }

  /**
   * Get subscription statistics for a user
   */
  static async getSubscriptionStats(userId: string) {
    const subscriptions = await this.getUserSubscriptions(userId);

    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      paused: subscriptions.filter(s => s.status === 'paused').length,
      monthlyTotal: 0,
      yearlyTotal: 0,
      upcomingRenewals: (await this.getUpcomingRenewals(userId, 30)).length
    };

    // Calculate totals based on billing cycle
    subscriptions.forEach(sub => {
      if (sub.status === 'active') {
        if (sub.billingCycle.unit === 'month') {
          stats.monthlyTotal += sub.cost.amount;
          stats.yearlyTotal += sub.cost.amount * 12;
        } else if (sub.billingCycle.unit === 'year') {
          stats.yearlyTotal += sub.cost.amount;
          stats.monthlyTotal += sub.cost.amount / 12;
        } else if (sub.billingCycle.unit === 'day') {
          // Approximate monthly cost for daily subscriptions
          stats.monthlyTotal += sub.cost.amount * 30;
          stats.yearlyTotal += sub.cost.amount * 365;
        }
      }
    });

    return stats;
  }

  /**
   * Process subscription renewals (would be called by a cron job)
   */
  static async processRenewals(): Promise<{ renewed: number; failed: number }> {
    const now = new Date();
    const dueSubscriptions = await SubscriptionModel.find({
      status: 'active',
      nextRenewal: { $lte: now }
    });

    let renewed = 0;
    let failed = 0;

    for (const subscription of dueSubscriptions) {
      try {
        // Use preserved billing day if available, fallback to old logic for backward compatibility
        const preservedBillingDay = subscription.preservedBillingDay || subscription.nextRenewal.getDate();

        // Calculate next renewal date using preserved billing day logic
        const nextRenewal = this.calculateNextRenewalWithPreservedDay(
          subscription.nextRenewal,
          subscription.billingCycle,
          preservedBillingDay
        );

        // Update subscription
        await SubscriptionModel.findOneAndUpdate(
          { _id: subscription.id, userId: subscription.userId },
          {
            lastRenewal: subscription.nextRenewal,
            nextRenewal,
            // Ensure preservedBillingDay is set if it wasn't before
            preservedBillingDay
          },
          { new: true, runValidators: true }
        ).exec();

        renewed++;
      } catch (error) {
        console.error(`Failed to renew subscription ${subscription.id}:`, error);
        failed++;
      }
    }

    return { renewed, failed };
  }

  /**
   * Calculate next renewal date with preserved billing day logic
   * Implements the Monthly Anniversary Date system where the original billing day is preserved
   */
  static calculateNextRenewalWithPreservedDay(
    fromDate: Date,
    billingCycle: { value: number; unit: 'day' | 'month' | 'year' },
    preservedBillingDay: number
  ): Date {
    // Validate preserved billing day
    if (preservedBillingDay < 1 || preservedBillingDay > 31) {
      throw new Error('preservedBillingDay must be between 1 and 31');
    }

    // Validate billing cycle unit
    if (!['day', 'month', 'year'].includes(billingCycle.unit)) {
      throw new Error(`Invalid billing cycle unit: ${billingCycle.unit}`);
    }

    const date = new Date(fromDate);

    switch (billingCycle.unit) {
      case 'day':
        // Daily billing ignores preserved day logic - just add days
        return addDays(date, billingCycle.value);

      case 'month':
        return this.calculateMonthlyRenewalWithPreservedDay(date, billingCycle.value, preservedBillingDay);

      case 'year':
        return this.calculateYearlyRenewalWithPreservedDay(date, billingCycle.value, preservedBillingDay);

      default:
        throw new Error(`Invalid billing cycle unit: ${billingCycle.unit}`);
    }
  }

  /**
   * Calculate monthly renewal with preserved day logic
   */
  private static calculateMonthlyRenewalWithPreservedDay(
    fromDate: Date,
    monthsToAdd: number,
    preservedBillingDay: number
  ): Date {
    // Add the months first
    const targetDate = addMonths(fromDate, monthsToAdd);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth(); // 0-indexed

    // Get the maximum days in the target month
    const daysInTargetMonth = getDaysInMonth(targetDate);

    // If preserved day exists in target month, use it
    if (preservedBillingDay <= daysInTargetMonth) {
      return new Date(targetYear, targetMonth, preservedBillingDay);
    }

    // Otherwise, use the last day of the target month (adjustment)
    return new Date(targetYear, targetMonth, daysInTargetMonth);
  }

  /**
   * Calculate yearly renewal with preserved day logic
   * Handles the Feb 29th leap year nightmare
   */
  private static calculateYearlyRenewalWithPreservedDay(
    fromDate: Date,
    yearsToAdd: number,
    preservedBillingDay: number
  ): Date {
    // Add the years first
    const targetDate = addYears(fromDate, yearsToAdd);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth(); // 0-indexed

    // Handle February leap year special case
    if (targetMonth === 1 && preservedBillingDay === 29) { // February (0-indexed)
      // Check if target year is a leap year
      if (isLeapYear(targetDate)) {
        // Leap year - we can use Feb 29th
        return new Date(targetYear, 1, 29);
      } else {
        // Non-leap year - adjust to Feb 28th
        return new Date(targetYear, 1, 28);
      }
    }

    // For all other months, use the same logic as monthly
    const daysInTargetMonth = getDaysInMonth(targetDate);

    // If preserved day exists in target month, use it
    if (preservedBillingDay <= daysInTargetMonth) {
      return new Date(targetYear, targetMonth, preservedBillingDay);
    }

    // Otherwise, use the last day of the target month
    return new Date(targetYear, targetMonth, daysInTargetMonth);
  }

  /**
   * Calculate next renewal date based on billing cycle (backward compatibility)
   */
  private static calculateNextRenewal(
    fromDate: Date,
    billingCycle: { value: number; unit: 'day' | 'month' | 'year' }
  ): Date {
    const date = new Date(fromDate);

    switch (billingCycle.unit) {
      case 'day':
        return addDays(date, billingCycle.value);

      case 'month':
        const newDate = addMonths(date, billingCycle.value);

        // Handle end-of-month edge cases
        if (isLastDayOfMonth(date)) {
          return setDate(newDate, 0); // Last day of target month
        }

        return newDate;

      case 'year':
        return addYears(date, billingCycle.value);

      default:
        throw new Error(`Invalid billing cycle unit: ${billingCycle.unit}`);
    }
  }

  /**
   * Search subscriptions across multiple fields
   */
  static async searchSubscriptions(
    userId: string,
    query: string,
    options?: {
      status?: SubscriptionStatus;
      category?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ subscriptions: ISubscriptionDocument[]; total: number }> {
    const searchQuery: any = {
      userId,
      $or: [
        { service: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    };

    if (options?.status) searchQuery.status = options.status;
    if (options?.category) searchQuery.category = options.category;

    const limit = options?.limit || 10;
    const offset = options?.offset || 0;

    const [subscriptions, total] = await Promise.all([
      SubscriptionModel.find(searchQuery)
        .sort({ nextRenewal: 1 })
        .limit(limit)
        .skip(offset)
        .exec(),
      SubscriptionModel.countDocuments(searchQuery)
    ]);

    return { subscriptions, total };
  }
}