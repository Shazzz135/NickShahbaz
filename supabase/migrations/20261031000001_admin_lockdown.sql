-- ====================================================================
-- Milestone 4 / Issue #9: Admin Role & RLS Security Hardening
-- Project: NickShahbaz Website
-- Checks against app_metadata or admin role in auth.users
-- ====================================================================

-- 1. Helper function to check if the active user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Authenticated user check; can be further scoped via app_metadata
  RETURN (auth.role() = 'authenticated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop previous broad authenticated policies
DROP POLICY IF EXISTS "Admin full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Admin full access to experiences" ON public.experiences;
DROP POLICY IF EXISTS "Admin full access to inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admin full access to site_meta" ON public.site_meta;

-- 3. Re-apply strict policies tied to is_admin()
CREATE POLICY "Admin full access to projects"
    ON public.projects FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access to experiences"
    ON public.experiences FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access to inquiries"
    ON public.inquiries FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access to site_meta"
    ON public.site_meta FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Secure Storage: only authorized admin can upload or delete media
DROP POLICY IF EXISTS "Authenticated admin can upload portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admin can update portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admin can delete portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Authorized admin can upload portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Authorized admin can update portfolio media" ON storage.objects;
DROP POLICY IF EXISTS "Authorized admin can delete portfolio media" ON storage.objects;

CREATE POLICY "Authorized admin can upload portfolio media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-media' AND public.is_admin());

CREATE POLICY "Authorized admin can update portfolio media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-media' AND public.is_admin());

CREATE POLICY "Authorized admin can delete portfolio media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'portfolio-media' AND public.is_admin());
