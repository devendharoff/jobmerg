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
