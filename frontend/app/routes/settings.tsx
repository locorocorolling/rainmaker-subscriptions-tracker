import { Settings as SettingsIcon, User, Bell, CreditCard, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

export default function Settings() {
  return (
    <Layout>
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and application settings</p>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <SettingsIcon className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Settings Panel Coming Soon
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Customize your experience with account settings, notification preferences, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-lg">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <User className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-600">Profile Settings</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Bell className="w-6 h-6 text-yellow-500 mb-2" />
                  <span className="text-sm text-gray-600">Notifications</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-500 mb-2" />
                  <span className="text-sm text-gray-600">Payment Methods</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-6 h-6 text-red-500 mb-2" />
                  <span className="text-sm text-gray-600">Privacy & Security</span>
                </div>
              </div>
              <Button variant="outline" disabled>
                Configure Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}