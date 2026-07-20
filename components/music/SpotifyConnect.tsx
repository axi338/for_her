'use client';

import React from 'react';
import { useMusic } from '@/lib/musicContext';
import { isSpotifyConfigured } from '@/lib/services/spotify/auth';

interface Props {
    onSkip?: () => void;
}

export function SpotifyConnect({ onSkip }: Props) {
    const { connectSpotify, isSpotifyConnected } = useMusic();
    const configured = isSpotifyConfigured();

    if (isSpotifyConnected) return null;

    return (
        <div
            style={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                zIndex: 2,
            }}
        >
            <div
                style={{
                    maxWidth: '440px',
                    width: '100%',
                    textAlign: 'center',
                    padding: '3rem 2.5rem',
                    borderRadius: '28px',
                    background: 'rgba(24, 23, 21, 0.45)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    border: '1.5px solid rgba(213, 180, 106, 0.22)',
                    boxShadow:
                        '0 30px 80px rgba(0,0,0,0.55), inset 0 1px 1px rgba(232, 209, 167, 0.1)',
                    animation: 'fadeInUp 0.8s ease',
                }}
            >
                <div
                    style={{
                        width: '72px',
                        height: '72px',
                        margin: '0 auto 1.5rem',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, #1DB954, #0d5c2e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 40px rgba(29, 185, 84, 0.35)',
                        fontSize: '2rem',
                    }}
                >
                    ♫
                </div>

                <h2
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                        color: 'var(--text)',
                        marginBottom: '0.75rem',
                        fontWeight: 400,
                    }}
                >
                    Connect your Spotify
                </h2>
                <p
                    style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '1.05rem',
                        color: 'var(--text2)',
                        lineHeight: 1.6,
                        marginBottom: '2rem',
                        fontStyle: 'italic',
                    }}
                >
                    Stream curated moods through our gallery. Your Premium account powers playback —
                    every visual stays ours.
                </p>

                {!configured && (
                    <p
                        style={{
                            color: '#f87171',
                            fontSize: '0.85rem',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-ui)',
                        }}
                    >
                        Add NEXT_PUBLIC_SPOTIFY_CLIENT_ID to your environment.
                    </p>
                )}

                <button
                    onClick={() => connectSpotify()}
                    disabled={!configured}
                    className="spotify-glass-btn"
                    style={{
                        width: '100%',
                        padding: '1.1rem 1.5rem',
                        borderRadius: '999px',
                        border: '1.5px solid rgba(29, 185, 84, 0.45)',
                        background:
                            'linear-gradient(135deg, rgba(29,185,84,0.25), rgba(29,185,84,0.08))',
                        backdropFilter: 'blur(12px)',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        cursor: configured ? 'pointer' : 'not-allowed',
                        opacity: configured ? 1 : 0.5,
                        boxShadow: '0 8px 32px rgba(29, 185, 84, 0.2)',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    }}
                >
                    Connect Spotify
                </button>

                {onSkip && (
                    <button
                        onClick={onSkip}
                        style={{
                            marginTop: '1.25rem',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text3)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                        }}
                    >
                        Browse moods without connecting
                    </button>
                )}

                <style jsx>{`
                    .spotify-glass-btn:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 12px 40px rgba(29, 185, 84, 0.35);
                    }
                `}</style>
            </div>
        </div>
    );
}
