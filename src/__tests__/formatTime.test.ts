/**
 * formatDuration tests — util tampilan waktu player (Task 5.4).
 */
import { formatDuration } from '../utils/formatTime';

describe('formatDuration', () => {
  it('format mm:ss untuk durasi normal', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(210.36)).toBe('3:30');
    expect(formatDuration(1690)).toBe('28:10');
  });

  it('nilai tidak valid → 0:00 (guard durasi belum termuat)', () => {
    expect(formatDuration(-1)).toBe('0:00');
    expect(formatDuration(NaN)).toBe('0:00');
    expect(formatDuration(Infinity)).toBe('0:00');
  });
});
