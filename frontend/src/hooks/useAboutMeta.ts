import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_ABOUT_META, type AboutMetaConfig } from '../types/siteMeta';

export function useAboutMeta() {
  const [aboutMeta, setAboutMeta] = useState<AboutMetaConfig>(DEFAULT_ABOUT_META);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAboutMeta() {
      if (!isSupabaseConfigured) {
        setAboutMeta(DEFAULT_ABOUT_META);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('site_meta')
          .select('*')
          .eq('key', 'about')
          .maybeSingle();

        if (queryError) throw queryError;

        if (data && data.value) {
          const val = data.value as unknown as Partial<AboutMetaConfig>;
          setAboutMeta({
            ...DEFAULT_ABOUT_META,
            ...val,
            stats: Array.isArray(val.stats) && val.stats.length > 0 ? val.stats : DEFAULT_ABOUT_META.stats,
            principles: Array.isArray(val.principles) && val.principles.length > 0 ? val.principles : DEFAULT_ABOUT_META.principles,
            skills: Array.isArray(val.skills) && val.skills.length > 0 ? val.skills : DEFAULT_ABOUT_META.skills,
            bioParagraphs: Array.isArray(val.bioParagraphs) && val.bioParagraphs.length > 0 ? val.bioParagraphs : DEFAULT_ABOUT_META.bioParagraphs,
          });
        } else {
          setAboutMeta(DEFAULT_ABOUT_META);
        }
      } catch (err) {
        console.warn('Failed to fetch about meta from Supabase, using defaults:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch about metadata');
        setAboutMeta(DEFAULT_ABOUT_META);
      } finally {
        setLoading(false);
      }
    }

    fetchAboutMeta();
  }, []);

  return { aboutMeta, loading, error };
}
