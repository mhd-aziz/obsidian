import { Track } from './Track';

/** Response mentah iTunes Search API (lihat docs/API.md). */
export interface SearchResponse {
  resultCount: number;
  results: Track[];
}
