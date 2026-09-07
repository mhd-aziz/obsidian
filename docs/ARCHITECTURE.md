# ARCHITECTURE — Obsidian

> IDE resmi: **Android Studio** (canvas desain layout XML + preview; emulator
> untuk run/test). Semua layout dikerjakan di XML agar tampil di canvas
> Android Studio dan bisa diedit visual.
> Dokumen ini SOURCE OF TRUTH struktur folder & aturan arsitektur. AI agent
> WAJIB menaruh file baru persis mengikuti pohon di §2 — tidak ada file Kotlin
> di luar struktur ini tanpa update dokumen ini dulu.

## 1. Tech stack (FINAL)

| Komponen | Pilihan | Alasan |
|---|---|---|
| IDE | Android Studio | ketentuan user (canvas XML + emulator) |
| Bahasa | Kotlin | ketentuan user |
| Arsitektur | **MVVM** (View → ViewModel → Model/Repository) | pola yang dituntut dosen/industri |
| UI | XML layout + RecyclerView | tampil di canvas Android Studio, tutorial terbanyak |
| Networking | Retrofit 2.11 + Moshi 1.15 | referensi lengkap (lihat referensi.md) |
| Audio | Media3 ExoPlayer 1.5.x | library resmi, support stream URL |
| Image loading | Coil 2.7 | ringan, Kotlin-first |
| Push | Firebase Cloud Messaging | gratis, standar |
| Crash logs | Firebase Crashlytics | gratis, setup cepat |
| API data | iTunes Search API — **gratis, tanpa API key, terverifikasi HTTP 200** (fallback Deezer, juga gratis) | tanpa biaya & registrasi |
| minSdk | 26 | cakup luas, hindari workaround lama |
| Target SDK | 34 (atau default Android Studio) | kebutuhan Play/API modern |

## 1.1 Pemetaan MVVM

| Layer MVVM | Komponen Obsidian | Fitur |
|---|---|---|
| **Model** | `data/model/` + `data/api/` + `data/repo/` | JSON |
| **ViewModel** | `ui/main/`, `ui/player/` (semua *ViewModel.kt) | Lazy loading, state |
| **View** | Activity, Adapter, custom View, semua layout XML | Audio, Connectivity |
| Service (lapisan Android, di luar MVVM klasik) | `service/` (FCM) | Push |
| Util (pendukung) | `util/` | Connectivity, Emailing |
| DI sederhana | `di/` (ServiceLocator — TANPA library DI) | wiring |

Aturan MVVM yang dijaga (HARD RULES):
1. View TIDAK menyentuh Model langsung — hanya lewat ViewModel.
2. View mengobservasi state via StateFlow (collectAsState / lifecycleScope).
3. ViewModel TIDAK memegang referensi Context/Activity/View.
4. Satu layar = satu ViewModel (MainActivity↔MainViewModel,
   PlayerActivity↔PlayerViewModel).
5. Hanya Repository yang boleh memanggil Retrofit; ViewModel dilarang.
6. State UI berbentuk satu data class per layar (UiState), bukan banyak
   LiveData/StateFlow terpisah.

## 2. Struktur folder LENGKAP (source of truth)

