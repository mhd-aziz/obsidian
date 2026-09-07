# Referensi Proyek: Music Discovery App (Obsidian) — Expo / React Native

> Status: referensi terkumpul per 2026-09-07, direvisi ke Expo 2026-09-08.
> Ide: app katalog musik dari API gratis + preview audio.

## Pemetaan Fitur Mata Kuliah (7 cakupan)

| # | Fitur | Implementasi di app | Referensi |
|---|---|---|---|
| 1 | JSON | fetch + TypeScript types, data lagu dari iTunes/Deezer API | bawah |
| 2 | Connectivity | @react-native-community/netinfo, banner offline | bawah |
| 3 | Lazy loading | FlatList onEndReached pagination | bawah |
| 4 | Android audio | expo-audio play preview 30 detik | bawah |
| 5 | Push messaging | expo-notifications (Expo Push Service) | bawah |
| 6 | Remote crash logs | Sentry (expo-sentry) | bawah |
| 7 | Uploading & emailing | Share API / mailto | bawah |

## Referensi Teknis per Fitur

### 0. Expo — dasar
- Getting started (create-expo-app, Expo Go):
  https://docs.expo.dev/get-started/introduction/
- Expo SDK 57 / RN 0.86 / React 19.2 (terpasang di repo).
- EAS Build (build APK di cloud):
  https://docs.expo.dev/build/introduction/
- Development builds vs Expo Go:
  https://docs.expo.dev/develop/development-builds/introduction/

### 1. JSON — sumber data (sudah diverifikasi hidup via curl)
- iTunes Search API (resmi Apple, no key, return `previewUrl` audio + artwork):
  https://performance-partners.apple.com/search-api
  Contoh terverifikasi: `curl "https://itunes.apple.com/search?term=indonesia&entity=song&limit=2"`
- Deezer public API (no auth, field `preview` mp3 30 detik):
  https://developers.deezer.com/api — `curl "https://api.deezer.com/search?q=indonesia&limit=2"`
- RN Networking (fetch): https://reactnative.dev/docs/network

### 2. Connectivity
- netinfo (resmi RN community): https://github.com/react-native-netinfo/react-native-netinfo
- `npx expo install @react-native-community/netinfo`

### 3. Lazy loading
- Official FlatList (onEndReached, onEndReachedThreshold):
  https://reactnative.dev/docs/flatlist
- Optimizing FlatList (windowSize, getItemLayout):
  https://reactnative.dev/docs/optimizing-flatlist-configuration

### 4. Android audio
- Official expo-audio (pengganti expo-av yang deprecated):
  https://docs.expo.dev/versions/latest/sdk/audio/
- API: `createAudioPlayer`, `player.replace(url)`, `player.play()/pause()`,
  `setAudioModeAsync`.
- Android format support mengikuti ExoPlayer/Media3 di bawah hood:
  https://developer.android.com/media/media3/exoplayer/supported-formats

### 5. Push messaging
- Official expo-notifications: https://docs.expo.dev/versions/latest/sdk/notifications/
- Push notification setup guide: https://docs.expo.dev/push-notifications/overview/
- Expo push tool (kirim test): https://exp.dev/push-tool (atau curl ke
  https://exp.host/--/api/v2/push/send dengan Expo push token)

### 6. Remote crash logs
- Official Sentry via expo-sentry: https://docs.expo.dev/guides/using-sentry/
- Sentry React Native SDK: https://docs.sentry.io/platforms/react-native/
- Free tier mencukupi untuk demo (5k error events/bulan).

### 7. Uploading and emailing
- Official Share API RN: https://reactnative.dev/docs/share
- Official Linking (mailto): https://reactnative.dev/docs/linking
- Penerapan: export playlist jadi teks → Share.share({message}) → pilih Gmail
  dari share sheet. Tanpa server sama sekali (paling ringan).

## Catatan

- Layanan cloud gratis: Expo Push (push) + Sentry (crash). Tidak perlu project
  Firebase. Semua punya free tier yang mencukupi demo kuliah.
- Semua API musik di atas gratis & no key → tidak ada biaya & risiko kuota.
- Fitur 1-4 alami 100%. Fitur 5-7 bonus yang tetap wajar di app musik.
  Minimal 3 terpenuhi bahkan kalau 5-7 dibuang.
- Build APK final via EAS Build (cloud) — tidak butuh Android SDK lokal.
