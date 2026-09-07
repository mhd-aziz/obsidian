/**
 * iTunes HTTP client — fetch murni, tanpa state (layer API di MVVM).
 * Semua failure dinormalisasi → AppError (global handling, utils/errors.ts).
 */
import { ITUNES_BASE_URL, SEARCH_ENDPOINT } from '../utils/constants';
import { SearchResponse } from '../models/SearchResponse';
import { AppError, withErrorHandling } from '../utils/errors';

export interface SearchParams {
  term: string;
  limit?: number;
  offset?: number;
}

/** Validasi bentuk response iTunes sebelum dipakai layer atas. */
function parseSearchResponse(data: unknown): SearchResponse {
  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as SearchResponse).results)
  ) {
    throw new AppError('PARSE_ERROR', 'Data dari server tidak valid.', data);
  }
  return data as SearchResponse;
}

export async function itunesSearch({
  term,
  limit = 25,
  offset = 0,
}: SearchParams): Promise<SearchResponse> {
  return withErrorHandling(async () => {
    const url =
      `${ITUNES_BASE_URL}${SEARCH_ENDPOINT}` +
      `?term=${encodeURIComponent(term)}&entity=song&limit=${limit}&offset=${offset}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new AppError('HTTP_ERROR', `iTunes API error: HTTP ${response.status}`);
    }

    return parseSearchResponse(await response.json());
  }, 'itunesSearch');
}
