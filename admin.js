const loginForm = document.getElementById('admin-login-form');
const passwordInput = document.getElementById('admin-password');
const loginError = document.getElementById('admin-login-error');
const loginCard = document.getElementById('admin-login');
const dashboard = document.getElementById('admin-dashboard');
const refreshButton = document.getElementById('admin-refresh');
const summary = document.getElementById('admin-summary');
const visitsList = document.getElementById('visits-list');
const messagesList = document.getElementById('messages-list');

let adminPassword = sessionStorage.getItem('for_her_admin_password') || '';

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    adminPassword = passwordInput.value.trim();
    sessionStorage.setItem('for_her_admin_password', adminPassword);
    await loadDashboard();
});

refreshButton.addEventListener('click', loadDashboard);

if (adminPassword) {
    passwordInput.value = adminPassword;
    loadDashboard();
}

async function loadDashboard() {
    loginError.textContent = '';

    try {
        const [visitsResponse, messagesResponse] = await Promise.all([
            fetch('/.netlify/functions/visits', {
                headers: { 'X-Admin-Password': adminPassword }
            }),
            fetch('/.netlify/functions/messages', {
                headers: { 'X-Admin-Password': adminPassword }
            })
        ]);

        if (visitsResponse.status === 401 || messagesResponse.status === 401) {
            throw new Error('Wrong password');
        }

        if (!visitsResponse.ok || !messagesResponse.ok) {
            throw new Error('Could not load tracker data yet');
        }

        const visitsData = await visitsResponse.json();
        const messagesData = await messagesResponse.json();
        loginCard.classList.add('hidden');
        dashboard.classList.remove('hidden');
        renderVisits(visitsData.visits || []);
        renderMessages(messagesData.messages || []);
    } catch (error) {
        loginCard.classList.remove('hidden');
        dashboard.classList.add('hidden');
        loginError.textContent = error.message;
    }
}

function renderVisits(visits) {
    summary.textContent = `${visits.length} visitor${visits.length === 1 ? '' : 's'} tracked`;
    visitsList.innerHTML = '';

    if (!visits.length) {
        visitsList.appendChild(emptyState('No visits yet. Open the live site once after deploy.'));
        return;
    }

    visits.forEach((visit) => {
        const card = document.createElement('article');
        card.className = 'admin-item';
        card.innerHTML = `
            <strong>${escapeHTML(shortId(visit.visitorId))}</strong>
            <span>${escapeHTML(formatDate(visit.lastSeen))}</span>
            <p>${escapeHTML(visit.path || '/')} - ${escapeHTML(visit.timezone || 'unknown timezone')}</p>
            <p>${escapeHTML(visit.language || 'unknown language')} - ${escapeHTML(visit.screen || 'unknown screen')}</p>
            <p>${escapeHTML(visit.referrer || 'direct')}</p>
            <small>${escapeHTML(visit.userAgent || '')}</small>
        `;
        visitsList.appendChild(card);
    });
}

function renderMessages(messages) {
    messagesList.innerHTML = '';

    if (!messages.length) {
        messagesList.appendChild(emptyState('No messages yet.'));
        return;
    }

    const grouped = messages.reduce((groups, message) => {
        const key = message.visitorId;
        groups[key] = groups[key] || [];
        groups[key].push(message);
        return groups;
    }, {});

    Object.entries(grouped).forEach(([visitorId, visitorMessages]) => {
        const thread = document.createElement('article');
        thread.className = 'admin-item message-admin-thread';
        thread.innerHTML = `
            <strong>${escapeHTML(shortId(visitorId))}</strong>
            <div class="admin-thread-messages"></div>
            <form class="admin-reply-form">
                <textarea placeholder="Reply..." rows="2"></textarea>
                <button type="submit">Reply</button>
            </form>
        `;

        const threadMessages = thread.querySelector('.admin-thread-messages');
        visitorMessages.forEach((message) => {
            const bubble = document.createElement('p');
            bubble.className = `admin-message ${message.author === 'admin' ? 'from-admin' : 'from-visitor'}`;
            bubble.textContent = `${message.author === 'admin' ? 'You' : 'Visitor'}: ${message.text}`;
            threadMessages.appendChild(bubble);
        });

        const form = thread.querySelector('.admin-reply-form');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const input = form.querySelector('textarea');
            const text = input.value.trim();
            if (!text) return;

            await fetch('/.netlify/functions/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': adminPassword
                },
                body: JSON.stringify({
                    action: 'reply',
                    visitor_id: visitorId,
                    text
                })
            });

            input.value = '';
            await loadDashboard();
        });

        messagesList.appendChild(thread);
    });
}

function emptyState(text) {
    const el = document.createElement('p');
    el.className = 'admin-empty';
    el.textContent = text;
    return el;
}

function shortId(id) {
    return id ? `Visitor ${id.slice(0, 8)}` : 'Unknown visitor';
}

function formatDate(value) {
    if (!value) return 'unknown time';
    return new Date(value).toLocaleString();
}

function escapeHTML(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}
