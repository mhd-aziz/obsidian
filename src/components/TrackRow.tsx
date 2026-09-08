import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { getArtworkUrl200, Track } from '../models/Track';

/**
 * Skala elemen baris mengikuti lebar layar (responsif semua HP):
 * 320dp (kecil) → 0.85x, 400dp (umum) → 1.0x, 480dp+ (tablet/HP besar) → 1.2x.
 * Ukuran font & touch target tetap >= 44px pada layar terkecil.
 */
function useRowScale(): number {
  const { width } = useWindowDimensions();
  return Math.min(1.2, Math.max(0.85, width / 400));
}

interface TrackRowProps {
  track: Track;
  onPress: (track: Track) => void;
  onShare: (track: Track) => void;
}

/**
 * Item list lagu — presentational stateless (aturan MVVM #6).
 * Tap baris → buka player; tombol ⤴ → share lagu ini saja (bukan seluruh hasil).
 * Jarak antara tombol ⤴ dan chevron › sengaja diberi margin ekstra agar tidak
 * berdempetan (dua aksi berbeda: share vs buka player).
 */
export function TrackRow({ track, onPress, onShare }: TrackRowProps) {
  const scale = useRowScale();
  const artwork = getArtworkUrl200(track);
  const artSize = Math.round(56 * scale);
  const actionSize = Math.round(36 * scale);
  const shareGap = Math.round(16 * scale); // jarak share ⤴ → chevron ›
  return (
    <Pressable
      onPress={() => onPress(track)}
      className="flex-row items-center gap-3 border-b border-zinc-800/60 px-4 active:bg-zinc-900/60"
      style={{ minHeight: Math.round(72 * scale), paddingVertical: 12 }}
    >
      {artwork ? (
        <Image
          source={{ uri: artwork }}
          style={{ height: artSize, width: artSize, borderRadius: 12 }}
          className="bg-zinc-800"
          resizeMode="cover"
        />
      ) : (
        <View
          style={{ height: artSize, width: artSize, borderRadius: 12 }}
          className="items-center justify-center bg-zinc-800"
        >
          <Text style={{ fontSize: Math.round(20 * scale) }} className="text-zinc-500">
            ♪
          </Text>
        </View>
      )}
      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          style={{ fontSize: Math.round(16 * scale) }}
          className="font-semibold text-zinc-100"
        >
          {track.trackName}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            style={{ fontSize: Math.round(13 * scale) }}
            className="flex-1 text-zinc-400"
          >
            {track.artistName}
            {track.collectionName ? ` — ${track.collectionName}` : ''}
          </Text>
          {track.source === 'audius' ? (
            <View className="rounded-md bg-emerald-500/15 px-1.5 py-0.5">
              <Text className="text-[10px] font-bold text-emerald-400">FULL</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Pressable
        testID={`share-track-${track.trackId}`}
        onPress={() => onShare(track)}
        hitSlop={8}
        style={{
          height: actionSize,
          width: actionSize,
          marginRight: shareGap,
        }}
        className="items-center justify-center rounded-full bg-zinc-900 active:opacity-60"
      >
        <Text style={{ fontSize: Math.round(14 * scale) }} className="text-zinc-300">
          ⤴
        </Text>
      </Pressable>
      <Text style={{ fontSize: Math.round(18 * scale) }} className="text-zinc-600">
        ›
      </Text>
    </Pressable>
  );
}
