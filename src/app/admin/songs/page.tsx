/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Music, Trash2, Edit2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import Image from "next/image";

interface EditingSong {
  id: string | number;
  title: string;
  genre?: string;
}

export default function AdminSongsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editingSong, setEditingSong] = useState<EditingSong | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editGenre, setEditGenre] = useState("");

  // Fetch songs
  const {
    data: songsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-songs", page],
    queryFn: () => adminApi.getSongs(page, 20),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (songId: string | number) =>
      adminApi.deleteSong(String(songId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-songs"] });
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (songData: {
      id: string | number;
      title: string;
      genre?: string;
    }) =>
      adminApi.updateSong(String(songData.id), {
        title: songData.title,
        genre: songData.genre,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-songs"] });
      setEditingSong(null);
    },
    onError: (error) => {
      console.error("Update error:", error);
    },
  });

  const handleEditClick = (song: any) => {
    console.log("Edit song clicked:", song);
    setEditingSong({
      id: song.id || 0,
      title: song.title || "",
      genre: song.genre || "",
    });
    setEditTitle(song.title || "");
    setEditGenre(song.genre || "");
  };

  const handleSaveEdit = () => {
    if (editingSong) {
      console.log("Saving song:", { editingSong, editTitle, editGenre });
      updateMutation.mutate({
        id: editingSong.id,
        title: editTitle,
        genre: editGenre,
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Song Management</h1>
          <p className="text-gray-400 mt-2">Manage songs</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Error State */}
      {error && (
        <ErrorMessage message="Failed to load songs. Please try again." />
      )}

      {/* Songs Table */}
      {!isLoading && !error && (
        <>
          <div className="bg-black/30 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-black/50 border-b border-white/10">
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Cover
                  </th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Title
                  </th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Artist
                  </th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Genre
                  </th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Release Date
                  </th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Duration
                  </th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Added
                  </th>
                </tr>
              </thead>
              <tbody>
                {songsData?.data && songsData.data.length > 0 ? (
                  songsData.data.map((song, index) => {
                    const songId = song.id || index + 1;
                    return (
                      <tr
                        key={String(songId)}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-black/50 border border-white/10 rounded flex items-center justify-center overflow-hidden">
                            {song.imageUrl ? (
                              <Image
                                src={song.imageUrl}
                                alt={song.title || "Song cover"}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <Music className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-white">{song.title}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {song.artist?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {song.genre || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {song.releaseDate
                            ? new Date(song.releaseDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {song.duration
                            ? `${Math.floor(song.duration / 60)}:${String(
                                song.duration % 60
                              ).padStart(2, "0")}`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {song.createdAt
                            ? new Date(song.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Music className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400">No songs found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {songsData && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Total: {songsData.total || 0} songs | Page {page} of{" "}
                {Math.ceil((songsData.total || 0) / 20)}
              </span>
              <div className="space-x-2 flex">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= Math.ceil((songsData.total || 1) / 20)}
                  onClick={() => setPage(page + 1)}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Summary */}
          {songsData && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total Songs</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {songsData.total || 0}
                </p>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total Duration</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {songsData.data
                    ? Math.floor(
                        songsData.data.reduce(
                          (sum, s) => sum + (s.duration || 0),
                          0
                        ) / 60
                      )
                    : 0}
                  h
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      {editingSong && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black/80 border border-white/10 rounded-xl p-8 max-w-md w-full mx-4 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Edit Song</h2>
              <button
                onClick={() => setEditingSong(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-black/30 border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre
                </label>
                <Input
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  className="bg-black/30 border border-white/10"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={() => setEditingSong(null)}
                variant="outline"
                className="flex-1 border-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
