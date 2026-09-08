/**
 * AudiusTrack — model mentah Audius API + mapper ke Track (fungsi murni).
 * Kontrak: https://docs.audius.org/api/ (GET /v1/tracks/search).
 * Field Audius nullable di tempat yang tidak disangka → semua di-normalisasi.
 */
import { AUDIUS_APP_NAME, AUDIUS_TRACKS_BASE_PATH } from '../utils/constants';
import { Track } from './Track';

export interface AudiusUserRaw {
  name?: string | null;
}

export interface AudiusArtworkRaw {
  '150x150'?: string | null;
  '480x480'?: string | null;
  '1000x1000'?: string | null;
}

export interface AudiusTrackRaw {
  id?: string | null;
  title?: string | null;
  duration?: number | null;
  genre?: string | null;
  user?: AudiusUserRaw | null;
  artwork?: AudiusArtworkRaw | null;
  is_streamable?: boolean | null;
  is_delete?: boolean | null;
}

/** Mapper raw Audius → Track aplikasi. host = discovery host yang dipakai. */
export function toTrack(raw: AudiusTrackRaw, host: string): Track {
  const id = typeof raw.id === 'string' ? raw.id : '';
  return {
    trackId: id,
    trackName: raw.title || 'Unknown title',
    artistName: raw.user?.name || 'Unknown artist',
    // genre dipakai sebagai info "album" (Audius tidak punya album di search)
    collectionName: raw.genre || null,
    previewUrl: id
      ? `${host}${AUDIUS_TRACKS_BASE_PATH}/${id}/stream?app_name=${AUDIUS_APP_NAME}`
      : null,
    // artwork terbesar yang umum dipakai list: 480x480, fallback 150x150
    artworkUrl100: raw.artwork?.['480x480'] || raw.artwork?.['150x150'] || null,
    source: 'audius',
  };
}
