import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface SpendSummaryCardProps {
  monthlyTotal: number;
  upcomingTotal: number;
  isLoading?: boolean;
}

export function SpendSummaryCard({ monthlyTotal, upcomingTotal, isLoading }: SpendSummaryCardProps) {
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
        <CardTitle className="text-lg">Subscription Spending</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">This Month:</span>
          <span className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Next 30 Days:</span>
          <span className="text-xl font-semibold text-blue-600">
            {formatCurrency(upcomingTotal)}
          </span>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Forecast:</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(monthlyTotal + upcomingTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}