'use client';

import './globals.css';
import { MusicProvider } from '@/lib/musicProvider';
import { Navigation } from '@/components/Navigation';
import { MusicPlayer } from '@/components/music/MusicPlayer';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { CustomCursor } from '@/components/CustomCursor';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');

    // Load custom style settings or other adjustments on dynamic path events
    useEffect(() => {
        // Scroll restoration
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <html lang="en">
            <head>
                <title>For Her — Lisa's Sanctuary</title>
                <meta name="description" content="A beautiful digital sanctuary for the prettiest girl Lisa." />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </head>
            <body>
                {!isAdminPage && <CustomCursor />}
                {!isAdminPage && <div className="grain-overlay" />}
                {!isAdminPage && <div className="ambient-glow" />}
                {!isAdminPage && <div className="ambient-glow-2" />}
                <MusicProvider>
                    <div className="flex flex-col min-h-screen">
                        {!isAdminPage && <Navigation />}
                        <main className={!isAdminPage ? 'page-wrapper-player' : ''}>
                            {children}
                        </main>
                        {!isAdminPage && <MusicPlayer />}
                    </div>
                </MusicProvider>
            </body>
        </html>
    );
}
