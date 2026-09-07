# 🎵 Obsidian

<div align="center">

**Music Discovery App — jelajahi & dengarkan preview lagu dari seluruh dunia**

Kotlin • Android Studio • MVVM

</div>

---

## Tentang

Obsidian adalah aplikasi Android untuk mencari dan menemukan musik. Ketik nama
lagu atau artis → jelajahi hasilnya → dengarkan preview 30 detik langsung dari
aplikasi. Data musik disediakan oleh [iTunes Search API](https://performance-partners.apple.com/search-api)
(gratis, tanpa API key).

## ✨ Fitur

- 🔍 **Pencarian musik** — cari jutaan lagu lewat iTunes Search API
- 🎧 **Preview audio** — putar cuplikan 30 detik dengan Media3 ExoPlayer
  (play/pause, seekbar)
- ♾️ **Infinite scroll** — hasil dimuat otomatis saat digulir, tanpa tombol next
- 📶 **Deteksi koneksi** — banner real-time saat offline, kembali normal saat
  online
- 🔔 **Push notification** — notifikasi dari cloud via Firebase Cloud Messaging
- 🛡️ **Crash reporting** — laporan crash otomatis ke Firebase Crashlytics
- 📤 **Share playlist** — bagikan daftar lagu ke Gmail/WhatsApp dalam satu ketuk
- ❤️ **Favorit** — simpan lagu yang disukai (penyimpanan lokal)

## 🏗️ Tech Stack & Arsitektur

| Komponen | Teknologi |
|---|---|
| Bahasa | Kotlin |
| UI | XML Layout + RecyclerView (Android Studio) |
| Arsitektur | MVVM (View → ViewModel → Repository) |
| Networking | Retrofit 2 + Moshi |
| Audio | Media3 ExoPlayer |
| Image loading | Coil |
| Push & Crash | Firebase Cloud Messaging + Crashlytics |
| Min SDK | 26 (Android 8.0) |

## 📸 Screenshot

> Akan ditambahkan setelah implementasi UI.

| Pencarian & Daftar Lagu | Player Preview |
|:---:|:---:|
| _screenshot 1_ | _screenshot 2_ |

## 🔧 Build

1. Clone repo ini
2. Buka di **Android Studio** (Jellyfish / lebih baru)
3. Sync Gradle → Run ▶ di emulator atau device fisik

```bash
git clone https://github.com/mhd-aziz/obsidian.git
```

Tidak perlu API key — sumber data musik gratis dan terbuka.

## 📄 License

Dibuat sebagai proyek Pemrograman Mobile Lanjut © 2026 [mhd-aziz](https://github.com/mhd-aziz)
