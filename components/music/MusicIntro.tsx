'use client';

import React, { useState, useEffect, useRef } from 'react';

interface MusicIntroProps {
    onComplete: () => void;
}

export function MusicIntro({ onComplete }: MusicIntroProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [videoLoaded, setVideoLoaded] = useState(false);

    useEffect(() => {
        // Fallback: If video fails or takes too long to load, auto-complete after 12 seconds
        const fallbackTimer = setTimeout(() => {
            if (!videoLoaded) {
                onComplete();
            }
        }, 12000);

        return () => clearTimeout(fallbackTimer);
    }, [videoLoaded, onComplete]);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: '#0f0e0d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <video
                ref={videoRef}
                src="/opening_intro.mp4"
                autoPlay
                muted
                playsInline
                onEnded={onComplete}
                onCanPlay={() => setVideoLoaded(true)}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0
                }}
            />

            {/* Subtle overlay to blend video colors and add premium dark vignette */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(24, 23, 21, 0.05) 0%, rgba(15, 14, 13, 0.45) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}
            />

            {/* Interactive container to allow screen tap skip */}
            <div
                onClick={onComplete}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingBottom: '4.5rem',
                    cursor: 'pointer'
                }}
            >
                {/* Floating pill skip button with liquid glass styling */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onComplete();
                    }}
                    style={{
                        background: 'rgba(24, 23, 21, 0.35)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1.5px solid rgba(213, 180, 106, 0.22)',
                        color: 'var(--text)',
                        borderRadius: '30px',
                        padding: '0.65rem 2rem',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-ui)',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255,255,255,0.06)',
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className="skip-btn"
                >
                    Enter Sanctuary
                </button>
            </div>

            <style jsx>{`
                .skip-btn:hover {
                    transform: translateY(-2px) scale(1.04);
                    border-color: rgba(213, 180, 106, 0.55);
                    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.75), 0 0 20px rgba(213, 180, 106, 0.25), inset 0 1px 1px rgba(255,255,255,0.1);
                    color: var(--gold);
                }
                .skip-btn:active {
                    transform: translateY(0) scale(0.97);
                }
            `}</style>
        </div>
    );
}
