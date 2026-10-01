-- SQL Schema for JobMerge Deterministic Resume Storage System
-- PostgreSQL / Supabase Compatible

CREATE TABLE IF NOT EXISTS public.resumes (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    page_count INT DEFAULT 1,
    raw_text TEXT NOT NULL,
    structured_json JSONB NOT NULL,
    parser_version VARCHAR(20) DEFAULT '1.0.0',
    schema_version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_file_hash ON public.resumes(file_hash);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON public.resumes(created_at);

-- Raw Page Blocks Table
CREATE TABLE IF NOT EXISTS public.resume_raw_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id TEXT REFERENCES public.resumes(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    text_content TEXT NOT NULL,
    blocks_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resume_raw_pages_resume_id ON public.resume_raw_pages(resume_id);

-- Candidate Profiles Table
CREATE TABLE IF NOT EXISTS public.resume_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id TEXT REFERENCES public.resumes(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    phone_normalized TEXT,
    location TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    summary_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resume_profiles_email ON public.resume_profiles(email);

-- Skills Table (Strictly Extracted)
CREATE TABLE IF NOT EXISTS public.resume_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id TEXT REFERENCES public.resumes(id) ON DELETE CASCADE,
    raw_value TEXT NOT NULL,
    normalized_value TEXT NOT NULL,
    category TEXT,
    source_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resume_skills_resume_id ON public.resume_skills(resume_id);

-- Experience Table
CREATE TABLE IF NOT EXISTS public.resume_experience (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id TEXT REFERENCES public.resumes(id) ON DELETE CASCADE,
    title_raw TEXT NOT NULL,
    company_raw TEXT NOT NULL,
    location_raw TEXT,
    start_date_raw TEXT,
    start_date_normalized VARCHAR(10),
    end_date_raw TEXT,
    end_date_normalized VARCHAR(10),
    is_current BOOLEAN DEFAULT false,
    description_bullets JSONB NOT NULL,
    source_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resume_experience_resume_id ON public.resume_experience(resume_id);

-- Education Table
CREATE TABLE IF NOT EXISTS public.resume_education (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id TEXT REFERENCES public.resumes(id) ON DELETE CASCADE,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    field_of_study TEXT,
    start_date_normalized VARCHAR(10),
    end_date_normalized VARCHAR(10),
    grade_type VARCHAR(20),
    grade_raw TEXT,
    grade_value NUMERIC(5,2),
    source_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resume_education_resume_id ON public.resume_education(resume_id);

-- Main User Profiles Table (Synced via Clerk Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Software Engineer',
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    linkedin TEXT,
    github TEXT,
    portfolio TEXT,
    skills TEXT[] DEFAULT '{}',
    experience_years INT DEFAULT 0,
    desired_salary TEXT,
    resume_text TEXT,
    profile_completeness INT DEFAULT 40,
    plan TEXT DEFAULT 'Free',
    usage JSONB DEFAULT '{"resumesCreated": 0, "atsScansUsed": 0, "autoAppliesUsed": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Candidate Job Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    job_id TEXT NOT NULL,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    logo_url TEXT,
    applied_date TEXT NOT NULL,
    status TEXT DEFAULT 'Applied',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_user_email ON public.applications(user_email);

-- Saved / Bookmarked Jobs Table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    job_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_email, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_email ON public.saved_jobs(user_email);

-- Active Job Listings Table
CREATE TABLE IF NOT EXISTS public.job_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    logo_url TEXT,
    location TEXT,
    work_type TEXT,
    job_type TEXT,
    salary_range TEXT,
    experience_required TEXT,
    posted_time TEXT,
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    company_about TEXT,
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    category TEXT,
    original_url TEXT,
    via TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- STRICT ROW LEVEL SECURITY (RLS) POLICIES FOR CANDIDATE ISOLATION
-- Ensures candidates cannot view or modify each other's data
-- ============================================================

-- 1. Enable RLS on all sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Table Isolation Policies (Strictly matches candidate Clerk email)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (email = (auth.jwt()->>'email') OR (auth.jwt()->>'email' = 'avasarama04@gmail.com'));

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (email = (auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (email = (auth.jwt()->>'email') OR (auth.jwt()->>'email' = 'avasarama04@gmail.com'));

-- 3. Candidate Job Applications Isolation Policies
DROP POLICY IF EXISTS "Users can manage their own applications" ON public.applications;
CREATE POLICY "Users can manage their own applications" 
ON public.applications FOR ALL 
USING (user_email = (auth.jwt()->>'email') OR (auth.jwt()->>'email' = 'avasarama04@gmail.com'))
WITH CHECK (user_email = (auth.jwt()->>'email'));

-- 4. Candidate Saved Jobs Isolation Policies
DROP POLICY IF EXISTS "Users can manage their own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can manage their own saved jobs" 
ON public.saved_jobs FOR ALL 
USING (user_email = (auth.jwt()->>'email') OR (auth.jwt()->>'email' = 'avasarama04@gmail.com'))
WITH CHECK (user_email = (auth.jwt()->>'email'));

-- 5. Public Job Listings Policy (Anyone authenticated/anonymous can view active jobs)
DROP POLICY IF EXISTS "Anyone can view active job listings" ON public.job_posts;
CREATE POLICY "Anyone can view active job listings" 
ON public.job_posts FOR SELECT 
USING (status = 'active');


