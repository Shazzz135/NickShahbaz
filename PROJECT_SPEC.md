# Project Master Specification & Requirements

> **Project Name:** Nick Shahbaz Portfolio & Digital Agency Platform  
> **Repository:** `NickShahbaz` (Private: `Shazzz135/NickShahbaz`)  
> **Status:** M0: Architecture, Specs & Work Breakdown (Approved)  
> **Approach:** Backend & Data-First (Contracts -> Auth/CMS -> Motion/Design -> Public UI -> Deployment)  
> **Last Updated:** 2026-10-30  

---

## 1. Executive Summary & Vision

A high-end, futuristic, dark-mode personal & agency portfolio showcasing **Application Development**, engineering capabilities, and creative technical execution.

### Key Pillars:
1. **Visual Identity**: High-contrast Dark Mode with a striking **Crimson Red (`#E50914` / `#FF1E27` / `#D90429`), Pure White (`#FFFFFF`), and Deep Obsidian/Charcoal (`#08080A` / `#0F0F12`)** palette. Dynamic, rich layout with deliberate visual density (no passive "dead empty space") using ambient meshes, subtle grid lines, particles, and interactive canvas backgrounds.
2. **Motion & Interactivity**:
   - Interactive Preloader / Intro sequence.
   - 3D WebGL background and hero foreground using **Three.js / React Three Fiber**.
   - Page and component orchestration via **Motion (Framer Motion)**.
   - Butter-smooth inertia scrolling powered by **Lenis**.
   - Micro-interactions on cursor, cards, and navigation.
3. **Architecture & Full-Stack Capabilities**:
   - **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion + Three.js / R3F + Lenis.
   - **Backend / Database / Auth**: **Supabase** (PostgreSQL, Supabase Auth with Row Level Security, Storage buckets for media).
   - **Email Dispatch**: **Resend** (transactional emails from contact forms via serverless / edge endpoint).
   - **Admin Portal**: Password-protected, role-gated CMS dashboard to update projects, timeline experiences, skills, and personal information directly without touching code.
   - **DevOps**: Docker & Docker Compose for standardized local development and preview consistency.
   - **Deployment & DNS**: Vercel production hosting connected to a custom domain via NameSilo.

---

## 2. Information Architecture & Page Flow

### 2.1 Public Experience
1. **Interactive Loader**: Cinematic, quick loading animation (asset preloading + branded monogram/soundwave or shader effect) transitioning into the experience.
2. **Hero Section**:
   - High-impact typography, title, and availability badge.
   - Interactive 3D element (Three.js canvas responding to mouse orientation / scroll).
   - Dynamic CTA (Explore Work / Contact) with magnetic hover effect.
3. **Projects Showcase**:
   - Filterable / Categorized application development projects (Web, Mobile, Enterprise, AI/Tools).
   - Interactive preview cards with tilt, glowing crimson borders on hover, video/image modal previews, tech stack tags, and live/GitHub links.
4. **Experience & Career Timeline**:
   - Interactive vertical timeline showing milestone roles, accomplishments, and tech stacks.
   - Expandable detail drawers with metrics and key deliverables.
5. **About & Philosophy**:
   - Personal bio, engineering philosophy, interactive skills graph / categorized tech stacks, and quick stats.
6. **Interactive Canvas Foreground / Background**:
   - Persistent ambient shader/particle canvas reacting to scroll state and mouse trails.
7. **Contact Section**:
   - Sleek form (Name, Email, Project Budget/Type, Message).
   - Built-in validation + Resend API integration + spam protection (Turnstile/honeypot).
   - Social links, PGP/email copy-to-clipboard pill, timezone indicator.

### 2.2 Authenticated Admin Dashboard (`/admin`)
- **Authentication**: Supabase Auth (Email/Password or Magic Link) with strict role verification.
- **Projects Manager**: Create, Read, Update, Delete (CRUD) projects, upload screenshots to Supabase Storage, reorder display hierarchy, set feature flags.
- **Experience Manager**: Update timeline items, company logos, roles, date ranges, and descriptions.
- **Inquiries Inbox**: View contact submissions stored in Supabase with read/unread statuses.
- **Global Settings**: Update bio text, availability status ("Open to Work", "Booking Q1 2027"), and social links.

---

## 3. Technology Stack & Infrastructure

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite | Core client framework & ultra-fast bundler |
| **Styling** | Tailwind CSS v4, Lucide React | Utility styling & modern minimalist icons |
| **Motion** | Motion (`framer-motion`), Lenis | Fluid micro-interactions, layout morphs, smooth scrolling |
| **3D / Graphics** | Three.js, `@react-three/fiber`, `@react-three/drei` | WebGL canvas, shaders, interactive 3D hero meshes |
| **Backend / DB** | Supabase (PostgreSQL, Auth, Storage) | Relational database, role-based auth, image hosting |
| **Email API** | Resend API / Serverless function | Contact form transactional email routing |
| **Containerization** | Docker, Docker Compose | Consistent local dev environment & multi-stage builds |
| **Hosting & DNS** | Vercel & NameSilo | Edge deployment, automatic SSL, preview environments |
| **CI / Code Quality** | GitHub Actions, ESLint, TypeScript | Automated checks on PR / push |

---

## 4. Prioritized Milestone Roadmap (Backend & Data First)

```
M1: Project Scaffolding, DevOps & Foundations
  ├── Docker containerization (dev & prod)
  └── GitHub Actions CI pipeline

M2: Backend Architecture, Supabase & Data Schemas (Priority Foundation)
  ├── Supabase migrations (projects, experiences, inquiries, site_meta)
  ├── Row Level Security (RLS) & Storage buckets
  └── Generated TypeScript types & typed client

M3: Design System, Tokens & Motion Core Primitives
  ├── Tailwind CSS v4 Crimson/Dark/White tokens
  ├── Reusable UI primitives (Buttons, Cards, Badges, Modals)
  ├── Lenis smooth scrolling integration
  └── Three.js / WebGL particle canvas background

M4: Authenticated Admin Portal & CMS (Real Data Creation)
  ├── Supabase Auth login & route protection
  ├── Project CRUD & media uploader
  ├── Experience Timeline editor
  └── Inquiries inbox

M5: Public Experience & Interactive Sections (Hydrated from DB)
  ├── Interactive Preloader & Entrance sequence
  ├── 3D Hero Section
  ├── Projects Bento Showcase (live data)
  ├── Career Timeline (live data)
  ├── About & Skills Matrix
  └── Contact Section with Resend email dispatch

M6: Performance Optimization, Vercel Deployment & NameSilo DNS
  ├── 60 FPS audit, bundle splitting & image optimization
  └── Vercel production deployment & NameSilo DNS configuration
```
