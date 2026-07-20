import fs from 'fs';
import path from 'path';
import type { MoodConfig } from '@/lib/providers/music/types';

const MOODS_DIR = path.join(process.cwd(), 'data', 'moods');
const BLOBS_KEY_PREFIX = 'mood:';
const LOCAL_DB_DIR = path.join(process.cwd(), 'public', 'mock_db', 'moods');

async function getStore() {
    try {
        const { getStore } = await import('@netlify/blobs');
        return getStore({
            name: 'for-her-tracker',
            consistency: 'strong',
        });
    } catch {
        return null;
    }
}

function ensureLocalDir() {
    if (!fs.existsSync(LOCAL_DB_DIR)) {
        fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
}

function readDefaultMood(id: string): MoodConfig | null {
    const filePath = path.join(MOODS_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as MoodConfig;
    } catch {
        return null;
    }
}

function listDefaultMoodIds(): string[] {
    if (!fs.existsSync(MOODS_DIR)) return [];
    return fs
        .readdirSync(MOODS_DIR)
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace(/\.json$/, ''));
}

async function readBlobMood(id: string): Promise<MoodConfig | null> {
    const store = await getStore();
    if (store) {
        try {
            const val = await store.get(`${BLOBS_KEY_PREFIX}${id}`, { type: 'json' });
            if (val) return val as MoodConfig;
        } catch { /* fall through */ }
    }

    ensureLocalDir();
    const localPath = path.join(LOCAL_DB_DIR, `${id}.json`);
    if (fs.existsSync(localPath)) {
        try {
            return JSON.parse(fs.readFileSync(localPath, 'utf-8')) as MoodConfig;
        } catch { /* ignore */ }
    }
    return null;
}

export async function getMood(id: string): Promise<MoodConfig | null> {
    const override = await readBlobMood(id);
    if (override) return override;
    return readDefaultMood(id);
}

export async function listMoods(): Promise<MoodConfig[]> {
    const ids = new Set(listDefaultMoodIds());

    // Also include blob-only moods
    ensureLocalDir();
    if (fs.existsSync(LOCAL_DB_DIR)) {
        fs.readdirSync(LOCAL_DB_DIR)
            .filter((f) => f.endsWith('.json'))
            .forEach((f) => ids.add(f.replace(/\.json$/, '')));
    }

    const moods: MoodConfig[] = [];
    for (const id of Array.from(ids)) {
        const mood = await getMood(id);
        if (mood) moods.push(mood);
    }

    // Stable order matching hub design
    const order = ['blooming', 'longing', 'quiet-rain', 'resting', 'golden-hour', 'dreaming'];
    moods.sort((a, b) => {
        const ai = order.indexOf(a.id);
        const bi = order.indexOf(b.id);
        if (ai === -1 && bi === -1) return a.title.localeCompare(b.title);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });

    return moods;
}

export async function saveMood(mood: MoodConfig): Promise<void> {
    const store = await getStore();
    if (store) {
        try {
            await store.setJSON(`${BLOBS_KEY_PREFIX}${mood.id}`, mood);
            return;
        } catch (e) {
            console.warn('Blob write failed, using local DB', e);
        }
    }

    ensureLocalDir();
    const localPath = path.join(LOCAL_DB_DIR, `${mood.id}.json`);
    fs.writeFileSync(localPath, JSON.stringify(mood, null, 2), 'utf-8');

    // Also write to data/moods in local/dev so repo stays in sync when possible
    try {
        if (!fs.existsSync(MOODS_DIR)) fs.mkdirSync(MOODS_DIR, { recursive: true });
        fs.writeFileSync(path.join(MOODS_DIR, `${mood.id}.json`), JSON.stringify(mood, null, 2), 'utf-8');
    } catch { /* read-only deploy FS */ }
}

export async function deleteMood(id: string): Promise<void> {
    const store = await getStore();
    if (store) {
        try {
            await store.delete(`${BLOBS_KEY_PREFIX}${id}`);
        } catch { /* ignore */ }
    }
    ensureLocalDir();
    const localPath = path.join(LOCAL_DB_DIR, `${id}.json`);
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);

    const defaultPath = path.join(MOODS_DIR, `${id}.json`);
    if (fs.existsSync(defaultPath)) {
        try {
            fs.unlinkSync(defaultPath);
        } catch { /* ignore */ }
    }
}

export function slugifyMoodName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
