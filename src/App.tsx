import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Sparkles, Search, MapPin, SlidersHorizontal, BookOpen, Bookmark, 
  Briefcase, Award, ArrowRight, Check, CheckCircle2, DollarSign, 
  Compass, BarChart3, FileText, User, LogOut, ChevronRight, HelpCircle, 
  X, AlertCircle, BookmarkCheck, Heart, UserCheck, ShieldCheck, Clock,
  ChevronDown, ExternalLink, PanelLeftClose, PanelLeftOpen, Sidebar,
  Bell, Mic, TrendingUp, Zap, Target, LayoutDashboard, ChevronLeft,
  MoreHorizontal, MessageSquare, Video, Filter, Grid, List
} from 'lucide-react';
import { 
  ActiveScreen, Job, UserProfile, JobApplication, SalaryInsight 
} from './types';
import { INITIAL_JOBS, INITIAL_SALARY_INSIGHTS, DEFAULT_USER } from './data';
import LandingPage from './components/LandingPage';
import { supabase, getSupabaseClient } from './supabaseClient';
import { useUser, useAuth, SignIn as ClerkSignIn, SignUp as ClerkSignUp } from '@clerk/clerk-react';

// High-concurrency bundle optimization: Lazy load heavy secondary tab components
const SalaryInsights = lazy(() => import('./components/SalaryInsights'));
const ApplicationTracker = lazy(() => import('./components/ApplicationTracker'));
const AIResumeReview = lazy(() => import('./components/AIResumeReview'));
const ResumeBuilder = lazy(() => import('./components/ResumeBuilder'));
const AutoApplyBot = lazy(() => import('./components/AutoApplyBot'));

function CircularProgress({ percentage, size = 48, strokeWidth = 4 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} className="stroke-gray-150" strokeWidth={strokeWidth} fill="transparent" />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          className="stroke-emerald-500 transition-all duration-700 ease-out" 
          strokeWidth={strokeWidth} 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          fill="transparent" 
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-black text-gray-900 leading-none font-display">{percentage}%</span>
        <span className="text-[7px] font-extrabold text-gray-400 uppercase tracking-tight mt-0.5">Match</span>
      </div>
    </div>
  );
}

function MiniSparkline({ color = "#10b981", data = [10, 15, 8, 22, 18, 30] }: { color?: string; data?: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 56;
    const y = 20 - ((val - min) / (max - min || 1)) * 14;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="56" height="22" className="overflow-visible shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function ProfileGaugeRing({ score = 91 }: { score?: number }) {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <div className="relative" style={{ width: size, height: size / 2 + 12 }}>
        <svg className="overflow-visible" width={size} height={size}>
          <path d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`} className="stroke-indigo-100" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
          <path d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`} className="stroke-[#4f46e5] transition-all duration-1000" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} fill="none" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
          <span className="text-2xl font-black text-gray-900 tracking-tight font-display">{score}%</span>
          <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Resume Score</span>
        </div>
      </div>
      <span className="mt-2.5 px-3 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">
        Excellent
      </span>
    </div>
  );
}

