# ROADMAP — Obsidian

Status progres eksekusi. Agent WAJIB update file ini setiap selesai task
(ganti ⬜ → ✅ + tanggal). Jangan hapus histori.

## Sprint 0 — Fondasi
- ⬜ 0.1 Repo + docs tersalin ke repo proyek
- ⬜ 0.2 Scaffold Android project (com.application.obsidian, minSdk 26)
- ⬜ 0.3 Dependencies terpasang (Retrofit, Moshi, Media3, Coil)
- ⬜ 0.4 .gitignore + aturan Firebase

## Sprint 1 — JSON + Lazy loading
- ⬜ 1.1 Model + test parsing (TDD)
- ⬜ 1.2 API service + Repository
- ⬜ 1.3 ViewModel + list UI + infinite scroll

## Sprint 2 — Connectivity + Audio
- ⬜ 2.1 ConnectivityObserver + banner (TDD)
- ⬜ 2.2 PlayerActivity ExoPlayer

## Sprint 3 — Firebase
- ⬜ 3.1 Project Firebase + google-services.json
- ⬜ 3.2 Crashlytics terverifikasi (test crash)
- ⬜ 3.3 FCM push notification

## Sprint 4 — Uploading & emailing
- ⬜ 4.1 PlaylistExporter + share via email

## Sprint 5 — Polish
- ⬜ 5.1 Dark theme + icon
- ⬜ 5.2 Bukti demo lengkap (FEATURE-MAPPING)
- ⬜ 5.3 Build final + alur demo dosen

## Keputusan terkunci (jangan diubah agent)

| Keputusan | Nilai | Tanggal |
|---|---|---|
| Nama app | Obsidian | 2026-09-07 |
| Stack | Kotlin native + Android Studio + MVVM | 2026-09-07 |
| UI toolkit | **Jetpack Compose + Material3** (revisi dari XML+RecyclerView — keputusan final user 2026-09-08) | 2026-09-08 |
| Package | `com.application.obsidian` (ikut scaffold, tidak di-rename — 2026-09-08) | 2026-09-08 |
| API data | iTunes Search API — gratis, tanpa key (fallback Deezer gratis) | 2026-09-07 |
| Push/Crash | Firebase (FCM + Crashlytics) | 2026-09-07 |
| Target fitur | 7/7 (minimum aman 3) | 2026-09-07 |
