// src/app/playlists/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { playlistsApi } from "@/api/playlists";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useAuthStore } from "@/stores/auth";

export default function PlaylistsPage() {
  const { user } = useAuthStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
  });

  const {
    data: playlists,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-playlists", user?.id],
    queryFn: () => (user ? playlistsApi.getUserPlaylists(user.id) : []),
    enabled: !!user,
  });

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.name.trim()) return;

    try {
      await playlistsApi.create({
        name: newPlaylist.name,
        description: newPlaylist.description,
        isPublic: false,
      });
      setNewPlaylist({ name: "", description: "" });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to create playlist:", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load playlists" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Playlists</h1>
          <p className="text-gray-400 mt-1">
            Create and manage your music collections
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-500 hover:bg-purple-600">
              <Plus className="w-5 h-5 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newPlaylist.name}
                  onChange={(e) =>
                    setNewPlaylist((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="My Awesome Playlist"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  value={newPlaylist.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewPlaylist((prev) => ({
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
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylist.name.trim()}
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playlists Grid */}
      {playlists && playlists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {playlists.map((playlist, index) => (
            <Link
              key={`${playlist.id}-${index}`}
              href={`/playlist/${playlist.id}`}
              className="group bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors"
            >
              <div className="aspect-square bg-linear-to-br from-purple-500 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {playlist.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                  {playlist.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {playlist.songs.length} songs
                </p>
                {playlist.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {playlist.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Plus className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No playlists yet
          </h3>
          <p className="text-gray-400 mb-6">
            Create your first playlist to get started
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Playlist
          </Button>
        </div>
      )}
    </div>
  );
}
