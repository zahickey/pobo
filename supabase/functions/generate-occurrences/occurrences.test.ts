import { assertEquals } from 'jsr:@std/assert@1';
import { DateTime } from 'npm:luxon@3.5.0';
import { computeOccurrences, type EventSeriesInput } from './occurrences.ts';

Deno.test('weekly RRULE stays at 8pm local time across a DST transition', () => {
  const series: EventSeriesInput = {
    id: 'series-1',
    venue_id: 'venue-1',
    rrule: 'FREQ=WEEKLY;BYDAY=TU',
    dtstart_local: '2025-03-04 20:00:00', // a Tuesday, before US DST starts (2025-03-09)
    duration_minutes: 120,
    timezone: 'America/Los_Angeles',
  };

  // Window spans the DST transition: PST (UTC-8) -> PDT (UTC-7).
  const now = DateTime.fromISO('2025-03-04T00:00:00Z');
  const occurrences = computeOccurrences(series, now, 3);

  assertEquals(occurrences.length, 3);

  for (const o of occurrences) {
    const localStart = DateTime.fromISO(o.starts_at).setZone('America/Los_Angeles');
    assertEquals(localStart.hour, 20);
    assertEquals(localStart.minute, 0);
    assertEquals(localStart.weekday, 2); // Tuesday
  }

  // Mar 4: before the transition, PST (UTC-8) -> 20:00 local = 04:00 UTC next day.
  assertEquals(occurrences[0].starts_at, '2025-03-05T04:00:00.000Z');
  // Mar 11 / Mar 18: after the transition (2025-03-09), PDT (UTC-7) -> 20:00 local = 03:00 UTC next day.
  assertEquals(occurrences[1].starts_at, '2025-03-12T03:00:00.000Z');
  assertEquals(occurrences[2].starts_at, '2025-03-19T03:00:00.000Z');
});

Deno.test('ends_at is duration_minutes after starts_at', () => {
  const series: EventSeriesInput = {
    id: 'series-2',
    venue_id: 'venue-1',
    rrule: 'FREQ=WEEKLY;BYDAY=FR',
    dtstart_local: '2025-01-10 21:00:00',
    duration_minutes: 180,
    timezone: 'America/Los_Angeles',
  };

  const now = DateTime.fromISO('2025-01-10T00:00:00Z');
  const [occurrence] = computeOccurrences(series, now, 1);

  const start = DateTime.fromISO(occurrence.starts_at);
  const end = DateTime.fromISO(occurrence.ends_at);
  assertEquals(end.diff(start, 'minutes').minutes, 180);
});

Deno.test('a one-off event (no rrule) produces exactly one occurrence at dtstart', () => {
  const series: EventSeriesInput = {
    id: 'series-3',
    venue_id: 'venue-1',
    rrule: null,
    dtstart_local: '2025-06-15 19:30:00',
    duration_minutes: 90,
    timezone: 'America/Los_Angeles',
  };

  const now = DateTime.fromISO('2025-01-01T00:00:00Z');
  const occurrences = computeOccurrences(series, now, 8);

  assertEquals(occurrences.length, 1);
  const localStart = DateTime.fromISO(occurrences[0].starts_at).setZone('America/Los_Angeles');
  assertEquals(localStart.toFormat('yyyy-MM-dd HH:mm'), '2025-06-15 19:30');
});

Deno.test('weekly cadence over an 8-week window yields 8 occurrences', () => {
  const series: EventSeriesInput = {
    id: 'series-4',
    venue_id: 'venue-1',
    rrule: 'FREQ=WEEKLY;BYDAY=TU',
    dtstart_local: '2025-01-07 20:00:00',
    duration_minutes: 120,
    timezone: 'America/Los_Angeles',
  };

  const now = DateTime.fromISO('2025-01-07T00:00:00Z');
  const occurrences = computeOccurrences(series, now, 8);

  assertEquals(occurrences.length, 8);
});
