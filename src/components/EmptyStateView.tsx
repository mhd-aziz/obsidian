import { Text, View } from 'react-native';

interface EmptyStateViewProps {
  icon: string;
  title: string;
  subtitle?: string;
}

/** Komponen "no results" / "offline" — presentational stateless. */
export function EmptyStateView({ icon, title, subtitle }: EmptyStateViewProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <View className="mb-2 h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900">
        <Text className="text-4xl">{icon}</Text>
      </View>
      <Text className="text-lg font-bold text-zinc-100">{title}</Text>
      {subtitle ? (
        <Text className="text-center text-sm leading-5 text-zinc-400">{subtitle}</Text>
      ) : null}
    </View>
  );
}
