// src/api/playlists.ts
import { api } from "@/lib/api";
import { Playlist, Song, ApiResponse } from "@/types";

// Backend response types
interface BackendPlaylistResponse {
  playlistId?: number;
  id?: number;
  name: string;
  description?: string;
  userId?: number;
  user?: { id: number };
  songs?: BackendPlaylistSongResponse[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendPlaylistSongResponse {
  songId?: number;
  id?: number;
  title: string;
  artistId?: number;
  artistName?: string;
  artist?: { id: number; name: string };
  album?: string;
  duration?: number;
  genre?: string;
  releaseDate?: string;
  previewUrl?: string;
  imageUrl?: string;
  createdAt?: string;
}

// Adapter function to convert backend playlist format to frontend format
function adaptPlaylist(backendPlaylist: BackendPlaylistResponse): Playlist {
  console.log("Backend playlist:", backendPlaylist); // Debug logging

  return {
    id: (backendPlaylist.playlistId || backendPlaylist.id)?.toString() || "",
    name: backendPlaylist.name || "",
    description: backendPlaylist.description || "",
    userId:
      (backendPlaylist.userId || backendPlaylist.user?.id)?.toString() || "",
    songs: Array.isArray(backendPlaylist.songs)
      ? backendPlaylist.songs.map((song: BackendPlaylistSongResponse) =>
          adaptPlaylistSong(song)
        )
      : [],
    isPublic: backendPlaylist.isPublic || false,
    createdAt: backendPlaylist.createdAt || new Date().toISOString(),
    updatedAt:
      backendPlaylist.updatedAt ||
      backendPlaylist.createdAt ||
      new Date().toISOString(),
  };
}

// Adapter function to convert backend playlist song format to Song format
function adaptPlaylistSong(backendSong: BackendPlaylistSongResponse): Song {
  return {
    id: (backendSong.songId || backendSong.id)?.toString() || "",
    title: backendSong.title || "",
    artist: {
      id:
        (backendSong.artistId || backendSong.artist?.id)?.toString() ||
        "unknown",
      name: backendSong.artistName || backendSong.artist?.name || "",
      genres: backendSong.genre ? [backendSong.genre] : [],
      createdAt: backendSong.createdAt || new Date().toISOString(),
    },
    duration: backendSong.duration || 180,
    genre: backendSong.genre || "",
    releaseDate:
      backendSong.releaseDate || new Date().toISOString().split("T")[0],
    previewUrl: backendSong.previewUrl || "",
    imageUrl: backendSong.imageUrl || "",
    createdAt: backendSong.createdAt || new Date().toISOString(),
  };
}

export const playlistsApi = {
  getUserPlaylists: async (userId: string): Promise<Playlist[]> => {
    const response = await api.get(`/playlists/user/${parseInt(userId, 10)}`);
    const playlists = response.data.data || response.data || [];
    return Array.isArray(playlists)
      ? playlists.map((playlist: BackendPlaylistResponse) =>
          adaptPlaylist(playlist)
        )
      : [];
  },

  getById: async (id: string): Promise<Playlist> => {
    const response = await api.get(`/playlists/${parseInt(id, 10)}`);
    return adaptPlaylist(response.data.data || response.data);
  },

  create: async (data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<Playlist> => {
    const response = await api.post("/playlists", data);
    return adaptPlaylist(response.data);
  },

  update: async (
    id: string,
    data: Partial<{ name: string; description: string; isPublic: boolean }>
  ): Promise<Playlist> => {
    const response = await api.put<ApiResponse<Playlist>>(
      `/playlists/${parseInt(id, 10)}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/playlists/${parseInt(id, 10)}`);
  },

  addSong: async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await api.post(
      `/playlists/${parseInt(playlistId, 10)}/songs`,
      {
        songId: parseInt(songId, 10),
      }
    );
    return adaptPlaylist(response.data);
  },

  removeSong: async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await api.delete<ApiResponse<Playlist>>(
      `/playlists/${parseInt(playlistId, 10)}/songs/${parseInt(songId, 10)}`
    );
    return response.data.data;
  },
};
