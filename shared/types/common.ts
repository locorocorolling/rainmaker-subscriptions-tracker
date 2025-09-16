/**
 * Shared TypeScript types for common functionality across the Subscription Tracker
 */

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Validation schemas (for runtime validation)
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// User preferences
export interface NotificationTrigger {
  daysBefore: number; // Days before renewal to send notification
  enabled: boolean;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  triggers: NotificationTrigger[];
  notificationHour: number; // Hour of day to send notifications (0-23)
}

export interface UserPreferences {
  timezone: string; // IANA timezone identifier
  currency: string; // Default currency for new subscriptions
  notifications: NotificationPreferences;
}

// Constants for validation
export const VALIDATION_CONSTANTS = {
  MAX_BILLING_CYCLE_DAYS: 365,
  MAX_BILLING_CYCLE_MONTHS: 12,
  MAX_BILLING_CYCLE_YEARS: 5,
  MIN_BILLING_CYCLE_VALUE: 1,
  MAX_SERVICE_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000,
  SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
  MAX_AMOUNT_MINOR_UNITS: 999999999, // $9,999,999.99 in cents
} as const;
