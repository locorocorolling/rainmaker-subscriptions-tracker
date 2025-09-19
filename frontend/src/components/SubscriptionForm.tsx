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
import Cleave from "cleave.js/react"
import type { ChangeEvent } from "cleave.js/react/props"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { popularServices, searchServices, getServiceByName } from "@/data/popularServices"
import countryToCurrency from "country-to-currency"

const subscriptionSchema = z.object({
  service: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  cost: z.object({
    amount: z.number().min(0.01, "Cost must be greater than 0"),
    currency: z.string().min(1, "Currency is required"),
  }),
  billingCycle: z.object({
    value: z.number().min(1, "Billing cycle value must be at least 1"),
    unit: z.enum(["day", "month", "year"]),
  }),
  firstBillingDate: z.string().min(1, "First billing date is required"),
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
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const defaultValues = useMemo((): SubscriptionFormData => {
    // Detect user's currency based on timezone (primary) and locale (fallback)
    const getUserCurrency = () => {
      try {
        // Primary: Timezone-based detection (most accurate)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

        const timezoneToCurrency: Record<string, string> = {
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

        if (countryCode && countryCode in countryToCurrency) {
          return countryToCurrency[countryCode as keyof typeof countryToCurrency]
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
      firstBillingDate: new Date().toISOString().split('T')[0], // Default to today (when subscription starts)
      status: "active" as const,
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
        firstBillingDate: initialData.firstBillingDate || "",
        status: initialData.status || "active",
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fill in the subscription details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Essential Fields Section */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Service Name<span className="text-amber-500 ml-0.5">*</span></FormLabel>
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
                            form.setValue('category', option.metadata?.category)
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



              {/* Responsive Cost + Billing Cycle Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Move cost field here to be beside billing cycle */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost<span className="text-amber-500 ml-0.5">*</span></label>
                  <div className="flex relative">
                    <FormField
                      control={form.control}
                      name="cost.amount"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Cleave
                              placeholder="9.99"
                              className="flex h-10 w-full rounded-md border-0 ring-1 ring-border/40 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-r-none ring-r-0 focus:z-20 relative"
                              options={{
                                numeral: true,
                                numeralThousandsGroupStyle: 'thousand',
                                numeralDecimalScale: 2,
                                numeralDecimalMark: '.',
                                delimiter: ',',
                              }}
                              value={field.value || ''}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                // Extract raw numeric value (remove formatting)
                                const rawValue = e.target.rawValue || '0'
                                field.onChange(parseFloat(rawValue) || 0)
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
                        <FormItem className="w-20">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-l-none ring-l-0 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:z-20 relative">
                                <SelectValue placeholder="USD" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="min-w-[--radix-select-trigger-width] w-[--radix-select-trigger-width]">
                              {currencies.map((currency) => {
                                const isSelected = field.value === currency
                                return (
                                  <SelectItem key={currency} value={currency}>
                                    {currency}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="billingCycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Billing Cycle<span className="text-amber-500 ml-0.5">*</span></FormLabel>
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
              </div>

              {/* Show custom days input when "Every N days" is selected */}
              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  field.value?.unit === "day" ? (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Number of Days<span className="text-amber-500 ml-0.5">*</span></FormLabel>
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
                  ) : <></>
                )}
              />

              <FormField
                control={form.control}
                name="firstBillingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">First Billing Date<span className="text-amber-500 ml-0.5">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Fields Section */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-border/30 pb-2 w-full cursor-pointer"
              >
                <span>Additional</span>
                {showOptionalFields ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showOptionalFields && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal text-muted-foreground">Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Auto-detected from service" />
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal text-muted-foreground">Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description of the service"
                            className="text-sm"
                            {...field}
                          />
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
                        <FormLabel className="text-sm font-normal text-muted-foreground">Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Defaults to Active" />
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
              )}
            </div>


            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
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