// src/types/index.ts

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
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
  artworkUrl?: string;
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

export interface HistoryItem {
  id: string;
  userId: string;
  songId: string;
  song: Song;
  action: 'PLAY' | 'SKIP' | 'LIKE';
  duration: number; // seconds played
  playedAt: string;
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

export interface SearchFilters {
  genre?: string;
  artist?: string;
  year?: number;
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