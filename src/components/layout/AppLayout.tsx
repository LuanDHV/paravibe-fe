// src/components/layout/AppLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  useEffect(() => {
    // Check if we're hydrated by attempting to access store
    const checkHydration = () => {
      const store = useAuthStore.getState();
      // If store has data, we're likely hydrated
      if (store.user !== null || store.tokens !== null) {
        setIsHydrated(true);
      } else {
        // Small delay to allow hydration
        setTimeout(() => setIsHydrated(true), 50);
      }
    };

    checkHydration();
  }, []);

  // Handle redirects based on authentication state after hydration
  useEffect(() => {
    if (!isHydrated) return;

    const currentPath = window.location.pathname;

    // If not authenticated and on protected route, redirect to login
    if (
      !isAuthenticated &&
      ["/home", "/search", "/profile"].some((route) =>
        currentPath.startsWith(route)
      )
    ) {
      router.push("/login");
      return;
    }

    // If authenticated and on auth routes, redirect to home
    if (isAuthenticated && ["/login", "/register"].includes(currentPath)) {
      router.push("/home");
      return;
    }
  }, [isAuthenticated, isHydrated, router]);

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <MainLayout>{children}</MainLayout>;
}
