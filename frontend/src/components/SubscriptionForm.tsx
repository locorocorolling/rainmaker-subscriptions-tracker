"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { popularServices, searchServices, getServiceByName } from "@/data/popularServices"
import countryToCurrency from "country-to-currency"

const subscriptionSchema = z.object({
  service: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  cost: z.object({
    amount: z.number().min(0.01, "Cost must be greater than 0"),
    currency: z.string().min(1, "Currency is required"),
  }),
  billingCycle: z.object({
    value: z.number().min(1, "Billing cycle value must be at least 1"),
    unit: z.enum(["day", "month", "year"]),
  }),
  nextRenewal: z.string().min(1, "Next renewal date is required"),
  status: z.enum(["active", "paused", "cancelled", "expired"]),
  metadata: z.object({
    color: z.string().optional(),
    url: z.string().url().optional().or(z.literal("")),
    notes: z.string().optional(),
  }).optional(),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

interface SubscriptionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: SubscriptionFormData) => Promise<void>
  initialData?: Partial<SubscriptionFormData>
  title: string
}

const categories = [
  "Entertainment",
  "Music",
  "Development",
  "Design",
  "Productivity",
  "Health & Fitness",
  "News & Media",
  "Education",
  "Utilities",
  "Other",
]

// Comprehensive list of major global currencies
const currencies = [
  // Major global currencies
  "USD", // US Dollar
  "EUR", // Euro
  "GBP", // British Pound
  "JPY", // Japanese Yen
  "CHF", // Swiss Franc
  "CAD", // Canadian Dollar
  "AUD", // Australian Dollar
  "NZD", // New Zealand Dollar

  // Asian currencies
  "SGD", // Singapore Dollar
  "MYR", // Malaysian Ringgit
  "HKD", // Hong Kong Dollar
  "CNY", // Chinese Yuan
  "KRW", // South Korean Won
  "THB", // Thai Baht
  "IDR", // Indonesian Rupiah
  "INR", // Indian Rupee
  "PHP", // Philippine Peso
  "VND", // Vietnamese Dong
  "TWD", // Taiwan Dollar

  // Middle East & Africa
  "AED", // UAE Dirham
  "SAR", // Saudi Riyal
  "ZAR", // South African Rand
  "EGP", // Egyptian Pound
  "NGN", // Nigerian Naira

  // Europe
  "NOK", // Norwegian Krone
  "SEK", // Swedish Krona
  "DKK", // Danish Krone
  "PLN", // Polish Zloty
  "CZK", // Czech Koruna
  "HUF", // Hungarian Forint
  "RON", // Romanian Leu
  "BGN", // Bulgarian Lev
  "HRK", // Croatian Kuna
  "RUB", // Russian Ruble
  "UAH", // Ukrainian Hryvnia
  "TRY", // Turkish Lira

  // Americas
  "BRL", // Brazilian Real
  "MXN", // Mexican Peso
  "ARS", // Argentine Peso
  "CLP", // Chilean Peso
  "COP", // Colombian Peso
  "PEN", // Peruvian Sol
  "UYU", // Uruguayan Peso

  // Other major currencies
  "ILS", // Israeli Shekel
  "PKR", // Pakistani Rupee
  "BDT", // Bangladeshi Taka
  "LKR", // Sri Lankan Rupee
  "NPR", // Nepalese Rupee
  "IRR", // Iranian Rial
].sort() // Sort alphabetically for better UX

