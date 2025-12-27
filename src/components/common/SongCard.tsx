/* eslint-disable @next/next/no-img-element */
// src/components/common/SongCard.tsx
"use client";

import { Play, Pause, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song } from "@/types";
import { usePlayerStore } from "@/stores/player";
import { AddToPlaylistDialog } from "./AddToPlaylistDialog";

interface SongCardProps {
  song: Song;
  showPlayButton?: boolean;
}

export function SongCard({ song, showPlayButton = true }: SongCardProps) {
  const { currentSong, isPlaying, playSong, setPlaying } = usePlayerStore();

  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const handlePlay = async () => {
    if (isCurrentSong) {
      setPlaying(!isPlaying);
    } else {
      playSong(song);
      // Track play history - TODO: Implement when API is ready
      // try {
      //   await historyApi.addHistory({
      //     songId: song.id,
      //     action: "PLAY",
      //     duration: 0, // Will be updated when song ends
      //   });
      // } catch (error) {
      //   console.error("Failed to track play history:", error);
      // }
    }
  };

  return (
    <div className="group bg-white/5 hover:bg-white/10 rounded-lg p-4 text-center transition-colors cursor-pointer">
      <div className="relative mb-3">
        <div className="w-20 h-20 bg-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center">
          <img
            src={song.imageUrl}
            alt={song.title}
            className="w-full h-full  object-cover"
          />
        </div>
        {showPlayButton && (
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <AddToPlaylistDialog song={song}>
              <Button
                size="icon"
                className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </AddToPlaylistDialog>
            <Button
              size="icon"
              className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 hover:bg-green-600"
              onClick={handlePlay}
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-white truncate">{song.title}</h3>
        <p className="text-sm text-gray-400 truncate">{song.artist.name}</p>
        <p className="text-xs text-gray-500">{song.genre}</p>
      </div>
    </div>
  );
}
