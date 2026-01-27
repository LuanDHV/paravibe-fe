// src/hooks/useAuthRestore.ts
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";

/**
 * Hook to restore auth state on page load
 * Ensures user stays logged in on F5 refresh
 */
export function useAuthRestore() {
  useEffect(() => {
    // Check if auth state is already loaded from localStorage
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        // Auth should already be restored by Zustand persist
        // But ensure isAuthenticated is set correctly
        if (state?.user && state?.tokens) {
          // Auth is valid, do nothing (already restored)
          return;
        }
      } catch (error) {
        console.error("Failed to parse auth storage:", error);
      }
    }
  }, []);
}
