// src/components/providers/Providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { autoRefreshToken } from "@/lib/utils";

interface ProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Component to handle automatic token refresh
function TokenRefresher() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check for token refresh every 5 minutes
    const interval = setInterval(() => {
      autoRefreshToken().catch(console.error);
    }, 5 * 60 * 1000); // 5 minutes

    // Also check immediately when component mounts
    autoRefreshToken().catch(console.error);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TokenRefresher />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
