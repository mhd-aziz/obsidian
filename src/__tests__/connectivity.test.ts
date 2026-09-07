/**
 * Connectivity util tests — netinfo di-mock (Task 2.1).
 * Aturan: isConnected saja tidak cukup; isInternetReachable ikut dipertimbangkan.
 */
import { NetInfoState } from '@react-native-community/netinfo';
import { subscribeConnectivity } from '../utils/connectivity';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
}));

const addEventListener = require('@react-native-community/netinfo')
  .addEventListener as jest.Mock;

function makeState(overrides: Partial<NetInfoState>): NetInfoState {
  return {
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
    ...overrides,
  } as unknown as NetInfoState;
}

describe('subscribeConnectivity', () => {
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

  it('offline saat isInternetReachable false (wifi tersambung tapi tanpa internet)', () => {
    const callback = jest.fn();
    addEventListener.mockImplementation((cb: (s: NetInfoState) => void) => {
      cb(makeState({ isConnected: true, isInternetReachable: false }));
      return jest.fn();
    });

    subscribeConnectivity(callback);
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
});
