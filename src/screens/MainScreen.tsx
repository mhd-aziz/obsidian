import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View } from 'react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Track } from '../models/Track';
import { useMainViewModel } from '../viewmodels/MainViewModel';
import { subscribeConnectivity } from '../utils/connectivity';
import { TrackRow } from '../components/TrackRow';
import { OfflineBanner } from '../components/OfflineBanner';
import { EmptyStateView } from '../components/EmptyStateView';
import { ForceCrashButton } from '../components/ForceCrashButton';
import { PushTestButton } from '../components/PushTestButton';
import { SharePlaylistButton } from '../components/SharePlaylistButton';

/**
 * MainScreen — pencarian + daftar lagu (View layer MVVM).
 * Semua state/logic dari useMainViewModel; komponen ini presentational.
 */
export function MainScreen({ onOpenPlayer }: { onOpenPlayer: (track: Track) => void }) {
  const { uiState, search, loadMore, setOffline } = useMainViewModel();
  const insets = useSafeAreaInsets();

  // Connectivity banner real-time (fitur #2)
  useEffect(() => subscribeConnectivity(setOffline), [setOffline]);

  const hasQuery = uiState.query.trim().length > 0;

  return (
    <View
      className="flex-1 bg-obsidian"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header: title + search, selalu di atas */}
      <View className="px-4 pb-3 pt-2">
        <Text className="pb-3 text-3xl font-bold text-zinc-50">Obsidian</Text>
        <TextInput
          className="rounded-2xl bg-zinc-900 px-4 py-3.5 text-base text-zinc-100"
          placeholder="Cari lagu atau artis..."
          placeholderTextColor="#71717A"
          value={uiState.query}
          onChangeText={search}
          returnKeyType="search"
        />
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
              : uiState.error ?? 'Cari lagu favoritmu, lalu dengarkan preview-nya.'
          }
        />
      ) : (
        <FlatList
          className="flex-1"
          data={uiState.tracks}
          keyExtractor={(item) => String(item.trackId)}
          renderItem={({ item }) => <TrackRow track={item} onPress={onOpenPlayer} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 96 }}
          refreshControl={
            <RefreshControl refreshing={uiState.isLoading} onRefresh={() => search(uiState.query)} />
          }
        />
      )}

      {/* Tombol share + tombol debug: docked di bawah, tidak mengganggu list */}
      <View className="flex-row items-center justify-center gap-3 px-4 pb-3">
        <SharePlaylistButton tracks={uiState.tracks} />
        {__DEV__ ? (
          <View className="flex-row items-center gap-3">
            <PushTestButton />
            <ForceCrashButton />
          </View>
        ) : null}
      </View>
    </View>
  );
}
