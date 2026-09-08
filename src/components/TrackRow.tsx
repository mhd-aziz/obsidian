import { Image, Pressable, Text, View } from 'react-native';
import { getArtworkUrl200, Track } from '../models/Track';

interface TrackRowProps {
  track: Track;
  onPress: (track: Track) => void;
}

/**
 * Item list lagu — presentational stateless (aturan MVVM #6).
 * Touch target >= 48px (ux guideline: min 44px), divider tipis antar baris.
 */
export function TrackRow({ track, onPress }: TrackRowProps) {
  const artwork = getArtworkUrl200(track);
  return (
    <Pressable
      onPress={() => onPress(track)}
      className="flex-row items-center gap-3 border-b border-zinc-800/60 px-4 active:bg-zinc-900/60"
      style={{ minHeight: 72, paddingVertical: 12 }}
    >
      {artwork ? (
        <Image
          source={{ uri: artwork }}
          className="h-14 w-14 rounded-xl bg-zinc-800"
          resizeMode="cover"
        />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-xl bg-zinc-800">
          <Text className="text-xl text-zinc-500">♪</Text>
        </View>
      )}
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-base font-semibold text-zinc-100">
          {track.trackName}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text numberOfLines={1} className="flex-1 text-sm text-zinc-400">
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
      <Text className="text-lg text-zinc-600">›</Text>
    </Pressable>
  );
}
