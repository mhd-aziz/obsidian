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
1. `MainActivity` meneruskan kata kunci ke `MainViewModel.search(term)`.
2. ViewModel memanggil `TrackRepository.search(term, offset)`.
3. Repository memanggil `ItunesApiService` (Retrofit) → HTTP GET
   `https://itunes.apple.com/search?term=...&entity=song&limit=25`.
4. Response JSON di-parse Moshi menjadi objek Kotlin: `SearchResponse`
   (berisi `resultCount: Int`, `results: List<Track>`), `Track` (trackId,
   trackName, artistName, collectionName, previewUrl, artworkUrl100).
5. List<Track> diterbitkan lewat StateFlow → RecyclerView menampilkan.

**Lokasi kode:** `data/api/ItunesApiService.kt`, `data/model/Track.kt`,
`data/model/SearchResponse.kt`, `data/repo/TrackRepository.kt`.

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
1. `ConnectivityObserver` mendaftarkan
   `ConnectivityManager.registerDefaultNetworkCallback(NetworkCallback)`.
2. `onAvailable()` → `StateFlow<Boolean> = true`; `onLost()` → false.
3. `MainViewModel` menggabungkan status online ke UI state.
4. `OfflineBanner` (View) mengobservasi state → tampil/hilang.
5. Guard: saat offline, `search()`/`loadMore()` tidak menembak API.

**Lokasi kode:** `util/ConnectivityObserver.kt`, `ui/OfflineBanner.kt`,
`ui/MainViewModel.kt`.

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
1. `MainViewModel` menyimpan `offset` (0, 25, 50, ...).
2. `TrackAdapter` memasang `RecyclerView.OnScrollListener`: saat item terakhir
   terlihat dan tidak sedang loading → `viewModel.loadMore()`.
3. `loadMore()` memanggil repository dengan `offset` baru → hasil APPEND ke
   StateFlow (bukan replace) → RecyclerView hanya menambah item (ListAdapter
   diff util).

**Lokasi kode:** `ui/MainViewModel.kt` (`loadMore()`), `ui/TrackAdapter.kt`
(scroll listener), `data/repo/TrackRepository.kt` (parameter offset).

**Cara demo:** search "love" (hasilnya ribuan) → scroll pelan ke bawah →
lihat item baru masuk terus. Tunjukkan logcat: `Loaded page 2, offset=25`.

**Bukti:** `docs/screenshots/03-lazy-loading.mp4` (video scroll) atau 2
screenshot (halaman 1 & setelah scroll).

---

## Fitur 4 — Android audio

**Cakupan kuliah:** aplikasi memutar audio (MediaPlayer/ExoPlayer).

**Perilaku di app:** user tap salah satu lagu di list → layar player terbuka
(cover besar, judul, artis, tombol play/pause, seekbar) → preview lagu 30 detik
dari server iTunes terdengar. Play/pause dan seek bekerja. Keluar dari layar →
audio berhenti dan resource dilepas.

**Alur teknis:**
1. Klik item → `PlayerActivity` menerima objek Track (Intent extra).
2. `ExoPlayer.Builder(context).build()` dipasang ke `PlayerView`.
3. `MediaItem.fromUri(track.previewUrl)` → `prepare()` → `play()`.
4. `onStop()` → `player.release()` (wajib, anti memory-leak).
5. previewUrl null / format tidak didukung → toast "Preview tidak tersedia".

**Lokasi kode:** `ui/PlayerActivity.kt`, `res/layout/activity_player.xml`.

**Cara demo:** tap lagu apa pun → audio bunyi → pause → play → back (audio
berhenti).

**Bukti:** `docs/screenshots/04-audio-player.mp4` (video, ada suaranya).

---

## Fitur 5 — Remote crash logs

**Cakupan kuliah:** crash aplikasi terlaporkan ke server logging jarak jauh.

