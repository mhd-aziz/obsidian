# ARCHITECTURE — Obsidian

> Environment FINAL: **Expo (React Native + TypeScript)** — keputusan user
> 2026-09-08 (menggantikan rencana awal Kotlin native; dosen hanya mensyaratkan
> "aplikasi mobile", bahasa bebas). Alasan: hemat resource (tanpa Android
> SDK/emulator lokal — dev via Expo Go di HP fisik), match skill user (React),
> build APK via EAS Build cloud.
> Dokumen ini SOURCE OF TRUTH struktur folder & aturan arsitektur. AI agent
> WAJIB menaruh file baru persis mengikuti pohon di §2 — tidak ada file baru
> di luar struktur ini tanpa update dokumen ini dulu.
> Acuan resmi: https://docs.expo.dev/

## 1. Tech stack (FINAL)

| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | **Expo SDK 57** (React Native 0.86, React 19.2) | scaffold resmi `create-expo-app --template blank-typescript`, sudah terpasang & terverifikasi (expo-doctor 21/21) |
| Bahasa | TypeScript | type-safe, match skill user (React) |
| Arsitektur | **MVVM** (View → ViewModel → Model/Repository) | pola yang dituntut dosen/industri — TETAP, hanya lingkungan yang berubah |
| UI | React Native components (`View`, `FlatList`, `Pressable`) + StyleSheet | bawaan RN, tanpa dependency UI eksternal |
| Networking | `fetch` (bawaan) + TypeScript types | iTunes API sederhana GET JSON — fetch cukup (YAGNI axios) |
| Audio | `expo-audio` (~57.x) | pengganti resmi expo-av yang deprecated; play stream URL (preview iTunes / full-length Audius) |
| Image loading | `Image` bawaan RN | cover artwork statis — cukup bawaan (YAGNI) |
| Connectivity | `@react-native-community/netinfo` | standar de-facto RN, dipasang di Sprint 2 |
| Push | `expo-notifications` | API resmi Expo, di bawah hood FCM |
| Crash logs | `expo-sentry` (Sentry) | integrasi first-class Expo, free tier; Crashlytics native butuh config layer yang jauh lebih ribet |
| Share/email | `Share` API RN + `Linking.openURL("mailto:")` | bawaan, tanpa dependency |
| Build APK | **EAS Build** (cloud) | tanpa Android SDK lokal; free tier tersedia |
| Dev runtime | **Expo Go** di HP fisik (scan QR dari `npx expo start`) | hot reload tanpa emulator — inilah solusi keterbatasan resource |

### 1.1 Pemetaan MVVM

| Layer MVVM | Komponen Obsidian | Fitur |
|---|---|---|
| **Model** | `src/models/` + `src/api/` + `src/repositories/` | JSON |
| **ViewModel** | `src/viewmodels/` (semua *ViewModel.ts, React hooks) | Lazy loading, state |
| **View** | `App.tsx` + semua komponen React (`src/screens/`, `src/components/`) | Audio, Connectivity |
| Service (di luar MVVM klasik) | `src/services/` (notifications) | Push |
| Util (pendukung) | `src/utils/` | Connectivity, Emailing |

Aturan MVVM yang dijaga (HARD RULES):
1. View (komponen React) TIDAK menyentuh Model langsung — hanya lewat ViewModel.
2. ViewModel = custom hook (`useXViewModel`) yang return state + actions;
   state UI di-expose sebagai satu object per layar (UiState).
3. ViewModel TIDAK mengimpor React Native components (UI-free, bisa di-unit-test).
4. Satu layar = satu ViewModel (`MainViewModel`, `PlayerViewModel`).
5. Hanya Repository yang boleh memanggil `fetch` ke iTunes; ViewModel dilarang.
6. Komponen presentational stateless: data & callback masuk lewat props.

## 2. Struktur folder LENGKAP (source of truth)

