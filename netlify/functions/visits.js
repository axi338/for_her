const {
    getAppStore,
    getClientIp,
    isAdmin,
    json,
    parseBody,
    readJSON,
    sanitizeText,
    writeJSON
} = require('./_shared');

const VISITS_KEY = 'visits.json';

exports.handler = async (event) => {
    const store = getAppStore();

    if (event.httpMethod === 'GET') {
        if (!isAdmin(event)) {
            return json(401, { error: 'Wrong password' });
        }

        const visits = await readJSON(store, VISITS_KEY, []);
        return json(200, {
            visits: visits.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
        });
    }

    if (event.httpMethod !== 'POST') {
        return json(405, { error: 'Method not allowed' });
    }

    const body = parseBody(event);
    const visitorId = sanitizeText(body.visitor_id, 120);

    if (!visitorId) {
        return json(400, { error: 'Missing visitor id' });
    }

    const now = new Date().toISOString();
    const visits = await readJSON(store, VISITS_KEY, []);
    const existing = visits.find((visit) => visit.visitorId === visitorId);

    const visit = {
        visitorId,
        visitCount: Number(body.visit_count || 1),
        firstSeen: sanitizeText(body.first_seen, 40) || now,
        lastSeen: now,
        path: sanitizeText(body.path, 250),
        pageTitle: sanitizeText(body.page_title, 120),
        referrer: sanitizeText(body.referrer, 250),
        language: sanitizeText(body.language, 40),
        timezone: sanitizeText(body.timezone, 80),
        screen: sanitizeText(body.screen, 40),
        userAgent: sanitizeText(body.user_agent, 500),
        ip: getClientIp(event)
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
    return json(200, { ok: true });
};
