import { NextResponse } from 'next/server';
import { getMood } from '@/lib/services/moods/moodStore';

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const mood = await getMood(params.id);
        if (!mood) {
            return NextResponse.json({ error: 'Mood not found' }, { status: 404 });
        }
        return NextResponse.json({ mood });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to load mood' }, { status: 500 });
    }
}
