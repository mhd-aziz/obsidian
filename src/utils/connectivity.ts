/**
 * connectivity.ts — util murni di atas netinfo (UI-free, testable).
 * Return unsubscribe function (pola subscribe).
 */
import * as NetInfo from '@react-native-community/netinfo';

export type ConnectivityCallback = (isOnline: boolean) => void;

export function subscribeConnectivity(callback: ConnectivityCallback): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    // isConnected true belum tentu ada internet; cek isInternetReachable bila tersedia
    const online =
      state.isConnected === true &&
      (state.isInternetReachable === null || state.isInternetReachable === true);
    callback(online);
  });
  return unsubscribe;
}
