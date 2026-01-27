// src/app/(user)/artists/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { artistsApi } from "@/api/artists";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

export default function ArtistsPage() {
  const {
    data: artists,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-artists"],
    queryFn: () => artistsApi.getAll({ limit: 1000 }),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load artists" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Artists</h1>
        <p className="text-gray-400">
          Discover and explore your favorite artists
        </p>
      </div>

      {/* Artists Grid */}
      {artists && artists.data && artists.data.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {artists.data.map((artist, index) => (
            <a
              key={`${artist.id}-${index}`}
              href={`/artist/${artist.id}`}
              className="bg-white/5 rounded-lg p-4 text-center hover:bg-white/10 transition-colors group"
            >
              <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                {artist.imageUrl ? (
                  <Image
                    src={artist.imageUrl}
                    alt={artist.name}
                    width={96}
                    height={96}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {artist.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                {artist.name}
              </h3>
              <p className="text-sm text-gray-400">
                {artist.genres?.join(", ") || "Artist"}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">🎤</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No artists found
          </h3>
          <p className="text-gray-400">Check back later for new artists</p>
        </div>
      )}
    </div>
  );
}
