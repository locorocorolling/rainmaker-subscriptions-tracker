import type { Route } from "./+types/subscriptions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Subscriptions() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscriptions</h1>
        <p className="text-gray-600">Manage all your subscriptions in one place</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Netflix</h3>
                <p className="text-sm text-gray-600">Monthly • $15.99</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Active</Badge>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Spotify</h3>
                <p className="text-sm text-gray-600">Monthly • $9.99</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Active</Badge>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Adobe Creative Cloud</h3>
                <p className="text-sm text-gray-600">Monthly • $20.99</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Premium</Badge>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button>Add New Subscription</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
