import type { Song } from '@/lib/musicContext';

const FAV_KEY = 'lisa_fav_songs';
const RECENT_KEY = 'lisa_recent_songs';
const VOLUME_KEY = 'lisa_player_volume';
const META_KEY = 'lisa_spotify_meta';
const META_TTL_MS = 24 * 60 * 60 * 1000;

export function loadFavorites(): string[] {
    try {
        const raw = localStorage.getItem(FAV_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveFavorites(ids: string[]) {
    try {
        localStorage.setItem(FAV_KEY, JSON.stringify(ids));
    } catch { /* ignore */ }
}

export function loadRecentlyPlayed(): Song[] {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveRecentlyPlayed(songs: Song[]) {
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(songs.slice(0, 20)));
    } catch { /* ignore */ }
}

export function loadVolume(): number {
    try {
        const raw = localStorage.getItem(VOLUME_KEY);
        if (raw == null) return 1;
        const v = parseFloat(raw);
        return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1;
    } catch {
        return 1;
    }
}

export function saveVolume(v: number) {
    try {
        localStorage.setItem(VOLUME_KEY, String(v));
    } catch { /* ignore */ }
}

interface MetaCacheEntry {
    data: Record<string, unknown>;
    expiresAt: number;
}

export function loadMetaCache(): Record<string, unknown> {
    try {
        const raw = localStorage.getItem(META_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as MetaCacheEntry;
        if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
            localStorage.removeItem(META_KEY);
            return {};
        }
        return parsed.data || {};
    } catch {
        return {};
    }
}

export function saveMetaCache(data: Record<string, unknown>) {
    try {
        const entry: MetaCacheEntry = {
            data,
            expiresAt: Date.now() + META_TTL_MS,
        };
        localStorage.setItem(META_KEY, JSON.stringify(entry));
    } catch { /* ignore */ }
}

export function formatDuration(ms: number): string {
    if (!ms || ms < 0) return '--:--';
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
