import type { Route } from "./+types/analytics"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PieChart, BarChart3, TrendingUp, DollarSign } from "lucide-react"
import { Layout } from "@/components/Layout"

export default function Analytics() {
  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-6xl">
        <PageHeader
          title="Analytics"
          subtitle="Understand your subscription spending patterns and trends"
        />

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Monthly</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$127.96</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Projection</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,535</div>
              <p className="text-xs text-muted-foreground">+$184 vs last year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">across 6 categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renewals This Month</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">$78.95 total</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Spending by Category
              </CardTitle>
              <CardDescription>
                Monthly breakdown of subscription categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg mb-4">
                <div className="text-muted-foreground text-sm">
                  📊 Interactive Pie Chart Here
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Entertainment</span>
                  </div>
                  <span className="text-sm font-medium">$45.97 (36%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Development</span>
                  </div>
                  <span className="text-sm font-medium">$32.99 (26%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm">Productivity</span>
                  </div>
                  <span className="text-sm font-medium">$28.00 (22%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Other</span>
                  </div>
                  <span className="text-sm font-medium">$21.00 (16%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Spending Trend
              </CardTitle>
              <CardDescription>
                Last 6 months subscription costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-64 bg-muted/20 rounded-lg mb-4 p-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-primary h-16 w-8 rounded-t"></div>
                  <span className="text-xs text-muted-foreground">Mar</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-primary h-20 w-8 rounded-t"></div>
                  <span className="text-xs text-muted-foreground">Apr</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-primary h-24 w-8 rounded-t"></div>
                  <span className="text-xs text-muted-foreground">May</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-primary h-28 w-8 rounded-t"></div>
                  <span className="text-xs text-muted-foreground">Jun</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-primary h-32 w-8 rounded-t"></div>
                  <span className="text-xs text-muted-foreground">Jul</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-primary h-36 w-8 rounded-t"></div>
                  <span className="text-xs text-muted-foreground">Aug</span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$95.42</span>
                <span>↗ +34% growth</span>
                <span>$127.96</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Deep Dive */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              Detailed view of subscriptions by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Entertainment Category */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Entertainment</Badge>
                    <span className="text-sm text-muted-foreground">4 services</span>
                  </div>
                  <span className="font-medium">$45.97/month</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Netflix Premium</span>
                    <span>$19.99</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Spotify Premium</span>
                    <span>$9.99</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Disney+ Bundle</span>
                    <span>$15.99</span>
                  </div>
                </div>
              </div>

              {/* Development Category */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Development</Badge>
                    <span className="text-sm text-muted-foreground">3 services</span>
                  </div>
                  <span className="font-medium">$32.99/month</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>GitHub Pro</span>
                    <span>$7.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Vercel Pro</span>
                    <span>$20.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Linear</span>
                    <span>$5.99</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}