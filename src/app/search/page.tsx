// src/app/search/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { songsApi } from "@/api/songs";
import { SongCard } from "@/components/common/SongCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppStore } from "@/stores/app";
import { Song } from "@/types";

export default function SearchPage() {
  const { searchQuery } = useAppStore();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchQuery);

  const debouncedQuery = useDebounce(query, 300);

  // Initialize query from URL params
  useEffect(() => {
    const searchParam = searchParams.get("q");
    if (searchParam) setQuery(searchParam);
  }, [searchParams]);

  const {
    data: rawResults,
    isLoading,
    error,
    refetch,
  } = useQuery<Song[] | { data: Song[]; total: number }>({
    queryKey: ["search-songs", debouncedQuery],
    queryFn: () => {
      if (debouncedQuery) {
        return songsApi.getAll({
          title: debouncedQuery,
          limit: 1000,
        });
      } else {
        return songsApi.getAll({ limit: 50 });
      }
    },
    enabled: true,
  });

  // Normalize the data to always be an array of songs
  const searchResults = rawResults
    ? Array.isArray(rawResults)
      ? { data: rawResults, total: rawResults.length }
      : "data" in rawResults
      ? { data: rawResults.data, total: rawResults.total }
      : { data: [], total: 0 }
    : { data: [], total: 0 };

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Search</h1>

        {/* Search Input */}
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for songs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Search Results */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message="Failed to search" onRetry={refetch} />
      ) : searchResults?.data?.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {debouncedQuery ? `Songs for "${debouncedQuery}"` : "All Songs"}
            </h2>
            <p className="text-gray-400 text-sm">
              {searchResults.total} songs found
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {searchResults.data.map((song: Song, index: number) => (
              <SongCard key={`${song.id}-${index}`} song={song} />
            ))}
          </div>
        </div>
      ) : debouncedQuery ? (
        <div className="text-center py-12">
          <SearchIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-400">
            Try searching for a different song title
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Start searching
          </h3>
          <p className="text-gray-400">Search for songs by title</p>
        </div>
      )}
    </div>
  );
}
