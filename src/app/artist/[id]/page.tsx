// src/app/artist/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { artistsApi } from "@/api/artists";
import { songsApi } from "@/api/songs";
import { SongCard } from "@/components/common/SongCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { usePlayerStore } from "@/stores/player";

export default function ArtistDetailPage() {
  const params = useParams();
  const artistId = params?.id as string;

  const { playSong } = usePlayerStore();

  const {
    data: artist,
    isLoading: artistLoading,
    error: artistError,
  } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: () => artistsApi.getById(artistId),
  });

  const {
    data: artistSongs,
    isLoading: songsLoading,
    error: songsError,
  } = useQuery({
    queryKey: ["artist-songs", artistId],
    queryFn: () => songsApi.getAll({ artist: artistId, limit: 1000 }),
    enabled: !!artist,
  });

  const handlePlayAll = () => {
    if (artistSongs && artistSongs.data && artistSongs.data.length > 0) {
      const { clearQueue, addToQueue } = usePlayerStore.getState();

      // Clear current queue and add all artist songs
      clearQueue();
      artistSongs.data.forEach((song) => addToQueue(song));

      // Play the first song
      playSong(artistSongs.data[0]);
    }
  };

  if (artistLoading) {
    return <LoadingSpinner />;
  }

  if (artistError || !artist) {
    return <ErrorMessage message="Failed to load artist" />;
  }

  return (
    <div className="space-y-8">
      {/* Artist Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8">
        <div className="relative">
          <div className="w-64 h-64 md:w-80 md:h-80 bg-linear-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            {artist.imageUrl ? (
              <Image
                src={artist.imageUrl}
                alt={artist.name}
                width={320}
                height={320}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <span className="text-white text-6xl font-bold">
                {artist.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              Artist
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              {artist.name}
            </h1>
            {artist.genres && artist.genres.length > 0 && (
              <p className="text-gray-300 mb-4">{artist.genres.join(", ")}</p>
            )}
            <p className="text-sm text-gray-400">
              {artistSongs?.total || 0} songs
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePlayAll}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8"
              disabled={!artistSongs?.data || artistSongs.data.length === 0}
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Play All
            </Button>
          </div>
        </div>
      </div>

      {/* Songs Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Songs</h2>

        {songsLoading ? (
          <LoadingSpinner />
        ) : songsError ? (
          <ErrorMessage message="Failed to load songs" />
        ) : artistSongs && artistSongs.data && artistSongs.data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {artistSongs.data.map((song, index) => (
              <SongCard key={`${song.id}-${index}`} song={song} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">🎵</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No songs found
            </h3>
            <p className="text-gray-400">
              This artist doesn&apos;t have any songs yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
