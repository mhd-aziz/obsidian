/**
 * Konstanta aplikasi. Nilai bisa dioverride via env (EXPO_PUBLIC_*).
 * Acuan env: https://docs.expo.dev/guides/environment-variables/
 */
export const ITUNES_BASE_URL =
  process.env.EXPO_PUBLIC_ITUNES_BASE_URL ?? 'https://itunes.apple.com';

export const PAGE_LIMIT = Number(process.env.EXPO_PUBLIC_PAGE_LIMIT ?? 25);

export const APP_ENV = process.env.EXPO_PUBLIC_ENV ?? 'dev';

export const SEARCH_ENDPOINT = '/search';

/** Jeda debounce TextInput sebelum search terkirim (ms). */
export const SEARCH_DEBOUNCE_MS = Number(
  process.env.EXPO_PUBLIC_SEARCH_DEBOUNCE_MS ?? 450
);

// Audius — sumber data kedua (full-length song, indie artists).
// Discovery endpoint mengembalikan daftar host (dipakai yang pertama + cache).
export const AUDIUS_DISCOVERY_URL =
  process.env.EXPO_PUBLIC_AUDIUS_DISCOVERY_URL ?? 'https://api.audius.co';
export const AUDIUS_APP_NAME =
  process.env.EXPO_PUBLIC_AUDIUS_APP_NAME ?? 'obsidian';
export const AUDIUS_SEARCH_PATH = '/v1/tracks/search';
/** Base path track Audius — stream URL final: {base}/{id}/stream. */
export const AUDIUS_TRACKS_BASE_PATH = '/v1/tracks';