```
obsidian/                                  ← root repo GitHub
├── AGENTS.md                              ← instruksi AI agent (salinan dari planning)
├── docs/                                  ← salinan folder docs planning
│   ├── README.md
│   ├── PRD.md
│   ├── ARCHITECTURE.md                    ← file ini
│   ├── API.md
│   ├── FEATURE-MAPPING.md
│   ├── CONVENTIONS.md
│   ├── AI-AGENT-GUIDE.md
│   ├── ROADMAP.md
│   ├── referensi.md
│   └── screenshots/                       ← bukti demo per fitur (01-json...07-push)
│
├── app/                                   ← module utama (satu-satunya module)
│   ├── build.gradle.kts                   ← deps: retrofit, moshi, media3, coil, firebase
│   ├── google-services.json               ← JANGAN di-commit (.gitignore)
│   ├── proguard-rules.pro
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml        ← INTERNET permission + deklarasi FCM service
│       │   ├── java/com/mhdaziz/obsidian/
│       │   │   ├── ObsidianApp.kt             # Application class (init ServiceLocator)
│       │   │   │
│       │   │   ├── di/                        # ── Dependency wiring (manual, tanpa Hilt)
│       │   │   │   └── ServiceLocator.kt      #     menyediakan Retrofit, Repo, Observer
│       │   │   │
│       │   │   ├── data/                      # ══ LAYER MODEL (MVVM) ══
│       │   │   │   ├── api/
│       │   │   │   │   ├── ItunesApiService.kt    # Retrofit @GET interface
│       │   │   │   │   └── RetrofitClient.kt      # builder Retrofit+Moshi (base URL)
│       │   │   │   ├── model/
│       │   │   │   │   ├── Track.kt               # data class lagu (@Json snake_case)
│       │   │   │   │   └── SearchResponse.kt      # {resultCount, results: List<Track>}
│       │   │   │   ├── repo/
│       │   │   │   │   └── TrackRepository.kt     # SATU-SATUNYA pemanggil API (suspend)
│       │   │   │   └── local/
│       │   │   │       └── FavoriteStore.kt       # simpan lagu favorit (SharedPreferences)
│       │   │   │
│       │   │   ├── ui/                        # ══ LAYER VIEW + VIEWMODEL (MVVM) ══
│       │   │   │   ├── main/                             # layar 1: search + list
│       │   │   │   │   ├── MainActivity.kt               # View: SearchView+RecyclerView
│       │   │   │   │   ├── MainViewModel.kt              # VM: UiState + search/loadMore
│       │   │   │   │   ├── MainUiState.kt                # data class state layar main
│       │   │   │   │   ├── TrackAdapter.kt               # RecyclerView adapter + diff
│       │   │   │   │   ├── TrackDiffCallback.kt          # DiffUtil.ItemCallback
│       │   │   │   │   ├── LoadStateAdapter.kt           # footer loading (pagination)
│       │   │   │   │   ├── OfflineBanner.kt              # custom View banner konektivitas
│       │   │   │   │   └── PlaylistShareMenu.kt          # helper menu share di toolbar
│       │   │   │   ├── player/                           # layar 2: audio preview
│       │   │   │   │   ├── PlayerActivity.kt             # View: PlayerView + kontrol
│       │   │   │   │   └── PlayerViewModel.kt            # VM: state playback + release logic
│       │   │   │   └── components/                       # View reusable lintas layar
│       │   │   │       └── EmptyStateView.kt             # tampilan "no results"/"offline"
│       │   │   │
│       │   │   ├── service/                  # ── Android Service (di luar MVVM klasik)
│       │   │   │   └── ObsidianFirebaseMessagingService.kt  # FCM push → notification
│       │   │   │
│       │   │   └── util/                     # ── Helper murni (di-unit-test)
│       │   │       ├── ConnectivityObserver.kt   # NetworkCallback → StateFlow<Boolean>
│       │   │       ├── PlaylistExporter.kt       # build teks playlist (murni)
│       │   │       └── Constants.kt              # base URL, limit, konstanta lain
│       │   │
│       │   └── res/
│       │       ├── layout/
│       │       │   ├── activity_main.xml             # SearchView + RecyclerView + banner
│       │       │   ├── activity_player.xml           # PlayerView + tombol kontrol
│       │       │   ├── item_track.xml                # row lagu (cover, judul, artis)
│       │       │   └── item_load_state.xml           # footer loading pagination
│       │       ├── values/
│       │       │   ├── strings.xml                   # SEMUA teks UI (jangan hardcode)
│       │       │   ├── colors.xml                    # palet dark "obsidian"
│       │       │   ├── themes.xml                    # theme Dark base
│       │       │   └── dimens.xml                    # margin/ukuran terpusat
│       │       ├── drawable/                         # ikon & background
│       │       ├── mipmap-*/                         # launcher icon
│       │       └── xml/
│       │           └── network_security_config.xml   # hanya jika butuh exception http
│       │
│       └── test/                             # ── UNIT TEST (JVM, ./gradlew test)
│           └── java/com/mhdaziz/obsidian/
│               ├── data/
│               │   ├── SearchResponseTest.kt         # parsing JSON (fitur JSON)
│               │   └── TrackRepositoryTest.kt        # repo + pagination offset
│               ├── ui/
│               │   └── MainViewModelTest.kt          # search/loadMore/logic offline
│               └── util/
│                   ├── PlaylistExporterTest.kt       # format teks playlist
│                   └── ConnectivityObserverTest.kt   # callback → state (fitur connectivity)
```

