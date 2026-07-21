/**
 * Enhanced Music Player with MusicBrainz Integration
 * Enriches local song metadata with MusicBrainz API
 */

import {
    searchRecording,
    searchArtist,
    getCachedMetadata,
    cacheMetadata
} from './musicbrainz.js';

// Existing SONG_LIST from script.js - we'll enhance it
const SONG_LIST = [
    {
        title: "Konna Netlaka",
        artist: "Fairuz",
        url: "songs_to_use/track_konna.m4a",
        art: "photos_to_use/photo_1.webp",
        lyrics: [] // Your existing lyrics array
    },
    // ... other songs
];

/**
 * Enrich song metadata with MusicBrainz data
 * Runs on app load, enhances each song with:
 * - Album/release info
 * - Duration confirmation
 * - Artist info (country, disambiguation)
 * - Wikipedia links
 */
export async function enrichSongsWithMusicBrainz() {
    console.log('🎵 Enriching songs with MusicBrainz metadata...');

    for (let i = 0; i < SONG_LIST.length; i++) {
        const song = SONG_LIST[i];
        const cacheKey = `${song.artist}_${song.title}`;

        // Check cache first
        let metadata = getCachedMetadata(cacheKey);

        if (!metadata) {
            // Fetch from MusicBrainz
            metadata = await searchRecording(song.title, song.artist);
            if (metadata) {
                cacheMetadata(cacheKey, metadata);
            }
        }

        if (metadata) {
            // Merge MusicBrainz data into song
            song.musicbrainzId = metadata.id;
            song.duration = metadata.length; // milliseconds
            song.releaseDate = metadata.firstReleaseDate;
            song.wikiUrl = metadata.wikiUrl;
            song.releaseId = metadata.releaseId;

            // Try to get cover art
            if (metadata.releaseId) {
                song.coverArtUrl = `https://coverartarchive.org/release/${metadata.releaseId}/front`;
            }

            console.log(`✓ Enhanced: ${song.title} by ${song.artist}`);
        }

        // Rate limiting: 1.1 seconds between requests
        if (i < SONG_LIST.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1100));
        }
    }

    console.log('✅ Song enrichment complete');
    return SONG_LIST;
}

/**
 * Get artist details from MusicBrainz
 * Useful for displaying artist info in UI
 */
export async function getArtistDetails(artistName) {
    const cacheKey = `artist_${artistName}`;
    let artistData = getCachedMetadata(cacheKey);

    if (!artistData) {
        artistData = await searchArtist(artistName);
        if (artistData) {
            cacheMetadata(cacheKey, artistData);
        }
    }

    return artistData;
}

/**
 * Display enhanced metadata in UI
 * Call this after enrichment to show album art, artist info, etc.
 */
export function displayEnhancedMetadata(song) {
    const container = document.getElementById('track-metadata');
    if (!container) return;

    let html = `
        <div class="metadata-enhanced">
            <h4>${song.title}</h4>
            <p class="artist">${song.artist}</p>
    `;

    // Add cover art if available from MusicBrainz
    if (song.coverArtUrl) {
        html += `<img src="${song.coverArtUrl}" alt="Album Art" class="cover-art-mb" onerror="this.style.display='none'">`;
    }

    // Add Wikipedia link if available
    if (song.wikiUrl) {
        html += `<a href="${song.wikiUrl}" target="_blank" class="wiki-link">View on Wikipedia</a>`;
    }

    // Add release date if available
    if (song.releaseDate) {
        html += `<p class="release-date">Released: ${song.releaseDate}</p>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Get cover art URL from MusicBrainz Cover Art Archive
 */
export function getCoverArtUrl(releaseId, type = 'front') {
    return `https://coverartarchive.org/release/${releaseId}/${type}`;
}
