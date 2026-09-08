/**
 * TrackRepository — SATU-SATUNYA pemanggil API yang boleh dipakai ViewModel
 * (aturan arsitektur ARCHITECTURE.md §4.1). Routing sumber data ada di sini.
 */
import { itunesSearch } from '../api/itunesClient';
import { audiusSearch } from '../api/audiusClient';
import { Track, TrackSource } from '../models/Track';
import { PAGE_LIMIT } from '../utils/constants';

export async function searchTracks(
  term: string,
  offset = 0,
  limit: number = PAGE_LIMIT,
  source: TrackSource = 'itunes'
): Promise<Track[]> {
  if (source === 'audius') {
    return audiusSearch({ term, limit, offset });
  }
  const response = await itunesSearch({ term, limit, offset });
  // Tandai sumber di boundary repository agar UI bisa membedakan (badge FULL).
  return response.results.map((track) => ({ ...track, source: 'itunes' as const }));
}
