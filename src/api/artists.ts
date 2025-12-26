// src/api/artists.ts
import { api } from "@/lib/api";
import { Artist, PaginatedResponse, ApiResponse } from "@/types";

export const artistsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    genre?: string;
    search?: string;
  }): Promise<PaginatedResponse<Artist>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Artist>>>(
      "/artists",
      { params }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Artist> => {
    const response = await api.get<ApiResponse<Artist>>(`/artists/${id}`);
    return response.data.data;
  },

  getTop: async (limit: number = 10): Promise<Artist[]> => {
    const response = await api.get<ApiResponse<Artist[]>>("/artists/top", {
      params: { limit },
    });
    return response.data.data || [];
  },
};
