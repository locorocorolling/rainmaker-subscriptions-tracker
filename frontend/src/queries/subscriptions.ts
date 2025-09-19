import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Subscription, SubscriptionStatus } from "../../../shared/types/subscription";

// Query key factory for subscriptions
export const subscriptionQueries = {
  all: () => ['subscriptions'] as const,
  lists: () => [...subscriptionQueries.all(), 'list'] as const,
  list: (filters?: { status?: string; category?: string; search?: string }) =>
    [...subscriptionQueries.lists(), { filters }] as const,
  details: () => [...subscriptionQueries.all(), 'detail'] as const,
  detail: (id: string) => [...subscriptionQueries.details(), id] as const,
  upcoming: (days: number) => [...subscriptionQueries.all(), 'upcoming', { days }] as const,
  stats: () => [...subscriptionQueries.all(), 'stats'] as const,
}

// Transform API response to frontend format
const transformSubscription = (sub: any): Subscription => ({
  id: sub.id,
  userId: sub.userId,
  service: sub.service,
  description: sub.description,
  category: sub.category,
  cost: {
    amount: sub.cost.amount, // Backend stores in cents
    currency: sub.cost.currency
  },
  billingCycle: {
    value: sub.billingCycle.value,
    unit: sub.billingCycle.unit
  },
  firstBillingDate: new Date(sub.firstBillingDate),
  nextRenewal: new Date(sub.nextRenewal),
  lastRenewal: sub.lastRenewal ? new Date(sub.lastRenewal) : undefined,
  endOfMonthStrategy: sub.endOfMonthStrategy || 'last_day_of_month',
  preservedBillingDay: sub.preservedBillingDay,
  status: sub.status as SubscriptionStatus,
  metadata: {
    color: sub.metadata?.color,
    logoUrl: sub.metadata?.logoUrl,
    url: sub.metadata?.url,
    notes: sub.metadata?.notes
  },
  createdAt: new Date(sub.createdAt),
  updatedAt: new Date(sub.updatedAt)
});

// Main subscriptions query hook
export const useSubscriptions = (filters?: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: subscriptionQueries.list(filters),
    queryFn: async () => {
      const response = await api.getSubscriptions(filters);
      return {
        subscriptions: response.data.subscriptions.map(transformSubscription),
        pagination: response.data.pagination
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Single subscription query hook
export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: subscriptionQueries.detail(id),
    queryFn: async () => {
      const response = await api.getSubscription(id);
      return transformSubscription(response.data);
    },
    enabled: !!id,
  });
};

// Upcoming renewals query hook
export const useUpcomingRenewals = (days: number = 30) => {
  return useQuery({
    queryKey: subscriptionQueries.upcoming(days),
    queryFn: async () => {
      const response = await api.getUpcomingRenewals(days);
      return response.data.subscriptions?.map(transformSubscription) || [];
    },
  });
};

// Subscription stats query hook
export const useSubscriptionStats = () => {
  return useQuery({
    queryKey: subscriptionQueries.stats(),
    queryFn: async () => {
      const response = await api.getSubscriptionStats();
      return response.data;
    },
  });
};

// Mutation hooks
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // Transform frontend data to backend format
      const apiData = {
        service: data.service,
        description: data.description,
        ...(data.category && data.category.trim() && { category: data.category }),
        cost: {
          amount: Math.round(data.cost.amount * 100), // Convert dollars to cents
          currency: data.cost.currency
        },
        billingCycle: data.billingCycle,
        firstBillingDate: new Date(data.firstBillingDate).toISOString(), // Backend uses firstBillingDate, convert to full ISO string
        status: data.status,
        metadata: {
          ...(data.metadata?.color && { color: data.metadata.color }),
          ...(data.metadata?.url && { url: data.metadata.url }),
          ...(data.metadata?.notes && { notes: data.metadata.notes })
        }
      };

      const response = await api.createSubscription(apiData);
      return transformSubscription(response.data);
    },
    onSuccess: () => {
      // Invalidate and refetch subscription-related queries
      queryClient.invalidateQueries({ queryKey: subscriptionQueries.all() });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Transform frontend data to backend format
      const apiData = {
        service: data.service,
        description: data.description,
        ...(data.category && data.category.trim() && { category: data.category }),
        cost: {
          amount: Math.round(data.cost.amount * 100), // Convert dollars to cents
          currency: data.cost.currency
        },
        billingCycle: data.billingCycle,
        // TODO: ME-142 - Update should semantically use nextRenewal, not firstBillingDate
        firstBillingDate: new Date(data.nextRenewal).toISOString(),
        status: data.status,
        metadata: {
          ...(data.metadata?.color && { color: data.metadata.color }),
          ...(data.metadata?.url && { url: data.metadata.url }),
          ...(data.metadata?.notes && { notes: data.metadata.notes })
        }
      };

      const response = await api.updateSubscription(id, apiData);
      return transformSubscription(response.data);
    },
    onSuccess: (data, variables) => {
      // Update the specific subscription in cache
      queryClient.setQueryData(
        subscriptionQueries.detail(variables.id),
        data
      );
      // Invalidate list queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: subscriptionQueries.lists() });
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.deleteSubscription(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove the subscription from cache
      queryClient.removeQueries({ queryKey: subscriptionQueries.detail(deletedId) });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: subscriptionQueries.lists() });
    },
  });
};