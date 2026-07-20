import { NextResponse } from 'next/server';

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getClientCredentialsToken(): Promise<string | null> {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
        return cachedToken.accessToken;
    }

    const body = new URLSearchParams({
        grant_type: 'client_credentials',
    });

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body,
    });

    if (!res.ok) {
        console.error('Client credentials failed', await res.text());
        return null;
    }

    const data = await res.json();
    cachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };
    return cachedToken.accessToken;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids') || '';
    const ids = idsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 50);

    if (ids.length === 0) {
        return NextResponse.json({ tracks: [] });
    }

    const token = await getClientCredentialsToken();
    if (!token) {
        return NextResponse.json(
            { error: 'Spotify metadata unavailable. Set SPOTIFY_CLIENT_SECRET.', tracks: [] },
            { status: 503 }
        );
    }

    try {
        const res = await fetch(`https://api.spotify.com/v1/tracks?ids=${ids.join(',')}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: text, tracks: [] }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json({ tracks: data.tracks || [] });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch metadata', tracks: [] }, { status: 500 });
    }
}
