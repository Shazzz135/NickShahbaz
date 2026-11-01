-- ====================================================================
-- Milestone 6 / Refinement: Remove Section Eyebrows from site_meta
-- Strips the 'eyebrow' key from JSONB site_meta configurations
-- ====================================================================

UPDATE public.site_meta
SET value = value - 'eyebrow'
WHERE value ? 'eyebrow';
