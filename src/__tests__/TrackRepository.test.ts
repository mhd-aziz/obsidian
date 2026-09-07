/**
 * TrackRepository + itunesClient tests — fetch di-mock (Task 1.2).
 * Sesuai AI-AGENT-GUIDE.md: unit test repository dengan fetch mock.
 */
import { itunesSearch } from '../api/itunesClient';
import { searchTracks } from '../repositories/TrackRepository';
import { AppError } from '../utils/errors';
import { Track } from '../models/Track';

const sampleTrack: Track = {
  trackId: 1538017382,
  trackName: 'Indonesia',
  artistName: 'August Burns Red',
  collectionName: 'Constellations',
  previewUrl: 'https://audio-ssl.itunes.apple.com/preview.m4a',
  artworkUrl100: 'https://is1-ssl.mzstatic.com/100x100bb.jpg',
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('itunesClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('membangun URL dengan term ter-encode, entity=song, limit, offset', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ resultCount: 0, results: [] })
    );

    await itunesSearch({ term: 'indonesia rantai', limit: 25, offset: 50 });

    const calledUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('https://itunes.apple.com/search?');
    expect(calledUrl).toContain('term=indonesia%20rantai');
    expect(calledUrl).toContain('entity=song');
    expect(calledUrl).toContain('limit=25');
    expect(calledUrl).toContain('offset=50');
  });

  it('mengembalikan response hasil parse saat HTTP 200', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ resultCount: 1, results: [sampleTrack] })
    );

    const response = await itunesSearch({ term: 'indonesia' });
    expect(response.resultCount).toBe(1);
    expect(response.results[0].trackName).toBe('Indonesia');
  });

  it('melempar AppError HTTP_ERROR saat response status >= 400', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(jsonResponse({}, 500));

    await expect(itunesSearch({ term: 'x' })).rejects.toMatchObject({
      code: 'HTTP_ERROR',
    });
  });

  it('melempar AppError NETWORK_OFFLINE saat fetch gagal (TypeError)', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(
      new TypeError('Network request failed')
    );

    await expect(itunesSearch({ term: 'x' })).rejects.toBeInstanceOf(AppError);
    await expect(itunesSearch({ term: 'x' })).rejects.toMatchObject({
      code: 'NETWORK_OFFLINE',
    });
  });

  it('melempar AppError PARSE_ERROR saat body bukan bentuk SearchResponse', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(jsonResponse({ foo: 'bar' }));

    await expect(itunesSearch({ term: 'x' })).rejects.toMatchObject({
      code: 'PARSE_ERROR',
    });
  });

  it('melempar AppError NETWORK_TIMEOUT saat request melebihi batas waktu', async () => {
    jest.useFakeTimers();
    (globalThis.fetch as jest.Mock).mockImplementation(
      (_url, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new Error('Aborted'))
          );
        })
    );

    const pending = itunesSearch({ term: 'x' });
    const assertion = expect(pending).rejects.toMatchObject({
      code: 'NETWORK_TIMEOUT',
    });
    jest.runAllTimers();
    await assertion;
    jest.useRealTimers();
  });
});

describe('searchTracks (repository)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('mengembalikan Track[] dari response iTunes', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ resultCount: 1, results: [sampleTrack] })
    );

    const tracks = await searchTracks('indonesia');
    expect(tracks).toHaveLength(1);
    expect(tracks[0].trackId).toBe(1538017382);
    expect(tracks[0].previewUrl).toContain('https://');
  });

  it('meneruskan offset untuk lazy loading halaman berikutnya', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ resultCount: 0, results: [] })
    );

    await searchTracks('indonesia', 25);

    const calledUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('offset=25');
  });
});
