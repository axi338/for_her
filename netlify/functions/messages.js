const {
    getAppStore,
    isAdmin,
    json,
    parseBody,
    readJSON,
    sanitizeText,
    writeJSON
} = require('./_shared');

const MESSAGES_KEY = 'messages.json';

exports.handler = async (event) => {
    const store = getAppStore();

    if (event.httpMethod === 'GET') {
        const messages = await readJSON(store, MESSAGES_KEY, []);

        if (isAdmin(event)) {
            return json(200, {
                messages: messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            });
        }

        return json(200, {
            messages: messages
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        });
    }

    if (event.httpMethod !== 'POST') {
        return json(405, { error: 'Method not allowed' });
    }

    const body = parseBody(event);
    const messages = await readJSON(store, MESSAGES_KEY, []);
    const now = new Date().toISOString();

    if (body.action === 'reply') {
        if (!isAdmin(event)) {
            return json(401, { error: 'Wrong password' });
        }

        const visitorId = sanitizeText(body.visitor_id, 120);
        const text = sanitizeText(body.text, 1000);

        if (!visitorId || !text) {
            return json(400, { error: 'Missing reply details' });
        }

        messages.push({
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            visitorId,
            text,
            author: 'admin',
            createdAt: now
        });

        await writeJSON(store, MESSAGES_KEY, messages.slice(-1000));
        return json(200, { ok: true });
    }

    const visitorId = sanitizeText(body.visitor_id, 120);
    const text = sanitizeText(body.text, 1000);

    if (!visitorId || !text) {
        return json(400, { error: 'Missing message details' });
    }

    messages.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        visitorId,
        text,
        author: 'visitor',
        createdAt: now
    });

    await writeJSON(store, MESSAGES_KEY, messages.slice(-1000));
    return json(200, { ok: true });
};
