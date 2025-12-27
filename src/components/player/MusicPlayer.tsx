// src/components/player/MusicPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/player";
import { historyApi } from "@/api/history";
import Image from "next/image";

export function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    setPlaying,
    setVolume,
    setCurrentTime,
    setDuration,
    nextSong,
    previousSong,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = async () => {
      nextSong();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSong, setDuration, setCurrentTime, nextSong]);

  // Play/pause effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
      // Record play history when audio starts
      if (currentSong) {
        historyApi
          .addHistory({
            songId: currentSong.id,
            action: "PLAY",
            duration: 0,
          })
          .catch((error) => {
            console.error("Failed to record play history:", error);
          });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  // Volume effect
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    setPlaying(!isPlaying);
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = value[0];
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(0.7);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 z-50">
      <audio ref={audioRef} src={currentSong?.previewUrl} preload="metadata" />

      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {currentSong ? (
            <>
              <Image
                src={currentSong.imageUrl || "/placeholder-album.jpg"}
                alt={currentSong.title}
                width={48}
                height={48}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium truncate">
                  {currentSong.title}
                </p>
                <p className="text-gray-400 text-sm truncate">
                  {currentSong.artist.name}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-400 font-medium">No song selected</p>
                <p className="text-gray-500 text-sm">
                  Choose a song to start listening
                </p>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={currentSong ? previousSong : undefined}
              disabled={!currentSong}
              className={`text-white hover:text-white hover:bg-white/10 ${
                !currentSong ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={currentSong ? handlePlayPause : undefined}
              disabled={!currentSong}
              className={`text-white hover:text-white bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 ${
                !currentSong ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {currentSong && isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={currentSong ? nextSong : undefined}
              disabled={!currentSong}
              className={`text-white hover:text-white hover:bg-white/10 ${
                !currentSong ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">
              {currentSong ? formatTime(currentTime) : "--:--"}
            </span>
            <Slider
              value={[currentSong ? currentTime : 0]}
              max={currentSong ? duration || 30 : 100}
              step={1}
              onValueChange={currentSong ? handleProgressChange : undefined}
              disabled={!currentSong}
              className={`flex-1 ${!currentSong ? "opacity-50" : ""}`}
            />
            <span className="text-xs text-gray-400 w-10">
              {currentSong ? formatTime(duration || 30) : "--:--"}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center space-x-2 min-w-0 flex-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={currentSong ? toggleMute : undefined}
            disabled={!currentSong}
            className={`text-white hover:text-white hover:bg-white/10 ${
              !currentSong ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {currentSong && (isMuted || volume === 0) ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <div className="w-24">
            <Slider
              value={[currentSong ? (isMuted ? 0 : volume) : 0.7]}
              max={1}
              step={0.01}
              onValueChange={currentSong ? handleVolumeChange : undefined}
              disabled={!currentSong}
              className={!currentSong ? "opacity-50" : ""}
            />
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.previewUrl}
          preload="metadata"
          onError={(e) => {
            console.error("Audio loading error:", e);
          }}
        />
      )}
    </div>
  );
}
