# FEATURE-MAPPING — Obsidian × Mata Kuliah Pemrograman Mobile Lanjut

Ketentuan mata kuliah: aplikasi WAJIB memenuhi **minimal 3 dari 7** cakupan.
Obsidian menargetkan 7/7. Setiap fitur di bawah dijelaskan: perilaku nyata di
app (yang dilihat dosen), alur teknis (yang dibaca agent), lokasi kode, dan
cara membuktikannya. Bukti demo WAJIB tersimpan di `docs/screenshots/` sebelum
fitur ditandai ✅ final di ROADMAP.md.

---

## Fitur 1 — JSON

**Cakupan kuliah:** aplikasi mengambil & mem-parse data JSON dari web service.

**Perilaku di app (yang terlihat):** user mengetik kata kunci (mis. "indonesia")
di kolom pencarian → app memanggil web service → hasilnya berupa daftar lagu
(judul, artis, cover album) tampil di layar. Tanpa JSON parsing, app tidak
punya data apa pun.

**Alur teknis:**
1. `MainScreen` meneruskan kata kunci ke `useMainViewModel().search(term)`.
2. ViewModel memanggil `TrackRepository.search(term, offset)`.
3. Repository memanggil `itunesClient` (fetch) → HTTP GET
   `https://itunes.apple.com/search?term=...&entity=song&limit=25`.
4. Response JSON di-parse menjadi objek TypeScript: `SearchResponse`
   (berisi `resultCount: number`, `results: Track[]`), `Track` (trackId,
   trackName, artistName, collectionName, previewUrl, artworkUrl100) +
   normalisasi field nullable (fungsi murni, di-unit-test).
5. `Track[]` tersimpan di state ViewModel → `FlatList` menampilkan via props.

**Lokasi kode:** `src/api/itunesClient.ts`, `src/models/Track.ts`,
`src/models/SearchResponse.ts`, `src/repositories/TrackRepository.ts`.
**Cara demo ke dosen:** buka app → ketik "indonesia" → tap search → daftar lagu
asli dari iTunes muncul. (Opsional: tunjukkan raw JSON dari browser/curl untuk
memperlihatkan data yang sama.)

**Bukti:** `docs/screenshots/01-json-search-list.png`.

---

## Fitur 2 — Connectivity

**Cakupan kuliah:** aplikasi mendeteksi status koneksi internet secara
real-time dan bereaksi.

**Perilaku di app:** saat internet aktif → app normal. Saat user menyalakan
airplane mode (atau WiFi/matikan data) → banner "No connection — check your
internet" muncul di atas list dalam ≤2 detik, dan app berhenti memuat data.
Saat koneksi kembali → banner hilang otomatis dan app bisa memuat lagi.

**Alur teknis:**
1. `connectivity.ts` subscribe ke NetInfo
   (`@react-native-community/netinfo` `addEventListener`).
2. Event state change → `isConnected` boolean → state ViewModel.
3. `useMainViewModel` menggabungkan status online ke UI state.
4. `OfflineBanner` (komponen) menerima prop `visible` → tampil/hilang.
5. Guard: saat offline, `search()`/`loadMore()` tidak menembak API.

**Lokasi kode:** `src/utils/connectivity.ts`,
`src/components/OfflineBanner.tsx`, `src/viewmodels/MainViewModel.ts`.

**Cara demo:** buka app dengan hasil pencarian tampil → aktifkan airplane mode →
banner muncul → matikan airplane mode → banner hilang.

**Bukti:** `docs/screenshots/02-connectivity-banner.png` (dua kondisi).

---

## Fitur 3 — Lazy loading

**Cakupan kuliah:** aplikasi memuat data besar bertahap (bukan sekaligus)
saat user scroll.

**Perilaku di app:** hasil pencarian dibatasi 25 lagu per halaman. Saat user
scroll mendekati bawah daftar, halaman berikutnya (25 lagu lagi) dimuat
otomatis dan ditambahkan ke bawah list — tanpa tombol "next", tanpa loading
yang menggantung. Daftar bisa terus digulir sampai hasil habis.

