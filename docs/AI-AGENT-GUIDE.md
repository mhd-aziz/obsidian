# AI-AGENT-GUIDE — Urutan Eksekusi Task Obsidian

Instruksi eksekusi untuk AI agent. Eksekusi berurutan. Satu task = satu commit.
Setiap task punya Acceptance Criteria (AC) — task belum selesai jika AC belum
terpenuhi. Progres dicatat di ROADMAP.md.

## Sprint 0 — Fondasi

### Task 0.1 — Repo + docs
- Inisialisasi repo git di folder proyek, hubungkan ke GitHub `mhd-aziz/obsidian`.
- Salin folder `docs/` dari planning folder ke root repo.
- AC: `git remote -v` menunjuk ke repo; push pertama sukses.

### Task 0.2 — Scaffold Android project
- Android Studio: New Project → Empty Activity (Compose) → name=Obsidian,
  package=`com.application.obsidian`, language=Kotlin, minSdk 26, build config
  Kotlin DSL. (CATATAN: package aktual scaffold = `com.application.obsidian`;
  keputusan final user 2026-09-08 — package TIDAK di-rename.)
- AC: `./gradlew assembleDebug` → BUILD SUCCESSFUL. Commit: `chore: scaffold android project`.

### Task 0.3 — Dependencies
- Tambahkan dependencies persis seperti ARCHITECTURE.md §1 (Retrofit 2.11,
  Moshi 1.15 + KotlinJsonAdapterFactory, Media3 1.11.0 + media3-ui-compose,
  Coil 3.6.1 coil-compose + coil-network-okhttp, lifecycle
  viewmodel-compose + collectAsStateWithLifecycle) + permission INTERNET di
  manifest. Compose BOM sudah ada dari scaffold.
- AC: `./gradlew assembleDebug` hijau. Commit: `chore: add network audio deps`.

### Task 0.4 — Setup .gitignore + Firebase placeholder
- .gitignore: `google-services.json`, `local.properties`, `build/`, `.idea/`.
- Firebase setup baru dilakukan di Sprint 3 (jangan di-sprint ini).

## Sprint 1 — JSON + Lazy loading

### Task 1.1 — Model + test parsing (TDD)
- Tulis `SearchResponseTest.kt` DULU dengan JSON sample dari docs/API.md,
  jalankan `./gradlew test` → HARUS GAGAL.
- Implement `data/model/Track.kt`, `data/model/SearchResponse.kt` (Moshi,
  perhatikan snake_case & nullable fields sesuai API.md).
- AC: `./gradlew test` → PASS. Commit: `test+feat: itunes model parsing`.

### Task 1.2 — API service + Repository
- `data/api/ItunesApiService.kt` (suspend fun, query params sesuai API.md),
  `data/repo/TrackRepository.kt` (base URL https://itunes.apple.com/).
- AC: `./gradlew assembleDebug` hijau; hanya repository yang memanggil API.
  Commit: `feat: itunes api service + repository`.

### Task 1.3 — ViewModel + list UI + lazy loading
- `ui/MainViewModel.kt`: StateFlow<List<Track>>, `search(term)`, `loadMore()`
  (offset += 25, append, guard sedang-loading).
- `ui/MainActivity.kt` + `ui/MainScreen.kt` (SearchBar + LazyColumn +
  OfflineBanner placeholder) + `ui/components/TrackRow.kt` (Coil AsyncImage
  load artwork, key = trackId di LazyColumn).
- Lazy loading: trigger di akhir LazyColumn (derivedStateOf pada
  `layoutInfo.visibleItemsInfo` / item footer) → `loadMore()`.
- AC: app jalan, search "indonesia" menampilkan hasil, scroll memuat halaman
  berikutnya (logcat offset=25). Screenshot → `docs/screenshots/list.png`.
  Commit: `feat: searchable track list with infinite scroll`.

## Sprint 2 — Connectivity + Audio

### Task 2.1 — ConnectivityObserver (TDD)
- Test dulu (mock ConnectivityManager) → gagal → implement
  `util/ConnectivityObserver.kt` dengan registerDefaultNetworkCallback →
  expose StateFlow<Boolean>.
- Tampilkan banner offline di MainScreen (observasi flow).
- AC: airplane mode toggle → banner muncul/hilang. Screenshot
  `docs/screenshots/offline-banner.png`. Commit: `feat: live connectivity banner`.

### Task 2.2 — PlayerActivity (ExoPlayer)
- Klik item → PlayerActivity; PlayerScreen (PlayerSurface media3-ui-compose)
  + play/pause; media item = track.previewUrl; release() via
  DisposableEffect/onStop().
- Handle previewUrl null / http-cleartext gagal: toast "Preview tidak
  tersedia" (lihat API.md catatan 2).
- AC: preview terdengar, tidak ada leak (rotate screen tidak crash).
  Screenshot `docs/screenshots/player.png`. Commit: `feat: preview audio player`.

## Sprint 3 — Firebase (crash logs + push)

### Task 3.1 — Firebase project setup
- Buat project Firebase (nama obsidian-x), daftarkan package
  `com.application.obsidian`, taruh `google-services.json` di `app/` (JANGAN
  commit), tambah plugin google-services + crashlytics.
- AC: app terdaftar di console. Commit: `chore: firebase init`.

### Task 3.2 — Crashlytics terverifikasi
- Tombol debug "Force crash" (throw RuntimeException) — hanya di BuildConfig.DEBUG.
- AC: report muncul di console ≤5 menit. Screenshot
  `docs/screenshots/crashlytics.png`. Commit: `feat: crashlytics verified`.

### Task 3.3 — FCM
- `service/ObsidianFirebaseMessagingService.kt` → notifikasi dari
  onMessageReceived.
- AC: test message dari console → notifikasi tampil. Screenshot
  `docs/screenshots/push.png`. Commit: `feat: fcm push notifications`.

## Sprint 4 — Uploading & emailing

### Task 4.1 — PlaylistExporter
- Tombol "Share playlist" → kumpulkan hasil search/favorit → teks →
  Intent.ACTION_SEND (EXTRA_TEXT, type text/plain, chooser).
- AC: Gmail terbuka dengan draft berisi daftar lagu. Screenshot
  `docs/screenshots/share-email.png`. Commit: `feat: share playlist via email`.

## Sprint 5 — Polish

### Task 5.1 — Dark theme "obsidian" (Material3 ColorScheme di Theme.kt) + app icon.
### Task 5.2 — Lengkapi FEATURE-MAPPING.md kolom Bukti + ROADMAP.
### Task 5.3 — `./gradlew assembleDebug` final + siapkan alur demo dosen.
