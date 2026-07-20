declare global {
    interface Window {
        Spotify?: {
            Player: new (options: {
                name: string;
                getOAuthToken: (cb: (token: string) => void) => void;
                volume?: number;
            }) => SpotifyPlayer;
        };
        onSpotifyWebPlaybackSDKReady?: () => void;
    }
}

export interface SpotifyPlayer {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: string, cb: (data: any) => void): void;
    removeListener(event: string, cb?: (data: any) => void): void;
    getCurrentState(): Promise<SpotifyPlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    activateElement(): Promise<void>;
}

export interface SpotifyPlaybackState {
    paused: boolean;
    position: number;
    duration: number;
    track_window: {
        current_track: {
            id: string;
            name: string;
            uri: string;
            duration_ms: number;
            artists: { name: string }[];
            album: { images: { url: string }[]; name: string };
        } | null;
    };
}

let loadPromise: Promise<void> | null = null;

export function loadSpotifyPlaybackSdk(): Promise<void> {
    if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
    if (window.Spotify) return Promise.resolve();
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-spotify-sdk]');
        if (existing) {
            window.onSpotifyWebPlaybackSDKReady = () => resolve();
            if (window.Spotify) resolve();
            return;
        }

        window.onSpotifyWebPlaybackSDKReady = () => resolve();

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        script.dataset.spotifySdk = 'true';
        script.onerror = () => {
            loadPromise = null;
            reject(new Error('Failed to load Spotify Web Playback SDK'));
        };
        document.body.appendChild(script);
    });

    return loadPromise;
}
