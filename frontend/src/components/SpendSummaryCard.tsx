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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Spending Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary metric */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">Monthly Spending</div>
          <div className="text-4xl font-bold text-foreground">{formatCurrency(monthlyTotal)}</div>
          <div className="text-sm text-muted-foreground mt-2">
            {activeCount} active subscription{activeCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Secondary metric */}
        {upcomingTotal > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Upcoming renewals (30 days):</span>
              <span className="text-lg font-semibold text-orange-600">
                {formatCurrency(upcomingTotal)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}