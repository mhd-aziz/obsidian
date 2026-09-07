# AI-AGENT-GUIDE — Urutan Eksekusi Task Obsidian

Instruksi eksekusi untuk AI agent. Eksekusi berurutan. Satu task = satu commit.
Setiap task punya Acceptance Criteria (AC) — task belum selesai jika AC belum
terpenuhi. Progres dicatat di ROADMAP.md.

Environment FINAL: **Expo (React Native + TypeScript)**. Acuan resmi:
https://docs.expo.dev/. Verifikasi tiap task: `npx tsc --noEmit`,
`npm run test` (Jest, mulai Sprint 1), dan `npx expo-doctor`.

## Sprint 0 — Fondasi

### Task 0.1 — Repo + docs
- [SELESAI] Repo terhubung ke GitHub `mhd-aziz/obsidian`, docs ter-push.

### Task 0.2 — Scaffold
- [SELESAI 2026-09-08] `create-expo-app --template blank-typescript` (Expo SDK
  57, RN 0.86, React 19.2). Terverifikasi: `tsc --noEmit` OK,
  `expo-doctor` 21/21, dev server start OK.
- AC: `npx expo start` jalan + Expo Go di HP bisa connect. Commit:
  `chore: scaffold expo project`.

### Task 0.3 — Dependencies + config app.json
- `npx expo install expo-audio expo-notifications expo-sentry
  @react-native-community/netinfo jest-expo jest @types/jest`
- app.json: name Obsidian, dark splash/icon, plugin sentry+notifications.
- AC: `npx expo-doctor` tetap hijau. Commit: `chore: add feature deps`.

### Task 0.4 — Git hygiene
- [SELESAI] .gitignore: node_modules, .expo, dist, .env (bawaan template +
  tambahan .env).

## Sprint 1 — JSON + Lazy loading

### Task 1.1 — Model + test parsing (TDD)
- Tulis `src/models/Track.test.ts` DULU: sample JSON iTunes (docs/API.md) →
  parse/normalisasi → HARUS GAGAL (belum ada implementasi).
- Implement `src/models/Track.ts` + `SearchResponse.ts` (TypeScript types +
  fungsi normalisasi field nullable: artworkUrl100→512, previewUrl?, etc).
- AC: `npm run test` PASS. Commit: `test+feat: itunes model parsing`.

### Task 1.2 — API client + Repository
- `src/api/itunesClient.ts` (fetch, params sesuai API.md),
  `src/repositories/TrackRepository.ts` (search(term, offset), error handling
  network/HTTP, timeout).
- Unit test repository dengan fetch di-mock.
- AC: test PASS; curl manual ke API masih 200. Commit:
  `feat: itunes repository`.

### Task 1.3 — ViewModel + list UI + lazy loading
- `src/viewmodels/MainViewModel.ts`: state tracks/isLoading/isOffline/error,
  `search(term)`, `loadMore()` (offset += 25, append, guard sedang-loading).
- `src/screens/MainScreen.tsx` (TextInput search + FlatList +
  OfflineBanner placeholder) + `src/components/TrackRow.tsx` (Image artwork,
  keyExtractor = trackId).
- Lazy loading: `FlatList` prop `onEndReached` (threshold ~0.5) → `loadMore()`.
- AC: app jalan di Expo Go, search "indonesia" menampilkan hasil, scroll
  memuat halaman berikutnya (log `Loaded page 2, offset=25`). Screenshot →
  `docs/screenshots/list.png`. Commit:
  `feat: searchable track list with infinite scroll`.

## Sprint 2 — Connectivity + Audio

### Task 2.1 — Connectivity observer (TDD)
- Test dulu (mock netinfo) → gagal → implement `src/utils/connectivity.ts`
  (subscribe → boolean state) + integrasi ke MainViewModel + OfflineBanner.
- AC: airplane mode toggle di HP → banner muncul/hilang. Screenshot
  `docs/screenshots/offline-banner.png`. Commit:
  `feat: live connectivity banner`.

### Task 2.2 — PlayerScreen (expo-audio)
- Tap item → layar player (cover besar, judul, artis, play/pause, progress);
  `expo-audio` `createAudioPlayer` + `setAudioModeAsync`.
- release/unload player saat unmount (wajib).
- Handle previewUrl null/gagal → Alert "Preview tidak tersedia"
  (lihat API.md catatan 2).
- AC: preview terdengar di HP, pause/play bekerja, back → audio berhenti.
  Screenshot/video `docs/screenshots/player.png|.mp4`. Commit:
  `feat: preview audio player`.

## Sprint 3 — Crash logs + Push (Expo: Sentry + notifications)

### Task 3.1 — Sentry setup
- Akun Sentry free tier → `npx expo install expo-sentry` + DSN di app.json/
  eas.json secret.
- Tombol debug "Force crash" (build dev) → verifikasi muncul di dashboard.
- AC: crash terlihat di Sentry console. Screenshot
  `docs/screenshots/sentry.png`. Commit: `feat: remote crash reporting`.

### Task 3.2 — Push notifications
- `src/services/notifications.ts`: register push token (Expo push service),
  handler notifikasi; kirim test via Expo push tool (exp.host/~notify).
- AC: notifikasi tampil di device → tap → app terbuka. Screenshot
  `docs/screenshots/push.png`. Commit: `feat: push notifications`.

## Sprint 4 — Emailing

### Task 4.1 — PlaylistExporter
- Tombol "Share playlist" → kumpulkan hasil search → teks
  ("Obsidian Playlist\n1. Artist — Title\n...") → `Share.share({message})`
  (share sheet Android; opsi Gmail/email di dalamnya).
- Fungsi buildPlaylistText murni → unit test.
- AC: share sheet terbuka dengan draft berisi daftar lagu. Screenshot
  `docs/screenshots/share-email.png`. Commit: `feat: share playlist via email`.

## Sprint 5 — Polish

### Task 5.1 — Dark theme "obsidian" (StyleSheet + palet hitam mengkilap di
theme.ts) + app icon/splash.
### Task 5.2 — Lengkapi FEATURE-MAPPING.md kolom Bukti + ROADMAP.
### Task 5.3 — Build APK via EAS Build (`eas build -p android --profile
preview`) + siapkan alur demo dosen.
