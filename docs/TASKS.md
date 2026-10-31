# Project Task & Issue Tracker

> Master milestone & issue tracker organized in **Backend & Data-First** order with **Progressive CI/CD Quality Gates**.

---

## 🎯 Milestone 1: Project Scaffolding, DevOps & Foundations
- [x] **Issue #2**: [DevOps] Dockerize Development & Multi-Stage Production Builds
  - [x] Subtask 1.1: Create `docker/Dockerfile.dev` and root `docker-compose.yml`.
  - [x] Subtask 1.2: Validate Docker local run and hot-reload.
  - [x] Subtask 1.3: Create multi-stage `docker/Dockerfile.prod` with security headers.
  - [x] Subtask 1.4: Verify Docker configurations and build readiness.
- [x] **Issue #3**: [CI/CD] Set up GitHub Actions CI Workflow
  - [x] Subtask 2.1: Add `.github/workflows/ci.yml` for automated lint, typecheck, and build validation.
  - [x] Subtask 2.2: Add steps for pnpm setup, dependency caching, linting, type-checking, and build verification.
  - [x] Subtask 2.3: Test workflow execution locally and verify passing build on GitHub.

---

## 🎯 Milestone 2: Backend Architecture, Supabase & Data Schemas (Priority Foundation)
- [x] **Issue #4**: [Database] Supabase Database Schema, RLS & Migrations
  - [x] Subtask 3.1: Write SQL migrations for `projects`, `experiences`, `inquiries`, and `site_meta`.
  - [x] Subtask 3.2: Configure Row Level Security (RLS) policies (public read, admin write).
  - [x] Subtask 3.3: Set up Supabase Storage bucket for project media assets.
- [x] **Issue #5**: [Data Layer] Client-Side Supabase Integration, Type Generation & Schema CI Gate
  - [x] Subtask 4.1: Install `@supabase/supabase-js`.
  - [x] Subtask 4.2: Generate strict TypeScript database definitions (`src/types/database.types.ts`).
  - [x] Subtask 4.3: Implement typed Supabase client in `src/lib/supabase.ts`.
  - [x] Subtask 4.4: Build custom data hooks (`useProjects`, `useExperiences`, `useSiteMeta`) with offline mock fallback data.
  - [x] Subtask 4.5: [CI Gate] Add strict schema drift and typecheck verification step in `.github/workflows/ci.yml`.

---

## 🎯 Milestone 3: Design System, Tokens & Motion Core Primitives
- [x] **Issue #6**: [Design] Establish Dark Mode Design Tokens (Crimson Red & White Palette)
  - [x] Subtask 5.1: Configure Tailwind CSS v4 variables with crimson red (`#E50914`, `#FF1E27`) and deep darks (`#08080A`).
  - [x] Subtask 5.2: Set up typography & font imports.
  - [x] Subtask 5.3: Build reusable core components: Button, Card, Badge, Magnetic hover wrapper.
- [x] **Issue #7**: [Motion] Integrate Lenis Smooth Scrolling & Global Motion Wrapper
  - [x] Subtask 6.1: Install & configure lenis smooth scroll with custom easing.
  - [x] Subtask 6.2: Synchronize Lenis scroll triggers with Framer Motion.
  - [x] Subtask 6.3: Style customized slim crimson scroll indicator.
- [ ] **Issue #8**: [WebGL] Create Interactive Three.js Background & Bundle Budget CI Gate
  - [ ] Subtask 7.1: Install Three.js, `@react-three/fiber`, `@react-three/drei`.
  - [ ] Subtask 7.2: Build dynamic interactive particle field & ambient red geometry responding to cursor.
  - [ ] Subtask 7.3: Implement performance scaling and low-power mobile fallbacks.
  - [ ] Subtask 7.4: [CI Gate] Add bundle size limit & chunk-size warning check to CI to prevent asset bloat.

---

