const { getStore } = require('@netlify/blobs');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '882336201';

function json(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        },
        body: JSON.stringify(body)
    };
}

function parseBody(event) {
    if (!event.body) return {};

    try {
        return JSON.parse(event.body);
    } catch (error) {
        return {};
    }
}

function isAdmin(event) {
    const password = event.headers['x-admin-password'] || event.headers['X-Admin-Password'];
    return password === ADMIN_PASSWORD;
}

function sanitizeText(value, maxLength) {
    return String(value || '').trim().slice(0, maxLength);
}

function getClientIp(event) {
    const forwardedFor = event.headers['x-forwarded-for'];
    if (!forwardedFor) return 'unknown';
    return forwardedFor.split(',')[0].trim() || 'unknown';
}

function getAppStore() {
    return getStore({
        name: 'for-her-tracker',
        consistency: 'strong'
    });
}

async function readJSON(store, key, fallback) {
    const value = await store.get(key, { type: 'json' });
    return value || fallback;
}

async function writeJSON(store, key, value) {
    await store.setJSON(key, value);
}

module.exports = {
    getAppStore,
    getClientIp,
    isAdmin,
    json,
    parseBody,
    readJSON,
    sanitizeText,
    writeJSON
};
