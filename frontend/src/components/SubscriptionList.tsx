"use client";

import { useState, useMemo, useEffect } from "react";
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
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
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

// Mock data for development (moved outside component to prevent recreation)
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

export function SubscriptionList({ subscriptions = [] }: SubscriptionListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'nextRenewal', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');

  // CRUD state
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);

  // Initialize with mock data if no subscriptions provided
  useEffect(() => {
    if (subscriptions && subscriptions.length > 0) {
      setAllSubscriptions(subscriptions);
    } else {
      setAllSubscriptions(mockSubscriptions);
    }
  }, [subscriptions]);

  const displaySubscriptions = allSubscriptions;

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

  // CRUD Handler Functions
  const handleAddSubscription = (data: any) => {
    const newSubscription: Subscription = {
      id: Date.now().toString(),
      service: data.service,
      description: data.description,
      category: data.category,
      cost: data.cost,
      billingCycle: data.billingCycle,
      nextRenewal: new Date(data.nextRenewal),
      status: data.status,
      metadata: {
        color: data.metadata.color || undefined,
        url: data.metadata.url || undefined,
        notes: data.metadata.notes || undefined,
      },
    };
    setAllSubscriptions(prev => [...prev, newSubscription]);
  };

  const handleEditSubscription = (data: any) => {
    if (!editingSubscription) return;

    const updatedSubscription: Subscription = {
      ...editingSubscription,
      service: data.service,
      description: data.description,
      category: data.category,
      cost: data.cost,
      billingCycle: data.billingCycle,
      nextRenewal: new Date(data.nextRenewal),
      status: data.status,
      metadata: {
        ...editingSubscription.metadata,
        color: data.metadata.color || undefined,
        url: data.metadata.url || undefined,
        notes: data.metadata.notes || undefined,
      },
    };

    setAllSubscriptions(prev =>
      prev.map(sub => sub.id === editingSubscription.id ? updatedSubscription : sub)
    );
    setEditingSubscription(null);
  };

  const handleDeleteSubscription = () => {
    if (!deletingSubscription) return;

    setAllSubscriptions(prev =>
      prev.filter(sub => sub.id !== deletingSubscription.id)
    );
    setDeletingSubscription(null);
  };

  const openEditDialog = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (subscription: Subscription) => {
    setDeletingSubscription(subscription);
    setIsDeleteDialogOpen(true);
  };

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
        cell: (info) => {
          const subscription = info.row.original;
          return (
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(subscription)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(subscription.metadata?.url, '_blank')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openDeleteDialog(subscription)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
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

  const sortedSubscriptions = useMemo(() => {
    return table.getSortedRowModel().rows.map(row => row.original);
  }, [filteredSubscriptions, sorting]);

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
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
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

      {/* CRUD Modals */}
      <SubscriptionForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddSubscription}
        title="Add New Subscription"
      />

      <SubscriptionForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditSubscription}
        initialData={editingSubscription ? {
          service: editingSubscription.service,
          description: editingSubscription.description,
          category: editingSubscription.category,
          cost: editingSubscription.cost,
          billingCycle: editingSubscription.billingCycle,
          nextRenewal: editingSubscription.nextRenewal.toISOString().split('T')[0],
          status: editingSubscription.status,
          metadata: editingSubscription.metadata,
        } : undefined}
        title="Edit Subscription"
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteSubscription}
        subscription={deletingSubscription}
      />
    </div>
  );
}
