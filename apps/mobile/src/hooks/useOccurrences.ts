import { useCallback, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { supabase } from '../lib/supabase';
import { windowForFilter, type TimeFilter } from '../lib/time';

export interface OccurrenceListItem {
  id: string;
  starts_at: string;
  ends_at: string;
  venue: { id: string; name: string; neighborhood: string | null };
  series: {
    id: string;
    title: string;
    price_text: string | null;
    category_id: string;
    category: { slug: string; name: string } | null;
  };
}

// Bounding-box / distance sort is intentionally not implemented yet — that
// needs the map + location permission flow (roadmap Step 4, next slice).
// This fetches by time + category only, ordered by start time.
export function useOccurrences(filter: TimeFilter, categoryIds: string[]) {
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
        venue:venues!inner(id, name, neighborhood),
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
      setOccurrences((data ?? []) as unknown as OccurrenceListItem[]);
    }
    setLoading(false);
  }, [filter, categoryIds.join(',')]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { occurrences, loading, error, refetch, now: DateTime.now() };
}
