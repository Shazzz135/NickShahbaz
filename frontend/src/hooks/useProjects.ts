import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockProjects, type ProjectRow } from '../lib/mockData';
import { getStorageCache, setStorageCache } from '../lib/storageCache';

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
  const [projects, setProjects] = useState<ProjectRow[]>(() => {
    const cached = getStorageCache<ProjectRow[]>('projects');
    if (cached && cached.length > 0) {
      return sortFeaturedProjectsFirst(cached.map(resolveProjectDisplay));
    }
    return !isSupabaseConfigured
      ? sortFeaturedProjectsFirst(mockProjects.map(resolveProjectDisplay))
      : [];
  });

  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getStorageCache<ProjectRow[]>('projects');
    return !cached || cached.length === 0;
  });

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
          const sorted = sortFeaturedProjectsFirst(data.map(resolveProjectDisplay));
          setProjects(sorted);
          setStorageCache('projects', data);
        } else {
          // If remote table has no rows yet, provide rich mock projects
          const fallback = sortFeaturedProjectsFirst(mockProjects.map(resolveProjectDisplay));
          setProjects(fallback);
          setStorageCache('projects', mockProjects);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to mock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        const fallback = sortFeaturedProjectsFirst(mockProjects.map(resolveProjectDisplay));
        setProjects(fallback);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return { projects, loading, error };
}
