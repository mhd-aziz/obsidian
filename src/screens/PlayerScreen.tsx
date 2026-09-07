import { Image, Pressable, Text, View, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerViewModel } from '../viewmodels/PlayerViewModel';
import { getArtworkUrl200, Track } from '../models/Track';

/**
 * PlayerScreen — preview audio 30 detik (fitur #4, FEATURE-MAPPING.md).
 * expo-audio via usePlayerViewModel; player di-release otomatis saat unmount.
 * previewUrl null → Alert "Preview tidak tersedia" (API.md catatan 2).
 */
export function PlayerScreen({
  track,
  onClose,
}: {
  track: Track;
  onClose: () => void;
}) {
  const { isPlaying, play, pause } = usePlayerViewModel(track);
  const insets = useSafeAreaInsets();
  const [artworkFailed, setArtworkFailed] = useState(false);
  const hasPreview = Boolean(track.previewUrl);
  const artwork = getArtworkUrl200(track) ?? track.artworkUrl100;

  useEffect(() => {
    if (!hasPreview) {
      Alert.alert(
        'Preview tidak tersedia',
        'Lagu ini tidak memiliki preview audio.'
      );
    }
  }, [hasPreview]);

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
          <Text numberOfLines={2} className="text-center text-2xl font-bold text-zinc-50">
            {track.trackName}
          </Text>
          <Text numberOfLines={1} className="text-lg text-zinc-400">
            {track.artistName}
          </Text>
          {track.collectionName ? (
            <Text numberOfLines={1} className="text-sm text-zinc-500">
              {track.collectionName}
            </Text>
          ) : null}
        </View>

        {/* Kontrol playback */}
        <View className="items-center gap-3">
          <Pressable
            onPress={isPlaying ? pause : play}
            className="h-20 w-20 items-center justify-center rounded-full bg-obsidian-accent active:opacity-70"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text className="text-3xl text-white">{isPlaying ? '⏸' : '▶'}</Text>
          </Pressable>
          {hasPreview ? (
            <Text className="text-xs text-zinc-500">Preview 30 detik</Text>
          ) : (
            <Text className="text-xs text-amber-500/80">Preview tidak tersedia</Text>
          )}
        </View>
      </View>
    </View>
  );
}
