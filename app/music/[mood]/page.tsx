'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMusic, Song, resolvedToSong } from '@/lib/musicContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { MoodConfig } from '@/lib/providers/music/types';
import { fetchTracksMetadata } from '@/lib/services/spotify/api';

type SortKey = 'newest' | 'alphabetical' | 'duration' | 'favorites' | 'artist';
type DurationFilter = 'all' | 'short' | 'medium' | 'long';

export default function MoodCollectionPage() {
    const params = useParams();
    const moodId = (params.mood as string) || '';

    const {
        playSong,
        favorites,
        toggleFavorite,
        setQueue,
        isSpotifyConnected,
        connectSpotify,
        premiumStatus,
    } = useMusic();

    const [mood, setMood] = useState<MoodConfig | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortKey>('newest');
    const [artistFilter, setArtistFilter] = useState('all');
    const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        const load = async () => {
            if (!moodId) return;
            try {
                setLoading(true);
                const res = await fetch(`/api/moods/${moodId}`);
                if (!res.ok) throw new Error('Mood not found');
                const data = await res.json();
                const m: MoodConfig = data.mood;
                setMood(m);

                const ids = (m.tracks || []).map((t) => t.spotifyId).filter(Boolean);
                const covers: Record<string, string> = {};
                (m.tracks || []).forEach((t) => {
                    if (t.customCover) covers[t.spotifyId] = t.customCover;
                });

                if (ids.length === 0) {
                    setSongs([]);
                    return;
                }

                const resolved = await fetchTracksMetadata(ids, { customCovers: covers });
                setSongs(resolved.map(resolvedToSong));
            } catch (e) {
                console.error(e);
                setMood(null);
                setSongs([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [moodId]);

    const artists = useMemo(() => {
        const set = new Set(songs.map((s) => s.artist).filter(Boolean));
        return Array.from(set).sort();
    }, [songs]);

    const processedSongs = useMemo(() => {
        return songs
            .filter((song) => {
                const match = searchQuery.toLowerCase();
                const textOk =
                    !match ||
                    song.title.toLowerCase().includes(match) ||
                    song.artist.toLowerCase().includes(match) ||
                    (song.album || '').toLowerCase().includes(match);

                if (!textOk) return false;
                if (favoritesOnly && !favorites.includes(song.id)) return false;
                if (artistFilter !== 'all' && song.artist !== artistFilter) return false;

                const ms = song.durationMs || 0;
                if (durationFilter === 'short' && ms >= 180000) return false;
                if (durationFilter === 'medium' && (ms < 180000 || ms > 300000)) return false;
                if (durationFilter === 'long' && ms <= 300000) return false;

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
                if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
                if (sortBy === 'duration') return (b.durationMs || 0) - (a.durationMs || 0);
                if (sortBy === 'favorites') {
                    return (favorites.includes(b.id) ? 1 : 0) - (favorites.includes(a.id) ? 1 : 0);
                }
                // newest = JSON order (already ordered)
                return 0;
            });
    }, [songs, searchQuery, sortBy, artistFilter, durationFilter, favoritesOnly, favorites]);

    const handlePlayAll = (shuffle = false) => {
        const playable = processedSongs.filter((s) => !s.unavailable);
        if (playable.length === 0) return;
        let playQueue = [...playable];
        if (shuffle) playQueue.sort(() => Math.random() - 0.5);
        setQueue(playQueue);
        playSong(playQueue[0], playQueue);
    };

    const title = mood?.title || moodId;
    const desc = mood?.description || '';
    const banner = mood?.background || mood?.cover || '/photos_to_use/photo_1.webp';

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#181715',
                color: 'var(--text)',
                paddingBottom: '8rem',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    height: '40vh',
                    backgroundImage: `url(${banner})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(213, 180, 106, 0.15)',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(to bottom, rgba(24, 23, 21, 0.2) 0%, rgba(24, 23, 21, 0.9) 100%)',
                        zIndex: 0,
                    }}
                />
                <div
                    className="container"
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        textAlign: 'center',
                        paddingBottom: '2.5rem',
                        maxWidth: '800px',
                    }}
                >
                    <Link
                        href="/music"
                        style={{
                            fontFamily: 'var(--font-ui)',
                            color: 'var(--gold)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                        }}
                    >
                        ← Mood Collection
                    </Link>
                    <h1
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            color: 'var(--text)',
                            fontWeight: 300,
                            marginTop: '0.5rem',
                            marginBottom: '1rem',
                        }}
                    >
                        {mood?.emoji ? `${mood.emoji} ` : ''}
                        {title}
                    </h1>
                    <p
                        style={{
                            color: 'var(--text2)',
                            fontSize: '1.15rem',
                            fontStyle: 'italic',
                            lineHeight: '1.6',
                            fontFamily: 'var(--font-body)',
                        }}
                    >
                        {desc}
                    </p>
                </div>
            </div>

            <div className="container" style={{ marginTop: '3rem' }}>
                {!isSpotifyConnected && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.25rem',
                            borderRadius: '14px',
                            background: 'rgba(29,185,84,0.08)',
                            border: '1px solid rgba(29,185,84,0.25)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <span style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
                            Connect Spotify to play these tracks in-app.
                        </span>
                        <button className="btn btn-gold" onClick={() => connectSpotify()}>
                            Connect Spotify
                        </button>
                    </div>
                )}

                {premiumStatus === 'free' && (
                    <div
                        style={{
                            marginBottom: '1.5rem',
                            padding: '1rem 1.25rem',
                            borderRadius: '14px',
                            background: 'rgba(248,113,113,0.08)',
                            border: '1px solid rgba(248,113,113,0.3)',
                            color: 'var(--text2)',
                            fontSize: '0.9rem',
                        }}
                    >
                        Spotify Premium is required for in-app playback. You can still browse and open
                        tracks in Spotify.
                    </div>
                )}

                <div
                    className="glass-light"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.25rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.2rem 1.5rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid rgba(213, 180, 106, 0.1)',
                        marginBottom: '2rem',
                    }}
                >
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <button onClick={() => handlePlayAll(false)} className="btn btn-gold">
                            Play All
                        </button>
                        <button onClick={() => handlePlayAll(true)} className="btn btn-ghost">
                            Shuffle
                        </button>
                    </div>

                    <div className="search-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search this mood…"
                            className="input search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <select
                            value={artistFilter}
                            onChange={(e) => setArtistFilter(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="all">All artists</option>
                            {artists.map((a) => (
                                <option key={a} value={a}>
                                    {a}
                                </option>
                            ))}
                        </select>

                        <select
                            value={durationFilter}
                            onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
                            style={selectStyle}
                        >
                            <option value="all">Any duration</option>
                            <option value="short">&lt; 3 min</option>
                            <option value="medium">3–5 min</option>
                            <option value="long">&gt; 5 min</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortKey)}
                            style={selectStyle}
                        >
                            <option value="newest">Newest added</option>
                            <option value="alphabetical">A–Z</option>
                            <option value="artist">Artist</option>
                            <option value="duration">Duration</option>
                            <option value="favorites">Favorites</option>
                        </select>

                        <button
                            onClick={() => setFavoritesOnly((v) => !v)}
                            className="btn btn-ghost"
                            style={{
                                borderColor: favoritesOnly ? 'rgba(248,113,113,0.5)' : undefined,
                                color: favoritesOnly ? '#f87171' : undefined,
                            }}
                        >
                            {favoritesOnly ? '♥ Favorites' : '♡ Favorites'}
                        </button>

                        <div
                            style={{
                                display: 'flex',
                                gap: '4px',
                                background: 'rgba(24, 23, 21, 0.6)',
                                padding: '4px',
                                borderRadius: '6px',
                            }}
                        >
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '4px',
                                    background: viewMode === 'grid' ? 'var(--btn)' : 'transparent',
                                    color: viewMode === 'grid' ? 'var(--text)' : 'var(--text3)',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                🔲
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '4px',
                                    background: viewMode === 'list' ? 'var(--btn)' : 'transparent',
                                    color: viewMode === 'list' ? 'var(--text)' : 'var(--text3)',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                ☰
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '2.5rem',
                        }}
                    >
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius)' }} />
                                <div className="skeleton" style={{ width: '80%', height: '16px' }} />
                                <div className="skeleton" style={{ width: '50%', height: '12px' }} />
                            </div>
                        ))}
                    </div>
                ) : processedSongs.length === 0 ? (
                    <div style={{ textAlign: 'center', margin: '6rem 0', color: 'var(--text3)' }}>
                        <p style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>
                            No melodies found in this collection.
                        </p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Add Spotify track IDs in the Admin Music Manager.
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '2.5rem',
                        }}
                    >
                        {processedSongs.map((song) => (
                            <TrackCardGrid
                                key={song.id}
                                song={song}
                                isFav={favorites.includes(song.id)}
                                onPlay={() => {
                                    if (song.unavailable) return;
                                    playSong(song, processedSongs.filter((s) => !s.unavailable));
                                }}
                                onFav={() => toggleFavorite(song.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {processedSongs.map((song, idx) => {
                            const isFav = favorites.includes(song.id);
                            return (
                                <div
                                    key={song.id}
                                    className="song-list-row glass-light"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.8rem 1.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid rgba(213, 180, 106, 0.05)',
                                        cursor: song.unavailable ? 'default' : 'pointer',
                                        opacity: song.unavailable ? 0.55 : 1,
                                        transition: 'all 0.3s ease',
                                    }}
                                    onClick={() => {
                                        if (song.unavailable) return;
                                        playSong(song, processedSongs.filter((s) => !s.unavailable));
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text3)', width: '20px' }}>
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                                            <img src={song.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--text)', fontWeight: 400 }}>
                                                {song.title}
                                            </h4>
                                            <p style={{ color: 'var(--text2)', fontSize: '0.8rem', fontFamily: 'var(--font-ui)' }}>
                                                {song.artist}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        {song.unavailable && (
                                            <span style={{ fontSize: '0.75rem', color: '#f87171' }}>Unavailable</span>
                                        )}
                                        <a
                                            href={song.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ fontSize: '0.75rem', color: 'var(--gold)', textDecoration: 'none' }}
                                        >
                                            Open
                                        </a>
                                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text2)' }}>
                                            {song.duration || '--:--'}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(song.id);
                                            }}
                                            style={{ color: isFav ? '#ef4444' : 'var(--text3)', fontSize: '1.1rem', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            {isFav ? '♥' : '♡'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .song-card-grid:hover .cd-jewel-case {
                    border-color: rgba(213, 180, 106, 0.4) !important;
                    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(213, 180, 106, 0.2) !important;
                }
                .song-card-grid:hover .album-sleeve {
                    transform: translateX(-15%);
                }
                .song-card-grid:hover .cd-disc {
                    opacity: 1 !important;
                    transform: translateX(11%) !important;
                    animation: spin-slow 8s linear infinite !important;
                }
                .song-card-grid:hover .play-hover-overlay {
                    opacity: 1 !important;
                }
                .song-list-row:hover {
                    background: rgba(68, 45, 28, 0.25) !important;
                    border-color: rgba(213, 180, 106, 0.15) !important;
                    transform: translateX(4px);
                }
            `}</style>
        </div>
    );
}

const selectStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'var(--gold)',
    fontFamily: 'var(--font-ui)',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    maxWidth: '140px',
};

