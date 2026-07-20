import { NextResponse } from 'next/server';
import { listMoods } from '@/lib/services/moods/moodStore';

export async function GET() {
    try {
        const moods = await listMoods();
        return NextResponse.json({ moods });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to load moods' }, { status: 500 });
    }
}
