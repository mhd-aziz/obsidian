# ROADMAP — Obsidian

Status progres eksekusi. Agent WAJIB update file ini setiap selesai task
(ganti ⬜ → ✅ + tanggal). Jangan hapus histori.

## Sprint 0 — Fondasi
- ✅ 0.1 Repo + docs tersalin ke repo proyek (2026-09-07)
- ✅ 0.2 Scaffold Expo project (blank-typescript, Expo SDK 57) — terverifikasi
  tsc OK, expo-doctor 21/21, dev server start OK (2026-09-08)
- ✅ 0.3 Dependencies terpasang (expo-audio, expo-notifications,
  @sentry/react-native, netinfo, jest-expo, expo-splash-screen) (2026-09-08)
- ✅ 0.4 .gitignore + aturan secret (.env, DSN Sentry) + coverage/ (2026-09-08)

## Sprint 1 — JSON + Lazy loading
- ✅ 1.1 Model + test parsing (TDD, Jest) — test di src/__tests__/ (2026-09-08)
- ✅ 1.2 API client + Repository — + timeout AbortController, 8 test (2026-09-08)
- ✅ 1.3 ViewModel + list UI + infinite scroll (FlatList) — +5 test
  MainViewModel; TDD menangkap bug guard double-fetch (2026-09-08)

## Sprint 2 — Connectivity + Audio
- ✅ 2.1 connectivity.ts (netinfo) + banner (TDD, 5 test) (2026-09-08)
- ✅ 2.2 PlayerScreen (expo-audio) + Alert preview null; verifikasi audio di
  device + screenshot menyusul (2026-09-08)

## Sprint 3 — Crash logs + Push (Expo)
- ✅ 3.1 Sentry setup (@sentry/react-native plugin + DSN env) + ForceCrashButton;
  verifikasi dashboard + screenshot menyusul (2026-09-08)
- ✅ 3.2 Push notification (expo-notifications) + PushTestButton (lokal);
  remote push via Expo tool + screenshot menyusul (2026-09-08)

## Sprint 4 — Uploading & emailing
- ✅ 4.1 PlaylistExporter + SharePlaylistButton (share sheet); screenshot
  menyusul (2026-09-08)

## Sprint 5 — Polish
- ✅ 5.1 Dark theme + splash screen + icon (expo-splash-screen) (2026-09-08)
- ✅ 5.4 Sumber data kedua Audius (full-length): audiusClient + mapper +
  TrackRepository routing + SourceToggle UI + debounce search + stale-guard +
  progress bar & seek di player; TDD 31→55 test hijau (2026-09-08)
- ✅ 5.5 UX polish: push organik (notifikasi "Lagu selesai diputar" saat
  preview/lagu habis — menggantikan tombol Test push artifisial), share
  per-lagu (tombol ⤴ di tiap baris TrackRow, share sheet terverifikasi di
  device), layar Diagnostik (⚙ di header: info app, status Sentry, Force
  crash + Render crash dengan konfirmasi — tersedia di build release untuk
  demo Sentry), state MainScreen dipertahankan via overlay + BackHandler
  (back hardware menutup overlay, tidak keluar app); verifikasi live di HP
  (search, share sheet, notifikasi tray, ErrorBoundary fallback); tsc +
  66 test hijau (2026-09-08)
- ✅ 5.2 Bukti demo: implementasi 7/7 selesai; screenshot tersedia di folder
  `screenshots/` (connectivity banner, iTunes search + preview,
  Audius full-length); deck presentasi di `persentase/obsidian-presentasi.pptx`
  (2026-09-08)
- ✅ 5.3 Build APK via EAS Build: eas.json dibuat (profile production,
  buildType apk, autoIncrement), EXPO_PUBLIC_* + SENTRY_AUTH_TOKEN di-upload
  ke EAS env production; build pertama gagal di upload source maps Sentry
  (sentry-cli tanpa org slug) → fix plugin @sentry/react-native/expo dengan
  org zisaltech + project obsidian (commit 09dae38); build 1f6fbfde sukses —
  APK 90MB ter-install di HP, verifikasi live di APK release: search OK,
  preview audio OK, notifikasi "Lagu selesai diputar" muncul, ErrorBoundary
  fallback tampil langsung (tanpa RedBox) dan pulih via "Coba Lagi"
  (2026-09-08)

## Keputusan terkunci (jangan diubah agent)

| Keputusan | Nilai | Tanggal |
|---|---|---|
| Nama app | Obsidian | 2026-09-07 |
| Arsitektur | MVVM (Repository → ViewModel → View) | 2026-09-07 |
| Stack v1 | Kotlin native + Android Studio (compose) — DIGANTI | 2026-09-07 |
| Stack FINAL | **Expo (React Native + TypeScript), SDK 57** — dosen hanya mensyaratkan aplikasi mobile, bahasa bebas; alasan resource & skill match | 2026-09-08 |
| Dev runtime | Expo Go di HP fisik via `npx expo start` (tanpa emulator/SDK lokal) | 2026-09-08 |
| Build APK | EAS Build (cloud) | 2026-09-08 |
| API data | iTunes Search API — gratis, tanpa key (fallback Deezer gratis) | 2026-09-07 |
| Sumber data kedua | **Audius API** (full-length, indie, tanpa key) via toggle UI — jalur A: iTunes tetap sumber utama; PRD out-of-scope full-length direvisi | 2026-09-08 |
| Push | expo-notifications (Expo Push Service) | 2026-09-08 |
| Crash | Sentry (expo-sentry), free tier | 2026-09-08 |
| Target fitur | 7/7 (minimum aman 3) | 2026-09-07 |
