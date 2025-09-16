import type { Route } from "./+types/subscriptions";
import { SubscriptionList } from "@/components/SubscriptionList";

export default function Subscriptions() {
  return (
    <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
        <p className="text-gray-600">Track all your subscriptions in one place</p>
      </div>

      <SubscriptionList />
    </div>
  );
}
