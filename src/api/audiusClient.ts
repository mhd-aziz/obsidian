/**
 * Audius HTTP client — fetch murni, tanpa state (layer API di MVVM).
 * Alur: host discovery (api.audius.co) → GET /v1/tracks/search di host pertama.
 * Semua failure dinormalisasi → AppError (global handling, utils/errors.ts).
 * Kontrak API: https://docs.audius.org/api/
 */
import {
  AUDIUS_DISCOVERY_URL,
  AUDIUS_APP_NAME,
  AUDIUS_SEARCH_PATH,
} from '../utils/constants';
import { AudiusTrackRaw, toTrack } from '../models/AudiusTrack';
import { Track } from '../models/Track';
import { AppError, withErrorHandling, USER_MESSAGES } from '../utils/errors';

export interface AudiusSearchParams {
  term: string;
  limit?: number;
  offset?: number;
}

/** Batas waktu request (ms) — override via EXPO_PUBLIC_REQUEST_TIMEOUT_MS. */
const REQUEST_TIMEOUT_MS = Number(
  process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS ?? 10000
);

/** Cache host discovery per sesi app (hindari discovery berulang tiap search). */
let cachedHost: string | null = null;

/** Reset cache host — untuk test isolation. */
export function resetAudiusHostCache(): void {
  cachedHost = null;
}

/** Fetch JSON + timeout (AbortController), status >= 400 → AppError. */
async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new AppError(
        'HTTP_ERROR',
        USER_MESSAGES.HTTP_ERROR,
        `Audius API error: HTTP ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    // Abort dari timeout dinormalisasi → NETWORK_TIMEOUT (bukan UNKNOWN).
    if (controller.signal.aborted) {
      throw new AppError('NETWORK_TIMEOUT', USER_MESSAGES.NETWORK_TIMEOUT);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Normalisasi host discovery: buang trailing slash, tambahkan https:// bila
 * host datang tanpa skema (mencegah URL relatif rusak di search/stream).
 */
function normalizeHost(host: string): string {
  const trimmed = host.trim().replace(/\/+$/, '');
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Validasi bentuk discovery response: { data: string[] } tidak kosong. */
function parseDiscoveryHosts(data: unknown): string[] {
  const list = (data as { data?: unknown } | null)?.data;
  if (
    !Array.isArray(list) ||
    list.length === 0 ||
    list.some((host) => typeof host !== 'string' || host.trim().length === 0)
  ) {
    throw new AppError('PARSE_ERROR', USER_MESSAGES.PARSE_ERROR, data);
  }
  return (list as string[]).map(normalizeHost);
}

/** Validasi bentuk search response: { data: TrackRaw[] }; item rusak dibuang. */
function parseTrackRaws(data: unknown): AudiusTrackRaw[] {
  const list = (data as { data?: unknown } | null)?.data;
  if (!Array.isArray(list)) {
    throw new AppError('PARSE_ERROR', USER_MESSAGES.PARSE_ERROR, data);
  }
  return (list as unknown[]).filter((item): item is AudiusTrackRaw => {
    if (typeof item !== 'object' || item === null) return false;
    const id = (item as AudiusTrackRaw).id;
    return typeof id === 'string' && id.length > 0;
  });
}

async function resolveHost(): Promise<string> {
  if (cachedHost) return cachedHost;
  const hosts = parseDiscoveryHosts(await fetchJson(AUDIUS_DISCOVERY_URL));
  // Reassign ke konstanta lokal: TS tidak menyempitkan tipe variabel modul
  // (`cachedHost`) di dalam fungsi setelah assignment.
  const host: string = hosts[0];
  cachedHost = host;
  return host;
}

export async function audiusSearch({
  term,
  limit = 25,
  offset = 0,
}: AudiusSearchParams): Promise<Track[]> {
  return withErrorHandling(async () => {
    const host = await resolveHost();
    const url =
      `${host}${AUDIUS_SEARCH_PATH}` +
      `?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}` +
      `&query=${encodeURIComponent(term)}&limit=${limit}&offset=${offset}`;

    const raws = parseTrackRaws(await fetchJson(url));
    // Hanya track yang benar-benar bisa diputar (bukan gated/deleted).
    return raws
      .filter((raw) => raw.is_streamable !== false && raw.is_delete !== true)
      .map((raw) => toTrack(raw, host));
  }, 'audiusSearch');
}
