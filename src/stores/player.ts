// src/stores/player.ts
import { create } from "zustand";
import { Song, PlayerState } from "@/types";

interface PlayerActions {
  setCurrentSong: (song: Song | null) => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  nextSong: () => void;
  previousSong: () => void;
  playSong: (song: Song) => void;
}

type PlayerStore = PlayerState & PlayerActions;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // Initial state
  currentSong: null,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  queue: [],
  currentIndex: -1,

  // Actions
  setCurrentSong: (song: Song | null) => {
    set({ currentSong: song });
  },

  setPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  setVolume: (volume: number) => {
    set({ volume: Math.max(0, Math.min(1, volume)) });
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  addToQueue: (song: Song) => {
    const { queue } = get();
    set({ queue: [...queue, song] });
  },

  removeFromQueue: (index: number) => {
    const { queue, currentIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);

    // Adjust current index if necessary
    let newCurrentIndex = currentIndex;
    if (index < currentIndex) {
      newCurrentIndex = Math.max(0, currentIndex - 1);
    } else if (index === currentIndex && newQueue.length > 0) {
      newCurrentIndex = Math.min(currentIndex, newQueue.length - 1);
    }

    set({
      queue: newQueue,
      currentIndex: newCurrentIndex,
      currentSong: newQueue[newCurrentIndex] || null,
    });
  },

  clearQueue: () => {
    set({
      queue: [],
      currentIndex: -1,
      currentSong: null,
      isPlaying: false,
    });
  },

  nextSong: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const nextIndex = (currentIndex + 1) % queue.length;
    set({
      currentIndex: nextIndex,
      currentSong: queue[nextIndex],
    });
  },

  previousSong: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    set({
      currentIndex: prevIndex,
      currentSong: queue[prevIndex],
    });
  },

  playSong: (song: Song) => {
    const { queue } = get();
    const existingIndex = queue.findIndex((s) => s.id === song.id);

    if (existingIndex !== -1) {
      // Song already in queue, play it
      set({
        currentIndex: existingIndex,
        currentSong: song,
        isPlaying: true,
      });
    } else {
      // Add to queue and play
      const newQueue = [...queue, song];
      set({
        queue: newQueue,
        currentIndex: newQueue.length - 1,
        currentSong: song,
        isPlaying: true,
      });
    }
  },
}));
