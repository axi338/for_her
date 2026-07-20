export interface TrackRef {
    spotifyId: string;
    customCover?: string;
    note?: string;
    addedAt?: string;
}

export interface MoodConfig {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    cover: string;
    background: string;
    glowColor: string;
    colorOpacity?: string;
    emoji?: string;
    tracks: TrackRef[];
}

export interface ResolvedTrack {
    id: string;
    title: string;
    artist: string;
    album?: string;
    art: string;
    durationMs: number;
    duration?: string;
    externalUrl: string;
    provider: 'spotify';
    unavailable?: boolean;
    customCover?: string;
    note?: string;
}

export type PremiumStatus = 'premium' | 'free' | 'unknown';
export type RepeatMode = 'off' | 'one' | 'all';

export interface PlaybackState {
    trackId: string | null;
    isPlaying: boolean;
    positionMs: number;
    durationMs: number;
    volume: number;
}

export interface IMusicProvider {
    connect(): Promise<void>;
    disconnect(): void;
    isConnected(): boolean;
    getPremiumStatus(): Promise<PremiumStatus>;
    resolveTracks(ids: string[]): Promise<ResolvedTrack[]>;
    search?(query: string): Promise<ResolvedTrack[]>;
    play(trackId: string): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    seek(ms: number): Promise<void>;
    next(): Promise<void>;
    previous(): Promise<void>;
    setVolume(v: number): Promise<void>;
    setShuffle(on: boolean): Promise<void>;
    setRepeat(mode: RepeatMode): Promise<void>;
    transferPlayback(): Promise<void>;
    ensureReady(): Promise<boolean>;
    onStateChange(cb: (state: PlaybackState) => void): () => void;
    getDeviceId(): string | null;
}
