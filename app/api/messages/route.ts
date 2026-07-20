import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MESSAGES_KEY = 'messages.json';

async function getStoreData() {
    try {
        const { getStore } = await import('@netlify/blobs');
        const store = getStore({
            name: 'for-her-tracker',
            consistency: 'strong',
        });
        return store;
    } catch (e) {
        console.warn('Netlify blobs not available, falling back to local simulation.');
        return null;
    }
}

// Fallback persistence for local testing
const LOCAL_DB_DIR = path.join(process.cwd(), 'public', 'mock_db');
if (!fs.existsSync(LOCAL_DB_DIR)) {
    fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
}

async function readJSON(store: any, key: string, fallback: any) {
    if (store) {
        try {
            const val = await store.get(key, { type: 'json' });
            return val || fallback;
        } catch (e) {
            console.warn('Failed to read from Netlify Blobs, trying local DB', e);
        }
    }

    const localPath = path.join(LOCAL_DB_DIR, key);
    if (fs.existsSync(localPath)) {
        try {
            return JSON.parse(fs.readFileSync(localPath, 'utf-8'));
        } catch (e) { }
    }
    return fallback;
}

async function writeJSON(store: any, key: string, value: any) {
    if (store) {
        try {
            await store.setJSON(key, value);
            return;
        } catch (e) {
            console.warn('Failed to write to Netlify Blobs, writing to local DB', e);
        }
    }

    const localPath = path.join(LOCAL_DB_DIR, key);
    fs.writeFileSync(localPath, JSON.stringify(value, null, 2), 'utf-8');
}

function checkAdmin(req: Request) {
    const password = req.headers.get('x-admin-password') || req.headers.get('X-Admin-Password');
    const expected = process.env.ADMIN_PASSWORD;
    return Boolean(expected) && password === expected;
}

export async function GET(req: Request) {
    const store = await getStoreData();
    const messages = await readJSON(store, MESSAGES_KEY, []);

    // Sort messages older to newer
    const sorted = messages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return NextResponse.json({ messages: sorted });
}

export async function POST(req: Request) {
    try {
        const store = await getStoreData();
        const body = await req.json();
        const messages = await readJSON(store, MESSAGES_KEY, []);
        const now = new Date().toISOString();

        const visitorId = body.visitor_id?.trim().slice(0, 120);
        const text = body.text?.trim().slice(0, 1000);

        if (!visitorId || !text) {
            return NextResponse.json({ error: 'Missing details' }, { status: 400 });
        }

        if (body.action === 'reply') {
            if (!checkAdmin(req)) {
                return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
            }

            messages.push({
                id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                visitorId,
                text,
                author: 'admin',
                createdAt: now
            });

            await writeJSON(store, MESSAGES_KEY, messages.slice(-1000));
            return NextResponse.json({ ok: true });
        }

        messages.push({
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            visitorId,
            text,
            author: 'visitor',
            createdAt: now
        });

        await writeJSON(store, MESSAGES_KEY, messages.slice(-1000));
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
