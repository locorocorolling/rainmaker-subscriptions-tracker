import type { Route } from "./+types/home";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { SpendSummaryCard } from "@/components/SpendSummaryCard";
import { UpcomingRenewalsTable } from "@/components/UpcomingRenewalsTable";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { GettingStartedSuggestions } from "@/components/GettingStartedSuggestions";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useSubscriptionData } from "@/hooks/useSubscriptionData";
import { useCreateSubscription } from "@/queries/subscriptions";
import { useState } from "react";
import { Plus } from "lucide-react";

export default function Home() {
  const { user, logout, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { stats, isLoading, error } = useSubscriptionData();
  const createSubscription = useCreateSubscription();

  const handleAddSubscription = async (data: any) => {
    try {
      await createSubscription.mutateAsync(data);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Layout onAddSubscription={() => setIsAddDialogOpen(true)}>
      <div className="container mx-auto p-6 max-w-6xl">
        <PageHeader
          title="Subscription Tracker"
          subtitle="Track all your subscriptions in one place"
        >
          {!user && (
            <Button onClick={() => setShowAuthModal(true)}>
              Sign In
            </Button>
          )}
        </PageHeader>

      {user ? (
        isLoading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-20">
            <div className="text-lg">Loading...</div>
          </div>
        ) : stats.activeCount === 0 ? (
          /* Empty State: Only Getting Started */
          <div className="max-w-4xl mx-auto">
            <GettingStartedSuggestions onAddSubscription={() => setIsAddDialogOpen(true)} />
          </div>
        ) : (
          /* Regular Dashboard */
          <div className="space-y-6">
            {/* Spending Overview Card */}
            <div className="max-w-md">
              <SpendSummaryCard
                monthlyTotal={stats.monthlyTotal}
                upcomingTotal={stats.upcomingTotal}
                activeCount={stats.activeCount}
                isLoading={isLoading}
              />
            </div>

            {/* Add Subscription Button + Alerts */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button
                size="lg"
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Subscription
              </Button>

              {stats.upcomingCount > 0 && (
                <div className="px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-sm font-medium">
                      {stats.upcomingCount} renewal{stats.upcomingCount > 1 ? 's' : ''} due soon
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Renewals Table */}
            <UpcomingRenewalsTable
              upcomingSubscriptions={stats.upcomingSubscriptions}
              activeSubscriptionsCount={stats.activeCount}
              isLoading={isLoading}
              onAddSubscription={() => setIsAddDialogOpen(true)}
            />

            {error && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-red-500">Error loading subscriptions: {error.message}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Welcome to Subscription Tracker</h2>
            <p className="text-gray-600 mb-6">Sign in to start tracking your subscriptions</p>
            <Button onClick={() => setShowAuthModal(true)}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />

      <SubscriptionForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddSubscription}
        title="Add New Subscription"
      />
      </div>
    </Layout>
  );
}
