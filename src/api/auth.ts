// src/api/auth.ts
import { api } from "@/lib/api";
import { LoginRequest, RegisterRequest, AuthTokens, User } from "@/types";

export const authApi = {
  login: async (
    data: LoginRequest
  ): Promise<{ user: User; tokens: AuthTokens }> => {
    // Login and get tokens
    const loginResponse = await api.post<AuthTokens>("/auth/login", data);

    // Get user profile with the new token
    const userResponse = await api.get<User>("/users/me", {
      headers: {
        Authorization: `Bearer ${loginResponse.data.accessToken}`,
      },
    });

    return {
      user: userResponse.data,
      tokens: loginResponse.data,
    };
  },

  register: async (
    data: RegisterRequest
  ): Promise<{ user: User; tokens: AuthTokens }> => {
    // Backend returns just a success message on register
    // We need to login after registration
    await api.post("/auth/register", data);

    // Auto-login after successful registration
    const loginResponse = await api.post<AuthTokens>("/auth/login", {
      email: data.email,
      password: data.password,
    });

    // Get user profile
    const userResponse = await api.get<User>("/users/me", {
      headers: {
        Authorization: `Bearer ${loginResponse.data.accessToken}`,
      },
    });

    return {
      user: userResponse.data,
      tokens: loginResponse.data,
    };
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await api.post<AuthTokens>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>("/users/me");
    return response.data;
  },
};
