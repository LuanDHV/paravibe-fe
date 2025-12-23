// src/components/layout/AppLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "./MainLayout";
import { AuthLayout } from "./AuthLayout";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Dynamically import and access store only on client side
    import("@/stores/auth").then(({ useAuthStore }) => {
      const authStore = useAuthStore.getState();
      setIsAuthenticated(authStore.isAuthenticated);
      setIsHydrated(true);
    });
  }, []);

  // Show loading or default layout during hydration
  if (!isHydrated) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  if (!isAuthenticated) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <MainLayout>{children}</MainLayout>;
}
