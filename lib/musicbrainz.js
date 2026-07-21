/**
 * MusicBrainz API Client
 * Fetches music metadata (artist info, release info, recordings)
 * 
 * API Docs: https://musicbrainz.org/development/mmd
 * Rate limit: 1 request/second (we cache aggressively)
 */

const MUSICBRAINZ_ENDPOINT = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'ForHerApp/1.0 (https://github.com/axi338/for_her)';

/**
 * Search for a recording (song) by title and artist
 * @param {string} title - Song title
 * @param {string} artist - Artist name
 * @returns {Promise<Object>} Recording metadata
 */
export async function searchRecording(title, artist) {
    const query = `recording:"${title}" artist:"${artist}"`;
    const url = `${MUSICBRAINZ_ENDPOINT}/recording?query=${encodeURIComponent(query)}&fmt=json&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT
            }
        });

        if (!response.ok) throw new Error(`MusicBrainz API error: ${response.status}`);

        const data = await response.json();
        if (data.recordings && data.recordings.length > 0) {
            return parseRecording(data.recordings[0]);
        }
        return null;
    } catch (error) {
        console.error('MusicBrainz search error:', error);
        return null;
    }
}

/**
 * Get artist information
 * @param {string} artistName - Artist name
 * @returns {Promise<Object>} Artist metadata
 */
export async function searchArtist(artistName) {
    const url = `${MUSICBRAINZ_ENDPOINT}/artist?query=${encodeURIComponent(`artist:"${artistName}"`)}&fmt=json&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT
            }
        });

        if (!response.ok) throw new Error(`MusicBrainz API error: ${response.status}`);

        const data = await response.json();
        if (data.artists && data.artists.length > 0) {
            return parseArtist(data.artists[0]);
        }
        return null;
    } catch (error) {
        console.error('MusicBrainz artist search error:', error);
        return null;
    }
}

/**
 * Get release (album) information
 * @param {string} releaseTitle - Album/release title
 * @param {string} artistName - Artist name
 * @returns {Promise<Object>} Release metadata
 */
export async function searchRelease(releaseTitle, artistName) {
    const query = `release:"${releaseTitle}" artist:"${artistName}"`;
    const url = `${MUSICBRAINZ_ENDPOINT}/release?query=${encodeURIComponent(query)}&fmt=json&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT
            }
        });

        if (!response.ok) throw new Error(`MusicBrainz API error: ${response.status}`);

        const data = await response.json();
        if (data.releases && data.releases.length > 0) {
            return parseRelease(data.releases[0]);
        }
        return null;
    } catch (error) {
        console.error('MusicBrainz release search error:', error);
        return null;
    }
}

// ===== Parser Helpers =====

function parseRecording(recording) {
    return {
        id: recording.id,
        title: recording.title,
        artist: recording['artist-credit']?.[0]?.name || 'Unknown',
        artistId: recording['artist-credit']?.[0]?.artist?.id,
        length: recording.length, // milliseconds
        firstReleaseDate: recording['first-release-date'],
        disambiguation: recording.disambiguation,
        // External links for more info
        wikiUrl: getWikiUrl(recording.relations),
        // If recording has releases, fetch cover art from first release
        releaseId: recording.releases?.[0]?.id
    };
}

function parseArtist(artist) {
    return {
        id: artist.id,
        name: artist.name,
        type: artist.type, // Person, Group, etc.
        country: artist.country,
        founded: artist['life-span']?.begin,
        disbanded: artist['life-span']?.end,
        disambiguation: artist.disambiguation,
        wikiUrl: getWikiUrl(artist.relations),
        tags: artist.tags?.map(t => t.name) || []
    };
}

function parseRelease(release) {
    return {
        id: release.id,
        title: release.title,
        artist: release['artist-credit']?.[0]?.name || 'Unknown',
        releaseDate: release.date,
        country: release.country,
        packaging: release.packaging,
        mediaCount: release['media-track-count']?.[0],
        disambiguation: release.disambiguation,
        wikiUrl: getWikiUrl(release.relations),
        // Cover art ID for WikiCommons lookup
        coverArtUrl: getCoverArtUrl(release.id)
    };
}

function getWikiUrl(relations = []) {
    if (!Array.isArray(relations)) return null;
    const wiki = relations.find(r => r['target-type'] === 'url' && r.url?.resource?.includes('wikipedia'));
    return wiki?.url?.resource || null;
}

function getCoverArtUrl(releaseId) {
    if (!releaseId) return null;
    // MusicBrainz Cover Art Archive
    return `https://coverartarchive.org/release/${releaseId}/front`;
}

/**
 * Batch search for multiple recordings
 * Use sparingly due to rate limiting!
 * @param {Array<{title: string, artist: string}>} songs
 * @returns {Promise<Array>} Array of metadata
 */
export async function batchSearchRecordings(songs) {
    const results = [];
    for (const song of songs) {
        // Rate limiting: 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1100));
        const metadata = await searchRecording(song.title, song.artist);
        results.push(metadata);
    }
    return results;
}

/**
 * Cache helper - store metadata in localStorage
 */
export function cacheMetadata(key, data) {
    try {
        const cache = JSON.parse(localStorage.getItem('mb_metadata_cache') || '{}');
        cache[key] = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem('mb_metadata_cache', JSON.stringify(cache));
    } catch (e) {
        console.warn('Could not cache metadata:', e);
    }
}

export function getCachedMetadata(key, maxAge = 7 * 24 * 60 * 60 * 1000) {
    try {
        const cache = JSON.parse(localStorage.getItem('mb_metadata_cache') || '{}');
        if (cache[key] && Date.now() - cache[key].timestamp < maxAge) {
            return cache[key].data;
        }
    } catch (e) {
        console.warn('Could not read metadata cache:', e);
    }
    return null;
}
