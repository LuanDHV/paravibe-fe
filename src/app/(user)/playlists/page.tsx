// src/app/(user)/playlists/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { Playlist } from "@/types";

export default function PlaylistsPage() {
  const { user } = useAuthStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPlaylist, setDeletingPlaylist] = useState<Playlist | null>(
    null
  );
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
  });
  const [editPlaylist, setEditPlaylist] = useState({
    name: "",
    description: "",
  });

  const {
    data: playlists,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-playlists", user?.userId || user?.id],
    queryFn: () =>
      user ? playlistsApi.getUserPlaylists(String(user.userId || user.id)) : [],
    enabled: !!user && !!(user.userId || user.id),
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

  const handleEditPlaylist = async () => {
    if (!editingPlaylist || !editPlaylist.name.trim()) return;

    try {
      await playlistsApi.update(editingPlaylist.id, {
        name: editPlaylist.name,
        description: editPlaylist.description,
      });
      setIsEditDialogOpen(false);
      setEditingPlaylist(null);
      refetch();
    } catch (error) {
      console.error("Failed to update playlist:", error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!deletingPlaylist) return;

    try {
      await playlistsApi.delete(deletingPlaylist.id);
      setIsDeleteDialogOpen(false);
      setDeletingPlaylist(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete playlist:", error);
    }
  };

  const openEditDialog = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setEditPlaylist({
      name: playlist.name,
      description: playlist.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (playlist: Playlist) => {
    setDeletingPlaylist(playlist);
    setIsDeleteDialogOpen(true);
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
                Are you sure you want to delete &quot;{deletingPlaylist?.name}
                &quot;? This action cannot be undone.
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

      {/* Playlists Grid */}
      {playlists && playlists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {playlists.map((playlist, index) => (
            <div
              key={`${playlist.id}-${index}`}
              className="group bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors relative"
            >
              <Link href={`/playlist/${playlist.id}`}>
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

              {/* Action buttons */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                  onClick={(e) => {
                    e.preventDefault();
                    openEditDialog(playlist);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-red-400 hover:text-red-300"
                  onClick={(e) => {
                    e.preventDefault();
                    openDeleteDialog(playlist);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
