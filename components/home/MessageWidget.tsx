'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
    id: string;
    visitorId: string;
    text: string;
    author: 'admin' | 'visitor';
    createdAt: string;
}

export function MessageWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [status, setStatus] = useState('');
    const threadRef = useRef<HTMLDivElement | null>(null);

    // Get tracker visitor helper
    const getVisitorId = () => {
        if (typeof window === 'undefined') return 'unknown';
        try {
            const storageKey = 'lisa_visit_tracker';
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.id) return parsed.id;
            }
        } catch (e) { }
        return 'unknown_visitor';
    };

    const loadMessages = async () => {
        try {
            const response = await fetch('/api/messages');
            if (!response.ok) throw new Error('Failed to load');
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (e) {
            // Offline / fallback storage
            try {
                const cached = localStorage.getItem('lisa_shared_messages_cache');
                if (cached) setMessages(JSON.parse(cached));
            } catch (ex) { }
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadMessages();
            // Poll every 15s when open
            const interval = setInterval(loadMessages, 15000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    useEffect(() => {
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = inputText.trim();
        if (!text) return;

        const visitorId = getVisitorId();
        const newMsg: ChatMessage = {
            id: `local_${Date.now()}`,
            visitorId,
            text,
            author: 'visitor',
            createdAt: new Date().toISOString()
        };

        // Optimistically update
        const updatedMsgs = [...messages, newMsg];
        setMessages(updatedMsgs);
        setInputText('');
        setStatus('Sending...');

        try {
            localStorage.setItem('lisa_shared_messages_cache', JSON.stringify(updatedMsgs.slice(-100)));
        } catch (e) { }

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitor_id: visitorId, text })
            });
            if (response.ok) {
                setStatus('Sent');
                loadMessages();
            } else {
                throw new Error('Upload error');
            }
        } catch (err) {
            setStatus('Saved locally. Will retry next time.');
        }
    };

    return (
        <>
            {/* Floating launcher button */}
            <button
                id="message-launcher"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open messages"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 9999,
                    background: 'var(--btn)',
                    color: 'var(--text)',
                    border: '1px solid rgba(213,180,106,0.3)',
                    boxShadow: 'var(--shadow-glow)',
                    padding: '0.8rem 1.6rem',
                    borderRadius: '99px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <span>✉</span> Message
            </button>

            {/* Slide-out widget panel */}
            <aside
                id="message-panel"
                className={isOpen ? '' : 'hidden'}
                style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '24px',
                    width: '320px',
                    height: '420px',
                    zIndex: 9998,
                    borderRadius: 'var(--radius)',
                    background: 'rgba(24, 23, 21, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(213,180,106,0.15)',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.3s ease, visibility 0.3s',
                    transformOrigin: 'bottom right'
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '1rem',
                        borderBottom: '1px solid rgba(213,180,106,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(43, 33, 27, 0.4)'
                    }}
                >
                    <div>
                        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.08em', marginBottom: '2px' }}>
                            Private note
                        </p>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)' }}>
                            Write to me
                        </h3>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close messages"
                        style={{
                            fontSize: '1.5rem',
                            color: 'var(--text2)',
                            cursor: 'pointer',
                            lineHeight: 1
                        }}
                    >
                        &times;
                    </button>
                </div>

                {/* Messages list thread */}
                <div
                    ref={threadRef}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem'
                    }}
                >
                    {messages.length === 0 ? (
                        <p style={{ textAlign: 'center', margin: 'auto', color: 'var(--text3)', fontStyle: 'italic', fontSize: '0.9rem', padding: '1rem' }}>
                            No messages yet. Send one and it will appear here.
                        </p>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: msg.author === 'visitor' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    padding: '0.6rem 0.9rem',
                                    borderRadius: '12px',
                                    borderTopRightRadius: msg.author === 'visitor' ? '2px' : '12px',
                                    borderTopLeftRadius: msg.author === 'admin' ? '2px' : '12px',
                                    background: msg.author === 'visitor' ? 'var(--btn)' : 'var(--card)',
                                    color: 'var(--text)',
                                    border: '1px solid rgba(213,180,106,0.08)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.4'
                                }}
                            >
                                <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 500 }}>
                                    {msg.author === 'visitor' ? 'You' : 'Lisa'}
                                </div>
                                <p>{msg.text}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Form footer */}
                <form
                    onSubmit={handleSubmit}
                    style={{
                        padding: '1rem',
                        borderTop: '1px solid rgba(213,180,106,0.1)',
                        background: 'rgba(24, 23, 21, 0.4)'
                    }}
                >
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your message..."
                        rows={2}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(24, 23, 21, 0.9)',
                            color: 'var(--text)',
                            border: '1px solid rgba(213,180,106,0.15)',
                            resize: 'none',
                            outline: 'none',
                            fontSize: '0.9rem',
                            fontFamily: 'var(--font-ui)',
                            marginBottom: '0.5rem'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{status}</span>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                padding: '0.4rem 1.2rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem'
                            }}
                        >
                            Send
                        </button>
                    </div>
                </form>
            </aside>

            <style jsx global>{`
        #message-launcher:hover {
          background: var(--btn-hover) !important;
          transform: translateY(-2px);
          box-shadow: 0 0 35px rgba(213,180,106,0.4);
        }
        #message-panel.hidden {
          transform: scale(0.9) translateY(20px);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
      `}</style>
        </>
    );
}
