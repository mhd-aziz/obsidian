/**
 * Track — model data lagu (iTunes Search API / Audius API).
 * Field mengikuti kontrak API (lihat docs/API.md): snake_case, banyak yang nullable.
 * source: sumber data track — ditandai saat fetch (TrackRepository), dipakai UI
 * untuk badge "FULL" (Audius = full-length) dan dedupe lintas sumber.
 */
export type TrackSource = 'itunes' | 'audius';

/** ID track: number (iTunes trackId) atau string (Audius id). */
export type TrackId = number | string;

export interface Track {
  trackId: TrackId;
  trackName: string;
  artistName: string;
  collectionName: string | null;
  previewUrl: string | null;
  artworkUrl100: string | null;
  source: TrackSource;
}

/** Artwork upscale 100x100 → 200x200 (replace suffix), null-safe. */
export function getArtworkUrl200(track: Track): string | null {
  if (!track.artworkUrl100) return null;
  return track.artworkUrl100.replace(/\/100x100bb\.(jpg|png)$/, '/200x200bb.$1');
}
