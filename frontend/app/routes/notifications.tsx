import { Bell, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

export default function Notifications() {
  return (
    <Layout>
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated on your subscription renewals and important updates</p>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Notifications Coming Soon
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                We're working on bringing you renewal reminders, payment alerts, and subscription insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" disabled>
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Notifications
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}