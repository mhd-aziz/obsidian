/**
 * SourceToggle — pemilih sumber data iTunes ↔ Audius (Task 5.4).
 * Presentational stateless (aturan MVVM #6): state & callback via props.
 */
import { Pressable, Text, View } from 'react-native';
import { TrackSource } from '../models/Track';

interface SourceToggleProps {
  source: TrackSource;
  onChange: (source: TrackSource) => void;
  disabled?: boolean;
}

const OPTIONS: { value: TrackSource; label: string; hint: string }[] = [
  { value: 'itunes', label: 'iTunes', hint: 'Preview 30 dtk' },
  { value: 'audius', label: 'Audius', hint: 'Lagu utuh' },
];

export function SourceToggle({ source, onChange, disabled }: SourceToggleProps) {
  return (
    <View className="flex-row gap-2" style={{ opacity: disabled ? 0.5 : 1 }}>
      {OPTIONS.map((opt) => {
        const active = source === opt.value;
        return (
          <Pressable
            key={opt.value}
            testID={`source-${opt.value}`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            disabled={disabled}
            onPress={() => onChange(opt.value)}
            className={`flex-1 rounded-xl px-3 py-2 active:opacity-70 ${
              active ? 'bg-obsidian-accent' : 'bg-zinc-900'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                active ? 'text-white' : 'text-zinc-300'
              }`}
            >
              {opt.label}
            </Text>
            <Text className={`text-[10px] ${active ? 'text-violet-200' : 'text-zinc-500'}`}>
              {opt.hint}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
