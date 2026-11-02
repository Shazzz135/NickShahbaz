import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockExperiences, type ExperienceRow } from '../lib/mockData';
import { extractMilestoneType, deduplicateMilestones, normalizeTechName } from '../lib/timelineUtils';

export function useExperiences() {
  const [experiences, setExperiences] = useState<ExperienceRow[]>(mockExperiences);
  const [loading, setLoading] = useState<boolean>(true);
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
          setExperiences(deduplicateMilestones(processed));
        } else {
          setExperiences(mockExperiences);
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
