# Supabase Database Schema & Security (RLS)

## 1. Overview
The database layer powers dynamic project highlights, work experience timeline entries, visitor inquiries, and site configuration. All tables enforce PostgreSQL Row Level Security (RLS).

## 2. Table Definitions

### 2.1 `projects`
Stores application development projects.
```sql
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Full-Stack', 'Mobile', 'Tools/Web3', 'AI/Cloud')),
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    thumbnail_url TEXT,
    preview_video_url TEXT,
    live_url TEXT,
    github_url TEXT,
    architecture_overview TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 `experiences`
Stores career & timeline entries.
```sql
CREATE TABLE public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    company_url TEXT,
    location TEXT,
    period TEXT NOT NULL,
    is_current BOOLEAN DEFAULT false,
    highlights TEXT[] DEFAULT '{}',
    tech_stack TEXT[] DEFAULT '{}',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 `inquiries`
Stores contact form submissions securely.
```sql
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    project_type TEXT,
    budget_range TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Row Level Security (RLS) Policies

### Public Visitors (Anon Key)
- `projects`: `SELECT` allowed for all users.
- `experiences`: `SELECT` allowed for all users.
- `inquiries`: `INSERT` allowed for anyone (with email validation); `SELECT`, `UPDATE`, `DELETE` denied.

### Authenticated Admin
- Full access (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) on all tables.
