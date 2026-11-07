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
  years: string;
  logoUrl?: string;
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
    { name: 'TypeScript', category: 'Languages', years: '5 yrs', logoUrl: '/skills/typescript.png', featured: true },
    { name: 'JavaScript (ESNext)', category: 'Languages', years: '6 yrs', logoUrl: '/skills/javascript.png' },
    { name: 'Python', category: 'Languages', years: '4 yrs', logoUrl: '/skills/python.png', featured: true },
    { name: 'SQL (PostgreSQL)', category: 'Languages', years: '5 yrs', logoUrl: '/skills/postgresql.png', featured: true },
    { name: 'C++', category: 'Languages', years: '3 yrs', logoUrl: '/skills/cpp.png' },
    { name: 'HTML5 / CSS3', category: 'Languages', years: '6 yrs', logoUrl: '/skills/html5.png' },

    // Frontend & 3D
    { name: 'React 19 / Next.js', category: 'Frontend & 3D', years: '5 yrs', logoUrl: '/skills/react.png', featured: true },
    { name: 'Three.js / WebGL', category: 'Frontend & 3D', years: '3 yrs', logoUrl: '/skills/threejs.png', featured: true },
    { name: 'React Three Fiber (R3F)', category: 'Frontend & 3D', years: '3 yrs', logoUrl: '/skills/r3f.png' },
    { name: 'GLSL Custom Shaders', category: 'Frontend & 3D', years: '2 yrs', logoUrl: '/skills/glsl.png' },
    { name: 'Tailwind CSS v4', category: 'Frontend & 3D', years: '4 yrs', logoUrl: '/skills/tailwind.png' },
    { name: 'Motion / Framer', category: 'Frontend & 3D', years: '4 yrs', logoUrl: '/skills/framer.png' },

    // Backend & Cloud
    { name: 'Node.js & Express', category: 'Backend & Cloud', years: '5 yrs', logoUrl: '/skills/nodejs.png', featured: true },
    { name: 'Supabase (Auth, RLS, Storage)', category: 'Backend & Cloud', years: '3 yrs', logoUrl: '/skills/supabase.png', featured: true },
    { name: 'PostgreSQL & pgvector', category: 'Backend & Cloud', years: '5 yrs', logoUrl: '/skills/pgvector.png' },
    { name: 'Docker & Containers', category: 'Backend & Cloud', years: '4 yrs', logoUrl: '/skills/docker.png', featured: true },
    { name: 'WebSockets & Realtime', category: 'Backend & Cloud', years: '4 yrs', logoUrl: '/skills/websocket.png' },
    { name: 'AWS Cloud Architecture', category: 'Backend & Cloud', years: '3 yrs', logoUrl: '/skills/aws.png' },
    { name: 'Redis Caching', category: 'Backend & Cloud', years: '3 yrs', logoUrl: '/skills/redis.png' },

    // Systems & DevOps
    { name: 'GitHub Actions CI/CD', category: 'Systems & DevOps', years: '4 yrs', logoUrl: '/skills/github-actions.png', featured: true },
    { name: 'Vitest & RTL Testing', category: 'Systems & DevOps', years: '3 yrs', logoUrl: '/skills/vitest.png' },
    { name: 'Linux / Shell Scripting', category: 'Systems & DevOps', years: '4 yrs', logoUrl: '/skills/linux.png' },
    { name: 'Vite & Build Optimization', category: 'Systems & DevOps', years: '4 yrs', logoUrl: '/skills/vite.png' },
    { name: 'Git Workflow & Code Review', category: 'Systems & DevOps', years: '5 yrs', logoUrl: '/skills/git.png' },
  ],
};
