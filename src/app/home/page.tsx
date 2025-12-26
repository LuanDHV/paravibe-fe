/* eslint-disable @next/next/no-img-element */
// src/app/home/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { songsApi } from "@/api/songs";
import { recommendationsApi } from "@/api/recommendations";
import { artistsApi } from "@/api/artists";
import { useAuthStore } from "@/stores/auth";
import { SongCard } from "@/components/common/SongCard";
import { RecommendationSection } from "@/components/common/RecommendationSection";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

export default function HomePage() {
  const { user } = useAuthStore();

  // Fetch trending songs
  const {
    data: trendingSongs,
    isLoading: trendingLoading,
    error: trendingError,
  } = useQuery({
    queryKey: ["trending-songs"],
    queryFn: () => songsApi.getTrending(20),
  });

  // Fetch recently played songs
  const {
    data: recentSongs,
    isLoading: recentLoading,
    error: recentError,
  } = useQuery({
    queryKey: ["recent-songs", user?.id],
    queryFn: () =>
      user ? songsApi.getRecentlyPlayed(user.id, 10) : Promise.resolve([]),
    enabled: !!user,
  });

  // Fetch user recommendations
  const {
    data: recommendations,
    isLoading: recLoading,
    error: recError,
  } = useQuery({
    queryKey: ["user-recommendations", user?.id],
    queryFn: () =>
      user ? recommendationsApi.getForUser(user.id, 10) : Promise.resolve([]),
    enabled: !!user,
  });

  // Fetch top artists
  const {
    data: topArtists,
    isLoading: artistsLoading,
    error: artistsError,
  } = useQuery({
    queryKey: ["top-artists"],
    queryFn: () => artistsApi.getTop(10),
  });

  if (trendingLoading || recentLoading || recLoading || artistsLoading) {
    return <LoadingSpinner />;
  }

  if (trendingError || recentError || recError || artistsError) {
    return <ErrorMessage message="Failed to load content" />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 18
            ? "afternoon"
            : "evening"}
          , {user?.username}!
        </h1>
        <p className="text-gray-400">
          Discover new music tailored just for you
        </p>
      </div>

      {/* For You Section */}
      {recommendations && recommendations.length > 0 && (
        <RecommendationSection
          title="For You"
          subtitle="AI-powered recommendations based on your listening history"
          recommendations={recommendations}
        />
      )}

      {/* Recently Played */}
      {recentSongs && recentSongs.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Recently Played
            </h2>
            <p className="text-gray-400 text-sm">Your listening history</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      {trendingSongs && trendingSongs.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Trending Now</h2>
            <p className="text-gray-400 text-sm">Popular songs this week</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Top Artists */}
      {topArtists && topArtists.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Top Artists</h2>
            <p className="text-gray-400 text-sm">Discover new artists</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topArtists.map((artist) => (
              <div
                key={artist.id}
                className="bg-white/5 rounded-lg p-4 text-center hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="w-20 h-20 bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                  {artist.imageUrl ? (
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {artist.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-white font-medium text-sm truncate">
                  {artist.name}
                </p>
                {artist.genres && artist.genres.length > 0 && (
                  <p className="text-gray-400 text-xs mt-1">
                    {artist.genres[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
