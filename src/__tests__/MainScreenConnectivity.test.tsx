/**
 * MainScreen wiring test — memastikan arah konektivitas BENAR:
 * subscribeConnectivity mengirim isOnline → MainScreen harus memanggil
 * setOffline dengan NILAI TERBALIK. Bug lama: setOffline dipakai langsung
 * sbg callback → banner tampil justru saat online (terbalik).
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MainScreen } from '../screens/MainScreen';

jest.mock('../viewmodels/MainViewModel', () => {
  // Mock hidup di scope factory (dibolehkan) lalu diekspor utk assertion.
  const setOffline = jest.fn();
  return {
    __setOffline: setOffline,
    useMainViewModel: () => ({
      uiState: {
        tracks: [],
        query: '',
        isLoading: false,
        isLoadingMore: false,
        isOffline: false,
        error: null,
        source: 'itunes',
      },
      search: jest.fn(),
      onQueryChange: jest.fn(),
      changeSource: jest.fn(),
      loadMore: jest.fn(),
      setOffline,
    }),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../utils/connectivity', () => ({
  subscribeConnectivity: jest.fn(() => jest.fn()),
}));

import { subscribeConnectivity } from '../utils/connectivity';
import * as mainViewModelModule from '../viewmodels/MainViewModel';

// __setOffline diekspor oleh mock factory (bukan modul asli) → akses via cast.
const __setOffline = (mainViewModelModule as unknown as { __setOffline: jest.Mock })
  .__setOffline;

describe('MainScreen connectivity wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('isOnline=true → setOffline(false); isOnline=false → setOffline(true)', () => {
    act(() => {
      TestRenderer.create(
        <MainScreen onOpenPlayer={jest.fn()} onOpenDiagnostics={jest.fn()} />
      );
    });

    // Callback terdaftar via useEffect → ambil dari mock.calls
    const calls = (subscribeConnectivity as jest.Mock).mock.calls;
    expect(calls).toHaveLength(1);
    const onConnectivity = calls[0][0] as (online: boolean) => void;

    // Netinfo ONLINE (true) → setOffline harus terpanggil DENGAN false
    act(() => {
      onConnectivity(true);
    });
    expect(__setOffline).toHaveBeenLastCalledWith(false);

    // Netinfo OFFLINE (false) → setOffline harus terpanggil DENGAN true
    act(() => {
      onConnectivity(false);
    });
    expect(__setOffline).toHaveBeenLastCalledWith(true);
  });
});
