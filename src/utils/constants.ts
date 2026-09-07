/**
 * Konstanta aplikasi. Nilai bisa dioverride via env (EXPO_PUBLIC_*).
 * Acuan env: https://docs.expo.dev/guides/environment-variables/
 */
export const ITUNES_BASE_URL =
  process.env.EXPO_PUBLIC_ITUNES_BASE_URL ?? 'https://itunes.apple.com';

export const PAGE_LIMIT = Number(process.env.EXPO_PUBLIC_PAGE_LIMIT ?? 25);

export const APP_ENV = process.env.EXPO_PUBLIC_ENV ?? 'dev';

export const SEARCH_ENDPOINT = '/search';
