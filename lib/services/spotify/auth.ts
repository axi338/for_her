import { createPkceChallenge, consumePkceVerifier, consumePkceState, SPOTIFY_SCOPES } from './pkce';
import { getTokens, setTokens, clearTokens, isTokenExpiringSoon, SpotifyTokens } from './tokenStore';

function getClientId(): string {
    return process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
}

export function getRedirectUri(): string {
    if (process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
        return process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
    }
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/music/callback`;
    }
    return '';
}

export function isSpotifyConfigured(): boolean {
    return Boolean(getClientId());
}

export async function beginSpotifyLogin(returnTo = '/music'): Promise<void> {
    const clientId = getClientId();
    if (!clientId) throw new Error('Spotify Client ID is not configured');

    const { challenge, state } = await createPkceChallenge();
    sessionStorage.setItem('lisa_spotify_return_to', returnTo);

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: getRedirectUri(),
        scope: SPOTIFY_SCOPES,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        state,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, state: string): Promise<SpotifyTokens> {
    const expectedState = consumePkceState();
    if (!expectedState || expectedState !== state) {
        throw new Error('Invalid OAuth state');
    }

    const verifier = consumePkceVerifier();
    if (!verifier) throw new Error('Missing PKCE verifier');

    const clientId = getClientId();
    const body = new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: getRedirectUri(),
        code_verifier: verifier,
    });

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Token exchange failed: ${err}`);
    }

    const data = await res.json();
    const tokens: SpotifyTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };
    setTokens(tokens);
    return tokens;
}

export async function refreshAccessToken(): Promise<SpotifyTokens | null> {
    const current = getTokens();
    if (!current?.refreshToken) return null;

    const clientId = getClientId();
    const body = new URLSearchParams({
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: current.refreshToken,
    });

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    if (!res.ok) {
        clearTokens();
        return null;
    }

    const data = await res.json();
    const tokens: SpotifyTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || current.refreshToken,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };
    setTokens(tokens);
    return tokens;
}

export async function getValidAccessToken(): Promise<string | null> {
    let tokens = getTokens();
    if (!tokens) return null;

    if (isTokenExpiringSoon(tokens)) {
        tokens = await refreshAccessToken();
    }
    return tokens?.accessToken || null;
}

export function logoutSpotify() {
    clearTokens();
}

export function getReturnToPath(): string {
    try {
        return sessionStorage.getItem('lisa_spotify_return_to') || '/music';
    } catch {
        return '/music';
    }
}

export { getTokens, clearTokens };
