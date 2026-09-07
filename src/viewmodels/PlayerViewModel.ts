/**
 * PlayerViewModel — hook ViewModel untuk PlayerScreen (MVVM, UI-free).
 * Audio via expo-audio; player WAJIB di-release saat unmount
 * (aturan arsitektur ARCHITECTURE.md §4.3).
 */
import { useCallback, useEffect, useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Track } from '../models/Track';

export function usePlayerViewModel(initialTrack: Track | null) {
  const [track, setTrack] = useState<Track | null>(initialTrack);
  const player = useAudioPlayer(track?.previewUrl ?? null);
  const status = useAudioPlayerStatus(player);

  const play = useCallback(() => player.play(), [player]);
  const pause = useCallback(() => player.pause(), [player]);

  useEffect(() => {
    return () => player.release();
  }, [player]);

  return {
    track,
    setTrack,
    isPlaying: status.playing,
    position: status.currentTime,
    duration: status.duration,
    play,
    pause,
  };
}
