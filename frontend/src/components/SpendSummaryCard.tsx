import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface SpendSummaryCardProps {
  monthlyTotal: number;
  upcomingTotal: number;
  activeCount: number;
  isLoading?: boolean;
}

export function SpendSummaryCard({ monthlyTotal, upcomingTotal, activeCount, isLoading }: SpendSummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription Spending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">This Month:</span>
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Next 30 Days:</span>
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalForecast = monthlyTotal + upcomingTotal;
  const avgPerService = activeCount > 0 ? monthlyTotal / activeCount : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Spending Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary metric - most prominent */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
          <div className="text-sm text-muted-foreground mb-1">Total Monthly Spending</div>
          <div className="text-3xl font-bold text-blue-600">{formatCurrency(monthlyTotal)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {activeCount} active subscription{activeCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Secondary metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Next 30 Days</div>
            <div className="text-xl font-semibold text-orange-600">
              {formatCurrency(upcomingTotal)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg per Service</div>
            <div className="text-xl font-semibold text-green-600">
              {formatCurrency(avgPerService)}
            </div>
          </div>
        </div>

        {/* Forecast summary */}
        <div className="pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Monthly Forecast:</span>
            <span className="text-lg font-bold">
              {formatCurrency(totalForecast)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}