import type { ResolvedTrack } from '@/lib/providers/music/types';
import { formatDuration, loadMetaCache, saveMetaCache } from '@/lib/services/storage/musicStorage';
import { getValidAccessToken } from './auth';
export { parseSpotifyTrackId } from './parseId';

const API = 'https://api.spotify.com/v1';

function mapSpotifyTrack(t: any, customCover?: string): ResolvedTrack {
    const art =
        customCover ||
        t.album?.images?.[0]?.url ||
        t.album?.images?.[1]?.url ||
        '/photos_to_use/photo_1.webp';

    return {
        id: t.id,
        title: t.name || 'Unknown',
        artist: (t.artists || []).map((a: any) => a.name).join(', ') || 'Unknown Artist',
        album: t.album?.name,
        art,
        durationMs: t.duration_ms || 0,
        duration: formatDuration(t.duration_ms || 0),
        externalUrl: t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`,
        provider: 'spotify',
        customCover,
    };
}

export async function fetchTracksMetadata(
    ids: string[],
    options?: { accessToken?: string; customCovers?: Record<string, string> }
): Promise<ResolvedTrack[]> {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (unique.length === 0) return [];

    // Try cache first
    const cache = typeof window !== 'undefined' ? loadMetaCache() : {};
    const results: ResolvedTrack[] = [];
    const missing: string[] = [];

    for (const id of unique) {
        const cached = cache[id] as any;
        if (cached && cached.id) {
            const cover = options?.customCovers?.[id];
            results.push({
                ...cached,
                art: cover || cached.art,
                customCover: cover,
                duration: cached.duration || formatDuration(cached.durationMs || 0),
            } as ResolvedTrack);
        } else {
            missing.push(id);
        }
    }

    if (missing.length === 0) return orderByIds(unique, results);

    // Prefer server metadata API (works before user connect)
    try {
        const chunks: string[][] = [];
        for (let i = 0; i < missing.length; i += 50) {
            chunks.push(missing.slice(i, i + 50));
        }

        for (const chunk of chunks) {
            const res = await fetch(`/api/spotify/metadata?ids=${chunk.join(',')}`);
            if (res.ok) {
                const data = await res.json();
                for (const t of data.tracks || []) {
                    if (!t || !t.id) {
                        continue;
                    }
                    const cover = options?.customCovers?.[t.id];
                    const mapped = mapSpotifyTrack(t, cover);
                    results.push(mapped);
                    cache[t.id] = mapped;
                }
                // Mark unavailable
                for (const id of chunk) {
                    if (!results.find((r) => r.id === id) && !cache[id]) {
                        const unavailable: ResolvedTrack = {
                            id,
                            title: 'Unavailable',
                            artist: 'Track not found',
                            art: options?.customCovers?.[id] || '/photos_to_use/photo_1.webp',
                            durationMs: 0,
                            duration: '--:--',
                            externalUrl: `https://open.spotify.com/track/${id}`,
                            provider: 'spotify',
                            unavailable: true,
                        };
                        results.push(unavailable);
                        cache[id] = unavailable;
                    }
                }
            } else {
                // Fallback to user token
                await fetchWithUserToken(chunk, results, cache, options);
            }
        }

        if (typeof window !== 'undefined') saveMetaCache(cache);
    } catch {
        await fetchWithUserToken(missing, results, cache, options);
        if (typeof window !== 'undefined') saveMetaCache(cache);
    }

    return orderByIds(unique, results);
}

async function fetchWithUserToken(
    ids: string[],
    results: ResolvedTrack[],
    cache: Record<string, unknown>,
    options?: { accessToken?: string; customCovers?: Record<string, string> }
) {
    const token = options?.accessToken || (await getValidAccessToken());
    if (!token) {
        for (const id of ids) {
            if (!results.find((r) => r.id === id)) {
                results.push({
                    id,
                    title: 'Unavailable',
                    artist: 'Connect Spotify to load',
                    art: options?.customCovers?.[id] || '/photos_to_use/photo_1.webp',
                    durationMs: 0,
                    duration: '--:--',
                    externalUrl: `https://open.spotify.com/track/${id}`,
                    provider: 'spotify',
                    unavailable: true,
                });
            }
        }
        return;
    }

    for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const res = await fetch(`${API}/tracks?ids=${chunk.join(',')}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) continue;
        const data = await res.json();
        (data.tracks || []).forEach((t: any, idx: number) => {
            const id = chunk[idx];
            if (!t) {
                const unavailable: ResolvedTrack = {
                    id,
                    title: 'Unavailable',
                    artist: 'Track not found',
                    art: options?.customCovers?.[id] || '/photos_to_use/photo_1.webp',
                    durationMs: 0,
                    duration: '--:--',
                    externalUrl: `https://open.spotify.com/track/${id}`,
                    provider: 'spotify',
                    unavailable: true,
                };
                results.push(unavailable);
                cache[id] = unavailable;
                return;
            }
            const mapped = mapSpotifyTrack(t, options?.customCovers?.[t.id]);
            results.push(mapped);
            cache[t.id] = mapped;
        });
    }
}

function orderByIds(ids: string[], tracks: ResolvedTrack[]): ResolvedTrack[] {
    const map = new Map(tracks.map((t) => [t.id, t]));
    return ids.map((id) => map.get(id)).filter(Boolean) as ResolvedTrack[];
}

export async function spotifyApi(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = await getValidAccessToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    if (res.status === 401) {
        throw new Error('TOKEN_EXPIRED');
    }
    return res;
}

export { mapSpotifyTrack };
