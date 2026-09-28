import { cache } from 'react';
import { supabase } from './supabase';

export interface PublicOccurrence {
  id: string;
  starts_at: string;
  ends_at: string;
  venue: {
    id: string;
    name: string;
    neighborhood: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
  };
  series: {
    title: string;
    description: string | null;
    price_text: string | null;
    image_url: string | null;
    category: { slug: string; name: string } | null;
  };
}

// cache() so generateMetadata, the opengraph-image route, and the page body
// share one fetch per request instead of three (see Next's metadata docs).
export const getOccurrence = cache(async (id: string): Promise<PublicOccurrence | null> => {
  const { data, error } = await supabase
    .from('occurrences')
    .select(
      `
      id, starts_at, ends_at,
      venue:venues!inner(id, name, neighborhood, address, lat, lng),
      series:event_series!inner(title, description, price_text, image_url, category:categories(slug, name))
    `,
    )
    .eq('id', id)
    .eq('status', 'scheduled')
    .single();

  if (error || !data) return null;
  return data as unknown as PublicOccurrence;
});

// Same launch-city placeholder as apps/mobile/src/lib/time.ts — keep in sync
// until venues can span multiple timezones.
export const REFERENCE_TIMEZONE = 'America/Los_Angeles';

export function isLiveNow(startsAt: string, endsAt: string, now = new Date()): boolean {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return start <= now && now < end;
}

export function isStartingSoon(startsAt: string, now = new Date()): boolean {
  const start = new Date(startsAt);
  const minutesUntil = (start.getTime() - now.getTime()) / 60000;
  return minutesUntil > 0 && minutesUntil <= 60;
}

export function formatStartLabel(startsAt: string, endsAt: string, now = new Date()): string {
  if (isLiveNow(startsAt, endsAt, now)) return 'Live now';
  if (isStartingSoon(startsAt, now)) {
    const minutes = Math.round((new Date(startsAt).getTime() - now.getTime()) / 60000);
    return `Starts in ${minutes} min`;
  }
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: REFERENCE_TIMEZONE,
  }).format(new Date(startsAt));
}
