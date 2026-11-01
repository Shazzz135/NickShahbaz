export interface HeroMetaConfig {
  eyebrow: string;
  headlinePrefix: string;
  headlineGradient: string;
  description: string;
  location: string;
  statusText: string;
  isAvailable: boolean;
  metricYears: string;
  metricUptime: string;
  metricLatency: string;
  metricWebgl: string;
}

export const DEFAULT_HERO_META: HeroMetaConfig = {
  eyebrow: 'FULL-STACK ARCHITECTURE & DIGITAL CRAFT',
  headlinePrefix: 'Architecting Next-Gen',
  headlineGradient: 'Applications & 3D Systems.',
  description: 'Engineering scalable web and mobile software with rigorous type-safety, GPU-accelerated WebGL visuals, and enterprise cloud resilience.',
  location: 'Toronto, CA • UTC-5',
  statusText: 'Open for Select Contracts',
  isAvailable: true,
  metricYears: '5+ Years',
  metricUptime: '99.9%',
  metricLatency: '< 50ms',
  metricWebgl: '60 FPS',
};
