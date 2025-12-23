// src/api/history.ts
import { api } from "@/lib/api";
import { HistoryItem, ApiResponse } from "@/types";

export const historyApi = {
  getUserHistory: async (
    userId: string,
    limit: number = 50
  ): Promise<HistoryItem[]> => {
    const response = await api.get<ApiResponse<HistoryItem[]>>(
      `/users/${userId}/history`,
      {
        params: { limit },
      }
    );
    return response.data.data;
  },

  addHistory: async (data: {
    songId: string;
    action: "PLAY" | "SKIP" | "LIKE";
    duration: number;
  }): Promise<HistoryItem> => {
    const response = await api.post<ApiResponse<HistoryItem>>("/history", data);
    return response.data.data;
  },
};
