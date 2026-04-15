// src/api/history.ts
import { api } from "@/lib/api";
import { HistoryItem, TopSong } from "@/types";

export const historyApi = {
  addHistory: async (data: {
    songId: string;
    action: "PLAY" | "LIKE" | "SKIP";
    duration?: number;
  }): Promise<void> => {
    // Get user from auth store instead of localStorage
    const authData = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const user = authData?.state?.user;
    const userId = user?.userId || user?.id;
    if (!userId) {
      console.warn("No user found for history tracking");
      return;
    }

    try {
      await api.post(`/users/${userId}/history`, {
        songId: parseInt(data.songId, 10),
        durationListened: data.duration || 0,
        action: data.action,
      });
      console.log(`History recorded: ${data.action} for song ${data.songId}`);
    } catch (error) {
      console.error("Failed to record history:", error);
      throw error;
    }
  },

  getUserHistory: async (
    userId: string,
    limit: number = 50
  ): Promise<HistoryItem[]> => {
    const parsedId = parseInt(userId, 10);
    if (isNaN(parsedId)) {
      console.warn("Invalid userId:", userId);
      return [];
    }
    const response = await api.get(`/users/${parsedId}/history`, {
      params: { limit },
    });
    return response.data.data || response.data || [];
  },

  getTopSongs: async (
    userId: string,
    limit: number = 10
  ): Promise<TopSong[]> => {
    const parsedId = parseInt(userId, 10);
    if (isNaN(parsedId)) {
      console.warn("Invalid userId:", userId);
      return [];
    }
    const response = await api.get(`/users/${parsedId}/history/top-songs/all`, {
      params: { limit },
    });
    return response.data.data || response.data || [];
  },
};
