/**
 * App.tsx — root komponen (View layer): providers + navigasi main ↔ player.
 * Global wiring: Sentry reporter + ErrorBoundary di sini (satu tempat).
 */
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { APP_ENV } from './src/utils/constants';
import { GlobalErrorHandler } from './src/utils/errors';
import { GlobalErrorBoundary } from './src/components/GlobalErrorBoundary';
import { MainScreen } from './src/screens/MainScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { Track } from './src/models/Track';
import {
  registerForPushNotificationsAsync,
  addNotificationResponseListener,
} from './src/services/notifications';

// expo-notifications me-log warning "not fully supported in Expo Go" saat module
// di-import — sudah kita tangani via guard isRunningInExpoGo() + postinstall
// patch (scripts/patch-expo-notifications.js). Warning ini informatif, bukan
// bug; sembunyikan dari LogBox agar tidak menutupi UI (docs: reactnative.dev).
LogBox.ignoreLogs([/expo-notifications/]);

// Wire reporter global → Sentry (crash reporting, fitur #6).
// DSN dikosongkan di dev → Sentry.init di-skip, error tetap masuk GlobalErrorHandler.
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require('@sentry/react-native');
  Sentry.init({ dsn: sentryDsn, environment: APP_ENV });
  GlobalErrorHandler.addReporter((error, context) => {
    Sentry.captureException(error, { extra: { context } });
  });
}

export default function App() {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  // Push notification: register token + listener tap notifikasi (fitur #5).
  useEffect(() => {
    void registerForPushNotificationsAsync();
    return addNotificationResponseListener();
  }, []);

  return (
    <SafeAreaProvider>
      <GlobalErrorBoundary>
        {selectedTrack ? (
          <PlayerScreen track={selectedTrack} onClose={() => setSelectedTrack(null)} />
        ) : (
          <MainScreen onOpenPlayer={setSelectedTrack} />
        )}
        <StatusBar style="light" />
      </GlobalErrorBoundary>
    </SafeAreaProvider>
  );
}
