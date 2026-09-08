# PRD — Obsidian (Music Discovery App)

> Dikembangkan dengan **Expo (React Native + TypeScript)** — dev via Expo Go
> di HP fisik, arsitektur **MVVM**, API data **gratis tanpa key** (iTunes
> Search API + Audius API). Detail teknis di ARCHITECTURE.md.

## 1. Ringkasan

Obsidian adalah aplikasi mobile Android untuk menemukan dan mendengarkan
musik. User mencari lagu, melihat katalog (cover, artis, album), memutar
preview 30 detik (iTunes) atau lagu utuh (Audius), dan membagikan playlist
favoritnya. Dibangun dengan Expo (React Native + TypeScript) untuk tugas mata
kuliah Pemrograman Mobile Lanjut (dosen mensyaratkan aplikasi mobile —
bahasa/framework bebas).

## 2. Target user

- Penikmat musik yang ingin mencari dan mencicipi lagu baru dengan cepat.
- (Konteks akademik) Dosen penguji yang menilai pemenuhan fitur mata kuliah.

## 3. User stories

1. Sebagai user, saya ingin mencari lagu berdasarkan kata kunci agar saya
   menemukan lagu yang saya cari.
2. Sebagai user, saya ingin daftar hasil yang dimuat bertahap saat saya scroll
   agar app tetap responsif.
3. Sebagai user, saya ingin memutar preview 30 detik sebuah lagu agar saya bisa
   mencicipinya sebelum memutuskan.
4. Sebagai user, saya ingin diberi tahu saat koneksi internet hilang agar saya
   paham kenapa daftar tidak dimuat.
5. Sebagai user, saya ingin menerima notifikasi push (mis. lagu trending) agar
   saya kembali membuka app.
6. Sebagai user, saya ingin membagikan playlist favorit saya via email/WhatsApp
   agar teman saya bisa melihat rekomendasi saya.
7. Sebagai user, saya ingin memilih sumber data (iTunes katalog lengkap /
   Audius lagu utuh) agar saya bisa mendengar lagu penuh, bukan cuma preview.

## 4. Scope

### In scope
- Pencarian lagu via iTunes Search API (katalog komersial, preview 30 dtk).
- Sumber data kedua via Audius API (musik indie, full-length, gratis tanpa
  key) — toggle sumber di UI (keputusan user 2026-09-08, jalur A).
- List lagu dengan pagination (infinite scroll).
- Player audio 30 detik (iTunes) / lagu utuh (Audius) via expo-audio, dengan
  progress bar + seek.
- Banner deteksi konektivitas real-time.
- Notifikasi push via expo-notifications (Expo Push Service).
- Crash reporting via Sentry (expo-sentry).
- Share/export playlist via Android share sheet (email).
- Dark theme "obsidian" (hitam mengkilap).

### Out of scope (YAGNI — tidak dikerjakan)
- Full-track streaming musik KOMERSIAL (butuh langganan/DRM; full-length hanya
  via katalog Audius).
- Login / autentikasi user.
- Backend sendiri (semua data dari API publik + layanan cloud Expo/Sentry).
- iOS / web version.

## 5. Success criteria

1. Minimal 3 dari 7 fitur mata kuliah terpenuhi dan ter-demonstrasi; target
   plan ini 7/7 (lihat FEATURE-MAPPING.md).
2. App tidak crash pada alur normal: search → scroll → play → share.
3. Semua fitur punya bukti demo (screenshot/video) di `docs/screenshots/`.
4. Kode lolos `npx tsc --noEmit`, `npm run test` (Jest), dan `npx expo-doctor`.
