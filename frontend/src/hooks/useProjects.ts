import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockProjects, type ProjectRow } from '../lib/mockData';

function resolveProjectDisplay(p: ProjectRow): ProjectRow {
  const customCat = (p.metrics as Record<string, unknown> | null)?.display_category;
  if (typeof customCat === 'string' && customCat.trim()) {
    return { ...p, category: customCat.trim() };
  }
  return p;
}

function sortFeaturedProjectsFirst(items: ProjectRow[]): ProjectRow[] {
  return [...items].sort((a, b) => {
    // Featured / starred projects displayed first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectRow[]>(
    sortFeaturedProjectsFirst(mockProjects.map(resolveProjectDisplay))
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      if (!isSupabaseConfigured) {
        setProjects(sortFeaturedProjectsFirst(mockProjects.map(resolveProjectDisplay)));
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
          setProjects(sortFeaturedProjectsFirst(data.map(resolveProjectDisplay)));
        } else {
          // If remote table has no rows yet, provide rich mock projects
          setProjects(sortFeaturedProjectsFirst(mockProjects.map(resolveProjectDisplay)));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to mock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        setProjects(sortFeaturedProjectsFirst(mockProjects.map(resolveProjectDisplay)));
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return { projects, loading, error };
}
