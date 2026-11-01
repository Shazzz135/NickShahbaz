import '@testing-library/jest-dom';
import { vi } from 'vitest';

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect = () => {};
  observe = () => {};
  takeRecords = () => [];
  unobserve = () => {};
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// In test environment, enforce offline fallback data so unit tests don't timeout on network
vi.mock('../lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/supabase')>();
  return {
    ...actual,
    isSupabaseConfigured: false,
  };
});
