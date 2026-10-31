import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useSiteMeta(key: string, defaultValue: Record<string, unknown> = {}) {
  const [data, setData] = useState<Record<string, unknown>>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchMeta() {
      if (!isSupabaseConfigured) {
        setData(defaultValue);
        setLoading(false);
        return;
      }

      try {
        const { data: row, error } = await supabase
          .from('site_meta')
          .select('*')
          .eq('key', key)
          .single();

        if (error) throw error;
        if (row && row.value) {
          setData(row.value as Record<string, unknown>);
        }
      } catch (err) {
        console.warn(`Failed to fetch site_meta for ${key}:`, err);
        setData(defaultValue);
      } finally {
        setLoading(false);
      }
    }

    fetchMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading };
}
