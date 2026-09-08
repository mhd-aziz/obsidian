/**
 * Connectivity util tests — netinfo di-mock (Task 2.1).
 * Aturan: isConnected saja tidak cukup; isInternetReachable ikut dipertimbangkan.
 */
import { NetInfoState } from '@react-native-community/netinfo';
import { subscribeConnectivity } from '../utils/connectivity';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

const netinfo = require('@react-native-community/netinfo');
const addEventListener = netinfo.addEventListener as jest.Mock;
const fetchState = netinfo.fetch as jest.Mock;

function makeState(overrides: Partial<NetInfoState>): NetInfoState {
  return {
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
    ...overrides,
  } as unknown as NetInfoState;
}

describe('subscribeConnectivity', () => {
  beforeEach(() => {
    // Default: fetch() mengembalikan state online agar test lama tidak pecah;
    // test yang butuh state awal berbeda meng-override mock ini.
    fetchState.mockResolvedValue(makeState({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('mendaftarkan listener ke netinfo dan mengembalikan fungsi unsubscribe', () => {
    const unsubscribe = jest.fn();
    addEventListener.mockReturnValue(unsubscribe);

    const unsub = subscribeConnectivity(jest.fn());
    expect(addEventListener).toHaveBeenCalledTimes(1);
    expect(typeof unsub).toBe('function');

    unsub();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('online saat isConnected + isInternetReachable true', () => {
    const callback = jest.fn();
    addEventListener.mockImplementation((cb: (s: NetInfoState) => void) => {
      cb(makeState({ isConnected: true, isInternetReachable: true }));
      return jest.fn();
    });

    subscribeConnectivity(callback);
    expect(callback).toHaveBeenCalledWith(true);
  });

  it('online saat isInternetReachable null (belum diketahui, fallback isConnected)', () => {
    const callback = jest.fn();
    addEventListener.mockImplementation((cb: (s: NetInfoState) => void) => {
      cb(makeState({ isConnected: true, isInternetReachable: null }));
      return jest.fn();
    });

    subscribeConnectivity(callback);
    expect(callback).toHaveBeenCalledWith(true);
  });

  it('suspect offline via event listener + probe gagal → callback(false)', async () => {
    const callback = jest.fn();
    addEventListener.mockImplementation((cb: (s: NetInfoState) => void) => {
      cb(makeState({ isConnected: true, isInternetReachable: false }));
      return jest.fn();
    });
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

    subscribeConnectivity(callback);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(callback).toHaveBeenCalledWith(false);
  });

  it('offline saat isConnected false (airplane mode)', () => {
    const callback = jest.fn();
    addEventListener.mockImplementation((cb: (s: NetInfoState) => void) => {
      cb(makeState({ isConnected: false, isInternetReachable: false }));
      return jest.fn();
    });

    subscribeConnectivity(callback);
    expect(callback).toHaveBeenCalledWith(false);
  });

  it('memanggil NetInfo.fetch() untuk state awal (banner tidak nyangkut offline)', async () => {
    const callback = jest.fn();
    addEventListener.mockReturnValue(jest.fn());
    fetchState.mockResolvedValue(makeState({ isInternetReachable: true }));

    subscribeConnectivity(callback);
    // Biarkan microqueue jalan agar promise fetch resolve
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchState).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(true);
  });

  it('state awal suspect offline + probe gagal → callback(false) walau tidak ada event', async () => {
    const callback = jest.fn();
    addEventListener.mockReturnValue(jest.fn());
    fetchState.mockResolvedValue(makeState({ isInternetReachable: false }));
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

    subscribeConnectivity(callback);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(callback).toHaveBeenCalledWith(false);
  });

  describe('suspect offline (connected tapi isInternetReachable false) → probe HTTP', () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    async function flushAsync(): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    it('probe sukses (HTTP respons apa pun) → online', async () => {
      const callback = jest.fn();
      addEventListener.mockReturnValue(jest.fn());
      fetchState.mockResolvedValue(makeState({ isInternetReachable: false }));
      globalThis.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });

      subscribeConnectivity(callback);
      await flushAsync();

      expect(globalThis.fetch).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(true);
    });

    it('probe gagal (network error) → offline', async () => {
      const callback = jest.fn();
      addEventListener.mockReturnValue(jest.fn());
      fetchState.mockResolvedValue(makeState({ isInternetReachable: false }));
      globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

      subscribeConnectivity(callback);
      await flushAsync();

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('airplane mode → offline TANPA probe (fetch tidak dipanggil)', async () => {
      const callback = jest.fn();
      addEventListener.mockReturnValue(jest.fn());
      fetchState.mockResolvedValue(
        makeState({ isConnected: false, isInternetReachable: false })
      );
      globalThis.fetch = jest.fn();

      subscribeConnectivity(callback);
      await flushAsync();

      expect(globalThis.fetch).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(false);
    });

    it('isInternetReachable true → online TANPA probe', async () => {
      const callback = jest.fn();
      addEventListener.mockReturnValue(jest.fn());
      fetchState.mockResolvedValue(makeState({ isInternetReachable: true }));
      globalThis.fetch = jest.fn();

      subscribeConnectivity(callback);
      await flushAsync();

      expect(globalThis.fetch).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(true);
    });
  });
});
