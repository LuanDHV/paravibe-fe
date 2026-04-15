// src/components/common/GenreSection.tsx
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { songsApi } from "@/api/songs";
import { SongCard } from "./SongCard";

interface GenreSectionProps {
  genre: string;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function GenreSection({
  genre,
  title,
  subtitle,
  limit = 6,
}: GenreSectionProps) {
  const {
    data: songs,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`${genre}-songs`],
    queryFn: () => songsApi.getAll({ genre, limit }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show error sections, just skip them
  }

  if (!songs?.data || songs.data.length === 0) {
    return null; // Don't show empty sections
  }

  const displayTitle =
    title || `${genre.charAt(0).toUpperCase() + genre.slice(1)} Hits`;
  const displaySubtitle = subtitle || `The best ${genre} songs`;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{displayTitle}</h2>
          <p className="text-gray-400 text-sm">{displaySubtitle}</p>
        </div>
        <Link
          href={`/search?genre=${encodeURIComponent(genre)}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {songs.data.map((song, index) => (
          <SongCard key={`${song.id}-${index}`} song={song} />
        ))}
      </div>
    </section>
  );
}
