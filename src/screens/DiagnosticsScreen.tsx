/**
 * DiagnosticsScreen — layar diagnostik (debug) yang TETAP ADA di build release
 * (tujuan: demo fitur Sentry/crash logs ke dosen dari APK).
 * Isi: versi app, status Sentry, Force crash (JS error) + Render crash
 * (memicu GlobalErrorBoundary).
 * Diakses dari MainScreen via ikon gear di header.
 */
import { Pressable, Text, View, Alert, Share } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { GlobalErrorHandler } from '../utils/errors';
import { APP_ENV } from '../utils/constants';

export function DiagnosticsScreen({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  const appVersion = Constants.expoConfig?.version ?? 'dev';
  // Saat armed, komponen ini THROW saat render → ErrorBoundary menangkap.
  const [renderCrashArmed, setRenderCrashArmed] = useState(false);

  if (renderCrashArmed) {
    throw new Error('Obsidian render crash — ErrorBoundary demo');
  }

  const confirmForceCrash = () => {
    Alert.alert(
      'Force crash',
      'App akan melempar error yang tidak tertangani (untuk verifikasi Sentry). Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Crash sekarang',
          style: 'destructive',
          onPress: () => {
            // Lempar async di luar render tree → tidak tertangkap ErrorBoundary,
            // hanya tertangkap GlobalErrorHandler → Sentry (crash "nyata").
            setTimeout(() => {
              throw new Error('Obsidian forced crash — Sentry verification');
            }, 100);
          },
        },
      ]
    );
  };

  const confirmRenderCrash = () => {
    Alert.alert(
      'Render crash',
      'App akan me-render komponen yang melempar error — ErrorBoundary akan menangkapnya dan menampilkan fallback UI. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Render crash', style: 'destructive', onPress: () => setRenderCrashArmed(true) },
      ]
    );
  };

  const onShareLastError = () => {
    const last = GlobalErrorHandler.getLast();
    const message = last
      ? `Obsidian last error\n\nCode: ${last.code}\nMessage: ${last.message}\nUser message: ${last.userMessage}`
      : 'Belum ada error tercatat di sesi ini.';
    void Share.share({ message });
  };

  return (
    <View
      className="flex-1 bg-obsidian px-6"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
    >
      <Pressable
        onPress={onClose}
        hitSlop={12}
        className="mb-6 self-start rounded-full bg-zinc-900 px-4 py-2.5 active:opacity-60"
      >
        <Text className="text-sm font-medium text-zinc-300">← Kembali</Text>
      </Pressable>

      <Text className="pb-2 text-2xl font-bold text-zinc-50">Diagnostik</Text>
      <Text className="pb-6 text-sm text-zinc-500">
        Layar ini untuk verifikasi fitur remote crash logs & push. Aman dibagikan
        di build demo.
      </Text>

      {/* Info app */}
      <View className="gap-3 rounded-2xl bg-zinc-900 p-4">
        <View className="flex-row justify-between">
          <Text className="text-sm text-zinc-400">Versi app</Text>
          <Text className="text-sm font-medium text-zinc-100">{appVersion}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-zinc-400">Environment</Text>
          <Text className="text-sm font-medium text-zinc-100">{APP_ENV}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-zinc-400">Sentry (DSN)</Text>
          <Text
            className={
              sentryDsn
                ? 'text-sm font-medium text-emerald-400'
                : 'text-sm font-medium text-amber-400'
            }
          >
            {sentryDsn ? 'Aktif' : 'Belum dikonfigurasi'}
          </Text>
        </View>
      </View>

      {/* Aksi crash (dengan konfirmasi biar tidak ke-tekan) */}
      <Text className="pb-3 pt-6 text-sm font-semibold text-zinc-300">
        Simulasi crash (verifikasi Sentry)
      </Text>
      <View className="gap-3">
        <Pressable
          testID="force-crash"
          onPress={confirmForceCrash}
          className="rounded-2xl border border-zinc-800 p-4 active:opacity-60"
        >
          <Text className="text-sm font-semibold text-zinc-100">Force crash (JS error)</Text>
          <Text className="pt-1 text-xs text-zinc-500">
            Error async di luar render tree → hanya tertangkap global handler.
          </Text>
        </Pressable>
        <Pressable
          testID="render-crash"
          onPress={confirmRenderCrash}
          className="rounded-2xl border border-zinc-800 p-4 active:opacity-60"
        >
          <Text className="text-sm font-semibold text-zinc-100">Render crash (ErrorBoundary)</Text>
          <Text className="pt-1 text-xs text-zinc-500">
            Error di render tree → tertangkap ErrorBoundary + fallback UI.
          </Text>
        </Pressable>
      </View>

      {/* Last error (bukti laporan terkirim) */}
      <Text className="pb-3 pt-6 text-sm font-semibold text-zinc-300">
        Error terakhir sesi ini
      </Text>
      <Pressable
        onPress={onShareLastError}
        className="rounded-2xl bg-zinc-900 p-4 active:opacity-60"
      >
        <Text className="text-sm text-zinc-300">
          {GlobalErrorHandler.getLast()
            ? 'Lihat & bagikan detail error terakhir (Share sheet).'
            : 'Belum ada error tercatat di sesi ini.'}
        </Text>
      </Pressable>
    </View>
  );
}
