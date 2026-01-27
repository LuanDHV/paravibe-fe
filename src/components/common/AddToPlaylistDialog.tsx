// src/components/common/AddToPlaylistDialog.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { playlistsApi } from "@/api/playlists";
import { useAuthStore } from "@/stores/auth";
import { Song, Playlist } from "@/types";

interface AddToPlaylistDialogProps {
  song: Song;
  children?: React.ReactNode;
}

export function AddToPlaylistDialog({
  song,
  children,
}: AddToPlaylistDialogProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Get user ID properly - handle both string and number
  const userId = user?.id || user?.userId;

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["user-playlists", userId],
    queryFn: () => {
      console.log("Fetching playlists for userId:", userId);
      return userId ? playlistsApi.getUserPlaylists(String(userId)) : [];
    },
    enabled: !!userId && isOpen,
  });

  const addToPlaylistMutation = useMutation({
    mutationFn: ({
      playlistId,
      songId,
    }: {
      playlistId: string;
      songId: string;
    }) => playlistsApi.addSong(playlistId, songId),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["playlist", variables.playlistId],
      });

      // Snapshot the previous value
      const previousPlaylist = queryClient.getQueryData([
        "playlist",
        variables.playlistId,
      ]);

      // Optimistically update the playlist
      queryClient.setQueryData<Playlist>(
        ["playlist", variables.playlistId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            songs: [...old.songs, song], // Add the song optimistically
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousPlaylist, variables };
    },
    onSuccess: (_, variables) => {
      // Invalidate all playlist-related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["playlist", variables.playlistId],
      });
      queryClient.invalidateQueries({ queryKey: ["user-playlists"] });
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["user-playlists", user.id],
        });
      }
      setIsOpen(false);
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPlaylist) {
        queryClient.setQueryData(
          ["playlist", variables.playlistId],
          context.previousPlaylist
        );
      }
      console.error("Failed to add song to playlist:", error);
    },
  });

  const handleAddToPlaylist = (playlistId: string) => {
    addToPlaylistMutation.mutate({
      playlistId,
      songId: song.id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Add to Playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-4 text-gray-400">
              Loading playlists...
            </div>
          ) : playlists && playlists.length > 0 ? (
            playlists.map((playlist) => (
              <Button
                key={playlist.id}
                variant="ghost"
                className="w-full justify-start text-left text-white hover:bg-gray-800"
                onClick={() => handleAddToPlaylist(playlist.id)}
                disabled={addToPlaylistMutation.isPending}
              >
                {playlist.name}
              </Button>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400">
              No playlists found. Create one first.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
