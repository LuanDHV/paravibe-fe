// src/api/songs.ts
import { api } from "@/lib/api";
import { Song } from "@/types";

// Backend response types
interface BackendSongResponse {
  songId?: number;
  id?: number;
  title: string;
  artistId?: number;
  artistName?: string;
  artist?: { artistId: number; name: string };
  album?: string;
  duration?: number;
  genre?: string;
  genres?: string[];
  releaseDate?: string;
  previewUrl?: string;
  imageUrl?: string;
  lyrics?: string;
  createdAt?: string;
}

interface BackendSongsListResponse {
  data: BackendSongResponse[];
  total: number;
  limit?: string;
  page?: number;
}

// Adapter function to convert backend song format to frontend format
function adaptSong(backendSong: BackendSongResponse): Song {
  // Debug logging to see what we're getting
  console.log("Backend song:", backendSong);

  const songId = backendSong.songId || backendSong.id;
  if (!songId) {
    console.error("Song missing ID:", backendSong);
  }

  return {
    id: songId?.toString() || "",
    title: backendSong.title || "",
    artist: {
      id:
        (backendSong.artistId || backendSong.artist?.artistId)?.toString() ||
        "",
      name: backendSong.artistName || backendSong.artist?.name || "",
      genres: backendSong.genres || [backendSong.genre || ""],
      createdAt: backendSong.createdAt || new Date().toISOString(),
    },
    album: backendSong.album,
    duration: backendSong.duration || 180,
    genre: backendSong.genre || "",
    releaseDate:
      backendSong.releaseDate || new Date().toISOString().split("T")[0],
    previewUrl: backendSong.previewUrl || "",
    imageUrl: backendSong.imageUrl,
    lyrics: backendSong.lyrics,
    createdAt: backendSong.createdAt || new Date().toISOString(),
  };
}

export const songsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    genre?: string;
    artist?: string;
    search?: string;
  }): Promise<{ data: Song[]; total: number }> => {
    const response = await api.get<BackendSongsListResponse>("/songs", {
      params,
    });
    const songs = response.data.data || [];
    return {
      data: Array.isArray(songs) ? songs.map(adaptSong) : [],
      total: response.data.total || songs.length,
    };
  },

  getById: async (id: string): Promise<Song> => {
    const response = await api.get<BackendSongResponse>(
      `/songs/${parseInt(id, 10)}`
    );
    return adaptSong(response.data);
  },

  getTrending: async (limit: number = 20): Promise<Song[]> => {
    const response = await api.get<BackendSongResponse[]>("/songs/trending", {
      params: { limit },
    });
    const songs = response.data || [];
    return Array.isArray(songs) ? songs.map(adaptSong) : [];
  },

  getRecentlyPlayed: async (
    userId: string,
    limit: number = 20
  ): Promise<Song[]> => {
    const response = await api.get<BackendSongResponse[]>(
      `/users/${parseInt(userId, 10)}/history`,
      {
        params: { limit },
      }
    );
    const songs = response.data || [];
    return Array.isArray(songs) ? songs.map(adaptSong) : [];
  },
};
