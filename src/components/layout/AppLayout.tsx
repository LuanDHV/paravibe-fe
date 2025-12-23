// src/components/layout/AppLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "./MainLayout";
import { AuthLayout } from "./AuthLayout";
import { useAuthStore } from "@/stores/auth";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
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
