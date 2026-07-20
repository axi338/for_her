'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Note, getLocalNotes, createNote, updateNote, deleteNote } from '@/lib/notesStore';

const NOTE_COLORS = [
    { hex: '#f4ebd0', name: 'Alabaster Parchment' },
    { hex: '#e8d1a7', name: 'Persian Gold' },
    { hex: '#d5b46a', name: 'Saffron Dusk' },
    { hex: '#deb887', name: 'Warm Terracotta' },
    { hex: '#c2b280', name: 'Desert Sand' },
    { hex: '#bcb88a', name: 'Sage Olive' }
];

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'pinned'>('all');
    const [viewLayout, setViewLayout] = useState<'grid' | 'list' | 'masonry'>('masonry');

    // Active/Edited Note
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [isLetterOpen, setIsLetterOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [selectedColor, setSelectedColor] = useState('#f4ebd0');

    // Auto-save interval ref
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize
    useEffect(() => {
        setNotes(getLocalNotes());
    }, []);

    // Filter notes
    const filteredNotes = notes.filter((n) => {
        const titleMatch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
        const contentMatch = n.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSearch = titleMatch || contentMatch;

        if (!matchesSearch) return false;
        if (filterMode === 'favorites') return n.isFavorite;
        if (filterMode === 'pinned') return n.isPinned;
        return true;
    });

    const handleCreateNote = () => {
        const newNote = createNote({
            title: 'New Note',
            content: '',
            color: '#f4ebd0',
            isPinned: false,
            isFavorite: false
        });
        setNotes(getLocalNotes());
        handleOpenNote(newNote);
    };

    const handleOpenNote = (note: Note) => {
        setActiveNote(note);
        setEditTitle(note.title);
        setEditContent(note.content);
        setSelectedColor(note.color || '#f4ebd0');
        setIsLetterOpen(true);
    };

    const handleCloseNote = () => {
        // Trigger final save
        if (activeNote) {
            saveActiveChanges(editTitle, editContent, selectedColor);
        }
        setIsLetterOpen(false);
        setTimeout(() => {
            setActiveNote(null);
        }, 450); // wait for animation
    };

    const saveActiveChanges = (title: string, content: string, color: string) => {
        if (!activeNote) return;
        const updated = updateNote(activeNote.id, {
            title: title.trim() || 'Untitled Note',
            content,
            color
        });
        if (updated) {
            setNotes(getLocalNotes());
        }
    };

    // Auto-save setup on input typing trigger
    const handleInputChange = (newTitle: string, newContent: string) => {
        setEditTitle(newTitle);
        setEditContent(newContent);

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            saveActiveChanges(newTitle, newContent, selectedColor);
        }, 1500); // Save after 1.5s pause
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this note?')) {
            deleteNote(id);
            setNotes(getLocalNotes());
            if (activeNote?.id === id) {
                setIsLetterOpen(false);
                setActiveNote(null);
            }
        }
    };

    const handleTogglePin = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const note = notes.find((n) => n.id === id);
        if (note) {
            updateNote(id, { isPinned: !note.isPinned });
            setNotes(getLocalNotes());
        }
    };

    const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const note = notes.find((n) => n.id === id);
        if (note) {
            updateNote(id, { isFavorite: !note.isFavorite });
            setNotes(getLocalNotes());
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#1d1916', // Dark warm charcoal background for luxury contrast
                paddingTop: 'var(--nav-height)',
                paddingBottom: '8rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Decorative Persian Corner Ornaments */}
            <div className="corner-ornament top-left" />
            <div className="corner-ornament top-right" />

            <div className="container" style={{ position: 'relative', zIndex: 10 }}>

                {/* Header Title Section */}
                <div style={{ textAlign: 'center', margin: '4rem 0 3rem' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', color: 'var(--gold)', letterSpacing: '0.12em', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        Persian Manuscript
                    </span>
                    <h1
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            color: '#fdfbf7',
                            marginTop: '0.5rem',
                            marginBottom: '1rem',
                            fontWeight: 300
                        }}
                    >
                        My Notes Sanctuary
                    </h1>
                    <div style={{ margin: '0 auto 1.5rem', width: '120px', height: '2px', background: 'radial-gradient(circle, var(--gold) 0%, transparent 100%)' }} />
                </div>

                {/* Control toolbar panel */}
                <div
                    className="liquid-glass"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.25rem 2rem',
                        borderRadius: '20px',
                        marginBottom: '3rem'
                    }}
                >
                    {/* Create Note Button */}
                    <button onClick={handleCreateNote} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.4rem',
                        borderRadius: '12px', background: 'linear-gradient(135deg, #D5B46A, #9a7e4a)',
                        color: '#1a1008', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.875rem',
                        cursor: 'pointer', border: 'none',
                        boxShadow: '0 4px 16px rgba(213,180,106,0.35)',
                        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)'
                    }}>
                        <span style={{ fontSize: '1rem' }}>✍</span> New Letter
                    </button>

                    {/* Search tool */}
                    <div className="search-wrap" style={{ flex: 1, maxWidth: '300px' }}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search thoughts..."
                            className="input search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter switches */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(['all', 'pinned', 'favorites'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setFilterMode(m)}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontFamily: 'var(--font-ui)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    background: filterMode === m ? 'rgba(213, 180, 106, 0.15)' : 'transparent',
                                    color: filterMode === m ? 'var(--gold)' : 'var(--text2)',
                                    border: '1px solid',
                                    borderColor: filterMode === m ? 'var(--gold)' : 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* Grid/Layout selector */}
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(24, 23, 21, 0.6)', padding: '4px', borderRadius: '6px' }}>
                        {(['grid', 'list', 'masonry'] as const).map((lay) => (
                            <button
                                key={lay}
                                onClick={() => setViewLayout(lay)}
                                className={`btn-icon ${viewLayout === lay ? 'active' : ''}`}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    background: viewLayout === lay ? 'var(--btn)' : 'transparent',
                                    color: viewLayout === lay ? 'var(--text)' : 'var(--text3)',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {lay === 'grid' && '🔲'}
                                {lay === 'list' && '☰'}
                                {lay === 'masonry' && '🧱'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes listings */}
                {filteredNotes.length === 0 ? (
                    <div style={{ textAlign: 'center', margin: '6rem 0', color: 'var(--text3)' }}>
                        <p style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>
                            Your notes collection is empty.
                        </p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Create a new note to start capturing your beautiful memories.
                        </p>
                    </div>
                ) : (
                    <div
                        className={`notes-layout-${viewLayout}`}
                        style={{
                            display: viewLayout === 'list' ? 'flex' : 'grid',
                            flexDirection: 'column',
                            gridTemplateColumns: viewLayout === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
                            columnCount: viewLayout === 'masonry' ? 3 : undefined,
                            columnGap: '2rem',
                            gap: viewLayout === 'list' ? '1rem' : '2.5rem'
                        }}
                    >
                        {filteredNotes.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => handleOpenNote(note)}
                                className="note-card manuscript-paper"
                                style={{
                                    background: note.color || '#f4ebd0',
                                    color: '#2b211b',
                                    boxShadow: '0 10px 36px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,250,235,0.8)',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(213,180,106,0.6)',
                                    outline: '1px solid rgba(213,180,106,0.15)',
                                    outlineOffset: '3px',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'inline-block',
                                    width: '100%',
                                    marginBottom: viewLayout === 'masonry' ? '2.5rem' : '0',
                                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                                    position: 'relative'
                                }}
                            >
                                {/* Pin ornament indicator */}
                                {note.isPinned && (
                                    <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.1rem', color: '#84592B' }}>
                                        📌
                                    </span>
                                )}

                                <h3
                                    style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '1.35rem',
                                        fontWeight: 600,
                                        marginBottom: '0.75rem',
                                        borderBottom: '1px dashed rgba(132, 89, 43, 0.25)',
                                        paddingBottom: '6px',
                                        paddingRight: '20px'
                                    }}
                                >
                                    {note.title}
                                </h3>
                                <p
                                    style={{
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '0.98rem',
                                        lineHeight: '1.7',
                                        maxHeight: '160px',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 6,
                                        WebkitBoxOrient: 'vertical',
                                        wordBreak: 'break-word',
                                        color: '#44352e'
                                    }}
                                >
                                    {note.content || <em style={{ opacity: 0.5 }}>Empty thought...</em>}
                                </p>

                                {/* Card footer details */}
                                <div
                                    style={{
                                        marginTop: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        fontSize: '0.75rem',
                                        color: '#84592B',
                                        fontFamily: 'var(--font-ui)',
                                        fontWeight: 500
                                    }}
                                    onClick={(e) => e.stopPropagation()} // retain action bubbles
                                >
                                    <span>
                                        {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={(e) => handleTogglePin(note.id, e)} title="Pin note">
                                            {note.isPinned ? '📌' : '📍'}
                                        </button>
                                        <button onClick={(e) => handleToggleFavorite(note.id, e)} title="Favorite note">
                                            {note.isFavorite ? '♥' : '♡'}
                                        </button>
                                        <button onClick={(e) => handleDelete(note.id, e)} style={{ color: '#b91c1c' }} title="Delete note">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Slide-Fold "Opening a Letter" Envelope Overlay Modal */}
            {activeNote && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99990,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(15, 14, 13, 0.85)',
                        backdropFilter: 'blur(10px)',
                        opacity: isLetterOpen ? 1 : 0,
                        visibility: isLetterOpen ? 'visible' : 'hidden',
                        transition: 'opacity 0.4s ease, visibility 0.4s'
                    }}
                >
                    {/* Modal Container simulating vintage envelope flap unfold */}
                    <div
                        className={`envelope-container ${isLetterOpen ? 'open' : ''}`}
                        style={{
                            width: '90%',
                            maxWidth: '680px',
                            height: '82vh',
                            background: selectedColor,
                            border: '3px solid #d5b46a',
                            outline: '1px solid rgba(213,180,106,0.3)',
                            outlineOffset: '4px',
                            borderRadius: '10px',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 0 8px rgba(24,23,21,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        {/* Wax Seal + Calligraphy header */}
                        <div
                            style={{
                                padding: '1rem 1.75rem',
                                borderBottom: '2px solid rgba(132, 89, 43, 0.18)',
                                background: 'linear-gradient(to bottom, rgba(132,89,43,0.06), rgba(132,89,43,0))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {/* Wax Seal Icon */}
                                <div style={{
                                    width: '34px', height: '34px', borderRadius: '50%',
                                    background: 'radial-gradient(circle at 40% 35%, #d5963a, #9a5e1a)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    color: 'rgba(255,248,220,0.9)', fontFamily: 'serif'
                                }}>❀</div>
                                {/* Color options */}
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {NOTE_COLORS.map((c) => (
                                        <button
                                            key={c.hex}
                                            onClick={() => setSelectedColor(c.hex)}
                                            style={{
                                                width: '18px', height: '18px', borderRadius: '50%',
                                                background: c.hex,
                                                border: selectedColor === c.hex ? '2px solid #84592B' : '1px solid rgba(0,0,0,0.2)',
                                                cursor: 'pointer', transition: 'transform 0.2s'
                                            }}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={handleCloseNote}
                                style={{
                                    fontSize: '1.5rem', lineHeight: '1', color: '#84592B',
                                    fontWeight: 300, cursor: 'pointer', opacity: 0.7,
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Note text areas */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem 2.25rem', overflowY: 'auto' }}>
                            <input
                                type="text"
                                placeholder="Title your letter..."
                                value={editTitle}
                                onChange={(e) => handleInputChange(e.target.value, editContent)}
                                style={{
                                    background: 'transparent', border: 'none',
                                    borderBottom: '2px solid rgba(132, 89, 43, 0.15)',
                                    fontSize: '2rem', fontFamily: 'var(--font-display)',
                                    fontWeight: 500, width: '100%', color: '#2b211b',
                                    outline: 'none', paddingBottom: '10px', marginBottom: '1.5rem',
                                    letterSpacing: '-0.01em'
                                }}
                            />
                            <textarea
                                placeholder="Pour your thoughts onto the page..."
                                value={editContent}
                                onChange={(e) => handleInputChange(editTitle, e.target.value)}
                                className="lined-paper-textarea"
                                style={{
                                    flex: 1, background: 'transparent', border: 'none',
                                    resize: 'none', fontSize: '1.1rem',
                                    fontFamily: 'var(--font-body)', lineHeight: '2.2',
                                    width: '100%', color: '#3d2c20', outline: 'none',
                                    backgroundImage: 'repeating-linear-gradient(transparent, transparent calc(2.2em - 1px), rgba(132,89,43,0.12) calc(2.2em - 1px), rgba(132,89,43,0.12) 2.2em)',
                                    backgroundAttachment: 'local'
                                }}
                            />
                        </div>

                        {/* Auto-save helper line */}
                        <div style={{ padding: '0.8rem 2rem', fontSize: '0.75rem', color: '#84592B', fontFamily: 'var(--font-ui)', opacity: 0.6, display: 'flex', justifyContent: 'space-between' }}>
                            <span>Auto-saved locally</span>
                            <span>Persian Calligraphy Layout</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Styled custom CSS sheet injected inside */}
            <style jsx global>{`
        /* Persian ornaments */
        .corner-ornament {
          position: absolute; width: 100px; height: 100px;
          opacity: 0.18; pointer-events: none; z-index: 1;
        }
        .corner-ornament.top-left {
          top: 80px; left: 12px;
          border-left: 2px solid var(--gold); border-top: 2px solid var(--gold);
        }
        .corner-ornament.top-left::before, .corner-ornament.top-right::before {
          content: '❀';
          position: absolute; top: -10px; font-size: 18px; color: var(--gold);
        }
        .corner-ornament.top-right {
          top: 80px; right: 12px;
          border-right: 2px solid var(--gold); border-top: 2px solid var(--gold);
        }
        .corner-ornament.top-left::before { left: -6px; }
        .corner-ornament.top-right::before { right: -6px; }

        /* Manuscript Paper textures */
        .manuscript-paper {
          background-image:
            repeating-linear-gradient(rgba(132,89,43,0.04) 0px, rgba(132,89,43,0.04) 1px, transparent 1px, transparent 28px),
            linear-gradient(to right, rgba(213,180,106,0.08) 0px, rgba(213,180,106,0) 50px);
        }

        .note-card:hover {
          transform: translateY(-6px) rotate(0.4deg);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 2px rgba(213,180,106,0.4) !important;
        }

        /* Slide envelope unfolding frames */
        .envelope-container {
          transform: perspective(800px) rotateX(8deg) scale(0.88) translateY(-30px);
          opacity: 0;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
        }
        .envelope-container.open {
          transform: perspective(800px) rotateX(0deg) scale(1) translateY(0);
          opacity: 1;
        }
        
        /* Masonry response breakpoints */
        @media(max-width: 900px) {
          .notes-layout-masonry { column-count: 2 !important; }
        }
        @media(max-width: 600px) {
          .notes-layout-masonry { column-count: 1 !important; }
        }
      `}</style>
        </div>
    );
}
