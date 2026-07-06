import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_JOBS } from './src/data.js'; // Wait, tsx can resolve .ts or .js

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase URL or Key not found in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log(`🌱 Seeding ${INITIAL_JOBS.length} jobs to Supabase...`);

  const formattedJobs = INITIAL_JOBS.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    logo_url: job.logoUrl,
    location: job.location,
    work_type: job.workType,
    job_type: job.jobType,
    salary_range: job.salaryRange,
    experience_required: job.experienceRequired,
    posted_time: job.postedTime,
    original_url: `https://example.com/jobs/${job.id}`,
    tags: job.skills,
    description: job.description,
    company_about: job.companyAbout,
    requirements: job.requirements,
    benefits: job.benefits,
    category: job.category,
    status: 'active'
  }));

  const { data, error } = await supabase
    .from('job_posts')
    .upsert(formattedJobs, { onConflict: 'id' });

  if (error) {
    console.error("❌ Error seeding jobs:", error);
  } else {
    console.log("🚀 Seeding completed successfully!");
  }
}

seed();
