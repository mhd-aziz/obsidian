/**
 * MainViewModel — hook ViewModel untuk MainScreen (MVVM).
 * UI-free (tanpa import React Native components) agar bisa di-unit-test.
 * Error handling via AppError global (utils/errors.ts).
 * Dua sumber data (Task 5.4): iTunes (preview 30 dtk) ↔ Audius (full-length).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Track, TrackSource } from '../models/Track';
import { searchTracks } from '../repositories/TrackRepository';
import { AppError, withErrorHandling } from '../utils/errors';
import { PAGE_LIMIT, SEARCH_DEBOUNCE_MS } from '../utils/constants';

export interface MainUiState {
  tracks: Track[];
  query: string;
  isLoading: boolean;
  isLoadingMore: boolean;
  isOffline: boolean;
  error: string | null;
  source: TrackSource;
}

export function useMainViewModel() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<TrackSource>('itunes');
  const offsetRef = useRef(0);
  const queryRef = useRef('');
  // Sumber aktif di ref agar loadMore (callback stabil) selalu memakai nilai
  // terbaru tanpa perlu masuk dependency array.
  const sourceRef = useRef<TrackSource>('itunes');
  // Guard anti double-fetch: isLoading tidak cukup karena loadMore tidak
  // men-set-nya; pakai ref in-flight (tidak trigger re-render).
  const loadMoreInFlightRef = useRef(false);
  // Guard stale response: search/changeSource menaikkan seq; respons request
  // dengan seq lama (mis. lambat) dibuang — tidak menimpa hasil sumber baru.
  const searchSeqRef = useRef(0);
  // Guard akhir-daftar: halaman dengan hasil < PAGE_LIMIT = halaman terakhir;
  // loadMore berikutnya di-skip (hindari fetch halaman kosong berulang).
  const hasMoreRef = useRef(true);
  // Debounce TextInput: setiap ketikan TIDAK langsung mem-fetch (flood API);
  // request hanya setelah user berhenti mengetik SEARCH_DEBOUNCE_MS.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingDebounce = useCallback(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const applyResults = useCallback((seq: number, results: Track[]) => {
    if (seq !== searchSeqRef.current) return; // stale → buang
    // Dedupe: satu response bisa berisi trackId yang sama (remaster/versi beda
    // platform), masing-masing menghasilkan FlatList key duplikat.
    const seen = new Set<Track['trackId']>();
    setTracks(results.filter((t) => (seen.has(t.trackId) ? false : seen.add(t.trackId))));
  }, []);

  const search = useCallback(async (term: string) => {
    cancelPendingDebounce();
    setQuery(term);
    queryRef.current = term;
    offsetRef.current = 0;
    hasMoreRef.current = true; // query baru → daftar dianggap punya halaman lanjut
    const seq = ++searchSeqRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const results = await withErrorHandling(
        () => searchTracks(term, 0, PAGE_LIMIT, sourceRef.current),
        'MainViewModel.search'
      );
      applyResults(seq, results);
    } catch (e) {
      if (seq !== searchSeqRef.current) return; // stale error → abaikan
      setError(e instanceof AppError ? e.userMessage : 'Terjadi kesalahan. Coba lagi.');
      setTracks([]);
    } finally {
      if (seq === searchSeqRef.current) setIsLoading(false);
    }
  }, [applyResults, cancelPendingDebounce]);

  /**
   * Handler TextInput (dipanggil tiap ketikan) — debounced search.
   * Input kosong: query direset & debounce dibatalkan, tanpa fetch.
   */
  const onQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      queryRef.current = text; // ref ikut sync agar changeSource tidak pakai query lama
      cancelPendingDebounce();
      if (!text.trim()) return;
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void search(text);
      }, SEARCH_DEBOUNCE_MS);
    },
    [cancelPendingDebounce, search]
  );

  /** Ganti sumber data; query aktif dimuat ulang dari sumber baru (offset 0). */
  const changeSource = useCallback(async (next: TrackSource) => {
    if (next === sourceRef.current) return; // sumber sama → tanpa fetch ulang
    sourceRef.current = next;
    setSource(next);
    if (!queryRef.current.trim()) return; // belum ada pencarian → cukup ganti
    await search(queryRef.current);
  }, [search]);

  /** Bersihkan debounce saat screen unmount (tanpa fetch menggantung). */
  useEffect(() => cancelPendingDebounce, [cancelPendingDebounce]);

  /** Lazy loading: append halaman berikutnya saat scroll mendekati akhir. */
  const loadMore = useCallback(async () => {
    const term = queryRef.current;
    if (
      !term ||
      isLoading ||
      loadMoreInFlightRef.current ||
      !hasMoreRef.current // semua hasil sudah dimuat → jangan fetch halaman kosong
    ) {
      return;
    }
    loadMoreInFlightRef.current = true;
    setIsLoadingMore(true);
    const offset = offsetRef.current + PAGE_LIMIT;
    const seq = searchSeqRef.current;
    try {
      const results = await withErrorHandling(
        () => searchTracks(term, offset, PAGE_LIMIT, sourceRef.current),
        'MainViewModel.loadMore'
      );
      if (seq !== searchSeqRef.current) return; // stale: search/ganti sumber terjadi → buang
      // Halaman terakhir (hasil < PAGE_LIMIT) → stop lazy loading.
      if (results.length < PAGE_LIMIT) hasMoreRef.current = false;
      offsetRef.current = offset;
      // Dedupe by trackId: iTunes results can overlap across pages (same track
      // at a page boundary), which would produce duplicate FlatList keys.
      setTracks((prev) => {
        const seen = new Set(prev.map((t) => t.trackId));
        const fresh = results.filter((t) => !seen.has(t.trackId));
        return [...prev, ...fresh];
      });
    } catch {
      // append gagal: state lama dipertahankan, user bisa scroll lagi untuk retry
    } finally {
      loadMoreInFlightRef.current = false;
      setIsLoadingMore(false);
    }
  }, [isLoading]);

  return {
    uiState: {
      tracks,
      query,
      isLoading,
      isLoadingMore,
      isOffline,
      error,
      source,
    } satisfies MainUiState,
    search,
    onQueryChange,
    changeSource,
    loadMore,
    setOffline: setIsOffline,
  };
}
