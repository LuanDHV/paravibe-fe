// src/api/recommendations.ts
import { aiApi } from '@/lib/api';
import { Recommendation, ApiResponse } from '@/types';

export const recommendationsApi = {
  getForUser: async (userId: string, limit: number = 20): Promise<Recommendation[]> => {
    const response = await aiApi.get<ApiResponse<Recommendation[]>>(`/recommendations/user/${userId}`, {
      params: { limit },
    });
    return response.data.data;
  },

  getSimilarSongs: async (songId: string, limit: number = 10): Promise<Recommendation[]> => {
    const response = await aiApi.get<ApiResponse<Recommendation[]>>(`/recommendations/song/${songId}`, {
      params: { limit },
    });
    return response.data.data;
  },
};