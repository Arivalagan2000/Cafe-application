import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-ea183f60`;

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, token } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`
  };
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API Error [${endpoint}]:`, data);
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API call failed [${endpoint}]:`, error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: { email, password }
    }),
  
  signup: (email: string, password: string, name: string, role: string) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: { email, password, name, role }
    }),
  
  getCurrentUser: (token: string) =>
    apiCall('/auth/me', { token })
};

// Menu API
export const menuApi = {
  getAll: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/menu${query}`);
  },
  
  getById: (id: string) =>
    apiCall(`/menu/${id}`),
  
  create: (menuItem: any, token: string) =>
    apiCall('/menu', {
      method: 'POST',
      body: menuItem,
      token
    }),
  
  update: (id: string, updates: any, token: string) =>
    apiCall(`/menu/${id}`, {
      method: 'PUT',
      body: updates,
      token
    }),
  
  delete: (id: string, token: string) =>
    apiCall(`/menu/${id}`, {
      method: 'DELETE',
      token
    })
};

// Order API
export const orderApi = {
  getAll: (token: string) =>
    apiCall('/orders', { token }),
  
  getById: (id: string, token: string) =>
    apiCall(`/orders/${id}`, { token }),
  
  create: (items: any[], notes: string, token: string) =>
    apiCall('/orders', {
      method: 'POST',
      body: { items, notes },
      token
    }),
  
  updateStatus: (id: string, status: string, token: string) =>
    apiCall(`/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
      token
    })
};

// Analytics API
export const analyticsApi = {
  get: (token: string) =>
    apiCall('/analytics', { token })
};

// Initialize sample data
export const initSampleData = () =>
  apiCall('/init-sample-data', { method: 'POST' });
