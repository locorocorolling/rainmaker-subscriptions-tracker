import type { Route } from "./+types/subscriptions";
import { SubscriptionList } from "@/components/SubscriptionList";

export default function Subscriptions() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscriptions</h1>
        <p className="text-gray-600">Manage all your subscriptions in one place</p>
      </div>
      
      <SubscriptionList />
    </div>
  );
}