**Perilaku di app:** app terintegrasi Firebase Crashlytics. Setiap crash
(mis. exception tak tertangani) otomatis terkirim ke Firebase console dengan
stack trace, device, dan versi app. Untuk keperluan demo ada tombol debug
"Force crash" (hanya muncul di build debug) yang menimulasi crash nyata.

**Alur teknis:**
1. Project Firebase dibuat, package `com.mhdaziz.obsidian` didaftarkan,
   `google-services.json` diletakkan di `app/` (tidak di-commit).
2. Plugin `com.google.gms.google-services` + `com.google.firebase.crashlytics`
   dan dependency `firebase-crashlytics-ktx` ditambahkan.
3. Tombol debug memanggil `throw RuntimeException("Test crash for demo")`.
4. Crash terkirim otomatis oleh SDK → muncul di console dalam ±5 menit.

**Lokasi kode:** `app/build.gradle.kts` (plugin+dep), tombol di
`MainActivity` (blok `if (BuildConfig.DEBUG)`).

**Cara demo:** tekan "Force crash" (app crash) → buka console.firebase.google.com
→ Crashlytics → report "Test crash for demo" muncul dengan stack trace.

**Bukti:** `docs/screenshots/05-crashlytics-console.png`.

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
2. `Intent(Intent.ACTION_SEND)` + `putExtra(EXTRA_TEXT, ...)` +
   `putExtra(EXTRA_EMAIL, ...)` opsional + `type = "text/plain"`.
3. `Intent.createChooser(...)` → `startActivity`.

**Lokasi kode:** `util/PlaylistExporter.kt`, tombol di `MainActivity` toolbar.

**Cara demo:** tekan "Share playlist" → pilih Gmail → draft email terisi daftar
lagu. (Opsional: kirim ke email sendiri dan tunjukkan emailnya diterima.)

**Bukti:** `docs/screenshots/06-email-draft.png`.

---

## Fitur 7 — Push messaging

**Cakupan kuliah:** aplikasi menerima push message dari server (notifikasi
dari cloud).

**Perilaku di app:** app terdaftar di Firebase Cloud Messaging. Saat pesan
push dikirim (dari Firebase console untuk demo; dari server untuk produksi),
notifikasi muncul di system tray Android walau app sedang ditutup. Menekan
notifikasi membuka app.

**Alur teknis:**
1. Dependency `firebase-messaging-ktx` + service class khusus.
2. `ObsidianFirebaseMessagingService` extends
   `FirebaseMessagingService`, override `onMessageReceived(remoteMessage)`:
   buat NotificationChannel (API 26+) → `NotificationCompat.Builder` →
   `notify()`. Override `onNewToken` untuk logging.
3. Pesan "notification" (dari console) otomatis tampil saat app foreground/
   background; pesan "data" diproses di onMessageReceived.
4. Demo: Firebase console → Cloud Messaging → "Create test message".

**Lokasi kode:** `push/ObsidianFirebaseMessagingService.kt`,
`AndroidManifest.xml` (deklarasi service).

**Cara demo:** kirim test campaign dari Firebase console → notifikasi muncul
di device → tap notifikasi → app terbuka.

**Bukti:** `docs/screenshots/07-push-notification.png`.

---

## Urutan keamanan nilai (kalau waktu mepet, kerjakan atas ke bawah)

Semua fitur "alami" di konsep Obsidian (tidak ada yang dipaksakan), tapi
prioritas untuk minimal 3/7:

1. **JSON** — fondasi; tanpa ini app kosong.
2. **Lazy loading** — terlihat jelas saat demo, implementasi ringan.
3. **Android audio** — efek "wow" demo; player.
4. **Connectivity** — implementasi paling cepat setelah 1-3.
5. **Push messaging** + **Remote crash logs** — satu setup Firebase untuk dua
   fitur; kerjakan berurutan.
6. **Uploading and emailing** — bonus paling ringan, kerjakan terakhir.

Dengan 4 fitur pertama saja sudah 4/7 (di atas minimum). Fitur 5-7 menambah
keamanan nilai karena setup-nya berbagi (Firebase) dan intent-nya sederhana.
