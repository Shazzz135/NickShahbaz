/**
 * Skill logo resolver mapping tool names to high-resolution transparent background PNGs.
 * Stored locally in /skills/*.png for offline resilience and fast loads.
 */

const SKILL_LOGO_MAP: Record<string, string> = {
  // Languages
  typescript: '/skills/typescript.png',
  javascript: '/skills/javascript.png',
  'javascript (esnext)': '/skills/javascript.png',
  python: '/skills/python.png',
  'sql (postgresql)': '/skills/postgresql.png',
  postgresql: '/skills/postgresql.png',
  postgres: '/skills/postgresql.png',
  'c++': '/skills/cpp.png',
  cpp: '/skills/cpp.png',
  'html5 / css3': '/skills/html5.png',
  html5: '/skills/html5.png',
  html: '/skills/html5.png',
  css3: '/skills/html5.png',
  css: '/skills/html5.png',

  // Frontend & 3D
  'react 19 / next.js': '/skills/react.png',
  react: '/skills/react.png',
  nextjs: '/skills/react.png',
  'next.js': '/skills/react.png',
  'three.js / webgl': '/skills/threejs.png',
  threejs: '/skills/threejs.png',
  'three.js': '/skills/threejs.png',
  webgl: '/skills/threejs.png',
  'react three fiber (r3f)': '/skills/r3f.png',
  r3f: '/skills/r3f.png',
  'react three fiber': '/skills/r3f.png',
  'glsl custom shaders': '/skills/glsl.png',
  glsl: '/skills/glsl.png',
  opengl: '/skills/glsl.png',
  shaders: '/skills/glsl.png',
  'tailwind css v4': '/skills/tailwind.png',
  tailwind: '/skills/tailwind.png',
  tailwindcss: '/skills/tailwind.png',
  'tailwind css': '/skills/tailwind.png',
  'motion / framer': '/skills/framer.png',
  motion: '/skills/framer.png',
  framer: '/skills/framer.png',
  'framer motion': '/skills/framer.png',

  // Backend & Cloud
  'node.js & express': '/skills/nodejs.png',
  nodejs: '/skills/nodejs.png',
  'node.js': '/skills/nodejs.png',
  express: '/skills/nodejs.png',
  'supabase (auth, rls, storage)': '/skills/supabase.png',
  supabase: '/skills/supabase.png',
  'postgresql & pgvector': '/skills/pgvector.png',
  pgvector: '/skills/pgvector.png',
  'docker & containers': '/skills/docker.png',
  docker: '/skills/docker.png',
  'websockets & realtime': '/skills/websocket.png',
  websocket: '/skills/websocket.png',
  websockets: '/skills/websocket.png',
  socketio: '/skills/websocket.png',
  'socket.io': '/skills/websocket.png',
  'aws cloud architecture': '/skills/aws.png',
  aws: '/skills/aws.png',
  'redis caching': '/skills/redis.png',
  redis: '/skills/redis.png',

  // Systems & DevOps
  'github actions ci/cd': '/skills/github-actions.png',
  'github actions': '/skills/github-actions.png',
  github: '/skills/github-actions.png',
  'vitest & rtl testing': '/skills/vitest.png',
  vitest: '/skills/vitest.png',
  'linux / shell scripting': '/skills/linux.png',
  linux: '/skills/linux.png',
  bash: '/skills/linux.png',
  'vite & build optimization': '/skills/vite.png',
  vite: '/skills/vite.png',
  'git workflow & code review': '/skills/git.png',
  git: '/skills/git.png',
};

/**
 * Resolves the transparent PNG logo path for a skill.
 * If no image is provided or found, returns null (display nothing).
 */
export function getSkillLogo(name: string, customLogoUrl?: string): string | null {
  if (customLogoUrl && customLogoUrl.trim()) {
    return customLogoUrl.trim();
  }

  const normalized = (name || '').toLowerCase().trim();
  if (SKILL_LOGO_MAP[normalized]) {
    return SKILL_LOGO_MAP[normalized];
  }

  for (const [key, path] of Object.entries(SKILL_LOGO_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return path;
    }
  }

  // If no image is provided, display nothing
  return null;
}
