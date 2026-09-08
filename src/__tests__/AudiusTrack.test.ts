/**
 * AudiusTrack mapper tests — raw Audius API → Track (Task 5.4, TDD).
 * Mapper fungsi murni: field nullable dinormalisasi, source='audius'.
 */
import { toTrack, AudiusTrackRaw } from '../models/AudiusTrack';

const HOST = 'https://discovery-audius.test';

const fullRaw: AudiusTrackRaw = {
  id: 'YZP2K',
  title: 'Bangga Indonesia (Remix)',
  duration: 210,
  genre: 'Glitch Hop',
  is_streamable: true,
  is_delete: false,
  user: { name: 'Anoigma' },
  artwork: {
    '150x150': 'https://cdn.example/150.jpg',
    '480x480': 'https://cdn.example/480.jpg',
  },
};

describe('toTrack (Audius → Track mapper)', () => {
  it('memetakan raw lengkap → Track dengan source audius + stream URL', () => {
    const track = toTrack(fullRaw, HOST);
    expect(track).toEqual({
      trackId: 'YZP2K',
      trackName: 'Bangga Indonesia (Remix)',
      artistName: 'Anoigma',
      collectionName: 'Glitch Hop',
      previewUrl: `${HOST}/v1/tracks/YZP2K/stream?app_name=obsidian`,
      artworkUrl100: 'https://cdn.example/480.jpg',
      source: 'audius',
    });
  });

  it('artwork fallback: 480x480 → 150x150 → null', () => {
    expect(
      toTrack({ ...fullRaw, artwork: { '480x480': 'https://cdn/480.jpg' } }, HOST)
        .artworkUrl100
    ).toBe('https://cdn/480.jpg');
    expect(
      toTrack({ ...fullRaw, artwork: { '150x150': 'https://cdn/150.jpg' } }, HOST)
        .artworkUrl100
    ).toBe('https://cdn/150.jpg');
    expect(toTrack({ ...fullRaw, artwork: null }, HOST).artworkUrl100).toBeNull();
    expect(toTrack({ ...fullRaw, artwork: {} }, HOST).artworkUrl100).toBeNull();
  });

  it('field nullable → nilai fallback yang aman untuk UI', () => {
    const minimal = toTrack(
      { id: 'X1', title: null, duration: null, genre: null, user: null, artwork: null },
      HOST
    );
    expect(minimal.trackName).toBe('Unknown title');
    expect(minimal.artistName).toBe('Unknown artist');
    expect(minimal.collectionName).toBeNull();
    expect(minimal.previewUrl).toBe(`${HOST}/v1/tracks/X1/stream?app_name=obsidian`);
  });
});