### Aturan penempatan file (untuk AI agent)

| Jenis file | Taruh di | Contoh |
|---|---|---|
| Data class API | `data/model/` | `Track.kt` |
| Interface Retrofit | `data/api/` | `ItunesApiService.kt` |
| Repo (satu per sumber data) | `data/repo/` | `TrackRepository.kt` |
| Storage lokal kecil | `data/local/` | `FavoriteStore.kt` |
| ViewModel layar X | `ui/<layar>/XViewModel.kt` | `ui/main/MainViewModel.kt` |
| State UI layar X | `ui/<layar>/XUiState.kt` | `ui/main/MainUiState.kt` |
| Activity layar X | `ui/<layar>/XActivity.kt` | `ui/player/PlayerActivity.kt` |
| Adapter RecyclerView | `ui/<layar>/` | `TrackAdapter.kt` |
| Custom View | `ui/<layar>/` atau `ui/components/` | `OfflineBanner.kt` |
| Push/service Android | `service/` | FCM service |
| Helper murni (testable JVM) | `util/` | `PlaylistExporter.kt` |
| Wiring dependency | `di/ServiceLocator.kt` | tambah provider di sini |
| Unit test | mirror path di `src/test/` | `data/…`, `util/…` |
| Layout XML | `res/layout/` | `activity_main.xml` |
| Teks UI | `res/values/strings.xml` | dilarang hardcode string |

## 3. Data flow

```
User ketik search
      │
      ▼
MainActivity (View) ──calls──► MainViewModel.search(term)
                                      │ viewModelScope.launch
                                      ▼
                              TrackRepository.search(term, offset)
                                      │ Retrofit + Moshi
                                      ▼
                              ItunesApiService ──HTTPS──► itunes.apple.com/search
                                      │                          ──► JSON (API.md)
                                      ▼
                              SearchResponse → List<Track>
                                      │
                                      ▼
                              MainUiState (StateFlow) ──collect──► RecyclerView
                                      │  loadMore() saat scroll → offset+=25 → APPEND
                                      ▼
                        klik item → PlayerActivity → PlayerViewModel
                                      → ExoPlayer.play(track.previewUrl)

Lateral:
  ConnectivityObserver (util) → StateFlow<Boolean> → MainUiState.isOnline
  → OfflineBanner tampil/hilang (fitur Connectivity)
  PlaylistExporter (util) ← dipanggil MainActivity → ACTION_SEND → Gmail (fitur Email)
  FCM service (service/) → NotificationCompat → system tray (fitur Push)
  Crashlytics → otomatis (fitur Crash logs)
```

## 4. Keputusan arsitektur penting (jangan dilanggar agent)

1. SATU sumber data: TrackRepository. Activity/Fragment dilarang memanggil
   Retrofit langsung.
2. State UI lewat StateFlow dalam UiState per layar, bukan LiveData baru.
3. ExoPlayer WAJIB di-release() di onStop() — hindari memory leak.
4. Semua request network di viewModelScope (coroutine), tidak pernah di
   main thread.
5. Dependency wiring manual via ServiceLocator — TIDAK pakai Hilt/Koin
   (YAGNI untuk skala app ini; satu less-moving-part).
6. google-services.json TIDAK di-commit (masuk .gitignore).
7. Semua teks UI di strings.xml; warna & dimensi terpusat di values/.
8. Tambah file baru = WAJIB update bagian §2 dokumen ini di commit yang sama.
