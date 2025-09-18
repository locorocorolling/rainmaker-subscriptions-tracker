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
import { formatCurrency, formatDate, getDaysUntilRenewal, getStatusColor, formatBillingCycle } from "@/lib/utils";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
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


export function SubscriptionList({ subscriptions: propSubscriptions }: SubscriptionListProps) {
  const { user, token } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'nextRenewal', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');

  // CRUD state
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);

  // Fetch subscriptions from API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getSubscriptions();

        // Transform API response to match frontend interface
        const transformedSubscriptions = response.subscriptions.map((sub: any) => ({
          id: sub.id,
          service: sub.service,
          description: sub.description,
          category: sub.category,
          cost: {
            amount: sub.cost.amount, // Backend stores in cents
            currency: sub.cost.currency
          },
          billingCycle: {
            value: sub.billingCycle.value,
            unit: sub.billingCycle.unit
          },
          nextRenewal: new Date(sub.nextRenewal),
          status: sub.status,
          metadata: {
            color: sub.metadata?.color,
            url: sub.metadata?.url,
            notes: sub.metadata?.notes
          }
        }));

        setAllSubscriptions(transformedSubscriptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [token]);

  const displaySubscriptions = allSubscriptions;

  // Apply status filter
  const filteredSubscriptions = useMemo(() => {
    return displaySubscriptions.filter(sub =>
      filterStatus === 'all' || sub.status === filterStatus
    );
  }, [displaySubscriptions, filterStatus]);

  // Calculate totals (keep in cents for formatCurrency)
  const monthlyTotal = useMemo(() => {
    return filteredSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => {
        const monthlyAmount = sub.billingCycle.unit === 'year'
          ? sub.cost.amount / 12 // Keep in cents
          : sub.billingCycle.unit === 'day'
          ? sub.cost.amount * 30
          : sub.cost.amount; // Keep in cents
        return total + monthlyAmount;
      }, 0);
  }, [filteredSubscriptions]);

  // CRUD Handler Functions
  const handleAddSubscription = async (data: any) => {
    try {
      // Transform frontend data to backend format
      const apiData = {
        service: data.service,
        description: data.description,
        category: data.category,
        cost: {
          amount: Math.round(data.cost.amount * 100), // Convert dollars to cents
          currency: data.cost.currency
        },
        billingCycle: data.billingCycle,
        firstBillingDate: data.nextRenewal, // Backend uses firstBillingDate
        status: data.status,
        metadata: {
          ...(data.metadata.color && { color: data.metadata.color }),
          ...(data.metadata.url && { url: data.metadata.url }),
          ...(data.metadata.notes && { notes: data.metadata.notes })
        }
      };

      const response = await api.createSubscription(apiData);

      // Transform response back to frontend format
      const newSubscription: Subscription = {
        id: response.data.id,
        service: response.data.service,
        description: response.data.description,
        category: response.data.category,
        cost: {
          amount: response.data.cost.amount, // Keep in cents for display
          currency: response.data.cost.currency
        },
        billingCycle: {
          value: response.data.billingCycle.value,
          unit: response.data.billingCycle.unit
        },
        nextRenewal: new Date(response.data.nextRenewal),
        status: response.data.status,
        metadata: {
          color: response.data.metadata?.color,
          url: response.data.metadata?.url,
          notes: response.data.metadata?.notes
        }
      };

      setAllSubscriptions(prev => [...prev, newSubscription]);
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  };

  const handleEditSubscription = async (data: any) => {
    if (!editingSubscription) return;

    try {
      // Transform frontend data to backend format
      const apiData = {
        service: data.service,
        description: data.description,
        category: data.category,
        cost: {
          amount: Math.round(data.cost.amount * 100), // Convert dollars to cents
          currency: data.cost.currency
        },
        billingCycle: data.billingCycle,
        status: data.status,
        metadata: {
          ...(data.metadata.color && { color: data.metadata.color }),
          ...(data.metadata.url && { url: data.metadata.url }),
          ...(data.metadata.notes && { notes: data.metadata.notes })
        }
      };

      const response = await api.updateSubscription(editingSubscription.id, apiData);

      // Transform response back to frontend format
      const updatedSubscription: Subscription = {
        ...editingSubscription,
        service: response.data.service,
        description: response.data.description,
        category: response.data.category,
        cost: {
          amount: response.data.cost.amount, // Keep in cents for display
          currency: response.data.cost.currency
        },
        billingCycle: {
          value: response.data.billingCycle.value,
          unit: response.data.billingCycle.unit
        },
        nextRenewal: new Date(response.data.nextRenewal),
        status: response.data.status,
        metadata: {
          color: response.data.metadata?.color,
          url: response.data.metadata?.url,
          notes: response.data.metadata?.notes
        }
      };

      setAllSubscriptions(prev =>
        prev.map(sub => sub.id === editingSubscription.id ? updatedSubscription : sub)
      );
      setEditingSubscription(null);
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  };

  const handleDeleteSubscription = async () => {
    if (!deletingSubscription) return;

    try {
      await api.deleteSubscription(deletingSubscription.id);
      setAllSubscriptions(prev =>
        prev.filter(sub => sub.id !== deletingSubscription.id)
      );
      setDeletingSubscription(null);
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      throw error;
    }
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
        cell: (info) => formatCurrency(info.getValue().amount), // formatCurrency handles cent conversion
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
            {formatBillingCycle(info.getValue())}
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
            <div className="flex gap-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(subscription)}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <Edit className="h-4 w-4" />
              </Button>
              {subscription.metadata?.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(subscription.metadata?.url, '_blank')}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDeleteDialog(subscription)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
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

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please sign in to view your subscriptions.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading subscriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

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
        <div className="flex flex-wrap gap-1">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
          <div className="flex gap-1 ml-2">
            <Button
              variant={filterStatus === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'paused' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('paused')}
            >
              Paused
            </Button>
            <Button
              variant={filterStatus === 'cancelled' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('cancelled')}
            >
              Cancelled
            </Button>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant={sorting[0]?.id === 'service' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSorting([{ id: 'service', desc: sorting[0]?.id === 'service' ? !sorting[0].desc : false }])}
            className="text-xs"
          >
            Name {sorting[0]?.id === 'service' && (sorting[0].desc ? '↓' : '↑')}
          </Button>
          <Button
            variant={sorting[0]?.id === 'nextRenewal' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSorting([{ id: 'nextRenewal', desc: sorting[0]?.id === 'nextRenewal' ? !sorting[0].desc : false }])}
            className="text-xs"
          >
            Renewal {sorting[0]?.id === 'nextRenewal' && (sorting[0].desc ? '↓' : '↑')}
          </Button>
          <Button
            variant={sorting[0]?.id === 'cost' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSorting([{ id: 'cost', desc: sorting[0]?.id === 'cost' ? !sorting[0].desc : false }])}
            className="text-xs"
          >
            Cost {sorting[0]?.id === 'cost' && (sorting[0].desc ? '↓' : '↑')}
          </Button>
        </div>
      </div>

      {/* Subscription Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
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
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">No subscriptions found</div>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add your first subscription
              </Button>
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
          cost: {
            amount: editingSubscription.cost.amount / 100, // Convert cents to dollars for editing
            currency: editingSubscription.cost.currency
          },
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
