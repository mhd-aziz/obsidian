# Obsidian — Music Discovery App (Android, Expo/React Native)

Dokumen planning untuk pengembangan aplikasi mobile Android **Obsidian** dengan
bantuan AI coding agent (vibe coding). Folder ini adalah sumber kebenaran
(source of truth) sebelum repo proyek dibuat.

## Struktur dokumen

| File | Isi | Dipakai AI agent untuk |
|---|---|---|
| [PRD.md](PRD.md) | Kebutuhan produk, user story, scope | memahami WHAT yang dibangun |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Tech stack, struktur modul, data flow | memahami HOW dan struktur file |
| [API.md](API.md) | Kontrak API iTunes + fallback Deezer | membuat service layer & model |
| [FEATURE-MAPPING.md](FEATURE-MAPPING.md) | Pemetaan 7 fitur mata kuliah → implementasi → cara demo | memastikan fitur penilaian terpenuhi |
| [CONVENTIONS.md](CONVENTIONS.md) | Konvensi kode, commit, TDD, git workflow | menjaga konsistensi gaya kode |
| [AI-AGENT-GUIDE.md](AI-AGENT-GUIDE.md) | Urutan tugas + aturan kerja agent + acceptance criteria | instruksi eksekusi per sprint |
| [ROADMAP.md](ROADMAP.md) | Sprint plan ringkas & status | tracking progres |
| [referensi.md](referensi.md) | Kumpulan link referensi teknis per fitur | rujukan saat mentok |

## Cara pakai dengan AI agent

1. Salin seluruh folder `docs/` ini ke root repo proyek
   (`/media/bazyngan/DATA/Documents/obsidian/docs/`).
2. Salin juga `AGENTS.md` (file ini di-rename) ke root repo — banyak agent
   (Claude Code, Codex, dsb.) otomatis membaca file tersebut sebagai instruksi.
3. Mulai dari `AI-AGENT-GUIDE.md`: kerjakan task satu per satu, satu task =
   satu commit, jangan lompat task.
