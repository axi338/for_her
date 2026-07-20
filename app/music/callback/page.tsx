'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForTokens, getReturnToPath } from '@/lib/services/spotify/auth';
import { useMusic } from '@/lib/musicContext';

function CallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshAuthState } = useMusic();
    const [status, setStatus] = useState('Connecting to Spotify…');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            const err = searchParams.get('error');
            if (err) {
                setError(err);
                setStatus('Connection failed');
                return;
            }

            const code = searchParams.get('code');
            const state = searchParams.get('state');
            if (!code || !state) {
                setError('Missing authorization code');
                setStatus('Connection failed');
                return;
            }

            try {
                await exchangeCodeForTokens(code, state);
                await refreshAuthState();
                setStatus('Connected. Redirecting…');
                const returnTo = getReturnToPath();
                setTimeout(() => router.replace(returnTo), 600);
            } catch (e: any) {
                console.error(e);
                setError(e?.message || 'Token exchange failed');
                setStatus('Connection failed');
            }
        };

        run();
    }, [searchParams, router, refreshAuthState]);

    return (
        <div
            style={{
                textAlign: 'center',
                padding: '2.5rem',
                borderRadius: '24px',
                background: 'rgba(24,23,21,0.5)',
                border: '1px solid rgba(213,180,106,0.2)',
                maxWidth: '400px',
            }}
        >
            <p
                style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    color: 'var(--text)',
                    marginBottom: error ? '1rem' : 0,
                }}
            >
                {status}
            </p>
            {error && (
                <>
                    <p style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        {error}
                    </p>
                    <button className="btn btn-gold" onClick={() => router.replace('/music')}>
                        Back to Music
                    </button>
                </>
            )}
        </div>
    );
}

export default function SpotifyCallbackPage() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(ellipse at center, #1b1613 0%, #0f0e0d 100%)',
                padding: '2rem',
            }}
        >
            <Suspense
                fallback={
                    <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                        Connecting…
                    </p>
                }
            >
                <CallbackInner />
            </Suspense>
        </div>
    );
}
