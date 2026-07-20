import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VISITS_KEY = 'visits.json';

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

function getIpAddress(req: Request) {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return '127.0.0.1';
}

export async function GET(req: Request) {
    const store = await getStoreData();

    if (!checkAdmin(req)) {
        return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
    }

    const visits = await readJSON(store, VISITS_KEY, []);
    visits.sort((a: any, b: any) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

    return NextResponse.json({ visits });
}

export async function POST(req: Request) {
    try {
        const store = await getStoreData();
        const body = await req.json();
        const visitorId = body.visitor_id?.trim().slice(0, 120);

        if (!visitorId) {
            return NextResponse.json({ error: 'Missing visitor id' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const visits = await readJSON(store, VISITS_KEY, []);
        const existing = visits.find((visit: any) => visit.visitorId === visitorId);

        const visit = {
            visitorId,
            visitCount: Number(body.visit_count || 1),
            firstSeen: body.first_seen?.slice(0, 40) || now,
            lastSeen: now,
            path: body.path?.slice(0, 250) || '',
            pageTitle: body.page_title?.slice(0, 120) || '',
            referrer: body.referrer?.slice(0, 250) || 'direct',
            language: body.language?.slice(0, 40) || '',
            timezone: body.timezone?.slice(0, 80) || '',
            screen: body.screen?.slice(0, 40) || '',
            userAgent: body.user_agent?.slice(0, 500) || '',
            ip: getIpAddress(req)
        };

        if (existing) {
            Object.assign(existing, visit, {
                firstSeen: existing.firstSeen || visit.firstSeen,
                visitCount: Math.max(existing.visitCount || 0, visit.visitCount)
            });
        } else {
            visits.push(visit);
        }

        await writeJSON(store, VISITS_KEY, visits.slice(-500));
        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
