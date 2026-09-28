import { FlatList, Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { themes, space, radius, minTouchTarget } from '@pobo/tokens';
import type { Category } from '../hooks/useCategories';

interface Props {
  categories: Category[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function CategoryChips({ categories, selectedIds, onToggle }: Props) {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={categories}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg, alignItems: 'center' }}
      renderItem={({ item }) => {
        const selected = selectedIds.includes(item.id);
        return (
          <Pressable
            onPress={() => onToggle(item.id)}
            style={[
              styles.chip,
              { backgroundColor: selected ? t.primary : t.surface, borderColor: t.border },
            ]}
          >
            <Text style={[styles.label, { color: selected ? t.onPrimary : t.text }]}>{item.name}</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 0,
    flexShrink: 0,
    height: minTouchTarget + space.md,
  },
  chip: {
    minHeight: minTouchTarget,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: {
    fontFamily: 'InstrumentSans',
    fontSize: 14,
  },
});
