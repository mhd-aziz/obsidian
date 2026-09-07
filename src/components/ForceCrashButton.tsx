/**
 * Force crash — tombol debug untuk verifikasi Sentry (Task 3.1).
 * Hanya tampil di build development (__DEV__), JANGAN di build produksi.
 */
import { Pressable, Text } from 'react-native';

export function ForceCrashButton() {
  if (!__DEV__) return null;

  return (
    <Pressable
      testID="force-crash"
      onPress={() => {
        throw new Error('Obsidian forced crash — Sentry verification');
      }}
      className="self-center rounded-full border border-zinc-700 px-4 py-2 active:opacity-60"
    >
      <Text className="text-xs text-zinc-500">Force crash (dev)</Text>
    </Pressable>
  );
}
