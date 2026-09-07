# CONVENTIONS — Obsidian

Aturan konsistensi untuk AI agent & programmer. Jangan melanggar tanpa alasan
yang dijelaskan di commit message.

## Bahasa & gaya kode

- Kode, nama variabel/fungsi/kelas, commit message: **Inggris**.
- Komentar kode & docs folder ini: boleh Indonesia.
- TypeScript idiomatik: `type`/`interface` untuk model, async/await untuk IO,
  custom hook untuk ViewModel, komponen presentational stateless untuk UI.
  Hindari `any`; `strict` mode tsconfig tetap on.

## Penamaan

- File model/viewmodel/util: camelCase (`Track.ts`, `MainViewModel.ts`).
- Komponen & screen: PascalCase file & nama (`MainScreen.tsx`, `TrackRow.tsx`,
  `OfflineBanner.tsx`).
- Event handler props: `onTrackPress`, `onSearch`.
- Hook ViewModel: `useMainViewModel`, `usePlayerViewModel` — sesuai struktur di
  ARCHITECTURE.md, jangan bikin file baru di luar struktur tanpa alasan.

## TDD (wajib untuk logic tanpa UI)

Urutan: tulis test dulu → jalankan & PASTIKAN GAGAL → implement minimal →
jalankan & PASS → commit.
```bash
npm run test            # Jest + jest-expo; expected: RED dulu, lalu GREEN
```
Yang wajib test: parsing/normalisasi JSON (Track.test.ts), logika pagination
(MainViewModel.test.ts dengan fetch mock), playlistExporter. Yang cukup
manual-test di Expo Go: audio, banner connectivity, push notification,
share sheet (butuh device nyata).

## Git workflow

- Satu task = satu commit. Commit message conventional:
  `feat:`, `fix:`, `chore:`, `docs:`, `test:`.
- Push ke `main` setiap selesai task (repo solo dev).
- JANGAN commit: `node_modules/`, `.expo/`, `dist/`, `.env`, keystore/EAS
  credentials (lihat .gitignore).

## Verification commands (jalankan sebelum setiap push)

```bash
npx tsc --noEmit        # type check
npm run test            # semua test hijau (mulai Sprint 1)
npx expo-doctor         # 21/21 checks passed
npx expo start          # app load di Expo Go (manual, per task UI)
```
