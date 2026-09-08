/**
 * App.tsx — root komponen (View layer): providers + navigasi main ↔ player.
 * Global wiring: Sentry reporter + ErrorBoundary di sini (satu tempat).
 */
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { LogBox, View, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { APP_ENV } from './src/utils/constants';
import { GlobalErrorHandler } from './src/utils/errors';
import { GlobalErrorBoundary } from './src/components/GlobalErrorBoundary';
import { MainScreen } from './src/screens/MainScreen';
import { DiagnosticsScreen } from './src/screens/DiagnosticsScreen';
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
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Push notification: register token + listener tap notifikasi (fitur #5).
  useEffect(() => {
    void registerForPushNotificationsAsync();
    return addNotificationResponseListener();
  }, []);

  // Tombol back hardware Android: tutup overlay (Player/Diagnostics) dulu,
  // JANGAN keluar app. Di MainScreen (root) → default behavior (keluar).
  useEffect(() => {
    const onBack = (): boolean => {
      if (selectedTrack) {
        setSelectedTrack(null);
        return true; // event terserap — activity tidak di-close
      }
      if (showDiagnostics) {
        setShowDiagnostics(false);
        return true;
      }
      return false; // MainScreen: serahkan ke Android (keluar app)
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [selectedTrack, showDiagnostics]);

  return (
    <SafeAreaProvider>
      <GlobalErrorBoundary>
        {/* MainScreen SELALU ter-mount — state search/list dipertahankan saat
            buka Player/Diagnostics lalu kembali (tidak ada re-fetch). */}
        <MainScreen
          onOpenPlayer={setSelectedTrack}
          onOpenDiagnostics={() => setShowDiagnostics(true)}
        />
        {selectedTrack ? (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <PlayerScreen
              track={selectedTrack}
              onClose={() => setSelectedTrack(null)}
            />
          </View>
        ) : null}
        {showDiagnostics ? (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <DiagnosticsScreen onClose={() => setShowDiagnostics(false)} />
          </View>
        ) : null}
        <StatusBar style="light" />
      </GlobalErrorBoundary>
    </SafeAreaProvider>
  );
}
