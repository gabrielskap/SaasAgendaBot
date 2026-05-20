/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

// Base URL can be configured from environment or fallback to relative API path
const BASE_URL = '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach authentication tokens dynamically if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agendabot_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Multi-tenant header context
    const tenantId = localStorage.getItem('agendabot_tenant_id') || 'tenant-1';
    if (config.headers) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors, refresh tokens, and auto log out on expired credentials
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expiration)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Mocking refresh token flow
        const refreshToken = localStorage.getItem('agendabot_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Simulate refresh request
        const response = { data: { token: 'new_mock_token_abc123' } }; // api.post('/auth/refresh', { refreshToken })
        
        localStorage.setItem('agendabot_token', response.data.token);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, purge auth state and redirect to login
        localStorage.removeItem('agendabot_token');
        localStorage.removeItem('agendabot_refresh_token');
        
        // Custom dispatch event or local redirect
        window.dispatchEvent(new CustomEvent('auth_unauthorized'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// High quality mock endpoints wrapper for mock demonstration
export const mockedApiService = {
  get: async <T>(url: string, mockResponse: T): Promise<T> => {
    // Artificial latency for visual UX loading state checking
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockResponse;
  },
  post: async <T>(url: string, data: any, mockResponse: T): Promise<T> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockResponse;
  },
};
