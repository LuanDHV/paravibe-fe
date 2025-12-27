/* eslint-disable @next/next/no-img-element */
// src/app/home/page.tsx
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
// import { MUSIC_GENRES } from "@/lib/constants";

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

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
    queryKey: ["recent-songs", user?.id],
    queryFn: () =>
      user ? songsApi.getRecentlyPlayed(user.id, 6) : Promise.resolve([]),
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
      user ? recommendationsApi.getForUser(user.id, 6) : Promise.resolve([]),
    enabled: !!user,
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

  // Fetch new releases (recently added songs)
  const {
    data: newReleases,
    isLoading: newReleasesLoading,
    error: newReleasesError,
  } = useQuery({
    queryKey: ["new-releases"],
    queryFn: () => songsApi.getAll({ limit: 6, page: 1 }),
  });

  // Fetch discover weekly (mix of recommendations and trending)
  const {
    data: discoverWeekly,
    isLoading: discoverLoading,
    error: discoverError,
  } = useQuery({
    queryKey: ["discover-weekly", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user recommendations
      const userRecs = await recommendationsApi.getForUser(user.id, 3);

      // Get some trending songs
      const trending = await songsApi.getTrending(3);

      // Combine and deduplicate
      const combined = [...userRecs];
      for (const trend of trending) {
        if (!combined.find((rec) => rec.song.id === trend.id)) {
          combined.push({
            song: trend,
            similarityScore: 0.5, // Default score for trending songs
          });
        }
      }

      return combined.slice(0, 6);
    },
    enabled: !!user,
  });

  if (
    trendingLoading ||
    recentLoading ||
    recLoading ||
    artistsLoading ||
    newReleasesLoading ||
    discoverLoading
  ) {
    return <LoadingSpinner />;
  }

  if (
    trendingError ||
    recentError ||
    recError ||
    artistsError ||
    newReleasesError ||
    discoverError
  ) {
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

      {/* New Releases */}
      {newReleases && newReleases.data && newReleases.data.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                New Releases
              </h2>
              <p className="text-gray-400 text-sm">
                Latest songs added to our library
              </p>
            </div>
            <Link
              href="/search?sort=newest"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {newReleases.data.slice(0, 6).map((song, index) => (
              <SongCard key={`${song.id}-${index}`} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Genre Sections */}
      {[
        { genre: "rock", title: "Rock Hits", subtitle: "The best rock songs" },
        {
          genre: "pop",
          title: "Pop Hits",
          subtitle: "Catchy pop songs you can't resist",
        },
        {
          genre: "electronic",
          title: "Electronic Vibes",
          subtitle: "Electronic and dance music",
        },
        {
          genre: "alternative",
          title: "Alternative Rock",
          subtitle: "Indie and alternative hits",
        },
        {
          genre: "rnb",
          title: "R&B Vibes",
          subtitle: "Soulful R&B and contemporary hits",
        },
        {
          genre: "jazz",
          title: "Jazz Classics",
          subtitle: "Timeless jazz standards",
        },
        {
          genre: "hiphop",
          title: "Hip Hop Central",
          subtitle: "The latest hip hop tracks",
        },
        {
          genre: "classical",
          title: "Classical Music",
          subtitle: "Masterpieces from the great composers",
        },
      ].map(({ genre, title, subtitle }) => (
        <GenreSection
          key={genre}
          genre={genre}
          title={title}
          subtitle={subtitle}
          limit={6}
        />
      ))}

      {/* Discover Weekly */}
      {discoverWeekly && discoverWeekly.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Discover Weekly
            </h2>
            <p className="text-gray-400 text-sm">
              Your weekly mixtape of fresh music
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {discoverWeekly.map((rec, index) => (
              <SongCard key={`${rec.song.id}-${index}`} song={rec.song} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
