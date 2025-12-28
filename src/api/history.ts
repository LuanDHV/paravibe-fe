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
    if (!user?.id) {
      console.warn("No user found for history tracking");
      return;
    }

    try {
      await api.post(`/users/${user.id}/history`, {
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
    const response = await api.get(`/users/${parseInt(userId, 10)}/history`, {
      params: { limit },
    });
    return response.data.data || response.data || [];
  },

  getTopSongs: async (
    userId: string,
    limit: number = 10
  ): Promise<TopSong[]> => {
    const response = await api.get(
      `/users/${parseInt(userId, 10)}/history/top-songs/all`,
      {
        params: { limit },
      }
    );
    return response.data.data || response.data || [];
  },
};
