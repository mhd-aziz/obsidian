/**
 * SharePlaylistButton — fitur "Uploading and emailing" (#7).
 * Kumpulkan hasil search → teks playlist → Share API (share sheet Android
 * berisi opsi Gmail/email). Presentational: data & callback via props.
 */
import { Pressable, Share, Text } from 'react-native';
import { Track } from '../models/Track';
import { buildPlaylistText } from '../utils/playlistExporter';

export function SharePlaylistButton({ tracks }: { tracks: Track[] }) {
  if (tracks.length === 0) return null;

  const onShare = async () => {
    try {
      await Share.share({ message: buildPlaylistText(tracks) });
    } catch {
      // user membatalkan share sheet — abaikan (bukan error)
    }
  };

  return (
    <Pressable
      testID="share-playlist"
      onPress={onShare}
      className="self-center rounded-full bg-obsidian-accent px-4 py-2 active:opacity-70"
    >
      <Text className="text-xs font-semibold text-white">Share playlist</Text>
    </Pressable>
  );
}
