/**
 * PlayerViewModel — hook ViewModel untuk PlayerScreen (MVVM, UI-free).
 * Audio via expo-audio; player WAJIB di-release saat unmount
 * (aturan arsitektur ARCHITECTURE.md §4.3).
 * Task 5.4: seek (progress bar) + durasi full-length (Audius).
 */
import { useCallback, useEffect, useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Track } from '../models/Track';

const SEEK_STEP_SECONDS = 10;

export function usePlayerViewModel(initialTrack: Track | null) {
  const [track, setTrack] = useState<Track | null>(initialTrack);
  const player = useAudioPlayer(track?.previewUrl ?? null);
  const status = useAudioPlayerStatus(player);

  const play = useCallback(() => player.play(), [player]);
  const pause = useCallback(() => player.pause(), [player]);

  /** Lompat ke posisi tertentu (detik) — dipakai progress bar. */
  const seekTo = useCallback(
    (seconds: number) => {
      const duration = status.duration;
      const clamped = Math.max(0, Math.min(seconds, duration > 0 ? duration : seconds));
      // seekTo mengembalikan Promise; seek sebelum source siap bisa reject —
      // ditelan aman (posisi tetap konsisten via status subscription).
      player.seekTo(clamped).catch(() => {});
    },
    [player, status.duration]
  );

  /** Maju/mundur ±10 detik (tombol skip). */
  const seekBy = useCallback(
    (delta: number) => {
      seekTo(status.currentTime + delta);
    },
    [seekTo, status.currentTime]
  );

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
    seekTo,
    seekBy,
    SEEK_STEP_SECONDS,
  };
}
