export interface HeroMetaConfig {
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
  browserIconUrl?: string;
  isMailingServiceActive?: boolean;
}

export const DEFAULT_HERO_META: HeroMetaConfig = {
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
  browserIconUrl: '/favicon.png',
  isMailingServiceActive: true,
};

export type SkillCategory = 'Languages' | 'Frontend & 3D' | 'Backend & Cloud' | 'Systems & DevOps';

export interface SkillItem {
  id?: string;
  name: string;
  category: SkillCategory;
  level: number; // 0 - 100 percentage
  years: string;
  featured?: boolean;
}

export interface PhilosophyItem {
  id: string;
  title: string;
  description: string;
  badge: string;
}

export interface AboutStatItem {
  label: string;
  value: string;
  subtext: string;
}

export interface AboutMetaConfig {
  headlinePrefix?: string;
  headlineGradient?: string;
  headline: string;
  bioParagraphs: string[];
  avatarUrl?: string | null;
  location: string;
  availabilityNote: string;
  stats: AboutStatItem[];
  principles: PhilosophyItem[];
  skills: SkillItem[];
}

export const DEFAULT_ABOUT_META: AboutMetaConfig = {
  headlinePrefix: 'Here are some things you want to know',
  headlineGradient: 'about me.',
  headline: 'Here are some things you want to know about me.',
  bioParagraphs: [
    'I am a Solutions Architect and Lead Application Developer specializing in distributed full-stack systems, modern cloud infrastructure, and immersive 3D web applications.',
    'With over five years of production engineering experience, I bridge the gap between rigorous low-latency backend architectures (PostgreSQL, Docker, distributed cloud services) and fluid, GPU-accelerated client interfaces (Three.js, React 19, Motion).',
    'Whether designing resilient transactional pipelines, orchestrating multi-region cloud services, or crafting tactile real-time interactions, my priority is always delivering software that is fast, resilient, and enduring.'
  ],
  avatarUrl: null,
  location: 'Toronto, Ontario, Canada (Remote Global)',
  availabilityNote: 'Available for technical consulting, architecture design, and lead development contracts.',
  stats: [
    { label: 'Years Experience', value: '5+', subtext: 'Full-stack & systems' },
    { label: 'Production Apps', value: '30+', subtext: 'Web, mobile & cloud' },
    { label: 'System Uptime', value: '99.9%', subtext: 'Resilient cloud SLA' },
    { label: 'Frame Budget', value: '60 FPS', subtext: 'Hardware accelerated' },
  ],
  principles: [
    {
      id: 'p1',
      title: 'Performance as a Core Feature',
      description: 'Sub-50ms database response targets, aggressive asset bundling, and zero unnecessary runtime baggage.',
      badge: '<50ms SLA',
    },
    {
      id: 'p2',
      title: 'End-to-End Type Safety',
      description: 'Strict compile-time verification across PostgreSQL schemas, network payloads, and UI component state.',
      badge: 'Zero Runtime Errors',
    },
    {
      id: 'p3',
      title: 'Modular & Decoupled Systems',
      description: 'Containerized microservices, clean layer boundaries, and automated CI/CD deployment pipelines.',
      badge: 'Docker & CI/CD',
    },
    {
      id: 'p4',
      title: 'Aesthetic Precision & Tactile Feedback',
      description: 'Obsidian & crimson dark UI, GPU shader physics, and fluid micro-interactions designed to delight.',
      badge: '60 FPS Visuals',
    },
  ],
  skills: [
    // Languages
    { name: 'TypeScript', category: 'Languages', level: 96, years: '5 yrs', featured: true },
    { name: 'JavaScript (ESNext)', category: 'Languages', level: 95, years: '6 yrs' },
    { name: 'Python', category: 'Languages', level: 88, years: '4 yrs', featured: true },
    { name: 'SQL (PostgreSQL)', category: 'Languages', level: 92, years: '5 yrs', featured: true },
    { name: 'C++', category: 'Languages', level: 78, years: '3 yrs' },
    { name: 'HTML5 / CSS3', category: 'Languages', level: 95, years: '6 yrs' },

    // Frontend & 3D
    { name: 'React 19 / Next.js', category: 'Frontend & 3D', level: 96, years: '5 yrs', featured: true },
    { name: 'Three.js / WebGL', category: 'Frontend & 3D', level: 90, years: '3 yrs', featured: true },
    { name: 'React Three Fiber (R3F)', category: 'Frontend & 3D', level: 88, years: '3 yrs' },
    { name: 'GLSL Custom Shaders', category: 'Frontend & 3D', level: 82, years: '2 yrs' },
    { name: 'Tailwind CSS v4', category: 'Frontend & 3D', level: 95, years: '4 yrs' },
    { name: 'Motion / Framer', category: 'Frontend & 3D', level: 92, years: '4 yrs' },

    // Backend & Cloud
    { name: 'Node.js & Express', category: 'Backend & Cloud', level: 94, years: '5 yrs', featured: true },
    { name: 'Supabase (Auth, RLS, Storage)', category: 'Backend & Cloud', level: 95, years: '3 yrs', featured: true },
    { name: 'PostgreSQL & pgvector', category: 'Backend & Cloud', level: 90, years: '5 yrs' },
    { name: 'Docker & Containers', category: 'Backend & Cloud', level: 88, years: '4 yrs', featured: true },
    { name: 'WebSockets & Realtime', category: 'Backend & Cloud', level: 90, years: '4 yrs' },
    { name: 'AWS Cloud Architecture', category: 'Backend & Cloud', level: 85, years: '3 yrs' },
    { name: 'Redis Caching', category: 'Backend & Cloud', level: 84, years: '3 yrs' },

    // Systems & DevOps
    { name: 'GitHub Actions CI/CD', category: 'Systems & DevOps', level: 92, years: '4 yrs', featured: true },
    { name: 'Vitest & RTL Testing', category: 'Systems & DevOps', level: 90, years: '3 yrs' },
    { name: 'Linux / Shell Scripting', category: 'Systems & DevOps', level: 86, years: '4 yrs' },
    { name: 'Vite & Build Optimization', category: 'Systems & DevOps', level: 92, years: '4 yrs' },
    { name: 'Git Workflow & Code Review', category: 'Systems & DevOps', level: 95, years: '5 yrs' },
  ],
};