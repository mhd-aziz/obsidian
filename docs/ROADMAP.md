# ROADMAP — Obsidian

Status progres eksekusi. Agent WAJIB update file ini setiap selesai task
(ganti ⬜ → ✅ + tanggal). Jangan hapus histori.

## Sprint 0 — Fondasi
- ✅ 0.1 Repo + docs tersalin ke repo proyek (2026-09-07)
- ✅ 0.2 Scaffold Expo project (blank-typescript, Expo SDK 57) — terverifikasi
  tsc OK, expo-doctor 21/21, dev server start OK (2026-09-08)
- ⬜ 0.3 Dependencies terpasang (expo-audio, expo-notifications, expo-sentry,
  netinfo, jest-expo)
- ⬜ 0.4 .gitignore + aturan secret (.env, DSN Sentry)

## Sprint 1 — JSON + Lazy loading
- ⬜ 1.1 Model + test parsing (TDD, Jest)
- ⬜ 1.2 API client + Repository
- ⬜ 1.3 ViewModel + list UI + infinite scroll (FlatList)

## Sprint 2 — Connectivity + Audio
- ⬜ 2.1 connectivity.ts (netinfo) + banner (TDD)
- ⬜ 2.2 PlayerScreen (expo-audio)

## Sprint 3 — Crash logs + Push (Expo)
- ⬜ 3.1 Sentry setup + test crash terverifikasi
- ⬜ 3.2 Push notification (expo-notifications) + test via push tool

## Sprint 4 — Uploading & emailing
- ⬜ 4.1 PlaylistExporter + share via share sheet

## Sprint 5 — Polish
- ⬜ 5.1 Dark theme + icon/splash
- ⬜ 5.2 Bukti demo lengkap (FEATURE-MAPPING)
- ⬜ 5.3 Build APK via EAS Build + alur demo dosen

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
| Push | expo-notifications (Expo Push Service) | 2026-09-08 |
| Crash | Sentry (expo-sentry), free tier | 2026-09-08 |
| Target fitur | 7/7 (minimum aman 3) | 2026-09-07 |
