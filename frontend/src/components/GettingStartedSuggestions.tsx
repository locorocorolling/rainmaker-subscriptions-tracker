import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Tv, Music, Dumbbell, Cloud, Shield, Globe } from "lucide-react";

interface GettingStartedSuggestionsProps {
  onAddSubscription: () => void;
}

export function GettingStartedSuggestions({ onAddSubscription }: GettingStartedSuggestionsProps) {
  return (
    <div className="text-center py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">🚀 Get Started</h2>
          <p className="text-muted-foreground">
            Track your subscriptions and never miss a renewal again
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Step 1: Streaming Services */}
          <div className="flex flex-col items-center p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Tv className="h-6 w-6 text-blue-600" />
              <Music className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-medium mb-2">1. Streaming Services</h3>
            <p className="text-sm text-muted-foreground text-center">
              Netflix, Spotify, Disney+, YouTube Premium
            </p>
          </div>

          {/* Step 2: Monthly Subscriptions */}
          <div className="flex flex-col items-center p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="h-6 w-6 text-orange-600" />
              <Cloud className="h-5 w-5 text-sky-600" />
            </div>
            <h3 className="font-medium mb-2">2. Monthly Services</h3>
            <p className="text-sm text-muted-foreground text-center">
              Gym memberships, software, cloud storage
            </p>
          </div>

          {/* Step 3: Annual Renewals */}
          <div className="flex flex-col items-center p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-6 w-6 text-purple-600" />
              <Globe className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-medium mb-2">3. Annual Renewals</h3>
            <p className="text-sm text-muted-foreground text-center">
              Insurance, domains, software licenses
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={onAddSubscription}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add My First Subscription
          </Button>

          <div className="text-xs text-muted-foreground">
            Start tracking to see your spending patterns and upcoming renewals
          </div>
        </div>
      </div>
    </div>
  );
}