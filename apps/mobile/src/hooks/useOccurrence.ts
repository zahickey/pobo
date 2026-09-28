import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface OccurrenceDetail {
  id: string;
  starts_at: string;
  ends_at: string;
  venue: {
    id: string;
    name: string;
    address: string | null;
    neighborhood: string | null;
  };
  series: {
    title: string;
    description: string | null;
    price_text: string | null;
    age_limit: number | null;
    image_url: string | null;
    category: { slug: string; name: string } | null;
  };
  going_count: number;
  interested_count: number;
  my_rsvp: 'going' | 'interested' | null;
}

export function useOccurrence(id: string) {
  const [occurrence, setOccurrence] = useState<OccurrenceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [{ data, error: queryError }, { data: counts }, { data: session }] = await Promise.all([
      supabase
        .from('occurrences')
        .select(
          `
          id, starts_at, ends_at,
          venue:venues!inner(id, name, address, neighborhood),
          series:event_series!inner(title, description, price_text, age_limit, image_url, category:categories(slug, name))
        `,
        )
        .eq('id', id)
        .single(),
      supabase.from('occurrence_rsvp_counts').select('going_count, interested_count').eq('occurrence_id', id).maybeSingle(),
      supabase.auth.getSession(),
    ]);

    if (queryError) {
      setError(queryError.message);
      setOccurrence(null);
      setLoading(false);
      return;
    }

    let myRsvp: 'going' | 'interested' | null = null;
    if (session.session) {
      const { data: rsvpRow } = await supabase
        .from('rsvps')
        .select('kind')
        .eq('occurrence_id', id)
        .eq('profile_id', session.session.user.id)
        .maybeSingle();
      myRsvp = (rsvpRow?.kind as 'going' | 'interested' | undefined) ?? null;
    }

    setOccurrence({
      ...(data as unknown as Omit<OccurrenceDetail, 'going_count' | 'interested_count' | 'my_rsvp'>),
      going_count: counts?.going_count ?? 0,
      interested_count: counts?.interested_count ?? 0,
      my_rsvp: myRsvp,
    });
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { occurrence, loading, error, refetch };
}

export async function setRsvp(occurrenceId: string, kind: 'going' | 'interested' | null) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    return { error: 'not_signed_in' as const };
  }

  if (kind === null) {
    const { error } = await supabase
      .from('rsvps')
      .delete()
      .eq('occurrence_id', occurrenceId)
      .eq('profile_id', session.session.user.id);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase
    .from('rsvps')
    .upsert(
      { occurrence_id: occurrenceId, profile_id: session.session.user.id, kind },
      { onConflict: 'occurrence_id,profile_id' },
    );
  return { error: error?.message ?? null };
}
