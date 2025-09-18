"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  subscription?: {
    service: string
    status: string
    cost: { amount: number; currency: string }
  } | null
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  subscription,
}: DeleteConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the parent component
      console.error('Delete error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 text-foreground border-border">
        <DialogHeader>
          <DialogTitle>Delete Subscription</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this subscription? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {subscription?.service && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{subscription.service}</div>
                <div className="text-sm text-muted-foreground">
                  {subscription.cost ? formatCurrency(subscription.cost.amount) : ''}
                </div>
              </div>
              {subscription.status && (
                <Badge variant={
                  subscription.status === 'active' ? 'default' :
                  subscription.status === 'paused' ? 'secondary' :
                  subscription.status === 'cancelled' ? 'destructive' : 'outline'
                }>
                  {subscription.status}
                </Badge>
              )}
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">This action cannot be undone</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              All data associated with this subscription will be permanently removed.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}