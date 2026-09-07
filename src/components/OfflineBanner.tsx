import { Text, View } from 'react-native';

interface OfflineBannerProps {
  visible: boolean;
}

/** Banner konektivitas real-time (fitur #2, FEATURE-MAPPING.md). */
export function OfflineBanner({ visible }: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <View className="bg-amber-500/90 px-4 py-2">
      <Text className="text-center text-sm font-semibold text-zinc-900">
        Tidak ada koneksi internet
      </Text>
    </View>
  );
}
