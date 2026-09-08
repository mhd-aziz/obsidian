/**
 * formatTime — util murni format detik → "m:ss" untuk UI player.
 * Guard nilai tidak valid (durasi belum termuat: -1/NaN/Infinity) → "0:00".
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
