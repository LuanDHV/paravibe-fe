// src/api/songs.ts
import { api } from "@/lib/api";
import { Song, PaginatedResponse, ApiResponse } from "@/types";

export const songsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    genre?: string;
    artist?: string;
    search?: string;
  }): Promise<PaginatedResponse<Song>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Song>>>(
      "/songs",
      { params }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Song> => {
    const response = await api.get<ApiResponse<Song>>(`/songs/${id}`);
    return response.data.data;
  },

  getTrending: async (limit: number = 20): Promise<Song[]> => {
    const response = await api.get<ApiResponse<Song[]>>("/songs/trending", {
      params: { limit },
    });
    return response.data.data;
  },

  getRecentlyPlayed: async (
    userId: string,
    limit: number = 20
  ): Promise<Song[]> => {
    const response = await api.get<ApiResponse<Song[]>>(
      `/users/${userId}/recently-played`,
      {
        params: { limit },
      }
    );
    return response.data.data;
  },
};
