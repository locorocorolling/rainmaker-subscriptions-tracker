import { BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

export default function Analytics() {
  return (
    <Layout>
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Insights into your subscription spending and trends</p>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analytics Dashboard Coming Soon
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Track spending trends, category breakdowns, and get insights to optimize your subscriptions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 max-w-lg">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-600">Spending Trends</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
                  <span className="text-sm text-gray-600">Usage Insights</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-500 mb-2" />
                  <span className="text-sm text-gray-600">Category Analysis</span>
                </div>
              </div>
              <Button variant="outline" disabled>
                View Demo Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}