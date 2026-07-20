const VERIFIER_KEY = 'lisa_spotify_pkce_verifier';
const STATE_KEY = 'lisa_spotify_pkce_state';

function randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values, (v) => chars[v % chars.length]).join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64UrlEncode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let str = '';
    bytes.forEach((b) => { str += String.fromCharCode(b); });
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createPkceChallenge(): Promise<{ verifier: string; challenge: string; state: string }> {
    const verifier = randomString(64);
    const state = randomString(32);
    const challenge = base64UrlEncode(await sha256(verifier));
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);
    return { verifier, challenge, state };
}

export function consumePkceVerifier(): string | null {
    const v = sessionStorage.getItem(VERIFIER_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);
    return v;
}

export function consumePkceState(): string | null {
    const s = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);
    return s;
}

export const SPOTIFY_SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
].join(' ');
