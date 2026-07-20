'use client';

import React, { useRef, useState, useEffect } from 'react';

const LILY_GALLERY = [
    { src: "/photos_to_use/photo_5.webp", text: "I know you like to write rather than talk about your feelings" },
    { src: "/photos_to_use/photo_6.webp", text: "Every time it rains it gives a different feeling." },
    { src: "/photos_to_use/photo_7.webp", text: "Fairuz's voice is the sound of home." },
    { src: "/photos_to_use/photo_star.webp", text: "eyes like stars" },
    { src: "/photos_to_use/photo_youtube.webp", text: "I could listen to your voice forever." },
    { src: "/photos_to_use/photo_icon.webp", text: "Every word you say sounds like a melody." }
];

export function LilyGallery() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    const scrollLeft = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Keyboard handlers for gallery slide
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowLeft') {
                setLightboxIndex((prev) => (prev !== null ? (prev - 1 + LILY_GALLERY.length) % LILY_GALLERY.length : null));
            }
            if (e.key === 'ArrowRight') {
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % LILY_GALLERY.length : null));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex]);

    return (
        <section id="lilies" className="view" style={{ margin: '5rem 0' }}>
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '2.5rem', color: 'var(--gold)' }}>
                Garden of Lilies
            </h2>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button
                    onClick={scrollLeft}
                    style={{
                        position: 'absolute',
                        left: 0,
                        zIndex: 10,
                        background: 'rgba(24,23,21,0.7)',
                        border: '1px solid rgba(213,180,106,0.2)',
                        color: 'var(--gold)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        cursor: 'pointer'
                    }}
                >
                    &larr;
                </button>

                <div
                    ref={containerRef}
                    className="swipeable-gallery"
                    style={{
                        display: 'flex',
                        gap: '1.5rem',
                        overflowX: 'auto',
                        padding: '1rem 2.5rem',
                        scrollSnapType: 'x mandatory',
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none' // IE/Edge
                    }}
                >
                    {LILY_GALLERY.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => setLightboxIndex(idx)}
                            className="gallery-card"
                            style={{
                                flex: '0 0 280px',
                                scrollSnapAlign: 'start',
                                background: 'var(--card)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid rgba(213,180,106,0.1)',
                                padding: '0.75rem',
                                boxShadow: 'var(--shadow-card)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ overflow: 'hidden', borderRadius: 'calc(var(--radius) - 4px)', height: '350px', position: 'relative' }}>
                                <img
                                    src={item.src}
                                    alt={`Lily ${idx + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.5s ease',
                                    }}
                                    className="gallery-img"
                                />
                            </div>
                            <p
                                style={{
                                    marginTop: '0.8rem',
                                    fontSize: '0.95rem',
                                    fontFamily: 'var(--font-body)',
                                    color: 'var(--text2)',
                                    textAlign: 'center',
                                    fontStyle: 'italic',
                                    padding: '0 0.5rem'
                                }}
                            >
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={scrollRight}
                    style={{
                        position: 'absolute',
                        right: 0,
                        zIndex: 10,
                        background: 'rgba(24,23,21,0.7)',
                        border: '1px solid rgba(213,180,106,0.2)',
                        color: 'var(--gold)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        cursor: 'pointer'
                    }}
                >
                    &rarr;
                </button>
            </div>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && (
                <div
                    onClick={() => setLightboxIndex(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 999999,
                        background: 'rgba(15, 14, 13, 0.94)',
                        backdropFilter: 'blur(15px)',
                        WebkitBackdropFilter: 'blur(15px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setLightboxIndex(null)}
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            right: '2rem',
                            fontSize: '2rem',
                            color: 'var(--text)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            zIndex: 1010,
                            transition: 'color 0.2s'
                        }}
                        className="close-hover-btn"
                    >
                        ✕
                    </button>

                    {/* Left navigation */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev !== null ? (prev - 1 + LILY_GALLERY.length) % LILY_GALLERY.length : null));
                        }}
                        style={{
                            position: 'absolute',
                            left: '2.5rem',
                            fontSize: '2rem',
                            color: 'var(--text)',
                            background: 'rgba(24, 23, 21, 0.4)',
                            border: '1px solid rgba(213, 180, 106, 0.2)',
                            borderRadius: '50%',
                            width: '56px',
                            height: '56px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1010,
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)'
                        }}
                        className="arrow-hover-btn"
                    >
                        ←
                    </button>

                    {/* Image and Caption panel */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '85%',
                            maxHeight: '78vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                        }}
                    >
                        <img
                            src={LILY_GALLERY[lightboxIndex].src}
                            alt="Expanded Lily"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '70vh',
                                objectFit: 'contain',
                                borderRadius: '16px',
                                boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(213,180,106,0.3)',
                                outline: '1px solid rgba(213, 180, 106, 0.15)',
                                outlineOffset: '4px'
                            }}
                        />
                        <p
                            style={{
                                marginTop: '1.750rem',
                                color: 'var(--gold)',
                                fontSize: '1.2rem',
                                fontFamily: 'var(--font-body)',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                                maxWidth: '650px',
                                lineHeight: '1.6',
                                letterSpacing: '0.01em'
                            }}
                        >
                            {LILY_GALLERY[lightboxIndex].text}
                        </p>
                    </div>

                    {/* Right navigation */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex((prev) => (prev !== null ? (prev + 1) % LILY_GALLERY.length : null));
                        }}
                        style={{
                            position: 'absolute',
                            right: '2.5rem',
                            fontSize: '2rem',
                            color: 'var(--text)',
                            background: 'rgba(24, 23, 21, 0.4)',
                            border: '1px solid rgba(213, 180, 106, 0.2)',
                            borderRadius: '50%',
                            width: '56px',
                            height: '56px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1010,
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)'
                        }}
                        className="arrow-hover-btn"
                    >
                        →
                    </button>
                </div>
            )}

            <div className="swipe-hint" style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text3)', fontSize: '0.85rem' }}>
                Swipe or use buttons to explore <span>&rarr;</span>
            </div>

            <style jsx global>{`
        .swipeable-gallery::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        .gallery-card:hover {
          transform: translateY(-5px);
          border-color: rgba(213,180,106,0.3) !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(213,180,106,0.1);
        }
        .gallery-card:hover .gallery-img {
          transform: scale(1.04);
        }
        
        /* Lightbox animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .close-hover-btn:hover {
          color: var(--gold) !important;
          transform: rotate(90deg) scale(1.15);
        }
        .arrow-hover-btn:hover {
          border-color: rgba(213, 180, 106, 0.55) !important;
          color: var(--gold) !important;
          background: rgba(24, 23, 21, 0.75) !important;
          box-shadow: 0 0 15px rgba(213, 180, 106, 0.25);
          transform: scale(1.06);
        }
        .arrow-hover-btn:active {
          transform: scale(0.96);
        }
      `}</style>
        </section>
    );
}
