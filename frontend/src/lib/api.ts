import axios from 'axios';
import { DashboardSummary, HeatmapData, TrendData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (email: string, password: string, firstName?: string, lastName?: string) =>
    api.post('/auth/register', { email, password, first_name: firstName, last_name: lastName }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getMe: () => api.get('/auth/me'),
};

// Dashboard API
export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
  
  getHeatmap: (metricType: string, weeks: number = 26) =>
    api.get<HeatmapData>(`/dashboard/heatmap/${metricType}`, { params: { weeks } }),
  
  syncData: (days: number = 30) =>
    api.post('/dashboard/sync', {}, { params: { days } }),
  
  getTrends: (metric: string, period: string = '30d') =>
    api.get<TrendData>('/dashboard/trends', { params: { metric, period } }),
};

// Subscription API
export const subscriptionApi = {
  createCustomer: () => api.post('/subscriptions/create-customer'),
  
  createCheckout: () => api.post('/subscriptions/checkout'),
  
  getStatus: () => api.get('/subscriptions/status'),
  
  cancel: () => api.post('/subscriptions/cancel'),
  
  createPortal: () => api.post('/subscriptions/portal'),
};

export default api;
