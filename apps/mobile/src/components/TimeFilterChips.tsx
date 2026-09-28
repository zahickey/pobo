import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { themes, space, radius, minTouchTarget } from '@pobo/tokens';
import type { TimeFilter } from '../lib/time';

const OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'now', label: 'Now' },
  { value: 'tonight', label: 'Tonight' },
  { value: 'tomorrow', label: 'Tomorrow' },
];

interface Props {
  value: TimeFilter;
  onChange: (value: TimeFilter) => void;
}

export function TimeFilterChips({ value, onChange }: Props) {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              { backgroundColor: selected ? t.primary : t.surface, borderColor: t.border },
            ]}
          >
            <Text style={[styles.label, { color: selected ? t.onPrimary : t.text }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.sm,
  },
  chip: {
    minHeight: minTouchTarget,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: 14,
  },
});
