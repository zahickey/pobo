import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { themes, typography, space } from '@pobo/tokens';
import { useCategories } from '../hooks/useCategories';
import { useOccurrences } from '../hooks/useOccurrences';
import type { TimeFilter } from '../lib/time';
import { TimeFilterChips } from '../components/TimeFilterChips';
import { CategoryChips } from '../components/CategoryChips';
import { EventCard } from '../components/EventCard';

// Discovery / list view (roadmap Step 4). Map pins are the next increment —
// deferred until Mapbox vs. Google Maps is decided (see brief §9).
export default function Discovery() {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('now');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const { categories } = useCategories();
  const { occurrences, loading, error, refetch } = useOccurrences(timeFilter, categoryIds);

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.wordmark, { color: t.primary }]}>PoBo</Text>
        <Text style={[styles.tagline, { color: t.textMuted }]}>Your city's poster board.</Text>
      </View>

      <View style={styles.filterRow}>
        <TimeFilterChips value={timeFilter} onChange={setTimeFilter} />
      </View>

      <CategoryChips categories={categories} selectedIds={categoryIds} onToggle={toggleCategory} />

      {error && (
        <Text style={[styles.error, { color: t.text }]}>Couldn't load events: {error}</Text>
      )}

      <FlatList
        data={occurrences}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={t.primary} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={[styles.empty, { color: t.textMuted }]}>
              Nothing {timeFilter === 'now' ? 'happening right now' : timeFilter} yet.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <EventCard occurrence={item} onPress={() => router.push(`/event/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  wordmark: {
    fontFamily: 'Gloock',
    fontSize: typography.size.headline,
  },
  tagline: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.meta,
  },
  filterRow: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  listContent: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space['3xl'],
    flexGrow: 1,
  },
  empty: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.body,
    textAlign: 'center',
    marginTop: space['2xl'],
  },
  error: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.meta,
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
});
