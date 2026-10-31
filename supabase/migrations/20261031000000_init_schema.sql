-- ====================================================================
-- Milestone 2 / Issue #4: Database Schema, RLS & Storage Configuration
-- Project: NickShahbaz Website
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Full-Stack', 'Mobile', 'Tools/Web3', 'AI/Cloud')),
    tags TEXT[] NOT NULL DEFAULT '{}',
    featured BOOLEAN NOT NULL DEFAULT false,
    thumbnail_url TEXT,
    preview_video_url TEXT,
    live_url TEXT,
    github_url TEXT,
    architecture_overview TEXT,
    metrics JSONB DEFAULT '{}'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Experiences Table (Career / Timeline)
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    company_url TEXT,
    location TEXT,
    period TEXT NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT false,
    highlights TEXT[] NOT NULL DEFAULT '{}',
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Inquiries Table (Contact Form Submissions)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    project_type TEXT,
    budget_range TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Site Meta Table (Dynamic bio, availability, stats)
CREATE TABLE IF NOT EXISTS public.site_meta (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 6. Row Level Security (RLS) Configuration
-- ====================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_meta ENABLE ROW LEVEL SECURITY;

-- 6.1 Public Read Access
CREATE POLICY "Public can view projects"
    ON public.projects FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Public can view experiences"
    ON public.experiences FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Public can view site_meta"
    ON public.site_meta FOR SELECT
    TO anon, authenticated
    USING (true);

-- 6.2 Public Insert for Inquiries (Contact Form)
CREATE POLICY "Public can submit inquiries"
    ON public.inquiries FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 6.3 Admin Full Control (Authenticated users)
CREATE POLICY "Admin full access to projects"
    ON public.projects FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin full access to experiences"
    ON public.experiences FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin full access to inquiries"
    ON public.inquiries FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admin full access to site_meta"
    ON public.site_meta FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ====================================================================
-- 7. Supabase Storage: portfolio-media Bucket
-- ====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public can view portfolio media"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'portfolio-media');

CREATE POLICY "Authenticated admin can upload portfolio media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-media');

CREATE POLICY "Authenticated admin can update portfolio media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-media');

CREATE POLICY "Authenticated admin can delete portfolio media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'portfolio-media');

-- ====================================================================
-- 8. Seed Initial Site Metadata
-- ====================================================================

INSERT INTO public.site_meta (key, value)
VALUES 
    ('availability', '{"status": "available", "badge_text": "Open for Application Development & Projects", "updated_at": "2026-10-30"}'::jsonb),
    ('bio', '{"name": "Nick Shahbaz", "headline": "Application Developer & Software Engineer", "subheadline": "Architecting modern, interactive, high-performance web and mobile platforms with robust cloud backends."}'::jsonb),
    ('stats', '{"projects_completed": "15+", "years_experience": "4+", "satisfaction": "100%"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
