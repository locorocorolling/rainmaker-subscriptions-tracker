import type { Route } from "./+types/home";

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Manager</h1>
        <p className="text-gray-600">Manage all your subscriptions in one place</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Active Subscriptions</h2>
          <p className="text-2xl font-bold">4</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Monthly Total</h2>
          <p className="text-2xl font-bold">$45.97</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Next Renewal</h2>
          <p className="text-2xl font-bold">15 days</p>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add Subscription
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            View All Subscriptions
          </button>
        </div>
      </div>
    </div>
  );
}
