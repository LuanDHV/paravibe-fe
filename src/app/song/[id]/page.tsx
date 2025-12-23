// src/app/song/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Play, Heart, Plus, Clock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { songsApi } from "@/api/songs";
import { recommendationsApi } from "@/api/recommendations";
import { RecommendationSection } from "@/components/common/RecommendationSection";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { usePlayerStore } from "@/stores/player";
import { historyApi } from "@/api/history";

export default function SongDetailPage() {
  const params = useParams();
  const songId = params?.id as string;

  const { playSong } = usePlayerStore();

  const {
    data: song,
    isLoading: songLoading,
    error: songError,
  } = useQuery({
    queryKey: ["song", songId],
    queryFn: () => songsApi.getById(songId),
  });

  const { data: recommendations } = useQuery({
    queryKey: ["similar-songs", songId],
    queryFn: () => recommendationsApi.getSimilarSongs(songId, 10),
    enabled: !!song,
  });

  const handlePlay = async () => {
    if (song) {
      playSong(song);
      try {
        await historyApi.addHistory({
          songId: song.id,
          action: "PLAY",
          duration: 0,
        });
      } catch (error) {
        console.error("Failed to track play history:", error);
      }
    }
  };

  const handleLike = async () => {
    if (song) {
      try {
        await historyApi.addHistory({
          songId: song.id,
          action: "LIKE",
          duration: 0,
        });
      } catch (error) {
        console.error("Failed to like song:", error);
      }
    }
  };

  if (songLoading) {
    return <LoadingSpinner />;
  }

  if (songError || !song) {
    return <ErrorMessage message="Failed to load song details" />;
  }

  return (
    <div className="space-y-8">
      {/* Song Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8">
        <div className="relative">
          <Image
            src={song.artworkUrl || "/placeholder-album.jpg"}
            alt={song.title}
            width={300}
            height={300}
            className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-lg shadow-2xl"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              {song.title}
            </h1>
            <p className="text-xl text-gray-300 mb-1">{song.artist.name}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{song.genre}</span>
              <span>•</span>
              <span>{song.releaseDate}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(song.duration / 60)}:
                  {(song.duration % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePlay}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Play Preview
            </Button>

            <Button variant="outline" size="lg" onClick={handleLike}>
              <Heart className="w-5 h-5 mr-2" />
              Like
            </Button>

            <Button variant="outline" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add to Playlist
            </Button>
          </div>
        </div>
      </div>

      {/* Lyrics Section */}
      {song.lyrics && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Lyrics</h2>
          <div className="bg-white/5 rounded-lg p-6">
            <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {song.lyrics}
            </pre>
          </div>
        </div>
      )}

      {/* Similar Songs */}
      {recommendations && recommendations.length > 0 && (
        <RecommendationSection
          title="Similar Songs"
          subtitle="Songs you might like based on this track"
          recommendations={recommendations}
        />
      )}

      {/* Artist Info */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">About the Artist</h2>
        <div className="bg-white/5 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <Image
              src={song.artist.avatar || "/placeholder-artist.jpg"}
              alt={song.artist.name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                {song.artist.name}
              </h3>
              {song.artist.bio && (
                <p className="text-gray-300 text-sm leading-relaxed">
                  {song.artist.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {song.artist.genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
