export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    color?: string; // custom note theme colors
    isPinned: boolean;
    isFavorite: boolean;
    synced?: boolean;
}

const STORAGE_KEY = 'lisa_notes';

export function getLocalNotes(): Note[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const notes = JSON.parse(raw) as Note[];
        // Standard sorting: pinned first, then updated date descending
        return sortNotes(notes);
    } catch (e) {
        console.error('Failed to read notes from localStorage', e);
        return [];
    }
}

export function saveLocalNotes(notes: Note[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
        console.error('Failed to save notes to localStorage', e);
    }
}

export function sortNotes(notes: Note[]): Note[] {
    return [...notes].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

export function createNote(noteData: Partial<Note>): Note {
    const notes = getLocalNotes();
    const newNote: Note = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: noteData.title?.trim() || 'Untitled Note',
        content: noteData.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: noteData.color || '#442D1C', // default cozy card color
        isPinned: noteData.isPinned || false,
        isFavorite: noteData.isFavorite || false,
        synced: false,
    };

    const updatedNotes = [newNote, ...notes];
    saveLocalNotes(updatedNotes);
    return newNote;
}

export function updateNote(id: string, updates: Partial<Note>): Note | null {
    const notes = getLocalNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return null;

    const original = notes[index];
    const updatedNote: Note = {
        ...original,
        ...updates,
        updatedAt: new Date().toISOString(),
        synced: false // mark for future cloud sync
    };

    notes[index] = updatedNote;
    saveLocalNotes(notes);
    return updatedNote;
}

export function deleteNote(id: string): void {
    const notes = getLocalNotes();
    const filtered = notes.filter(n => n.id !== id);
    saveLocalNotes(filtered);
}
