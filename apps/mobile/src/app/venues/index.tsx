import { FlatList, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { themes, typography, space, radius, minTouchTarget } from '@pobo/tokens';
import { useMyVenues } from '../../hooks/useMyVenues';
import { useAuth } from '../../lib/auth';

// "My venues" — entry point for venue self-serve posting (roadmap Step 6).
// Any signed-in user can create a venue and immediately manage it (the
// on_venue_created trigger enrolls them as owner). Full claim/verification
// of an admin-seeded venue is Phase 3, not this.
export default function MyVenues() {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];
  const { session } = useAuth();
  const { venues, loading, refetch } = useMyVenues();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} edges={['bottom']}>

      <View style={styles.header}>
        <Text style={[styles.heading, { color: t.text }]}>My venues</Text>
        {session && (
          <Pressable onPress={() => router.push('/venues/new')}>
            <Text style={[styles.addLink, { color: t.primary }]}>+ Add venue</Text>
          </Pressable>
        )}
      </View>

      {!session ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: t.textMuted }]}>Sign in to manage a venue.</Text>
          <Pressable onPress={() => router.push('/sign-in')} style={[styles.signInButton, { backgroundColor: t.primary }]}>
            <Text style={{ color: t.onPrimary, fontFamily: 'InstrumentSansSemiBold' }}>Sign in</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={loading}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <Text style={[styles.emptyText, { color: t.textMuted }]}>
                No venues yet. Add one and start posting events.
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/venues/${item.id}`)}
              style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}
            >
              <Text style={[styles.cardTitle, { color: t.text }]}>{item.name}</Text>
              <Text style={[styles.cardMeta, { color: t.textMuted }]}>
                {item.neighborhood ?? ''} · {item.role}
              </Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  heading: { fontFamily: 'Gloock', fontSize: typography.size.headline },
  addLink: { fontFamily: 'InstrumentSansSemiBold', fontSize: typography.size.meta },
  listContent: { paddingHorizontal: space.lg, paddingBottom: space['3xl'], flexGrow: 1 },
  card: {
    minHeight: minTouchTarget,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
  },
  cardTitle: { fontFamily: 'InstrumentSansSemiBold', fontSize: typography.size.body },
  cardMeta: { fontFamily: 'InstrumentSans', fontSize: typography.size.meta, marginTop: 2 },
  emptyState: { alignItems: 'center', gap: space.md, paddingTop: space['2xl'], paddingHorizontal: space.lg },
  emptyText: { fontFamily: 'InstrumentSans', fontSize: typography.size.body, textAlign: 'center' },
  signInButton: { paddingHorizontal: space.xl, paddingVertical: space.sm, borderRadius: 999 },
});