**Alur teknis:**
1. `useMainViewModel` menyimpan `offset` (0, 25, 50, ...).
2. `FlatList` prop `onEndReached` (threshold ~0.5): saat user mendekati akhir
   daftar dan tidak sedang loading → `loadMore()`.
3. `loadMore()` memanggil repository dengan `offset` baru → hasil APPEND ke
   state (bukan replace) → FlatList hanya menambah item (keyExtractor =
   trackId).

**Lokasi kode:** `src/viewmodels/MainViewModel.ts` (`loadMore()`),
`src/screens/MainScreen.tsx` (FlatList + onEndReached),
`src/repositories/TrackRepository.ts` (parameter offset).

**Cara demo:** search "love" (hasilnya ribuan) → scroll pelan ke bawah →
lihat item baru masuk terus. Tunjukkan logcat: `Loaded page 2, offset=25`.

**Bukti:** `docs/screenshots/03-lazy-loading.mp4` (video scroll) atau 2
screenshot (halaman 1 & setelah scroll).

---

## Fitur 4 — Android audio

**Cakupan kuliah:** aplikasi memutar audio.

**Perilaku di app:** user tap salah satu lagu di list → layar player terbuka
(cover besar, judul, artis, tombol play/pause, seekbar) → preview lagu 30 detik
dari server iTunes terdengar. Play/pause dan seek bekerja. Keluar dari layar →
audio berhenti dan resource dilepas.

**Alur teknis:**
1. Tap item → navigasi state di `App.tsx` berpindah ke PlayerScreen dengan
   objek Track.
2. `usePlayerViewModel` membuat player `expo-audio`
   (`createAudioPlayer`) + `setAudioModeAsync` (play in background false).
3. `player.replace(track.previewUrl)` → `player.play()`.
4. `useEffect` cleanup unmount → `player.release()` (wajib, anti memory-leak).
5. previewUrl null / gagal load → Alert "Preview tidak tersedia".
6. Progress bar + seek (`player.seekTo`) — posisi & durasi live dari player
   events (Task 5.4).
7. Track Audius: `previewUrl` = stream URL Audius → **lagu utuh** (bukan 30
   dtk), badge "Audius · Full song" di player & list.

**Lokasi kode:** `src/viewmodels/PlayerViewModel.ts`,
`src/screens/PlayerScreen.tsx`, `src/api/audiusClient.ts`,
`src/models/AudiusTrack.ts`.

**Cara demo:** tap lagu iTunes → preview 30 dtk berbunyi; toggle sumber ke
Audius → cari lagu → tap → lagu utuh berbunyi dengan progress bar yang bisa
di-seek; pause → play → back (audio berhenti).

**Bukti:** `docs/screenshots/04-audio-player.mp4` (video, ada suaranya).

---

## Fitur 5 — Remote crash logs

**Cakupan kuliah:** crash aplikasi terlaporkan ke server logging jarak jauh.

**Perilaku di app:** app terintegrasi Sentry (via `expo-sentry`). Setiap crash
(mis. exception tak tertangani) otomatis terkirim ke Sentry dashboard dengan
stack trace, device, dan versi app. Untuk keperluan demo ada tombol debug
"Force crash" (hanya muncul di build dev) yang menimulasi crash nyata.

**Alur teknis:**
1. Akun Sentry (free tier) dibuat; DSN dikonfigurasi via env
   `EXPO_PUBLIC_SENTRY_DSN` (tidak hardcode — secret, .env gitignored).
2. `Sentry.init()` di `App.tsx` saat DSN tersedia; error juga lewat
   `GlobalErrorHandler` (utils/errors.ts) → reporter Sentry.
3. Tombol debug memanggil `throw new Error("Test crash for demo")`.
4. Crash terkirim otomatis oleh SDK → muncul di dashboard dalam ±menit.

**Lokasi kode:** `app.json` (plugin @sentry/react-native), `App.tsx`
(Sentry.init + reporter), tombol di `src/components/ForceCrashButton.tsx`
(blok `__DEV__`).

