// src/app/profile/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Music, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { historyApi } from "@/api/history";
import { playlistsApi } from "@/api/playlists";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { SongCard } from "@/components/common/SongCard";

export default function ProfilePage() {
  const { user } = useAuthStore();

  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ["user-history", user?.id],
    queryFn: () => (user ? historyApi.getUserHistory(user.id) : []),
    enabled: !!user,
  });

  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ["user-playlists", user?.id],
    queryFn: () => (user ? playlistsApi.getUserPlaylists(user.id) : []),
    enabled: !!user,
  });

  if (historyLoading || playlistsLoading) {
    return <LoadingSpinner />;
  }

  if (historyError) {
    return <ErrorMessage message="Failed to load profile data" />;
  }

  if (!user) {
    return <ErrorMessage message="User not found" />;
  }

  // Calculate stats
  const totalPlays = history?.filter((h) => h.action === "PLAY").length || 0;
  const uniqueSongs = new Set(history?.map((h) => h.songId)).size || 0;
  const totalListeningTime =
    history?.reduce((acc, h) => acc + h.duration, 0) || 0;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const recentSongs = history
    ?.filter((h) => h.action === "PLAY")
    .sort(
      (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
    )
    .slice(0, 6)
    .map((h) => h.song);

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-linear-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {user.username}
            </h2>
            <p className="text-gray-400">{user.email}</p>
            <p className="text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-6 text-center">
          <Music className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalPlays}</div>
          <div className="text-sm text-gray-400">Songs Played</div>
        </div>

        <div className="bg-white/5 rounded-lg p-6 text-center">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{uniqueSongs}</div>
          <div className="text-sm text-gray-400">Unique Songs</div>
        </div>

        <div className="bg-white/5 rounded-lg p-6 text-center">
          <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {formatDuration(totalListeningTime)}
          </div>
          <div className="text-sm text-gray-400">Listening Time</div>
        </div>

        <div className="bg-white/5 rounded-lg p-6 text-center">
          <Calendar className="w-8 h-8 text-pink-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {playlists?.length || 0}
          </div>
          <div className="text-sm text-gray-400">Playlists</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Recently Played</h2>
        {recentSongs && recentSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No songs played yet</p>
          </div>
        )}
      </div>

      {/* Favorite Genres */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Your Top Genres</h2>
        <div className="flex flex-wrap gap-3">
          {history && history.length > 0 ? (
            Object.entries(
              history
                .filter((h) => h.action === "PLAY")
                .reduce((acc, h) => {
                  acc[h.song.genre] = (acc[h.song.genre] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
            )
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([genre, count]) => (
                <div
                  key={genre}
                  className="bg-white/10 rounded-full px-4 py-2 text-sm text-white"
                >
                  {genre} ({count})
                </div>
              ))
          ) : (
            <p className="text-gray-400">No genre data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
