# ParaVibe - AI-Powered Music Discovery

A modern, Spotify-inspired music streaming application built with Next.js 14+, featuring AI-powered song recommendations and a sleek dark UI.

## 🚀 Features

- **AI-Powered Recommendations**: Get personalized song suggestions based on your listening history
- **30-Second Previews**: Preview songs before committing
- **Smart Playlists**: Create and manage custom playlists
- **Advanced Search**: Search with filters by genre, artist, and more
- **Listening History**: Track your music journey with detailed statistics
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Playback**: Smooth audio controls with progress tracking

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Audio Playback**: HTML5 Audio API
- **Authentication**: JWT (access + refresh tokens)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── home/              # Home dashboard
│   ├── search/            # Search page
│   ├── song/[id]/         # Song detail page
│   ├── playlist/[id]/     # Playlist detail page
│   ├── playlists/         # User's playlists
│   ├── profile/           # User profile & stats
│   ├── login/             # Authentication
│   └── register/
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components (Sidebar, Header, etc.)
│   ├── player/            # Music player components
│   └── common/            # Reusable components
├── stores/                # Zustand state stores
├── hooks/                 # Custom React hooks
├── api/                   # API service layer
├── types/                 # TypeScript type definitions
└── lib/                   # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:8080/api/v1`
- AI Service running on `http://localhost:8000/api/v1`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd paravibe-fe
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_AI_API_BASE_URL=http://localhost:8000/api/v1
```

## 🎵 API Integration

The frontend integrates with two backend services:

### Main API (`http://localhost:8080/api/v1`)
- Authentication (`/auth/*`)
- Songs (`/songs/*`)
- Artists (`/artists/*`)
- Playlists (`/playlists/*`)
- History (`/users/*/history`)

### AI Service (`http://localhost:8000/api/v1`)
- Recommendations (`/recommendations/*`)

## 🎨 UI/UX Design

Inspired by Spotify's design with a custom ParaVibe branding:

- **Dark Theme**: Modern dark background with purple/blue accents
- **Responsive Layout**: Sidebar navigation with collapsible mobile menu
- **Card-based Design**: Clean, organized content presentation
- **Smooth Animations**: Subtle transitions and hover effects
- **Typography**: Inter font for modern, readable text

## 🔐 Authentication Flow

1. User registers/logs in via JWT authentication
2. Access tokens are stored in Zustand store and HTTP-only cookies
3. Automatic token refresh on API calls
4. Protected routes redirect to login when unauthenticated

## 🎵 Music Player

- **Preview Playback**: 30-second song previews
- **Queue Management**: Add songs to queue, skip, previous
- **Progress Tracking**: Visual progress bar with time display
- **Volume Control**: Adjustable volume with mute functionality
- **History Tracking**: Automatic play/skip/like event logging

## 📊 State Management

### Zustand Stores

- **Auth Store**: User authentication state and tokens
- **Player Store**: Current song, queue, playback state
- **App Store**: UI state (sidebar, search query)

### TanStack Query

- Server state management for API data
- Automatic caching and background refetching
- Optimistic updates for better UX

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Setup

Ensure your production environment has:
- Backend API endpoints configured
- Proper CORS settings
- HTTPS enabled for security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is for educational purposes and should not be used for commercial music streaming without proper licensing.

## 🎯 Future Enhancements

- [ ] Offline playback
- [ ] Social features (following, sharing)
- [ ] Advanced playlist collaboration
- [ ] Lyrics synchronization
- [ ] Audio quality settings
- [ ] Mobile app (React Native)

---

Built with ❤️ using Next.js and modern web technologies.
