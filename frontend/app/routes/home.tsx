import type { Route } from "./+types/home";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";

export default function Home() {
  const { user, logout, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
    <div className="container mx-auto p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">4</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$45.97</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Renewal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">15 days</p>
            </CardContent>
          </Card>
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

      {user && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Button>Add Subscription</Button>
            <Button variant="secondary">View All Subscriptions</Button>
          </div>
        </div>
      )}

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
}
