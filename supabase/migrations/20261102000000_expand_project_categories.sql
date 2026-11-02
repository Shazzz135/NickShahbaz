-- Allow the project categories offered in the admin ProjectsManager.
-- The admin form added three categories that the original CHECK constraint rejected,
-- causing: new row for relation "projects" violates check constraint "projects_category_check".

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_category_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_category_check
  CHECK (category IN (
    'Full-Stack',
    'Mobile',
    'AI/Cloud',
    'Tools/Web3',
    'DevOps & Systems',
    '3D Graphics & Games',
    'API & Microservices'
  ));
