import { useMemo } from "react";
import { useSubscriptions } from "@/queries/subscriptions";
import type { Subscription } from "../../../shared/types/subscription";

export interface SubscriptionStats {
  activeCount: number;
  monthlyTotal: number;
  upcomingTotal: number;
  upcomingCount: number;
  upcomingSubscriptions: Subscription[];
  nextRenewalDays: number | null;
}

export function useSubscriptionData() {
  const { data: subscriptionData, isLoading, error } = useSubscriptions();

  const subscriptions = subscriptionData?.subscriptions || [];

  // Calculate subscription statistics
  const stats: SubscriptionStats = useMemo(() => {
    if (!subscriptions.length) {
      return {
        activeCount: 0,
        monthlyTotal: 0,
        upcomingTotal: 0,
        upcomingCount: 0,
        upcomingSubscriptions: [],
        nextRenewalDays: null,
      };
    }

    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

    // Calculate monthly total (keep in cents for formatCurrency)
    const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
      const monthlyAmount = sub.billingCycle.unit === 'year'
        ? sub.cost.amount / 12 // Keep in cents
        : sub.billingCycle.unit === 'day'
        ? sub.cost.amount * 30
        : sub.cost.amount; // Keep in cents
      return total + monthlyAmount;
    }, 0);

    // Get upcoming renewals in next 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingSubscriptions = activeSubscriptions
      .filter(sub => sub.nextRenewal >= now && sub.nextRenewal <= thirtyDaysFromNow)
      .sort((a, b) => a.nextRenewal.getTime() - b.nextRenewal.getTime());

    // Calculate total cost for upcoming renewals (keep in cents)
    const upcomingTotal = upcomingSubscriptions.reduce((total, sub) => {
      return total + sub.cost.amount; // Keep in cents for formatCurrency
    }, 0);

    // Get next renewal in days
    const nextRenewalDays = activeSubscriptions.length > 0
      ? Math.min(...activeSubscriptions.map(sub =>
          Math.ceil((sub.nextRenewal.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        ))
      : null;

    return {
      activeCount: activeSubscriptions.length,
      monthlyTotal,
      upcomingTotal,
      upcomingCount: upcomingSubscriptions.length,
      upcomingSubscriptions,
      nextRenewalDays,
    };
  }, [subscriptions]);

  return {
    subscriptions,
    stats,
    isLoading,
    error,
    hasData: subscriptions.length > 0,
  };
}