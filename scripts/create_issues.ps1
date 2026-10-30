$ErrorActionPreference = "Stop"

$milestoneMap = @{
    1 = "M1: Project Scaffolding & DevOps Core"
    2 = "M2: Backend Architecture & Supabase Schemas"
    3 = "M3: Design System, Tokens & Motion Core"
    4 = "M4: Authenticated Admin Portal & CMS"
    5 = "M5: Public Experience & Interactive Sections"
    6 = "M6: Performance, Vercel & NameSilo Deployment"
}

$issues = @(
    @{
        title = "[DevOps] Dockerize Development & Multi-Stage Production Builds"
        mKey = 1
        body = @"
## Context & Goal
Establish a reproducible, clean containerized environment for local development and optimized production deployments using Docker Desktop and multi-stage builds.

## Relational Subtasks
- [ ] Subtask 1.1: Create `docker/Dockerfile.dev` with Node.js & pnpm.
- [ ] Subtask 1.2: Configure root `docker-compose.yml` with port binding and volume mounting for hot reload.
- [ ] Subtask 1.3: Create multi-stage `docker/Dockerfile.prod` with minimal Alpine image and security headers.
- [ ] Subtask 1.4: Verify Docker container runs cleanly via Docker Desktop.

## Acceptance Criteria
- Running `docker compose up` spins up the frontend with hot-reload functional.
- Production build container generates an optimized asset bundle.
"@
    },
    @{
        title = "[CI/CD] Set up GitHub Actions CI Workflow"
        mKey = 1
        body = @"
## Context & Goal
Set up automated GitHub Actions workflow to run linting, TypeScript compilation checks, and build tests on pull requests and pushes to `main`.

## Relational Subtasks
- [ ] Subtask 2.1: Create `.github/workflows/ci.yml`.
- [ ] Subtask 2.2: Add steps for pnpm setup, dependency caching, linting, type-checking, and build verification.
- [ ] Subtask 2.3: Test workflow execution on a branch/push.

## Acceptance Criteria
- Clean passing build check on CI.
"@
    },
    @{
        title = "[Database] Supabase Database Schema, RLS & Migrations"
        mKey = 2
        body = @"
## Context & Goal
Design and apply relational PostgreSQL database schemas with strict Row Level Security (RLS) policies and storage buckets for the portfolio and admin CMS.

## Relational Subtasks
- [ ] Subtask 3.1: Author SQL migration for `projects` table (categories: Full-Stack, Mobile, Tools/Web3, AI/Cloud).
- [ ] Subtask 3.2: Author SQL migration for `experiences` timeline table.
- [ ] Subtask 3.3: Author SQL migration for `inquiries` contact form table.
- [ ] Subtask 3.4: Configure RLS policies (public read-only for projects/experiences, anon insert for inquiries, authenticated admin full access).
- [ ] Subtask 3.5: Create `portfolio-media` Supabase Storage bucket for project thumbnails and video demos.

## Acceptance Criteria
- Schema applied and verified in Supabase.
- RLS verified: anon keys cannot modify projects or read inquiries.
"@
    },
    @{
        title = "[Data Layer] Client-Side Supabase Integration & Type Generation"
        mKey = 2
        body = @"
## Context & Goal
Integrate Supabase SDK into the frontend client with auto-generated TypeScript types, resilient error boundaries, and offline mock fallback data.

## Relational Subtasks
- [ ] Subtask 4.1: Install `@supabase/supabase-js`.
- [ ] Subtask 4.2: Generate strict TypeScript database definitions (`src/types/database.types.ts`).
- [ ] Subtask 4.3: Implement typed Supabase client in `src/lib/supabase.ts`.
- [ ] Subtask 4.4: Build custom data hooks (`useProjects`, `useExperiences`) with offline mock fallback data.

## Acceptance Criteria
- 100% type safety on all database queries and mutations.
- App continues functioning gracefully with mock data if Supabase credentials are not yet supplied.
"@
    },
    @{
        title = "[Design] Establish Dark Mode Design Tokens (Crimson Red & White Palette)"
        mKey = 3
        body = @"
## Context & Goal
Configure Tailwind CSS v4 design tokens reflecting the high-contrast dark theme, crimson red accents (`#E50914`, `#FF1E27`), crisp white typography, and dense layout textures.

## Relational Subtasks
- [ ] Subtask 5.1: Configure Tailwind v4 color variables (`bg-primary`, `surface`, `crimson-glow`, `crimson-deep`).
- [ ] Subtask 5.2: Set up typography hierarchy (Display Sans, Monospace accents) and Lucide icon suite.
- [ ] Subtask 5.3: Build reusable core components in `src/components/common/`: Button, Card, Badge, GlassContainer, and Magnetic hover wrapper.

## Acceptance Criteria
- Cohesive, high-end visual language with dark/crimson/white palette across all base components.
"@
    },
    @{
        title = "[Motion] Integrate Lenis Smooth Scrolling & Global Motion Wrapper"
        mKey = 3
        body = @"
## Context & Goal
Integrate butter-smooth inertia scrolling powered by Lenis, tightly coupled with Motion (Framer Motion) scroll hooks.

## Relational Subtasks
- [ ] Subtask 6.1: Install and configure `lenis` smooth scroll engine in `src/components/layout/SmoothScroll.tsx`.
- [ ] Subtask 6.2: Synchronize Lenis scroll momentum with Framer Motion triggers.
- [ ] Subtask 6.3: Style customized slim crimson scroll indicator.

## Acceptance Criteria
- Fluid, lag-free momentum scrolling across mouse wheel, trackpad, and keyboard navigation.
"@
    },
    @{
        title = "[WebGL] Create Interactive Three.js Background & Particles System"
        mKey = 3
        body = @"
## Context & Goal
Build an interactive WebGL canvas using Three.js / React Three Fiber that fills the background with dynamic crimson particles and ambient geometry responding to cursor movement and scroll position.

## Relational Subtasks
- [ ] Subtask 7.1: Install Three.js, `@react-three/fiber`, and `@react-three/drei`.
- [ ] Subtask 7.2: Build dynamic interactive particle field & ambient red geometry responding to cursor.
- [ ] Subtask 7.3: Implement performance scaling and low-power mobile fallbacks.

## Acceptance Criteria
- 60 FPS WebGL canvas rendering without blocking the DOM or interaction threads.
"@
    },
    @{
        title = "[Auth] Admin Authentication Flow & Route Protection"
        mKey = 4
        body = @"
## Context & Goal
Implement secure authentication for the admin CMS using Supabase Auth with protected route guards and session persistence.

## Relational Subtasks
- [ ] Subtask 8.1: Build `/admin/login` page with dark/crimson aesthetic and error feedback.
- [ ] Subtask 8.2: Create `AuthContext` to manage Supabase user sessions.
- [ ] Subtask 8.3: Implement `ProtectedRoute` component to redirect unauthorized visitors.

## Acceptance Criteria
- Unauthorized users cannot access any `/admin/*` routes.
- Persistent session management with clean sign-out.
"@
    },
    @{
        title = "[Admin CMS] CRUD Management Dashboard"
        mKey = 4
        body = @"
## Context & Goal
Construct the authenticated admin CMS portal to manage portfolio projects, career timeline items, and view incoming contact inquiries.

## Relational Subtasks
- [ ] Subtask 9.1: Build Admin Dashboard layout with sidebar navigation and metrics summary.
- [ ] Subtask 9.2: Implement Project CRUD interface with image upload to Supabase Storage.
- [ ] Subtask 9.3: Implement Experience Timeline editor.
- [ ] Subtask 9.4: Implement Inquiries Inbox viewer with read/unread status toggle.

## Acceptance Criteria
- Full CRUD operations functional and verified against Supabase tables.
"@
    },
    @{
        title = "[UI] Interactive Loading Screen & Scene Entrance Orchestration"
        mKey = 5
        body = @"
## Context & Goal
Build a fast, interactive preloader sequence that monitors asset readiness and orchestrates a cinematic entrance into the hero section.

## Relational Subtasks
- [ ] Subtask 10.1: Build preloader with branded monogram / audio-visual pulse and crimson progress indicator.
- [ ] Subtask 10.2: Implement exit transition unmasking the Hero section smoothly.

## Acceptance Criteria
- Loader displays immediately on load and smoothly unmasks the main page when ready.
"@
    },
    @{
        title = "[Section] Dynamic Hero Section with 3D Foreground Elements"
        mKey = 5
        body = @"
## Context & Goal
Create a high-impact Hero section featuring bold typography, live availability status, magnetic CTAs, and interactive 3D elements.

## Relational Subtasks
- [ ] Subtask 11.1: Build hero typography with crimson gradient highlights and animated entrance.
- [ ] Subtask 11.2: Add live availability badge ('Open for Projects') with glowing pulse.
- [ ] Subtask 11.3: Add interactive 3D foreground element / physics-enabled floating badges.
- [ ] Subtask 11.4: Add magnetic CTA buttons linking to Work and Contact.

## Acceptance Criteria
- Visually stunning hero with no dead space and immediate interactive feedback.
"@
    },
    @{
        title = "[Section] Application Development Project Gallery & Detail Modals"
        mKey = 5
        body = @"
## Context & Goal
Construct an interactive project showcase displaying application development work, hydrated dynamically from Supabase.

## Relational Subtasks
- [ ] Subtask 12.1: Build responsive bento grid layout with 3D card tilt and crimson glow borders.
- [ ] Subtask 12.2: Add category filter tabs (Full-Stack, Mobile, Tools/Web3, AI/Cloud).
- [ ] Subtask 12.3: Build comprehensive Project Detail modal with architecture overview, tech stack pills, and live demo/repo links.

## Acceptance Criteria
- Cards tilt smoothly on hover; filters update without layout jumps; modals open with smooth spring physics.
"@
    },
    @{
        title = "[Section] Experience & Career Interactive Timeline"
        mKey = 5
        body = @"
## Context & Goal
Build an interactive, scroll-linked career timeline illustrating professional journey, roles, deliverables, and tech stacks.

## Relational Subtasks
- [ ] Subtask 13.1: Construct vertical timeline with scroll-illuminated crimson line and glowing nodes.
- [ ] Subtask 13.2: Create expandable role cards showing key deliverables and metrics.
- [ ] Subtask 13.3: Hydrate timeline entries from Supabase `experiences` table.

## Acceptance Criteria
- Timeline illuminates as user scrolls; cards expand smoothly on click.
"@
    },
    @{
        title = "[Section] About Me, Skills Matrix & Philosophy"
        mKey = 5
        body = @"
## Context & Goal
Design a dense, rich personal section featuring engineering philosophy, biographical narrative, and categorized interactive skills matrix.

## Relational Subtasks
- [ ] Subtask 14.1: Construct personal narrative and engineering principles layout.
- [ ] Subtask 14.2: Build interactive skills radar / categorized skill pills with proficiency indicators.
- [ ] Subtask 14.3: Add quick stats counter (years of experience, shipped apps, coffee/commits).

## Acceptance Criteria
- Informative and visually dense section reflecting your identity as a high-end application developer.
"@
    },
    @{
        title = "[Section] Contact Section & Resend Integration"
        mKey = 5
        body = @"
## Context & Goal
Build an accessible, high-converting contact section with direct form submissions routed through Resend and saved to Supabase inquiries.

## Relational Subtasks
- [ ] Subtask 15.1: Build contact form (Name, Email, Project Type, Budget, Message) with client validation.
- [ ] Subtask 15.2: Integrate Resend transactional email dispatch for instant notification.
- [ ] Subtask 15.3: Persist submission to Supabase `inquiries` table.
- [ ] Subtask 15.4: Add one-click email copy pill, timezone clock, and social links.

## Acceptance Criteria
- Form sends email via Resend and writes to Supabase with toast feedback.
"@
    },
    @{
        title = "[Performance] Web Vitals, Bundle Splitting & 60 FPS Audit"
        mKey = 6
        body = @"
## Context & Goal
Audit and optimize client bundle size, rendering performance, and animation smoothness to achieve high Lighthouse scores and consistent 60 FPS.

## Relational Subtasks
- [ ] Subtask 16.1: Code-split Three.js canvas and admin routes using dynamic `React.lazy`.
- [ ] Subtask 16.2: Optimize textures, shaders, and image assets.
- [ ] Subtask 16.3: Audit frame rates and fix any re-render bottlenecks.

## Acceptance Criteria
- 60 FPS animation performance; fast initial load under 1.5s.
"@
    },
    @{
        title = "[Deployment] Vercel Production Deployment & NameSilo DNS"
        mKey = 6
        body = @"
## Context & Goal
Deploy the application to Vercel production edge network and configure custom domain DNS records via NameSilo.

## Relational Subtasks
- [ ] Subtask 17.1: Link repository to Vercel and configure production environment variables.
- [ ] Subtask 17.2: Configure NameSilo DNS A record (`76.76.21.21`) and CNAME record (`cname.vercel-dns.com`).
- [ ] Subtask 17.3: Validate SSL certificate provisioning and verify live production domain.

## Acceptance Criteria
- Portfolio is live on custom domain with valid HTTPS and sub-second edge response times.
"@
    }
)

Write-Host "Creating Issues on GitHub..."
foreach ($issue in $issues) {
    $mTitle = $milestoneMap[$issue.mKey]
    Write-Host "Creating: $($issue.title) -> Milestone: $mTitle"
    gh issue create --repo "Shazzz135/NickShahbaz" --title "$($issue.title)" --milestone "$mTitle" --body "$($issue.body)"
}

Write-Host "All 17 issues successfully created!"
