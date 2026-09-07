import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View } from 'react-native';
import { useEffect } from 'react';
import { Track } from '../models/Track';
import { useMainViewModel } from '../viewmodels/MainViewModel';
import { subscribeConnectivity } from '../utils/connectivity';
import { TrackRow } from '../components/TrackRow';
import { OfflineBanner } from '../components/OfflineBanner';
import { EmptyStateView } from '../components/EmptyStateView';

/**
 * MainScreen — pencarian + daftar lagu (View layer MVVM).
 * Semua state/logic dari useMainViewModel; komponen ini presentational.
 */
export function MainScreen({ onOpenPlayer }: { onOpenPlayer: (track: Track) => void }) {
  const { uiState, search, loadMore, setOffline } = useMainViewModel();

  // Connectivity banner real-time (fitur #2)
  useEffect(() => subscribeConnectivity(setOffline), [setOffline]);

  const hasQuery = uiState.query.trim().length > 0;

  return (
    <View className="flex-1 bg-obsidian pt-14">
      <Text className="px-4 pb-2 text-2xl font-bold text-zinc-100">Obsidian</Text>

      <View className="px-4 pb-3">
        <TextInput
          className="rounded-xl bg-zinc-900 px-4 py-3 text-zinc-100"
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
          data={uiState.tracks}
          keyExtractor={(item) => String(item.trackId)}
          renderItem={({ item }) => <TrackRow track={item} onPress={onOpenPlayer} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={uiState.isLoading} onRefresh={() => search(uiState.query)} />
          }
        />
      )}
    </View>
  );
}
