-- ====================================================================
-- Milestone: Admin RLS Hardening & Inquiry Spam Defense
-- Project: NickShahbaz Website
-- Prevents privilege escalation and payload bloat
-- ====================================================================

-- 1. Strictly harden public.is_admin() to check verified email or app_metadata role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  jwt_email text;
  jwt_role text;
BEGIN
  -- Immediately reject unauthenticated or anonymous roles
  IF auth.role() IS DISTINCT FROM 'authenticated' THEN
    RETURN FALSE;
  END IF;

  jwt_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  jwt_role := coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');

  -- Allow only the designated administrator email or explicit admin role
  RETURN (
    jwt_email = 'nickshahbaz135@gmail.com' OR
    jwt_role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add defensive length constraints on inquiries table to prevent DB payload bloat
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_name_len_chk'
  ) THEN
    ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_name_len_chk CHECK (length(name) <= 200);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_email_len_chk'
  ) THEN
    ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_email_len_chk CHECK (length(email) <= 320);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_message_len_chk'
  ) THEN
    ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_message_len_chk CHECK (length(message) <= 10000);
  END IF;
END $$;
