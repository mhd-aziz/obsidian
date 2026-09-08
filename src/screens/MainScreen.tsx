import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Track } from '../models/Track';
import { useMainViewModel } from '../viewmodels/MainViewModel';
import { subscribeConnectivity } from '../utils/connectivity';
import { TrackRow } from '../components/TrackRow';
import { OfflineBanner } from '../components/OfflineBanner';
import { EmptyStateView } from '../components/EmptyStateView';
import { SourceToggle } from '../components/SourceToggle';
import { Share } from 'react-native';

/**
 * shareTrack — share SATU lagu (bukan seluruh hasil pencarian) via share sheet
 * Android (fitur "Uploading and emailing"). Format konsisten dgn playlist.
 */
export function shareTrack(track: Track): void {
  Share.share({
    message: `Obsidian\n\n1. ${track.artistName} — ${track.trackName}`,
  }).catch(() => {
    // user membatalkan share sheet — abaikan (bukan error)
  });
}

/**
 * MainScreen — pencarian + daftar lagu (View layer MVVM).
 * Semua state/logic dari useMainViewModel; komponen ini presentational.
 * Task 5.4: toggle sumber iTunes/Audius + search debounce + footer lazy-load.
 */
export function MainScreen({
  onOpenPlayer,
  onOpenDiagnostics,
}: {
  onOpenPlayer: (track: Track) => void;
  onOpenDiagnostics: () => void;
}) {
  const { uiState, search, onQueryChange, changeSource, loadMore, setOffline } =
    useMainViewModel();
  const insets = useSafeAreaInsets();

  // Connectivity banner real-time (fitur #2).
  // subscribeConnectivity mengirim isOnline; state VM menyimpan isOffline —
  // wajib di-inversi. (Bug lama: diteruskan langsung → banner tampil saat
  // justru online.)
  useEffect(
    () => subscribeConnectivity((online) => setOffline(!online)),
    [setOffline]
  );

  const hasQuery = uiState.query.trim().length > 0;

  return (
    <View
      className="flex-1 bg-obsidian"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header: title + search + sumber data, selalu di atas */}
      <View className="px-4 pb-3 pt-2">
        <View className="flex-row items-center justify-between pb-3">
          <Text className="text-3xl font-bold text-zinc-50">Obsidian</Text>
          <View className="flex-row items-center gap-2">
            {uiState.source === 'audius' ? (
              <View className="rounded-full bg-emerald-500/15 px-2.5 py-1">
                <Text className="text-[10px] font-bold text-emerald-400">
                  FULL-LENGTH MODE
                </Text>
              </View>
            ) : null}
            <Pressable
              testID="open-diagnostics"
              onPress={onOpenDiagnostics}
              hitSlop={8}
              className="rounded-full bg-zinc-900 px-3 py-1.5 active:opacity-60"
            >
              <Text className="text-sm text-zinc-400">⚙</Text>
            </Pressable>
          </View>
        </View>
        <View className="flex-row items-center gap-2 rounded-2xl bg-zinc-900 px-4">
          <Text className="text-base text-zinc-500">⌕</Text>
          <TextInput
            className="flex-1 py-3.5 text-base text-zinc-100"
            placeholder="Cari lagu atau artis..."
            placeholderTextColor="#71717A"
            value={uiState.query}
            onChangeText={onQueryChange}
            onSubmitEditing={() => search(uiState.query)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <View className="pt-3">
          <SourceToggle
            source={uiState.source}
            onChange={changeSource}
            disabled={uiState.isLoading}
          />
        </View>
      </View>

      <OfflineBanner visible={uiState.isOffline} />

      {uiState.isLoading && uiState.tracks.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : uiState.tracks.length === 0 ? (
        <EmptyStateView
          icon={hasQuery ? '🔍' : '🎧'}
          title={hasQuery ? 'Tidak ada hasil' : 'Selamat datang'}
          subtitle={
            hasQuery
              ? uiState.error ?? 'Coba kata kunci lain.'
              : 'Cari lagu favoritmu — iTunes untuk katalog lengkap, Audius untuk dengar lagu utuh.'
          }
        />
      ) : (
        <FlatList
          className="flex-1"
          data={uiState.tracks}
          keyExtractor={(item) => String(item.trackId)}
          renderItem={({ item }) => (
            <TrackRow track={item} onPress={onOpenPlayer} onShare={shareTrack} />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 96 }}
          refreshControl={
            <RefreshControl
              refreshing={uiState.isLoading}
              onRefresh={() => search(uiState.query)}
            />
          }
          ListFooterComponent={
            uiState.isLoadingMore ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#7C3AED" />
              </View>
            ) : null
          }
        />
      )}

      {/* Share kini per-lagu (tombol ⤴ di tiap baris list) — tidak ada tombol global */}
      <View className="px-4 pb-3">
        <Text className="text-center text-[11px] text-zinc-600">
          Tap ⤴ pada lagu untuk membagikan
        </Text>
      </View>
    </View>
  );
}
