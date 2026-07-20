'use client';

import React, { useState, useEffect } from 'react';
import type { MoodConfig, TrackRef } from '@/lib/providers/music/types';
import { parseSpotifyTrackId } from '@/lib/services/spotify/parseId';

interface VisitorVisit {
    visitorId: string;
    visitCount: number;
    firstSeen: string;
    lastSeen: string;
    path: string;
    userAgent: string;
    ip: string;
}

interface ChatMessage {
    id: string;
    visitorId: string;
    text: string;
    author: 'admin' | 'visitor';
    createdAt: string;
}

interface TrackPreview {
    spotifyId: string;
    title?: string;
    artist?: string;
    art?: string;
}

export default function AdminDashboard() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState('');
    const [activeTab, setActiveTab] = useState<'music' | 'messages' | 'visitors'>('music');

    const [moods, setMoods] = useState<MoodConfig[]>([]);
    const [selectedMoodId, setSelectedMoodId] = useState('');
    const [draft, setDraft] = useState<MoodConfig | null>(null);
    const [newTrackId, setNewTrackId] = useState('');
    const [newTrackCover, setNewTrackCover] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [newMoodName, setNewMoodName] = useState('');
    const [moodStatus, setMoodStatus] = useState('');
    const [previews, setPreviews] = useState<Record<string, TrackPreview>>({});

    const [visits, setVisits] = useState<VisitorVisit[]>([]);
    const [visitorLoading, setVisitorLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageReplyText, setMessageReplyText] = useState<Record<string, string>>({});
    const [replyStatus, setReplyStatus] = useState<Record<string, string>>({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('lisa_admin_pwd');
            if (stored) {
                setPassword(stored);
                verifyAdminAccess(stored);
            }
        }
    }, []);

    const verifyAdminAccess = async (pwd: string) => {
        try {
            const mockRes = await fetch('/api/visits', {
                headers: { 'x-admin-password': pwd },
            });
            if (mockRes.status === 401) {
                setAuthError('Incorrect Password');
                setIsAuthenticated(false);
            } else {
                sessionStorage.setItem('lisa_admin_pwd', pwd);
                setIsAuthenticated(true);
                setAuthError('');
                loadMoods(pwd);
            }
        } catch {
            setIsAuthenticated(true);
            loadMoods(pwd);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        verifyAdminAccess(password);
    };

    const loadMoods = async (pwd = password) => {
        try {
            const res = await fetch('/api/admin/moods', {
                headers: { 'x-admin-password': pwd },
            });
            if (!res.ok) {
                const publicRes = await fetch('/api/moods');
                const data = await publicRes.json();
                setMoods(data.moods || []);
                if (data.moods?.length && !selectedMoodId) {
                    selectMood(data.moods[0]);
                }
                return;
            }
            const data = await res.json();
            setMoods(data.moods || []);
            if (data.moods?.length && !selectedMoodId) {
                selectMood(data.moods[0]);
            }
        } catch { /* ignore */ }
    };

    const selectMood = (mood: MoodConfig) => {
        setSelectedMoodId(mood.id);
        setDraft({ ...mood, tracks: [...(mood.tracks || [])] });
        loadPreviews(mood.tracks || []);
    };

    const loadPreviews = async (tracks: TrackRef[]) => {
        const ids = tracks.map((t) => t.spotifyId).filter(Boolean);
        if (!ids.length) return;
        try {
            const res = await fetch(`/api/spotify/metadata?ids=${ids.slice(0, 50).join(',')}`);
            if (!res.ok) return;
            const data = await res.json();
            const next: Record<string, TrackPreview> = {};
            (data.tracks || []).forEach((t: any) => {
                if (!t) return;
                next[t.id] = {
                    spotifyId: t.id,
                    title: t.name,
                    artist: (t.artists || []).map((a: any) => a.name).join(', '),
                    art: t.album?.images?.[0]?.url,
                };
            });
            setPreviews((prev) => ({ ...prev, ...next }));
        } catch { /* ignore */ }
    };

    const handleCreateMood = async () => {
        if (!newMoodName.trim()) return;
        setMoodStatus('Creating…');
        try {
            const res = await fetch('/api/admin/moods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password,
                },
                body: JSON.stringify({ title: newMoodName.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                setMoodStatus('Created!');
                setNewMoodName('');
                await loadMoods();
                if (data.mood) selectMood(data.mood);
            } else {
                setMoodStatus(`Error: ${data.error}`);
            }
        } catch (e: any) {
            setMoodStatus(`Error: ${e.message}`);
        }
    };

    const handleDeleteMood = async (id: string) => {
        if (!confirm(`Delete mood "${id}"?`)) return;
        try {
            const res = await fetch(`/api/admin/moods?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-password': password },
            });
            if (res.ok) {
                setSelectedMoodId('');
                setDraft(null);
                loadMoods();
            }
        } catch { /* ignore */ }
    };

    const handleSaveMood = async () => {
        if (!draft) return;
        setSaveStatus('Saving…');
        try {
            const res = await fetch(`/api/admin/moods/${draft.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password,
                },
                body: JSON.stringify(draft),
            });
            const data = await res.json();
            if (res.ok) {
                setSaveStatus('Saved!');
                setDraft(data.mood);
                loadMoods();
            } else {
                setSaveStatus(`Error: ${data.error}`);
            }
        } catch (e: any) {
            setSaveStatus(`Error: ${e.message}`);
        }
    };

    const addTrack = () => {
        if (!draft) return;
        const id = parseSpotifyTrackId(newTrackId);
        if (!id) {
            setSaveStatus('Enter a valid Spotify track ID or URL');
            return;
        }
        if (draft.tracks.some((t) => t.spotifyId === id)) {
            setSaveStatus('Track already in this mood');
            return;
        }
        const track: TrackRef = {
            spotifyId: id,
            customCover: newTrackCover.trim(),
            addedAt: new Date().toISOString(),
        };
        const next = { ...draft, tracks: [...draft.tracks, track] };
        setDraft(next);
        setNewTrackId('');
        setNewTrackCover('');
        loadPreviews([track]);
    };

    const removeTrack = (spotifyId: string) => {
        if (!draft) return;
        setDraft({
            ...draft,
            tracks: draft.tracks.filter((t) => t.spotifyId !== spotifyId),
        });
    };

    const moveTrack = (index: number, dir: -1 | 1) => {
        if (!draft) return;
        const next = index + dir;
        if (next < 0 || next >= draft.tracks.length) return;
        const tracks = [...draft.tracks];
        [tracks[index], tracks[next]] = [tracks[next], tracks[index]];
        setDraft({ ...draft, tracks });
    };

    const loadVisitors = async () => {
        try {
            setVisitorLoading(true);
            const res = await fetch('/api/visits', {
                headers: { 'x-admin-password': password },
            });
            const data = await res.json();
            setVisits(data.visits || []);
        } catch { /* ignore */ }
        finally {
            setVisitorLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const res = await fetch('/api/messages');
            const data = await res.json();
            setMessages(data.messages || []);
        } catch { /* ignore */ }
    };

    const handleReplyMessage = async (visitorId: string) => {
        const replyText = messageReplyText[visitorId];
        if (!replyText?.trim()) return;
        setReplyStatus((prev) => ({ ...prev, [visitorId]: 'Sending...' }));
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password,
                },
                body: JSON.stringify({
                    action: 'reply',
                    visitor_id: visitorId,
                    text: replyText,
                }),
            });
            if (res.ok) {
                setReplyStatus((prev) => ({ ...prev, [visitorId]: 'Sent!' }));
                setMessageReplyText((prev) => ({ ...prev, [visitorId]: '' }));
                loadMessages();
            } else {
                throw new Error('fail');
            }
        } catch {
            setReplyStatus((prev) => ({ ...prev, [visitorId]: 'Failed to send' }));
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        if (activeTab === 'visitors') loadVisitors();
        else if (activeTab === 'messages') loadMessages();
    }, [activeTab, isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#131110' }}>
                <form
                    onSubmit={handleLogin}
                    className="glass-light"
                    style={{
                        width: '90%',
                        maxWidth: '400px',
                        padding: '3rem 2.5rem',
                        borderRadius: 'var(--radius)',
                        border: '2px solid rgba(213, 180, 106, 0.25)',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-card)',
                    }}
                >
                    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '2rem', marginBottom: '8px' }}>
                        System Access
                    </h2>
                    <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                        Enter credential token for administration
                    </p>
                    <input
                        type="password"
                        placeholder="Security token password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', marginBottom: '1rem', textAlign: 'center' }}
                    />
                    {authError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1.2rem' }}>{authError}</p>}
                    <button type="submit" className="btn btn-gold" style={{ width: '100%' }}>
                        Unlock Control
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0e0d0c', color: 'var(--text)', paddingTop: '2rem', paddingBottom: '6rem' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid rgba(213,180,106,0.15)', paddingBottom: '1rem' }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '2.5rem', fontWeight: 300 }}>
                            Lisa&apos;s Sanctuary Admin
                        </h1>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
                            Moods, Spotify track IDs, messages & visitor analytics
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                        {(['music', 'messages', 'visitors'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontFamily: 'var(--font-ui)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    background: activeTab === tab ? 'var(--gold)' : 'transparent',
                                    color: activeTab === tab ? 'var(--bg)' : 'var(--text2)',
                                    border: '1px solid',
                                    borderColor: activeTab === tab ? 'var(--gold)' : 'rgba(213,180,106,0.15)',
                                    cursor: 'pointer',
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                sessionStorage.removeItem('lisa_admin_pwd');
                                setIsAuthenticated(false);
                            }}
                            style={{ padding: '6px 10px', fontSize: '0.85rem', color: '#b91c1c', cursor: 'pointer', background: 'none', border: 'none' }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {activeTab === 'music' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            <div className="card glass-light" style={{ padding: '2rem', border: '1px solid rgba(213,180,106,0.15)', borderRadius: 'var(--radius)' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '1rem' }}>
                                    Create New Mood
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Mood name (e.g. Dreamy Breeze)"
                                        className="input"
                                        value={newMoodName}
                                        onChange={(e) => setNewMoodName(e.target.value)}
                                    />
                                    <button onClick={handleCreateMood} className="btn btn-gold">
                                        Create category
                                    </button>
                                    {moodStatus && <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{moodStatus}</p>}
                                </div>
                            </div>

                            <div className="card glass-light" style={{ padding: '2rem', border: '1px solid rgba(213,180,106,0.15)', borderRadius: 'var(--radius)' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '1rem' }}>
                                    Active Moods
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {moods.map((m) => (
                                        <div
                                            key={m.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                background: selectedMoodId === m.id ? 'var(--gold)' : 'rgba(213,180,106,0.06)',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <button
                                                onClick={() => selectMood(m)}
                                                style={{
                                                    padding: '6px 12px',
                                                    color: selectedMoodId === m.id ? 'var(--bg)' : 'var(--text)',
                                                    fontFamily: 'var(--font-ui)',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    background: 'none',
                                                    border: 'none',
                                                }}
                                            >
                                                {m.title}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMood(m.id)}
                                                style={{ padding: '6px 10px', background: 'rgba(185,28,28,0.2)', color: '#ef4444', cursor: 'pointer', border: 'none' }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {draft && (
                            <div className="glass-light" style={{ padding: '2.5rem', borderRadius: 'var(--radius)', border: '1px solid rgba(213,180,106,0.15)' }}>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>
                                    Edit: {draft.title}
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                    <Field label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
                                    <Field label="Subtitle" value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} />
                                    <Field label="Emoji" value={draft.emoji || ''} onChange={(v) => setDraft({ ...draft, emoji: v })} />
                                    <Field label="Cover path" value={draft.cover} onChange={(v) => setDraft({ ...draft, cover: v, background: v })} />
                                    <Field label="Glow color" value={draft.glowColor} onChange={(v) => setDraft({ ...draft, glowColor: v })} />
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Description</label>
                                        <textarea
                                            className="input"
                                            value={draft.description}
                                            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                                            rows={3}
                                            style={{ width: '100%', resize: 'vertical' }}
                                        />
                                    </div>
                                </div>

                                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text2)', fontSize: '1.25rem', marginBottom: '1rem' }}>
                                    Spotify tracks
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '1rem' }}>
                                    Paste a Spotify track URL, URI, or ID. No audio files are stored.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <input
                                        className="input"
                                        placeholder="https://open.spotify.com/track/… or ID"
                                        value={newTrackId}
                                        onChange={(e) => setNewTrackId(e.target.value)}
                                    />
                                    <input
                                        className="input"
                                        placeholder="Custom cover (optional)"
                                        value={newTrackCover}
                                        onChange={(e) => setNewTrackCover(e.target.value)}
                                    />
                                    <button type="button" className="btn btn-gold" onClick={addTrack}>
                                        Add
                                    </button>
                                </div>

                                {draft.tracks.length === 0 ? (
                                    <p style={{ color: 'var(--text3)', fontStyle: 'italic' }}>No tracks yet.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {draft.tracks.map((track, idx) => {
                                            const preview = previews[track.spotifyId];
                                            return (
                                                <div
                                                    key={`${track.spotifyId}-${idx}`}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        background: 'rgba(24,23,21,0.4)',
                                                        border: '1px solid rgba(213,180,106,0.06)',
                                                        borderRadius: '4px',
                                                        padding: '0.8rem 1.2rem',
                                                        gap: '1rem',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text3)', width: '20px' }}>{idx + 1}</span>
                                                        {(track.customCover || preview?.art) && (
                                                            <img
                                                                src={track.customCover || preview?.art}
                                                                alt=""
                                                                style={{ width: '40px', height: '40px', borderRadius: '2px', objectFit: 'cover' }}
                                                            />
                                                        )}
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontWeight: 500, color: '#fff' }}>
                                                                {preview?.title || 'Loading…'}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
                                                                {preview?.artist || track.spotifyId}
                                                            </div>
                                                            <input
                                                                className="input"
                                                                style={{ marginTop: '4px', fontSize: '0.75rem', width: '100%' }}
                                                                placeholder="Custom cover URL"
                                                                value={track.customCover || ''}
                                                                onChange={(e) => {
                                                                    const tracks = [...draft.tracks];
                                                                    tracks[idx] = { ...tracks[idx], customCover: e.target.value };
                                                                    setDraft({ ...draft, tracks });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <button onClick={() => moveTrack(idx, -1)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.3 : 1, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>▲</button>
                                                        <button onClick={() => moveTrack(idx, 1)} disabled={idx === draft.tracks.length - 1} style={{ opacity: idx === draft.tracks.length - 1 ? 0.3 : 1, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>▼</button>
                                                        <button onClick={() => removeTrack(track.spotifyId)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button className="btn btn-gold" onClick={handleSaveMood}>
                                        Save mood
                                    </button>
                                    {saveStatus && <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{saveStatus}</span>}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="glass-light" style={{ padding: '2.5rem', borderRadius: 'var(--radius)', border: '1px solid rgba(213,180,106,0.15)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '2rem' }}>
                            Visitor Letters Inbox
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {messages.length === 0 ? (
                                <p style={{ fontStyle: 'italic', color: 'var(--text3)' }}>No messages logged yet.</p>
                            ) : (
                                Object.entries(
                                    messages.reduce((acc: Record<string, ChatMessage[]>, msg) => {
                                        if (!acc[msg.visitorId]) acc[msg.visitorId] = [];
                                        acc[msg.visitorId].push(msg);
                                        return acc;
                                    }, {})
                                ).map(([vId, thread]) => (
                                    <div key={vId} style={{ background: 'rgba(24,23,21,0.5)', border: '1px solid rgba(213,180,106,0.1)', borderRadius: '6px', padding: '1.5rem' }}>
                                        <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
                                            Thread: {vId.slice(0, 18)}...
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                            {thread.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    style={{
                                                        alignSelf: msg.author === 'visitor' ? 'flex-start' : 'flex-end',
                                                        background: msg.author === 'visitor' ? 'rgba(255,255,255,0.03)' : 'rgba(213,180,106,0.1)',
                                                        border: '1px solid rgba(213,180,106,0.06)',
                                                        padding: '0.6rem 1rem',
                                                        borderRadius: '8px',
                                                        maxWidth: '85%',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text3)', display: 'block', textTransform: 'uppercase' }}>
                                                        {msg.author} • {new Date(msg.createdAt).toLocaleString()}
                                                    </span>
                                                    <p style={{ marginTop: '4px', fontSize: '0.92rem' }}>{msg.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                placeholder="Type reply..."
                                                className="input"
                                                style={{ flex: 1 }}
                                                value={messageReplyText[vId] || ''}
                                                onChange={(e) => setMessageReplyText((prev) => ({ ...prev, [vId]: e.target.value }))}
                                            />
                                            <button onClick={() => handleReplyMessage(vId)} className="btn btn-gold" style={{ fontSize: '0.8rem' }}>
                                                Reply
                                            </button>
                                        </div>
                                        {replyStatus[vId] && <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>{replyStatus[vId]}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'visitors' && (
                    <div className="glass-light" style={{ padding: '2.5rem', borderRadius: 'var(--radius)', border: '1px solid rgba(213,180,106,0.15)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--gold)', marginBottom: '2rem' }}>
                            Visitor Traffic logs
                        </h2>
                        {visitorLoading ? (
                            <p>Loading analytics data...</p>
                        ) : visits.length === 0 ? (
                            <p style={{ fontStyle: 'italic', color: 'var(--text3)' }}>No traffic recorded.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(213,180,106,0.3)', color: 'var(--gold)', textAlign: 'left' }}>
                                            <th style={{ padding: '8px 12px' }}>Visitor ID</th>
                                            <th style={{ padding: '8px 12px' }}>IP Adr</th>
                                            <th style={{ padding: '8px 12px' }}>Visits</th>
                                            <th style={{ padding: '8px 12px' }}>Last Seen</th>
                                            <th style={{ padding: '8px 12px' }}>Path</th>
                                            <th style={{ padding: '8px 12px' }}>Tech Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visits.map((vis, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                                                <td style={{ padding: '12px', fontFamily: 'monospace' }} title={vis.visitorId}>{vis.visitorId.slice(0, 12)}...</td>
                                                <td style={{ padding: '12px' }}>{vis.ip}</td>
                                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{vis.visitCount}</td>
                                                <td style={{ padding: '12px' }}>{new Date(vis.lastSeen).toLocaleString()}</td>
                                                <td style={{ padding: '12px', fontStyle: 'italic' }}>{vis.path}</td>
                                                <td style={{ padding: '12px', color: 'var(--text3)', fontSize: '0.75rem' }} title={vis.userAgent}>
                                                    {vis.userAgent.slice(0, 35)}...
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--text3)',
    marginBottom: '4px',
};

function Field({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <input className="input" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%' }} />
        </div>
    );
}
