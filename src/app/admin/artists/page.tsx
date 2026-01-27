"use client";

import { useState } from "react";
import { Trash2, Edit2, Music } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

export default function AdminArtistsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch artists
  const {
    data: artistsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-artists", page],
    queryFn: () => adminApi.getArtists(page, 20),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (artistId: string | number) =>
      adminApi.deleteArtist(String(artistId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-artists"] });
    },
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Artist Management</h1>
          <p className="text-gray-400 mt-2">Manage artists in your library</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Add New Artist
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Error State */}
      {error && (
        <ErrorMessage message="Failed to load artists. Please try again." />
      )}

      {/* Artists Grid */}
      {!isLoading && !error && (
        <>
          {artistsData?.data && artistsData.data.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {artistsData.data.map((artist) => (
                  <div
                    key={artist.id}
                    className="group bg-black/30 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 hover:shadow-lg transition"
                  >
                    {/* Artist Image */}
                    {artist.imageUrl ? (
                      <div className="w-full h-48 relative bg-black/50">
                        <img
                          src={artist.imageUrl}
                          alt={artist.name}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-linear-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                        <Music className="h-12 w-12 text-white opacity-70" />
                      </div>
                    )}

                    {/* Artist Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white truncate">
                          {artist.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {artist.totalSongs || 0} songs
                        </p>
                      </div>

                      {/* Bio */}
                      {artist.bio && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {artist.bio}
                        </p>
                      )}

                      {/* Genres */}
                      {artist.genres && artist.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {artist.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                          onClick={() => {
                            /* TODO: Open edit dialog */
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                          onClick={() => deleteMutation.mutate(artist.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {artistsData && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Total: {artistsData.total || 0} artists | Page {page}
                  </span>
                  <div className="space-x-2 flex">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!artistsData.hasNext}
                      onClick={() => setPage(page + 1)}
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Summary */}
              {artistsData && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Total Artists</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {artistsData.total || 0}
                    </p>
                  </div>
                  <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Total Songs</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {artistsData.data
                        ? artistsData.data.reduce(
                            (sum, a) => sum + (a.totalSongs || 0),
                            0
                          )
                        : 0}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400">No artists found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
