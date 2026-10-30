# Project Master Specification & Requirements

> **Project Name:** Nick Shahbaz Portfolio & Digital Agency Platform  
> **Repository:** `NickShahbaz` (Private)  
> **Status:** M0: Architecture, Specs & Work Breakdown  
> **Last Updated:** 2026-10-30  

---

## 1. Executive Summary & Vision

A high-end, futuristic, dark-mode personal & agency portfolio showcasing **Application Development**, engineering capabilities, and creative technical execution.

### Key Pillars:
1. **Visual Identity**: High-contrast Dark Mode with a striking **Crimson Red (`#E50914` / `#FF1E27` / `#D90429`), Pure White (`#FFFFFF`), and Deep Obsidian/Charcoal (`#0A0A0B` / `#121214`)** palette. Dynamic, rich layout with deliberate visual density (no passive "dead empty space") using ambient meshes, subtle grid lines, particles, and interactive canvas backgrounds.
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

## 4. File & Directory Structure

```plaintext
NickShahbaz/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Lint, build check, TypeScript validation
│   │   └── deploy-preview.yml     # Vercel preview checks
│   └── ISSUE_TEMPLATE/            # Structured issue & subtask templates
├── docs/
│   ├── ARCHITECTURE.md            # Technical flow & component diagram
│   ├── DATABASE_SCHEMA.md         # Supabase tables, RLS policies, migrations
│   ├── DESIGN_SYSTEM.md           # Red/White/Dark color tokens, typography, motion curves
│   └── DEPLOYMENT.md              # Vercel & NameSilo DNS instructions
├── docker/
│   ├── Dockerfile.dev             # Local containerized Vite development
│   ├── Dockerfile.prod            # Multi-stage production build container
│   └── nginx.conf                 # Production reverse proxy config if needed
├── docker-compose.yml             # Orchestrates dev frontend and local tooling
├── frontend/                      # Client Application
│   ├── public/                    # Static assets, fonts, icons, 3D GLTF models
│   ├── src/
│   │   ├── assets/                # Local SVGs, textures, audio/shaders
│   │   ├── components/
│   │   │   ├── 3d/                # Three.js canvas, scene components, shaders
│   │   │   ├── admin/             # CMS forms, tables, stat cards, auth guards
│   │   │   ├── common/            # Buttons, Badges, Modals, Magnetic wrappers
│   │   │   ├── layout/            # Navbar, Footer, SmoothScroll provider
│   │   │   └── sections/          # Hero, Projects, Timeline, About, Contact
│   │   ├── context/               # AuthContext, UIContext, SmoothScrollContext
│   │   ├── hooks/                 # useLenis, useMousePosition, useSupabaseData
│   │   ├── lib/                   # Supabase client, Resend fetcher, utils
│   │   ├── pages/                 # Home, ProjectDetail, AdminLogin, AdminDashboard
│   │   ├── styles/                # Tailwind v4 theme, global custom animations
│   │   ├── types/                 # Database models, form contracts, motion props
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── supabase/
│   ├── migrations/                # SQL schema migrations (projects, experience, inquiries)
│   └── seed.sql                   # Seed data for initial portfolio state
├── .env.example                   # Environment variable template
├── .gitignore
├── PROJECT_SPEC.md                # Living Master Specification document
└── README.md                      # Developer onboarding & quick start
```

---

## 5. Milestones & Work Breakdown Structure

Below are the 6 project milestones, each with explicit issues and relational subtasks.

### **Milestone 1: Project Scaffolding, DevOps & Foundations**
*Target: Establish a clean repository structure, Docker environment, base styling, and design system tokens.*
- **Issue #1**: [DevOps] Dockerize Development & Multi-Stage Production Builds
  - *Subtask 1.1*: Create `docker/Dockerfile.dev` and `docker-compose.yml`.
  - *Subtask 1.2*: Verify volume mounting and hot reload inside Docker container.
  - *Subtask 1.3*: Add `docker/Dockerfile.prod` for optimized standalone deployment.
- **Issue #2**: [Design] Establish Dark Mode Design Tokens (Red & White Palette)
  - *Subtask 2.1*: Configure Tailwind CSS v4 variables for crimson accents, deep dark tones, and contrast whites.
  - *Subtask 2.2*: Set up typography hierarchy (display sans, monospace accents) and base UI variables.
  - *Subtask 2.3*: Create reusable UI primitive components (Buttons, Cards, Badges, Magnetic hover wrapper).
- **Issue #3**: [CI/CD] Set up GitHub Actions CI Workflow
  - *Subtask 3.1*: Add `.github/workflows/ci.yml` for automated linting, type-checking, and build verification.

---

### **Milestone 2: Smooth Scrolling, 3D Canvas & Motion Core**
*Target: Implement the visual and motion backbone before static content.*
- **Issue #4**: [Motion] Integrate Lenis Smooth Scrolling & Global Motion Wrapper
  - *Subtask 4.1*: Configure `lenis` smooth scroll with React lifecycle and scrollbar styling.
  - *Subtask 4.2*: Connect Framer Motion scroll hooks with Lenis for synchronized scroll triggers.
