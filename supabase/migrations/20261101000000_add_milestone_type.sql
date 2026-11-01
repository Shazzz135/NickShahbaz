-- ====================================================================
-- Add milestone_type to experiences (experience, education, certification, event)
-- ====================================================================

ALTER TABLE public.experiences 
ADD COLUMN IF NOT EXISTS milestone_type text not null default 'experience' check (milestone_type in ('experience', 'education', 'certification', 'event'));

-- Update any legacy 'work' entries to 'experience' if any existed
UPDATE public.experiences 
SET milestone_type = 'experience' 
WHERE milestone_type = 'work';

-- Insert initial academic foundation entry
INSERT INTO public.experiences (
    role,
    company,
    company_url,
    location,
    period,
    is_current,
    highlights,
    tech_stack,
    sort_order,
    milestone_type
)
VALUES (
    'B.S. in Computer Science & Software Engineering',
    'University / Academic Foundation',
    null,
    'Toronto, Canada',
    '2018 — 2022',
    false,
    ARRAY[
        'Specialized in Software Architecture, Distributed Computing, and Algorithm Complexity',
        'Graduated with honors, focusing on high-performance systems and real-time computing'
    ],
    ARRAY['Computer Science', 'Algorithms', 'Data Structures', 'C++', 'Java', 'Distributed Systems'],
    10,
    'education'
)
ON CONFLICT (id) DO NOTHING;
