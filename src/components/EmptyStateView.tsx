import { Text, View } from 'react-native';

interface EmptyStateViewProps {
  icon: string;
  title: string;
  subtitle?: string;
}

/** Komponen "no results" / "offline" — presentational stateless. */
export function EmptyStateView({ icon, title, subtitle }: EmptyStateViewProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-8">
      <Text className="text-4xl">{icon}</Text>
      <Text className="text-base font-semibold text-zinc-100">{title}</Text>
      {subtitle ? (
        <Text className="text-center text-sm text-zinc-400">{subtitle}</Text>
      ) : null}
    </View>
  );
}
