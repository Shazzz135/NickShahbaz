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

export type MilestoneCategoryType = 'experience' | 'education' | 'certification' | 'event';

/**
 * Intelligently infers milestone category when milestone_type is missing from older schema rows.
 */
export function inferMilestoneType(item: Partial<ExperienceRow>): MilestoneCategoryType {
  const text = `${item.role || ''} ${item.company || ''} ${(item.highlights || []).join(' ')}`.toLowerCase();

  // Education keywords
  if (
    text.includes('bachelor') ||
    text.includes('undergraduate') ||
    text.includes('university') ||
    text.includes('college') ||
    text.includes('degree') ||
    text.includes('b.s.') ||
    text.includes('m.s.') ||
    text.includes('b.a.') ||
    text.includes('ph.d') ||
    text.includes('academic') ||
    text.includes('curriculum') ||
    text.includes('coursework') ||
    text.includes('student') ||
    text.includes('education') ||
    text.includes('laurier')
  ) {
    return 'education';
  }

  // Event / Hackathon keywords
  if (
    text.includes('hackathon') ||
    text.includes('hack to the future') ||
    text.includes('hack') ||
    text.includes('sprint') ||
    text.includes('competition') ||
    text.includes('conference') ||
    text.includes('summit') ||
    text.includes('event') ||
    text.includes('grand prize') ||
    text.includes('fellowship')
  ) {
    return 'event';
  }

  // Certification keywords
  if (
    text.includes('certified') ||
    text.includes('certification') ||
    text.includes('accreditation') ||
    text.includes('credential') ||
    text.includes('license') ||
    text.includes('aws certified') ||
    text.includes('cloud practitioner')
  ) {
    return 'certification';
  }

  return 'experience';
}

/**
 * Extracts normalized milestone category, reading explicit field, embedded metadata, or intelligent inference.
 */
export function extractMilestoneType(item: Partial<ExperienceRow>): MilestoneCategoryType {
  const rawType = item.milestone_type as string | undefined;
  if (
    rawType &&
    rawType !== 'work' &&
    ['experience', 'education', 'certification', 'event'].includes(rawType)
  ) {
    return rawType as MilestoneCategoryType;
  }

  // Check highlights for internal type marker
  if (Array.isArray(item.highlights)) {
    const marker = item.highlights.find((h) => typeof h === 'string' && h.startsWith('__type:'));
    if (marker) {
      const type = marker.replace('__type:', '').trim();
      if (['experience', 'education', 'certification', 'event'].includes(type)) {
        return type as MilestoneCategoryType;
      }
    }
  }

  return inferMilestoneType(item);
}

/**
 * Strips internal metadata markers (e.g. __type:*) from deliverable highlights before rendering.
 */
export function cleanHighlights(highlights?: string[]): string[] {
  if (!Array.isArray(highlights)) return [];
  return highlights
    .filter((h) => typeof h === 'string' && !h.startsWith('__type:') && h.trim().length > 0)
    .map(normalizeSpelling);
}

/**
 * Deduplicates milestones by unique ID or role+company combo to prevent any duplicate card rendering.
 */
export function deduplicateMilestones<T extends Partial<ExperienceRow>>(items: T[]): T[] {
  const seenIds = new Set<string>();
  const seenSignatures = new Set<string>();

  return items.filter((item) => {
    if (item.id) {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
    }
    const signature = `${(item.role || '').trim().toLowerCase()}:::${(item.company || '').trim().toLowerCase()}:::${(item.period || '').trim().toLowerCase()}`;
    if (seenSignatures.has(signature)) return false;
    seenSignatures.add(signature);
    return true;
  });
}

/**
 * Normalizes spelling, grammatical, and typographical errors in milestone text.
 */
export function normalizeSpelling(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\bdiffucult\b/gi, 'difficult')
    .replace(/\bOrginized\b/g, 'Organized')
    .replace(/\borginized\b/g, 'organized')
    .replace(/\brepo's\b/gi, 'repos')
    .replace(/\bAPI's\b/g, 'APIs')
    .replace(/\bOperating System's\b/gi, 'Operating Systems')
    .replace(/Grade 11 and 12\(2 years of Python experience\./g, 'Grade 11 and 12 (2 years of Python experience).')
    .replace(/Designed slide show presentations cover diffucult topics/gi, 'Designed slideshow presentations covering difficult topics')
    .replace(/Designed slide show presentations cover difficult topics/gi, 'Designed slideshow presentations covering difficult topics')
    .replace(/lecture events ran by LCS/gi, 'lecture events run by LCS')
    .replace(/Teaching basics to new students basics of/gi, 'Teaching new students the basics of')
    .replace(/Leading projects and discuss planning/gi, 'Leading projects and discussing planning')
    .replace(/Less is More!/g, 'Less is more!')
    .replace(/Both Owners retrieve/g, 'Both owners retrieve')
    .replace(/branches\/locations requests/g, 'branch/location requests')
    .replace(/Looking through project submissions for discrepancies\./g, 'Reviewing project submissions for architectural integrity and discrepancies.');
}

/**
 * Normalizes known technology casing and typos.
 */
export function normalizeTechName(tech: string): string {
  if (!tech || typeof tech !== 'string') return '';
  const trimmed = tech.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'github') return 'GitHub';
  if (lower === 'typescript') return 'TypeScript';
  if (lower === 'google cloud' || trimmed === 'Google CLoud') return 'Google Cloud';
  if (trimmed === "Operating System's") return 'Operating Systems';
  if (lower === 'fast api' || lower === 'fastapi') return 'FastAPI';
  return trimmed;
}
