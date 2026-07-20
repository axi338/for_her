/** Extract a Spotify track ID from a raw ID, URI, or open.spotify.com URL. */
export function parseSpotifyTrackId(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return '';

    const uriMatch = trimmed.match(/spotify:track:([a-zA-Z0-9]+)/);
    if (uriMatch) return uriMatch[1];

    const urlMatch = trimmed.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
    if (urlMatch) return urlMatch[1];

    if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) return trimmed;

    return trimmed;
}
