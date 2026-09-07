import { Image, Pressable, Text, View, Alert } from 'react-native';
import { useEffect } from 'react';
import { usePlayerViewModel } from '../viewmodels/PlayerViewModel';
import { Track } from '../models/Track';

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
  const hasPreview = Boolean(track.previewUrl);

  useEffect(() => {
    if (!hasPreview) {
      Alert.alert(
        'Preview tidak tersedia',
        'Lagu ini tidak memiliki preview audio.'
      );
    }
  }, [hasPreview]);

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-obsidian px-8">
      <Image
        source={{ uri: track.artworkUrl100 ?? undefined }}
        className="h-56 w-56 rounded-2xl bg-zinc-900"
      />

      <View className="items-center gap-1">
        <Text numberOfLines={1} className="text-xl font-bold text-zinc-100">
          {track.trackName}
        </Text>
        <Text numberOfLines={1} className="text-base text-zinc-400">
          {track.artistName}
        </Text>
        <Text className="text-sm text-zinc-500">{track.collectionName}</Text>
      </View>

      <Pressable
        onPress={isPlaying ? pause : play}
        className="h-16 w-16 items-center justify-center rounded-full bg-obsidian-accent active:opacity-70"
      >
        <Text className="text-2xl text-white">{isPlaying ? '⏸' : '▶'}</Text>
      </Pressable>

      <Pressable onPress={onClose} className="active:opacity-60">
        <Text className="text-sm text-zinc-400">← Kembali ke pencarian</Text>
      </Pressable>
    </View>
  );
}
