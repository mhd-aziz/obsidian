import { Track, getArtworkUrl200 } from '../models/Track';

const baseTrack: Track = {
  trackId: 1,
  trackName: 'Test Song',
  artistName: 'Test Artist',
  collectionName: null,
  previewUrl: null,
  artworkUrl100: null,
  source: 'itunes',
};

describe('Track model', () => {
  it('getArtworkUrl200 mengembalikan null untuk artwork kosong', () => {
    expect(getArtworkUrl200({ ...baseTrack, artworkUrl100: null })).toBeNull();
  });

  it('getArtworkUrl200 mengganti 100x100 → 200x200 (jpg)', () => {
    const result = getArtworkUrl200({
      ...baseTrack,
      artworkUrl100: 'https://example.com/100x100bb.jpg',
    });
    expect(result).toBe('https://example.com/200x200bb.jpg');
  });

  it('getArtworkUrl200 mengganti 100x100 → 200x200 (png)', () => {
    const result = getArtworkUrl200({
      ...baseTrack,
      artworkUrl100: 'https://example.com/100x100bb.png',
    });
    expect(result).toBe('https://example.com/200x200bb.png');
  });
});
