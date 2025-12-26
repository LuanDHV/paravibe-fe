// src/components/layout/AppLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "./MainLayout";
import { AuthLayout } from "./AuthLayout";
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/api/auth";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, tokens } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Small delay to ensure Zustand persist has hydrated
    const timer = setTimeout(() => setIsHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto refresh token before expiration (every 30 minutes if authenticated)
  useEffect(() => {
    if (!isAuthenticated || !tokens?.refreshToken || isRefreshing) return;

    const refreshInterval = setInterval(async () => {
      if (isRefreshing) return;

      setIsRefreshing(true);
      try {
        const newTokens = await authApi.refresh(tokens.refreshToken);
        useAuthStore.getState().refreshTokens(newTokens);
      } catch {
        // If refresh fails, logout
        useAuthStore.getState().logout();
      } finally {
        setIsRefreshing(false);
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      clearInterval(refreshInterval);
      setIsRefreshing(false);
    };
  }, [isAuthenticated, tokens?.refreshToken, isRefreshing]);

  // Show auth layout during hydration to prevent flash
  if (!isHydrated) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  if (!isAuthenticated) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <MainLayout>{children}</MainLayout>;
}
