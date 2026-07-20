'use client';

import React, { useState, useEffect } from 'react';
import { OpeningIntro } from '@/components/home/OpeningIntro';
import { PetalCanvas } from '@/components/home/PetalCanvas';
import { FloatingWords } from '@/components/home/FloatingWords';
import { MoodSwitcher, HomeMoodKey, MOODS } from '@/components/home/MoodSwitcher';
import { LilyGallery } from '@/components/home/LilyGallery';
import { MemoryCards } from '@/components/home/MemoryCards';
import { MessageWidget } from '@/components/home/MessageWidget';
import Link from 'next/link';

export default function HomePage() {
    const [introCompleted, setIntroCompleted] = useState(false);
    const [activeMood, setActiveMood] = useState<HomeMoodKey>('spring');
    const [greeting, setGreeting] = useState('Good morning cutie');

    // Load greeting based on current hour
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 12 && hour < 18) {
            setGreeting('Good afternoon cutie');
        } else if (hour >= 18 || hour < 5) {
            setGreeting('Good night cutie');
        } else {
            setGreeting('Good morning cutie');
        }
    }, []);

    // Submit visit tracking
    useEffect(() => {
        if (!introCompleted) return;

        const trackVisit = async () => {
            try {
                let visitor = { id: '', visitCount: 0, firstSeen: '' };
                const storageKey = 'lisa_visit_tracker';

                try {
                    const raw = localStorage.getItem(storageKey);
                    if (raw) visitor = JSON.parse(raw);
                } catch (e) { }

                const now = new Date().toISOString();
                if (!visitor.id) {
                    visitor.id = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
                    visitor.firstSeen = now;
                }
                visitor.visitCount += 1;

                try {
                    localStorage.setItem(storageKey, JSON.stringify(visitor));
                } catch (e) { }

                const payload = {
                    visitor_id: visitor.id,
                    visit_count: visitor.visitCount,
                    first_seen: visitor.firstSeen,
                    path: '/',
                    page_title: document.title,
                    referrer: document.referrer || 'direct',
                    language: navigator.language || 'unknown',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
                    screen: `${window.screen.width}x${window.screen.height}`,
                    user_agent: navigator.userAgent
                };

                await fetch('/api/visits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } catch (e) {
                console.warn('Track visit failed (best effort)', e);
            }
        };

        trackVisit();
    }, [introCompleted]);

    // Adjust theme variables based on selected mood
    useEffect(() => {
        const moodConf = MOODS[activeMood];
        if (!moodConf) return;

        document.documentElement.style.setProperty('--cream', moodConf.cream);
        document.documentElement.style.setProperty('--deep-red', moodConf.deepRed);
        document.documentElement.style.setProperty('--btn', moodConf.deepRed);
    }, [activeMood]);

    const handleReplayIntro = () => {
        setIntroCompleted(false);
    };

    return (
        <>
            {/* Intro Typewriter animation */}
            {!introCompleted && (
                <OpeningIntro onComplete={() => setIntroCompleted(true)} />
            )}

            {/* Main Home Page Content */}
            <div style={{ position: 'relative', minHeight: '100vh', opacity: introCompleted ? 1 : 0, transition: 'opacity 0.8s ease' }}>
                {/* Falling Petals */}
                <PetalCanvas />

                {/* Ambient Video Background */}
                <div className="video-bg-container">
                    <video
                        key={activeMood} // Force re-render to reload video source
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ opacity: 0.5 }}
                    >
                        <source src={MOODS[activeMood].video} type="video/mp4" />
                    </video>
                    <div className="video-overlay" />
                </div>

                {/* Floating Thoughts */}
                <FloatingWords />

                {/* Mood seasonal selector switcher */}
                <MoodSwitcher activeMood={activeMood} onMoodChange={setActiveMood} />

                {/* Custom page-wrap container */}
                <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>

                    {/* Main Greeting Section */}
                    <section
                        id="home"
                        className="view"
                        style={{
                            paddingTop: '20vh',
                            minHeight: '80vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}
                    >


                        {/* Cozy Paper greeting card */}
                        <div
                            className="paper-card main-card glass-light"
                            style={{
                                maxWidth: '650px',
                                padding: '3rem',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid rgba(213,180,106,0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.2rem',
                                textAlign: 'center',
                                boxShadow: 'var(--shadow-card)',
                                animation: 'fadeInUp 1s ease'
                            }}
                        >
                            <h2
                                id="time-greeting"
                                style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                    color: 'var(--gold)',
                                    fontWeight: 300,
                                    letterSpacing: '0.02em'
                                }}
                            >
                                {greeting}
                            </h2>
                            <p
                                style={{
                                    fontFamily: 'var(--font-ui)',
                                    fontSize: '0.85rem',
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    color: 'var(--text3)',
                                    fontWeight: 600
                                }}
                            >
                                Yeah I miss you
                            </p>

                            <div style={{ margin: '1rem auto 0.5rem', width: '60px', height: '1px', background: 'rgba(213,180,106,0.2)' }} />

                            <p
                                style={{
                                    fontStyle: 'italic',
                                    fontSize: '1.25rem',
                                    color: 'var(--text)',
                                    lineHeight: '1.6',
                                    fontFamily: 'var(--font-body)'
                                }}
                            >
                                “Indeed, you have a blessed voice.”
                            </p>
                        </div>
                    </section>

                    {/* Swipeable Lilies Gallery */}
                    <LilyGallery />

                    {/* Grid Reasons why */}
                    <MemoryCards />

                    {/* Final Section */}
                    <section id="final-section" className="view" style={{ margin: '6rem 0 2rem', textAlign: 'center' }}>
                        <div
                            className="final-card glass-light"
                            style={{
                                maxWidth: '600px',
                                margin: '0 auto',
                                padding: '3rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid rgba(213,180,106,0.15)',
                                boxShadow: 'var(--shadow-card)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem',
                                alignItems: 'center'
                            }}
                        >
                            <p style={{ fontStyle: 'italic', fontSize: '1.3rem', color: 'var(--text)' }}>
                                “This website is small, but the feeling behind it is not.”
                            </p>
                            <h3 className="lisa-tribute" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold)' }}>
                                For the Prettiest girl Lisa
                            </h3>
                            <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginTop: '-0.8rem' }}>
                                i know you liked it
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={handleReplayIntro} className="btn btn-ghost">
                                    Replay the magic
                                </button>
                                <Link href="/admin/music" className="btn btn-primary">
                                    Manage World
                                </Link>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Message Widget */}
                <MessageWidget />
            </div>

            <style jsx global>{`
        .background-lily {
          transition: transform 0.5s ease;
        }
        .lily-left {
          left: -40px !important;
        }
        .lily-right {
          right: -40px !important;
        }
        @media (max-width: 1024px) {
          .background-lily { display: none; }
        }
      `}</style>
        </>
    );
}