```
obsidian/
├── App.tsx                    # root: navigation state (main ↔ player) + providers
├── index.ts                   # entrypoint RN (bawaan template)
├── app.json                   # config Expo (name, icon, splash, plugins)
├── package.json / tsconfig.json
├── assets/                    # icon, splash, adaptive-icon (bawaan template)
│
└── src/
    ├── models/                # ══ LAYER MODEL (MVVM) ══
    │   ├── Track.ts               # type/interface lagu + TrackSource (itunes|audius)
    │   ├── SearchResponse.ts      # { resultCount, results: Track[] } (iTunes)
    │   └── AudiusTrack.ts         # raw Audius → Track mapper (toTrack)
    │
    ├── api/                   # HTTP murni (tanpa state)
    │   ├── itunesClient.ts        # fetch iTunes Search API (term/entity/limit/offset)
    │   └── audiusClient.ts        # fetch Audius API (discovery host, search, stream URL)
    │
    ├── repositories/          # SATU-SATUNYA pemanggil API yang boleh dipakai VM
    │   └── TrackRepository.ts     # search(term, offset, limit, source) → Promise<Track[]>
    │                              # routing: source='itunes' → itunesClient,
    │                              #          source='audius' → audiusClient+toTrack
    │
    ├── viewmodels/            # ══ LAYER VIEWMODEL (MVVM) ══
    │   ├── MainViewModel.ts       # useMainViewModel(): tracks, isLoading, isOffline,
    │   │                          #   source, search(), onQueryChange() (debounce),
    │   │                          #   changeSource(), loadMore(), error
    │   └── PlayerViewModel.ts     # usePlayerViewModel(): isPlaying, position, duration,
    │                              #   play(), pause(), seekTo()
    │
    ├── __tests__/              # unit test Jest (kolokasi terpusat)
    │   ├── Track.test.ts           # parsing/normalisasi model
    │   ├── AudiusTrack.test.ts     # mapper Audius → Track
    │   ├── audiusClient.test.ts    # client Audius + discovery host cache
    │   ├── MainViewModelSource.test.ts  # toggle iTunes ↔ Audius + stale guard
    │   ├── MainViewModelDebounce.test.ts # debounce TextInput
    │   ├── formatTime.test.ts      # format mm:ss
    │   ├── errors.test.ts          # AppError + GlobalErrorHandler
    │   └── playlistExporter.test.ts
    │
    ├── screens/               # ══ LAYER VIEW (MVVM) ══
    │   ├── MainScreen.tsx         # SearchBar + SourceToggle + FlatList + OfflineBanner
    │   ├── PlayerScreen.tsx       # cover besar + play/pause + progress bar + seek
    │   └── DiagnosticsScreen.tsx  # info app + status Sentry + force/render crash
    │
    ├── components/            # komponen reusable lintas layar
    │   ├── TrackRow.tsx           # item list (cover, judul, artis, badge sumber, share ⤴)
    │   ├── SourceToggle.tsx       # pemilih sumber iTunes ↔ Audius
    │   ├── OfflineBanner.tsx      # banner konektivitas
    │   ├── GlobalErrorBoundary.tsx # fallback UI crash (Oops + Coba Lagi)
    │   └── EmptyStateView.tsx     # "no results" / "offline"
    │
    ├── services/              # ── Android/OS service (di luar MVVM klasik)
    │   └── notifications.ts       # expo-notifications: register + handler
    │
    └── utils/                 # ── Helper murni (di-unit-test Jest)
        ├── connectivity.ts        # subscribe netinfo → callback/boolean
        ├── playlistExporter.ts    # build teks playlist (fungsi murni)
        ├── formatTime.ts          # detik → "m:ss" (progress bar)
        └── constants.ts           # base URL, limit=25, debounce, konstanta Audius
```

### Aturan penempatan file (untuk AI agent)

| Jenis file | Taruh di | Contoh |
|---|---|---|
| Type/interface data | `src/models/` | `Track.ts` |
| HTTP client mentah | `src/api/` | `itunesClient.ts` |
| Repository | `src/repositories/` | `TrackRepository.ts` |
| ViewModel layar X | `src/viewmodels/XViewModel.ts` | `MainViewModel.ts` |
| Screen | `src/screens/XScreen.tsx` | `MainScreen.tsx` |
| Komponen reusable | `src/components/` | `TrackRow.tsx`, `GlobalErrorBoundary.tsx` |
| Service OS (notif) | `src/services/` | `notifications.ts` |
| Helper murni (testable Jest) | `src/utils/` | `playlistExporter.ts` |
| Unit test | folder `src/__tests__/` (test Match via jest-expo) | `src/__tests__/Track.test.ts` |
| Konstanta teks UI | langsung di komponen (RN); i18n tidak dibutuhkan (YAGNI) | — |

## 3. Data flow

```
User ketik "indonesia" di MainScreen
        │  onSearch(term)
        ▼
useMainViewModel().search(term)
        │
        ▼
TrackRepository.search(term, offset)  ← SATU-SATUNYA pemanggil fetch
        │
        ▼
itunesClient.ts → GET https://itunes.apple.com/search?...&entity=song&limit=25
audiusClient.ts → GET {host}/v1/tracks/search?...&app_name=obsidian   (full-length)
        │ (TrackRepository routing by source: 'itunes' | 'audius')
        ▼
SearchResponse / data[] → Track[]  (validasi & normalisasi field nullable;
                                    Audius raw → toTrack() di models/AudiusTrack.ts)
        │
        ▼
useState di MainViewModel ──props──► FlatList (keyExtractor = trackId)
        │  onEndReached saat scroll → offset+=25 → APPEND
        ▼
tap item → setScreen(player, track) → usePlayerViewModel
        → expo-audio player.replace(previewUrl/streamUrl) → play()
        → progress bar (position/duration) + seekTo()

Lateral:
  SourceToggle (View) → changeSource() → reload query aktif dari sumber baru
  connectivity.ts (netinfo) → isOffline state → OfflineBanner tampil/hilang
  playlistExporter.ts → Share.share({message}) → share sheet Android
  notifications.ts → expo-notifications → push notification
  Sentry (expo-sentry) → crash otomatis terlapor
```

## 4. Keputusan arsitektur penting (jangan dilanggar agent)

1. SATU pintu data: TrackRepository (routing iTunes/Audius di dalamnya).
   Komponen/ViewModel dilarang memanggil fetch ke API mana pun langsung.
2. State UI per layar dalam satu UiState object dari ViewModel hook.
3. Audio player WAJIB di-release/unload saat unmount — hindari memory leak.
4. Tidak ada blocking; fetch async/await, state loading eksplisit.
5. Dependency baru WAJIB lepersi persetujuan user dulu (lihat §1 daftar final).
6. File `.env`/secret TIDAK di-commit.
7. Tanpa library UI eksternal (NativeWind/paper dsb) — StyleSheet bawaan cukup
   untuk skala app ini (YAGNI).
8. Tambah file baru = WAJIB update bagian §2 dokumen ini di commit yang sama.
9. Environment SELALU Expo/React Native — file Kotlin/Gradle/layout XML
   DILARANG ada kembali di repo (keputusan final user 2026-09-08).
