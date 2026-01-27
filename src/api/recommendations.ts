// src/api/recommendations.ts
import { api } from "@/lib/api";
import { songsApi } from "@/api/songs";
import { Recommendation, AIRecSong } from "@/types";

export const recommendationsApi = {
  getForUser: async (
    userId: string,
    limit: number = 20
  ): Promise<Recommendation[]> => {
    const parsedId = parseInt(userId, 10);
    if (isNaN(parsedId)) {
      console.warn("Invalid userId:", userId);
      return [];
    }
    const response = await api.get<AIRecSong[]>(
      `/recommendations/user/${parsedId}`,
      {
        params: { topK: limit },
      }
    );
    const aiRecs = response.data || [];

    // Convert AI recommendations to full Recommendation objects
    const recommendations: Recommendation[] = await Promise.all(
      aiRecs.map(async (rec) => {
        try {
          const song = await songsApi.getById(rec.songId.toString());
          return {
            song,
            similarityScore: rec.score,
            reason: `Based on your listening history`,
          };
        } catch (error) {
          console.error(`Failed to fetch song ${rec.songId}:`, error);
          // Return a basic recommendation with partial data
          return {
            song: {
              id: rec.songId.toString(),
              title: rec.title,
              artist: {
                id: "unknown",
                name: rec.artistName,
                genres: [rec.genre],
                createdAt: new Date().toISOString(),
              },
              duration: 180,
              genre: rec.genre,
              releaseDate: new Date().toISOString().split("T")[0],
              previewUrl: "",
              imageUrl: "",
              createdAt: new Date().toISOString(),
            },
            similarityScore: rec.score,
            reason: `Based on your listening history`,
          };
        }
      })
    );

    return recommendations;
  },

  getSimilarSongs: async (
    songId: string,
    limit: number = 10
  ): Promise<Recommendation[]> => {
    const response = await api.get<AIRecSong[]>(
      `/recommendations/song/${parseInt(songId, 10)}`,
      {
        params: { topK: limit },
      }
    );
    const aiRecs = response.data || [];

    // Convert AI recommendations to full Recommendation objects
    const recommendations: Recommendation[] = await Promise.all(
      aiRecs.map(async (rec) => {
        try {
          const song = await songsApi.getById(rec.songId.toString());
          return {
            song,
            similarityScore: rec.score,
            reason: `Similar to the current song`,
          };
        } catch (error) {
          console.error(`Failed to fetch song ${rec.songId}:`, error);
          // Return a basic recommendation with partial data
          return {
            song: {
              id: rec.songId.toString(),
              title: rec.title,
              artist: {
                id: "unknown",
                name: rec.artistName,
                genres: [rec.genre],
                createdAt: new Date().toISOString(),
              },
              duration: 180,
              genre: rec.genre,
              releaseDate: new Date().toISOString().split("T")[0],
              previewUrl: "",
              imageUrl: "",
              createdAt: new Date().toISOString(),
            },
            similarityScore: rec.score,
            reason: `Similar to the current song`,
          };
        }
      })
    );

    return recommendations;
  },
};
