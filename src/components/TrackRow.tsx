import { Image, Pressable, Text, View } from 'react-native';
import { getArtworkUrl200, Track } from '../models/Track';

interface TrackRowProps {
  track: Track;
  onPress: (track: Track) => void;
}

/** Item list lagu — presentational stateless (aturan MVVM #6). */
export function TrackRow({ track, onPress }: TrackRowProps) {
  const artwork = getArtworkUrl200(track);
  return (
    <Pressable
      onPress={() => onPress(track)}
      className="flex-row items-center gap-3 px-4 py-3 active:opacity-60"
    >
      {artwork ? (
        <Image source={{ uri: artwork }} className="h-14 w-14 rounded-lg" />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-lg bg-zinc-800">
          <Text className="text-zinc-500">♪</Text>
        </View>
      )}
      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-semibold text-zinc-100">
          {track.trackName}
        </Text>
        <Text numberOfLines={1} className="text-sm text-zinc-400">
          {track.artistName}
        </Text>
      </View>
    </Pressable>
  );
}
