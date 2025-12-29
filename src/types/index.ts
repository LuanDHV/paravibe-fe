// src/types/index.ts

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  userId?: number;
  name?: string;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  genres: string[];
  createdAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: Artist;
  album?: string;
  duration: number; // in seconds
  genre: string;
  releaseDate: string;
  previewUrl: string; // 30s preview
  imageUrl?: string;
  lyrics?: string;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  userId: string;
  songs: Song[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  song: Song;
  similarityScore: number; // 0-1
  reason?: string;
}

export interface AIRecSong {
  songId: number;
  title: string;
  artistName: string;
  genre: string;
  score: number;
}

export interface TopSong {
  songId: number;
  title: string;
  artistName: string;
  playCount: number;
  totalDuration: number;
}

export interface HistoryItem {
  historyId: string; // matches backend field name
  userId: string;
  songId: string;
  song?: Song; // Optional - backend might not return full song object
  action: "PLAY" | "SKIP" | "LIKE";
  durationListened: number; // seconds played
  listenedAt: string; // matches backend field name
  // Backend returns these fields instead of full song object
  songTitle?: string;
  artistName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