- **Issue #5**: [WebGL] Create Interactive Three.js Background & Particles System
  - *Subtask 5.1*: Set up `@react-three/fiber` and `@react-three/drei` canvas container.
  - *Subtask 5.2*: Build dynamic interactive particle field / abstract crimson geometry reacting to mouse movement.
  - *Subtask 5.3*: Implement fallback rendering and performance scaling for mobile and low-power devices.
- **Issue #6**: [UI] Interactive Loading Screen & Scene Entrance Orchestration
  - *Subtask 6.1*: Build preloader with asset readiness detection and crimson progress animation.
  - *Subtask 6.2*: Orchestrate cinematic entrance transition into the Hero section.

---

### **Milestone 3: Public Sections & Interactive Features**
*Target: Build all user-facing portfolio sections with dense, dynamic, interactive layouts.*
- **Issue #7**: [Section] Dynamic Hero Section with 3D Foreground Elements
  - *Subtask 7.1*: Build responsive headline, status indicator, and interactive callout pills.
  - *Subtask 7.2*: Add 3D interactive foreground element / physics-enabled floating badges.
- **Issue #8**: [Section] Application Development Project Gallery & Detail Modals
  - *Subtask 8.1*: Implement grid/bento showcase with 3D card tilt and glowing crimson borders.
  - *Subtask 8.2*: Build rich project detail modal (video preview, architecture overview, tech stack tags, links).
  - *Subtask 8.3*: Add category filtering (Mobile, Full-Stack, Web3/Tools, AI).
- **Issue #9**: [Section] Experience & Career Interactive Timeline
  - *Subtask 9.1*: Construct scroll-linked vertical timeline with illuminated nodes.
  - *Subtask 9.2*: Add role cards with expandable deliverables, metrics, and technology chips.
- **Issue #10**: [Section] About Me, Skills Matrix & Philosophy
  - *Subtask 10.1*: Design dense, modern bio section with personal narrative and engineering philosophy.
  - *Subtask 10.2*: Build interactive skills radar / grouped technology proficiency pills.
- **Issue #11**: [Section] Contact Section & Resend Integration
  - *Subtask 11.1*: Build accessible contact form with client-side validation.
  - *Subtask 11.2*: Integrate Resend email dispatch endpoint with automated receipt notification.
  - *Subtask 11.3*: Add direct email copy pill, timezone clock, and social channels.

---

### **Milestone 4: Supabase Backend & Database Integration**
*Target: Implement the cloud database, migrations, and live data hydration for projects and timeline.*
- **Issue #12**: [Database] Supabase Database Schema, RLS & Migrations
  - *Subtask 12.1*: Author SQL migrations for `projects`, `experiences`, `inquiries`, and `site_meta` tables.
  - *Subtask 12.2*: Configure Row Level Security (RLS) policies (public read, authenticated admin write).
  - *Subtask 12.3*: Set up Supabase Storage bucket for project images and assets.
- **Issue #13**: [Data Layer] Client-Side Supabase Integration & Data Fetching
  - *Subtask 13.1*: Configure typed Supabase client in `src/lib/supabase.ts`.
  - *Subtask 13.2*: Create hooks with caching and optimistic UI updates for public sections.

---

### **Milestone 5: Authenticated Admin Portal & CMS**
*Target: Enable direct content updates via a protected dashboard.*
- **Issue #14**: [Auth] Admin Authentication Flow & Route Protection
  - *Subtask 14.1*: Build `/admin/login` page with Supabase Auth session handling.
  - *Subtask 14.2*: Implement protected route guards preventing unauthorized navigation.
- **Issue #15**: [Admin CMS] CRUD Management Dashboard
  - *Subtask 15.1*: Project management table with image upload and live reordering.
  - *Subtask 15.2*: Experience timeline editor.
  - *Subtask 15.3*: Contact inquiries inbox table with status tagging.

---

### **Milestone 6: Performance Optimization, Vercel Deployment & NameSilo DNS**
*Target: Final polish, 60 FPS animation audits, production deployment, and domain mapping.*
- **Issue #16**: [Performance] Web Vitals, Bundle Splitting & 60 FPS Audit
  - *Subtask 16.1*: Lazy-load 3D canvas and dynamic imports for admin routes.
  - *Subtask 16.2*: Optimize textures, models, and image assets (WebP/AVIF).
- **Issue #17**: [Deployment] Vercel Production Deployment & NameSilo DNS
  - *Subtask 17.1*: Link repo to Vercel and configure production environment variables.
  - *Subtask 17.2*: Set up NameSilo DNS records (A & CNAME records for root & `www`).
  - *Subtask 17.3*: Verify SSL certification, redirects, and production test run.
