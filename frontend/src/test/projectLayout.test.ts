import { describe, it, expect } from 'vitest';
import { layoutProjects, getInitialScale } from '../lib/projectLayout';
import type { ProjectRow } from '../lib/mockData';

function createMockProject(id: string, scale: 'desktop' | 'mobile'): ProjectRow {
  return {
    id,
    title: `Project ${id}`,
    slug: `project-${id}`,
    subtitle: 'Subtitle',
    description: 'Description',
    category: scale === 'mobile' ? 'Mobile' : 'Full-Stack',
    tags: scale === 'mobile' ? ['iOS', 'React Native'] : ['React', 'Node.js'],
    featured: false,
    thumbnail_url: 'https://example.com/thumb.jpg',
    preview_video_url: null,
    live_url: null,
    github_url: null,
    architecture_overview: null,
    metrics: { scale_type: scale },
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

describe('projectLayout', () => {
  it('detects initial scale properly', () => {
    const desktop = createMockProject('d1', 'desktop');
    const mobile = createMockProject('m1', 'mobile');
    expect(getInitialScale(desktop)).toBe('desktop');
    expect(getInitialScale(mobile)).toBe('mobile');
  });

  it('pairs 1 window and 1 mobile per row when both types exist', () => {
    const list = [
      createMockProject('w1', 'desktop'),
      createMockProject('w2', 'desktop'),
      createMockProject('m1', 'mobile'),
      createMockProject('m2', 'mobile'),
    ];

    const laidOut = layoutProjects(list);
    expect(laidOut).toHaveLength(4);

    // Row 0: mobile (4) + window (8)
    expect(laidOut[0].project.id).toBe('m1');
    expect(laidOut[0].spanClass).toContain('lg:col-span-4');
    expect(laidOut[1].project.id).toBe('w1');
    expect(laidOut[1].spanClass).toContain('lg:col-span-8');

    // Row 1: window (8) + mobile (4)
    expect(laidOut[2].project.id).toBe('w2');
    expect(laidOut[2].spanClass).toContain('lg:col-span-8');
    expect(laidOut[3].project.id).toBe('m2');
    expect(laidOut[3].spanClass).toContain('lg:col-span-4');
  });

  it('fills row equally with 6 cols each when there are two extra windows', () => {
    // 3 windows, 1 mobile -> 1 paired row (1 mobile, 1 window) + 2 extra windows
    const list = [
      createMockProject('w1', 'desktop'),
      createMockProject('w2', 'desktop'),
      createMockProject('w3', 'desktop'),
      createMockProject('m1', 'mobile'),
    ];

    const laidOut = layoutProjects(list);
    expect(laidOut).toHaveLength(4);

    // Row 0: mobile + window
    expect(laidOut[0].project.id).toBe('m1');
    expect(laidOut[1].project.id).toBe('w1');

    // Row 1: 2 extra windows sharing row equally (6 cols + 6 cols)
    expect(laidOut[2].project.id).toBe('w2');
    expect(laidOut[2].spanClass).toContain('lg:col-span-6');
    expect(laidOut[3].project.id).toBe('w3');
    expect(laidOut[3].spanClass).toContain('lg:col-span-6');
  });

  it('fills row with 3 mobiles (4 cols each) when there are 3 extra mobiles', () => {
    // 1 window, 4 mobiles -> 1 paired row (1 mobile, 1 window) + 3 extra mobiles
    const list = [
      createMockProject('w1', 'desktop'),
      createMockProject('m1', 'mobile'),
      createMockProject('m2', 'mobile'),
      createMockProject('m3', 'mobile'),
      createMockProject('m4', 'mobile'),
    ];

    const laidOut = layoutProjects(list);
    expect(laidOut).toHaveLength(5);

    // Row 0: mobile + window
    expect(laidOut[0].project.id).toBe('m1');
    expect(laidOut[1].project.id).toBe('w1');

    // Row 1: 3 extra mobiles filling row
    expect(laidOut[2].project.id).toBe('m2');
    expect(laidOut[2].spanClass).toContain('lg:col-span-4');
    expect(laidOut[3].project.id).toBe('m3');
    expect(laidOut[3].spanClass).toContain('lg:col-span-4');
    expect(laidOut[4].project.id).toBe('m4');
    expect(laidOut[4].spanClass).toContain('lg:col-span-4');
  });

  it('handles single leftover window by spanning 12 columns', () => {
    // 2 windows, 1 mobile -> 1 paired row + 1 extra window
    const list = [
      createMockProject('w1', 'desktop'),
      createMockProject('w2', 'desktop'),
      createMockProject('m1', 'mobile'),
    ];

    const laidOut = layoutProjects(list);
    expect(laidOut).toHaveLength(3);

    // Row 0: mobile + window
    expect(laidOut[0].project.id).toBe('m1');
    expect(laidOut[1].project.id).toBe('w1');

    // Single extra window
    expect(laidOut[2].project.id).toBe('w2');
    expect(laidOut[2].spanClass).toContain('lg:col-span-12');
  });

  it('handles solo desktop and solo mobile projects', () => {
    const soloDesktop = layoutProjects([createMockProject('w1', 'desktop')]);
    expect(soloDesktop[0].spanClass).toContain('lg:col-span-12');
    expect(soloDesktop[0].isSolo).toBe(true);

    const soloMobile = layoutProjects([createMockProject('m1', 'mobile')]);
    expect(soloMobile[0].spanClass).toContain('lg:col-span-4');
    expect(soloMobile[0].isSolo).toBe(false);
  });
});
