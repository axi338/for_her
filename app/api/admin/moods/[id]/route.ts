import { NextResponse } from 'next/server';
import { getMood, saveMood } from '@/lib/services/moods/moodStore';
import type { MoodConfig, TrackRef } from '@/lib/providers/music/types';
import { parseSpotifyTrackId } from '@/lib/services/spotify/parseId';

function checkAdmin(req: Request) {
    const password = req.headers.get('x-admin-password') || req.headers.get('X-Admin-Password');
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return true;
    return Boolean(password) && password === expected;
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    if (!checkAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const existing = await getMood(params.id);

        const tracks: TrackRef[] = (body.tracks || existing?.tracks || []).map((t: any) => ({
            spotifyId: parseSpotifyTrackId(String(t.spotifyId || '')),
            customCover: t.customCover || '',
            note: t.note || '',
            addedAt: t.addedAt || new Date().toISOString(),
        })).filter((t: TrackRef) => Boolean(t.spotifyId));

        const mood: MoodConfig = {
            id: params.id,
            title: body.title ?? existing?.title ?? params.id,
            subtitle: body.subtitle ?? existing?.subtitle ?? '',
            description: body.description ?? existing?.description ?? '',
            cover: body.cover ?? existing?.cover ?? '/photos_to_use/photo_1.webp',
            background: body.background ?? existing?.background ?? body.cover ?? '/photos_to_use/photo_1.webp',
            glowColor: body.glowColor ?? existing?.glowColor ?? 'rgba(213, 180, 106, 0.4)',
            colorOpacity: body.colorOpacity ?? existing?.colorOpacity,
            emoji: body.emoji ?? existing?.emoji,
            tracks,
        };

        await saveMood(mood);
        return NextResponse.json({ mood });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to save mood' }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    if (!checkAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const mood = await getMood(params.id);
    if (!mood) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ mood });
}
