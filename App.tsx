/**
 * App.tsx — root komponen (View layer): providers + navigasi main ↔ player.
 * Global wiring: Sentry reporter + ErrorBoundary di sini (satu tempat).
 */
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { APP_ENV } from './src/utils/constants';
import { GlobalErrorHandler } from './src/utils/errors';
import { GlobalErrorBoundary } from './src/components/GlobalErrorBoundary';
import { MainScreen } from './src/screens/MainScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { Track } from './src/models/Track';

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

  return (
    <GlobalErrorBoundary>
      {selectedTrack ? (
        <PlayerScreen track={selectedTrack} onClose={() => setSelectedTrack(null)} />
      ) : (
        <MainScreen onOpenPlayer={setSelectedTrack} />
      )}
      <StatusBar style="light" />
    </GlobalErrorBoundary>
  );
}
