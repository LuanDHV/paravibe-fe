// src/api/history.ts
import { api } from "@/lib/api";
import { HistoryItem, ApiResponse, TopSong } from "@/types";

export const historyApi = {
  addHistory: async (data: {
    songId: string;
    action: "PLAY" | "LIKE" | "SKIP";
    duration?: number;
  }): Promise<void> => {
    const { user } = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    if (!user?.id) return;

    await api.post(`/users/${user.id}/history`, {
      ...data,
      songId: parseInt(data.songId, 10),
    });
  },

  getUserHistory: async (
    userId: string,
    limit: number = 50
  ): Promise<HistoryItem[]> => {
    const response = await api.get<ApiResponse<HistoryItem[]>>(
      `/users/${parseInt(userId, 10)}/history`,
      {
        params: { limit },
      }
    );
    return response.data.data;
  },

  getTopSongs: async (
    userId: string,
    limit: number = 10
  ): Promise<TopSong[]> => {
    const response = await api.get<ApiResponse<TopSong[]>>(
      `/users/${parseInt(userId, 10)}/history/top-songs/all`,
      {
        params: { limit },
      }
    );
    return response.data.data || [];
  },
};
