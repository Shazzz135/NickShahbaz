# Architecture & System Design

## 1. System Topology

```
+-------------------------------------------------------------+
|                      Client Browser                         |
|  - React 19 + TypeScript (Vite Bundled)                     |
|  - Tailwind CSS v4 (Dark / Crimson Red / White Theme)       |
|  - Lenis Smooth Scrolling Engine                            |
|  - Motion (Framer Motion) Animation Layer                   |
|  - Three.js / React Three Fiber WebGL Canvas (Background)   |
+------------------------------+------------------------------+
                               |
                +--------------+--------------+
                |                             |
                v                             v
+-------------------------------+ +-------------------------------+
|      Supabase (Cloud)         | |    Resend / Vercel Edge API   |
|  - PostgreSQL Database        | |  - Transactional Contact      |
|  - Supabase Auth (Admin Role) | |    Email Dispatch             |
|  - Supabase Storage (Images)  | |  - Validation & Rate Limiting |
|  - Row Level Security (RLS)   | +-------------------------------+
+-------------------------------+
```

## 2. Directory Map & Standards

All code follows strict modularity principles:
- **Presentation Components**: Pure UI components styled with Tailwind v4 in `src/components/common/`.
- **Scene / WebGL**: Three.js canvases and shader files strictly isolated under `src/components/3d/` with suspense and progressive degradation.
- **Data Layer**: Direct Supabase queries encapsulated in typed custom hooks (`src/hooks/`) with fallback mock data for offline/development resilience.
- **Admin Isolation**: Admin panel lives in `/admin` with separate chunking so public visitors never download admin bundle code.

## 3. Screen Responsiveness & Admin Design Principles

- **Cross-Device Responsiveness (Windows & Mobile Priority)**:
  - All views must be tested and optimized for Windows desktops (wide screens, high information density, clean columns) and Mobile screens (iOS Safari, Android Chrome, touch targets >= 40-44px, zero horizontal overflow).
  - Tablet & laptop layouts must adaptively transition between 1-column and 2/3-column layouts.
- **Admin CMS Simplicity**:
  - The Admin portal must remain simple, fast, and static: no 3D tilt cards, no hover jumps or bouncing springs, and no ambient glows.
  - CRUD operations must be snappy with instant scrolling and immediate visual feedback.
