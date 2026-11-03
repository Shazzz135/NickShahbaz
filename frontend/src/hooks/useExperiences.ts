import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockExperiences, type ExperienceRow } from '../lib/mockData';
import { extractMilestoneType, deduplicateMilestones, normalizeTechName } from '../lib/timelineUtils';
import { getStorageCache, setStorageCache } from '../lib/storageCache';

export function useExperiences() {
  const [experiences, setExperiences] = useState<ExperienceRow[]>(() => {
    const cached = getStorageCache<ExperienceRow[]>('experiences');
    if (cached && cached.length > 0) return cached;
    return !isSupabaseConfigured ? mockExperiences : [];
  });

  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getStorageCache<ExperienceRow[]>('experiences');
    return !cached || cached.length === 0;
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExperiences() {
      if (!isSupabaseConfigured) {
        setExperiences(mockExperiences);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('experiences')
          .select('*')
          .order('sort_order', { ascending: true });

        if (queryError) throw queryError;

        if (data && data.length > 0) {
          const processed = data.map((item) => ({
            ...item,
            milestone_type: extractMilestoneType(item),
            tech_stack: (item.tech_stack || []).map(normalizeTechName),
          }));
          const deduplicated = deduplicateMilestones(processed);
          setExperiences(deduplicated);
          setStorageCache('experiences', deduplicated);
        } else {
          setExperiences(mockExperiences);
          setStorageCache('experiences', mockExperiences);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to mock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch experiences');
        setExperiences(mockExperiences);
      } finally {
        setLoading(false);
      }
    }

    fetchExperiences();
  }, []);

  return { experiences, loading, error };
}
