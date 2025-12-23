// src/api/auth.ts
import { api } from "@/lib/api";
import {
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  User,
  ApiResponse,
} from "@/types";

export const authApi = {
  login: async (
    data: LoginRequest
  ): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post<
      ApiResponse<{ user: User; tokens: AuthTokens }>
    >("/auth/login", data);
    return response.data.data;
  },

  register: async (
    data: RegisterRequest
  ): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post<
      ApiResponse<{ user: User; tokens: AuthTokens }>
    >("/auth/register", data);
    return response.data.data;
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await api.post<ApiResponse<AuthTokens>>("/auth/refresh", {
      refreshToken,
    });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/auth/profile");
    return response.data.data;
  },
};
