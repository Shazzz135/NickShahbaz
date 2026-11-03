import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_ABOUT_META, type AboutMetaConfig } from '../types/siteMeta';
import { normalizeTechName } from '../lib/timelineUtils';
import { getStorageCache, setStorageCache } from '../lib/storageCache';

export function useAboutMeta() {
  const [aboutMeta, setAboutMeta] = useState<AboutMetaConfig>(() => {
    const cached = getStorageCache<AboutMetaConfig>('about');
    return cached || DEFAULT_ABOUT_META;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getStorageCache<AboutMetaConfig>('about');
    return !cached;
  });

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
          let prefix = val.headlinePrefix;
          let gradient = val.headlineGradient;

          if (!prefix && !gradient && val.headline) {
            const lower = val.headline.toLowerCase();
            if (lower.includes('about me')) {
              const idx = lower.indexOf('about me');
              prefix = val.headline.slice(0, idx).trim();
              gradient = val.headline.slice(idx).trim();
            } else if (val.headline.includes('&')) {
              const parts = val.headline.split('&');
              prefix = `${parts[0].trim()} &`;
              gradient = parts.slice(1).join('&').trim();
            } else {
              prefix = val.headline;
              gradient = '';
            }
          }

          const resolved: AboutMetaConfig = {
            ...DEFAULT_ABOUT_META,
            ...val,
            headlinePrefix: prefix ?? DEFAULT_ABOUT_META.headlinePrefix,
            headlineGradient: gradient ?? DEFAULT_ABOUT_META.headlineGradient,
            headline: val.headline ?? `${prefix ?? ''} ${gradient ?? ''}`.trim(),
            stats: Array.isArray(val.stats) ? val.stats : DEFAULT_ABOUT_META.stats,
            principles: Array.isArray(val.principles) ? val.principles : DEFAULT_ABOUT_META.principles,
            skills: (Array.isArray(val.skills) ? val.skills : DEFAULT_ABOUT_META.skills).map((s) => ({
              ...s,
              name: normalizeTechName(s.name),
            })),
            bioParagraphs: Array.isArray(val.bioParagraphs) ? val.bioParagraphs : DEFAULT_ABOUT_META.bioParagraphs,
          };

          setAboutMeta(resolved);
          setStorageCache('about', resolved);
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
