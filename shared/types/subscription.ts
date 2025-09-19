/**
 * Core Subscription types for the Subscription Tracker
 * Handles edge cases: N-day billing cycles, end-of-month subscriptions
 */

// Core types for billing cycles
export type BillingUnit = 'day' | 'month' | 'year';

export interface BillingCycle {
  value: number; // Every N units (1-365 for days, 1-12 for months, 1-5 for years)
  unit: BillingUnit;
}

// Money representation (stored in minor units to avoid floating point issues)
export interface Money {
  amount: number; // Amount in minor units (cents for USD)
  currency: string; // ISO 4217 currency code
}

// Subscription status
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';

// End-of-month handling strategy
export type EndOfMonthStrategy = 'last_day_of_month'; // Jan 31 → Feb 28/29 → Mar 31

// Core subscription interface
export interface Subscription {
  id: string;
  userId: string;
  
  // Service details
  service: string;
  description?: string;
  category?: string;
  
  // Billing information
  cost: Money;
  billingCycle: BillingCycle;
  
  // Date handling
  firstBillingDate: Date; // Original subscription start date
  nextRenewal: Date;      // Next calculated billing date
  lastRenewal?: Date;     // Last successful billing date
  
  // End-of-month edge case handling
  endOfMonthStrategy: EndOfMonthStrategy;
  preservedBillingDay?: number; // Day of month to preserve (1-31)
  
  // Status and metadata
  status: SubscriptionStatus;
  metadata?: {
    color?: string;   // UI color hex code
    logoUrl?: string; // Service logo
    url?: string;     // Service website
    notes?: string;   // User notes
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Create subscription input (without computed fields)
export interface CreateSubscriptionInput {
  service: string;
  description?: string;
  category?: string;
  cost: Money;
  billingCycle: BillingCycle;
  firstBillingDate: Date;
  endOfMonthStrategy?: EndOfMonthStrategy; // Default: 'last_day_of_month'
  metadata?: Subscription['metadata'];
}

// Update subscription input (partial updates)
export interface UpdateSubscriptionInput {
  service?: string;
  description?: string;
  category?: string;
  cost?: Money;
  billingCycle?: BillingCycle;
  firstBillingDate?: Date;
  nextRenewal?: Date;
  endOfMonthStrategy?: EndOfMonthStrategy;
  preservedBillingDay?: number;
  status?: SubscriptionStatus;
  metadata?: Subscription['metadata'];
}

// Subscription with computed analytics
export interface SubscriptionWithAnalytics extends Subscription {
  daysUntilRenewal: number;
  monthlyEquivalentCost: number; // Normalized to monthly cost for comparison
  yearlyProjectedCost: number;   // Projected annual cost
}

// Date calculation utility types
export interface DateCalculationResult {
  nextRenewal: Date;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  adjustmentMade: boolean; // True if date was adjusted due to end-of-month
  adjustmentReason?: string; // Explanation of adjustment
}

// Export utility type guards
export const isBillingUnit = (unit: string): unit is BillingUnit => {
  return ['day', 'month', 'year'].includes(unit);
};

export const isSubscriptionStatus = (status: string): status is SubscriptionStatus => {
  return ['active', 'paused', 'cancelled', 'expired'].includes(status);
};

export const isEndOfMonthStrategy = (strategy: string): strategy is EndOfMonthStrategy => {
  return strategy === 'last_day_of_month';
};
