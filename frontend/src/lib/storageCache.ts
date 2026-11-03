/**
 * Client-side local storage cache for instant hydration
 * Eliminates FOUC (Flash of Unstyled / Default Mock Content)
 */

const CACHE_PREFIX = 'ns_db_cache_';

export function getStorageCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStorageCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // Ignore quota or private browsing mode errors
  }
}
