-- Drop check constraint on projects.category to allow free-form custom text categories
-- from the admin ProjectsManager text box.

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_category_check;
