# Project Task & Issue Tracker

> Master milestone & issue tracker organized in **Backend & Data-First** order.

---

## 🎯 Milestone 1: Project Scaffolding, DevOps & Foundations
- [x] **Issue #1**: [DevOps] Dockerize Development & Multi-Stage Production Builds
  - [x] Subtask 1.1: Create `docker/Dockerfile.dev` and root `docker-compose.yml`.
  - [x] Subtask 1.2: Validate Docker local run and hot-reload.
  - [x] Subtask 1.3: Create multi-stage `docker/Dockerfile.prod` with security headers.
  - [x] Subtask 1.4: Verify Docker configurations and build readiness.
- [ ] **Issue #2**: [CI/CD] Set up GitHub Actions CI Workflow
  - [ ] Subtask 2.1: Add `.github/workflows/ci.yml` for automated lint, typecheck, and build validation.

---

## 🎯 Milestone 2: Backend Architecture, Supabase & Data Schemas (Priority Foundation)
- [ ] **Issue #3**: [Database] Supabase Database Schema, RLS & Migrations
  - [ ] Subtask 3.1: Write SQL migrations for `projects`, `experiences`, `inquiries`, and `site_meta`.
  - [ ] Subtask 3.2: Configure Row Level Security (RLS) policies (public read, admin write).
  - [ ] Subtask 3.3: Set up Supabase Storage bucket for project media assets.
- [ ] **Issue #4**: [Data Layer] Client-Side Supabase Integration & Type Generation
  - [ ] Subtask 4.1: Configure typed Supabase client in `src/lib/supabase.ts`.
  - [ ] Subtask 4.2: Generate strict TypeScript database types from schema.
  - [ ] Subtask 4.3: Create custom hooks with offline mock fallback data.

---

## 🎯 Milestone 3: Design System, Tokens & Motion Core Primitives
- [ ] **Issue #5**: [Design] Establish Dark Mode Design Tokens (Crimson Red & White Palette)
  - [ ] Subtask 5.1: Configure Tailwind CSS v4 variables with crimson red (`#E50914`, `#FF1E27`) and deep darks (`#08080A`).
  - [ ] Subtask 5.2: Set up typography & font imports.
  - [ ] Subtask 5.3: Build reusable core components: Button, Card, Badge, Magnetic hover wrapper.
- [ ] **Issue #6**: [Motion] Integrate Lenis Smooth Scrolling & Global Motion Wrapper
  - [ ] Subtask 6.1: Install & configure `lenis` smooth scroll with custom easing.
  - [ ] Subtask 6.2: Synchronize Lenis scroll triggers with Framer Motion.
- [ ] **Issue #7**: [WebGL] Create Interactive Three.js Background & Particles System
  - [ ] Subtask 7.1: Install Three.js, `@react-three/fiber`, `@react-three/drei`.
  - [ ] Subtask 7.2: Build dynamic interactive particle field & ambient red geometry responding to cursor.
  - [ ] Subtask 7.3: Add performance tiering and low-power mobile fallbacks.

---

## 🎯 Milestone 4: Authenticated Admin Portal & CMS (Real Data Creation)
- [ ] **Issue #8**: [Auth] Admin Authentication Flow & Route Protection
  - [ ] Subtask 8.1: Build `/admin/login` page with Supabase Auth session handling.
  - [ ] Subtask 8.2: Implement protected route guards preventing unauthorized navigation.
- [ ] **Issue #9**: [Admin CMS] CRUD Management Dashboard
  - [ ] Subtask 9.1: Build Project Management view with image upload and order manipulation.
  - [ ] Subtask 9.2: Build Experience Timeline editor.
  - [ ] Subtask 9.3: Build Inquiries Inbox viewer.

---

## 🎯 Milestone 5: Public Experience & Interactive Sections (Hydrated from DB)
- [ ] **Issue #10**: [UI] Interactive Loading Screen & Scene Entrance Orchestration
  - [ ] Subtask 10.1: Build preloader with asset readiness detection and red progress animation.
  - [ ] Subtask 10.2: Orchestrate entrance sequence into the Hero section.
- [ ] **Issue #11**: [Section] Dynamic Hero Section with 3D Foreground Elements
  - [ ] Subtask 11.1: Build high-impact hero headline, availability status badge, and magnetic CTAs.
  - [ ] Subtask 11.2: Build interactive 3D foreground element.
- [ ] **Issue #12**: [Section] Application Development Project Gallery & Detail Modals
  - [ ] Subtask 12.1: Build bento/grid layout with 3D card tilt and glowing crimson borders.
  - [ ] Subtask 12.2: Build rich project detail modal with video/image previews and tech tags.
  - [ ] Subtask 12.3: Add category filter pills (Mobile, Full-Stack, Tools, AI).
- [ ] **Issue #13**: [Section] Experience & Career Interactive Timeline
  - [ ] Subtask 13.1: Build scroll-driven vertical timeline with glowing red nodes.
  - [ ] Subtask 13.2: Create expandable role cards with metrics and technology chips.
- [ ] **Issue #14**: [Section] About Me, Skills Matrix & Philosophy
  - [ ] Subtask 14.1: Build dense bio section with engineering philosophy.
  - [ ] Subtask 14.2: Build interactive skill category radar / proficiency chips.
- [ ] **Issue #15**: [Section] Contact Section & Resend Integration
  - [ ] Subtask 15.1: Build accessible contact form with client validation.
  - [ ] Subtask 15.2: Connect form to Resend API endpoint.
  - [ ] Subtask 15.3: Add copy-to-clipboard email pill, timezone status clock, and social links.

---

## 🎯 Milestone 6: Performance Optimization, Vercel Deployment & NameSilo DNS
- [ ] **Issue #16**: [Performance] Web Vitals, Bundle Splitting & 60 FPS Audit
  - [ ] Subtask 16.1: Lazy-load 3D canvas and dynamic imports for admin routes.
  - [ ] Subtask 16.2: Asset compression and WebP/AVIF generation.
- [ ] **Issue #17**: [Deployment] Vercel Production Deployment & NameSilo DNS
  - [ ] Subtask 17.1: Configure Vercel project deployment settings and environment variables.
  - [ ] Subtask 17.2: Configure NameSilo DNS A/CNAME records.
  - [ ] Subtask 17.3: Complete end-to-end production verification.