**Cara demo:** tekan "Force crash" (app crash) → buka sentry.io dashboard →
issue "Test crash for demo" muncul dengan stack trace.

**Bukti:** `docs/screenshots/05-sentry-console.png`.

---

## Fitur 6 — Uploading and emailing

**Cakupan kuliah:** aplikasi dapat mengirim/mengunggah data keluar (share,
upload, email).

**Perilaku di app:** user menekan ikon "Share playlist" di toolbar → app
menyusun daftar lagu hasil pencarian menjadi teks rapi → Android Sharesheet
terbuka → user memilih Gmail → draft email baru terisi otomatis (subject +
body daftar lagu) siap dikirim. (Jalur sama bekerja untuk WhatsApp/dll karena
memakai intent standar Android.)

**Alur teknis:**
1. `PlaylistExporter.buildPlaylistText(tracks)`: "Obsidian Playlist\n
   1. Artist — Title\n2. ..." (fungsi murni → di-unit-test).
2. `Share.share({ message: text })` dari React Native → Android Sharesheet
   terbuka (opsi Gmail/WhatsApp/semua app yang handle text).
3. (Alternatif jalur email langsung) `Linking.openURL("mailto:...?subject=...")`.

**Lokasi kode:** `src/utils/playlistExporter.ts`,
`src/components/SharePlaylistButton.tsx` (dipakai di MainScreen).

**Cara demo:** tekan "Share playlist" → pilih Gmail → draft email terisi daftar
lagu. (Opsional: kirim ke email sendiri dan tunjukkan emailnya diterima.)

**Bukti:** `docs/screenshots/06-email-draft.png`.

---

## Fitur 7 — Push messaging

**Cakupan kuliah:** aplikasi menerima push message dari server (notifikasi
dari cloud).

**Perilaku di app:** app terintegrasi push notification via `expo-notifications`
(Expo Push Service — di bawah hood Android memakai FCM). Saat pesan push
dikirim (dari Expo push tool untuk demo; dari server untuk produksi),
notifikasi muncul di system tray Android walau app sedang ditutup. Menekan
notifikasi membuka app.

**Alur teknis:**
1. `npx expo install expo-notifications` + plugin di app.json
   (icon/channel Android).
2. `src/services/notifications.ts`: `registerForPushNotificationsAsync()`
   (minta permission → dapat Expo push token) + `setNotificationHandler`
   (tampil notifikasi saat app foreground) + response listener (tap → buka
   layar terkait).
3. Demo: kirim via Expo push tool (https://exp.host/--/api/v2/push/send dengan
   token) atau curl ke Expo push API.
4. Untuk build APK produksi, notifikasi jalan tanpa setup Firebase console —
   Expo yang menangani pengiriman.

**Lokasi kode:** `src/services/notifications.ts`, `app.json` (plugin).

**Cara demo:** ambil push token dari log app → kirim test message via Expo push
tool → notifikasi muncul di device → tap notifikasi → app terbuka.

**Bukti:** `docs/screenshots/07-push-notification.png`.

---

## Urutan keamanan nilai (kalau waktu mepet, kerjakan atas ke bawah)

Semua fitur "alami" di konsep Obsidian (tidak ada yang dipaksakan), tapi
prioritas untuk minimal 3/7:

1. **JSON** — fondasi; tanpa ini app kosong.
2. **Lazy loading** — terlihat jelas saat demo, implementasi ringan.
3. **Android audio** — efek "wow" demo; player.
4. **Connectivity** — implementasi paling cepat setelah 1-3.
5. **Push messaging** + **Remote crash logs** — satu setup akun (Expo push +
   Sentry) untuk dua fitur; kerjakan berurutan.
6. **Uploading and emailing** — bonus paling ringan, kerjakan terakhir.

Dengan 4 fitur pertama saja sudah 4/7 (di atas minimum). Fitur 5-7 menambah
keamanan nilai karena setup-nya berbagi (Expo push + Sentry) dan API-nya
sederhana.