export function SubscriptionForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
}: SubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const defaultValues = useMemo((): SubscriptionFormData => {
    // Detect user's currency based on timezone (primary) and locale (fallback)
    const getUserCurrency = () => {
      try {
        // Primary: Timezone-based detection (most accurate)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

        const timezoneToCurrency = {
          // Southeast Asia
          'Asia/Kuala_Lumpur': 'MYR',
          'Asia/Singapore': 'SGD',
          'Asia/Bangkok': 'THB',
          'Asia/Jakarta': 'IDR',
          'Asia/Manila': 'PHP',
          'Asia/Ho_Chi_Minh': 'VND',

          // East Asia
          'Asia/Tokyo': 'JPY',
          'Asia/Seoul': 'KRW',
          'Asia/Shanghai': 'CNY',
          'Asia/Hong_Kong': 'HKD',
          'Asia/Taipei': 'TWD',

          // South Asia & Middle East
          'Asia/Kolkata': 'INR',
          'Asia/Dubai': 'AED',

          // United States (all major timezones)
          'America/New_York': 'USD',
          'America/Chicago': 'USD',
          'America/Denver': 'USD',
          'America/Los_Angeles': 'USD',
          'America/Phoenix': 'USD',
          'America/Anchorage': 'USD',
          'Pacific/Honolulu': 'USD',

          // Canada
          'America/Toronto': 'CAD',
          'America/Vancouver': 'CAD',
          'America/Montreal': 'CAD',

          // Europe
          'Europe/London': 'GBP',
          'Europe/Paris': 'EUR',
          'Europe/Berlin': 'EUR',
          'Europe/Madrid': 'EUR',
          'Europe/Rome': 'EUR',
          'Europe/Amsterdam': 'EUR',
          'Europe/Brussels': 'EUR',
          'Europe/Vienna': 'EUR',
          'Europe/Dublin': 'EUR',
          'Europe/Zurich': 'CHF',
          'Europe/Oslo': 'NOK',
          'Europe/Stockholm': 'SEK',
          'Europe/Copenhagen': 'DKK',

          // Oceania
          'Australia/Sydney': 'AUD',
          'Australia/Melbourne': 'AUD',
          'Australia/Perth': 'AUD',
          'Pacific/Auckland': 'NZD',
        }

        if (timezoneToCurrency[timezone]) {
          return timezoneToCurrency[timezone]
        }

        // Fallback: Locale-based detection for unmapped timezones
        const locale = navigator.language || navigator.languages?.[0] || 'en-US'
        const countryCode = locale.split('-')[1]?.toUpperCase()

        if (countryCode && countryToCurrency[countryCode]) {
          return countryToCurrency[countryCode]
        }

        // Final fallback to USD
        return 'USD'
      } catch {
        return 'USD'
      }
    }

    return {
      service: "",
      description: "",
      category: "",
      cost: {
        amount: 0,
        currency: getUserCurrency(),
      },
      billingCycle: {
        value: 1,
        unit: "month",
      },
      nextRenewal: new Date().toISOString().split('T')[0], // Default to today's date
      status: "active",
      metadata: {
        color: "#000000",
        url: "",
        notes: "",
      },
    }
  }, [])

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: defaultValues,
  })

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (open && initialData) {
      const resetValues = {
        service: initialData.service || "",
        description: initialData.description || "",
        category: initialData.category || "",
        cost: {
          amount: initialData.cost?.amount || 0,
          currency: initialData.cost?.currency || "USD",
        },
        billingCycle: {
          value: initialData.billingCycle?.value || 1,
          unit: initialData.billingCycle?.unit || "month",
        },
        nextRenewal: initialData.nextRenewal || "",
        status: initialData.status || "active",
        metadata: {
          color: initialData.metadata?.color || "",
          url: initialData.metadata?.url || "",
          notes: initialData.metadata?.notes || "",
        },
      }
      form.reset(resetValues)
    } else if (open) {
      form.reset(defaultValues)
    }
  }, [open, initialData, defaultValues, form])

  const handleSubmit = async (data: SubscriptionFormData) => {
    try {
      setIsLoading(true)
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the parent component
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-foreground border-border">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fill in the subscription details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name *</FormLabel>
                    <FormControl>
                      <AutocompleteInput
                        options={popularServices.map(service => ({
                          value: service.name,
                          label: service.name,
                          color: service.color,
                          description: service.category,
                          metadata: { category: service.category }
                        }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        onSelectOption={(option) => {
                          // Auto-set the category when a suggested service is selected
                          if (option.metadata?.category) {
                            form.setValue('category', option.metadata.category)
                          }
                        }}
                        placeholder="Netflix, Spotify, Custom Service..."
                        maxSuggestions={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the service" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost.amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="9.99"
                        {...field}
                        value={field.value?.toString() || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
                          field.onChange(isNaN(value) ? 0 : value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost.currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="billingCycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Cycle *</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        if (value === "monthly") {
                          field.onChange({ value: 1, unit: "month" })
                        } else if (value === "annually") {
                          field.onChange({ value: 1, unit: "year" })
                        } else if (value === "custom") {
                          field.onChange({ value: 7, unit: "day" })
                        }
                      }}
                      value={
                        field.value?.value === 1 && field.value?.unit === "month" ? "monthly" :
                        field.value?.value === 1 && field.value?.unit === "year" ? "annually" :
                        field.value?.unit === "day" ? "custom" : "monthly"
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                        <SelectItem value="custom">Every N days</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show custom days input when "Every N days" is selected */}
            <FormField
              control={form.control}
              name="billingCycle"
              render={({ field }) => (
                field.value?.unit === "day" ? (
                  <FormItem>
                    <FormLabel>Number of Days *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="7"
                        min="1"
                        max="365"
                        value={field.value?.value?.toString() || ""}
                        onChange={(e) => {
                          const days = e.target.value === "" ? 7 : parseInt(e.target.value)
                          field.onChange({
                            value: isNaN(days) || days < 1 ? 7 : Math.min(days, 365),
                            unit: "day"
                          })
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                ) : null
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nextRenewal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Renewal Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">
                          <Badge variant="default">Active</Badge>
                        </SelectItem>
                        <SelectItem value="paused">
                          <Badge variant="secondary">Paused</Badge>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <Badge variant="destructive">Cancelled</Badge>
                        </SelectItem>
                        <SelectItem value="expired">
                          <Badge variant="outline">Expired</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metadata.color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Color</FormLabel>
                    <FormControl>
                      <Input
                        type="color"
                        {...field}
                        value={field.value || "#000000"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://service.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="metadata.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes about this subscription" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? (title.includes("Add") ? "Adding..." : "Updating...")
                  : (title.includes("Add") ? "Add Subscription" : "Update Subscription")
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}