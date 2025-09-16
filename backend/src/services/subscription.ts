import { SubscriptionModel, ISubscriptionDocument } from '../models/Subscription';
import { CreateSubscriptionInput, UpdateSubscriptionInput, SubscriptionStatus } from '../../../shared/types/subscription';
import { addMonths, addYears, addDays, isLastDayOfMonth, setDate } from 'date-fns';

export class SubscriptionService {

  /**
   * Create a new subscription with calculated renewal date
   */
  static async createSubscription(
    userId: string,
    input: CreateSubscriptionInput
  ): Promise<ISubscriptionDocument> {
    // Calculate next renewal date based on billing cycle
    const nextRenewal = this.calculateNextRenewal(
      input.firstBillingDate,
      input.billingCycle
    );

    const subscriptionData = {
      ...input,
      nextRenewal
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
    // If billing cycle or dates are changing, recalculate next renewal
    if (updates.billingCycle || updates.firstBillingDate) {
      const subscription = await this.getSubscriptionById(id, userId);
      if (!subscription) return null;

      const billingCycle = updates.billingCycle || subscription.billingCycle;
      const firstBillingDate = updates.firstBillingDate || subscription.firstBillingDate;

      updates.nextRenewal = this.calculateNextRenewal(firstBillingDate, billingCycle);
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
        // Calculate next renewal date
        const nextRenewal = this.calculateNextRenewal(
          subscription.nextRenewal,
          subscription.billingCycle
        );

        // Update subscription
        await SubscriptionModel.findOneAndUpdate(
          { _id: subscription.id, userId: subscription.userId },
          {
            lastRenewal: subscription.nextRenewal,
            nextRenewal
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
   * Calculate next renewal date based on billing cycle
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