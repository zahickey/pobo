import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { themes, typography, space } from '@pobo/tokens';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { EventCard } from '../components/EventCard';
import type { OccurrenceListItem } from '../hooks/useOccurrences';

interface PlanRow {
  kind: 'going' | 'interested';
  occurrence: OccurrenceListItem;
}

export default function MyPlans() {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];
  const { session, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      setPlans([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('rsvps')
      .select(
        `
        kind,
        occurrence:occurrences!inner(
          id, starts_at, ends_at,
          venue:venues!inner(id, name, neighborhood, lat, lng),
          series:event_series!inner(id, title, price_text, category_id, category:categories(slug, name))
        )
      `,
      )
      .eq('profile_id', session.user.id)
      .order('starts_at', { referencedTable: 'occurrences' });

    if (error) {
      console.error('Failed to load plans:', error.message);
      setPlans([]);
    } else {
      setPlans((data ?? []) as unknown as PlanRow[]);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  async function signOut() {
    await supabase.auth.signOut();
    router.back();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={[styles.heading, { color: t.text }]}>My plans</Text>
        {session && (
          <Pressable onPress={signOut}>
            <Text style={[styles.signOut, { color: t.primary }]}>Sign out</Text>
          </Pressable>
        )}
      </View>

      {!authLoading && !session && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: t.textMuted }]}>Sign in to see what you're going to.</Text>
          <Pressable onPress={() => router.push('/sign-in')} style={[styles.signInButton, { backgroundColor: t.primary }]}>
            <Text style={{ color: t.onPrimary, fontFamily: 'InstrumentSansSemiBold' }}>Sign in</Text>
          </Pressable>
        </View>
      )}

      {session && (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.occurrence.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <Text style={[styles.emptyText, { color: t.textMuted }]}>
                Nothing yet — mark an event Going or Interested and it'll show up here.
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={{ gap: space.xs }}>
              <Text style={[styles.kindLabel, { color: t.textMuted }]}>
                {item.kind === 'going' ? 'GOING' : 'INTERESTED'}
              </Text>
              <EventCard occurrence={item.occurrence} onPress={() => router.push(`/event/${item.occurrence.id}`)} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
        />
      )}
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
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  heading: {
    fontFamily: 'Gloock',
    fontSize: typography.size.headline,
  },
  signOut: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: typography.size.meta,
  },
  listContent: {
    paddingHorizontal: space.lg,
    paddingBottom: space['3xl'],
    flexGrow: 1,
  },
  kindLabel: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    gap: space.md,
    paddingTop: space['2xl'],
    paddingHorizontal: space.lg,
  },
  emptyText: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.body,
    textAlign: 'center',
  },
  signInButton: {
    paddingHorizontal: space.xl,
    paddingVertical: space.sm,
    borderRadius: 999,
  },
});
