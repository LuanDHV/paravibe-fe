// src/app/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Music, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { historyApi } from "@/api/history";
import { playlistsApi } from "@/api/playlists";
import { songsApi } from "@/api/songs";
import { recommendationsApi } from "@/api/recommendations";
import { authApi } from "@/api/auth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { SongCard } from "@/components/common/SongCard";
import { RecommendationSection } from "@/components/common/RecommendationSection";

export default function ProfilePage() {
  const { user } = useAuthStore();

  // Reload user profile on mount to ensure userId is set
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await authApi.getProfile();
        if (profile) {
          useAuthStore.getState().updateUser(profile);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    if (user && !user.userId) {
      loadUserProfile();
    }
  }, [user]);

  const userId = user?.userId || user?.id;

  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ["user-history", userId],
    queryFn: () => (userId ? historyApi.getUserHistory(String(userId)) : []),
    enabled: !!userId,
  });

  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ["user-playlists", userId],
    queryFn: () =>
      userId ? playlistsApi.getUserPlaylists(String(userId)) : [],
    enabled: !!userId,
  });

  // Fetch AI recommendations for user
  const { data: aiRecommendations, isLoading: aiRecLoading } = useQuery({
    queryKey: ["ai-recommendations", userId],
    queryFn: () =>
      userId ? recommendationsApi.getForUser(String(userId), 20) : [],
    enabled: !!userId,
  });

  const recentSongIds = history
    ?.filter((h) => h.action === "PLAY")
    .sort(
      (a, b) =>
        new Date(b.listenedAt).getTime() - new Date(a.listenedAt).getTime()
    )
    .slice(0, 6)
    .map((h) => h.songId)
    .filter((songId, index, arr) => arr.indexOf(songId) === index); // Remove duplicates

  // Fetch full song data for recent songs
  const { data: recentSongsData, isLoading: recentSongsLoading } = useQuery({
    queryKey: ["recent-songs-data", recentSongIds],
    queryFn: async () => {
      if (!recentSongIds || recentSongIds.length === 0) return [];

      const songPromises = recentSongIds.map((songId) =>
        songsApi.getById(songId)
      );
      const songs = await Promise.all(songPromises);
      return songs;
    },
    enabled: !!recentSongIds && recentSongIds.length > 0,
  });

  if (
    historyLoading ||
    playlistsLoading ||
    recentSongsLoading ||
    aiRecLoading
  ) {
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
    history?.reduce((acc, h) => acc + h.durationListened, 0) || 0;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-linear-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {(user.name || user.username || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {user.name || user.username}
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
        {recentSongsData && recentSongsData.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentSongsData.map((song, index) => (
              <SongCard key={`${song.id}-${index}`} song={song} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No songs played yet</p>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      {aiRecommendations && aiRecommendations.length > 0 && (
        <RecommendationSection
          title="Recommended For You"
          subtitle="AI-powered recommendations based on your listening history"
          recommendations={aiRecommendations}
        />
      )}
    </div>
  );
}
