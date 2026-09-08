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

## Sumber kedua: Audius API (full-length, Task 5.4 — keputusan user jalur A)

- Discovery: `GET https://api.audius.co` → `{ data: [host1, host2, ...] }`
  (ambil host pertama, cache per sesi app).
- Search: `GET {host}/v1/tracks/search?query=<term>&limit=25&offset=<n>&app_name=obsidian`
- Stream: `GET {host}/v1/tracks/<track_id>/stream?app_name=obsidian`
  (redirect 302 ke CDN; player mengikuti redirect otomatis).
- Tanpa API key; identifikasi app via param `app_name` (free tier 500k req/bln).

### Response search (dipotong ke field yang dipakai)

```json
{
  "data": [
    {
      "id": "track_id_string",
      "title": "Judul lagu",
      "duration": 210,
      "genre": "Electronic",
      "is_streamable": true,
      "is_delete": false,
      "user": { "name": "Nama artis" },
      "artwork": { "150x150": "https://...", "480x480": "https://..." }
    }
  ]
}
```

### Pemetaan ke model `Track` (lihat `src/models/AudiusTrack.ts`)

| Field Audius | Field Track | Catatan |
|---|---|---|
| id | trackId | string (iTunes numeric) |
| title | trackName | fallback "Unknown title" |
| user.name | artistName | fallback "Unknown artist" |
| genre | collectionName | nullable |
| (derived) | previewUrl | `{host}/v1/tracks/<id>/stream?app_name=obsidian` — **durasi penuh**, bukan preview |
| artwork['480x480'] ?? ['150x150'] | artworkUrl100 | nullable |
| — | source | selalu `'audius'` |

### Catatan penting untuk agent

1. Katalog Audius = **artist indie saja**; lagu komersial (major label) tidak
   ada. iTunes tetap sumber utama untuk katalog komersial (preview 30 dtk).
2. Filter hasil: hanya `is_streamable === true` dan `is_delete === false`.
3. Nilai `duration` dalam detik (angka) — tampilkan via `formatTime`
   (`src/utils/formatTime.ts`); tidak selalu 30 dtk seperti iTunes.
4. Pagination identik iTunes: limit 25, offset kelipatan 25.
5. Host discovery di-cache (`resolveHost`); reset via `resetAudiusHostCache()`
   di test.

## Layanan cloud (Fitur push + crash)

- Push: **Expo Push Service** (gratis) — `expo-notifications`, kirim test via
  Expo push tool (https://exp.host/--/api/v2/push/send) dengan Expo push token
  dari app; tidak butuh backend sendiri, tidak perlu setup Firebase console.
- Crash: **Sentry** (free tier) via `expo-sentry` — DSN disimpan sebagai
  secret (eas secret / tidak di-commit). Verifikasi dengan tombol debug
  "Force crash" → issue muncul di dashboard sentry.io.
