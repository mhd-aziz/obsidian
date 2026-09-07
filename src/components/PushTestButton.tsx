/**
 * PushTestButton — tombol debug untuk verifikasi notifikasi (Task 3.2).
 * Kirim LOCAL notification (tanpa backend) untuk memastikan handler +
 * display bekerja di device. Hanya di build development (__DEV__).
 * Token push remote di-register via services/notifications.ts saat app start.
 */
import { Pressable, Text } from 'react-native';
import { scheduleTestNotification } from '../services/notifications';

export function PushTestButton() {
  if (!__DEV__) return null;

  return (
    <Pressable
      testID="push-test"
      onPress={() => {
        void scheduleTestNotification();
      }}
      className="self-center rounded-full border border-zinc-700 px-4 py-2 active:opacity-60"
    >
      <Text className="text-xs text-zinc-500">Test push (dev)</Text>
    </Pressable>
  );
}
