# Referensi Proyek: Music Discovery App (eks-KulKanvas) — Kotlin Native

> Status: referensi terkumpul per 2026-09-07. Nama final menunggu keputusan
> (kandidat ada di bawah). Ide: app katalog musik dari API gratis + preview audio.

## Kandidat Nama

| Nama | Arti/Alasan | Catatan |
|---|---|---|
| **Gema** ⭐ | "echo/gema" — bunyi yang mengalun; pendek, mudah diingat, sangat cocok utk audio | rekomendasi utama |
| Irama | "rhythm" dalam bahasa Indonesia; musikal & elegan | alternatif kuat |
| Nada | "nada/tone" — paling sederhana & langsung | mungkin sudah dipakai app lain |
| Senar | "string" (senar gitar) — unik, jarang dipakai | unik tapi kurang familier |
| Tempo | istilah musik universal, terdengar modern | umum dipakai produk lain |
| Laguin | "lagu" + akhiran app-style (-in) | fun, modern, Indonesia banget |

Sumber inspirasi nama: kumpulan nama music app di Reddit r/apps
(https://www.reddit.com/r/apps/comments/12o4zpo/i_need_a_name_idea_for_a_music_app/)
— pola nama yang menang: 1-2 suku kata, terkait suara/ritme, mudah diucapkan.

## Pemetaan Fitur Mata Kuliah (7 cakupan)

| # | Fitur | Implementasi di app | Referensi |
|---|---|---|---|
| 1 | JSON | Retrofit + Moshi, data lagu dari iTunes/Deezer API | bawah |
| 2 | Connectivity | ConnectivityManager + NetworkCallback, banner offline | bawah |
| 3 | Lazy loading | Paging 3 / RecyclerView pagination | bawah |
| 4 | Android audio | Media3 ExoPlayer play preview 30 detik | bawah |
| 5 | Push messaging | FCM notifikasi (lagu trending / now playing) | bawah |
| 6 | Remote crash logs | Firebase Crashlytics | bawah |
| 7 | Uploading & emailing | Share playlist via ACTION_SEND / export file + email | bawah |

## Referensi Teknis per Fitur

### 1. JSON — sumber data (sudah diverifikasi hidup via curl)
- iTunes Search API (resmi Apple, no key, return `previewUrl` audio + artwork):
  https://performance-partners.apple.com/search-api
  Contoh terverifikasi: `curl "https://itunes.apple.com/search?term=indonesia&entity=song&limit=2"`
- Deezer public API (no auth, field `preview` mp3 30 detik):
  https://developers.deezer.com/api — `curl "https://api.deezer.com/search?q=indonesia&limit=2"`
- Parsing: Retrofit + Moshi lengkap (Medium):
  https://medium.com/@sixtinbydizora/how-to-use-retrofit-with-moshi-and-kotlin-the-complete-guide-b7bd3d8bd91d
- Video: "Everything You Need To Know About Retrofit and Moshi" (Philipp Lackner):
  https://www.youtube.com/watch?v=s1jqC70uO7Q

### 2. Connectivity
- Official — Read network state (ConnectivityManager + NetworkCallback):
  https://developer.android.com/develop/connectivity/network-ops/reading-network-state
- Official — Monitor connectivity status:
  https://developer.android.com/training/monitoring-device-state/connectivity-status-type
- Video + source code: "Observe the REAL Internet Connectivity" (Philipp Lackner):
  https://www.youtube.com/watch?v=wvDPG2iQ-OE
  Source: https://github.com/philipplackner/InternetConnectionObserver

### 3. Lazy loading
- Official Paging 3 overview:
  https://developer.android.com/topic/libraries/architecture/paging/v3-overview
- Contoh project Paging 3 + RecyclerView (GitHub):
  https://github.com/rafsanahmad/RecyclerView-Paging-3.0

### 4. Android audio
- Official Media3 ExoPlayer (create player, MediaSession, background playback):
  https://developer.android.com/media/implement/playback-app
- Repo: https://github.com/androidx/media
- Deps: `androidx.media3:media3-exoplayer`, `media3-ui`, `media3-common` (1.11.0)

### 5. Push messaging
- Official FCM: https://firebase.google.com/docs/cloud-messaging
- Video: "Firebase Push Notifications on Android (FCM + Backend)" (Philipp Lackner):
  https://www.youtube.com/watch?v=q6TL2RyysV4
- Tutorial alternatif (GeeksforGeeks):
  https://www.geeksforgeeks.org/android/how-to-push-notification-in-android-using-firebase-cloud-messaging/

### 6. Remote crash logs
- Official Crashlytics setup (termasuk langkah force test crash):
  https://firebase.google.com/docs/crashlytics/android/get-started

### 7. Uploading and emailing
- Official — Send data to other apps (ACTION_SEND + EXTRA_TEXT/EXTRA_STREAM):
  https://developer.android.com/develop/ui/compose/sharing/send
- Penerapan: export playlist jadi teks/file → share ke email via chooser.
  Tanpa server sama sekali (paling ringan), atau via backend Resend kalau mau
  kirim email programatik.

## Catatan

- Firebase (FCM + Crashlytics) perlu project Firebase BARU khusus app ini —
  gratis. Belum pernah dipakai di proyek user (ABN pakai Resend/Supabase).
- Semua API musik di atas gratis & no key → tidak ada biaya & risiko kuota.
- Fitur 1-4 alami 100%. Fitur 5-7 bonus yang tetap wajar di app musik.
  Minimal 3 terpenuhi bahkan kalau 5-7 dibuang.
