import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { DateTime } from 'luxon';
import { themes, typography, space, radius, minTouchTarget } from '@pobo/tokens';
import { supabase } from '../../lib/supabase';
import { REFERENCE_TIMEZONE } from '../../lib/time';

interface SeriesRow {
  id: string;
  title: string;
  status: string;
  rrule: string | null;
  category: { name: string } | null;
}

interface OccurrenceRow {
  id: string;
  series_id: string;
  starts_at: string;
  status: string;
}

export default function VenueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];

  const [venueName, setVenueName] = useState('');
  const [series, setSeries] = useState<SeriesRow[]>([]);
  const [occurrences, setOccurrences] = useState<OccurrenceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: venue }, { data: seriesData }, { data: occurrenceData }] = await Promise.all([
      supabase.from('venues').select('name').eq('id', id).single(),
      supabase.from('event_series').select('id, title, status, rrule, category:categories(name)').eq('venue_id', id).order('title'),
      supabase
        .from('occurrences')
        .select('id, series_id, starts_at, status')
        .eq('venue_id', id)
        .eq('status', 'scheduled')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at')
        .limit(200),
    ]);
    setVenueName(venue?.name ?? '');
    setSeries((seriesData ?? []) as unknown as SeriesRow[]);
    setOccurrences((occurrenceData ?? []) as OccurrenceRow[]);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancelOccurrence(occurrenceId: string) {
    const { error } = await supabase.from('occurrences').update({ status: 'cancelled' }).eq('id', occurrenceId);
    if (error) Alert.alert("Couldn't cancel", error.message);
    else load();
  }

  async function pauseSeries(seriesId: string) {
    const { error } = await supabase.from('event_series').update({ status: 'paused' }).eq('id', seriesId);
    if (error) Alert.alert("Couldn't pause", error.message);
    else load();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={undefined}>
        <Text style={[styles.heading, { color: t.text }]}>{venueName || 'Venue'}</Text>

        <Pressable onPress={() => router.push(`/venues/${id}/series/new`)} style={[styles.addButton, { backgroundColor: t.primary }]}>
          <Text style={{ color: t.onPrimary, fontFamily: 'InstrumentSansSemiBold' }}>+ Add event series</Text>
        </Pressable>

        {!loading && series.length === 0 && (
          <Text style={[styles.empty, { color: t.textMuted }]}>No event series yet.</Text>
        )}

        {series.map((s) => {
          const upcoming = occurrences.filter((o) => o.series_id === s.id).slice(0, 3);
          return (
            <View key={s.id} style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Text style={[styles.cardTitle, { color: t.text }]}>
                {s.title} {s.status !== 'active' && `(${s.status})`}
              </Text>
              <Text style={[styles.cardMeta, { color: t.textMuted }]}>
                {s.category?.name} · {s.rrule ?? 'one-off'}
              </Text>
              {upcoming.map((o) => (
                <View key={o.id} style={styles.occurrenceRow}>
                  <Text style={[styles.cardMeta, { color: t.textMuted }]}>
                    {DateTime.fromISO(o.starts_at).setZone(REFERENCE_TIMEZONE).toFormat('ccc LLL d, h:mm a')}
                  </Text>
                  <Pressable onPress={() => cancelOccurrence(o.id)} style={[styles.smallButton, { borderColor: t.border }]}>
                    <Text style={[styles.smallButtonLabel, { color: t.text }]}>Cancel this one</Text>
                  </Pressable>
                </View>
              ))}
              {s.status === 'active' && (
                <Pressable onPress={() => pauseSeries(s.id)} style={[styles.smallButton, { borderColor: t.border, marginTop: space.sm }]}>
                  <Text style={[styles.smallButtonLabel, { color: t.text }]}>Pause series</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: space.lg, gap: space.md, paddingBottom: space['3xl'] },
  heading: { fontFamily: 'Gloock', fontSize: typography.size.headline },
  addButton: { minHeight: minTouchTarget, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: 'InstrumentSans', fontSize: typography.size.body },
  card: { borderWidth: 1, borderRadius: radius.md, padding: space.md, gap: 4 },
  cardTitle: { fontFamily: 'InstrumentSansSemiBold', fontSize: typography.size.body },
  cardMeta: { fontFamily: 'InstrumentSans', fontSize: typography.size.meta },
  occurrenceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  smallButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: space.md, paddingVertical: 4, alignSelf: 'flex-start' },
  smallButtonLabel: { fontFamily: 'InstrumentSans', fontSize: 12 },
});
