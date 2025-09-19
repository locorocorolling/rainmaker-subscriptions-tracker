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
import { useNavigate } from "react-router";

export default function Home() {
  const { user, logout, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Debug states for visual testing
  const [debugState, setDebugState] = useState<'normal' | 'loading' | 'error' | 'empty'>('normal');
  const navigate = useNavigate();

  const { stats, isLoading, error } = useSubscriptionData();
  const createSubscription = useCreateSubscription();

  const handleAddSubscription = async (data: any) => {
    try {
      await createSubscription.mutateAsync(data);
      setIsAddDialogOpen(false);
      navigate('/subscriptions');
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
          {/* Debug Controls */}
          {user && (
            <div className="flex gap-1 text-xs">
              <span className="text-muted-foreground self-center">Debug:</span>
              <Button
                variant={debugState === 'normal' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setDebugState('normal')}
                className="text-xs h-7"
              >
                Normal
              </Button>
              <Button
                variant={debugState === 'loading' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setDebugState('loading')}
                className="text-xs h-7"
              >
                Loading
              </Button>
              <Button
                variant={debugState === 'error' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setDebugState('error')}
                className="text-xs h-7"
              >
                Error
              </Button>
              <Button
                variant={debugState === 'empty' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setDebugState('empty')}
                className="text-xs h-7"
              >
                Empty
              </Button>
            </div>
          )}
          {!user && (
            <Button onClick={() => setShowAuthModal(true)}>
              Sign In
            </Button>
          )}
        </PageHeader>

      {user ? (
        (isLoading || debugState === 'loading') ? (
          /* Loading State */
          <div className="flex items-center justify-center py-20">
            <div className="text-lg">Loading...</div>
          </div>
        ) : (error || debugState === 'error') ? (
          /* Error State - Show this BEFORE checking for empty */
          <Card>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Failed to load subscription data</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  We're having trouble connecting to our servers. Please check your internet connection and try again.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                  >
                    Try Again
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {error?.message || 'Debug error state'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (stats.activeCount === 0 || debugState === 'empty') ? (
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
                <div className="px-3 py-2 bg-orange-50 border-0 ring-1 ring-orange-200/50 rounded-lg">
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

            {/* Error handling moved to top-level condition above */}
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
