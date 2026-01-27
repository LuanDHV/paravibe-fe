// src/components/auth/AdminRouteGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component for admin routes
 * Ensures user is authenticated and has admin role before rendering
 */
export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give Zustand time to restore from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated || user?.role !== "ADMIN") {
        router.push("/login");
      }
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user?.role, router]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null; // Will be redirected
  }

  if (user?.role !== "ADMIN") {
    return null; // Will be redirected
  }

  return <>{children}</>;
}
