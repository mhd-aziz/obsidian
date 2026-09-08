/**
 * connectivity.ts — util murni di atas netinfo (UI-free, testable).
 * Return unsubscribe function (pola subscribe).
 *
 * Catatan Android: OS connectivity check (captive portal probe ke
 * gstatic.com) sering gagal di ISP Indonesia (DNS hijack/blokir) sehingga
 * netinfo melaporkan isInternetReachable=false PADAHAL internet jalan —
 * WiFi pun dapat ikon "!" di status bar. Karena itu status "suspect
 * offline" (connected tapi unreachable) diverifikasi dengan probe HTTP
 * ke host aktual yang dipakai app.
 */
import * as NetInfo from '@react-native-community/netinfo';
import { ITUNES_BASE_URL } from './constants';

export type ConnectivityCallback = (isOnline: boolean) => void;

function evaluate(state: NetInfo.NetInfoState): boolean {
  // isConnected true belum tentu ada internet; cek isInternetReachable bila tersedia
  return (
    state.isConnected === true &&
    (state.isInternetReachable === null || state.isInternetReachable === true)
  );
}

/**
 * Probe ringan ke API yang benar-benar dipakai app. Respons APAPAUN
 * (termasuk HTTP 4xx/5xx) membuktikan jaringan sampai tujuan → online.
 * Pakai GET search limit=1: HTTP HEAD terbukti tidak reliable di RN Android
 * (beberapa edge menolak/mereset HEAD), sedangkan GET inilah request yang
 * sesungguhnya dipakai app. Timeout 5 dtk agar probe tidak menggantung.
 */
async function probeInternet(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(`${ITUNES_BASE_URL}/search?term=probe&limit=1&entity=song`, {
      method: 'GET',
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

function handleState(state: NetInfo.NetInfoState, callback: ConnectivityCallback): void {
  if (evaluate(state)) {
    callback(true);
    return;
  }
  if (state.isConnected === false) {
    // Benar-benar tak ada interface (airplane mode) → offline tanpa probe.
    callback(false);
    return;
  }
  // Suspect offline: interface ada tapi OS bilang unreachable — OS bisa
  // salah (captive check gagal). Verifikasi sendiri sebelum klaim offline.
  void probeInternet().then((reachable) => callback(reachable));
}

export function subscribeConnectivity(callback: ConnectivityCallback): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    handleState(state, callback);
  });
  // State awal TIDAK selalu terkirim benar via addEventListener di Android
  // (isInternetReachable bisa false saat warm-up lalu tidak ada event lagi →
  // banner offline "nyangkut"). Fetch eksplisit menjamin state awal akurat.
  NetInfo.fetch()
    .then((state) => handleState(state, callback))
    .catch(() => {
      // fetch gagal (jarang): biarkan event listener yang mengoreksi nanti
    });
  return unsubscribe;
}
