'use client';

import { useState, useEffect, useRef } from 'react';

interface OpeningIntroProps {
    onComplete: () => void;
}

export function OpeningIntro({ onComplete }: OpeningIntroProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    useEffect(() => {
        // Fallback: If video fails or takes too long to load, show button anyway
        const fallbackTimer = setTimeout(() => {
            setVideoLoaded(true);
        }, 10000);

        return () => clearTimeout(fallbackTimer);
    }, []);

    const handleOpen = () => {
        setIsFadingOut(true);
        setTimeout(() => {
            onComplete();
        }, 800);
    };

    return (
        <section
            id="opening-screen"
            className={isFadingOut ? 'fade-out' : 'active'}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#0f0e0d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                transition: 'opacity 0.8s ease, visibility 0.8s',
                overflow: 'hidden'
            }}
        >
            <video
                ref={videoRef}
                src="/opening_intro.mp4"
                autoPlay
                muted
                loop
                playsInline
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

            {/* Premium dark vignette overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(24, 23, 21, 0.05) 0%, rgba(15, 14, 13, 0.45) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}
            />

            <div
                className="intro-content"
                style={{
                    textAlign: 'center',
                    maxWidth: '600px',
                    padding: '2rem',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <button
                    id="open-world-btn"
                    onClick={handleOpen}
                    style={{
                        background: 'rgba(24, 23, 21, 0.35)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1.5px solid rgba(213, 180, 106, 0.22)',
                        color: 'var(--text)',
                        borderRadius: '30px',
                        padding: '0.75rem 2.25rem',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-ui)',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255,255,255,0.06)',
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        fontWeight: 600
                    }}
                    className="open-btn-glass"
                >
                    Open your little world
                </button>
            </div>

            <style jsx>{`
                .fade-out {
                    opacity: 0;
                    visibility: hidden;
                }
                .open-btn-glass:hover {
                    transform: translateY(-2px) scale(1.04);
                    border-color: rgba(213, 180, 106, 0.55);
                    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.75), 0 0 20px rgba(213, 180, 106, 0.25), inset 0 1px 1px rgba(255,255,255,0.1);
                    color: var(--gold);
                }
                .open-btn-glass:active {
                    transform: translateY(0) scale(0.97);
                }
            `}</style>
        </section>
    );
}
