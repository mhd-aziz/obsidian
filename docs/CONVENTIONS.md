# CONVENTIONS — Obsidian

Aturan konsistensi untuk AI agent & programmer. Jangan melanggar tanpa alasan
yang dijelaskan di commit message.

## Bahasa & gaya kode

- Kode, nama variabel/fungsi/kelas, commit message: **Inggris**.
- Komentar kode & docs folder ini: boleh Indonesia.
- Kotlin idiomatik: data class untuk model, suspend fun untuk IO, StateFlow
  untuk state UI. Hindari Java-style getter/setter.

## Penamaan

- Package: `com.mhdaziz.obsidian` (jangan diubah).
- Kelas: PascalCase sesuai struktur di ARCHITECTURE.md — jangan bikin file baru
  di luar struktur tanpa alasan.
- Resource: `activity_main.xml`, `item_track.xml`, `activity_player.xml`;
  id view: snake_case (`rv_tracks`, `search_bar`, `banner_offline`).

## TDD (wajib untuk logic tanpa UI)

Urutan: tulis test dulu → jalankan & PASTIKAN GAGAL → implement minimal →
jalankan & PASS → commit.
```bash
./gradlew test          # expected: BUILD FAILED saat red, BUILD SUCCESSFUL saat green
```
Yang wajib test: parsing JSON (SearchResponseTest), logika pagination
(MainViewModelTest dengan coroutine test). Yang cukup manual-test: audio,
banner connectivity, FCM, share intent (butuh environment Android).

## Git workflow

- Satu task = satu commit. Commit message conventional:
  `feat:`, `fix:`, `chore:`, `docs:`, `test:`.
- Push ke `main` setiap selesai task (repo private, solo dev).
- JANGAN commit: `google-services.json`, `local.properties`, `build/`,
  `.idea/` (lihat .gitignore).

## Verification commands (jalankan sebelum setiap push)

```bash
./gradlew test          # semua test hijau
./gradlew assembleDebug # BUILD SUCCESSFUL
```

## Dependency policy

- Tambah dependency baru HANYA jika tidak bisa diselesaikan dengan yang sudah
  ada di ARCHITECTURE.md §1. Kalau perlu, jelaskan alasannya di commit.
- Versi dependency mengikuti yang tertulis di ARCHITECTURE.md, kecuali ada
  konflik compile.
