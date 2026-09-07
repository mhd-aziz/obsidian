/**
 * MainViewModel tests — pagination + search logic dengan fetch di-mock
 * (Task 1.3, CONVENTIONS.md: logika pagination wajib test).
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useMainViewModel } from '../viewmodels/MainViewModel';
import { Track } from '../models/Track';

type ViewModel = ReturnType<typeof useMainViewModel>;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

function makeTrack(id: number): Track {
  return {
    trackId: id,
    trackName: `Song ${id}`,
    artistName: 'Artist',
    collectionName: null,
    previewUrl: null,
    artworkUrl100: null,
  };
}

describe('MainViewModel', () => {
  const originalFetch = globalThis.fetch;
  let renderer: TestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    act(() => {
      renderer?.unmount();
    });
    renderer = null;
    globalThis.fetch = originalFetch;
  });

  function renderViewModel(): { current: ViewModel } {
    const result: { current: ViewModel | null } = { current: null };
    function Dummy() {
      result.current = useMainViewModel();
      return null;
    }
    let rendered: TestRenderer.ReactTestRenderer | null = null;
    act(() => {
      rendered = TestRenderer.create(React.createElement(Dummy));
    });
    renderer = rendered;
    // React 19 concurrent: render baru terjadi di dalam act()
    return { get current(): ViewModel { return result.current!; } };
  }

  it('state awal: tracks kosong, tidak loading, tidak offline', () => {
    const vm = renderViewModel();
    expect(vm.current.uiState.tracks).toEqual([]);
    expect(vm.current.uiState.isLoading).toBe(false);
    expect(vm.current.uiState.isOffline).toBe(false);
    expect(vm.current.uiState.error).toBeNull();
  });

  it('search() memuat halaman pertama (offset=0) dan set query', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ resultCount: 1, results: [makeTrack(1)] })
    );
    const vm = renderViewModel();

    await act(async () => {
      await vm.current.search('indonesia');
    });

    expect(vm.current.uiState.query).toBe('indonesia');
    expect(vm.current.uiState.tracks).toHaveLength(1);
    expect(vm.current.uiState.tracks[0].trackId).toBe(1);
    expect(vm.current.uiState.isLoading).toBe(false);

    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('offset=0');
  });

  it('loadMore() meng-append halaman berikutnya (offset=25)', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(
        jsonResponse({ resultCount: 2, results: [makeTrack(1), makeTrack(2)] })
      )
      .mockResolvedValueOnce(
        jsonResponse({ resultCount: 1, results: [makeTrack(3)] })
      );
    const vm = renderViewModel();

    await act(async () => {
      await vm.current.search('indonesia');
    });
    await act(async () => {
      await vm.current.loadMore();
    });

    expect(vm.current.uiState.tracks.map((t) => t.trackId)).toEqual([1, 2, 3]);
    const urls = (globalThis.fetch as jest.Mock).mock.calls.map(
      (c) => c[0] as string
    );
    expect(urls[1]).toContain('offset=25');
  });

  it('loadMore() diabaikan saat sedang loading (guard anti double-fetch)', async () => {
    // Request loadMore pertama ditahan (deferred) agar kita bisa menguji guard
    let resolveLoadMore!: (v: Response) => void;
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(
        jsonResponse({ resultCount: 1, results: [makeTrack(1)] })
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveLoadMore = resolve;
          })
      );
    const vm = renderViewModel();

    await act(async () => {
      await vm.current.search('indonesia');
    });

    let pending: Promise<void> | undefined;
    act(() => {
      pending = vm.current.loadMore();
    });
    // loadMore kedua saat request pertama masih pending → harus di-skip
    await act(async () => {
      await vm.current.loadMore();
    });

    // HANYA 2 panggilan fetch: search + loadMore pertama. loadMore kedua skip.
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(vm.current.uiState.tracks.map((t) => t.trackId)).toEqual([1]);

    // Lepaskan request tertahan agar test tidak menggantung
    await act(async () => {
      resolveLoadMore(jsonResponse({ resultCount: 0, results: [] }));
      await pending;
    });
  });

  it('search() gagal → error tampil, tracks dikosongkan', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(jsonResponse({}, 500));
    const vm = renderViewModel();

    await act(async () => {
      await vm.current.search('indonesia');
    });

    expect(vm.current.uiState.error).toContain('Server');
    expect(vm.current.uiState.tracks).toEqual([]);
  });
});
