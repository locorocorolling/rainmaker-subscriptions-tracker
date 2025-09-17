import type { Route } from "./+types/subscriptions";
import { SubscriptionList } from "@/components/SubscriptionList";
import { Layout } from "@/components/Layout";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { useCreateSubscription } from "@/queries/subscriptions";
import { useState } from "react";

export default function Subscriptions() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  return (
    <Layout onAddSubscription={() => setIsAddDialogOpen(true)}>
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
          <p className="text-gray-600">Track all your subscriptions in one place</p>
        </div>

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
