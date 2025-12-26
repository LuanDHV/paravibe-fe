// src/api/recommendations.ts
import { api } from "@/lib/api";
import { Recommendation, ApiResponse } from "@/types";

export const recommendationsApi = {
  getForUser: async (
    userId: string,
    limit: number = 20
  ): Promise<Recommendation[]> => {
    const response = await api.get<ApiResponse<Recommendation[]>>(
      `/recommendations/user/${userId}`,
      {
        params: { topK: limit },
      }
    );
    return response.data.data || [];
  },

  getSimilarSongs: async (
    songId: string,
    limit: number = 10
  ): Promise<Recommendation[]> => {
    const response = await api.get<ApiResponse<Recommendation[]>>(
      `/recommendations/song/${songId}`,
      {
        params: { topK: limit },
      }
    );
    return response.data.data || [];
  },
};
