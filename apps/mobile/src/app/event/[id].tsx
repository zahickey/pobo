import { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { themes, typography, space, radius, minTouchTarget } from '@pobo/tokens';
import { useOccurrence, setRsvp } from '../../hooks/useOccurrence';
import { REFERENCE_TIMEZONE, formatStartLabel, isLiveNow } from '../../lib/time';
import { DateTime } from 'luxon';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];
  const { occurrence, loading, error, refetch } = useOccurrence(id);
  const [saving, setSaving] = useState(false);

  async function handleRsvp(kind: 'going' | 'interested') {
    if (!occurrence) return;
    const nextKind = occurrence.my_rsvp === kind ? null : kind;
    setSaving(true);
    const { error: rsvpError } = await setRsvp(occurrence.id, nextKind);
    setSaving(false);

    if (rsvpError === 'not_signed_in') {
      router.push('/sign-in');
      return;
    }
    if (rsvpError) {
      Alert.alert('Something went wrong', rsvpError);
      return;
    }
    refetch();
  }

  function openDirections() {
    if (!occurrence?.venue.address) return;
    const query = encodeURIComponent(occurrence.venue.address);
    const url = Platform.select({
      ios: `maps://?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    if (url) Linking.openURL(url);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {loading && <Text style={[styles.status, { color: t.textMuted }]}>Loading…</Text>}
      {error && <Text style={[styles.status, { color: t.text }]}>Couldn't load this event: {error}</Text>}

      {occurrence && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.chipRow}>
            {occurrence.series.category && (
              <View style={[styles.chip, { backgroundColor: t.primary }]}>
                <Text style={[styles.chipLabel, { color: t.onPrimary }]}>
                  {occurrence.series.category.name.toUpperCase()}
                </Text>
              </View>
            )}
            {isLiveNow(occurrence.starts_at, occurrence.ends_at) && (
              <View style={[styles.chip, { backgroundColor: t.live }]}>
                <Text style={[styles.chipLabel, { color: t.onLive }]}>LIVE NOW</Text>
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: t.text }]}>{occurrence.series.title}</Text>

          <Text style={[styles.meta, { color: t.textMuted }]}>
            {occurrence.venue.name}
            {occurrence.venue.neighborhood ? ` · ${occurrence.venue.neighborhood}` : ''}
          </Text>
          <Text style={[styles.meta, { color: t.textMuted }]}>
            {DateTime.fromISO(occurrence.starts_at).setZone(REFERENCE_TIMEZONE).toFormat('cccc, LLLL d · h:mm a')}
            {'  ·  '}
            {formatStartLabel(occurrence.starts_at, occurrence.ends_at)}
          </Text>
          {occurrence.series.price_text && (
            <Text style={[styles.meta, { color: t.textMuted }]}>{occurrence.series.price_text}</Text>
          )}

          {occurrence.series.description && (
            <Text style={[styles.description, { color: t.text }]}>{occurrence.series.description}</Text>
          )}

          {occurrence.venue.address && (
            <Pressable onPress={openDirections} style={[styles.directionsButton, { borderColor: t.border }]}>
              <Text style={[styles.directionsLabel, { color: t.primary }]}>Get directions</Text>
              <Text style={[styles.meta, { color: t.textMuted }]}>{occurrence.venue.address}</Text>
            </Pressable>
          )}

          <View style={styles.rsvpRow}>
            <Pressable
              disabled={saving}
              onPress={() => handleRsvp('going')}
              style={[
                styles.rsvpButton,
                {
                  backgroundColor: occurrence.my_rsvp === 'going' ? t.primary : t.surface,
                  borderColor: t.border,
                },
              ]}
            >
              <Text style={{ color: occurrence.my_rsvp === 'going' ? t.onPrimary : t.text, fontFamily: 'InstrumentSansSemiBold' }}>
                Going · {occurrence.going_count}
              </Text>
            </Pressable>
            <Pressable
              disabled={saving}
              onPress={() => handleRsvp('interested')}
              style={[
                styles.rsvpButton,
                {
                  backgroundColor: occurrence.my_rsvp === 'interested' ? t.primary : t.surface,
                  borderColor: t.border,
                },
              ]}
            >
              <Text style={{ color: occurrence.my_rsvp === 'interested' ? t.onPrimary : t.text, fontFamily: 'InstrumentSansSemiBold' }}>
                Interested · {occurrence.interested_count}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  status: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.body,
    padding: space.lg,
  },
  content: {
    padding: space.lg,
    gap: space.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: space.xs,
    marginBottom: space.xs,
  },
  chip: {
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  chipLabel: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: 'Gloock',
    fontSize: typography.size.headline,
  },
  meta: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.body,
  },
  description: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.body,
    marginTop: space.sm,
    lineHeight: 22,
  },
  directionsButton: {
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
  },
  directionsLabel: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: typography.size.body,
  },
  rsvpRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.lg,
  },
  rsvpButton: {
    flex: 1,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
