// src/components/layout/MainLayout.tsx
"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MusicPlayer } from "../player/MusicPlayer";
import { useAppStore } from "@/stores/app";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => useAppStore.getState().setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden pb-16">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
}
