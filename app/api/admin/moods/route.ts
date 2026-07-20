import { NextResponse } from 'next/server';
import { deleteMood, getMood, saveMood, slugifyMoodName } from '@/lib/services/moods/moodStore';
import type { MoodConfig } from '@/lib/providers/music/types';

function checkAdmin(req: Request) {
    const password = req.headers.get('x-admin-password') || req.headers.get('X-Admin-Password');
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return true;
    return Boolean(password) && password === expected;
}

export async function GET(req: Request) {
    if (!checkAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { listMoods } = await import('@/lib/services/moods/moodStore');
    const moods = await listMoods();
    return NextResponse.json({ moods });
}

export async function POST(req: Request) {
    if (!checkAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const title = String(body.title || '').trim();
        if (!title) {
            return NextResponse.json({ error: 'Title required' }, { status: 400 });
        }

        const id = slugifyMoodName(body.id || title);
        const existing = await getMood(id);
        if (existing) {
            return NextResponse.json({ error: 'Mood already exists' }, { status: 409 });
        }

        const mood: MoodConfig = {
            id,
            title,
            subtitle: body.subtitle || '',
            description: body.description || '',
            cover: body.cover || '/photos_to_use/photo_1.webp',
            background: body.background || body.cover || '/photos_to_use/photo_1.webp',
            glowColor: body.glowColor || 'rgba(213, 180, 106, 0.4)',
            colorOpacity: body.colorOpacity || 'rgba(213, 180, 106, 0.15)',
            emoji: body.emoji || '',
            tracks: [],
        };

        await saveMood(mood);
        return NextResponse.json({ mood });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create mood' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    if (!checkAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }
        await deleteMood(id);
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to delete mood' }, { status: 500 });
    }
}
