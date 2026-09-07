/**
 * playlistExporter.ts — fungsi murni: Track[] → teks playlist siap share.
 * Fitur "Uploading and emailing" (FEATURE-MAPPING.md #7).
 */
import { Track } from '../models/Track';

export function buildPlaylistText(tracks: Track[]): string {
  if (tracks.length === 0) return 'Obsidian Playlist\n(kosong)';

  const lines = tracks.map((t, i) => `${i + 1}. ${t.artistName} — ${t.trackName}`);
  return `Obsidian Playlist\n\n${lines.join('\n')}`;
}
