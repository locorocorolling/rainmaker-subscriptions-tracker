"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, getDaysUntilRenewal, getStatusColor } from "@/lib/utils";

interface Subscription {
  id: string;
  service: string;
  description?: string;
  category: string;
  cost: { amount: number; currency: string };
  billingCycle: { value: number; unit: 'day' | 'month' | 'year' };
  nextRenewal: Date;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  metadata?: {
    color?: string;
    logoUrl?: string;
    url?: string;
    notes?: string;
  };
}

interface SubscriptionListProps {
  subscriptions?: Subscription[];
}

export function SubscriptionList({ subscriptions = [] }: SubscriptionListProps) {
  const [sortBy, setSortBy] = useState<'service' | 'nextRenewal' | 'cost'>('nextRenewal');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');

  // Mock data for development
  const mockSubscriptions: Subscription[] = [
    {
      id: "1",
      service: "Netflix",
      description: "Premium streaming service",
      category: "Entertainment",
      cost: { amount: 1599, currency: "USD" },
      billingCycle: { value: 1, unit: "month" },
      nextRenewal: new Date("2024-12-15"),
      status: "active",
      metadata: {
        color: "#E50914",
        url: "https://netflix.com",
        notes: "Family plan"
      }
    },
    {
      id: "2",
      service: "Spotify",
      description: "Music streaming service",
      category: "Music",
      cost: { amount: 999, currency: "USD" },
      billingCycle: { value: 1, unit: "month" },
      nextRenewal: new Date("2024-12-01"),
      status: "active",
      metadata: {
        color: "#1DB954",
        url: "https://spotify.com",
        notes: "Premium individual"
      }
    },
    {
      id: "3",
      service: "GitHub Pro",
      description: "Developer tools and repositories",
      category: "Development",
      cost: { amount: 400, currency: "USD" },
      billingCycle: { value: 1, unit: "month" },
      nextRenewal: new Date("2024-12-31"),
      status: "active",
      metadata: {
        color: "#24292e",
        url: "https://github.com",
        notes: "Pro account for private repos"
      }
    },
    {
      id: "4",
      service: "Adobe Creative Cloud",
      description: "Design and creative software suite",
      category: "Design",
      cost: { amount: 5299, currency: "USD" },
      billingCycle: { value: 1, unit: "year" },
      nextRenewal: new Date("2025-01-15"),
      status: "active",
      metadata: {
        color: "#FF0000",
        url: "https://adobe.com",
        notes: "All apps plan"
      }
    }
  ];

  const displaySubscriptions = subscriptions.length > 0 ? subscriptions : mockSubscriptions;

  const filteredSubscriptions = displaySubscriptions.filter(sub => 
    filterStatus === 'all' || sub.status === filterStatus
  );

  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    switch (sortBy) {
      case 'service':
        return a.service.localeCompare(b.service);
      case 'nextRenewal':
        return a.nextRenewal.getTime() - b.nextRenewal.getTime();
      case 'cost':
        return a.cost.amount - b.cost.amount;
      default:
        return 0;
    }
  });

  // Calculate totals
  const monthlyTotal = sortedSubscriptions
    .filter(sub => sub.status === 'active')
    .reduce((total, sub) => {
      const monthlyAmount = sub.billingCycle.unit === 'year' 
        ? sub.cost.amount / 12 
        : sub.billingCycle.unit === 'day' 
        ? sub.cost.amount * 30 
        : sub.cost.amount;
      return total + monthlyAmount;
    }, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedSubscriptions.filter(sub => sub.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlyTotal)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Renewal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedSubscriptions.length > 0 
                ? getDaysUntilRenewal(sortedSubscriptions[0].nextRenewal)
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === 'paused' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('paused')}
          >
            Paused
          </Button>
          <Button
            variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('cancelled')}
          >
            Cancelled
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'service' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('service')}
          >
            Sort by Name
          </Button>
          <Button
            variant={sortBy === 'nextRenewal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('nextRenewal')}
          >
            Sort by Renewal
          </Button>
          <Button
            variant={sortBy === 'cost' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('cost')}
          >
            Sort by Cost
          </Button>
        </div>
      </div>

      {/* Subscription Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            Track all your subscriptions in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Next Renewal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">
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
                  <TableCell>{subscription.category}</TableCell>
                  <TableCell>{formatCurrency(subscription.cost.amount)}</TableCell>
                  <TableCell>
                    Every {subscription.billingCycle.value} {subscription.billingCycle.unit}
                    {subscription.billingCycle.value > 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(subscription.nextRenewal)}</span>
                      <span className="text-sm text-muted-foreground">
                        {getDaysUntilRenewal(subscription.nextRenewal)} days
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {sortedSubscriptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
