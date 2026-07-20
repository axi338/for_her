'use client';

const MEMORIES = [
    { title: "Reason 01", text: "The way you listen with your whole heart.", bg: "/photos_to_use/photo_bg1.jpg" },
    { title: "Reason 02", text: "Your kindness to everyone you meet.", bg: "/photos_to_use/photo_bg2.jpg" },
    { title: "Reason 03", text: "The soft light you bring into every room.", bg: "/photos_to_use/photo_5.webp" },
    { title: "Reason 04", text: "How you make even the smallest moments magical.", bg: "/photos_to_use/photo_6.webp" },
    { title: "Reason 05", text: "Because your soul is as beautiful as a garden.", bg: "/photos_to_use/photo_7.webp" },
    { title: "Reason 06", text: "You are simply unforgettable.", bg: "/photos_to_use/photo_star.webp" }
];

export function MemoryCards() {
    return (
        <section id="memories" className="view" style={{ margin: '5rem 0' }}>
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '2.5rem', color: 'var(--gold)' }}>
                Reasons Why
            </h2>
            <div
                className="memory-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2.0rem',
                    padding: '0 1rem'
                }}
            >
                {MEMORIES.map((m, idx) => (
                    <div
                        key={idx}
                        className="memory-card card"
                        style={{
                            position: 'relative',
                            height: '240px',
                            borderRadius: 'var(--radius)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-card)',
                            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                        }}
                    >
                        {/* Background cover image */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${m.bg})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                transition: 'transform 0.6s ease',
                                zIndex: 0
                            }}
                            className="card-bg"
                        />
                        {/* Dark glass overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to bottom, rgba(43,33,27,0.3) 0%, rgba(24,23,21,0.85) 100%)',
                                zIndex: 1,
                                transition: 'background 0.4s ease'
                            }}
                            className="card-overlay"
                        />

                        {/* Content info */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '1.5rem',
                                zIndex: 2
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--font-ui)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: 'var(--gold)',
                                    display: 'block',
                                    marginBottom: '0.4rem'
                                }}
                            >
                                {m.title}
                            </span>
                            <p
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '1.25rem',
                                    color: 'var(--text)',
                                    lineHeight: '1.4',
                                    fontWeight: 400
                                }}
                            >
                                {m.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx global>{`
        .memory-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 40px rgba(0,0,0,0.6), 0 0 25px rgba(213,180,106,0.15);
          border-color: rgba(213,180,106,0.4) !important;
        }
        .memory-card:hover .card-bg {
          transform: scale(1.08);
        }
        .memory-card:hover .card-overlay {
          background: linear-gradient(to bottom, rgba(24,23,21,0.2) 0%, rgba(24,23,21,0.95) 100%);
        }
      `}</style>
        </section>
    );
}
