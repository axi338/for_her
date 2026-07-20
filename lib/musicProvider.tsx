'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MusicContext, Song, RepeatMode } from './musicContext';
import { getSpotifyProvider } from '@/lib/providers/music/SpotifyProvider';
import type { PremiumStatus } from '@/lib/providers/music/types';
import {
    loadFavorites,
    saveFavorites,
    loadRecentlyPlayed,
    saveRecentlyPlayed,
    loadVolume,
    saveVolume,
} from '@/lib/services/storage/musicStorage';
import { beginSpotifyLogin, getTokens, logoutSpotify } from '@/lib/services/spotify/auth';

export function MusicProvider({ children }: { children: React.ReactNode }) {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
    const [isShuffle, setIsShuffle] = useState(false);
    const [queue, setQueue] = useState<Song[]>([]);
    const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
    const [history, setHistory] = useState<Song[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
    const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
    const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>('unknown');
    const [playerReady, setPlayerReady] = useState(false);
    const [playerError, setPlayerError] = useState<string | null>(null);
    const [needsReconnect, setNeedsReconnect] = useState(false);

    const queueRef = useRef<Song[]>([]);
    const currentSongRef = useRef<Song | null>(null);
    const repeatModeRef = useRef<RepeatMode>('off');
    const endedGuardRef = useRef(false);
    const provider = getSpotifyProvider();

    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);
    useEffect(() => {
        currentSongRef.current = currentSong;
        endedGuardRef.current = false;
    }, [currentSong]);
    useEffect(() => {
        repeatModeRef.current = repeatMode;
    }, [repeatMode]);

    const refreshAuthState = useCallback(async () => {
        const connected = Boolean(getTokens()?.accessToken);
        setIsSpotifyConnected(connected);
        setNeedsReconnect(false);

        if (!connected) {
            setPremiumStatus('unknown');
            setPlayerReady(false);
            return;
        }

        try {
            const status = await provider.getPremiumStatus();
            setPremiumStatus(status);
            if (status === 'premium') {
                const ready = await provider.ensureReady();
                setPlayerReady(ready);
            } else {
                setPlayerReady(false);
            }
        } catch {
            setNeedsReconnect(true);
            setPlayerReady(false);
        }
    }, [provider]);

    const playSongInternalRef = useRef<(song: Song, customQueue?: Song[]) => Promise<void>>(async () => {});

    const advanceAfterEnd = useCallback(() => {
        if (endedGuardRef.current) return;
        endedGuardRef.current = true;

        const mode = repeatModeRef.current;
        const q = queueRef.current;
        const cur = currentSongRef.current;

        if (mode === 'one' && cur) {
            provider.seek(0).then(() => provider.resume()).catch(() => {});
            endedGuardRef.current = false;
            return;
        }

        const idx = q.findIndex((s) => s.id === cur?.id);
        if (idx >= 0 && idx < q.length - 1) {
            playSongInternalRef.current(q[idx + 1], q);
        } else if (mode === 'all' && q.length > 0) {
            playSongInternalRef.current(q[0], q);
        } else {
            setIsPlaying(false);
        }
    }, [provider]);

    useEffect(() => {
        try {
            setFavorites(loadFavorites());
            setRecentlyPlayed(loadRecentlyPlayed());
            const v = loadVolume();
            setVolume(v);
        } catch (e) {
            console.error(e);
        }

        refreshAuthState();

        const unsub = provider.onStateChange((state) => {
            setIsPlaying(state.isPlaying);
            setCurrentTime(state.positionMs / 1000);
            setDuration(state.durationMs / 1000);

            if (
                !state.isPlaying &&
                state.durationMs > 0 &&
                state.positionMs >= state.durationMs - 500
            ) {
                advanceAfterEnd();
            }
        });

        return () => {
            unsub();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const playSongInternal = async (song: Song, customQueue?: Song[]) => {
        if (song.unavailable) {
            setPlayerError('This track is unavailable.');
            return;
        }

        if (!provider.isConnected()) {
            setNeedsReconnect(true);
            setPlayerError('Connect Spotify to play music.');
            return;
        }

        if (premiumStatus === 'free') {
            setPlayerError('PREMIUM_REQUIRED');
            setCurrentSong(song);
            return;
        }

        setCurrentSong(song);
        setPlayerError(null);

        if (customQueue && customQueue.length > 0) {
            const playable = customQueue.filter((s) => !s.unavailable);
            setQueue(playable);
            setOriginalQueue(playable);
            queueRef.current = playable;
        } else if (queueRef.current.findIndex((s) => s.id === song.id) === -1) {
            const newQueue = [...queueRef.current, song];
            setQueue(newQueue);
            setOriginalQueue(newQueue);
            queueRef.current = newQueue;
        }

        setRecentlyPlayed((prev) => {
            const filtered = prev.filter((s) => s.id !== song.id);
            const updated = [song, ...filtered].slice(0, 20);
            saveRecentlyPlayed(updated);
            return updated;
        });
        setHistory((prev) => [...prev, song]);

        try {
            await provider.play(song.id);
            setIsPlaying(true);
            setPlayerReady(true);
            if (song.durationMs) setDuration(song.durationMs / 1000);
        } catch (err: any) {
            const msg = String(err?.message || err);
            if (msg.includes('PREMIUM_REQUIRED') || msg.includes('403')) {
                setPlayerError('PREMIUM_REQUIRED');
                setPremiumStatus('free');
            } else if (msg.includes('TOKEN_EXPIRED') || msg.includes('401')) {
                setNeedsReconnect(true);
                setPlayerError('Your Spotify session expired. Please reconnect.');
                logoutSpotify();
                setIsSpotifyConnected(false);
            } else if (msg.includes('PLAYER_NOT_READY')) {
                setPlayerError('Player is still connecting. Try again in a moment.');
            } else {
                setPlayerError(msg || 'Playback failed.');
            }
            setIsPlaying(false);
        }
    };

    playSongInternalRef.current = playSongInternal;

    const playSong = (song: Song, customQueue?: Song[]) => {
        playSongInternal(song, customQueue);
    };

    const pauseSong = () => {
        provider.pause().catch(() => {});
        setIsPlaying(false);
    };

    const resumeSong = () => {
        if (!currentSong) return;
        if (premiumStatus === 'free') {
            setPlayerError('PREMIUM_REQUIRED');
            return;
        }
        provider.resume().catch(async () => {
            await playSongInternal(currentSong);
        });
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (isPlaying) pauseSong();
        else resumeSong();
    };

    const nextSong = () => {
        const q = queueRef.current;
        const cur = currentSongRef.current;
        const idx = q.findIndex((s) => s.id === cur?.id);
        if (idx >= 0 && idx < q.length - 1) {
            playSongInternal(q[idx + 1], q);
        } else if (repeatModeRef.current === 'all' && q.length > 0) {
            playSongInternal(q[0], q);
        }
    };

    const prevSong = () => {
        if (currentTime > 3) {
            provider.seek(0).catch(() => {});
            setCurrentTime(0);
            return;
        }
        const q = queueRef.current;
        const cur = currentSongRef.current;
        const idx = q.findIndex((s) => s.id === cur?.id);
        if (idx > 0) {
            playSongInternal(q[idx - 1], q);
        } else if (repeatModeRef.current === 'all' && q.length > 0) {
            playSongInternal(q[q.length - 1], q);
        } else {
            provider.seek(0).catch(() => {});
            setCurrentTime(0);
        }
    };

    const seek = (time: number) => {
        provider.seek(time * 1000).catch(() => {});
        setCurrentTime(time);
    };

    const changeVolume = (vol: number) => {
        const safeVol = Math.max(0, Math.min(1, vol));
        setVolume(safeVol);
        saveVolume(safeVol);
        if (!isMuted) {
            provider.setVolume(safeVol).catch(() => {});
        }
    };

    const toggleMute = () => {
        const nextMute = !isMuted;
        setIsMuted(nextMute);
        provider.setVolume(nextMute ? 0 : volume).catch(() => {});
    };

    const toggleRepeat = () => {
        setRepeatMode((prev) => {
            const next: RepeatMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
            provider.setRepeat(next).catch(() => {});
            return next;
        });
    };

    const toggleShuffle = () => {
        setIsShuffle((prev) => {
            const nextShuffle = !prev;
            provider.setShuffle(nextShuffle).catch(() => {});
            if (nextShuffle) {
                if (currentSong) {
                    const filtered = queue.filter((s) => s.id !== currentSong.id);
                    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
                    setQueue([currentSong, ...shuffled]);
                } else {
                    setQueue([...queue].sort(() => Math.random() - 0.5));
                }
            } else {
                setQueue(originalQueue);
            }
            return nextShuffle;
        });
    };

    const toggleFavorite = (songId: string) => {
        setFavorites((prev) => {
            const nextFavs = prev.includes(songId)
                ? prev.filter((id) => id !== songId)
                : [...prev, songId];
            saveFavorites(nextFavs);
            return nextFavs;
        });
    };

    const addToQueue = (song: Song) => {
        if (queue.some((s) => s.id === song.id)) return;
        setQueue((prev) => [...prev, song]);
        setOriginalQueue((prev) => [...prev, song]);
    };

    const removeFromQueue = (songId: string) => {
        setQueue((prev) => prev.filter((s) => s.id !== songId));
        setOriginalQueue((prev) => prev.filter((s) => s.id !== songId));
        if (currentSong?.id === songId) nextSong();
    };

    const clearQueue = () => {
        setQueue([]);
        setOriginalQueue([]);
        setCurrentSong(null);
        setIsPlaying(false);
        provider.pause().catch(() => {});
    };

    const connectSpotify = async () => {
        const returnTo = typeof window !== 'undefined' ? window.location.pathname : '/music';
        await beginSpotifyLogin(returnTo);
    };

    const disconnectSpotify = () => {
        provider.disconnect();
        setIsSpotifyConnected(false);
        setPlayerReady(false);
        setPremiumStatus('unknown');
        setIsPlaying(false);
    };

    const clearPlayerError = () => setPlayerError(null);

    return (
        <MusicContext.Provider
            value={{
                currentSong,
                isPlaying,
                duration,
                currentTime,
                volume,
                isMuted,
                repeatMode,
                isShuffle,
                queue,
                history,
                favorites,
                recentlyPlayed,
                isSpotifyConnected,
                premiumStatus,
                playerReady,
                playerError,
                needsReconnect,
                playSong,
                pauseSong,
                resumeSong,
                togglePlay,
                nextSong,
                prevSong,
                seek,
                changeVolume,
                toggleMute,
                toggleRepeat,
                toggleShuffle,
                toggleFavorite,
                addToQueue,
                removeFromQueue,
                clearQueue,
                setQueue,
                connectSpotify,
                disconnectSpotify,
                clearPlayerError,
                refreshAuthState,
            }}
        >
            {children}
        </MusicContext.Provider>
    );
}
