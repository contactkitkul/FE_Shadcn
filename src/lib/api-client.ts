/**
 * API Client for FE_Shadcn Admin Dashboard
 * Communicates with BE_Internal backend API
 * No direct Supabase access - all auth/data goes through BE_Internal
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Generic API request handler
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;
  
  // Get auth token from localStorage
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth_token') 
    : null;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if required and available
  if (requireAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge with provided headers
  if (fetchOptions.headers) {
    Object.assign(headers, fetchOptions.headers);
  }

  // Make request
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: response.statusText 
    }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  // Return JSON response
  return response.json();
}

/**
 * Authentication API
 */
export const auth = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string) => {
    const response = await apiRequest<{ token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        requireAuth: false,
      }
    );
    
    // Store token
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  },

  /**
   * Get current user
   */
  getUser: () => apiRequest<{ user: any }>('/auth/me'),

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
  },
};

/**
 * Products API
 */
export const products = {
  getAll: (params?: Record<string, any>) =>
    apiRequest(`/admin/products?${new URLSearchParams(params)}`),

  getById: (id: string) =>
    apiRequest(`/admin/products/${id}`),

  create: (data: any) =>
    apiRequest('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/admin/products/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Orders API
 */
export const orders = {
  getAll: (params?: Record<string, any>) =>
    apiRequest(`/admin/orders?${new URLSearchParams(params)}`),

  getById: (id: string) =>
    apiRequest(`/admin/orders/${id}`),

  updateStatus: (id: string, status: string) =>
    apiRequest(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

/**
 * Customers API
 */
export const customers = {
  getAll: (params?: Record<string, any>) =>
    apiRequest(`/admin/customers?${new URLSearchParams(params)}`),

  getById: (id: string) =>
    apiRequest(`/admin/customers/${id}`),
};

/**
 * Discounts API
 */
export const discounts = {
  getAll: (params?: Record<string, any>) =>
    apiRequest(`/admin/discounts?${new URLSearchParams(params)}`),

  getById: (id: string) =>
    apiRequest(`/admin/discounts/${id}`),

  create: (data: any) =>
    apiRequest('/admin/discounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/admin/discounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/admin/discounts/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Shipments API
 */
export const shipments = {
  getAll: (params?: Record<string, any>) =>
    apiRequest(`/admin/shipments?${new URLSearchParams(params)}`),

  getById: (id: string) =>
    apiRequest(`/admin/shipments/${id}`),

  updateTracking: (id: string, trackingNumber: string, carrier: string) =>
    apiRequest(`/admin/shipments/${id}/tracking`, {
      method: 'PUT',
      body: JSON.stringify({ trackingNumber, carrier }),
    }),
};

/**
 * Payments API
 */
export const payments = {
  getAll: (params?: Record<string, any>) =>
    apiRequest(`/admin/payments?${new URLSearchParams(params)}`),

  getById: (id: string) =>
    apiRequest(`/admin/payments/${id}`),
};

/**
 * Refunds API
 */
export const refunds = {
  getAll: (params?: Record<string, any>) =>
    apiRequest(`/admin/refunds?${new URLSearchParams(params)}`),

  getById: (id: string) =>
    apiRequest(`/admin/refunds/${id}`),

  create: (data: any) =>
    apiRequest('/admin/refunds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/**
 * Analytics API
 */
export const analytics = {
  getDashboard: () =>
    apiRequest('/admin/analytics/dashboard'),

  getSales: (params?: Record<string, any>) =>
    apiRequest(`/admin/analytics/sales?${new URLSearchParams(params)}`),
};

/**
 * Export all APIs
 */
export const api = {
  auth,
  products,
  orders,
  customers,
  discounts,
  shipments,
  payments,
  refunds,
  analytics,
};

export default api;
