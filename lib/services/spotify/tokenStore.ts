export interface SpotifyTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // epoch ms
}

const TOKENS_KEY = 'lisa_spotify_tokens';

let memoryTokens: SpotifyTokens | null = null;

export function getTokens(): SpotifyTokens | null {
    if (memoryTokens) return memoryTokens;
    try {
        const raw = sessionStorage.getItem(TOKENS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as SpotifyTokens;
        if (!parsed.accessToken) return null;
        memoryTokens = parsed;
        return parsed;
    } catch {
        return null;
    }
}

export function setTokens(tokens: SpotifyTokens) {
    memoryTokens = tokens;
    try {
        sessionStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    } catch { /* ignore */ }
}

export function clearTokens() {
    memoryTokens = null;
    try {
        sessionStorage.removeItem(TOKENS_KEY);
    } catch { /* ignore */ }
}

export function isTokenExpiringSoon(tokens: SpotifyTokens, skewMs = 60_000): boolean {
    return Date.now() >= tokens.expiresAt - skewMs;
}
