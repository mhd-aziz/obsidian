/**
 * MainViewModel — hook ViewModel untuk MainScreen (MVVM).
 * UI-free (tanpa import React Native components) agar bisa di-unit-test.
 * Error handling via AppError global (utils/errors.ts).
 */
import { useCallback, useRef, useState } from 'react';
import { Track } from '../models/Track';
import { searchTracks } from '../repositories/TrackRepository';
import { AppError, withErrorHandling } from '../utils/errors';

export interface MainUiState {
  tracks: Track[];
  query: string;
  isLoading: boolean;
  isOffline: boolean;
  error: string | null;
}

export function useMainViewModel() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const queryRef = useRef('');
  // Guard anti double-fetch: isLoading tidak cukup karena loadMore tidak
  // men-set-nya; pakai ref in-flight (tidak trigger re-render).
  const loadMoreInFlightRef = useRef(false);

  const search = useCallback(async (term: string) => {
    setQuery(term);
    queryRef.current = term;
    offsetRef.current = 0;
    setIsLoading(true);
    setError(null);
    try {
      const results = await withErrorHandling(() => searchTracks(term, 0), 'MainViewModel.search');
      setTracks(results);
    } catch (e) {
      setError(e instanceof AppError ? e.userMessage : 'Terjadi kesalahan. Coba lagi.');
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Lazy loading: append halaman berikutnya saat scroll mendekati akhir. */
  const loadMore = useCallback(async () => {
    const term = queryRef.current;
    if (!term || isLoading || loadMoreInFlightRef.current) return;
    loadMoreInFlightRef.current = true;
    const offset = offsetRef.current + 25;
    try {
      const results = await withErrorHandling(
        () => searchTracks(term, offset),
        'MainViewModel.loadMore'
      );
      offsetRef.current = offset;
      setTracks((prev) => [...prev, ...results]);
    } catch {
      // append gagal: state lama dipertahankan, user bisa scroll lagi untuk retry
    } finally {
      loadMoreInFlightRef.current = false;
    }
  }, [isLoading]);

  return {
    uiState: { tracks, query, isLoading, isOffline, error } satisfies MainUiState,
    search,
    loadMore,
    setOffline: setIsOffline,
  };
}
