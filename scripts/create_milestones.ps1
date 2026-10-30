$ErrorActionPreference = "Stop"

$milestones = @(
    @{ Title = "M1: Project Scaffolding & DevOps Core"; Description = "Docker dev/prod containers, CI/CD pipeline, and package orchestration." },
    @{ Title = "M2: Backend Architecture & Supabase Schemas"; Description = "Supabase project connection, database migrations, RLS policies, Storage buckets, and typed client." },
    @{ Title = "M3: Design System, Tokens & Motion Core"; Description = "Dark/Crimson/White theme (Tailwind v4), Lenis smooth scrolling, base components, and Three.js canvas." },
    @{ Title = "M4: Authenticated Admin Portal & CMS"; Description = "Supabase Auth login, CRUD dashboard to create/edit real projects, experience timeline, and media uploads." },
    @{ Title = "M5: Public Experience & Interactive Sections"; Description = "Interactive Preloader, 3D Hero, Projects Bento Showcase, Timeline, About/Skills, and Contact with Resend." },
    @{ Title = "M6: Performance, Vercel & NameSilo Deployment"; Description = "60 FPS audits, Web Vitals, asset compression, Vercel production deployment, and NameSilo DNS setup." }
)

Write-Host "Creating Milestones..."
foreach ($m in $milestones) {
    Write-Host "Creating Milestone: $($m.Title)"
    gh api repos/Shazzz135/NickShahbaz/milestones -f title="$($m.Title)" -f description="$($m.Description)" --silent
}

Write-Host "Milestones created successfully!"
