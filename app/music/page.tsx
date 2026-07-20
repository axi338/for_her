'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MusicIntro } from '@/components/music/MusicIntro';
import { SpotifyConnect } from '@/components/music/SpotifyConnect';
import { PetalCanvas } from '@/components/home/PetalCanvas';
import { useMusic, Song } from '@/lib/musicContext';
import type { MoodConfig } from '@/lib/providers/music/types';

export default function MusicHubPage() {
    const [introCompleted, setIntroCompleted] = useState<boolean | null>(null);
    const [showConnect, setShowConnect] = useState(true);
    const [moods, setMoods] = useState<MoodConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const { isSpotifyConnected, recentlyPlayed, playSong, needsReconnect, connectSpotify } =
        useMusic();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const shown = sessionStorage.getItem('lisa_music_intro_shown');
            setIntroCompleted(shown === 'true');
            const skipped = sessionStorage.getItem('lisa_spotify_connect_skipped');
            if (skipped === 'true' || isSpotifyConnected) {
                setShowConnect(false);
            }
        }
    }, [isSpotifyConnected]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/moods');
                if (!res.ok) throw new Error('Failed to load moods');
                const data = await res.json();
                setMoods(data.moods || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleIntroComplete = () => {
        setIntroCompleted(true);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('lisa_music_intro_shown', 'true');
        }
    };

    const handleSkipConnect = () => {
        setShowConnect(false);
        sessionStorage.setItem('lisa_spotify_connect_skipped', 'true');
    };

    if (introCompleted === null) {
        return <div style={{ background: '#0f0e0d', minHeight: '100vh' }} />;
    }

    const showConnectScreen =
        introCompleted && showConnect && !isSpotifyConnected;

    return (
        <>
            {!introCompleted && <MusicIntro onComplete={handleIntroComplete} />}

            <div
                style={{
                    minHeight: '100vh',
                    background: 'radial-gradient(ellipse at center, #1b1613 0%, #0f0e0d 100%)',
                    position: 'relative',
                    paddingTop: 'var(--nav-height)',
                    opacity: introCompleted ? 1 : 0,
                    transition: 'opacity 1s ease',
                    overflow: 'hidden',
                }}
            >
                <PetalCanvas />

                {showConnectScreen ? (
                    <SpotifyConnect onSkip={handleSkipConnect} />
                ) : (
                    <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: '6rem' }}>
                        {/* Reconnect banner */}
                        {(needsReconnect || (!isSpotifyConnected && !showConnect)) && (
                            <div
                                style={{
                                    margin: '1.5rem 1.5rem 0',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '16px',
                                    background: 'rgba(213,180,106,0.08)',
                                    border: '1px solid rgba(213,180,106,0.25)',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '1rem',
                                }}
                            >
                                <p style={{ color: 'var(--text2)', fontSize: '0.95rem', margin: 0 }}>
                                    {needsReconnect
                                        ? 'Your Spotify session expired.'
                                        : 'Connect Spotify for in-app playback.'}
                                </p>
                                <button className="btn btn-gold" onClick={() => connectSpotify()}>
                                    Connect Spotify
                                </button>
                            </div>
                        )}

                        <div style={{ textAlign: 'center', margin: '4rem 0 3rem' }}>
                            <h1
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                    color: 'var(--text)',
                                    marginBottom: '1rem',
                                    animation: 'fadeInUp 0.8s ease',
                                }}
                            >
                                How does your heart feel today?
                            </h1>
                            <div
                                style={{
                                    margin: '0 auto',
                                    width: '80px',
                                    height: '1px',
                                    background: 'var(--gold)',
                                    opacity: 0.3,
                                }}
                            />
                        </div>

                        {/* Continue Listening */}
                        {recentlyPlayed.length > 0 && (
                            <div style={{ padding: '0 1.5rem', marginBottom: '3rem' }}>
                                <h2
                                    style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '1.4rem',
                                        color: 'var(--gold)',
                                        marginBottom: '1rem',
                                    }}
                                >
                                    Continue Listening
                                </h2>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        overflowX: 'auto',
                                        paddingBottom: '0.5rem',
                                    }}
                                >
                                    {recentlyPlayed.slice(0, 8).map((song: Song) => (
                                        <button
                                            key={song.id}
                                            onClick={() => playSong(song, recentlyPlayed)}
                                            style={{
                                                flex: '0 0 140px',
                                                background: 'rgba(24,23,21,0.4)',
                                                border: '1px solid rgba(213,180,106,0.12)',
                                                borderRadius: '14px',
                                                padding: '0.75rem',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                color: 'inherit',
                                            }}
                                        >
                                            <img
                                                src={song.art}
                                                alt=""
                                                style={{
                                                    width: '100%',
                                                    aspectRatio: '1',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    marginBottom: '0.5rem',
                                                }}
                                            />
                                            <div
                                                style={{
                                                    fontFamily: 'var(--font-display)',
                                                    fontSize: '0.95rem',
                                                    color: 'var(--text)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {song.title}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text3)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {song.artist}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '3rem',
                                    padding: '0 1.5rem',
                                }}
                            >
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="skeleton"
                                        style={{ height: '420px', borderRadius: '24px' }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '3rem',
                                    padding: '0 1.5rem',
                                }}
                            >
                                {moods.map((mood, idx) => (
                                    <Link href={`/music/${mood.id}`} key={mood.id}>
                                        <div
                                            className="mood-card"
                                            style={
                                                {
                                                    position: 'relative',
                                                    height: '420px',
                                                    borderRadius: '24px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    boxShadow: 'var(--shadow-card)',
                                                    border: '1px solid rgba(213, 180, 106, 0.12)',
                                                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                                                    animation: `fadeInUp 0.8s ease forwards`,
                                                    animationDelay: `${idx * 120}ms`,
                                                    opacity: 0,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'flex-end',
                                                    '--glow-color': mood.glowColor,
                                                } as React.CSSProperties
                                            }
                                        >
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    backgroundImage: `url(${mood.cover})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                                                    zIndex: 0,
                                                }}
                                                className="mood-bg"
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background:
                                                        'linear-gradient(to bottom, rgba(24, 23, 21, 0.1) 0%, rgba(24, 23, 21, 0.4) 60%, rgba(24, 23, 21, 0.85) 100%)',
                                                    zIndex: 1,
                                                }}
                                                className="mood-overlay"
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '-50%',
                                                    left: '-50%',
                                                    width: '200%',
                                                    height: '200%',
                                                    background:
                                                        'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)',
                                                    zIndex: 2,
                                                    pointerEvents: 'none',
                                                    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                                                }}
                                                className="mood-light"
                                            />
                                            <div
                                                className="glass-info"
                                                style={{
                                                    position: 'relative',
                                                    zIndex: 3,
                                                    margin: '0.75rem',
                                                    padding: '1.25rem 1rem',
                                                    borderRadius: '16px',
                                                    background: 'rgba(24, 23, 21, 0.25)',
                                                    backdropFilter: 'blur(20px)',
                                                    WebkitBackdropFilter: 'blur(20px)',
                                                    border: '1px solid rgba(232, 209, 167, 0.12)',
                                                    boxShadow:
                                                        'inset 0 1px 1px rgba(232, 209, 167, 0.08), 0 8px 24px rgba(0,0,0,0.5)',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        fontFamily: 'var(--font-display)',
                                                        fontSize: '1.6rem',
                                                        color: 'var(--text)',
                                                        marginBottom: '0.3rem',
                                                    }}
                                                    className="mood-title"
                                                >
                                                    {mood.emoji ? `${mood.emoji} ` : ''}
                                                    {mood.title}
                                                </h3>
                                                <p
                                                    style={{
                                                        fontFamily: 'var(--font-body)',
                                                        fontSize: '0.95rem',
                                                        fontStyle: 'italic',
                                                        color: 'var(--text2)',
                                                    }}
                                                    className="mood-subtitle"
                                                >
                                                    “{mood.subtitle}”
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .mood-card:hover {
                    transform: translateY(-10px);
                    border-color: rgba(213, 180, 106, 0.35) !important;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px var(--glow-color);
                }
                .mood-card:hover .mood-bg {
                    transform: scale(1.12);
                }
                .mood-card:hover .mood-overlay {
                    background: linear-gradient(
                        to bottom,
                        rgba(24, 23, 21, 0) 0%,
                        rgba(24, 23, 21, 0.3) 50%,
                        rgba(24, 23, 21, 0.95) 100%
                    ) !important;
                }
                .mood-card:hover .mood-light {
                    transform: translate(12%, 12%);
                }
                .mood-card:hover .glass-info {
                    background: rgba(24, 23, 21, 0.45) !important;
                    border-color: rgba(213, 180, 106, 0.25) !important;
                }
                .mood-card:hover .mood-title {
                    transform: translateY(-2px);
                    color: var(--gold) !important;
                }
                .mood-card:hover .mood-subtitle {
                    color: var(--text) !important;
                }
            `}</style>
        </>
    );
}
