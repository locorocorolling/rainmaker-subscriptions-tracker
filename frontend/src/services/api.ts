// API service for subscription management

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface ApiError {
  message: string
  error?: string
}

interface ApiResponse<T> {
  data: T
  message?: string
}

interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name?: string
  }
}

interface SubscriptionResponse {
  id: string
  service: string
  description?: string
  category: string
  cost: {
    amount: number
    currency: string
  }
  billingCycle: {
    value: number
    unit: 'day' | 'month' | 'year'
  }
  firstBillingDate: string
  nextRenewal: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  metadata?: {
    color?: string
    url?: string
    notes?: string
  }
  createdAt: string
  updatedAt: string
}

interface SubscriptionListResponse {
  subscriptions: SubscriptionResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface UpcomingRenewalsResponse {
  subscriptions: SubscriptionResponse[]
  days: number
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...(options.headers as Record<string, string> || {}),
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Subscriptions
  async getSubscriptions(params?: {
    status?: string
    category?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<SubscriptionListResponse>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/subscriptions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.request<ApiResponse<SubscriptionListResponse>>(endpoint)
  }

  async getSubscription(id: string): Promise<ApiResponse<SubscriptionResponse>> {
    return this.request<ApiResponse<SubscriptionResponse>>(`/subscriptions/${id}`)
  }

  async createSubscription(data: any): Promise<ApiResponse<SubscriptionResponse>> {
    return this.request<ApiResponse<SubscriptionResponse>>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSubscription(id: string, data: any): Promise<ApiResponse<SubscriptionResponse>> {
    return this.request<ApiResponse<SubscriptionResponse>>(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteSubscription(id: string): Promise<ApiResponse<SubscriptionResponse>> {
    return this.request<ApiResponse<SubscriptionResponse>>(`/subscriptions/${id}`, {
      method: 'DELETE',
    })
  }

  async getSubscriptionStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/subscriptions/stats')
  }

  async getUpcomingRenewals(days: number = 7): Promise<ApiResponse<UpcomingRenewalsResponse>> {
    return this.request<ApiResponse<UpcomingRenewalsResponse>>(`/subscriptions/upcoming?days=${days}`)
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }
}

export const api = new ApiService()