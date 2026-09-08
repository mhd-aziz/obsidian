/**
 * Audius API client tests — fetch di-mock (Task 5.4, TDD).
 * Alur: host discovery (api.audius.co) → /v1/tracks/search di host pertama.
 */
import { audiusSearch, resetAudiusHostCache } from '../api/audiusClient';
import { AppError } from '../utils/errors';
import { AudiusTrackRaw } from '../models/AudiusTrack';

const rawTrack: AudiusTrackRaw = {
  id: 'YZP2K',
  title: 'Bangga Indonesia (Remix)',
  duration: 210,
  genre: 'Glitch Hop',
  is_streamable: true,
  is_delete: false,
  user: { name: 'Anoigma' },
  artwork: { '480x480': 'https://cdn.example/480.jpg' },
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('audiusClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = jest.fn();
    resetAudiusHostCache();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('discover host dulu (api.audius.co), lalu search di host pertama dengan param lengkap', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ data: ['https://discovery-audius.test'] }))
      .mockResolvedValueOnce(jsonResponse({ data: [rawTrack] }));

    const tracks = await audiusSearch({ term: 'indonesia rantai', limit: 25, offset: 50 });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    const discoveryUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(discoveryUrl).toBe('https://api.audius.co');

    const searchUrl = (globalThis.fetch as jest.Mock).mock.calls[1][0] as string;
    expect(searchUrl).toContain('https://discovery-audius.test/v1/tracks/search?');
    expect(searchUrl).toContain('app_name=obsidian');
    expect(searchUrl).toContain('query=indonesia%20rantai');
    expect(searchUrl).toContain('limit=25');
    expect(searchUrl).toContain('offset=50');

    expect(tracks).toHaveLength(1);
    expect(tracks[0].source).toBe('audius');
    expect(tracks[0].trackId).toBe('YZP2K');
    expect(tracks[0].previewUrl).toContain(
      'https://discovery-audius.test/v1/tracks/YZP2K/stream'
    );
  });

  it('menyaring track yang tidak streamable / sudah dihapus', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ data: ['https://discovery-audius.test'] }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            { ...rawTrack, id: 'OFF1', is_streamable: false },
            { ...rawTrack, id: 'OK1' },
            { ...rawTrack, id: 'DEL1', is_delete: true },
          ],
        })
      );

    const tracks = await audiusSearch({ term: 'x' });
    expect(tracks.map((t) => t.trackId)).toEqual(['OK1']);
  });

  it('melempar AppError PARSE_ERROR saat discovery bukan bentuk { data: string[] }', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(jsonResponse({ foo: 'bar' }));
    await expect(audiusSearch({ term: 'x' })).rejects.toMatchObject({
      code: 'PARSE_ERROR',
    });
  });

  it('melempar AppError PARSE_ERROR saat search response bukan { data: Track[] }', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ data: ['https://discovery-audius.test'] }))
      .mockResolvedValueOnce(jsonResponse({ data: 'bukan-array' }));

    await expect(audiusSearch({ term: 'x' })).rejects.toMatchObject({
      code: 'PARSE_ERROR',
    });
  });

  it('melempar AppError HTTP_ERROR saat search endpoint balas HTTP >= 400', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ data: ['https://discovery-audius.test'] }))
      .mockResolvedValueOnce(jsonResponse({}, 500));

    await expect(audiusSearch({ term: 'x' })).rejects.toMatchObject({
      code: 'HTTP_ERROR',
    });
  });

  it('melempar AppError HTTP_ERROR saat host discovery gagal (HTTP >= 400)', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(jsonResponse({}, 503));

    await expect(audiusSearch({ term: 'x' })).rejects.toMatchObject({
      code: 'HTTP_ERROR',
    });
  });

  it('melempar AppError NETWORK_OFFLINE saat fetch gagal (TypeError)', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(
      new TypeError('Network request failed')
    );

    await expect(audiusSearch({ term: 'x' })).rejects.toBeInstanceOf(AppError);
    await expect(audiusSearch({ term: 'x' })).rejects.toMatchObject({
      code: 'NETWORK_OFFLINE',
    });
  });

  it('host tanpa skema dinormalisasi ke https://, trailing slash dibuang', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ data: ['discovery-audius.test/'] }))
      .mockResolvedValueOnce(jsonResponse({ data: [rawTrack] }));

    const tracks = await audiusSearch({ term: 'x' });

    const searchUrl = (globalThis.fetch as jest.Mock).mock.calls[1][0] as string;
    expect(searchUrl).toContain('https://discovery-audius.test/v1/tracks/search?');
    expect(tracks[0].previewUrl).toBe(
      'https://discovery-audius.test/v1/tracks/YZP2K/stream?app_name=obsidian'
    );
  });

  it('host kosong di discovery → PARSE_ERROR', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ data: ['   '] }));

    await expect(audiusSearch({ term: 'x' })).rejects.toMatchObject({
      code: 'PARSE_ERROR',
    });
  });
});
