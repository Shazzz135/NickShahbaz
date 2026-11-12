import type { ProjectRow } from './mockData';

export interface LaidOutProject {
  project: ProjectRow;
  spanClass: string;
  isWide: boolean;
  isSolo: boolean;
}

export function getInitialScale(project: ProjectRow): 'mobile' | 'desktop' {
  const metricScale = (project.metrics as Record<string, unknown> | null)?.scale_type;
  if (metricScale === 'mobile' || metricScale === 'desktop') return metricScale;
  const cat = (project.category || '').toLowerCase();
  if (cat.includes('mobile') || cat.includes('ios') || cat.includes('android')) return 'mobile';
  const tags = (project.tags || []).map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes('swift') || t.includes('react native') || t.includes('flutter') || t.includes('ios') || t.includes('android'))) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Arranges projects according to user-defined layout rules:
 * - The primary pattern is always a window (desktop) and mobile view per row.
 * - Only when there are two extra windows or 3 mobiles then those rows fill with that type:
 *   - Two extra windows fill the row sharing it equally (6 cols + 6 cols).
 *   - Three extra mobiles fill the row (4 cols + 4 cols + 4 cols = 12 cols).
 *   - Leftover single window fills the row (12 cols).
 *   - Leftover two mobiles share the row (6 cols + 6 cols).
 *   - Leftover single mobile remains compact (4 cols).
 */
export function layoutProjects(
  list: ProjectRow[],
  scales: Record<string, 'mobile' | 'desktop'> = {}
): LaidOutProject[] {
  if (list.length === 0) return [];

  const isMobileProj = (p: ProjectRow) =>
    (scales[p.id] || getInitialScale(p)) === 'mobile';

  if (list.length === 1) {
    const isMobile = isMobileProj(list[0]);
    return [
      {
        project: list[0],
        spanClass: isMobile
          ? 'col-span-1 md:col-span-5 lg:col-span-4'
          : 'col-span-1 md:col-span-12 lg:col-span-12',
        isWide: !isMobile,
        isSolo: !isMobile,
      },
    ];
  }

  const mQueue: ProjectRow[] = [];
  const wQueue: ProjectRow[] = [];

  for (const p of list) {
    if (isMobileProj(p)) {
      mQueue.push(p);
    } else {
      wQueue.push(p);
    }
  }

  const result: LaidOutProject[] = [];
  let pairedRowIndex = 0;

  // 1. Primary pattern: 1 window and 1 mobile view per row
  while (mQueue.length > 0 && wQueue.length > 0) {
    const mobile = mQueue.shift()!;
    const window = wQueue.shift()!;

    if (pairedRowIndex % 2 === 0) {
      result.push({
        project: mobile,
        spanClass: 'col-span-1 md:col-span-5 lg:col-span-4',
        isWide: false,
        isSolo: false,
      });
      result.push({
        project: window,
        spanClass: 'col-span-1 md:col-span-7 lg:col-span-8',
        isWide: true,
        isSolo: false,
      });
    } else {
      result.push({
        project: window,
        spanClass: 'col-span-1 md:col-span-7 lg:col-span-8',
        isWide: true,
        isSolo: false,
      });
      result.push({
        project: mobile,
        spanClass: 'col-span-1 md:col-span-5 lg:col-span-4',
        isWide: false,
        isSolo: false,
      });
    }
    pairedRowIndex++;
  }

  // 2. Extra Windows: two extra windows fill the row sharing it equally (6 cols + 6 cols)
  while (wQueue.length >= 2) {
    const w1 = wQueue.shift()!;
    const w2 = wQueue.shift()!;
    result.push({
      project: w1,
      spanClass: 'col-span-1 md:col-span-6 lg:col-span-6',
      isWide: false,
      isSolo: false,
    });
    result.push({
      project: w2,
      spanClass: 'col-span-1 md:col-span-6 lg:col-span-6',
      isWide: false,
      isSolo: false,
    });
  }

  // Single leftover window fills the row
  if (wQueue.length === 1) {
    const w = wQueue.shift()!;
    result.push({
      project: w,
      spanClass: 'col-span-1 md:col-span-12 lg:col-span-12',
      isWide: true,
      isSolo: false,
    });
  }

  // 3. Extra Mobiles: 3 mobiles fill the row (4 cols + 4 cols + 4 cols)
  while (mQueue.length >= 3) {
    const m1 = mQueue.shift()!;
    const m2 = mQueue.shift()!;
    const m3 = mQueue.shift()!;
    result.push({
      project: m1,
      spanClass: 'col-span-1 md:col-span-4 lg:col-span-4',
      isWide: false,
      isSolo: false,
    });
    result.push({
      project: m2,
      spanClass: 'col-span-1 md:col-span-4 lg:col-span-4',
      isWide: false,
      isSolo: false,
    });
    result.push({
      project: m3,
      spanClass: 'col-span-1 md:col-span-4 lg:col-span-4',
      isWide: false,
      isSolo: false,
    });
  }

  // Leftover 2 mobiles share row equally (6 cols + 6 cols)
  if (mQueue.length === 2) {
    const m1 = mQueue.shift()!;
    const m2 = mQueue.shift()!;
    result.push({
      project: m1,
      spanClass: 'col-span-1 md:col-span-6 lg:col-span-6',
      isWide: false,
      isSolo: false,
    });
    result.push({
      project: m2,
      spanClass: 'col-span-1 md:col-span-6 lg:col-span-6',
      isWide: false,
      isSolo: false,
    });
  } else if (mQueue.length === 1) {
    // Single leftover mobile remains compact (4 cols)
    const m = mQueue.shift()!;
    result.push({
      project: m,
      spanClass: 'col-span-1 md:col-span-5 lg:col-span-4',
      isWide: false,
      isSolo: false,
    });
  }

  return result;
}
