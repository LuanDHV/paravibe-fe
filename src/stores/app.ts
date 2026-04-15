// src/stores/app.ts
import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  searchQuery: string;
  currentView: "home" | "search" | "library" | "profile";
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCurrentView: (view: "home" | "search" | "library" | "profile") => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  searchQuery: "",
  currentView: "home",

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setCurrentView: (view: "home" | "search" | "library" | "profile") => {
    set({ currentView: view });
  },
}));
