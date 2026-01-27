"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Users, Music } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to let Zustand restore from localStorage
    const timer = setTimeout(() => {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ADMIN") {
        router.push("/home");
      } else {
        setIsReady(true);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [user, router]);

  if (!isReady) {
    return <LoadingSpinner />;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-black/40 border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-white">ParaVibe Admin</h1>
          <p className="text-xs text-gray-400 mt-1">Management Dashboard</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link href="/admin">
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-white/10"
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
          </Link>

          <Link href="/admin/users">
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-white/10"
            >
              <Users className="mr-3 h-5 w-5" />
              Users
            </Button>
          </Link>

          <Link href="/admin/songs">
            <Button
              variant="ghost"
              className="w-full justify-start text-left hover:bg-white/10"
            >
              <Music className="mr-3 h-5 w-5" />
              Songs
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="px-3 py-2 rounded-lg bg-white/5">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">
              {user.name || user.email}
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
