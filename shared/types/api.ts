/**
 * Shared API response types for consistent contracts
 *
 * Response patterns:
 * - ApiResponse<T>: For data endpoints (subscriptions, user preferences)
 * - AuthResponse: For identity endpoints (login, register)
 * - MessageResponse: For simple operations (logout)
 */

// Generic API response wrapper for data endpoints
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Auth response (different pattern for identity endpoints)
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt?: Date;
  };
  message?: string;
}

// Simple message response for operations like logout
export interface MessageResponse {
  message: string;
}

// User preference types
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  currency?: string;
  timezone?: string;
  notifications?: {
    email?: boolean;
    renewalReminders?: boolean;
    reminderDays?: number;
  };
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}