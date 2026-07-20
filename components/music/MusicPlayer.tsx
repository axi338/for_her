'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMusic } from '@/lib/musicContext';

export function MusicPlayer() {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        repeatMode: loopMode,
        isShuffle,
        queue,
        favorites,
        togglePlay,
        playSong,
        nextSong: playNext,
        prevSong: playPrevious,
        seek,
        changeVolume,
        toggleRepeat: toggleLoopMode,
        toggleShuffle,
        toggleFavorite,
        playerError,
        clearPlayerError,
        premiumStatus,
        connectSpotify,
        needsReconnect,
        playerReady,
    } = useMusic();

    const [expandedQueue, setExpandedQueue] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);
    const [localProgress, setLocalProgress] = useState(0);
    const [isSeekingState, setIsSeekingState] = useState(false);
    const visualizerRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number | null>(null);
    const barAngles = useRef<number[]>([]);

    useEffect(() => {
        if (!isSeekingState) setLocalProgress(currentTime);
    }, [currentTime, isSeekingState]);

    useEffect(() => {
        const canvas = visualizerRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const barCount = 28;
        if (!barAngles.current.length) {
            barAngles.current = Array.from({ length: barCount }, (_, i) => i * 0.6);
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const w = canvas.width;
            const h = canvas.height;
            const barW = w / barCount - 2;

            for (let i = 0; i < barCount; i++) {
                barAngles.current[i] += isPlaying ? 0.12 + Math.random() * 0.08 : 0.015;
                const rawH = isPlaying
                    ? Math.abs(Math.sin(barAngles.current[i])) * h * 0.65 + h * 0.1
                    : h * 0.08;
                const x = i * (barW + 2);
                const y = (h - rawH) / 2;
                const alpha = isPlaying ? 0.5 + Math.sin(barAngles.current[i]) * 0.3 : 0.15;
                ctx.fillStyle = `rgba(213,180,106,${alpha})`;
                ctx.beginPath();
                ctx.roundRect(x, y, barW, rawH, 2);
                ctx.fill();
            }
            animFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isPlaying]);

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds === null) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSeekingState(true);
        setLocalProgress(Number(e.target.value));
    };

    const handleSeekEnd = () => {
        setIsSeekingState(false);
        seek(localProgress);
    };

    const progressPct = duration > 0 ? (localProgress / duration) * 100 : 0;
    const remaining = Math.max(0, duration - localProgress);

    const showPremiumBanner =
        playerError === 'PREMIUM_REQUIRED' || premiumStatus === 'free';
    const showError =
        playerError && playerError !== 'PREMIUM_REQUIRED';

    if (!currentSong && !showPremiumBanner && !needsReconnect && !showError) return null;

    return (
        <>
            <style>{`
                @keyframes vinylSpin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes slideUpPanel {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes heartPop {
                    0%   { transform: scale(1); }
                    30%  { transform: scale(1.4); }
                    60%  { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                #player-bar-wrap { 
                    position: fixed; bottom: 1.25rem; left: 50%;
                    transform: translateX(-50%);
                    width: calc(100% - 3rem); max-width: 900px;
                    z-index: 9990;
                }
                #player-bar {
                    position: relative;
                    background: rgba(24,23,21,0.6);
                    backdrop-filter: blur(40px);
                    -webkit-backdrop-filter: blur(40px);
                    border: 1.5px solid rgba(213,180,106,0.18);
                    border-radius: 28px;
                    padding: 0 1.5rem;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    gap: 0;
                    justify-content: space-between;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.65), inset 0 1px 2px rgba(232,209,167,0.12);
                    overflow: hidden;
                }
                #player-bar::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 60%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(232,209,167,0.05), transparent);
                    transform: skewX(-20deg);
                    pointer-events: none;
                    animation: shimmerPlayer 8s ease-in-out infinite;
                }
                @keyframes shimmerPlayer {
                    0%   { left: -100%; }
                    100% { left: 200%; }
                }
                .player-seek-wrap {
                    position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
                }
                .player-seek-track {
                    width: 100%; height: 100%;
                    background: rgba(213,180,106,0.1);
                }
                .player-seek-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--gold-dim), var(--gold));
                    transition: width 0.3s linear;
                    border-radius: 0 2px 2px 0;
                }
                .btn-ctrl {
                    background: none; border: none; cursor: pointer;
                    color: var(--text2); font-size: 1.05rem; padding: 0.35rem;
                    transition: color 0.3s, transform 0.2s cubic-bezier(0.16,1,0.3,1);
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 50%;
                }
                .btn-ctrl:hover { color: var(--text); transform: scale(1.15); }
                .btn-ctrl.active { color: var(--gold); }
                .btn-play-main {
                    width: 46px; height: 46px; border-radius: 50%;
                    background: linear-gradient(135deg, #e8c97e, #a8832b);
                    color: #1a1008; font-size: 1rem; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 20px rgba(213,180,106,0.35), 0 4px 15px rgba(0,0,0,0.4);
                    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
                    border: none;
                }
                .btn-play-main:hover { transform: scale(1.08); box-shadow: 0 0 30px rgba(213,180,106,0.6), 0 6px 20px rgba(0,0,0,0.5); }
                .btn-play-main:active { transform: scale(0.95); }
                .btn-play-main:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
                .vinyl-art {
                    width: 52px; height: 52px; border-radius: 50%;
                    object-fit: cover; flex-shrink: 0;
                    border: 2px solid rgba(213,180,106,0.25);
                    box-shadow: 0 0 0 4px rgba(24,23,21,0.6), 0 0 0 5px rgba(213,180,106,0.1);
                }
                .vinyl-spinning { animation: vinylSpin 4s linear infinite; }
                .heart-btn {
                    background: none; border: none; cursor: pointer;
                    font-size: 1.1rem; transition: transform 0.3s; display: flex; align-items: center;
                }
                .heart-btn:active { animation: heartPop 0.4s ease; }
                .queue-panel, .lyrics-panel {
                    position: fixed; bottom: calc(80px + 2.25rem);
                    right: calc((100% - min(900px, calc(100% - 3rem))) / 2);
                    width: 300px; max-height: 380px;
                    background: rgba(24,23,21,0.9);
                    backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
                    border: 1.5px solid rgba(213,180,106,0.18);
                    border-radius: 20px;
                    display: flex; flex-direction: column;
                    box-shadow: 0 -8px 40px rgba(0,0,0,0.5);
                    animation: slideUpPanel 0.3s cubic-bezier(0.16,1,0.3,1);
                    z-index: 9989; overflow: hidden;
                }
                .lyrics-panel { left: calc((100% - min(900px, calc(100% - 3rem))) / 2); right: auto; }
                .seek-input {
                    -webkit-appearance: none; appearance: none;
                    width: 100%; height: 3px; background: transparent;
                    outline: none; cursor: pointer;
                }
                .seek-input::-webkit-slider-thumb {
                    -webkit-appearance: none; width: 10px; height: 10px;
                    border-radius: 50%; background: var(--gold);
                    box-shadow: 0 0 6px rgba(213,180,106,0.6);
                    cursor: pointer;
                }
                .vol-input {
                    -webkit-appearance: none; appearance: none;
                    width: 72px; height: 3px;
                    background: rgba(213,180,106,0.2);
                    outline: none; cursor: pointer; border-radius: 2px;
                }
                .vol-input::-webkit-slider-thumb {
                    -webkit-appearance: none; width: 9px; height: 9px;
                    border-radius: 50%; background: var(--gold);
                    cursor: pointer;
                }
                .player-banner {
                    margin-bottom: 0.6rem;
                    padding: 0.75rem 1.1rem;
                    border-radius: 16px;
                    background: rgba(24,23,21,0.85);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(213,180,106,0.25);
                    display: flex; flex-wrap: wrap; align-items: center;
                    justify-content: space-between; gap: 0.75rem;
                    font-size: 0.85rem; color: var(--text2);
                    font-family: var(--font-ui);
                }
                @media (max-width: 640px) {
                    #player-bar-wrap { width: calc(100% - 1.5rem); bottom: 0.75rem; }
                    #player-bar { padding: 0 1rem; height: 70px; border-radius: 20px; }
                    .vinyl-art { width: 44px; height: 44px; }
                    .lyrics-panel, .queue-panel { width: calc(100% - 1.5rem); left: 0.75rem; right: 0.75rem; }
                }
            `}</style>

            <div id="player-bar-wrap">
                {(showPremiumBanner || showError || needsReconnect) && (
                    <div className="player-banner" style={{
                        borderColor: showPremiumBanner || showError
                            ? 'rgba(248,113,113,0.35)'
                            : 'rgba(213,180,106,0.25)',
                    }}>
                        <span>
                            {showPremiumBanner && 'Spotify Premium is required for in-app playback.'}
                            {needsReconnect && !showPremiumBanner && 'Your Spotify session expired. Please reconnect.'}
                            {showError && !needsReconnect && playerError}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {showPremiumBanner && currentSong?.url && (
                                <a
                                    href={currentSong.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-gold"
                                    style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', textDecoration: 'none' }}
                                >
                                    Open in Spotify
                                </a>
                            )}
                            {needsReconnect && (
                                <button
                                    className="btn btn-gold"
                                    style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                                    onClick={() => connectSpotify()}
                                >
                                    Reconnect
                                </button>
                            )}
                            {playerError && (
                                <button
                                    onClick={clearPlayerError}
                                    style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {currentSong && (
                    <div id="player-bar">
                        <canvas
                            ref={visualizerRef}
                            width={280}
                            height={80}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: 0,
                                transform: 'translateX(-50%)',
                                pointerEvents: 'none',
                                opacity: 0.4,
                            }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: '0 0 auto', minWidth: 0, maxWidth: '35%' }}>
                            <img
                                src={currentSong.art || '/photos_to_use/photo_1.webp'}
                                alt={currentSong.title}
                                className={`vinyl-art${isPlaying ? ' vinyl-spinning' : ''}`}
                            />
                            <div style={{ minWidth: 0 }}>
                                <div style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '0.95rem',
                                    color: 'var(--text)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    fontWeight: 500,
                                }}>{currentSong.title}</div>
                                <div style={{
                                    fontSize: '0.78rem', color: 'var(--text3)',
                                    fontFamily: 'var(--font-ui)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>{currentSong.artist}</div>
                            </div>
                            <button
                                className="heart-btn"
                                onClick={() => toggleFavorite(currentSong.id)}
                                style={{ color: favorites.includes(currentSong.id) ? '#f87171' : 'var(--text3)' }}
                            >
                                {favorites.includes(currentSong.id) ? '♥' : '♡'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: '1 1 auto', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                                <button className={`btn-ctrl${isShuffle ? ' active' : ''}`} onClick={toggleShuffle} title="Shuffle">🔀</button>
                                <button className="btn-ctrl" onClick={playPrevious} title="Previous">⏮</button>
                                <button
                                    className="btn-play-main"
                                    onClick={togglePlay}
                                    disabled={premiumStatus === 'free'}
                                    title={!playerReady && premiumStatus === 'premium' ? 'Connecting…' : undefined}
                                >
                                    {isPlaying ? '⏸' : '▶'}
                                </button>
                                <button className="btn-ctrl" onClick={playNext} title="Next">⏭</button>
                                <button className={`btn-ctrl${loopMode !== 'off' ? ' active' : ''}`} onClick={toggleLoopMode} title={`Repeat: ${loopMode}`} style={{ position: 'relative' }}>
                                    🔁
                                    {loopMode === 'one' && (
                                        <span style={{
                                            position: 'absolute', bottom: 0, right: '-2px',
                                            fontSize: '6px', background: 'var(--gold)',
                                            color: 'var(--bg)', padding: '0 2px', borderRadius: '50%',
                                            lineHeight: '10px', width: '10px', textAlign: 'center',
                                        }}>1</span>
                                    )}
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', maxWidth: '340px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text3)', flexShrink: 0, fontFamily: 'var(--font-ui)' }}>{formatTime(localProgress)}</span>
                                <div style={{ flex: 1, position: 'relative', height: '3px' }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(213,180,106,0.12)', borderRadius: '2px' }} />
                                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progressPct}%`, background: 'linear-gradient(90deg, #9a7e4a, #D5B46A)', borderRadius: '2px', transition: 'width 0.2s linear' }} />
                                    <input
                                        type="range" min="0" max={duration || 0} value={localProgress}
                                        onChange={handleSeekChange} onMouseUp={handleSeekEnd} onTouchEnd={handleSeekEnd}
                                        className="seek-input"
                                        style={{ position: 'absolute', inset: '-4px 0', height: '11px', margin: '0' }}
                                    />
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text3)', flexShrink: 0, fontFamily: 'var(--font-ui)' }}>
                                    -{formatTime(remaining)}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '0 0 auto', justifyContent: 'flex-end' }}>
                            <button
                                className={`btn-ctrl${showLyrics ? ' active' : ''}`}
                                onClick={() => { setShowLyrics((v) => !v); setExpandedQueue(false); }}
                                title="Lyrics"
                                style={{ fontSize: '0.75rem', fontFamily: 'var(--font-ui)' }}
                            >
                                Aa
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text3)' }}>🔊</span>
                                <input
                                    type="range" min="0" max="1" step="0.05" value={volume}
                                    onChange={(e) => changeVolume(Number(e.target.value))}
                                    className="vol-input"
                                />
                            </div>
                            <button
                                onClick={() => { setExpandedQueue((q) => !q); setShowLyrics(false); }}
                                style={{
                                    padding: '5px 11px',
                                    borderRadius: '12px',
                                    border: `1px solid ${expandedQueue ? 'rgba(213,180,106,0.5)' : 'rgba(213,180,106,0.18)'}`,
                                    background: expandedQueue ? 'rgba(213,180,106,0.14)' : 'transparent',
                                    color: expandedQueue ? 'var(--gold)' : 'var(--text2)',
                                    fontSize: '0.78rem',
                                    fontFamily: 'var(--font-ui)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                ≡ {queue.length}
                            </button>
                        </div>

                        <div className="player-seek-wrap">
                            <div className="player-seek-track">
                                <div className="player-seek-fill" style={{ width: `${progressPct}%` }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showLyrics && currentSong && (
                <div className="lyrics-panel">
                    <div style={{ padding: '0.9rem 1rem 0.6rem', borderBottom: '1px solid rgba(213,180,106,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.05rem' }}>Lyrics</h3>
                        <button onClick={() => setShowLyrics(false)} style={{ color: 'var(--text3)', fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text3)', fontStyle: 'italic', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>
                            Lyrics unavailable
                        </p>
                        <p style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: '0.75rem', fontFamily: 'var(--font-ui)' }}>
                            Official Spotify API does not provide lyrics. This panel is ready for a future provider.
                        </p>
                    </div>
                </div>
            )}

            {expandedQueue && currentSong && (
                <div className="queue-panel">
                    <div style={{ padding: '0.9rem 1rem 0.6rem', borderBottom: '1px solid rgba(213,180,106,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.05rem' }}>
                            Queue <span style={{ color: 'var(--text3)', fontSize: '0.85rem', fontFamily: 'var(--font-ui)' }}>({queue.length})</span>
                        </h3>
                        <button onClick={() => setExpandedQueue(false)} style={{ color: 'var(--text3)', fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem' }}>
                        {queue.map((song) => {
                            const isCurrent = song.id === currentSong.id;
                            return (
                                <div
                                    key={song.id}
                                    onClick={() => playSong(song, queue)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.7rem',
                                        padding: '0.5rem 0.6rem', borderRadius: '10px',
                                        background: isCurrent ? 'rgba(213,180,106,0.1)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    <img src={song.art} style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} alt="" />
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: isCurrent ? 'var(--gold)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {song.title}
                                        </div>
                                        <div style={{ fontSize: '0.73rem', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {song.artist}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}
