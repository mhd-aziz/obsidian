/**
 * TrackRepository — SATU-SATUNYA pemanggil API yang boleh dipakai ViewModel
 * (aturan arsitektur ARCHITECTURE.md §4.1).
 */
import { itunesSearch } from '../api/itunesClient';
import { Track } from '../models/Track';
import { PAGE_LIMIT } from '../utils/constants';

export async function searchTracks(
  term: string,
  offset = 0,
  limit: number = PAGE_LIMIT
): Promise<Track[]> {
  const response = await itunesSearch({ term, limit, offset });
  return response.results;
}
