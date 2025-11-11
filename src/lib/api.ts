// API utility functions for backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `API Error: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchAPIWithFormData(endpoint: string, formData: FormData) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `API Error: ${response.statusText}`)
  }

  return response.json()
}

function buildQueryString(params: PaginationParams): string {
  const query = new URLSearchParams()
  if (params.page) query.append('page', params.page.toString())
  if (params.limit) query.append('limit', params.limit.toString())
  if (params.sortBy) query.append('sortBy', params.sortBy)
  if (params.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params.search) query.append('search', params.search)
  return query.toString()
}

export const api = {
  // Products
  products: {
    getAll: (params?: PaginationParams) => {
      const query = params ? `?${buildQueryString(params)}` : ''
      return fetchAPI(`/products${query}`)
    },
    getById: (id: string) => fetchAPI(`/products/${id}`),
    create: (data: any) => fetchAPI('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/products/${id}`, { method: 'DELETE' }),
    bulkCreate: (products: any[]) => fetchAPI('/products/bulk', { method: 'POST', body: JSON.stringify({ products }) }),
    bulkUpdate: (updates: Array<{ id: string; data: any }>) => 
      fetchAPI('/products/bulk', { method: 'PUT', body: JSON.stringify({ updates }) }),
    bulkDelete: (ids: string[]) => fetchAPI('/products/bulk', { method: 'DELETE', body: JSON.stringify({ ids }) }),
  },

  // Product Variants
  productVariants: {
    getAll: (params?: PaginationParams) => {
      const query = params ? `?${buildQueryString(params)}` : ''
      return fetchAPI(`/product-variants${query}`)
    },
    getById: (id: string) => fetchAPI(`/product-variants/${id}`),
    create: (data: any) => fetchAPI('/product-variants', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/product-variants/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/product-variants/${id}`, { method: 'DELETE' }),
    bulkCreate: (variants: any[]) => fetchAPI('/product-variants/bulk', { method: 'POST', body: JSON.stringify({ variants }) }),
  },

  // Product Images
  productImages: {
    getAll: () => fetchAPI('/product-images'),
    getById: (id: string) => fetchAPI(`/product-images/${id}`),
    create: (data: any) => fetchAPI('/product-images', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/product-images/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/product-images/${id}`, { method: 'DELETE' }),
  },

  // Orders
  orders: {
    getAll: (params?: PaginationParams) => {
      const query = params ? `?${buildQueryString(params)}` : ''
      return fetchAPI(`/orders${query}`)
    },
    getById: (id: string) => fetchAPI(`/orders/${id}`),
    create: (data: any) => fetchAPI('/orders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) => 
      fetchAPI(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ orderStatus: status }) }),
  },

  // Customers
  customers: {
    getAll: (params?: PaginationParams) => {
      const query = params ? `?${buildQueryString(params)}` : ''
      return fetchAPI(`/customers${query}`)
    },
    getById: (id: string) => fetchAPI(`/customers/${id}`),
    create: (data: any) => fetchAPI('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Discounts
  discounts: {
    getAll: (params?: PaginationParams) => {
      const query = params ? `?${buildQueryString(params)}` : ''
      return fetchAPI(`/discounts${query}`)
    },
    getById: (id: string) => fetchAPI(`/discounts/${id}`),
    create: (data: any) => fetchAPI('/discounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/discounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/discounts/${id}`, { method: 'DELETE' }),
  },

  // Shipments
  shipments: {
    getAll: (params?: PaginationParams) => {
      const query = params ? `?${buildQueryString(params)}` : ''
      return fetchAPI(`/shipments${query}`)
    },
    getById: (id: string) => fetchAPI(`/shipments/${id}`),
    getByOrderId: (orderId: string) => fetchAPI(`/shipments?orderId=${orderId}`),
    create: (data: any) => fetchAPI('/shipments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/shipments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      fetchAPI(`/shipments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  // Images
  images: {
    upload: (formData: FormData) => fetchAPIWithFormData('/images/upload', formData),
    uploadFromUrl: (url: string, productId?: string) => 
      fetchAPI('/images/upload', { method: 'POST', body: JSON.stringify({ url, productId }) }),
  },

  // Auth
  auth: {
    login: (email: string, password: string) => 
      fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: any) => 
      fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
    me: () => fetchAPI('/me'),
  },
}
