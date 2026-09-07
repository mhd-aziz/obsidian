# API — Kontrak Data Obsidian

## Sumber utama: iTunes Search API (gratis, tanpa API key)

- Base URL: `https://itunes.apple.com/`
- Endpoint: `GET /search`
- Dokumentasi: https://performance-partners.apple.com/search-api

### Request

| Query param | Nilai | Keterangan |
|---|---|---|
| `term` | string | kata kunci pencarian (WAJIB) |
| `entity` | `song` | fokus lagu |
| `limit` | 25 | jumlah per halaman |
| `offset` | 0, 25, 50... | pagination (lazy loading) |

Contoh (sudah diverifikasi hidup):
`curl "https://itunes.apple.com/search?term=indonesia&entity=song&limit=2"`

### Response (dipotong ke field yang dipakai)

```json
{
  "resultCount": 2,
  "results": [
    {
      "trackId": 1538017382,
      "trackName": "Indonesia",
      "artistName": "August Burns Red",
      "collectionName": "Constellations",
      "previewUrl": "https://audio-ssl.itunes.apple.com/.../mzi.xxx.aac.p.m4p",
      "artworkUrl100": "https://is1-ssl.mzstatic.com/.../100x100bb.jpg"
    }
  ]
}
```

Field yang WAJIB di-parse (model `src/models/Track.ts`):

| Field JSON | Tipe TypeScript | Pakai untuk |
|---|---|---|
| trackId | number | key unik (FlatList keyExtractor) |
| trackName | string | judul |
| artistName | string | subtitle |
| collectionName | string \| null | info album (nullable) |
| previewUrl | string \| null | expo-audio (fitur audio) |
| artworkUrl100 | string \| null | Image cover (boleh upscale ke 200x200 dengan replace suffix) |

### Catatan penting untuk agent

1. Field JSON snake_case → deklarasikan interface TypeScript dengan nama
   properti sama persis (tidak perlu mapping/rename).
2. `previewUrl` kadang berupa `http://` (bukan https). Jika player gagal,
   fallback: tampilkan Alert "Preview tidak tersedia".
3. Fallback data alternatif: Deezer public API
   `https://api.deezer.com/search?q=<term>&limit=25` (field `preview` mp3,
   `title`, `artist.name`, `album.cover_medium`). Implementasikan fallback
   HANYA jika iTunes bermasalah saat development (YAGNI).
4. iTunes API tidak punya autentikasi; batasi diri ±20 req/menit.

## Layanan cloud (Fitur push + crash)

- Push: **Expo Push Service** (gratis) — `expo-notifications`, kirim test via
  Expo push tool (https://exp.host/--/api/v2/push/send) dengan Expo push token
  dari app; tidak butuh backend sendiri, tidak perlu setup Firebase console.
- Crash: **Sentry** (free tier) via `expo-sentry` — DSN disimpan sebagai
  secret (eas secret / tidak di-commit). Verifikasi dengan tombol debug
  "Force crash" → issue muncul di dashboard sentry.io.
