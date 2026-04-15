"use client";

import { useAuthStore } from "@/stores/auth";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { Users, Music, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

export default function AdminDashboard() {
  const { user } = useAuthStore();

  // Fetch users and songs for overview
  const usersQuery = useQuery({
    queryKey: ["admin-users-overview"],
    queryFn: () => adminApi.getUsers(1, 10),
  });

  const songsQuery = useQuery({
    queryKey: ["admin-songs-overview"],
    queryFn: () => adminApi.getSongs(1, 10),
  });

  const isLoading = usersQuery.isLoading || songsQuery.isLoading;
  const error = usersQuery.error || songsQuery.error;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load dashboard" />;

  // Calculate stats from data
  const totalUsers = usersQuery.data?.total || 0;
  const totalSongs = songsQuery.data?.total || 0;
  const activeUsers =
    usersQuery.data?.data?.filter((u) => u.isActive).length || 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Welcome back, {user?.name || user?.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-linear-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">
                {totalUsers.toLocaleString()}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-400 opacity-60" />
          </div>
          <p className="text-blue-400 text-xs mt-4">From database</p>
        </div>

        {/* Total Songs */}
        <div className="bg-linear-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Songs</p>
              <p className="text-3xl font-bold text-white mt-2">
                {totalSongs.toLocaleString()}
              </p>
            </div>
            <Music className="w-12 h-12 text-purple-400 opacity-60" />
          </div>
          <p className="text-purple-400 text-xs mt-4">In library</p>
        </div>

        {/* Active Users */}
        <div className="bg-linear-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-3xl font-bold text-white mt-2">
                {activeUsers.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-400 opacity-60" />
          </div>
          <p className="text-green-400 text-xs mt-4">Đang hoạt động</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Users */}
        <div className="bg-black/30 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Latest Users
          </h3>
          <div className="space-y-3">
            {usersQuery.data?.data?.slice(0, 5).map((user, index) => (
              <div
                key={user.id ? String(user.id) : `user-${index}`}
                className="flex items-center justify-between py-2 border-b border-white/5"
              >
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    user.isActive
                      ? "bg-green-500/30 text-green-300"
                      : "bg-gray-500/30 text-gray-300"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Songs */}
        <div className="bg-black/30 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Latest Songs
          </h3>
          <div className="space-y-3">
            {songsQuery.data?.data?.slice(0, 5).map((song, index) => (
              <div
                key={song.id ? String(song.id) : `song-${index}`}
                className="flex items-center justify-between py-2 border-b border-white/5"
              >
                <div>
                  <p className="text-white font-medium truncate">
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {song.artist?.name || "Unknown"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
