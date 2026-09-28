import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export interface MyVenue {
  id: string;
  name: string;
  neighborhood: string | null;
  role: 'owner' | 'manager';
}

export function useMyVenues() {
  const { session } = useAuth();
  const [venues, setVenues] = useState<MyVenue[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!session) {
      setVenues([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('venue_members')
      .select('role, venue:venues!inner(id, name, neighborhood)')
      .eq('profile_id', session.user.id);

    if (error) {
      console.error('Failed to load my venues:', error.message);
      setVenues([]);
    } else {
      setVenues(
        (data ?? []).map((row) => {
          const venue = row.venue as unknown as { id: string; name: string; neighborhood: string | null };
          return { id: venue.id, name: venue.name, neighborhood: venue.neighborhood, role: row.role as 'owner' | 'manager' };
        }),
      );
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { venues, loading, refetch };
}