function TrackCardGrid({
    song,
    isFav,
    onPlay,
    onFav,
}: {
    song: Song;
    isFav: boolean;
    onPlay: () => void;
    onFav: () => void;
}) {
    return (
        <div
            className="song-card-grid"
            style={{
                display: 'flex',
                flexDirection: 'column',
                cursor: song.unavailable ? 'default' : 'pointer',
                opacity: song.unavailable ? 0.55 : 1,
            }}
            onClick={onPlay}
        >
            <div
                className="cd-jewel-case"
                style={{
                    aspectRatio: '1',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(213, 180, 106, 0.1)',
                    boxShadow: 'var(--shadow-card)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.4s ease',
                }}
            >
                <img
                    src={song.art}
                    alt={song.title}
                    className="album-sleeve"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 1,
                        transition: 'transform 0.4s ease',
                    }}
                />
                <div
                    className="cd-disc"
                    style={{
                        position: 'absolute',
                        width: '90%',
                        height: '90%',
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, #100f0d 20%, #1c1a17 21%, #24221f 40%, #0e0d0c 41%, #1e1c19 70%, #080808 71%)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        zIndex: 0,
                        transform: 'translateX(25%)',
                        opacity: 0,
                        transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '28%',
                            height: '28%',
                            borderRadius: '50%',
                            backgroundImage: `url(${song.art})`,
                            backgroundSize: 'cover',
                            border: '2px solid #000',
                            position: 'relative',
                        }}
                    >
                        <div style={{ position: 'absolute', inset: '33%', borderRadius: '50%', background: '#1c1b18' }} />
                    </div>
                </div>
                <div
                    className="play-hover-overlay"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(24, 23, 21, 0.4)',
                        zIndex: 2,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            background: 'var(--gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            color: 'var(--bg)',
                            boxShadow: 'var(--shadow-glow-strong)',
                        }}
                    >
                        {song.unavailable ? '✕' : '▶'}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1, marginRight: '1rem' }}>
                    <h4
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.25rem',
                            color: 'var(--text)',
                            fontWeight: 400,
                            lineHeight: '1.2',
                            marginBottom: '4px',
                        }}
                    >
                        {song.title}
                    </h4>
                    <p style={{ color: 'var(--text2)', fontSize: '0.85rem', fontFamily: 'var(--font-ui)' }}>
                        {song.artist}
                    </p>
                    {song.duration && (
                        <p style={{ color: 'var(--text3)', fontSize: '0.75rem', marginTop: '2px' }}>
                            {song.duration}
                        </p>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFav();
                    }}
                    style={{
                        color: isFav ? '#ef4444' : 'var(--text3)',
                        fontSize: '1.2rem',
                        padding: '2px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    {isFav ? '♥' : '♡'}
                </button>
            </div>
        </div>
    );
}
