import { createContext, useContext } from 'react';
import type { PremiumStatus, RepeatMode } from '@/lib/providers/music/types';

export type { RepeatMode };

export interface Song {
    id: string;
    title: string;
    artist: string;
    url: string; // Spotify external URL (Open in Spotify)
    art: string;
    duration?: string;
    durationMs?: number;
    album?: string;
    provider?: 'spotify';
    unavailable?: boolean;
    lyrics?: { time: number; text: string }[];
}

interface MusicContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    duration: number;
    currentTime: number;
    volume: number;
    isMuted: boolean;
    repeatMode: RepeatMode;
    isShuffle: boolean;
    queue: Song[];
    history: Song[];
    favorites: string[];
    recentlyPlayed: Song[];
    isSpotifyConnected: boolean;
    premiumStatus: PremiumStatus;
    playerReady: boolean;
    playerError: string | null;
    needsReconnect: boolean;
    playSong: (song: Song, customQueue?: Song[]) => void;
    pauseSong: () => void;
    resumeSong: () => void;
    togglePlay: () => void;
    nextSong: () => void;
    prevSong: () => void;
    seek: (time: number) => void;
    changeVolume: (vol: number) => void;
    toggleMute: () => void;
    toggleRepeat: () => void;
    toggleShuffle: () => void;
    toggleFavorite: (songId: string) => void;
    addToQueue: (song: Song) => void;
    removeFromQueue: (songId: string) => void;
    clearQueue: () => void;
    setQueue: (songs: Song[]) => void;
    connectSpotify: () => Promise<void>;
    disconnectSpotify: () => void;
    clearPlayerError: () => void;
    refreshAuthState: () => Promise<void>;
}

export const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function useMusic() {
    const context = useContext(MusicContext);
    if (!context) throw new Error('useMusic must be used within a MusicProvider');
    return context;
}

export function resolvedToSong(t: {
    id: string;
    title: string;
    artist: string;
    art: string;
    duration?: string;
    durationMs?: number;
    externalUrl?: string;
    album?: string;
    unavailable?: boolean;
}): Song {
    return {
        id: t.id,
        title: t.title,
        artist: t.artist,
        art: t.art,
        duration: t.duration,
        durationMs: t.durationMs,
        url: t.externalUrl || `https://open.spotify.com/track/${t.id}`,
        album: t.album,
        provider: 'spotify',
        unavailable: t.unavailable,
    };
}
