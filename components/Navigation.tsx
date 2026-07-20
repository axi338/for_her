'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Navigation() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                zIndex: 10000,
                display: 'flex',
                justifyContent: 'center',
                padding: isScrolled ? '0.75rem 1rem' : '1.5rem 1.5rem',
                pointerEvents: 'none',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            <nav
                className="liquid-glass"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: isScrolled ? '600px' : '900px',
                    height: isScrolled ? '48px' : '58px',
                    padding: '0 2rem',
                    borderRadius: '99px',
                    background: isScrolled ? 'rgba(24, 23, 21, 0.18)' : 'rgba(24, 23, 21, 0.12)',
                    backdropFilter: isScrolled ? 'blur(40px)' : 'blur(24px)',
                    WebkitBackdropFilter: isScrolled ? 'blur(40px)' : 'blur(24px)',
                    border: '1.5px solid rgba(213, 180, 106, 0.18)',
                    boxShadow: isScrolled
                        ? '0 10px 30px rgba(0,0,0,0.6), inset 0 1px 2px rgba(232, 209, 167, 0.15)'
                        : '0 8px 20px rgba(0,0,0,0.4), inset 0 1px 1px rgba(232, 209, 167, 0.1)',
                    pointerEvents: 'auto',
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                <Link href="/" className="nav-logo" style={{ fontSize: isScrolled ? '1.4rem' : '1.6rem', transition: 'font-size 0.5s' }}>
                    y<span>❀</span>u
                </Link>
                <div className="nav-links" style={{ gap: isScrolled ? '1.2rem' : '2rem', transition: 'gap 0.5s' }}>
                    <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                        You
                    </Link>
                    <Link href="/music" className={`nav-link ${pathname.startsWith('/music') ? 'active' : ''}`}>
                        Music
                    </Link>
                    <Link href="/notes" className={`nav-link ${pathname === '/notes' ? 'active' : ''}`}>
                        Peace
                    </Link>
                    <Link href="/#lilies" className="nav-link">
                        Lilies
                    </Link>
                    <Link href="/#memories" className="nav-link">
                        Memories
                    </Link>
                </div>
            </nav>
        </div>
    );
}
