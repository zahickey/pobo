import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('categories')
      .select('id, slug, name')
      .order('name')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load categories:', error.message);
        } else {
          setCategories(data ?? []);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}
