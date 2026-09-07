/**
 * notifications.ts — service push notification (fitur #5, FEATURE-MAPPING.md).
 * expo-notifications: register token + handler + response listener.
 * Acuan: https://docs.expo.dev/push-notifications/overview/
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
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
    trigger: { seconds: 2, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
  });
}
