# Story 7.4-001: API Client Layer

## Metadata
- **Category:** Frontend Foundation
- **Priority:** High
- **Estimated Effort:** 5 hours
- **Dependencies:** Story 7.3-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Configure Axios with interceptors for authentication, token refresh, and error handling. Create API service modules.

## Tasks
1. Configure Axios instance
2. Add request interceptor (add auth token)
3. Add response interceptor (handle errors)
4. Implement token refresh logic
5. Create API service modules
6. Add retry logic for failed requests

## Technical Notes

### Axios Configuration
```typescript
// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@stores/authStore';
import { useUIStore } from '@stores/uiStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const response = await axios.post('/api/v1/auth/refresh', { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        useAuthStore.getState().login(useAuthStore.getState().user!, {
          accessToken,
          refreshToken: newRefreshToken,
        });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Show error notification
    const message = error.response?.data?.message || 'An error occurred';
    useUIStore.getState().addNotification({
      message,
      type: 'error',
    });

    return Promise.reject(error);
  }
);
```

### API Service Modules
```typescript
// src/api/auth.api.ts
import { apiClient } from './client';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/api/v1/auth/login', { email, password }),
  
  register: (data: any) =>
    apiClient.post('/api/v1/auth/register', data),
  
  logout: () =>
    apiClient.post('/api/v1/auth/logout'),
  
  forgotPassword: (email: string) =>
    apiClient.post('/api/v1/auth/forgot-password', { email }),
  
  resetPassword: (email: string, otp: string, newPassword: string) =>
    apiClient.post('/api/v1/auth/reset-password', { email, otp, newPassword }),
  
  getMe: () =>
    apiClient.get('/api/v1/auth/me'),
};

// src/api/companies.api.ts
export const companiesApi = {
  create: (data: any) =>
    apiClient.post('/api/v1/companies', data),
  
  getAll: (page: number = 1, limit: number = 10) =>
    apiClient.get(`/api/v1/companies?page=${page}&limit=${limit}`),
  
  getById: (id: string) =>
    apiClient.get(`/api/v1/companies/${id}`),
  
  update: (id: string, data: any) =>
    apiClient.put(`/api/v1/companies/${id}`, data),
  
  uploadLogo: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return apiClient.post(`/api/v1/companies/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
```

## Related Files
- `src/api/client.ts` (create)
- `src/api/auth.api.ts` (create)
- `src/api/companies.api.ts` (create)
- `src/api/users.api.ts` (create)
- `src/api/inventories.api.ts` (create)
- `src/api/items.api.ts` (create)
- `src/api/orders.api.ts` (create)
- `src/api/audits.api.ts` (create)