## 🎯 Milestone 4: Authenticated Admin Portal & CMS (Real Data Creation)
- [ ] **Issue #9**: [Auth] Admin Authentication Flow & Route Protection
  - [ ] Subtask 8.1: Build `/admin/login` page with Supabase Auth session handling.
  - [ ] Subtask 8.2: Create `AuthContext` to manage Supabase user sessions.
  - [ ] Subtask 8.3: Implement `ProtectedRoute` component to redirect unauthorized visitors.
- [ ] **Issue #10**: [Admin CMS] CRUD Management Dashboard & Unit Test CI Gate
  - [ ] Subtask 9.1: Build Admin Dashboard layout with sidebar navigation and metrics summary.
  - [ ] Subtask 9.2: Implement Project CRUD interface with image upload to Supabase Storage.
  - [ ] Subtask 9.3: Implement Experience Timeline editor.
  - [ ] Subtask 9.4: Implement Inquiries Inbox viewer.
  - [ ] Subtask 9.5: [CI Gate] Configure Vitest & React Testing Library in CI for automated auth guard & CRUD regression testing.

---

## 🎯 Milestone 5: Public Experience & Interactive Sections (Hydrated from DB)
- [ ] **Issue #11**: [UI] Interactive Loading Screen & Scene Entrance Orchestration
  - [ ] Subtask 10.1: Build preloader with asset readiness detection and red progress animation.
  - [ ] Subtask 10.2: Orchestrate entrance sequence into the Hero section.
- [ ] **Issue #12**: [Section] Dynamic Hero Section with 3D Foreground Elements
  - [ ] Subtask 11.1: Build high-impact hero headline, availability status badge, and magnetic CTAs.
  - [ ] Subtask 11.2: Build interactive 3D foreground element.
- [ ] **Issue #13**: [Section] Application Development Project Gallery & Detail Modals
  - [ ] Subtask 12.1: Build bento/grid layout with 3D card tilt and glowing crimson borders.
  - [ ] Subtask 12.2: Build rich project detail modal with video/image previews and tech tags.
  - [ ] Subtask 12.3: Add category filter pills (Mobile, Full-Stack, Tools, AI).
- [ ] **Issue #14**: [Section] Experience & Career Interactive Timeline
  - [ ] Subtask 13.1: Build scroll-driven vertical timeline with glowing red nodes.
  - [ ] Subtask 13.2: Create expandable role cards with metrics and technology chips.
- [ ] **Issue #15**: [Section] About Me, Skills Matrix & Philosophy
  - [ ] Subtask 14.1: Build dense bio section with engineering philosophy.
  - [ ] Subtask 14.2: Build interactive skill category radar / proficiency chips.
- [ ] **Issue #16**: [Section] Contact Section, Resend Integration & Payload Validation CI Gate
  - [ ] Subtask 15.1: Build accessible contact form with client validation.
  - [ ] Subtask 15.2: Connect form to Resend API endpoint.
  - [ ] Subtask 15.3: Persist submission to Supabase `inquiries` table.
  - [ ] Subtask 15.4: [CI Gate] Add payload contract tests in CI validating email & inquiry schema integrity.

---

## 🎯 Milestone 6: Performance Optimization, Vercel Deployment & NameSilo DNS
- [ ] **Issue #17**: [Performance] Web Vitals, 60 FPS Audit & Lighthouse CI Gate
  - [ ] Subtask 16.1: Lazy-load 3D canvas and dynamic imports for admin routes.
  - [ ] Subtask 16.2: Asset compression and WebP/AVIF generation.
  - [ ] Subtask 16.3: [CI Gate] Integrate Lighthouse CI action on pull requests for Core Web Vitals, accessibility, and SEO scoring.
- [ ] **Issue #18**: [Deployment] Vercel Production Deployment & NameSilo DNS
  - [ ] Subtask 17.1: Link repository to Vercel and configure production environment variables.
  - [ ] Subtask 17.2: Configure NameSilo DNS A/CNAME records.
  - [ ] Subtask 17.3: Complete end-to-end production verification & preview URL comments in CI.
