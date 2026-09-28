import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { themes, typography, space } from '@pobo/tokens';
import { useCategories } from '../hooks/useCategories';
import { useOccurrences } from '../hooks/useOccurrences';
import { useUserLocation } from '../lib/location';
import { useAuth } from '../lib/auth';
import type { TimeFilter } from '../lib/time';
import { TimeFilterChips } from '../components/TimeFilterChips';
import { CategoryChips } from '../components/CategoryChips';
import { EventCard } from '../components/EventCard';
import { DiscoveryMap } from '../components/DiscoveryMap';

// Discovery: map (default) + list drawer showing the same results, per the
// brief's §3 Discovery section. The "drawer" here is a fixed split rather
// than a draggable bottom sheet — a reasonable first cut; a real drag sheet
// is a polish pass, not a functional gap.
export default function Discovery() {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('now');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const { categories } = useCategories();
  const { location: userLocation } = useUserLocation();
  const { occurrences, loading, error, refetch } = useOccurrences(timeFilter, categoryIds, userLocation);
  const { session } = useAuth();

  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.wordmark, { color: t.primary }]}>PoBo</Text>
          <Text style={[styles.tagline, { color: t.textMuted }]}>Your city's poster board.</Text>
        </View>
        <Pressable onPress={() => router.push(session ? '/plans' : '/sign-in')}>
          <Text style={[styles.headerLink, { color: t.primary }]}>{session ? 'My plans' : 'Sign in'}</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <TimeFilterChips value={timeFilter} onChange={setTimeFilter} />
      </View>

      <CategoryChips categories={categories} selectedIds={categoryIds} onToggle={toggleCategory} />

      <View style={styles.mapWrap}>
        <DiscoveryMap
          occurrences={occurrences}
          userLocation={userLocation}
          onSelect={(id) => router.push(`/event/${id}`)}
        />
      </View>

      {error && (
        <Text style={[styles.error, { color: t.text }]}>Couldn't load events: {error}</Text>
      )}

      <FlatList
        style={styles.list}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  headerLink: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: typography.size.meta,
    marginTop: space.xs,
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
  mapWrap: {
    height: 260,
    marginHorizontal: space.lg,
    marginBottom: space.md,
  },
  list: {
    flex: 1,
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
