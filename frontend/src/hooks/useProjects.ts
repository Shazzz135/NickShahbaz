import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockProjects, type ProjectRow } from '../lib/mockData';

export function useProjects() {
  const [projects, setProjects] = useState<ProjectRow[]>(mockProjects);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      if (!isSupabaseConfigured) {
        setProjects(mockProjects);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('projects')
          .select('*')
          .order('sort_order', { ascending: true });

        if (queryError) throw queryError;

        if (data && data.length > 0) {
          setProjects(data);
        } else {
          // If remote table has no rows yet, provide rich mock projects
          setProjects(mockProjects);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to mock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return { projects, loading, error };
}
