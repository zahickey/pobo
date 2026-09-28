import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { DateTime } from 'luxon';
import { themes, typography, space, radius, shadow } from '@pobo/tokens';
import type { OccurrenceListItem } from '../hooks/useOccurrences';
import { REFERENCE_TIMEZONE, formatStartLabel, isLiveNow } from '../lib/time';

interface Props {
  occurrence: OccurrenceListItem;
  onPress: () => void;
}

// Card layout per POBO_BRAND_GUIDELINES.md "Key patterns": a date block on the
// left, category + Live-now chips, title in Gloock, venue/time meta below.
export function EventCard({ occurrence, onPress }: Props) {
  const colorScheme = useColorScheme();
  const t = themes[colorScheme === 'dark' ? 'dark' : 'light'];
  const now = DateTime.now();
  const live = isLiveNow(occurrence.starts_at, occurrence.ends_at, now);
  const local = DateTime.fromISO(occurrence.starts_at).setZone(REFERENCE_TIMEZONE);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: t.surface }, shadow.card]}
    >
      <View style={[styles.dateBlock, { backgroundColor: t.bg, borderColor: t.border }]}>
        <Text style={[styles.dateDay, { color: t.textMuted }]}>{local.toFormat('ccc').toUpperCase()}</Text>
        <Text style={[styles.dateTime, { color: t.text }]}>{local.toFormat('h:mm')}</Text>
        <Text style={[styles.dateMeridiem, { color: t.textMuted }]}>{local.toFormat('a').toLowerCase()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.chipRow}>
          {occurrence.series.category && (
            <View style={[styles.chip, { backgroundColor: t.primary }]}>
              <Text style={[styles.chipLabel, { color: t.onPrimary }]}>
                {occurrence.series.category.name.toUpperCase()}
              </Text>
            </View>
          )}
          {live && (
            <View style={[styles.chip, { backgroundColor: t.live }]}>
              <Text style={[styles.chipLabel, { color: t.onLive }]}>LIVE NOW</Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
          {occurrence.series.title}
        </Text>

        <Text style={[styles.meta, { color: t.textMuted }]} numberOfLines={1}>
          {occurrence.venue.name}
          {occurrence.venue.neighborhood ? ` · ${occurrence.venue.neighborhood}` : ''} ·{' '}
          {formatStartLabel(occurrence.starts_at, occurrence.ends_at, now)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.md,
  },
  dateBlock: {
    width: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.sm,
  },
  dateDay: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  dateTime: {
    fontFamily: 'InstrumentSansSemiBold',
    fontSize: typography.size.body,
  },
  dateMeridiem: {
    fontFamily: 'InstrumentSans',
    fontSize: 11,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: space.xs,
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
    fontSize: 22,
  },
  meta: {
    fontFamily: 'InstrumentSans',
    fontSize: typography.size.meta,
  },
});
