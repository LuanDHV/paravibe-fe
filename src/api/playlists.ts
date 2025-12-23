// src/api/playlists.ts
import { api } from "@/lib/api";
import { Playlist, ApiResponse } from "@/types";

export const playlistsApi = {
  getUserPlaylists: async (userId: string): Promise<Playlist[]> => {
    const response = await api.get<ApiResponse<Playlist[]>>(
      `/playlists/user/${userId}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Playlist> => {
    const response = await api.get<ApiResponse<Playlist>>(`/playlists/${id}`);
    return response.data.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<Playlist> => {
    const response = await api.post<ApiResponse<Playlist>>("/playlists", data);
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<{ name: string; description: string; isPublic: boolean }>
  ): Promise<Playlist> => {
    const response = await api.put<ApiResponse<Playlist>>(
      `/playlists/${id}`,
      data
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/playlists/${id}`);
  },

  addSong: async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await api.post<ApiResponse<Playlist>>(
      `/playlists/${playlistId}/songs`,
      { songId }
    );
    return response.data.data;
  },

  removeSong: async (playlistId: string, songId: string): Promise<Playlist> => {
    const response = await api.delete<ApiResponse<Playlist>>(
      `/playlists/${playlistId}/songs/${songId}`
    );
    return response.data.data;
  },
};
