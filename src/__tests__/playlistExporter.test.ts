import { buildPlaylistText } from '../utils/playlistExporter';
import { Track } from '../models/Track';

const track = (id: number, name: string, artist: string): Track => ({
  trackId: id,
  trackName: name,
  artistName: artist,
  collectionName: null,
  previewUrl: null,
  artworkUrl100: null,
});

describe('buildPlaylistText', () => {
  it('playlist kosong → pesan kosong', () => {
    const result = buildPlaylistText([]);
    expect(result).toContain('kosong');
  });

  it('playlist berisi lagu → nomor urut + artis — judul', () => {
    const result = buildPlaylistText([track(1, 'Lagu A', 'Artis A'), track(2, 'Lagu B', 'Artis B')]);
    expect(result).toContain('1. Artis A — Lagu A');
    expect(result).toContain('2. Artis B — Lagu B');
  });
});
