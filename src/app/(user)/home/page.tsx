/* eslint-disable @next/next/no-img-element */
// src/app/(user)/home/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { songsApi } from "@/api/songs";
import { recommendationsApi } from "@/api/recommendations";
import { artistsApi } from "@/api/artists";
import { useAuthStore } from "@/stores/auth";
import { SongCard } from "@/components/common/SongCard";
import { RecommendationSection } from "@/components/common/RecommendationSection";
import { GenreSection } from "@/components/common/GenreSection";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { MUSIC_GENRES } from "@/lib/constants";

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Redirect admin users to admin dashboard
    if (user?.role === "ADMIN") {
      router.push("/admin");
      return;
    }
  }, [isAuthenticated, user?.role, router]);

  // Genre display mapping
  const genreDisplayMap: Record<string, { title: string; subtitle: string }> = {
    pop: { title: "Pop Hits", subtitle: "Catchy pop songs and chart-toppers" },
    rock: {
      title: "Rock Anthems",
      subtitle: "Rock legends and modern rock hits",
    },
    hiphop: { title: "Hip Hop Central", subtitle: "The latest hip hop tracks" },
    edm: { title: "EDM Energy", subtitle: "Electronic dance music hits" },
    latin: { title: "Latin Vibes", subtitle: "Latin music and rhythms" },
    rnb: { title: "R&B Vibes", subtitle: "Soulful R&B and contemporary hits" },
    soul: { title: "Soul Classics", subtitle: "Timeless soul music" },
    indie: {
      title: "Indie Spotlight",
      subtitle: "Independent artists and fresh sounds",
    },
    alternative: {
      title: "Alternative Rock",
      subtitle: "Indie and alternative hits",
    },
    experimental: {
      title: "Experimental",
      subtitle: "Avant-garde and experimental music",
    },
    electronic: {
      title: "Electronic Vibes",
      subtitle: "Electronic and dance music",
    },
    house: { title: "House Party", subtitle: "House music and club hits" },
    techno: {
      title: "Techno Beats",
      subtitle: "Techno and electronic rhythms",
    },
    trap: { title: "Trap Zone", subtitle: "Trap beats and urban sounds" },
    grime: { title: "Grime Scene", subtitle: "Grime and UK rap" },
    drill: { title: "Drill Music", subtitle: "Drill beats and street anthems" },
    "k-pop": { title: "K-Pop Wave", subtitle: "Korean pop sensations" },
    "j-pop": { title: "J-Pop Hits", subtitle: "Japanese pop music" },
    reggaeton: {
      title: "Reggaeton Flow",
      subtitle: "Reggaeton and Latin trap",
    },
    reggae: { title: "Island Vibes", subtitle: "Reggae and tropical rhythms" },
    jazz: { title: "Jazz Classics", subtitle: "Timeless jazz standards" },
    classical: {
      title: "Classical Music",
      subtitle: "Masterpieces from the great composers",
    },
    country: {
      title: "Country Roads",
      subtitle: "Country music and folk songs",
    },
    folk: {
      title: "Folk & Acoustic",
      subtitle: "Folk music and acoustic gems",
    },
    metal: { title: "Metal Mayhem", subtitle: "Heavy metal and rock extremes" },
    punk: { title: "Punk Rock", subtitle: "Punk rock anthems" },
    disco: { title: "Disco Fever", subtitle: "Disco hits and dance classics" },
    funk: { title: "Funk Groove", subtitle: "Funk music and grooves" },
    gospel: { title: "Gospel Music", subtitle: "Spiritual gospel songs" },
    blues: {
      title: "Blues Legends",
      subtitle: "Classic blues and soulful tunes",
    },
    ambient: {
      title: "Ambient Sounds",
      subtitle: "Ambient and atmospheric music",
    },
    synthwave: { title: "Synthwave", subtitle: "Retro synth and 80s vibes" },
    lofi: { title: "Lo-Fi Beats", subtitle: "Chill lo-fi hip hop" },
    dubstep: { title: "Dubstep Drops", subtitle: "Dubstep and bass music" },
  };

  // Fetch trending songs
  const {
    data: trendingSongs,
    isLoading: trendingLoading,
    error: trendingError,
  } = useQuery({
    queryKey: ["trending-songs"],
    queryFn: () => songsApi.getTrending(6),
  });

  // Fetch recently played songs
  const {
    data: recentSongs,
    isLoading: recentLoading,
    error: recentError,
  } = useQuery({
    queryKey: ["recent-songs", user?.userId || user?.id],
    queryFn: () =>
      user
        ? songsApi.getRecentlyPlayed(String(user.userId || user.id), 6)
        : Promise.resolve([]),
    enabled: !!user && !!(user.userId || user.id),
  });

  // Fetch user recommendations
  const {
    data: recommendations,
    isLoading: recLoading,
    error: recError,
  } = useQuery({
    queryKey: ["user-recommendations", user?.userId || user?.id],
    queryFn: () =>
      user
        ? recommendationsApi.getForUser(String(user.userId || user.id), 6)
        : Promise.resolve([]),
    enabled: !!user && !!(user.userId || user.id),
  });

  // Fetch top artists
  const {
    data: topArtists,
    isLoading: artistsLoading,
    error: artistsError,
  } = useQuery({
    queryKey: ["top-artists"],
    queryFn: () => artistsApi.getTop(6),
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Recently Played
              </h2>
              <p className="text-gray-400 text-sm">Your listening history</p>
            </div>
            <Link
              href="/search?sort=recent"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentSongs.map((song, index) => (
              <SongCard key={`${song.id}-${index}`} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      {trendingSongs && trendingSongs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Trending Now
              </h2>
              <p className="text-gray-400 text-sm">Popular songs this week</p>
            </div>
            <Link
              href="/search?sort=trending"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingSongs.map((song, index) => (
              <SongCard key={`${song.id}-${index}`} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Top Artists */}
      {topArtists && topArtists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Top Artists
              </h2>
              <p className="text-gray-400 text-sm">Discover new artists</p>
            </div>
            <Link
              href="/artists"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topArtists.map((artist, index) => (
              <div
                key={`${artist.id}-${index}`}
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

      {/* Dynamic Genre Sections */}
      {MUSIC_GENRES.slice(0, 12).map((genre) => {
        const display = genreDisplayMap[genre] || {
          title: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Music`,
          subtitle: `Discover ${genre} tracks`,
        };
        return (
          <GenreSection
            key={genre}
            genre={genre}
            title={display.title}
            subtitle={display.subtitle}
            limit={6}
          />
        );
      })}
    </div>
  );
}
