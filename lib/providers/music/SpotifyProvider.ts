import type {
    IMusicProvider,
    PlaybackState,
    PremiumStatus,
    RepeatMode,
    ResolvedTrack,
} from './types';
import { beginSpotifyLogin, getTokens, getValidAccessToken, logoutSpotify } from '@/lib/services/spotify/auth';
import { loadSpotifyPlaybackSdk, SpotifyPlayer } from '@/lib/services/spotify/sdk';
import { fetchTracksMetadata, spotifyApi } from '@/lib/services/spotify/api';

type StateListener = (state: PlaybackState) => void;

export class SpotifyProvider implements IMusicProvider {
    private player: SpotifyPlayer | null = null;
    private deviceId: string | null = null;
    private ready = false;
    private listeners = new Set<StateListener>();
    private pollTimer: ReturnType<typeof setInterval> | null = null;
    private lastVolume = 1;

    async connect(): Promise<void> {
        await beginSpotifyLogin();
    }

    disconnect(): void {
        this.teardownPlayer();
        logoutSpotify();
    }

    isConnected(): boolean {
        return Boolean(getTokens()?.accessToken);
    }

    async getPremiumStatus(): Promise<PremiumStatus> {
        try {
            const res = await spotifyApi('/me');
            if (!res.ok) return 'unknown';
            const me = await res.json();
            if (me.product === 'premium') return 'premium';
            if (me.product) return 'free';
            return 'unknown';
        } catch {
            return 'unknown';
        }
    }

    async resolveTracks(ids: string[]): Promise<ResolvedTrack[]> {
        return fetchTracksMetadata(ids);
    }

    async ensureReady(): Promise<boolean> {
        if (this.ready && this.deviceId) return true;
        if (!this.isConnected()) return false;

        await loadSpotifyPlaybackSdk();
        if (!window.Spotify) return false;

        if (this.player) return this.ready;

        return new Promise((resolve) => {
            const player = new window.Spotify!.Player({
                name: "Lisa's Sanctuary",
                getOAuthToken: async (cb) => {
                    const token = await getValidAccessToken();
                    if (token) cb(token);
                },
                volume: this.lastVolume,
            });

            this.player = player;

            player.addListener('ready', ({ device_id }: { device_id: string }) => {
                this.deviceId = device_id;
                this.ready = true;
                this.startPolling();
                resolve(true);
            });

            player.addListener('not_ready', () => {
                this.ready = false;
            });

            player.addListener('initialization_error', ({ message }: { message: string }) => {
                console.error('Spotify init error:', message);
                resolve(false);
            });

            player.addListener('authentication_error', ({ message }: { message: string }) => {
                console.error('Spotify auth error:', message);
                this.ready = false;
                resolve(false);
            });

            player.addListener('account_error', ({ message }: { message: string }) => {
                console.error('Spotify account error (Premium required):', message);
                this.ready = false;
                resolve(false);
            });

            player.addListener('player_state_changed', (state: any) => {
                if (!state) return;
                this.emitState({
                    trackId: state.track_window?.current_track?.id || null,
                    isPlaying: !state.paused,
                    positionMs: state.position || 0,
                    durationMs: state.duration || state.track_window?.current_track?.duration_ms || 0,
                    volume: this.lastVolume,
                });
            });

            player.connect().then((ok) => {
                if (!ok) resolve(false);
            });

            // Timeout if ready never fires
            setTimeout(() => {
                if (!this.ready) resolve(false);
            }, 10000);
        });
    }

    async transferPlayback(): Promise<void> {
        if (!this.deviceId) await this.ensureReady();
        if (!this.deviceId) throw new Error('No Spotify device');

        const res = await spotifyApi('/me/player', {
            method: 'PUT',
            body: JSON.stringify({
                device_ids: [this.deviceId],
                play: false,
            }),
        });

        // 204 success, 404 means no prior playback — ok
        if (!res.ok && res.status !== 404 && res.status !== 204) {
            // Some accounts return 202
            if (res.status !== 202) {
                console.warn('Transfer playback status', res.status);
            }
        }
    }

    async play(trackId: string): Promise<void> {
        const ok = await this.ensureReady();
        if (!ok || !this.deviceId) throw new Error('PLAYER_NOT_READY');

        await this.transferPlayback();

        const res = await spotifyApi(`/me/player/play?device_id=${this.deviceId}`, {
            method: 'PUT',
            body: JSON.stringify({
                uris: [`spotify:track:${trackId}`],
            }),
        });

        if (res.status === 403) throw new Error('PREMIUM_REQUIRED');
        if (res.status === 401) throw new Error('TOKEN_EXPIRED');
        if (!res.ok && res.status !== 204) {
            const text = await res.text();
            throw new Error(text || `Play failed (${res.status})`);
        }
    }

    async pause(): Promise<void> {
        if (this.player) {
            await this.player.pause();
            return;
        }
        await spotifyApi('/me/player/pause', { method: 'PUT' });
    }

    async resume(): Promise<void> {
        if (this.player) {
            await this.player.resume();
            return;
        }
        await spotifyApi('/me/player/play', { method: 'PUT' });
    }

    async seek(ms: number): Promise<void> {
        if (this.player) {
            await this.player.seek(ms);
            return;
        }
        await spotifyApi(`/me/player/seek?position_ms=${Math.floor(ms)}`, { method: 'PUT' });
    }

    async next(): Promise<void> {
        if (this.player) {
            await this.player.nextTrack();
            return;
        }
        await spotifyApi('/me/player/next', { method: 'POST' });
    }

    async previous(): Promise<void> {
        if (this.player) {
            await this.player.previousTrack();
            return;
        }
        await spotifyApi('/me/player/previous', { method: 'POST' });
    }

    async setVolume(v: number): Promise<void> {
        this.lastVolume = Math.max(0, Math.min(1, v));
        if (this.player) {
            await this.player.setVolume(this.lastVolume);
            return;
        }
        await spotifyApi(`/me/player/volume?volume_percent=${Math.round(this.lastVolume * 100)}`, {
            method: 'PUT',
        });
    }

    async setShuffle(on: boolean): Promise<void> {
        await spotifyApi(`/me/player/shuffle?state=${on}`, { method: 'PUT' });
    }

    async setRepeat(mode: RepeatMode): Promise<void> {
        const state = mode === 'off' ? 'off' : mode === 'one' ? 'track' : 'context';
        await spotifyApi(`/me/player/repeat?state=${state}`, { method: 'PUT' });
    }

    onStateChange(cb: StateListener): () => void {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    }

    getDeviceId(): string | null {
        return this.deviceId;
    }

    private emitState(state: PlaybackState) {
        this.listeners.forEach((cb) => cb(state));
    }

    private startPolling() {
        if (this.pollTimer) return;
        this.pollTimer = setInterval(async () => {
            if (!this.player) return;
            try {
                const state = await this.player.getCurrentState();
                if (!state) return;
                this.emitState({
                    trackId: state.track_window?.current_track?.id || null,
                    isPlaying: !state.paused,
                    positionMs: state.position || 0,
                    durationMs: state.duration || 0,
                    volume: this.lastVolume,
                });
            } catch { /* ignore */ }
        }, 1000);
    }

    private teardownPlayer() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        if (this.player) {
            try {
                this.player.disconnect();
            } catch { /* ignore */ }
            this.player = null;
        }
        this.deviceId = null;
        this.ready = false;
    }
}

/** Singleton used by React MusicProvider */
let instance: SpotifyProvider | null = null;

export function getSpotifyProvider(): SpotifyProvider {
    if (!instance) instance = new SpotifyProvider();
    return instance;
}
