import { Image, Pressable, Text, View, Alert } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerViewModel } from '../viewmodels/PlayerViewModel';
import { getArtworkUrl200, Track } from '../models/Track';
import { formatDuration } from '../utils/formatTime';
import { scheduleTrackFinishedNotification } from '../services/notifications';

/**
 * PlayerScreen — pemutar audio (fitur #4, FEATURE-MAPPING.md).
 * expo-audio via usePlayerViewModel; player di-release otomatis saat unmount.
 * previewUrl null → Alert "Preview tidak tersedia" (API.md catatan 2).
 * Task 5.4: progress bar + seek ±10 dtk; Audius = full-length (badge FULL).
 */
export function PlayerScreen({
  track,
  onClose,
}: {
  track: Track;
  onClose: () => void;
}) {
  const {
    isPlaying,
    play,
    pause,
    position,
    duration,
    seekTo,
    seekBy,
    SEEK_STEP_SECONDS,
    didJustFinish,
  } = usePlayerViewModel(track);
  const insets = useSafeAreaInsets();
  const [artworkFailed, setArtworkFailed] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const hasPreview = Boolean(track.previewUrl);
  const isFullLength = track.source === 'audius';
  const artwork = getArtworkUrl200(track) ?? track.artworkUrl100;

  useEffect(() => {
    if (!hasPreview) {
      Alert.alert(
        'Preview tidak tersedia',
        'Lagu ini tidak memiliki audio yang bisa diputar.'
      );
    }
  }, [hasPreview]);

  // Push notification saat lagu selesai diputar (fitur push, bentuk organik).
  // didJustFinish bisa true di beberapa tick status berturut-turut → guard
  // ref supaya notifikasi tidak dobel kirim untuk satu kali selesai.
  const notifFiredRef = useRef(false);
  useEffect(() => {
    if (didJustFinish && !notifFiredRef.current) {
      notifFiredRef.current = true;
      void scheduleTrackFinishedNotification(track.trackName, track.artistName);
    }
    if (!didJustFinish) {
      notifFiredRef.current = false;
    }
  }, [didJustFinish, track.trackName, track.artistName]);

  // Progress bar: 0..1; durasi belum termuat (0) → 0 (hindari NaN)
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <View
      className="flex-1 bg-obsidian px-6"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
    >
      {/* Top bar: tombol kembali */}
      <Pressable
        onPress={onClose}
        hitSlop={12}
        className="mb-6 self-start rounded-full bg-zinc-900 px-4 py-2.5 active:opacity-60"
      >
        <Text className="text-sm font-medium text-zinc-300">← Kembali</Text>
      </Pressable>

      <View className="flex-1 items-center justify-center gap-8">
        {/* Artwork: fallback placeholder saat URL null / gagal load */}
        {artwork && !artworkFailed ? (
          <Image
            source={{ uri: artwork }}
            onError={() => setArtworkFailed(true)}
            className="h-64 w-64 rounded-3xl bg-zinc-800 shadow-2xl"
            resizeMode="cover"
          />
        ) : (
          <View className="h-64 w-64 items-center justify-center rounded-3xl bg-zinc-800">
            <Text className="text-6xl">🎵</Text>
          </View>
        )}

        <View className="items-center gap-1.5 px-4">
          <View className="flex-row items-center gap-2">
            <Text numberOfLines={2} className="text-center text-2xl font-bold text-zinc-50">
              {track.trackName}
            </Text>
            {isFullLength ? (
              <View className="rounded-md bg-emerald-500/15 px-1.5 py-0.5">
                <Text className="text-[10px] font-bold text-emerald-400">FULL</Text>
              </View>
            ) : null}
          </View>
          <Text numberOfLines={1} className="text-lg text-zinc-400">
            {track.artistName}
          </Text>
          {track.collectionName ? (
            <Text numberOfLines={1} className="text-sm text-zinc-500">
              {track.collectionName}
            </Text>
          ) : null}
        </View>

        {/* Progress bar + waktu (tap/drag untuk seek) */}
        <View className="w-full gap-2 px-2">
          <Pressable
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            onPress={(e) => {
              if (barWidth > 0 && duration > 0) {
                // locationX di Android bisa -1 / di luar bounds saat touch di
                // tepi — clamp ke [0, barWidth] agar seek tidak melompat salah.
                const x = Math.max(0, Math.min(e.nativeEvent.locationX, barWidth));
                seekTo((x / barWidth) * duration);
              }
            }}
          >
            <View className="h-1.5 w-full justify-center">
              <View className="h-1.5 rounded-full bg-zinc-800">
                <View
                  className="h-1.5 rounded-full bg-obsidian-accent"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>
            </View>
          </Pressable>
          <View className="flex-row justify-between">
            <Text className="text-xs text-zinc-500">{formatDuration(position)}</Text>
            <Text className="text-xs text-zinc-500">
              {duration > 0 ? formatDuration(duration) : '--:--'}
            </Text>
          </View>
        </View>

        {/* Kontrol playback */}
        <View className="items-center gap-4">
          <View className="flex-row items-center gap-8">
            <Pressable
              onPress={() => seekBy(-SEEK_STEP_SECONDS)}
              hitSlop={10}
              className="h-12 w-12 items-center justify-center rounded-full bg-zinc-900 active:opacity-60"
            >
              <Text className="text-base font-semibold text-zinc-300">−10s</Text>
            </Pressable>
            <Pressable
              onPress={isPlaying ? pause : play}
              className="h-20 w-20 items-center justify-center rounded-full bg-obsidian-accent active:opacity-70"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="text-3xl text-white">{isPlaying ? '⏸' : '▶'}</Text>
            </Pressable>
            <Pressable
              onPress={() => seekBy(SEEK_STEP_SECONDS)}
              hitSlop={10}
              className="h-12 w-12 items-center justify-center rounded-full bg-zinc-900 active:opacity-60"
            >
              <Text className="text-base font-semibold text-zinc-300">+10s</Text>
            </Pressable>
          </View>
          {hasPreview ? (
            <Text className="text-xs text-zinc-500">
              {isFullLength ? 'Lagu utuh via Audius' : 'Preview 30 detik'}
            </Text>
          ) : (
            <Text className="text-xs text-amber-500/80">Audio tidak tersedia</Text>
          )}
        </View>
      </View>
    </View>
  );
}
