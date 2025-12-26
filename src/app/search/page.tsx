// src/app/search/page.tsx
"use client";

import { useState, useEffect } from "react";
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
import { SongCard } from "@/components/common/SongCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppStore } from "@/stores/app";
import { SearchFilters } from "@/types";

export default function SearchPage() {
  const { searchQuery } = useAppStore();
  const [query, setQuery] = useState(searchQuery);
  const [filters, setFilters] = useState<SearchFilters>({});

  const debouncedQuery = useDebounce(query, 300);

  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["search-songs", debouncedQuery, filters],
    queryFn: () =>
      songsApi.getAll({
        search: debouncedQuery || undefined,
        genre: filters.genre,
        ...filters,
      }),
    enabled: !!debouncedQuery || Object.keys(filters).length > 0,
  });

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
              <SelectItem value="pop">Pop</SelectItem>
              <SelectItem value="rock">Rock</SelectItem>
              <SelectItem value="hip-hop">Hip Hop</SelectItem>
              <SelectItem value="electronic">Electronic</SelectItem>
              <SelectItem value="jazz">Jazz</SelectItem>
              <SelectItem value="classical">Classical</SelectItem>
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
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message="Failed to search songs" onRetry={refetch} />
      ) : searchResults &&
        searchResults.data &&
        searchResults.data.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {debouncedQuery ? `Results for "${debouncedQuery}"` : "All Songs"}
            </h2>
            <p className="text-gray-400 text-sm">
              {searchResults.total} songs found
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {searchResults.data.map((song, index) => (
              <SongCard key={`${song.id}-${index}`} song={song} />
            ))}
          </div>

          {/* Pagination would go here */}
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
