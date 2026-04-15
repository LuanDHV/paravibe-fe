import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/api/auth";
import { AuthTokens } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Token refresh utility
let refreshPromise: Promise<AuthTokens> | null = null;

export const refreshAccessToken = async (): Promise<AuthTokens> => {
  // Prevent multiple simultaneous refresh requests
  if (refreshPromise) {
    return refreshPromise;
  }

  const { tokens, refreshTokens, logout } = useAuthStore.getState();

  if (!tokens?.refreshToken) {
    logout();
    throw new Error("No refresh token available");
  }

  try {
    refreshPromise = authApi.refresh(tokens.refreshToken);
    const newTokens = await refreshPromise;

    refreshTokens(newTokens);

    // Update cookie
    document.cookie = `auth-token=${newTokens.accessToken}; path=/; max-age=86400`;

    console.log("Access token refreshed successfully");
    return newTokens;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    logout();
    throw error;
  } finally {
    refreshPromise = null;
  }
};

// Check if token needs refresh (refresh 5 minutes before expiry)
export const shouldRefreshToken = (): boolean => {
  const { tokens } = useAuthStore.getState();

  if (!tokens?.accessToken) return false;

  try {
    // Decode JWT to get expiry time
    const payload = JSON.parse(atob(tokens.accessToken.split(".")[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;

    // Refresh if less than 5 minutes remaining
    return timeUntilExpiry < 5 * 60 * 1000;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Refresh on error to be safe
  }
};

// Auto refresh token if needed
export const autoRefreshToken = async (): Promise<void> => {
  if (shouldRefreshToken()) {
    await refreshAccessToken();
  }
};

// Extract role string from user role (handles both string and RoleObject)
export const getUserRole = (
  role?: string | { roleId: number; name: string }
): "USER" | "ADMIN" | null => {
  if (!role) return null;

  // If role is a string
  if (typeof role === "string") {
    const upperRole = role.toUpperCase();
    if (upperRole === "ADMIN") return "ADMIN";
    if (upperRole === "USER") return "USER";
    return null;
  }

  // If role is an object with name property
  if (typeof role === "object" && "name" in role) {
    const upperName = role.name.toUpperCase();
    if (upperName === "ADMIN") return "ADMIN";
    if (upperName === "USER") return "USER";
    return null;
  }

  return null;
};
