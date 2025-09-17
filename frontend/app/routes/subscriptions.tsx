import type { Route } from "./+types/subscriptions";
import { SubscriptionList } from "@/components/SubscriptionList";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
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
