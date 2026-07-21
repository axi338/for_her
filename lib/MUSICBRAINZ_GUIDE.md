/**
 * Integration guide for MusicBrainz in script.js
 * 
 * To use MusicBrainz enrichment, add this to your existing script.js:
 * 
 * 1. Import at the top of script.js:
 *    import { enrichSongsWithMusicBrainz } from './lib/musicEnrichment.js';
 * 
 * 2. In the DOMContentLoaded event, after initMusicPlayer():
 *    enrichSongsWithMusicBrainz().catch(err => 
 *        console.error('Failed to enrich songs:', err)
 *    );
 * 
 * 3. The function will:
 *    - Search MusicBrainz for each song (with 1.1s delay between requests)
 *    - Cache results in localStorage for 7 days
 *    - Enhance SONG_LIST with: musicbrainzId, duration, releaseDate, wikiUrl, coverArtUrl
 *    - Fall back gracefully if API is unavailable
 */

// Example usage:
/*
document.addEventListener('DOMContentLoaded', () => {
    initVisitTracking();
    initMessageWidget();
    initTimeGreeting();
    initIntro();
    initPetals();
    initFloatingWords();
    initMusicPlayer();
    initLilies();
    initNotes();
    initMemories();
    initMoods();
    
    // NEW: Enrich songs with MusicBrainz metadata
    enrichSongsWithMusicBrainz().catch(err => 
        console.error('Failed to enrich songs:', err)
    );
});
*/

/**
 * Features unlocked with MusicBrainz:
 * 
 * 1. Artist Information
 *    - Country of origin
 *    - Type (Person, Group, Orchestra)
 *    - Founded/disbanded dates
 *    - Wikipedia link
 *    - Genre tags
 * 
 * 2. Recording Details
 *    - Official duration (verify your local file length)
 *    - First release date
 *    - Disambiguation (if multiple recordings with same name)
 *    - MusicBrainz ID (unique identifier)
 * 
 * 3. Album/Release Info
 *    - Release date
 *    - Country of release
 *    - Packaging type
 *    - Cover art (from Cover Art Archive)
 * 
 * 4. Caching
 *    - All metadata cached in localStorage
 *    - 7-day cache expiry (configurable)
 *    - Reduces API calls on repeat visits
 * 
 * 5. Rate Limiting
 *    - 1.1 second delay between requests (MusicBrainz limit: 1 req/sec)
 *    - Respects User-Agent header requirement
 *    - Graceful fallback if API unavailable
 */

export const MUSICBRAINZ_FEATURES = `
✨ MusicBrainz Integration Features:

🎵 Song Enrichment
  - Fetch official metadata for each track
  - Get accurate duration and release dates
  - Verify song information

🎨 Album Art
  - Pull cover art from MusicBrainz Cover Art Archive
  - Display album artwork in player
  - Fallback to existing art if unavailable

👤 Artist Info
  - Display artist country and type
  - Link to Wikipedia biography
  - Show genre tags

📚 Wikipedia Integration
  - Direct links to Wikipedia pages
  - Learn about artists and recordings
  - External reference data

💾 Smart Caching
  - Cache results for 7 days
  - Reduce API calls on repeat visits
  - Works offline with cached data

🔄 Rate Limiting
  - Respects MusicBrainz 1 req/sec limit
  - Automatic throttling between requests
  - No API key required
`;

console.log(MUSICBRAINZ_FEATURES);
