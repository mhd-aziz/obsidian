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

Field yang WAJIB di-parse (model `Track.kt`):

| Field JSON | Tipe Kotlin | Pakai untuk |
|---|---|---|
| trackId | Long | key unik (RecyclerView stable id) |
| trackName | String | judul |
| artistName | String | subtitle |
| collectionName | String? | info album (nullable) |
| previewUrl | String? | ExoPlayer (fitur audio) |
| artworkUrl100 | String? | Coil cover (boleh upscale ke 200x200 dengan replace suffix) |

### Catatan penting untuk agent

1. Field JSON snake_case → gunakan `@Json(name = "trackName")` Moshi atau
   `KotlinJsonAdapterFactory` + nama properti sama persis.
2. `previewUrl` kadang berupa `http://` (bukan https). Jika ExoPlayer gagal
   karena cleartext, fallback: tampilkan toast "Preview tidak tersedia" —
   JANGAN enable cleartext global untuk semua domain.
3. Fallback data alternatif: Deezer public API
   `https://api.deezer.com/search?q=<term>&limit=25` (field `preview` mp3,
   `title`, `artist.name`, `album.cover_medium`). Implementasikan fallback
   HANYA jika iTunes bermasalah saat development (YAGNI).
4. iTunes API tidak punya autentikasi; batasi diri ±20 req/menit.

## Firebase (Fitur push + crash)

- Dibutuhkan: project Firebase baru (gratis) dengan package `com.mhdaziz.obsidian`.
- File `google-services.json` diletakkan di `app/` — di-gitignore, JANGAN commit.
- FCM: kirim test message dari console (Cloud Messaging) untuk demo; tidak
  butuh backend sendiri.
- Crashlytics: verifikasi dengan tombol debug "Force crash" → report muncul
  di console ≤5 menit.