export function getPlatformInfo(job: Job) {
  const url = (job.applyUrl || '').toLowerCase();
  const via = (job.viaSource || job.companyAbout || '').toLowerCase();

  if (via.includes('linkedin') || url.includes('linkedin')) {
    return { name: 'LinkedIn', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200', btnText: 'Apply on LinkedIn' };
  }
  if (via.includes('glassdoor') || url.includes('glassdoor')) {
    return { name: 'Glassdoor', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200', btnText: 'Apply on Glassdoor' };
  }
  if (via.includes('unstop') || url.includes('unstop')) {
    return { name: 'Unstop', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200', btnText: 'Apply on Unstop' };
  }
  if (via.includes('naukri') || url.includes('naukri')) {
    return { name: 'Naukri.com', badgeBg: 'bg-sky-50 text-sky-700 border-sky-200', btnText: 'Apply on Naukri.com' };
  }
  if (via.includes('indeed') || url.includes('indeed')) {
    return { name: 'Indeed', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200', btnText: 'Apply on Indeed' };
  }
  if (via.includes('google') || url.includes('google')) {
    return { name: 'Google Jobs', badgeBg: 'bg-red-50 text-red-700 border-red-200', btnText: 'Apply via Google Jobs' };
  }
  if (url.includes('lever.co') || url.includes('greenhouse.io') || url.includes('workable.com')) {
    return { name: 'Company Careers', badgeBg: 'bg-teal-50 text-teal-700 border-teal-200', btnText: 'Apply on Company Careers' };
  }

  const match = via.match(/via\s+([a-zA-Z0-9\.\s]+)/i);
  if (match && match[1]) {
    const cleanName = match[1].trim();
    return { name: cleanName, badgeBg: 'bg-amber-50 text-amber-800 border-amber-200', btnText: `Apply on ${cleanName}` };
  }

  return { name: 'Company Portal', badgeBg: 'bg-gray-100 text-gray-800 border-gray-200', btnText: 'Apply on Company Portal' };
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('Dashboard');
  const [activeDashboardTab, setActiveDashboardTab] = useState<'FindJobs' | 'Salaries' | 'AIReview' | 'Applications' | 'Saved' | 'Resume' | 'AutoApply'>('FindJobs');
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('Recommended');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // User Authentication States
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken, signOut } = useAuth();
  const [supabaseClient, setSupabaseClient] = useState(supabase);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);  // Global Jobs list with dynamic ratings
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job>(INITIAL_JOBS[0]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Global Applications state
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Toast notices state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [debouncedLocationQuery, setDebouncedLocationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // LinkedIn Filter States
  const [selectedDatePosted, setSelectedDatePosted] = useState<string>('all');
  const [selectedWorkplaceTypes, setSelectedWorkplaceTypes] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [easyApplyOnly, setEasyApplyOnly] = useState<boolean>(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  
  const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(false);
  const [isAllFiltersOpen, setIsAllFiltersOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedJobDetailModal, setSelectedJobDetailModal] = useState<Job | null>(null);

  // Debounce search query and location query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLocationQuery(locationQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [locationQuery]);

  // Sync Supabase client with Clerk JWT token
  useEffect(() => {
    async function updateClient() {
      if (isSignedIn) {
        try {
          const token = await getToken({ template: 'supabase' });
          setSupabaseClient(getSupabaseClient(token));
        } catch (e) {
          console.error("Error fetching Supabase token from Clerk:", e);
          setSupabaseClient(supabase);
        }
      } else {
        setSupabaseClient(supabase);
      }
    }
    updateClient();
  }, [isSignedIn, getToken]);

  // Sync Profile and user data when user signs in via Clerk
  useEffect(() => {
    if (!isLoaded) return;
    
    if (isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress || '';
      const name = user.fullName || user.firstName || 'User';
      
      const syncProfile = async () => {
        try {
          // Try to fetch profile
          const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();
            
          if (profile) {
            setUserProfile({
              name: profile.name,
              email: profile.email,
              role: profile.role || '',
              avatarUrl: profile.avatar_url || user.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ',
              skills: profile.skills || [],
              experienceYears: profile.experience_years || 0,
              desiredSalary: profile.desired_salary || '',
              resumeText: profile.resume_text || '',
              profileCompleteness: profile.profile_completeness || 0
            });
          } else {
            // Create new profile if it doesn't exist
            const newProfile = {
              email,
              name,
              role: 'Software Engineer',
              avatar_url: user.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ',
              skills: ['React', 'JavaScript', 'HTML/CSS'],
              experience_years: 1,
              desired_salary: '₹10L PA',
              resume_text: `${name}\nSoftware Engineer | ${email}\n\nSkills: React, JavaScript`,
              profile_completeness: 40
            };
            
            await supabaseClient.from('profiles').upsert({
              email: newProfile.email,
              name: newProfile.name,
              role: newProfile.role,
              avatar_url: newProfile.avatar_url,
              skills: newProfile.skills,
              experience_years: newProfile.experience_years,
              desired_salary: newProfile.desired_salary,
              resume_text: newProfile.resume_text,
              profile_completeness: newProfile.profile_completeness
            });
            
            setUserProfile({
              name: newProfile.name,
              email: newProfile.email,
              role: newProfile.role,
              avatarUrl: newProfile.avatar_url,
              skills: newProfile.skills,
              experienceYears: newProfile.experience_years,
              desiredSalary: newProfile.desired_salary,
              resumeText: newProfile.resume_text,
              profileCompleteness: newProfile.profile_completeness
            });
          }
          
          // Fetch saved jobs
          const { data: saved } = await supabaseClient
            .from('saved_jobs')
            .select('job_id')
            .eq('user_email', email);
            
          if (saved) {
            setSavedJobIds(saved.map(s => s.job_id));
          }
          
          // Fetch applications
          const { data: apps } = await supabaseClient
            .from('applications')
            .select('*')
            .eq('user_email', email);
            
          if (apps) {
            setApplications(apps.map(a => ({
              id: a.id,
              jobId: a.job_id,
              jobTitle: a.job_title,
              company: a.company,
              logoUrl: a.logo_url || '',
              appliedDate: a.applied_date,
              status: a.status as any,
              notes: a.notes || ''
            })));
          }
        } catch (err) {
          console.error("Error syncing profile on Clerk sign-in:", err);
        }
      };
      
      syncProfile();
      setIsLoggedIn(true);
      setActiveScreen('Dashboard');
      setActiveDashboardTab('FindJobs');
    } else {
      setIsLoggedIn(false);
      setUserProfile(DEFAULT_USER);
      setSavedJobIds([]);
      setApplications([]);
    }
  }, [isSignedIn, user, isLoaded, supabaseClient]);

  // Fetch jobs from Supabase on mount (with high-concurrency client caching)
  useEffect(() => {
    async function fetchJobs() {
      try {
        // High Concurrency Optimization: Check 60-second in-memory cache to protect database connection pool
        const cachedStr = sessionStorage.getItem('jobmerge_cached_jobs_v2');
        const cachedTime = sessionStorage.getItem('jobmerge_cached_jobs_time_v2');
        const now = Date.now();

        if (cachedStr && cachedTime && (now - parseInt(cachedTime, 10) < 60000)) {
          try {
            const cachedJobs: Job[] = JSON.parse(cachedStr);
            if (cachedJobs && cachedJobs.length > 0) {
              setJobs(cachedJobs);
              setSelectedJob(cachedJobs[0]);
              return;
            }
          } catch (e) {}
        }

        const { data, error } = await supabaseClient
          .from('job_posts')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedJobs: Job[] = data.map(dbJob => ({
            id: dbJob.id,
            title: dbJob.title,
            company: dbJob.company,
            logoUrl: dbJob.logo_url || 'https://www.google.com/s2/favicons?sz=128&domain=' + dbJob.company.toLowerCase().replace(/\s+/g, '') + '.com',
            location: dbJob.location || 'Remote',
            workType: dbJob.work_type || 'Remote',
            jobType: dbJob.job_type || 'Full-time',
            salaryRange: dbJob.salary_range || '₹10L – ₹18L PA',
            experienceRequired: dbJob.experience_required || '0 – 2 Yrs',
            postedTime: dbJob.posted_time || 'Recently',
            skills: dbJob.tags || [],
            description: dbJob.description || '',
            companyAbout: dbJob.company_about || `${dbJob.company} is a leading innovator in technology services.`,
            requirements: dbJob.requirements || [],
            benefits: dbJob.benefits || [],
            category: dbJob.category || 'Experienced',
            applyUrl: dbJob.original_url || '',
            viaSource: dbJob.via || (dbJob.company_about?.includes('via ') ? dbJob.company_about.match(/via [^.)]+/)?.[0] : undefined)
          }));

          setJobs(mappedJobs);
          setSelectedJob(mappedJobs[0]);

          try {
            sessionStorage.setItem('jobmerge_cached_jobs_v2', JSON.stringify(mappedJobs));
            sessionStorage.setItem('jobmerge_cached_jobs_time_v2', now.toString());
          } catch (e) {}
        }
      } catch (err) {
        console.error("Error fetching jobs from Supabase:", err);
      }
    }
    fetchJobs();
  }, [supabaseClient]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLoginSuccess = async (email: string, name: string) => {
    setIsLoggedIn(true);
    
    // Fetch or create profile in Supabase
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
        
      if (profile) {
        setUserProfile({
          name: profile.name,
          email: profile.email,
          role: profile.role || '',
          avatarUrl: profile.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ',
          skills: profile.skills || [],
          experienceYears: profile.experience_years || 0,
          desiredSalary: profile.desired_salary || '',
          resumeText: profile.resume_text || '',
          profileCompleteness: profile.profile_completeness || 0
        });
      } else {
        const newProfile = {
          email,
          name,
          role: 'Software Engineer',
          avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ',
          skills: ['React', 'JavaScript', 'HTML/CSS'],
          experience_years: 1,
          desired_salary: '₹10L PA',
          resume_text: `${name}\nSoftware Engineer | ${email}\n\nSkills: React, JavaScript`,
          profile_completeness: 40
        };
        await supabase.from('profiles').upsert({
          email: newProfile.email,
          name: newProfile.name,
          role: newProfile.role,
          avatar_url: newProfile.avatar_url,
          skills: newProfile.skills,
          experience_years: newProfile.experience_years,
          desired_salary: newProfile.desired_salary,
          resume_text: newProfile.resume_text,
          profile_completeness: newProfile.profile_completeness
        });
        setUserProfile({
          name: newProfile.name,
          email: newProfile.email,
          role: newProfile.role,
          avatarUrl: newProfile.avatar_url,
          skills: newProfile.skills,
          experienceYears: newProfile.experience_years,
          desiredSalary: newProfile.desired_salary,
          resumeText: newProfile.resume_text,
          profileCompleteness: newProfile.profile_completeness
        });
      }
      
      // Fetch saved jobs
      const { data: saved } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_email', email);
        
      if (saved) {
        setSavedJobIds(saved.map(s => s.job_id));
      }
      
      // Fetch applications
      const { data: apps } = await supabase
        .from('applications')
        .select('*')
        .eq('user_email', email);
        
      if (apps) {
        setApplications(apps.map(a => ({
          id: a.id,
          jobId: a.job_id,
          jobTitle: a.job_title,
          company: a.company,
          logoUrl: a.logo_url || '',
          appliedDate: a.applied_date,
          status: a.status as any,
          notes: a.notes || ''
        })));
      }
      
    } catch (err) {
      console.error("Error syncing profile on login:", err);
    }

    setActiveScreen('Dashboard');
    setActiveDashboardTab('FindJobs');
    showToast(`Successfully logged in as ${name}!`);
  };

  const handleSignUpSuccess = async (email: string, name: string, role: string, skills: string[]) => {
    setIsLoggedIn(true);
    const newProfile = {
      name,
      email,
      role,
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ',
      skills,
      experienceYears: 2,
      desiredSalary: '₹14L PA',
      profileCompleteness: 55,
      resumeText: `${name}\n${role} | ${email}\n\nCore Skills: ${skills.join(', ')}`
    };

    // Save to database
    try {
      await supabase.from('profiles').upsert({
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role,
        avatar_url: newProfile.avatarUrl,
        skills: newProfile.skills,
        experience_years: newProfile.experienceYears,
        desired_salary: newProfile.desiredSalary,
        resume_text: newProfile.resumeText,
        profile_completeness: newProfile.profileCompleteness
      });
    } catch (err) {
      console.error("Error creating profile in Supabase:", err);
    }

    setUserProfile(newProfile);
    setSavedJobIds([]);
    setApplications([]);
    
    setActiveScreen('Dashboard');
    setActiveDashboardTab('FindJobs');
    showToast(`Welcome to JobMerge, ${name}!`);
  };

  const handleLogout = () => {
    signOut();
    setActiveScreen('Landing');
    showToast("Successfully logged out.");
  };

  const handleLandingSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setLocationQuery(location);
    setActiveScreen('Dashboard');
    setActiveDashboardTab('FindJobs');
  };

  const handleToggleBookmark = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isSignedIn) {
      setActiveScreen('SignIn');
      showToast("Please sign in to save jobs.");
      return;
    }
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter(id => id !== jobId));
      showToast("Removed from saved jobs.");
      try {
        await supabaseClient.from('saved_jobs').delete().eq('user_email', userProfile.email).eq('job_id', jobId);
      } catch (err) {
        console.error("Error removing bookmark in Supabase:", err);
      }
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
      showToast("Added to saved jobs!");
      try {
        await supabaseClient.from('saved_jobs').insert({ user_email: userProfile.email, job_id: jobId });
      } catch (err) {
        console.error("Error saving bookmark in Supabase:", err);
      }
    }
  };

  const handleApplyJob = async (job: Job) => {
    if (!isSignedIn) {
      setActiveScreen('SignIn');
      showToast("Please sign in to apply for jobs.");
      return;
    }
    // Check if already applied
    const alreadyApplied = applications.some(app => app.jobId === job.id);
    if (alreadyApplied) {
      showToast("You have already applied for this job!");
      return;
    }

    const applyUrl = job.applyUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + " " + job.company)}`;
    
    // open original job post portal in a new tab
    window.open(applyUrl, '_blank', 'noopener,noreferrer');

    const newApp: JobApplication = {
      id: 'app-' + Math.random().toString(36).substring(2, 7),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      logoUrl: job.logoUrl,
      appliedDate: 'Today',
      status: 'Applied',
      notes: `Redirected to portal and logged on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
    };

    setApplications([newApp, ...applications]);
    
    let platform = "Company site";
    if (applyUrl.includes("linkedin.com")) platform = "LinkedIn";
    else if (applyUrl.includes("indeed.com")) platform = "Indeed";
    else if (applyUrl.includes("google.com")) platform = "Google Careers";
    else if (applyUrl.includes("microsoft.com")) platform = "Microsoft Careers";
    else if (applyUrl.includes("stripe.com")) platform = "Stripe Careers";

    showToast(`Opening ${platform} & logging application in pipeline!`);

    try {
      await supabaseClient.from('applications').insert({
        id: newApp.id,
        user_email: userProfile.email,
        job_id: newApp.jobId,
        job_title: newApp.jobTitle,
        company: newApp.company,
        logo_url: newApp.logoUrl,
        applied_date: newApp.appliedDate,
        status: newApp.status,
        notes: newApp.notes
      });
    } catch (err) {
      console.error("Error saving application in Supabase:", err);
    }
  };

  // Applications Pipeline Handlers
  const handleUpdateAppStatus = async (id: string, status: JobApplication['status']) => {
    setApplications(applications.map(app => app.id === id ? { ...app, status } : app));
    showToast(`Moved application stage to ${status}`);
    try {
      await supabaseClient.from('applications').update({ status }).eq('id', id);
    } catch (err) {
      console.error("Error updating application status in Supabase:", err);
    }
  };

  const handleAddManualApp = async (appData: Omit<JobApplication, 'id' | 'appliedDate'>) => {
    const manualApp: JobApplication = {
      ...appData,
      id: 'app-' + Math.random().toString(36).substring(2, 7),
      appliedDate: 'Today'
    };
    setApplications([manualApp, ...applications]);
    showToast(`Added application card for ${appData.company}`);
    try {
      await supabaseClient.from('applications').insert({
        id: manualApp.id,
        user_email: userProfile.email,
        job_id: manualApp.jobId,
        job_title: manualApp.jobTitle,
        company: manualApp.company,
        logo_url: manualApp.logoUrl,
        applied_date: manualApp.appliedDate,
        status: manualApp.status,
        notes: manualApp.notes
      });
    } catch (err) {
      console.error("Error adding manual application in Supabase:", err);
    }
  };

  const handleDeleteApp = async (id: string) => {
    setApplications(applications.filter(app => app.id !== id));
    showToast("Deleted application card.");
    try {
      await supabaseClient.from('applications').delete().eq('id', id);
    } catch (err) {
      console.error("Error deleting application in Supabase:", err);
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    setApplications(applications.map(app => app.id === id ? { ...app, notes } : app));
    showToast("Notes saved.");
    try {
      await supabaseClient.from('applications').update({ notes }).eq('id', id);
    } catch (err) {
      console.error("Error updating application notes in Supabase:", err);
    }
  };

  const handleUpdateJobMatches = (matches: Array<{ jobId: string; matchPercent: number; matchExplanation: string }>) => {
    // Merge new match scores into our jobs list
    const updatedJobs = jobs.map(job => {
      const match = matches.find(m => m.jobId === job.id);
      if (match) {
        return {
          ...job,
          aiMatchPercent: match.matchPercent,
          // Store explanation on the object dynamically
          description: job.description, // preserve
          aiMatchExplanation: match.matchExplanation
        };
      }
      return job;
    });

    setJobs(updatedJobs);
    // Refresh selected job reference to catch updated details
    const currentSelected = updatedJobs.find(j => j.id === selectedJob.id);
    if (currentSelected) {
      setSelectedJob(currentSelected);
    }
    showToast("AI Job Match scores calculated and synced!");
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    const nextProfile = {
      ...userProfile,
      ...updated
    };
    setUserProfile(nextProfile);
    
    try {
      await supabaseClient.from('profiles').upsert({
        email: nextProfile.email,
        name: nextProfile.name,
        role: nextProfile.role,
        avatar_url: nextProfile.avatarUrl,
        skills: nextProfile.skills,
        experience_years: nextProfile.experienceYears,
        desired_salary: nextProfile.desiredSalary,
        resume_text: nextProfile.resumeText,
        profile_completeness: nextProfile.profileCompleteness
      });
    } catch (err) {
      console.error("Error updating profile in Supabase:", err);
    }
  };


  // Filter Jobs list helper functions
  const isJobWithinTimeRange = (postedTime: string, range: string): boolean => {
    if (range === 'all') return true;
    const timeStr = postedTime.toLowerCase();
    
    if (timeStr.includes('second') || timeStr.includes('minute') || timeStr.includes('hour') || timeStr.includes('recently') || timeStr.includes('now')) {
      return true;
    }
    const match = timeStr.match(/(\d+)\s*d/);
    if (match) {
      const days = parseInt(match[1], 10);
      if (range === '24h') return days <= 1;
      if (range === 'week') return days <= 7;
      if (range === 'month') return days <= 30;
    }
    return false;
  };

  const isSalaryAboveThreshold = (salaryRangeStr: string, thresholdKey: string): boolean => {
    if (thresholdKey === 'all') return true;
    const lowerRange = salaryRangeStr.toLowerCase();
    
    if (lowerRange.includes('month') || lowerRange.includes('/mo') || lowerRange.includes('pm')) {
      const stipendMatch = lowerRange.replace(/,/g, '').match(/(\d+)/);
      if (stipendMatch) {
        const monthly = parseInt(stipendMatch[1], 10);
        const annualEquivalent = (monthly * 12) / 100000;
        const thresholdVal = thresholdKey === '10l' ? 10 : thresholdKey === '15l' ? 15 : thresholdKey === '20l' ? 20 : thresholdKey === '30l' ? 30 : 0;
        return annualEquivalent >= thresholdVal;
      }
    }

    if (lowerRange.includes('cr')) return true;
    
    const lakhMatches = [...lowerRange.matchAll(/(\d+(\.\d+)?)\s*l/g)];
    if (lakhMatches.length > 0) {
      const values = lakhMatches.map(m => parseFloat(m[1]));
      const maxVal = Math.max(...values);
      const thresholdVal = thresholdKey === '10l' ? 10 : thresholdKey === '15l' ? 15 : thresholdKey === '20l' ? 20 : thresholdKey === '30l' ? 30 : 0;
      return maxVal >= thresholdVal;
    }
    return true;
  };

  const matchesExperienceLevel = (job: Job, selectedLevels: string[]): boolean => {
    if (selectedLevels.length === 0) return true;
    const expStr = job.experienceRequired.toLowerCase();
    const jobTypeStr = job.jobType.toLowerCase();
    
    return selectedLevels.some(level => {
      if (level === 'Internship') return jobTypeStr === 'internship';
      if (level === 'Entry level') return expStr.includes('0 – 1') || expStr.includes('0 – 2') || expStr.includes('1 – 2') || expStr.includes('0 yrs');
      if (level === 'Associate') return expStr.includes('2 – 4') || expStr.includes('2 – 5') || expStr.includes('1 – 3') || expStr.includes('2 yrs');
      if (level === 'Mid-Senior') return expStr.includes('3 – 5') || expStr.includes('3 – 6') || expStr.includes('4 – 7') || expStr.includes('3 yrs');
      if (level === 'Executive') return expStr.includes('5 –') || expStr.includes('6 –') || expStr.includes('7 –') || expStr.includes('5+') || expStr.includes('7+');
      return false;
    });
  };

  const getRelevanceScore = (job: Job, userProfile: UserProfile, query: string): number => {
    let score = 0;
    const lowerTitle = job.title.toLowerCase();
    const lowerDesc = job.description.toLowerCase();
    const queryLower = query.toLowerCase();

    if (queryLower) {
      if (lowerTitle.includes(queryLower)) score += 50;
      if (lowerDesc.includes(queryLower)) score += 20;
      job.skills.forEach(skill => {
        if (skill.toLowerCase().includes(queryLower)) score += 15;
      });
    }

    if (userProfile && userProfile.skills) {
      const matchedSkillsCount = job.skills.filter(skill => 
        userProfile.skills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
      ).length;
      score += matchedSkillsCount * 10;
    }

    const timeStr = job.postedTime.toLowerCase();
    if (timeStr.includes('second') || timeStr.includes('minute') || timeStr.includes('hour') || timeStr.includes('now') || timeStr.includes('recently')) {
      score += 15;
    } else if (timeStr.includes('hour')) {
      const hours = parseInt(timeStr.match(/\d+/)?.[0] || '0', 10);
      score += Math.max(0, 15 - hours * 0.5);
    } else if (timeStr.includes('day')) {
      const days = parseInt(timeStr.match(/\d+/)?.[0] || '0', 10);
      score += Math.max(0, 5 - days * 0.5);
    }

    if (job.easyApply) score += 5;
    if (job.aiMatchPercent) score += job.aiMatchPercent * 0.5;

    return score;
  };

  // Helper to read URL query parameters
  const getURLQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      keywords: params.get('keywords') || '',
      location: params.get('location') || '',
      f_TPR: params.get('f_TPR') || 'all',
      f_WT: params.get('f_WT') ? params.get('f_WT')?.split(',') : [],
      f_E: params.get('f_E') ? params.get('f_E')?.split(',') : [],
      f_JT: params.get('f_JT') ? params.get('f_JT')?.split(',') : [],
      f_EA: params.get('f_EA') === 'true',
      f_CO: params.get('f_CO') ? params.get('f_CO')?.split(',') : [],
      f_SL: params.get('f_SL') || 'all',
      sort: params.get('sort') || 'recent',
      category: params.get('category') || 'All'
    };
  };

  // Helper to write URL query parameters
  const updateURLQueryParams = (filters: {
    keywords: string;
    location: string;
    f_TPR: string;
    f_WT: string[];
    f_E: string[];
    f_JT: string[];
    f_EA: boolean;
    f_CO: string[];
    f_SL: string;
    sort: string;
    category: string;
  }) => {
    const params = new URLSearchParams();
    if (filters.keywords) params.set('keywords', filters.keywords);
    if (filters.location) params.set('location', filters.location);
    if (filters.f_TPR !== 'all') params.set('f_TPR', filters.f_TPR);
    if (filters.f_WT && filters.f_WT.length > 0) params.set('f_WT', filters.f_WT.join(','));
    if (filters.f_E && filters.f_E.length > 0) params.set('f_E', filters.f_E.join(','));
    if (filters.f_JT && filters.f_JT.length > 0) params.set('f_JT', filters.f_JT.join(','));
    if (filters.f_EA) params.set('f_EA', 'true');
    if (filters.f_CO && filters.f_CO.length > 0) params.set('f_CO', filters.f_CO.join(','));
    if (filters.f_SL !== 'all') params.set('f_SL', filters.f_SL);
    if (filters.sort !== 'recent') params.set('sort', filters.sort);
    if (filters.category !== 'All') params.set('category', filters.category);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // Initialize state from URL on mount
  useEffect(() => {
    const params = getURLQueryParams();
    setSearchQuery(params.keywords);
    setDebouncedSearchQuery(params.keywords);
    setLocationQuery(params.location);
    setDebouncedLocationQuery(params.location);
    setSelectedDatePosted(params.f_TPR);
    setSelectedWorkplaceTypes(params.f_WT);
    setSelectedExperienceLevels(params.f_E);
    setSelectedJobTypes(params.f_JT);
    setEasyApplyOnly(params.f_EA);
    setSelectedCompanies(params.f_CO);
    setSelectedSalaryRange(params.f_SL);
    setSortBy(params.sort);
    setSelectedCategory(params.category);
  }, []);

  // Sync filters to URL and show skeleton loader
  useEffect(() => {
    updateURLQueryParams({
      keywords: searchQuery,
      location: locationQuery,
      f_TPR: selectedDatePosted,
      f_WT: selectedWorkplaceTypes,
      f_E: selectedExperienceLevels,
      f_JT: selectedJobTypes,
      f_EA: easyApplyOnly,
      f_CO: selectedCompanies,
      f_SL: selectedSalaryRange,
      sort: sortBy,
      category: selectedCategory
    });

    setIsLoadingFilters(true);
    const timer = setTimeout(() => {
      setIsLoadingFilters(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [
    debouncedSearchQuery,
    debouncedLocationQuery,
    selectedDatePosted,
    selectedWorkplaceTypes,
    selectedExperienceLevels,
    selectedJobTypes,
    easyApplyOnly,
    selectedCompanies,
    selectedSalaryRange,
    sortBy,
    selectedCategory
  ]);

  // Compute final filtered & sorted jobs list
  const filteredJobs = jobs.filter((job) => {
    if (activeFilterCategory === 'Saved Jobs' && !savedJobIds.includes(job.id)) return false;
    if (activeFilterCategory === 'Applied Jobs' && !applications.some(app => app.jobId === job.id)) return false;

    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    if (!matchesCategory) return false;

    const matchesSearch = !debouncedSearchQuery || 
      job.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    const matchesLocation = !debouncedLocationQuery || 
      job.location.toLowerCase().includes(debouncedLocationQuery.toLowerCase());
    if (!matchesLocation) return false;

    const matchesWorkType = selectedWorkplaceTypes.length === 0 || selectedWorkplaceTypes.includes(job.workType);
    if (!matchesWorkType) return false;

    const matchesJobType = selectedJobTypes.length === 0 || selectedJobTypes.includes(job.jobType);
    if (!matchesJobType) return false;

    if (!matchesExperienceLevel(job, selectedExperienceLevels)) return false;

    if (!isJobWithinTimeRange(job.postedTime, selectedDatePosted)) return false;

    if (easyApplyOnly && !job.easyApply) return false;

    const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(job.company);
    if (!matchesCompany) return false;

    if (!isSalaryAboveThreshold(job.salaryRange, selectedSalaryRange)) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'recent') {
      const getHoursVal = (timeStr: string) => {
        const lower = timeStr.toLowerCase();
        if (lower.includes('second') || lower.includes('minute') || lower.includes('recently') || lower.includes('now')) return 0.1;
        const matchH = lower.match(/(\d+)\s*h/);
        if (matchH) return parseFloat(matchH[1]);
        const matchD = lower.match(/(\d+)\s*d/);
        if (matchD) return parseFloat(matchD[1]) * 24;
        return 999;
      };
      return getHoursVal(a.postedTime) - getHoursVal(b.postedTime);
    } else {
      return getRelevanceScore(b, userProfile, debouncedSearchQuery) - getRelevanceScore(a, userProfile, debouncedSearchQuery);
    }
  });

  // Calculate dynamic facet counts based on current filters
  const getFacetCounts = () => {
    const counts = {
      workplace: { 'Remote': 0, 'Hybrid': 0, 'On-site': 0 },
      jobType: { 'Full-time': 0, 'Part-time': 0, 'Contract': 0, 'Internship': 0 },
      experience: { 'Internship': 0, 'Entry level': 0, 'Associate': 0, 'Mid-Senior': 0, 'Executive': 0 },
      company: {} as Record<string, number>
    };

    jobs.forEach(job => {
      const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
      if (!matchesCategory) return;
      
      const matchesSearch = !debouncedSearchQuery || 
        job.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));

      const matchesLocation = !debouncedLocationQuery || 
        job.location.toLowerCase().includes(debouncedLocationQuery.toLowerCase());
      
      if (!matchesSearch || !matchesLocation) return;

      const matchesWT = selectedWorkplaceTypes.length === 0 || selectedWorkplaceTypes.includes(job.workType);
      const matchesJT = selectedJobTypes.length === 0 || selectedJobTypes.includes(job.jobType);
      const matchesEL = matchesExperienceLevel(job, selectedExperienceLevels);
      const matchesDate = isJobWithinTimeRange(job.postedTime, selectedDatePosted);
      const matchesEA = !easyApplyOnly || !!job.easyApply;
      const matchesSalary = isSalaryAboveThreshold(job.salaryRange, selectedSalaryRange);
      const matchesCO = selectedCompanies.length === 0 || selectedCompanies.includes(job.company);

      if (matchesJT && matchesEL && matchesDate && matchesEA && matchesSalary && matchesCO) {
        if (job.workType in counts.workplace) {
          counts.workplace[job.workType as keyof typeof counts.workplace]++;
        }
      }

      if (matchesWT && matchesEL && matchesDate && matchesEA && matchesSalary && matchesCO) {
        if (job.jobType in counts.jobType) {
          counts.jobType[job.jobType as keyof typeof counts.jobType]++;
        }
      }

      if (matchesWT && matchesJT && matchesDate && matchesEA && matchesSalary && matchesCO) {
        const expStr = job.experienceRequired.toLowerCase();
        let level = '';
        if (expStr.includes('0') || expStr.includes('1')) level = 'Entry level';
        if (expStr.includes('2')) level = 'Associate';
        if (expStr.includes('3') || expStr.includes('4')) level = 'Mid-Senior';
        if (expStr.includes('5') || expStr.includes('6') || expStr.includes('7')) level = 'Executive';
        if (job.jobType === 'Internship') level = 'Internship';

        if (level && level in counts.experience) {
          counts.experience[level as keyof typeof counts.experience]++;
        }
      }

      if (matchesWT && matchesJT && matchesEL && matchesDate && matchesEA && matchesSalary) {
        counts.company[job.company] = (counts.company[job.company] || 0) + 1;
      }
    });

    return counts;
  };

  // Handle viewing specific jobs (e.g. from salary or analytics suggested listings)
  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setActiveDashboardTab('FindJobs');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex flex-col font-sans">
      
      {/* Universal feedback toast notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl text-[11px] font-bold shadow-glow-indigo border border-slate-800 z-50 flex items-center gap-2.5 animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-[#818cf8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Routing */}
      {activeScreen === 'Landing' && (
        <LandingPage 
          onNavigate={setActiveScreen} 
          onSearch={handleLandingSearch} 
          jobs={jobs} 
          onSelectJob={(job) => {
            setSelectedJob(job);
            if (job.category) {
              setSelectedCategory(job.category);
            } else {
              setSelectedCategory('All');
            }
            setActiveScreen('Dashboard');
            setActiveDashboardTab('FindJobs');
            showToast(`Viewing details for ${job.title} at ${job.company}`);
          }}
        />
      )}

      {activeScreen === 'SignIn' && (
        <div className="flex-1 flex items-center justify-center min-h-[85vh] py-12 bg-[#f8f9fa]">
          <ClerkSignIn routing="hash" />
        </div>
      )}

      {activeScreen === 'SignUp' && (
        <div className="flex-1 flex items-center justify-center min-h-[85vh] py-12 bg-[#f8f9fa]">
          <ClerkSignUp routing="hash" />
        </div>
      )}

      {activeScreen === 'Dashboard' && (
        <div className="flex-1 flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#f8f9fa]">
          
          {/* Main Navigation Sidebar (Left Column - Collapsible Dock / Expanded Mode) */}
          <aside className={`bg-white border-r border-gray-150 flex flex-col justify-between shrink-0 lg:h-screen lg:fixed lg:top-0 lg:bottom-0 lg:left-0 select-none z-30 shadow-xs transition-all duration-300 ${
            isSidebarCollapsed 
              ? 'w-full lg:w-16 items-center py-5' 
              : 'w-full lg:w-64 p-5'
          }`}>
            {isSidebarCollapsed ? (
              /* COLLAPSED DOCK SIDEBAR MODE (Image 1 preference) */
              <div className="flex flex-col items-center justify-between h-full w-full">
                <div className="space-y-6 flex flex-col items-center">
                  {/* Top Logo Icon */}
                  <button 
                    onClick={() => setActiveScreen('Landing')}
                    className="w-10 h-10 bg-[#4f46e5] rounded-2xl flex items-center justify-center shadow-md shadow-[#4f46e5]/20 hover:scale-105 transition-transform cursor-pointer"
                    title="JobMerge Home"
                  >
                    <Sparkles className="text-white w-5 h-5" />
                  </button>

                  {/* Vertical Dock Nav Stack */}
                  <nav className="space-y-3.5 flex flex-col items-center">
                    <button
                      onClick={() => setActiveDashboardTab('FindJobs')}
                      className={`p-2.5 rounded-2xl transition-all cursor-pointer relative ${
                        activeDashboardTab === 'FindJobs'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] shadow-xs'
                          : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      title="Dashboard"
                    >
                      <Compass className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('Applications')}
                      className={`p-2.5 rounded-2xl transition-all cursor-pointer relative ${
                        activeDashboardTab === 'Applications'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] shadow-xs'
                          : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      title="Applications"
                    >
                      <Briefcase className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 bg-[#4f46e5] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">12</span>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('Saved')}
                      className={`p-2.5 rounded-2xl transition-all cursor-pointer relative ${
                        activeDashboardTab === 'Saved'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] shadow-xs'
                          : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      title="Saved Jobs"
                    >
                      <Bookmark className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">28</span>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('AutoApply')}
                      className={`p-2.5 rounded-2xl transition-all cursor-pointer relative ${
                        activeDashboardTab === 'AutoApply'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] shadow-xs'
                          : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      title="LinkedIn Auto-Applier"
                    >
                      <Sparkles className="w-5 h-5 text-[#4f46e5]" />
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('AIReview')}
                      className={`p-2.5 rounded-2xl transition-all cursor-pointer relative ${
                        activeDashboardTab === 'AIReview'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] shadow-xs'
                          : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      title="ATS Score Checker"
                    >
                      <FileText className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('Resume')}
                      className={`p-2.5 rounded-2xl transition-all cursor-pointer relative ${
                        activeDashboardTab === 'Resume'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] shadow-xs'
                          : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      title="Resume Builder"
                    >
                      <BookOpen className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('Salaries')}
                      className={`p-2.5 rounded-2xl transition-all cursor-pointer relative ${
                        activeDashboardTab === 'Salaries'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] shadow-xs'
                          : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      title="Salary Insights"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </button>
                  </nav>
                </div>

                {/* Bottom Dock Controls */}
                <div className="flex flex-col items-center space-y-4">
                  <img 
                    alt={userProfile.name} 
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
                    src={userProfile.avatarUrl} 
                  />
                  {/* Expand Sidebar Button (Chevron Right / >) */}
                  <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="w-8 h-8 bg-gray-100 hover:bg-[#4f46e5] text-gray-500 hover:text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                    title="Expand Full Sidebar"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* EXPANDED SIDEBAR MODE (Image 2 preference) */
              <div className="flex flex-col justify-between h-full space-y-6">
                <div className="space-y-6 overflow-y-auto pr-1 scrollbar-none">
                  {/* Logo Header */}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setActiveScreen('Landing')}
                      className="flex items-center gap-2.5 focus:outline-none cursor-pointer group"
                    >
                      <div className="w-9 h-9 bg-[#4f46e5] rounded-2xl flex items-center justify-center shadow-md shadow-[#4f46e5]/15 group-hover:scale-105 transition-transform">
                        <Sparkles className="text-white w-5 h-5" />
                      </div>
                      <span className="font-extrabold text-xl text-gray-900 tracking-tight font-display">JobMerge</span>
                    </button>

                    <button 
                      onClick={() => setIsSidebarCollapsed(true)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                      title="Collapse Dock Sidebar"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* OVERVIEW Section */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Overview</p>
                    
                    <button
                      onClick={() => setActiveDashboardTab('FindJobs')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeDashboardTab === 'FindJobs'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] font-extrabold shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('FindJobs')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeDashboardTab === 'FindJobs'
                          ? 'text-[#4f46e5] font-extrabold'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4" />
                        <span>Find Jobs</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('Applications')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeDashboardTab === 'Applications'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] font-extrabold'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-4 h-4" />
                        <span>Applications</span>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-50 text-[#4f46e5] border border-indigo-100 rounded-full text-[10px] font-black">12</span>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('Saved')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeDashboardTab === 'Saved'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] font-extrabold'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Bookmark className="w-4 h-4" />
                        <span>Saved Jobs</span>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-50 text-[#4f46e5] border border-indigo-100 rounded-full text-[10px] font-black">28</span>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('AutoApply')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeDashboardTab === 'AutoApply'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] font-extrabold border border-[#4f46e5]/20'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                        <span>Auto Apply</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('AIReview')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeDashboardTab === 'AIReview'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] font-extrabold'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4" />
                        <span>ATS Score Checker</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('Resume')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeDashboardTab === 'Resume'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] font-extrabold'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4" />
                        <span>Resume Builder</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('Salaries')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeDashboardTab === 'Salaries'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] font-extrabold'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-4 h-4" />
                        <span>Salary Insights</span>
                      </div>
                    </button>
                  </div>

                  {/* TOOLS Section */}
                  <div className="space-y-1 pt-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Tools</p>
                    
                    <button
                      onClick={() => setActiveDashboardTab('Applications')}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Job Tracker</span>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('Salaries')}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Career Paths</span>
                    </button>
                  </div>

                  {/* Upgrade to Pro Card */}
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/60 space-y-3">
                    <div className="w-8 h-8 bg-[#4f46e5] rounded-xl flex items-center justify-center text-white shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900">Upgrade to Pro</h4>
                      <p className="text-[10px] text-gray-500 font-semibold leading-relaxed mt-0.5">Unlock advanced features and get hired faster.</p>
                    </div>
                    <button className="w-full py-2 bg-[#4f46e5] hover:bg-[#3f37c9] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer">
                      Upgrade Now
                    </button>
                  </div>
                </div>

                {/* Footer User Profile Block */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img 
                        alt={userProfile.name} 
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-inner"
                        src={userProfile.avatarUrl} 
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-black text-gray-900 truncate">{userProfile.name}</p>
                        <CheckCircle2 className="w-3 h-3 text-[#4f46e5] shrink-0" />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold truncate">{userProfile.role}</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* Main Workspace Area */}
          <main className={`flex-1 p-6 lg:p-8 max-w-[1600px] w-full flex flex-col space-y-6 transition-all duration-300 lg:overflow-y-auto ${
            isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}>
            
            {/* Top Navigation Header Bar */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-150/60">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight font-display flex items-center gap-2">
                  <span>Good Evening, {userProfile.name.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-xs font-bold text-gray-400 mt-0.5">Let's find the right opportunity for your next big move.</p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                {/* Search Bar */}
                <div className="relative w-64 md:w-80 flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-xs focus-within:border-[#4f46e5] transition-all">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search jobs, skills, companies..." 
                    className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none px-2 text-gray-800 placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Sparkles className="w-4 h-4 text-[#4f46e5] shrink-0 cursor-pointer" />
                </div>

                {/* Notification Bell Button */}
                <button className="relative p-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-full text-gray-600 shadow-xs cursor-pointer">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-purple-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">3</span>
                </button>

                {/* Profile Pill Dropdown */}
                <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-full p-1.5 pr-3 shadow-xs">
                  <img alt={userProfile.name} className="w-7 h-7 rounded-full object-cover" src={userProfile.avatarUrl} />
                  <div className="hidden sm:block text-left">
                    <p className="text-[11px] font-black text-gray-900 leading-tight">{userProfile.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 leading-tight">{userProfile.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </header>

            {/* Find Jobs View Main Feed */}
            {activeDashboardTab === 'FindJobs' && (
              <div className="space-y-6 flex-1 flex flex-col">
                
                {/* 4 Analytics KPI Stat Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4.5 rounded-3xl border border-gray-150 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-[#4f46e5] border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 font-display leading-tight">{jobs.length}</h3>
                        <p className="text-[11px] font-bold text-gray-400">Jobs Match</p>
                        <span className="text-[10px] font-black text-emerald-600">+18 new today</span>
                      </div>
                    </div>
                    <MiniSparkline color="#4f46e5" data={[12, 18, 15, 25, 22, 34]} />
                  </div>

                  <div className="bg-white p-4.5 rounded-3xl border border-gray-150 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 font-display leading-tight">12</h3>
                        <p className="text-[11px] font-bold text-gray-400">Applications</p>
                        <span className="text-[10px] font-black text-emerald-600">+3 today</span>
                      </div>
                    </div>
                    <MiniSparkline color="#10b981" data={[8, 10, 14, 12, 20, 28]} />
                  </div>

                  <div className="bg-white p-4.5 rounded-3xl border border-gray-150 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 font-display leading-tight">{userProfile.profileCompleteness}%</h3>
                        <p className="text-[11px] font-bold text-gray-400">Resume Score</p>
                        <span className="text-[10px] font-black text-emerald-600">Excellent</span>
                      </div>
                    </div>
                    <MiniSparkline color="#f59e0b" data={[70, 75, 82, 85, 89, 91]} />
                  </div>

                  <div className="bg-white p-4.5 rounded-3xl border border-gray-150 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-50 text-sky-600 border border-sky-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 font-display leading-tight">8</h3>
                        <p className="text-[11px] font-bold text-gray-400">AI Suggestions</p>
                        <span className="text-[10px] font-black text-sky-600">High Match</span>
                      </div>
                    </div>
                    <MiniSparkline color="#0284c7" data={[3, 5, 4, 7, 6, 8]} />
                  </div>
                </div>

                {/* Royal Purple Hero Gradient Banner */}
                <div className="relative bg-gradient-to-r from-[#4f46e5] via-[#4338ca] to-[#3730a3] rounded-3xl p-7 text-white overflow-hidden shadow-lg shadow-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 relative z-10 max-w-xl text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display leading-snug">
                      Find the right opportunity for your next career move
                    </h2>
                    <p className="text-xs md:text-sm font-medium text-indigo-100">Smart matches, curated for you</p>
                    <div className="pt-2">
                      <button 
                        onClick={() => setActiveDashboardTab('FindJobs')}
                        className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95 inline-flex"
                      >
                        <span>Explore Jobs</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="relative shrink-0 w-56 h-32 hidden sm:flex items-center justify-center">
                    <div className="absolute w-44 h-28 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-4 flex flex-col items-center justify-center space-y-2 transform rotate-2">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex gap-1 text-amber-300 text-xs">
                        ★★★★★
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Filters Toolbar */}
                <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-xs space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:bg-white focus-within:border-[#4f46e5] focus-within:ring-2 focus-within:ring-[#4f46e5]/10 transition-all">
                      <Search className="w-4 h-4 text-gray-400 shrink-0" />
                      <input 
                        type="text" 
                        placeholder="Search by title, skills, company or keywords..." 
                        className="w-full bg-transparent border-none text-xs font-semibold focus:outline-none text-gray-800 placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Mic className="w-4 h-4 text-gray-400 shrink-0 cursor-pointer" />
                    </div>

                    <button className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all cursor-pointer">
                      Search
                    </button>

                    <button 
                      onClick={() => setIsAllFiltersOpen(!isAllFiltersOpen)}
                      className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Advanced</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  </div>

                  {/* Filter Tabs & Easy Apply */}
                  <div className="flex flex-wrap gap-2 items-center justify-between text-xs font-bold pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEasyApplyOnly(!easyApplyOnly)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          easyApplyOnly ? 'bg-indigo-50 border-indigo-200 text-[#4f46e5] font-black' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-[#4f46e5]" />
                        <span>Easy Apply</span>
                      </button>
                    </div>

                    {/* Category Selection Tabs */}
                    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl overflow-x-auto">
                      {['Recommended', 'Recent Jobs', 'Saved Jobs', 'Applied Jobs'].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setActiveFilterCategory(tab)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                            activeFilterCategory === tab ? 'bg-[#4f46e5] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main 2-Column Feed & Right Sidebar Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Columns: Job Cards Feed */}
                  <div className="lg:col-span-2 space-y-4">
                    {filteredJobs.length === 0 ? (
                      <div className="bg-white rounded-3xl p-10 border border-gray-150 text-center space-y-3">
                        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                        <h4 className="text-md font-bold font-display text-gray-900">No jobs found matching criteria</h4>
                        <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">Try resetting filters to explore all available job opportunities.</p>
                      </div>
                    ) : (
                      filteredJobs.map((job, idx) => {
                        const matchPct = job.aiMatchPercent || (95 - idx * 3);
                        return (
                          <div key={job.id} className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs hover:shadow-md transition-all space-y-4 relative group">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                  <img alt={job.company} className="w-8 h-8 object-contain" src={job.logoUrl} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-base font-black text-gray-900 font-display group-hover:text-[#4f46e5] transition-colors">{job.title}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getPlatformInfo(job).badgeBg}`}>
                                      via {getPlatformInfo(job).name}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 font-semibold mt-0.5">
                                    {job.company} • {job.location} • {job.workType}
                                  </p>
                                  <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-600 mt-2.5">
                                    <span className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.salaryRange}</span>
                                    <span className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.jobType}</span>
                                    <span className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.experienceRequired}</span>
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-black">⚡ Easy Apply</span>
                                  </div>
                                </div>
                              </div>

                              {/* Circular Match Score Gauge Ring */}
                              <CircularProgress percentage={matchPct} />
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <span className="text-[10px] font-bold text-gray-400">Posted {job.postedTime}</span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => handleToggleBookmark(job.id, e)}
                                  className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4f46e5] cursor-pointer"
                                >
                                  <Bookmark className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleApplyJob(job)}
                                  className="px-4 py-2 bg-[#4f46e5] hover:bg-[#3f37c9] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Quick Apply</span>
                                </button>
                                <button 
                                  onClick={() => setSelectedJobDetailModal(job)}
                                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                                >
                                  View Details →
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right 1 Column: Intelligence Sidebar Widgets */}
                  <div className="space-y-6">
                    {/* Widget 1: Your Profile Overview */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider font-display">Your Profile Overview</h3>
                        <span className="text-[10px] font-extrabold text-[#4f46e5] cursor-pointer">View full report →</span>
                      </div>

                      <ProfileGaugeRing score={userProfile.profileCompleteness || 91} />

                      <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                          <div>
                            <p className="text-[11px] font-black text-gray-900">Improve your score</p>
                            <p className="text-[9px] font-bold text-gray-500">8 suggestions available</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#4f46e5]" />
                      </div>
                    </div>

                    {/* Widget 2: AI Recommendations */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider font-display">AI Recommendations</h3>
                        <span className="text-[10px] font-extrabold text-[#4f46e5] cursor-pointer">View all</span>
                      </div>

                      <div className="space-y-3">
                        {[
                          { title: 'DevOps Engineer', company: 'IBM', location: 'Remote', match: 96 },
                          { title: 'Full Stack Developer', company: 'Zoho', location: 'Chennai', match: 93 },
                          { title: 'Software Engineer II', company: 'Swiggy', location: 'Bengaluru', match: 90 }
                        ].map((rec, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-[#4f46e5]/10 rounded-xl flex items-center justify-center font-black text-xs text-[#4f46e5]">
                                {rec.company[0]}
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-900">{rec.title}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{rec.company} • {rec.location}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                              {rec.match}% Match
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Widget 3: Market Insights */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider font-display">Market Insights</h3>
                        <span className="text-[10px] font-extrabold text-[#4f46e5] cursor-pointer">View all</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg. Salary (Your Role)</p>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-gray-900 font-display">₹18.7 LPA</span>
                          <span className="text-[10px] font-black text-emerald-600">↑ 12% vs last year</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Skills in Demand</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['React.js', 'Node.js', 'TypeScript', 'AWS', 'SQL'].map(skill => (
                            <span key={skill} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black text-gray-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lazy Loaded Secondary Tab Modules with Suspense Fallback */}
            <Suspense fallback={
              <div className="bg-white rounded-3xl p-12 border border-gray-150 shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin"></div>
                <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Loading Module...</p>
              </div>
            }>
              {/* Salaries Analysis View */}
              {activeDashboardTab === 'Salaries' && (
                <div className="flex-1 lg:overflow-y-auto pb-6">
                  <SalaryInsights 
                    insights={INITIAL_SALARY_INSIGHTS} 
                    userProfile={userProfile} 
                    onUpdateUserProfile={handleUpdateProfile} 
                    onViewJob={handleViewJob}
                    availableJobs={jobs}
                  />
                </div>
              )}

              {/* AI Resume Reviewer View */}
              {activeDashboardTab === 'AIReview' && (
                <div className="flex-1 lg:overflow-y-auto pb-6">
                  <AIResumeReview 
                    userProfile={userProfile} 
                    availableJobs={jobs} 
                    onUpdateUserProfile={handleUpdateProfile} 
                    onUpdateJobMatches={handleUpdateJobMatches}
                  />
                </div>
              )}

              {/* Resume Builder View */}
              {activeDashboardTab === 'Resume' && (
                <ResumeBuilder userProfile={userProfile} />
              )}

              {/* LinkedIn Auto-Applier Bot View */}
              {activeDashboardTab === 'AutoApply' && (
                <AutoApplyBot
                  userProfile={userProfile}
                  onSyncApplications={(newApps) => {
                    setApplications(prev => {
                      const existingIds = new Set(prev.map(a => a.id));
                      const filteredNew = newApps.filter(a => !existingIds.has(a.id));
                      return [...filteredNew, ...prev];
                    });
                  }}
                />
              )}
            </Suspense>



            {/* Saved Jobs View */}
            {activeDashboardTab === 'Saved' && (
              <div className="space-y-6 animate-fade-in flex-1 lg:overflow-y-auto pb-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-display">Saved Opportunities</h1>
                  <p className="text-sm font-semibold text-gray-500">Review, organize, or submit applications to the positions you bookmarked.</p>
                </div>

                {savedJobIds.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-gray-150 text-center space-y-4 h-80 flex flex-col items-center justify-center">
                    <Bookmark className="w-10 h-10 text-gray-300" />
                    <h3 className="text-lg font-bold font-display text-gray-900">No Saved Jobs Yet</h3>
                    <p className="text-xs text-gray-400 font-semibold max-w-xs leading-relaxed">
                      While browsing available positions, tap the bookmark icon on any job card to save it for easy access later.
                    </p>
                    <button 
                      onClick={() => setActiveDashboardTab('FindJobs')}
                      className="px-5 py-2.5 bg-[#4f46e5] text-white rounded-xl font-bold text-xs hover:bg-[#3f37c9] shadow-md transition-all cursor-pointer"
                    >
                      Find Jobs Now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.filter(j => savedJobIds.includes(j.id)).map(job => (
                      <div 
                        key={job.id}
                        className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            <img 
                              alt={job.company} 
                              className="w-8 h-8 object-contain" 
                              src={job.logoUrl} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/48/000000/briefcase.png';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-extrabold text-gray-900 truncate">{job.title}</h3>
                            <p className="text-xs font-semibold text-gray-400 truncate">{job.company} • {job.location}</p>
                            <p className="text-xs font-bold text-[#4f46e5] mt-1">{job.salaryRange}</p>
                          </div>
                          <button
                            onClick={(e) => handleToggleBookmark(job.id, e)}
                            className="p-1.5 rounded-xl border border-[#4f46e5]/25 text-[#4f46e5] bg-[#4f46e5]/5 hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all cursor-pointer"
                            title="Remove bookmark"
                          >
                            <Bookmark className="w-4 h-4 fill-current" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-bold">
                          <button
                            onClick={() => handleViewJob(job)}
                            className="text-[#4f46e5] hover:underline cursor-pointer"
                          >
                            View details
                          </button>
                          
                          {applications.some(app => app.jobId === job.id) ? (
                            <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 border border-green-250 px-2.5 py-1 rounded-lg font-bold">
                              <Check className="w-3 h-3 stroke-[3]" /> Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApplyJob(job)}
                              className="px-4 py-2 bg-[#4f46e5] text-white hover:bg-[#3f37c9] rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm shadow-[#4f46e5]/10"
                            >
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                        ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {/* All Filters Drawer/Modal rendering */}
      {isAllFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAllFiltersOpen(false)}
          ></div>
          
          {/* Drawer Container */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-md font-extrabold text-gray-900 font-display">All Filters</h3>
              <button 
                onClick={() => setIsAllFiltersOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
              {/* Date Posted */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Date Posted</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Any time' },
                    { id: '24h', label: 'Past 24 hours' },
                    { id: 'week', label: 'Past week' },
                    { id: 'month', label: 'Past month' }
                  ].map(opt => (
                    <label 
                      key={opt.id} 
                      className={`p-3 border rounded-xl flex items-center gap-3.5 text-xs font-bold cursor-pointer transition-all ${
                        selectedDatePosted === opt.id 
                          ? 'border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="drawer-date-posted" 
                        className="text-[#4f46e5] focus:ring-[#4f46e5] rounded-full border-gray-300 w-4 h-4"
                        checked={selectedDatePosted === opt.id}
                        onChange={() => setSelectedDatePosted(opt.id)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Workplace Type */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Workplace Type</h4>
                <div className="space-y-2">
                  {['On-site', 'Hybrid', 'Remote'].map(type => {
                    const counts = getFacetCounts();
                    const count = counts.workplace[type as keyof typeof counts.workplace] || 0;
                    const isChecked = selectedWorkplaceTypes.includes(type);
                    return (
                      <label 
                        key={type} 
                        className={`p-3 border rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all ${
                          isChecked 
                            ? 'border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <input 
                            type="checkbox" 
                            className="text-[#4f46e5] focus:ring-[#4f46e5] rounded border-gray-300 w-4 h-4"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWorkplaceTypes([...selectedWorkplaceTypes, type]);
                              } else {
                                setSelectedWorkplaceTypes(selectedWorkplaceTypes.filter(t => t !== type));
                              }
                            }}
                          />
                          <span>{type}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-extrabold">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Experience Level</h4>
                <div className="space-y-2">
                  {['Internship', 'Entry level', 'Associate', 'Mid-Senior', 'Executive'].map(level => {
                    const counts = getFacetCounts();
                    const count = counts.experience[level as keyof typeof counts.experience] || 0;
                    const isChecked = selectedExperienceLevels.includes(level);
                    return (
                      <label 
                        key={level} 
                        className={`p-3 border rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all ${
                          isChecked 
                            ? 'border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <input 
                            type="checkbox" 
                            className="text-[#4f46e5] focus:ring-[#4f46e5] rounded border-gray-300 w-4 h-4"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExperienceLevels([...selectedExperienceLevels, level]);
                              } else {
                                setSelectedExperienceLevels(selectedExperienceLevels.filter(l => l !== level));
                              }
                            }}
                          />
                          <span>{level}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-extrabold">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Job Type */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Job Type</h4>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => {
                    const counts = getFacetCounts();
                    const count = counts.jobType[type as keyof typeof counts.jobType] || 0;
                    const isChecked = selectedJobTypes.includes(type);
                    return (
                      <label 
                        key={type} 
                        className={`p-3 border rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all ${
                          isChecked 
                            ? 'border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]' 
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <input 
                            type="checkbox" 
                            className="text-[#4f46e5] focus:ring-[#4f46e5] rounded border-gray-300 w-4 h-4"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedJobTypes([...selectedJobTypes, type]);
                              } else {
                                setSelectedJobTypes(selectedJobTypes.filter(t => t !== type));
                              }
                            }}
                          />
                          <span>{type}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-extrabold">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Salary Range */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Minimum Salary (Lakhs PA equivalent)</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Any salary' },
                    { id: '10l', label: '₹10L+ PA' },
                    { id: '15l', label: '₹15L+ PA' },
                    { id: '20l', label: '₹20L+ PA' },
                    { id: '30l', label: '₹30L+ PA' }
                  ].map(opt => (
                    <label 
                      key={opt.id} 
                      className={`p-3 border rounded-xl flex items-center gap-3.5 text-xs font-bold cursor-pointer transition-all ${
                        selectedSalaryRange === opt.id 
                          ? 'border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="drawer-salary" 
                        className="text-[#4f46e5] focus:ring-[#4f46e5] rounded-full border-gray-300 w-4 h-4"
                        checked={selectedSalaryRange === opt.id}
                        onChange={() => setSelectedSalaryRange(opt.id)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Easy Apply */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-900">Easy Apply Only</h4>
                    <p className="text-[10px] text-gray-400 font-semibold">Show only jobs that support quick one-click application</p>
                  </div>
                  <button 
                    onClick={() => setEasyApplyOnly(!easyApplyOnly)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                      easyApplyOnly ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      easyApplyOnly ? 'translate-x-5' : 'translate-x-0'
                    }`}></span>
                  </button>
                </div>
              </div>

              {/* Companies */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider font-display">Companies</h4>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border border-gray-100 rounded-xl font-sans">
                  {Object.entries(getFacetCounts().company)
                    .sort((a, b) => b[1] - a[1])
                    .map(([companyName, count]) => {
                      const isChecked = selectedCompanies.includes(companyName);
                      return (
                        <label 
                          key={companyName} 
                          className={`p-2.5 border rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer transition-all truncate ${
                            isChecked 
                              ? 'border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]' 
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 max-w-[120px] truncate">
                            <input 
                              type="checkbox" 
                              className="text-[#4f46e5] focus:ring-[#4f46e5] rounded border-gray-300 w-3.5 h-3.5"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCompanies([...selectedCompanies, companyName]);
                                } else {
                                  setSelectedCompanies(selectedCompanies.filter(c => c !== companyName));
                                }
                              }}
                            />
                            <span className="truncate">{companyName}</span>
                          </div>
                          <span className="text-[9px] text-gray-400 font-bold ml-1">({count})</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button 
                onClick={() => {
                  setSelectedDatePosted('all');
                  setSelectedWorkplaceTypes([]);
                  setSelectedExperienceLevels([]);
                  setSelectedJobTypes([]);
                  setSelectedCompanies([]);
                  setSelectedSalaryRange('all');
                  setEasyApplyOnly(false);
                }}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer hover:underline uppercase tracking-wider"
              >
                Reset all
              </button>
              
              <button 
                onClick={() => setIsAllFiltersOpen(false)}
                className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-98 text-white text-xs font-black rounded-xl cursor-pointer shadow-premium"
              >
                Show {filteredJobs.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Job Detail Modal Overlay */}
      {selectedJobDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedJobDetailModal(null)}
          ></div>
          
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden animate-scale-up border border-gray-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  <img 
                    alt={selectedJobDetailModal.company} 
                    className="w-8 h-8 object-contain" 
                    src={selectedJobDetailModal.logoUrl} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/48/000000/briefcase.png';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-gray-900 leading-tight truncate">{selectedJobDetailModal.title}</h3>
                  <p className="text-xs font-semibold text-[#4f46e5] mt-0.5">{selectedJobDetailModal.company} • <span className="text-gray-400">{selectedJobDetailModal.location}</span></p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedJobDetailModal(null)} 
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50/70 border border-gray-150 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Salary Budget</p>
                  <p className="text-xs font-extrabold text-gray-800 mt-1">{selectedJobDetailModal.salaryRange}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Experience</p>
                  <p className="text-xs font-extrabold text-gray-800 mt-1">{selectedJobDetailModal.experienceRequired}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Workplace</p>
                  <p className="text-xs font-extrabold text-[#4f46e5] mt-1">{selectedJobDetailModal.workType}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contract Type</p>
                  <p className="text-xs font-extrabold text-gray-800 mt-1">{selectedJobDetailModal.jobType}</p>
                </div>
              </div>

              {/* Gemini Alignment Explanation */}
              {selectedJobDetailModal.aiMatchPercent && (
                <div className="bg-[#4f46e5]/5 border border-[#4f46e5]/10 p-4.5 rounded-2xl space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 bg-[#4f46e5]/10 text-[#4f46e5] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      Gemini Match Alignment: {selectedJobDetailModal.aiMatchPercent}%
                    </span>
                    <span className="text-[10px] text-[#4f46e5] font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Verified fit
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                    {selectedJobDetailModal.aiMatchExplanation || `This Software Engineering role matches your core experience perfectly based on your registered skills: ${userProfile.skills.slice(0, 4).join(', ')}. Your profile aligns closely with the company's technology stack.`}
                  </p>
                </div>
              )}

              {/* Target Application Platform Destination Banner */}
              {(() => {
                const platform = getPlatformInfo(selectedJobDetailModal);
                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/90 border border-gray-200 rounded-2xl gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${platform.badgeBg}`}>
                        {platform.name}
                      </span>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Application Destination</p>
                        <p className="text-xs font-extrabold text-gray-900">You will be redirected to apply on <b className="text-[#4f46e5]">{platform.name}</b></p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#4f46e5] uppercase tracking-wider bg-[#4f46e5]/5 border border-[#4f46e5]/10 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
                      <ExternalLink className="w-3.5 h-3.5" /> Direct Application Link
                    </span>
                  </div>
                );
              })()}

              {/* Company About */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About the company</h4>
                <p className="text-xs text-gray-600 font-semibold leading-relaxed">{selectedJobDetailModal.companyAbout}</p>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job description</h4>
                <p className="text-xs text-gray-600 font-semibold leading-relaxed">{selectedJobDetailModal.description}</p>
              </div>

              {/* Requirements */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Requirements</h4>
                <ul className="space-y-2">
                  {selectedJobDetailModal.requirements.map((req, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] shrink-0 mt-1.5"></div>
                      <span className="text-xs text-gray-600 font-semibold leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Benefits</h4>
                <ul className="space-y-2">
                  {selectedJobDetailModal.benefits.map((ben, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <div className="w-4 h-4 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-xs text-gray-600 font-semibold leading-relaxed">{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Technical Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJobDetailModal.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button 
                onClick={(e) => handleToggleBookmark(selectedJobDetailModal.id, e)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  savedJobIds.includes(selectedJobDetailModal.id)
                    ? 'bg-[#4f46e5]/10 border border-[#4f46e5]/30 text-[#4f46e5]'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {savedJobIds.includes(selectedJobDetailModal.id) ? 'Saved' : 'Save Job'}
              </button>

              {applications.some(app => app.jobId === selectedJobDetailModal.id) ? (
                <button disabled className="px-6 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Already Applied
                </button>
              ) : (
                <button 
                  onClick={() => {
                    handleApplyJob(selectedJobDetailModal);
                    setSelectedJobDetailModal(null);
                  }}
                  className="px-6 py-2.5 bg-[#4f46e5] text-white hover:bg-[#3f37c9] rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{getPlatformInfo(selectedJobDetailModal).btnText}</span> <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
