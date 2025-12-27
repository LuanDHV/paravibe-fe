// src/app/playlist/[id]/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Play, Plus, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { playlistsApi } from "@/api/playlists";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { usePlayerStore } from "@/stores/player";

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params?.id as string;

  const { playSong } = usePlayerStore();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState({
    name: "",
    description: "",
  });

  const {
    data: playlist,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => playlistsApi.getById(playlistId),
  });

  const handlePlayAll = () => {
    if (playlist?.songs.length) {
      const { clearQueue, addToQueue } = usePlayerStore.getState();

      // Clear current queue and add all playlist songs
      clearQueue();
      playlist.songs.forEach((song) => addToQueue(song));

      // Play the first song
      playSong(playlist.songs[0]);
    }
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist) return;

    try {
      await playlistsApi.removeSong(playlist.id, songId);
      refetch();
    } catch (error) {
      console.error("Failed to remove song:", error);
    }
  };

  const handleEditPlaylist = async () => {
    if (!playlist || !editPlaylist.name.trim()) return;

    try {
      await playlistsApi.update(playlist.id, {
        name: editPlaylist.name,
        description: editPlaylist.description,
      });
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to update playlist:", error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;

    try {
      await playlistsApi.delete(playlist.id);
      router.push("/playlists");
    } catch (error) {
      console.error("Failed to delete playlist:", error);
    }
  };

  const openEditDialog = () => {
    if (!playlist) return;
    setEditPlaylist({
      name: playlist.name,
      description: playlist.description || "",
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !playlist) {
    return <ErrorMessage message="Failed to load playlist" />;
  }

  return (
    <div className="space-y-8">
      {/* Playlist Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8">
        <div className="relative">
          <div className="w-64 h-64 md:w-80 md:h-80 bg-linear-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-6xl font-bold">
              {playlist.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              Playlist
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-gray-300 mb-4">{playlist.description}</p>
            )}
            <p className="text-sm text-gray-400">
              {playlist.songs.length} songs • Created{" "}
              {new Date(playlist.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePlayAll}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8"
              disabled={playlist.songs.length === 0}
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Play All
            </Button>

            <Button variant="outline" size="lg" onClick={openEditDialog}>
              <Edit className="w-5 h-5 mr-2" />
              Edit
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="space-y-4">
        {playlist.songs.length > 0 ? (
          <div className="space-y-2">
            {playlist.songs.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 group"
              >
                <div className="w-8 text-center text-gray-400">{index + 1}</div>

                <Image
                  src={song.imageUrl || "/placeholder-album.jpg"}
                  alt={song.title}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded object-cover"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {song.title}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {song.artist.name}
                  </p>
                </div>

                <div className="text-gray-400 text-sm">
                  {Math.floor(song.duration / 60)}:
                  {(song.duration % 60).toString().padStart(2, "0")}
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playSong(song)}
                    className="text-white hover:text-white"
                  >
                    <Play className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSong(song.id)}
                    className="text-white hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Plus className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No songs in this playlist
            </h3>
            <p className="text-gray-400">Add some songs to get started</p>
          </div>
        )}
      </div>

      {/* Edit Playlist Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editPlaylist.name}
                onChange={(e) =>
                  setEditPlaylist((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Playlist name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                value={editPlaylist.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditPlaylist((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="A collection of my favorite songs..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditPlaylist}
                disabled={!editPlaylist.name.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Playlist Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Are you sure you want to delete &quot;{playlist?.name}&quot;? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePlaylist}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
