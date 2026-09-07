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
      className="rounded-full border border-zinc-800 px-3.5 py-2 active:opacity-60"
    >
      <Text className="text-[11px] text-zinc-500">Force crash</Text>
    </Pressable>
  );
}
