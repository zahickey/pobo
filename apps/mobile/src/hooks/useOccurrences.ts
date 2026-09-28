import { useCallback, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { supabase } from '../lib/supabase';
import { windowForFilter, type TimeFilter } from '../lib/time';
import { distanceMiles, type UserLocation } from '../lib/location';

export interface OccurrenceListItem {
  id: string;
  starts_at: string;
  ends_at: string;
  venue: { id: string; name: string; neighborhood: string | null; lat: number | null; lng: number | null };
  series: {
    id: string;
    title: string;
    price_text: string | null;
    category_id: string;
    category: { slug: string; name: string } | null;
  };
}

// Bounding-box map-region filtering is not implemented yet (that needs a
// PostGIS query keyed to the visible map region) — this fetches everything
// matching time + category, then sorts by distance from `sortFrom` client
// side if given, otherwise by start time.
export function useOccurrences(filter: TimeFilter, categoryIds: string[], sortFrom?: UserLocation | null) {
  const [occurrences, setOccurrences] = useState<OccurrenceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const window = windowForFilter(filter);

    let query = supabase
      .from('occurrences')
      .select(
        `
        id, starts_at, ends_at,
        venue:venues!inner(id, name, neighborhood, lat, lng),
        series:event_series!inner(id, title, price_text, category_id, category:categories(slug, name))
      `,
      )
      .eq('status', 'scheduled')
      .gt('ends_at', window.start.toUTC().toISO())
      .lte('starts_at', window.end.toUTC().toISO())
      .order('starts_at', { ascending: true });

    if (categoryIds.length > 0) {
      query = query.in('series.category_id', categoryIds);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(queryError.message);
      setOccurrences([]);
    } else {
      const rows = (data ?? []) as unknown as OccurrenceListItem[];
      if (sortFrom) {
        rows.sort((a, b) => {
          if (!a.venue.lat || !a.venue.lng) return 1;
          if (!b.venue.lat || !b.venue.lng) return -1;
          return (
            distanceMiles(sortFrom, { latitude: a.venue.lat, longitude: a.venue.lng }) -
            distanceMiles(sortFrom, { latitude: b.venue.lat, longitude: b.venue.lng })
          );
        });
      }
      setOccurrences(rows);
    }
    setLoading(false);
  }, [filter, categoryIds.join(','), sortFrom?.latitude, sortFrom?.longitude]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { occurrences, loading, error, refetch, now: DateTime.now() };
}
