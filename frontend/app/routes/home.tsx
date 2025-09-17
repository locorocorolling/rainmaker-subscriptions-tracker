import type { Route } from "./+types/home";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { SpendSummaryCard } from "@/components/SpendSummaryCard";
import { UpcomingRenewalsTable } from "@/components/UpcomingRenewalsTable";
import { SubscriptionForm } from "@/components/SubscriptionForm";
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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subscription Tracker</h1>
          <p className="text-gray-600">Track all your subscriptions in one place</p>
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.name || user.email}</span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        ) : (
          <Button onClick={() => setShowAuthModal(true)}>
            Sign In
          </Button>
        )}
      </div>

      {user ? (
        <div className="space-y-6">
          {/* Top Section: Spend Card (left) + Add Button (right) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Consolidated Spend Card - 1/3 width on md+ */}
            <SpendSummaryCard
              monthlyTotal={stats.monthlyTotal}
              upcomingTotal={stats.upcomingTotal}
              isLoading={isLoading}
            />

            {/* Add Subscription Button - remaining space */}
            <div className="md:col-span-2 flex items-center justify-center md:justify-start">
              <Button
                size="lg"
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Subscription
              </Button>
            </div>
          </div>

          {/* Upcoming Renewals Table */}
          <UpcomingRenewalsTable
            upcomingSubscriptions={stats.upcomingSubscriptions}
            isLoading={isLoading}
          />

          {error && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-red-500">Error loading subscriptions: {error.message}</p>
              </CardContent>
            </Card>
          )}
        </div>
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
  );
}
