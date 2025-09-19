import type { Route } from "./+types/subscriptions";
import { SubscriptionList } from "@/components/SubscriptionList";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { useCreateSubscription } from "@/queries/subscriptions";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";

export default function Subscriptions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const createSubscription = useCreateSubscription();

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleAddSubscription = async (data: any) => {
    try {
      await createSubscription.mutateAsync(data);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <Layout onAddSubscription={() => setIsAddDialogOpen(true)}>
        <div className="flex-1 container mx-auto p-6 max-w-6xl">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show message if not authenticated (before redirect)
  if (!user) {
    return (
      <Layout onAddSubscription={() => setIsAddDialogOpen(true)}>
        <div className="flex-1 container mx-auto p-6 max-w-6xl">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Please sign in to view your subscriptions.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onAddSubscription={() => setIsAddDialogOpen(true)}>
      <div className="flex-1 container mx-auto p-6 max-w-6xl">
        <PageHeader
          title="Subscriptions"
          subtitle="Manage and monitor all your subscriptions"
        />

        <SubscriptionList />

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
