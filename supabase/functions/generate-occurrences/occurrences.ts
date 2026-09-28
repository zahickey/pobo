// Pure recurrence-expansion logic, kept separate from index.ts so it's testable
// without booting an HTTP server (see occurrences.test.ts).
//
// The hard part: event_series.dtstart_local is a *local wall-clock* time
// ("every Tuesday at 8pm") in the venue's IANA timezone, but `rrule` only
// understands plain JS Dates with no timezone concept. The standard trick:
// run rrule in a "fake UTC" domain where a date's UTC getters equal the real
// local wall-clock numbers, then reinterpret each result as local time in the
// venue's real timezone (via Luxon) to get the true UTC instant. This is what
// keeps "every Tuesday at 8pm" landing at 8pm local through DST transitions,
// instead of drifting by an hour twice a year.

import rrulePkg from 'npm:rrule@2.8.1';
import { DateTime } from 'npm:luxon@3.5.0';

const { RRule } = rrulePkg;

export interface EventSeriesInput {
  id: string;
  venue_id: string;
  rrule: string | null;
  dtstart_local: string; // e.g. "2025-01-07 20:00:00" or "2025-01-07T20:00:00"
  duration_minutes: number;
  timezone: string;
}

export interface GeneratedOccurrence {
  series_id: string;
  venue_id: string;
  starts_at: string; // ISO, UTC
  ends_at: string; // ISO, UTC
}

interface LocalComponents {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function parseLocalTimestamp(local: string): LocalComponents {
  const [datePart, timePart = '00:00:00'] = local.replace('T', ' ').split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return { year, month, day, hour, minute, second: second || 0 };
}

function componentsToFakeUtcDate(c: LocalComponents): Date {
  return new Date(Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, c.second));
}

// A real UTC instant, expressed as a venue-local wall-clock time, encoded as
// a "fake UTC" Date so it can be handed to rrule.
function realInstantToFakeUtc(instant: DateTime, timezone: string): Date {
  const local = instant.setZone(timezone);
  return componentsToFakeUtcDate({
    year: local.year,
    month: local.month,
    day: local.day,
    hour: local.hour,
    minute: local.minute,
    second: local.second,
  });
}

// The inverse: a "fake UTC" Date produced by rrule, reinterpreted as a
// venue-local wall-clock time, resolved to the real UTC instant.
function fakeUtcToRealInstant(fakeUtc: Date, timezone: string): DateTime {
  return DateTime.fromObject(
    {
      year: fakeUtc.getUTCFullYear(),
      month: fakeUtc.getUTCMonth() + 1,
      day: fakeUtc.getUTCDate(),
      hour: fakeUtc.getUTCHours(),
      minute: fakeUtc.getUTCMinutes(),
      second: fakeUtc.getUTCSeconds(),
    },
    { zone: timezone },
  );
}

const WINDOW_WEEKS = 8;

export function computeOccurrences(
  series: EventSeriesInput,
  now: DateTime,
  windowWeeks: number = WINDOW_WEEKS,
): GeneratedOccurrence[] {
  const dtstartComponents = parseLocalTimestamp(series.dtstart_local);
  const dtstartFakeUtc = componentsToFakeUtcDate(dtstartComponents);

  let occurrenceFakeUtcDates: Date[];

  if (series.rrule) {
    const rule = new RRule({
      ...RRule.parseString(series.rrule),
      dtstart: dtstartFakeUtc,
    });
    const windowStartFakeUtc = realInstantToFakeUtc(now, series.timezone);
    const windowEndFakeUtc = realInstantToFakeUtc(now.plus({ weeks: windowWeeks }), series.timezone);
    occurrenceFakeUtcDates = rule.between(windowStartFakeUtc, windowEndFakeUtc, true);
  } else {
    // One-off: a single occurrence at dtstart, regardless of the window.
    occurrenceFakeUtcDates = [dtstartFakeUtc];
  }

  return occurrenceFakeUtcDates.map((fakeUtc) => {
    const realStart = fakeUtcToRealInstant(fakeUtc, series.timezone).toUTC();
    const realEnd = realStart.plus({ minutes: series.duration_minutes });
    return {
      series_id: series.id,
      venue_id: series.venue_id,
      starts_at: realStart.toISO()!,
      ends_at: realEnd.toISO()!,
    };
  });
}
