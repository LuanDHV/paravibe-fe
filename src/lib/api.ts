// src/lib/api.ts
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const API_BASE_URL = "http://localhost:8080/api/v1";
const AI_API_BASE_URL = "http://localhost:8000/api/v1";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { tokens, logout } = useAuthStore.getState();
      if (tokens?.refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {
              refreshToken: tokens.refreshToken,
            }
          );

          const newTokens = refreshResponse.data.data;

          // Update tokens in store
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            useAuthStore.getState().refreshTokens(newTokens);
          }

          // Update cookie
          document.cookie = `auth-token=${newTokens.accessToken}; path=/; max-age=86400`;

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api.request(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          logout();
          // Use Next.js router instead of window.location for better UX
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout immediately
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// AI API instance
export const aiApi = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 15000,
});

aiApi.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
