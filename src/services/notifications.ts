/**
 * notifications.ts — service push notification (fitur #5, FEATURE-MAPPING.md).
 * expo-notifications: register token + handler + response listener.
 * Acuan: https://docs.expo.dev/push-notifications/overview/
 *
 * PENTING (Expo Go): remote push Android (FCM) DIHAPUS dari Expo Go sejak
 * SDK 53 — memanggil getExpoPushTokenAsync/addPushTokenListener di Expo Go
 * melempar error yang crash app. Semua pemanggilan API remote push di sini
 * di-guard: hanya jalan di development build / production APK (EAS Build).
 * Notifikasi LOKAL (scheduleNotificationAsync) tetap bekerja di Expo Go.
 */
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * True saat app berjalan di Expo Go — remote push tidak tersedia di sana
 * (Android, sejak SDK 53). Notifikasi lokal tetap diizinkan.
 */
function isRunningInExpoGo(): boolean {
  return (
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.appOwnership === 'expo'
  );
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Remote push (FCM) butuh development build / APK (docs.expo.dev/
  // develop/development-builds). Di Expo Go: skip token registration.
  if (isRunningInExpoGo()) {
    console.info('[notifications] Expo Go: remote push skipped (need dev build)');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
    });
  }

  const settings = await Notifications.getPermissionsAsync();
  let finalStatus = settings.granted ? settings.status : undefined;

  if (finalStatus !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    finalStatus = request.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  });
  return token.data;
}

/** Listener tap notifikasi → return unsubscribe (panggil di useEffect root). */
export function addNotificationResponseListener(): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(() => {
    // TODO: navigasi ke layar terkait saat fitur dipakai
  });
  return () => subscription.remove();
}

/** Notifikasi lokal utk verifikasi tampil di device (Task 3.2, dev only). */
export async function scheduleTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Obsidian',
      body: 'Notifikasi push berfungsi 🎵',
      sound: 'default',
    },
    trigger: {
      seconds: 2,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });
}
