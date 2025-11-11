// API utility functions for backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  // Products
  products: {
    getAll: () => fetchAPI('/products'),
    getById: (id: string) => fetchAPI(`/products/${id}`),
    create: (data: any) => fetchAPI('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/products/${id}`, { method: 'DELETE' }),
  },

  // Orders
  orders: {
    getAll: () => fetchAPI('/orders'),
    getById: (id: string) => fetchAPI(`/orders/${id}`),
    updateStatus: (id: string, status: string) => 
      fetchAPI(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  // Customers
  customers: {
    getAll: () => fetchAPI('/customers'),
    getById: (id: string) => fetchAPI(`/customers/${id}`),
  },

  // Discounts
  discounts: {
    getAll: () => fetchAPI('/discounts'),
    getById: (id: string) => fetchAPI(`/discounts/${id}`),
    create: (data: any) => fetchAPI('/discounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/discounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/discounts/${id}`, { method: 'DELETE' }),
  },

  // Shipments
  shipments: {
    getAll: () => fetchAPI('/shipments'),
    getByOrderId: (orderId: string) => fetchAPI(`/shipments/order/${orderId}`),
    updateStatus: (id: string, status: string) =>
      fetchAPI(`/shipments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
}
