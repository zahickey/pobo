import { DateTime } from 'luxon';

// Placeholder until we have per-user location: the brief's launch city is San
// Francisco, so "Tonight" / "Tomorrow" are computed against its local day
// boundaries rather than the device's timezone. Revisit once venues can be
// outside a single city/timezone.
export const REFERENCE_TIMEZONE = 'America/Los_Angeles';

export const STARTING_SOON_MINUTES = 60;

export type TimeFilter = 'now' | 'tonight' | 'tomorrow';

export interface TimeWindow {
  start: DateTime;
  end: DateTime;
}

// "Now" = live-or-starting-soon: anything already happening, plus anything
// starting within the next hour (see brief §3 Discovery > Time filter).
export function windowForFilter(filter: TimeFilter, now: DateTime = DateTime.now().setZone(REFERENCE_TIMEZONE)): TimeWindow {
  switch (filter) {
    case 'now':
      return { start: now, end: now.plus({ minutes: STARTING_SOON_MINUTES }) };
    case 'tonight':
      return { start: now, end: now.endOf('day') };
    case 'tomorrow': {
      const tomorrow = now.plus({ days: 1 });
      return { start: tomorrow.startOf('day'), end: tomorrow.endOf('day') };
    }
  }
}

export function isLiveNow(startsAt: string, endsAt: string, now: DateTime = DateTime.now()): boolean {
  const start = DateTime.fromISO(startsAt);
  const end = DateTime.fromISO(endsAt);
  return start <= now && now < end;
}

export function isStartingSoon(startsAt: string, now: DateTime = DateTime.now()): boolean {
  const start = DateTime.fromISO(startsAt);
  const minutesUntil = start.diff(now, 'minutes').minutes;
  return minutesUntil > 0 && minutesUntil <= STARTING_SOON_MINUTES;
}

export function formatStartLabel(startsAt: string, endsAt: string, now: DateTime = DateTime.now()): string {
  if (isLiveNow(startsAt, endsAt, now)) return 'Live now';
  if (isStartingSoon(startsAt, now)) {
    const minutes = Math.round(DateTime.fromISO(startsAt).diff(now, 'minutes').minutes);
    return `Starts in ${minutes} min`;
  }
  return DateTime.fromISO(startsAt).setZone(REFERENCE_TIMEZONE).toFormat('ccc h:mm a');
}
