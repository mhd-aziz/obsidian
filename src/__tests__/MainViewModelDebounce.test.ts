/**
 * MainViewModel debounce tests — TextInput jangan flood API per ketikan.
 * onQueryChange = debounced (450ms); search = immediate (pull-to-refresh).
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
    source: 'itunes',
  };
}

describe('MainViewModel onQueryChange debounce', () => {
  const originalFetch = globalThis.fetch;
  let renderer: TestRenderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    jest.useFakeTimers();
    globalThis.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ resultCount: 1, results: [makeTrack(1)] })
    );
  });

  afterEach(() => {
    act(() => {
      renderer?.unmount();
    });
    renderer = null;
    jest.useRealTimers();
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

  it('onQueryChange tidak langsung mem-fetch; fetch setelah 450ms', async () => {
    const vm = renderViewModel();
    act(() => {
      vm.current.onQueryChange('love');
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(450);
    });
    await act(async () => {}); // flush promise search

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('term=love');
    expect(vm.current.uiState.query).toBe('love');
  });

  it('ketikan beruntun: hanya ketikan terakhir yang di-fetch (satu request)', async () => {
    const vm = renderViewModel();
    act(() => {
      vm.current.onQueryChange('ind');
      jest.advanceTimersByTime(200);
      vm.current.onQueryChange('indo');
      jest.advanceTimersByTime(200);
      vm.current.onQueryChange('indonesia');
      jest.advanceTimersByTime(450);
    });
    await act(async () => {});

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('term=indonesia');
  });

  it('search() immediate membatalkan debounce yang tertunda', async () => {
    const vm = renderViewModel();
    act(() => {
      vm.current.onQueryChange('love');
      jest.advanceTimersByTime(100); // debounce masih tertunda
    });
    await act(async () => {
      await vm.current.search('pop'); // pull-to-refresh langsung
    });
    act(() => {
      jest.advanceTimersByTime(450); // debounce lama tidak boleh menyala
    });
    await act(async () => {});

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const url = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('term=pop');
  });

  it('input dikosongkan → debounce dibatalkan, tidak ada fetch', async () => {
    const vm = renderViewModel();
    act(() => {
      vm.current.onQueryChange('love');
      jest.advanceTimersByTime(100);
      vm.current.onQueryChange('');
      jest.advanceTimersByTime(450);
    });
    await act(async () => {});

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(vm.current.uiState.query).toBe('');
  });
});
