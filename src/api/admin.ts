// src/api/admin.ts
import { api } from "@/lib/api";
import { User, Song, Playlist } from "@/types";
import { PaginatedResponse } from "@/types";

// ==================== INTERFACES ====================

export interface AdminStats {
  totalUsers: number;
  totalSongs: number;
  totalPlays: number;
  activeUsers: number;
  newUsersToday?: number;
  newSongsToday?: number;
}

export interface DetailedUserInfo extends User {
  totalPlays: number;
  totalPlaylists: number;
  lastLogin?: string;
  favoriteGenres?: string[];
}

export interface SongStats {
  totalPlays: number;
  totalLikes: number;
  averageRating: number;
  playsByDate?: { date: string; count: number }[];
  topListeners?: { userId: string; username: string; playCount: number }[];
}

export interface ArtistInfo {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  genres: string[];
  createdAt: string;
  totalSongs: number;
  totalPlays: number;
}

export interface AnalyticsOverview {
  totalPlays: number;
  totalLikes: number;
  averagePlayDuration: number;
  playsByGenre?: { genre: string; count: number }[];
  userRetention?: { day: number; retentionRate: number }[];
}

export interface TopContent {
  topSongs: { songId: string; title: string; playCount: number }[];
  topArtists: { artistId: string; name: string; playCount: number }[];
  topGenres: { genre: string; playCount: number }[];
}

export interface UserEngagement {
  dailyActiveUsers: { date: string; count: number }[];
  monthlyActiveUsers: number;
  avgSessionDuration: number;
  churn?: { period: string; rate: number }[];
}

export interface ChartData {
  userGrowthChart: { date: string; count: number }[];
  playActivityChart: { date: string; plays: number }[];
  topGenres: { genre: string; playCount: number }[];
  topArtists: { artistId: string; artistName: string; playCount: number }[];
}

export interface UserActivity {
  totalPlays: number;
  totalLikes: number;
  playHistory: { songId: string; playedAt: string }[];
  likedSongs: string[];
  createdPlaylists: number;
}

export interface ContentReport {
  id: string;
  type: "song" | "playlist" | "user";
  targetId: string;
  reportedBy: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
}

// ==================== ADMIN API ====================

