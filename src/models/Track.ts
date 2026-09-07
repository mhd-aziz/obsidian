/**
 * Track — model data lagu dari iTunes Search API.
 * Field mengikuti kontrak API (lihat docs/API.md): snake_case, banyak yang nullable.
 */
export interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string | null;
  previewUrl: string | null;
  artworkUrl100: string | null;
}

/** Artwork upscale 100x100 → 200x200 (replace suffix), null-safe. */
export function getArtworkUrl200(track: Track): string | null {
  if (!track.artworkUrl100) return null;
  return track.artworkUrl100.replace(/\/100x100bb\.(jpg|png)$/, '/200x200bb.$1');
}
