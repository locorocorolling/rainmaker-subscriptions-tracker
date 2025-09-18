import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getDaysUntilRenewal, getStatusColor, formatBillingCycle } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { GettingStartedSuggestions } from "@/components/GettingStartedSuggestions";
import type { Subscription } from "../../../shared/types/subscription";

interface UpcomingRenewalsTableProps {
  upcomingSubscriptions: Subscription[];
  activeSubscriptionsCount: number;
  isLoading?: boolean;
  onAddSubscription?: () => void;
}

export function UpcomingRenewalsTable({
  upcomingSubscriptions,
  activeSubscriptionsCount,
  isLoading,
  onAddSubscription
}: UpcomingRenewalsTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Upcoming Renewals</CardTitle>
            <CardDescription>Next 30 days</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading renewals...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Upcoming Renewals</CardTitle>
          <CardDescription>Next 30 days</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/subscriptions')}
          className="flex items-center gap-2"
        >
          View All Subscriptions
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {activeSubscriptionsCount === 0 ? (
          <GettingStartedSuggestions onAddSubscription={onAddSubscription || (() => {})} />
        ) : upcomingSubscriptions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              No renewals in the next 30 days
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead className="text-right">Days Until</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {subscription.metadata?.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subscription.metadata.color }}
                        />
                      )}
                      <div>
                        <div className="font-medium">{subscription.service}</div>
                        {subscription.description && (
                          <div className="text-sm text-muted-foreground">
                            {subscription.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(subscription.cost.amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatDate(subscription.nextRenewal)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatBillingCycle(subscription.billingCycle)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <Badge variant={
                        getDaysUntilRenewal(subscription.nextRenewal) <= 7
                          ? "destructive"
                          : getDaysUntilRenewal(subscription.nextRenewal) <= 14
                          ? "default"
                          : "secondary"
                      }>
                        {getDaysUntilRenewal(subscription.nextRenewal)} days
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}