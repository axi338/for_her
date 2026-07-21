# MusicBrainz Integration Guide

## Integration instructions for script.js

To use MusicBrainz enrichment, add this to your existing script.js:

### 1. Import at the top of script.js:
```javascript
import { enrichSongsWithMusicBrainz } from './lib/musicEnrichment.js';
```

### 2. In the DOMContentLoaded event, after initMusicPlayer():
```javascript
enrichSongsWithMusicBrainz().catch(err => 
    console.error('Failed to enrich songs:', err)
);
```

### 3. The function will:
- Search MusicBrainz for each song (with 1.1s delay between requests)
- Cache results in localStorage for 7 days
- Enhance SONG_LIST with: musicbrainzId, duration, releaseDate, wikiUrl, coverArtUrl
- Fall back gracefully if API is unavailable

## Features Unlocked with MusicBrainz

### 1. Artist Information
- Country of origin
- Type (Person, Group, Orchestra)
- Founded/disbanded dates
- Wikipedia link
- Genre tags

### 2. Recording Details
- Official duration (verify your local file length)
- First release date
- Disambiguation (if multiple recordings with same name)
- MusicBrainz ID (unique identifier)

### 3. Album/Release Info
- Release date
- Country of release
- Packaging type
- Cover art (from Cover Art Archive)

### 4. Caching
- All metadata cached in localStorage
- 7-day cache expiry (configurable)
- Reduces API calls on repeat visits

### 5. Rate Limiting
- 1.1 second delay between requests (MusicBrainz limit: 1 req/sec)
- Respects User-Agent header requirement
- Graceful fallback if API unavailable

## No API Key Required!

MusicBrainz is a free, open music database. No authentication or API key needed.

## Example Output

When you load the app, check the browser console:
```
🎵 Enriching songs with MusicBrainz metadata...
✓ Konna Netlaka by Fairuz
✓ Wahdon by Fairuz
...
✅ Enrichment complete: 10/10 songs enhanced
```

## Available Metadata

Each song object gets enriched with:
```javascript
{
  title: "Konna Netlaka",
  artist: "Fairuz",
  // ... original properties ...
  
  // NEW from MusicBrainz:
  musicbrainzId: "abc123...",
  duration: 184000,  // milliseconds
  releaseDate: "1964",
  wikiUrl: "https://en.wikipedia.org/wiki/Fairuz",
  coverArtUrl: "https://coverartarchive.org/release/xyz/front"
}
```
