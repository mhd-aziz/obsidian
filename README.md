# Obsidian — Music Discovery App

Aplikasi mobile Android untuk pencarian musik dari iTunes Search API (gratis,
tanpa API key) dengan preview audio 30 detik.

- 🎧 **Preview audio** — putar cuplikan 30 detik dengan expo-audio
- 🔍 **Pencarian real-time** — hasil langsung dari iTunes Search API
- ♾️ **Lazy loading** — daftar dimuat bertahap saat scroll (FlatList)
- 📡 **Connectivity** — banner otomatis saat koneksi hilang (netinfo)
- 🔔 **Push notification** — notifikasi dari cloud via expo-notifications
- 🛡️ **Crash reporting** — laporan crash otomatis ke Sentry (expo-sentry)
- 📤 **Share playlist** — bagikan daftar lagu via share sheet / email

Dibangun untuk tugas mata kuliah Pemrograman Mobile Lanjut — target 7/7 fitur
penilaian.

## Tech stack

| Komponen | Pilihan |
|---|---|
| Framework | Expo SDK 57 (React Native 0.86, React 19.2) |
| Bahasa | TypeScript |
| Arsitektur | MVVM (Model → ViewModel hook → View) |
| Networking | fetch (iTunes Search API) |
| Audio | expo-audio |
| Push & Crash | expo-notifications + Sentry |
| Build APK | EAS Build (cloud) |

## Menjalankan project

1. `npm install`
2. `npx expo start`
3. Scan QR dari app **Expo Go** di HP (atau tekan `a` untuk emulator).

Detail planning lengkap ada di `docs/` (mulai dari `docs/PRD.md`).
