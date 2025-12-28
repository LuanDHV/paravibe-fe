// src/app/search/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { songsApi } from "@/api/songs";
import { artistsApi } from "@/api/artists";
import { SongCard } from "@/components/common/SongCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppStore } from "@/stores/app";
import { SearchFilters, Song, Artist } from "@/types";
import { MUSIC_GENRES } from "@/lib/constants";

export default function SearchPage() {
  const { searchQuery } = useAppStore();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchQuery);
  const [filters, setFilters] = useState<SearchFilters>({});

  const debouncedQuery = useDebounce(query, 300);

  // Initialize filters from URL params
  useEffect(() => {
    const genre = searchParams.get("genre");
    const sort = searchParams.get("sort");

    const initialFilters: SearchFilters = {};
    if (genre) initialFilters.genre = genre;

    setFilters(initialFilters);

    // Handle special sort parameters
    if (sort === "trending") {
      // For trending, we'll use a different API call
      setQuery(""); // Clear search query for trending
    } else if (sort === "newest") {
      // For newest, we can use the existing API with sorting
      setQuery("");
    } else if (sort === "recent") {
      // For recent, this would be user-specific
      setQuery("");
    }

    // Set initial query if provided
    const searchParam = searchParams.get("q");
    if (searchParam) setQuery(searchParam);
  }, [searchParams]);

  const {
    data: rawResults,
    isLoading,
    error,
    refetch,
  } = useQuery<Song[] | { data: Song[]; total: number }>({
    queryKey: [
      "search-songs",
      debouncedQuery,
      filters,
      searchParams.toString(),
    ],
    queryFn: () => {
      const sort = searchParams.get("sort");

      if (sort === "trending") {
        return songsApi.getTrending(50);
      } else if (sort === "newest") {
        return songsApi.getAll({ limit: 1000, page: 1 });
      } else if (sort === "recent") {
        // This would need user authentication, for now return empty
        return Promise.resolve([]);
      } else {
        return songsApi.getAll({
          search: debouncedQuery || undefined,
          genre: filters.genre,
          ...filters,
          limit: 1000,
        });
      }
    },
    enabled: true, // Always enabled since we handle URL params
  });

  const {
    data: artistResults,
    isLoading: artistsLoading,
    error: artistsError,
  } = useQuery({
    queryKey: ["search-artists", debouncedQuery],
    queryFn: () =>
      artistsApi.getAll({
        search: debouncedQuery || undefined,
        limit: 20,
      }),
    enabled: !!debouncedQuery,
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

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Search</h1>

        {/* Search Input */}
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for songs, artists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select
            onValueChange={(value: string) =>
              handleFilterChange("genre", value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {MUSIC_GENRES.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre.charAt(0).toUpperCase() +
                    genre.slice(1).replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value: string) =>
              handleFilterChange("artist", value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Artist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Artists</SelectItem>
              {/* Will populate with actual artists later */}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setFilters({});
              setQuery("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {isLoading || artistsLoading ? (
        <LoadingSpinner />
      ) : error || artistsError ? (
        <ErrorMessage message="Failed to search" onRetry={refetch} />
      ) : searchResults?.data?.length > 0 ||
        (artistResults?.data && artistResults.data.length > 0) ? (
        <div className="space-y-8">
          {/* Songs Results */}
          {searchResults &&
            searchResults.data &&
            searchResults.data.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {debouncedQuery
                      ? `Songs for "${debouncedQuery}"`
                      : "All Songs"}
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
            )}

          {/* Artists Results */}
          {artistResults &&
            artistResults.data &&
            artistResults.data.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {debouncedQuery
                      ? `Artists for "${debouncedQuery}"`
                      : "Artists"}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {artistResults.total || artistResults.data.length} artists
                    found
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {artistResults.data.map((artist: Artist, index: number) => (
                    <div
                      key={`${artist.id}-${index}`}
                      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                    >
                      <div className="aspect-square bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-4xl">🎤</span>
                      </div>
                      <h3 className="font-medium text-white truncate">
                        {artist.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {artist.genres?.join(", ") || "Artist"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      ) : debouncedQuery || Object.keys(filters).length > 0 ? (
        <div className="text-center py-12">
          <SearchIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Start searching
          </h3>
          <p className="text-gray-400">Search for songs, artists, or albums</p>
        </div>
      )}
    </div>
  );
}
