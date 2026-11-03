import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getStorageCache, setStorageCache } from '../lib/storageCache';

export function useSiteMeta<T extends object = Record<string, unknown>>(
  key: string, 
  defaultValue: T = {} as T
) {
  const [data, setData] = useState<T>(() => {
    const cached = getStorageCache<T>(`meta_${key}`);
    return cached || defaultValue;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getStorageCache<T>(`meta_${key}`);
    return !cached;
  });

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
          .maybeSingle();

        if (error) throw error;
        if (row && row.value) {
          const val = row.value as unknown as T;
          setData(val);
          setStorageCache(`meta_${key}`, val);
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