export const adminApi = {
  // ===== USER MANAGEMENT =====

  /**
   * Get paginated list of users
   * GET /users?page=1&limit=20
   */
  getUsers: async (
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<DetailedUserInfo>> => {
    try {
      const response = await api.get<PaginatedResponse<DetailedUserInfo>>(
        "/users",
        {
          params: { page, limit },
        }
      );
      console.log("Users API Response:", response.data);
      if (response.data.data && response.data.data.length > 0) {
        console.log("First user:", response.data.data[0]);
      }
      return response.data;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  },

  /**
   * Get detailed user information
   * GET /users/:userId
   */
  getUserDetails: async (userId: string): Promise<DetailedUserInfo> => {
    try {
      const response = await api.get<DetailedUserInfo>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      throw error;
    }
  },

  /**
   * Search users
   * GET /users/search?query=...
   */
  searchUsers: async (
    query: string,
    options?: {
      role?: "USER" | "ADMIN";
      isActive?: boolean;
      createdFrom?: string;
      createdTo?: string;
    }
  ): Promise<DetailedUserInfo[]> => {
    try {
      const response = await api.get<DetailedUserInfo[]>("/users/search", {
        params: { query, ...options },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to search users:", error);
      throw error;
    }
  },

  /**
   * Get user activity
   * GET /users/:userId/activity
   */
  getUserActivity: async (userId: string): Promise<UserActivity> => {
    try {
      const response = await api.get<UserActivity>(`/users/${userId}/activity`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user activity:", error);
      throw error;
    }
  },

  /**
   * Update user information
   * PUT /users/:userId
   */
  updateUser: async (
    userId: string,
    updates: {
      name?: string;
      email?: string;
      isActive?: boolean;
      role?: string;
    }
  ): Promise<DetailedUserInfo> => {
    try {
      // Remove id from updates if it exists - backend doesn't accept it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatePayload: any = { ...updates };
      delete updatePayload.id;

      console.log("Updating user:", userId, updatePayload);
      const response = await api.put<DetailedUserInfo>(
        `/users/${userId}`,
        updatePayload
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },

  /**
   * Delete user
   * DELETE /users/:userId
   */
  deleteUser: async (userId: string | number): Promise<void> => {
    try {
      console.log("Deleting user:", userId);
      await api.delete(`/users/${userId}`);
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },

  /**
   * Toggle user active status
   * PUT /users/:userId/toggle-active
   */
  toggleUserActive: async (
    userId: string | number,
    isActive: boolean
  ): Promise<DetailedUserInfo> => {
    try {
      const response = await api.put<DetailedUserInfo>(
        `/users/${userId}/toggle-active`,
        { isActive }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to toggle user active status:", error);
      throw error;
    }
  },

  /**
   * Change user role
   * PATCH /users/:userId/role
   */
  promoteToAdmin: async (
    userId: string | number,
    role: "USER" | "ADMIN" = "ADMIN"
  ): Promise<void> => {
    try {
      await api.patch(`/users/${userId}/role`, { role });
    } catch (error) {
      console.error("Failed to change user role:", error);
      throw error;
    }
  },

  /**
   * Bulk delete users
   * POST /users/bulk-delete
   */
  bulkDeleteUsers: async (userIds: string[]): Promise<void> => {
    try {
      await api.post("/users/bulk-delete", { userIds });
    } catch (error) {
      console.error("Failed to bulk delete users:", error);
      throw error;
    }
  },

  /**
   * Ban/Unban user
   * PATCH /users/:userId/ban
   */
  banUser: async (
    userId: string,
    isBanned: boolean,
    reason?: string
  ): Promise<void> => {
    try {
      await api.patch(`/users/${userId}/ban`, { isBanned, reason });
    } catch (error) {
      console.error("Failed to ban user:", error);
      throw error;
    }
  },

  // ===== SONG MANAGEMENT =====

  /**
   * Get paginated list of songs
   * GET /songs?page=1&limit=20
   */
  getSongs: async (
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Song>> => {
    try {
      const response = await api.get<PaginatedResponse<Song>>("/songs", {
        params: { page, limit },
      });
      console.log("Songs API Response:", response.data);
      if (response.data.data && response.data.data.length > 0) {
        console.log("First song:", response.data.data[0]);
      }
      return response.data;
    } catch (error) {
      console.error("Failed to fetch songs:", error);
      throw error;
    }
  },

  /**
   * Get song details with stats
   * GET /songs/:songId
   */
  getSongDetails: async (songId: string): Promise<Song> => {
    try {
      const response = await api.get<Song>(`/songs/${songId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch song details:", error);
      throw error;
    }
  },

  /**
   * Get song statistics
   * GET /songs/:songId/stats
   */
  getSongStats: async (songId: string): Promise<SongStats> => {
    try {
      const response = await api.get<SongStats>(`/songs/${songId}/stats`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch song stats:", error);
      throw error;
    }
  },

  /**
   * Search songs
   * GET /songs/search?query=...
   */
  searchSongs: async (
    query: string,
    options?: {
      genre?: string;
      artist?: string;
      createdFrom?: string;
      createdTo?: string;
      minPlays?: number;
      maxPlays?: number;
    }
  ): Promise<Song[]> => {
    try {
      const response = await api.get<Song[]>("/songs/search", {
        params: { query, ...options },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to search songs:", error);
      throw error;
    }
  },

  /**
   * Create new song
   * POST /songs
   */
  createSong: async (songData: Partial<Song>): Promise<Song> => {
    try {
      const response = await api.post<Song>("/songs", songData);
      return response.data;
    } catch (error) {
      console.error("Failed to create song:", error);
      throw error;
    }
  },

  /**
   * Update song
   * PUT /songs/:songId
   */
  updateSong: async (songId: string, updates: Partial<Song>): Promise<Song> => {
    try {
      console.log("Updating song:", songId, updates);
      const response = await api.put<Song>(`/songs/${songId}`, updates);
      return response.data;
    } catch (error) {
      console.error("Failed to update song:", error);
      throw error;
    }
  },

  /**
   * Delete song
   * DELETE /songs/:songId
   */
  deleteSong: async (songId: string | number): Promise<void> => {
    try {
      console.log("Deleting song:", songId);
      await api.delete(`/songs/${songId}`);
    } catch (error) {
      console.error("Failed to delete song:", error);
      throw error;
    }
  },

  /**
   * Bulk delete songs
   * POST /songs/bulk-delete
   */
  bulkDeleteSongs: async (songIds: string[]): Promise<void> => {
    try {
      await api.post("/songs/bulk-delete", { songIds });
    } catch (error) {
      console.error("Failed to bulk delete songs:", error);
      throw error;
    }
  },

  // ===== ARTIST MANAGEMENT =====

  /**
   * Get list of artists
   * GET /artists?page=1&limit=20
   */
  getArtists: async (
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<ArtistInfo>> => {
    try {
      const response = await api.get<PaginatedResponse<ArtistInfo>>(
        "/artists",
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch artists:", error);
      throw error;
    }
  },

  /**
   * Get artist details
   * GET /artists/:artistId
   */
  getArtistDetails: async (artistId: string): Promise<ArtistInfo> => {
    try {
      const response = await api.get<ArtistInfo>(`/artists/${artistId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch artist details:", error);
      throw error;
    }
  },

  /**
   * Create artist
   * POST /artists
   */
  createArtist: async (
    artistData: Partial<ArtistInfo>
  ): Promise<ArtistInfo> => {
    try {
      const response = await api.post<ArtistInfo>("/artists", artistData);
      return response.data;
    } catch (error) {
      console.error("Failed to create artist:", error);
      throw error;
    }
  },

  /**
   * Update artist
   * PATCH /artists/:artistId
   */
  updateArtist: async (
    artistId: string,
    updates: Partial<ArtistInfo>
  ): Promise<ArtistInfo> => {
    try {
      const response = await api.patch<ArtistInfo>(
        `/artists/${artistId}`,
        updates
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update artist:", error);
      throw error;
    }
  },

  /**
   * Delete artist
   * DELETE /artists/:artistId
   */
  deleteArtist: async (artistId: string): Promise<void> => {
    try {
      await api.delete(`/artists/${artistId}`);
    } catch (error) {
      console.error("Failed to delete artist:", error);
      throw error;
    }
  },

  // ===== ANALYTICS =====

  /**
   * Get basic analytics
   * GET /admin/analytics
   */
  getAnalytics: async (): Promise<AnalyticsOverview> => {
    try {
      const response = await api.get<AnalyticsOverview>("/admin/analytics");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      throw error;
    }
  },

  /**
   * Get detailed analytics overview
   * GET /admin/analytics/overview
   */
  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    try {
      const response = await api.get<AnalyticsOverview>(
        "/admin/analytics/overview"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch analytics overview:", error);
      throw error;
    }
  },

  /**
   * Get top content analytics
   * GET /admin/analytics/top-content
   */
  getTopContent: async (): Promise<TopContent> => {
    try {
      const response = await api.get<TopContent>(
        "/admin/analytics/top-content"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch top content:", error);
      throw error;
    }
  },

  /**
   * Get user engagement analytics
   * GET /admin/analytics/user-engagement
   */
  getUserEngagement: async (): Promise<UserEngagement> => {
    try {
      const response = await api.get<UserEngagement>(
        "/admin/analytics/user-engagement"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user engagement:", error);
      throw error;
    }
  },

  // ===== PLAYLIST MANAGEMENT =====

  /**
   * Get all playlists (admin view)
   * GET /admin/playlists?page=1&limit=20
   */
  getPlaylists: async (
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Playlist>> => {
    try {
      const response = await api.get<PaginatedResponse<Playlist>>(
        "/admin/playlists",
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
      throw error;
    }
  },

  /**
   * Delete playlist (moderation)
   * DELETE /admin/playlists/:playlistId
   */
  deletePlaylist: async (playlistId: string): Promise<void> => {
    try {
      await api.delete(`/admin/playlists/${playlistId}`);
    } catch (error) {
      console.error("Failed to delete playlist:", error);
      throw error;
    }
  },

  // ===== CONTENT REPORTS & MODERATION =====

  /**
   * Get content reports
   * GET /admin/reports
   */
  getReports: async (
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<ContentReport>> => {
    try {
      const response = await api.get<PaginatedResponse<ContentReport>>(
        "/admin/reports",
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      throw error;
    }
  },

  /**
   * Resolve report
   * PATCH /admin/reports/:reportId
   */
  resolveReport: async (
    reportId: string,
    data: {
      status: "reviewed" | "resolved";
      action: "none" | "delete" | "ban_user";
      notes?: string;
    }
  ): Promise<void> => {
    try {
      await api.patch(`/admin/reports/${reportId}`, data);
    } catch (error) {
      console.error("Failed to resolve report:", error);
      throw error;
    }
  },

  // ===== SYSTEM MANAGEMENT =====

  /**
   * Get system health
   * GET /admin/health
   */
  getSystemHealth: async (): Promise<{
    database: "ok" | "error";
    cache: "ok" | "error";
    storage: "ok" | "error";
    message: string;
  }> => {
    try {
      const response = await api.get("/admin/health");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch system health:", error);
      throw error;
    }
  },

  /**
   * Get system logs
   * GET /admin/logs?level=...&limit=100
   */
  getSystemLogs: async (
    level: "info" | "warn" | "error" = "error",
    limit: number = 100
  ): Promise<
    Array<{
      level: string;
      message: string;
      timestamp: string;
      service: string;
    }>
  > => {
    try {
      const response = await api.get("/admin/logs", {
        params: { level, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch system logs:", error);
      throw error;
    }
  },
};
