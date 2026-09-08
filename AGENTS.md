# AGENTS.md — Obsidian (Mobile Music Discovery App, Expo)

Ini adalah file instruksi utama untuk AI coding agent (Claude Code, Codex,
Cursor, dsb). Baca file ini PERTAMA sebelum menulis kode.

## Ringkasan proyek (one-liner)

Aplikasi mobile Android "Obsidian": pencarian musik dari iTunes Search API
(gratis, tanpa API key) dengan preview audio 30 detik. Dikembangkan dengan
**Expo (React Native + TypeScript)** — arsitektur **MVVM** (keputusan final
user 2026-09-08, menggantikan rencana Kotlin; dosen hanya mensyaratkan
"aplikasi mobile", bahasa bebas). Dibangun untuk tugas mata kuliah Pemrograman
Mobile Lanjut yang menilai minimal 3 dari 7 fitur (JSON, Connectivity, Lazy
loading, Remote crash logs, Uploading and emailing, Push messaging, Android
audio) — plan ini menargetkan 7/7.

## Sebelum mulai kerja — WAJIB baca (urutan)

1. `docs/PRD.md` — apa yang dibangun, scope in/out
2. `docs/ARCHITECTURE.md` — tech stack FINAL + struktur folder + aturan arsitektur
3. `docs/FEATURE-MAPPING.md` — 7 fitur penilaian dan lokasi kodenya
4. `docs/CONVENTIONS.md` — gaya kode, TDD, commit, verifikasi
5. `docs/AI-AGENT-GUIDE.md` — urutan task yang harus dieksekusi
6. `docs/API.md` — kontrak iTunes API + jebakan (nullable fields, fallback Deezer)
7. `docs/ROADMAP.md` — status progres saat ini

## Aturan kerja agent (hard rules)

1. Eksekusi task BERURUTAN dari `docs/AI-AGENT-GUIDE.md`. Jangan lompat task.
2. Satu task = satu commit dengan message conventional (`feat:`, `chore:`, ...).
3. Sebelum menulis fitur baru, cek FEATURE-MAPPING.md: apakah task ini
   menggerakkan salah satu dari 7 fitur? Kalau tidak, tanyakan dulu (YAGNI).
4. Ikuti struktur folder di ARCHITECTURE.md §2 persis. Jangan buat file di
   luar struktur tanpa alasan yang dijelaskan di commit.
5. JANGAN pernah commit `node_modules/`, `.expo/`, `dist/`, `.env`, atau
   secret apa pun (DSN Sentry, keystore EAS).
6. Logic tanpa UI wajib TDD: test GAGAL dulu → implement → PASS → commit
   (`npm run test`). Verifikasi sebelum push: `npx tsc --noEmit`,
   `npm run test`, dan `npx expo-doctor` semuanya hijau.
7. Jangan menambah dependency di luar daftar ARCHITECTURE.md §1 tanpa alasan;
   dependency Expo baru SELALU via `npx expo install` (bukan npm install).
8. Jangan mengganti keputusan final (Expo/React Native, MVVM, iTunes API)
   tanpa persetujuan user — keputusan ini sudah dikunci di diskusi planning.
9. Environment SELALU Expo/React Native + TypeScript. File Kotlin/Gradle/
   layout XML DILARANG ada kembali di repo (keputusan final user 2026-09-08).
10. Kalau menemukan situasi yang tidak tercakup docs, BERHENTI dan tanya user,
    jangan mengarang keputusan arsitektur sendiri.
11. Bahasa: kode & commit English, komunikasi ke user Bahasa Indonesia.

## Definisi selesai (project-level)

- 7/7 fitur di FEATURE-MAPPING.md punya implementasi + bukti screenshot di
  `/screenshots`.
- `npx tsc --noEmit`, `npm run test` (Jest), dan `npx expo-doctor` hijau.
- APK demo ter-build via EAS Build.
- Semua commit ter-push ke GitHub `mhd-aziz/obsidian`.
