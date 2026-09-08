/**
 * MainViewModel source-toggle tests — iTunes ↔ Audius (Task 5.4, TDD).
 * Fokus: perpindahan sumber memuat ulang query aktif, guard respons stale,
 * dan loadMore memakai sumber aktif.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useMainViewModel } from '../viewmodels/MainViewModel';
import { Track } from '../models/Track';
import { AudiusTrackRaw } from '../models/AudiusTrack';
import { resetAudiusHostCache } from '../api/audiusClient';

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
    source: 'itunes',
  };
}

const rawTrack: AudiusTrackRaw = {
  id: 'AUD1',
  title: 'Lagu Utuh',
  duration: 210,
  genre: 'House',
  is_streamable: true,
  is_delete: false,
  user: { name: 'Anoigma' },
  artwork: { '480x480': 'https://cdn.example/480.jpg' },
};

describe('MainViewModel source toggle', () => {
  const originalFetch = globalThis.fetch;
  let renderer: TestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    globalThis.fetch = jest.fn();
    resetAudiusHostCache();
  });

  afterEach(() => {
    act(() => {
      renderer?.unmount();
    });
    renderer = null;
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
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
    return { get current(): ViewModel { return result.current!; } };
  }

  it('state awal: source = itunes', () => {
    const vm = renderViewModel();
    expect(vm.current.uiState.source).toBe('itunes');
  });

  it('changeSource mengubah sumber & memuat ulang query aktif dari Audius', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ resultCount: 1, results: [makeTrack(1)] }))
      .mockResolvedValueOnce(jsonResponse({ data: ['https://discovery-audius.test'] }))
      .mockResolvedValueOnce(jsonResponse({ data: [rawTrack] }));
    const vm = renderViewModel();

    await act(async () => {
      await vm.current.search('love');
    });
    expect(vm.current.uiState.tracks[0].trackId).toBe(1);

    await act(async () => {
      await vm.current.changeSource('audius');
    });

    expect(vm.current.uiState.source).toBe('audius');
    expect(vm.current.uiState.tracks).toHaveLength(1);
    expect(vm.current.uiState.tracks[0].trackId).toBe('AUD1');
    expect(vm.current.uiState.tracks[0].source).toBe('audius');

    // Call ke-2 = discovery, call ke-3 = search Audius dengan query aktif
    const searchUrl = (globalThis.fetch as jest.Mock).mock.calls[2][0] as string;
    expect(searchUrl).toContain('/v1/tracks/search');
    expect(searchUrl).toContain('query=love');
    expect(searchUrl).toContain('offset=0');
  });

  it('respons lambat dari sumber lama TIDAK menimpa hasil sumber baru (stale guard)', async () => {
    let resolveItunes!: (v: Response) => void;
    (globalThis.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise<Response>((resolve) => { resolveItunes = resolve; })
    );
    const vm = renderViewModel();

    // Search iTunes digantung (jangan di-await sampai akhir)
    let pendingSearch!: Promise<void>;
    act(() => {
      pendingSearch = vm.current.search('love');
    });

    // Pindah ke Audius saat request iTunes masih berjalan
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ data: ['https://discovery-audius.test'] }))
      .mockResolvedValueOnce(jsonResponse({ data: [rawTrack] }));
    await act(async () => {
      await vm.current.changeSource('audius');
    });
    expect(vm.current.uiState.tracks[0].trackId).toBe('AUD1');

    // Respons iTunes yang terlambat tiba → harus dibuang, bukan menimpa Audius
    await act(async () => {
      resolveItunes(jsonResponse({ resultCount: 1, results: [makeTrack(99)] }));
      await pendingSearch;
    });

    expect(vm.current.uiState.tracks.map((t) => t.trackId)).toEqual(['AUD1']);
    expect(vm.current.uiState.error).toBeNull();
  });

  it('changeSource dengan query kosong tidak mem-fetch (hanya ganti sumber)', async () => {
    const vm = renderViewModel();
    await act(async () => {
      await vm.current.changeSource('audius');
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(vm.current.uiState.source).toBe('audius');
  });

  it('loadMore setelah toggle memakai sumber aktif (Audius) dengan offset lanjutan', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ resultCount: 1, results: [makeTrack(1)] }))
      .mockResolvedValueOnce(jsonResponse({ data: ['https://discovery-audius.test'] }))
      .mockResolvedValueOnce(jsonResponse({ data: [rawTrack] }))
      .mockResolvedValueOnce(jsonResponse({ data: [{ ...rawTrack, id: 'AUD2' }] }));
    const vm = renderViewModel();

    await act(async () => {
      await vm.current.search('love');
    });
    await act(async () => {
      await vm.current.changeSource('audius');
    });
    await act(async () => {
      await vm.current.loadMore();
    });

    // Host sudah ter-cache dari changeSource → loadMore = 1 fetch langsung search
    const loadMoreUrl = (globalThis.fetch as jest.Mock).mock.calls[3][0] as string;
    expect(loadMoreUrl).toContain('/v1/tracks/search');
    expect(loadMoreUrl).toContain('offset=25');
    expect(vm.current.uiState.tracks.map((t) => t.trackId)).toEqual(['AUD1', 'AUD2']);
  });

  it('changeSource ke sumber yang sama tidak mem-fetch ulang', async () => {
    const vm = renderViewModel();
    await act(async () => {
      await vm.current.search('love');
    });
    const callsBefore = (globalThis.fetch as jest.Mock).mock.calls.length;
    await act(async () => {
      await vm.current.changeSource('itunes');
    });
    expect((globalThis.fetch as jest.Mock).mock.calls.length).toBe(callsBefore);
  });
});
