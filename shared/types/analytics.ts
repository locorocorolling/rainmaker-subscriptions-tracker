/**
 * Analytics and payment-related types for the Subscription Tracker
 */

// Payment history record
export interface PaymentRecord {
  id: string;
  subscriptionId: string;
  userId: string; // Denormalized for efficient queries
  
  // Payment details
  amount: number; // In minor units
  currency: string;
  paidOn: Date;
  
  // Billing period this payment covers
  billingPeriod: {
    start: Date;
    end: Date;
  };
  
  // Denormalized fields for analytics (avoid joins)
  service: string;
  category: string;
  year: number;  // For yearly aggregations
  month: number; // For monthly aggregations (1-12)
  
  createdAt: Date;
}

// Analytics types
export interface SpendingSummary {
  monthly: {
    current: number;      // Spent so far this month
    projected: number;    // Projected total for this month
    currency: string;
  };
  yearly: {
    spent: number;        // Spent so far this year
    projected: number;    // Projected total for this year  
    currency: string;
  };
  subscriptions: {
    active: number;
    paused: number;
    total: number;
  };
}

export interface CategoryBreakdown {
  category: string;
  monthlyTotal: number;
  subscriptionCount: number;
  currency: string;
}

export interface UpcomingRenewal {
  id: string;
  userId: string;
  service: string;
  description?: string;
  category: string;
  cost: {
    amount: number;
    currency: string;
  };
  nextRenewal: Date;
  daysUntilRenewal: number;
  status: string;
}
