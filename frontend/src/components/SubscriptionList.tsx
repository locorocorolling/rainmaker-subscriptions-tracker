"use client";

import { useState, useMemo } from "react";
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
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";

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

const columnHelper = createColumnHelper<Subscription>();

export function SubscriptionList({ subscriptions = [] }: SubscriptionListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'nextRenewal', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
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

  // Apply status filter
  const filteredSubscriptions = useMemo(() => {
    return displaySubscriptions.filter(sub =>
      filterStatus === 'all' || sub.status === filterStatus
    );
  }, [displaySubscriptions, filterStatus]);

  // Calculate totals
  const monthlyTotal = useMemo(() => {
    return filteredSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => {
        const monthlyAmount = sub.billingCycle.unit === 'year'
          ? sub.cost.amount / 12
          : sub.billingCycle.unit === 'day'
          ? sub.cost.amount * 30
          : sub.cost.amount;
        return total + monthlyAmount;
      }, 0);
  }, [filteredSubscriptions]);

  // Define columns
  const columns = useMemo<ColumnDef<Subscription, any>[]>(
    () => [
      columnHelper.accessor('service', {
        header: () => (
          <div className="text-left font-medium">Service</div>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2">
            {info.row.original.metadata?.color && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: info.row.original.metadata?.color }}
              />
            )}
            <div>
              <div className="font-medium">{info.getValue()}</div>
              {info.row.original.description && (
                <div className="text-sm text-muted-foreground">
                  {info.row.original.description}
                </div>
              )}
            </div>
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
      }),
      columnHelper.accessor('category', {
        header: () => (
          <div className="text-left font-medium">Category</div>
        ),
        cell: (info) => info.getValue(),
        enableSorting: false,
        enableColumnFilter: false,
      }),
      columnHelper.accessor('cost', {
        header: () => (
          <div className="text-left font-medium">Cost</div>
        ),
        cell: (info) => formatCurrency(info.getValue().amount),
        enableSorting: true,
        enableColumnFilter: false,
        sortingFn: (a, b) => a.original.cost.amount - b.original.cost.amount,
      }),
      columnHelper.accessor('billingCycle', {
        header: () => (
          <div className="text-left font-medium">Billing Cycle</div>
        ),
        cell: (info) => (
          <span>
            Every {info.getValue().value} {info.getValue().unit}
            {info.getValue().value > 1 ? 's' : ''}
          </span>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      }),
      columnHelper.accessor('nextRenewal', {
        header: () => (
          <div className="text-left font-medium">Next Renewal</div>
        ),
        cell: (info) => (
          <div className="flex flex-col">
            <span>{formatDate(info.getValue())}</span>
            <span className="text-sm text-muted-foreground">
              {getDaysUntilRenewal(info.getValue())} days
            </span>
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
        sortingFn: (a, b) => a.original.nextRenewal.getTime() - b.original.nextRenewal.getTime(),
      }),
      columnHelper.accessor('status', {
        header: () => (
          <div className="text-left font-medium">Status</div>
        ),
        cell: (info) => (
          <Badge variant={getStatusColor(info.getValue())}>
            {info.getValue()}
          </Badge>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => (
          <div className="text-right font-medium">Actions</div>
        ),
        cell: () => (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm">
              Edit
            </Button>
            <Button variant="outline" size="sm">
              View
            </Button>
          </div>
        ),
      }),
    ],
    []
  );

  // Create table instance
  const table = useReactTable({
    data: filteredSubscriptions,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,
  });

  const sortedSubscriptions = table.getSortedRowModel().rows.map(row => row.original);

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
            variant={sorting[0]?.id === 'service' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSorting([{ id: 'service', desc: sorting[0]?.id === 'service' ? !sorting[0].desc : false }])}
          >
            Sort by Name {sorting[0]?.id === 'service' && (sorting[0].desc ? '↓' : '↑')}
          </Button>
          <Button
            variant={sorting[0]?.id === 'nextRenewal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSorting([{ id: 'nextRenewal', desc: sorting[0]?.id === 'nextRenewal' ? !sorting[0].desc : false }])}
          >
            Sort by Renewal {sorting[0]?.id === 'nextRenewal' && (sorting[0].desc ? '↓' : '↑')}
          </Button>
          <Button
            variant={sorting[0]?.id === 'cost' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSorting([{ id: 'cost', desc: sorting[0]?.id === 'cost' ? !sorting[0].desc : false }])}
          >
            Sort by Cost {sorting[0]?.id === 'cost' && (sorting[0].desc ? '↓' : '↑')}
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
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className={header.id === 'actions' ? 'text-right' : ''}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.id === 'actions' ? 'text-right' : ''}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {table.getRowModel().rows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
