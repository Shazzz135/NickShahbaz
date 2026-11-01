import type { ExperienceRow } from './mockData';

/**
 * Extracts a comparable numeric score representing the recency of a period string.
 * Supports patterns like:
 * - "2024 — Present" -> ongoing/active (highest priority)
 * - "2022 — 2024"   -> ended 2024
 * - "2023"          -> 2023
 * - "2018 — 2022"   -> ended 2022
 */
export function extractPeriodRecency(period: string, isCurrent?: boolean): { endScore: number; startScore: number } {
  const currentYear = new Date().getFullYear();
  const lower = period.toLowerCase();
  const isOngoing = isCurrent || lower.includes('present') || lower.includes('current') || lower.includes('now');

  // Find all 4-digit years in the string
  const yearMatches = period.match(/\b(19\d\d|20\d\d)\b/g);
  const years = yearMatches ? yearMatches.map(Number) : [];

  const startYear = years.length > 0 ? years[0] : 0;
  const endYear = years.length > 1 ? years[1] : years.length === 1 ? years[0] : 0;

  if (isOngoing) {
    // Ongoing items sort above completed ones; prioritize by their start year
    return {
      endScore: currentYear + 100,
      startScore: startYear || currentYear,
    };
  }

  return {
    endScore: endYear,
    startScore: startYear,
  };
}

/**
 * Sorts milestone items in reverse chronological order (most recent first down to oldest).
 * Ties are broken by sort_order or created_at.
 */
export function sortMilestonesReverseChronological<T extends Partial<ExperienceRow>>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // 1. Check is_current flag
    const aCurrent = Boolean(a.is_current);
    const bCurrent = Boolean(b.is_current);

    const aScores = extractPeriodRecency(a.period || '', aCurrent);
    const bScores = extractPeriodRecency(b.period || '', bCurrent);

    // Primary: End score (most recent end date first)
    if (bScores.endScore !== aScores.endScore) {
      return bScores.endScore - aScores.endScore;
    }

    // Secondary: Start score (most recent start date first)
    if (bScores.startScore !== aScores.startScore) {
      return bScores.startScore - aScores.startScore;
    }

    // Tertiary: sort_order if explicitly configured
    if (a.sort_order !== undefined && b.sort_order !== undefined && a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    // Fallback: created_at descending
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }

    return 0;
  });
}
