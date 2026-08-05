import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Sparkles, Search, MapPin, SlidersHorizontal, BookOpen, Bookmark, 
  Briefcase, Award, ArrowRight, Check, CheckCircle2, DollarSign, 
  Compass, BarChart3, FileText, User, LogOut, ChevronRight, HelpCircle, 
  X, AlertCircle, BookmarkCheck, Heart, UserCheck, ShieldCheck, Clock, Lock,
  ChevronDown, ExternalLink, PanelLeftClose, PanelLeftOpen, Sidebar,
  Bell, Mic, TrendingUp, Zap, Target, LayoutDashboard, ChevronLeft,
  MoreHorizontal, MessageSquare, Video, Filter, Grid, List, Menu
} from 'lucide-react';
import { 
  ActiveScreen, Job, UserProfile, JobApplication, SalaryInsight 
} from './types';
import { INITIAL_JOBS, INITIAL_SALARY_INSIGHTS, DEFAULT_USER, getRoleRealisticSpecs } from './data';
import LandingPage from './components/LandingPage';
import ExternalRedirectModal from './components/ExternalRedirectModal';
import PricingModal from './components/PricingModal';
import { supabase, getSupabaseClient } from './supabaseClient';
import { useUser, useAuth, SignIn as ClerkSignIn, SignUp as ClerkSignUp, SignInButton } from '@clerk/clerk-react';

// High-concurrency bundle optimization: Lazy load heavy secondary tab components
const SalaryInsights = lazy(() => import('./components/SalaryInsights'));
const ApplicationTracker = lazy(() => import('./components/ApplicationTracker'));
const AIResumeReview = lazy(() => import('./components/AIResumeReview'));
const ResumeBuilder = lazy(() => import('./components/ResumeBuilder'));
const AutoApplyBot = lazy(() => import('./components/AutoApplyBot'));
import CoverLetterGenerator from './components/CoverLetterGenerator';
import UserProfileManager from './components/UserProfileManager';

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

function ProfileGaugeRing({ score = 84 }: { score?: number }) {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let badgeText = "Excellent";
  let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let strokeColor = "stroke-[#4f46e5]";

  if (score < 50) {
    badgeText = "Needs Improvement";
    badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
    strokeColor = "stroke-amber-500";
  } else if (score < 70) {
    badgeText = "Fair";
    badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
    strokeColor = "stroke-blue-500";
  } else if (score < 85) {
    badgeText = "Good";
    badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
    strokeColor = "stroke-indigo-600";
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <div className="relative" style={{ width: size, height: size / 2 + 12 }}>
        <svg className="overflow-visible" width={size} height={size}>
          <path d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`} className="stroke-gray-100" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
          <path d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`} className={`${strokeColor} transition-all duration-1000`} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} fill="none" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
          <span className="text-2xl font-black text-gray-900 tracking-tight font-display">{score}%</span>
          <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Resume Score</span>
        </div>
      </div>
      <span className={`mt-2.5 px-3 py-0.5 border rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
        {badgeText}
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
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('Landing');
  const [activeDashboardTab, setActiveDashboardTab] = useState<'Dashboard' | 'FindJobs' | 'Salaries' | 'AIReview' | 'Applications' | 'Saved' | 'Resume' | 'AutoApply' | 'Profile'>('Dashboard');
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('Recommended');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Conversion Auth Modal & Plan Selection Modal State
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [isOnboardingPlanSelection, setIsOnboardingPlanSelection] = useState<boolean>(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState<boolean>(false);
  const [selectedJobForCoverLetter, setSelectedJobForCoverLetter] = useState<Job | null>(null);
  const [authModalDetails, setAuthModalDetails] = useState<{ title: string; subtitle: string; targetJob?: Job | null }>({
    title: "Continue with Google to Apply Instantly",
    subtitle: "Create your free account to unlock 1-click quick apply, AI match scores, and automated applier tools."
  });

  const handleSelectPlan = async (planTier: 'Free' | 'Pro' | 'Accelerator') => {
    const updatedProfile = {
      ...userProfile,
      plan: planTier,
      hasSelectedInitialPlan: true
    };
    setUserProfile(updatedProfile);
    try {
      localStorage.setItem('jobmerge_user_plan', planTier);
      localStorage.setItem('jobmerge_has_selected_plan', 'true');
    } catch (e) {}

    try {
      await supabaseClient.from('profiles').upsert({
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        avatar_url: userProfile.avatarUrl,
        skills: userProfile.skills,
        experience_years: userProfile.experienceYears,
        desired_salary: userProfile.desiredSalary,
        resume_text: userProfile.resumeText,
        profile_completeness: userProfile.profileCompleteness,
        plan: planTier,
        usage: userProfile.usage
      });
    } catch (err) {
      console.error("Error syncing active plan to Supabase:", err);
    }

    setShowPricingModal(false);
    setIsOnboardingPlanSelection(false);
    showToast(`🎉 Plan Activated: ${planTier === 'Free' ? 'Free Starter' : planTier === 'Pro' ? 'Job Hunter Pro' : 'Career Accelerator'}!`);
  };

  const triggerAuthModal = (title: string, subtitle: string, targetJob?: Job | null) => {
    setAuthModalDetails({ title, subtitle, targetJob: targetJob || null });
    setShowAuthModal(true);
  };

  const handleTabSelect = (tab: 'FindJobs' | 'Salaries' | 'AIReview' | 'Applications' | 'Saved' | 'Resume' | 'AutoApply') => {
    if (!isSignedIn && (tab === 'AIReview' || tab === 'Resume' || tab === 'AutoApply' || tab === 'Saved')) {
      const titles: Record<string, string> = {
        AIReview: "Continue with Google for ATS Score Checker",
        Resume: "Continue with Google for AI Resume Builder",
        AutoApply: "Continue with Google for Auto-Apply Bot",
        Saved: "Continue with Google to Save Jobs"
      };
      triggerAuthModal(
        titles[tab] || "Sign In to Access Feature",
        "Create your free account to access AI tools and saved jobs."
      );
      return;
    }
    setActiveDashboardTab(tab);
  };
  
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedJobDetailModal, setSelectedJobDetailModal] = useState<Job | null>(null);

  // Pagination & Display Limit state to keep site ultra-fast & memory light
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jobsPerPage, setJobsPerPage] = useState<number>(10);

  // Reset page to 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, debouncedLocationQuery, selectedCategory, selectedDatePosted, selectedWorkplaceTypes, selectedExperienceLevels, selectedJobTypes, selectedCompanies, selectedSalaryRange, easyApplyOnly, sortBy]);

  // Security & Redirect Intent State
  const [pendingRedirectJob, setPendingRedirectJob] = useState<Job | null>(null);
  const [redirectIntentScreen, setRedirectIntentScreen] = useState<ActiveScreen | null>(null);
  const [redirectIntentTab, setRedirectIntentTab] = useState<string | null>(null);

  // Route Security Guard for Protected Navigations
  const handleProtectedNavigate = (screen: ActiveScreen, tab?: string) => {
    if (!isSignedIn) {
      setRedirectIntentScreen(screen);
      if (tab) setRedirectIntentTab(tab);
      setActiveScreen('SignIn');
      showToast("🔒 Security Shield: Please sign in to access " + screen);
    } else {
      setActiveScreen(screen);
      if (tab) setActiveDashboardTab(tab);
    }
  };

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
              profileCompleteness: profile.profile_completeness || 0,
              plan: profile.plan || (localStorage.getItem('jobmerge_user_plan') as any) || 'Free',
              usage: profile.usage || { resumesCreated: 1, atsScansUsed: 1, autoAppliesUsed: 5 }
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
      if (redirectIntentScreen) {
        setActiveScreen(redirectIntentScreen);
        if (redirectIntentTab) setActiveDashboardTab(redirectIntentTab);
        setRedirectIntentScreen(null);
        setRedirectIntentTab(null);
        showToast("🔒 Security Shield: Welcome back! Redirected to your destination.");
      } else {
        setActiveScreen('Dashboard');
        setActiveDashboardTab('FindJobs');
      }
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
          const mappedJobs: Job[] = data.map(dbJob => {
            const defaultSpecs = getRoleRealisticSpecs(dbJob.title, dbJob.category);
            return {
              id: dbJob.id,
              title: dbJob.title,
              company: dbJob.company,
              logoUrl: dbJob.logo_url || 'https://www.google.com/s2/favicons?sz=128&domain=' + dbJob.company.toLowerCase().replace(/\s+/g, '') + '.com',
              location: dbJob.location || 'Remote',
              workType: dbJob.work_type || 'Remote',
              jobType: dbJob.job_type || 'Full-time',
              salaryRange: (dbJob.salary_range && dbJob.salary_range !== '₹10L – ₹18L PA') ? dbJob.salary_range : defaultSpecs.salaryRange,
              experienceRequired: (dbJob.experience_required && dbJob.experience_required !== '0 – 2 Yrs') ? dbJob.experience_required : defaultSpecs.experienceRequired,
              postedTime: dbJob.posted_time || 'Recently',
              skills: dbJob.tags || [],
              description: dbJob.description || '',
              companyAbout: dbJob.company_about || `${dbJob.company} is a leading innovator in technology services.`,
              requirements: dbJob.requirements || [],
              benefits: dbJob.benefits || [],
              category: dbJob.category || 'Experienced',
              applyUrl: dbJob.original_url || '',
              viaSource: dbJob.via || (dbJob.company_about?.includes('via ') ? dbJob.company_about.match(/via [^.)]+/)?.[0] : undefined)
            };
          });

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
          profileCompleteness: profile.profile_completeness || 0,
          plan: profile.plan || (localStorage.getItem('jobmerge_user_plan') as any) || 'Free',
          usage: profile.usage || { resumesCreated: 1, atsScansUsed: 1, autoAppliesUsed: 5 }
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
      triggerAuthModal(
        "Continue with Google to Save Jobs",
        "Create your free account to bookmark jobs and track applications."
      );
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

  const handleApplyJob = (job: Job) => {
    if (!isSignedIn) {
      setPendingRedirectJob(job);
      triggerAuthModal(
        "Continue with Google to Apply Instantly",
        `Apply for ${job.title} at ${job.company} with 1-click quick apply.`,
        job
      );
      return;
    }
    // Check if already applied
    const alreadyApplied = applications.some(app => app.jobId === job.id);
    if (alreadyApplied) {
      showToast("You have already applied for this job!");
      return;
    }

    // Open External Redirect Security Shield Modal
    setPendingRedirectJob(job);
  };

  const handleConfirmExternalRedirect = async (applyUrl: string) => {
    if (!pendingRedirectJob) return;
    const job = pendingRedirectJob;
    setPendingRedirectJob(null);

    // Open external job post portal in a new secure tab with noopener,noreferrer
    window.open(applyUrl, '_blank', 'noopener,noreferrer');

    const newApp: JobApplication = {
      id: 'app-' + Math.random().toString(36).substring(2, 7),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      logoUrl: job.logoUrl,
      appliedDate: 'Today',
      status: 'Applied',
      notes: `Redirected securely to hiring portal on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
    };

    setApplications([newApp, ...applications]);
    
    let platform = "Company site";
    if (applyUrl.includes("linkedin.com")) platform = "LinkedIn";
    else if (applyUrl.includes("indeed.com")) platform = "Indeed";
    else if (applyUrl.includes("google.com")) platform = "Google Careers";
    else if (applyUrl.includes("microsoft.com")) platform = "Microsoft Careers";
    else if (applyUrl.includes("stripe.com")) platform = "Stripe Careers";

    showToast(`Safely opened ${platform} & logged application in pipeline!`);

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
        profile_completeness: nextProfile.profileCompleteness,
        plan: nextProfile.plan || 'Free',
        usage: nextProfile.usage
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
          isSignedIn={isSignedIn}
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
        !isSignedIn ? (
          <div className="flex-1 flex items-center justify-center min-h-[85vh] py-12 px-4 bg-[#f8f9fa] animate-fade-in">
            <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-gray-150 shadow-2xl text-center space-y-6">
              <div className="w-14 h-14 bg-indigo-50 text-[#353df6] rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-indigo-100">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Security Guard Active
                </div>
                <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">Authentication Required</h2>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  JobMerge Dashboard is protected. Please sign in to access live aggregated job listings, application tracking pipelines, and AI resume builder tools.
                </p>
              </div>
              <div className="pt-2 flex justify-center">
                <ClerkSignIn routing="hash" />
              </div>
            </div>
          </div>
        ) : (
        <div className="flex-1 flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#f8f9fa] relative">
          
          {/* Mobile Sticky Top Header */}
          <header className="lg:hidden sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-150 z-40 px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveScreen('Landing')}
                className="flex items-center gap-2 cursor-pointer focus:outline-none group"
              >
                <img src="/jobmerge-icon.png" alt="JobMerge Logo" className="h-7 w-auto object-contain" />
                <span className="font-extrabold text-lg text-gray-900 tracking-tight font-display font-black">JobMerge</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <img 
                alt={userProfile.name} 
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                src={userProfile.avatarUrl} 
              />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Mobile App-Style Bottom Navigation Bar */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 z-40 px-2 py-1.5 flex justify-around items-center shadow-lg">
            <button
              onClick={() => { setActiveDashboardTab('FindJobs'); setIsMobileMenuOpen(false); }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] ${
                activeDashboardTab === 'FindJobs' ? 'text-[#4f46e5] font-extrabold' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5">Jobs</span>
            </button>

            <button
              onClick={() => { setActiveDashboardTab('AIReview'); setIsMobileMenuOpen(false); }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] ${
                activeDashboardTab === 'AIReview' ? 'text-[#4f46e5] font-extrabold' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5">ATS Score</span>
            </button>

            <button
              onClick={() => { setActiveDashboardTab('Resume'); setIsMobileMenuOpen(false); }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] ${
                activeDashboardTab === 'Resume' ? 'text-[#4f46e5] font-extrabold' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5">Resume</span>
            </button>

            <button
              onClick={() => { setActiveDashboardTab('Saved'); setIsMobileMenuOpen(false); }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] relative ${
                activeDashboardTab === 'Saved' ? 'text-[#4f46e5] font-extrabold' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Bookmark className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5">Saved</span>
              {savedJobIds.length > 0 && (
                <span className="absolute top-0 right-2 bg-[#4f46e5] text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {savedJobIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveDashboardTab('AutoApply'); setIsMobileMenuOpen(false); }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] ${
                activeDashboardTab === 'AutoApply' ? 'text-[#4f46e5] font-extrabold' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-5 h-5 text-[#4f46e5]" />
              <span className="text-[10px] font-bold mt-0.5">Auto-Apply</span>
            </button>
          </nav>

          {/* Mobile Drawer Backdrop */}
          {isMobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Main Navigation Sidebar (Left Column - Mobile Drawer / Desktop Dock) */}
          <aside className={`bg-white border-r border-gray-150 flex flex-col justify-between shrink-0 select-none shadow-xs transition-all duration-300 ${
            isMobileMenuOpen 
              ? 'fixed inset-y-0 left-0 z-50 w-72 p-5 animate-slide-in'
              : 'hidden lg:flex lg:h-screen lg:fixed lg:top-0 lg:bottom-0 lg:left-0 z-30 ' + (isSidebarCollapsed ? 'lg:w-16 items-center py-5' : 'lg:w-64 p-5')
          }`}>
            {isSidebarCollapsed ? (
              /* COLLAPSED DOCK SIDEBAR MODE (Image 1 preference) */
              <div className="flex flex-col items-center justify-between h-full w-full">
                <div className="space-y-6 flex flex-col items-center">
                  {/* Top Logo Icon */}
                  <button 
                    onClick={() => setActiveScreen('Landing')}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                    title="JobMerge Home"
                  >
                    <img src="/jobmerge-icon.png" alt="JobMerge Logo" className="h-8 w-auto object-contain" />
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
                      <img src="/jobmerge-icon.png" alt="JobMerge Logo" className="h-8 w-auto object-contain group-hover:scale-105 transition-transform" />
                      <span className="font-extrabold text-xl text-gray-900 tracking-tight font-display font-black">JobMerge</span>
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
                      onClick={() => setActiveDashboardTab('Dashboard')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeDashboardTab === 'Dashboard'
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
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] font-extrabold shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4" />
                        <span>Find Jobs</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveDashboardTab('Profile')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        activeDashboardTab === 'Profile'
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5] font-extrabold shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </div>
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

                    {/* Free Plan Limits Widget Card */}
                    <div className="my-3 p-3.5 bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-indigo-100/50 border border-indigo-150 rounded-2xl space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider">Free Starter Plan</span>
                        <span className="px-2 py-0.5 bg-white border border-indigo-200 text-[#4f46e5] text-[9px] font-black rounded-full">Active</span>
                      </div>
                      <div className="space-y-1 text-[11px] font-bold text-gray-700">
                        <div className="flex justify-between">
                          <span>📄 Resume Limit:</span>
                          <strong className="text-gray-900">1 Generated</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>🚀 Auto Applications:</span>
                          <strong className="text-indigo-700">5 / 5 Used</strong>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPricingModal(true)}
                        className="w-full py-2 bg-[#4f46e5] hover:bg-[#3f37c9] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-98"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Upgrade to Pro</span>
                      </button>
                    </div>
                  </div>

                  {/* TOOLS Section */}
                  <div className="space-y-1 pt-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Tools</p>
                    
                    <button
                      onClick={() => setActiveDashboardTab('Salaries')}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Career Paths</span>
                    </button>
                  </div>
                </div>

                {/* Footer User Profile Block */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div 
                    onClick={() => setActiveDashboardTab('Profile')}
                    className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                  >
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
          <main className={`flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full flex flex-col space-y-6 transition-all duration-300 lg:overflow-y-auto pb-32 sm:pb-36 md:pb-10 lg:pb-8 ${
            isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}>
            
            {/* Top Navigation Header Bar */}
            <header className="hidden lg:flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-150/60">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight font-display flex items-center gap-2">
                  <span>Good Evening, {userProfile.name.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-xs font-bold text-gray-400 mt-0.5">Let's find the right opportunity for your next big move.</p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
                {/* Search Bar */}
                <div className="relative w-full sm:w-64 md:w-80 flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-xs focus-within:border-[#4f46e5] transition-all">
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
                <button 
                  onClick={() => setActiveDashboardTab('Profile')}
                  className="flex items-center gap-2.5 bg-white border border-gray-200 hover:border-indigo-300 rounded-full p-1.5 pr-3 shadow-xs cursor-pointer transition-colors"
                >
                  <img alt={userProfile.name} className="w-7 h-7 rounded-full object-cover" src={userProfile.avatarUrl} />
                  <div className="hidden sm:block text-left">
                    <p className="text-[11px] font-black text-gray-900 leading-tight">{userProfile.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 leading-tight">{userProfile.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </header>

            {/* Full Dashboard View */}
            {activeDashboardTab === 'Dashboard' && (
              <div className="space-y-6 flex-1 flex flex-col">
                
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
                </div>

                {/* Search and Filters Toolbar */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-150 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2.5">
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

                    <div className="flex items-center gap-2">
                      <button className="flex-1 sm:flex-none px-5 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all cursor-pointer">
                        Search
                      </button>

                      <button 
                        onClick={() => setIsAllFiltersOpen(!isAllFiltersOpen)}
                        className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Advanced</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs & Easy Apply */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs font-bold pt-1 border-t border-gray-100">
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
                    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
                      {['Recommended', 'Recent Jobs', 'Saved Jobs', 'Applied Jobs'].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setActiveFilterCategory(tab)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                            activeFilterCategory === tab 
                              ? 'bg-[#4f46e5] text-white shadow-md shadow-[#4f46e5]/20 ring-2 ring-[#4f46e5]/20 font-black' 
                              : 'text-gray-600 hover:bg-white hover:text-gray-900 font-bold'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Intelligence Strip (3 Equal Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Widget 1: Your Profile Overview */}
                  <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider font-display">Your Profile Overview</h3>
                      <button 
                        onClick={() => setActiveDashboardTab('AIReview')}
                        className="text-[10px] font-extrabold text-[#4f46e5] hover:underline cursor-pointer"
                      >
                        View full report →
                      </button>
                    </div>

                    <div onClick={() => setActiveDashboardTab('AIReview')} className="cursor-pointer">
                      <ProfileGaugeRing score={userProfile.profileCompleteness || 91} />
                    </div>

                    <button 
                      onClick={() => setActiveDashboardTab('Resume')}
                      className="p-3 bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-100 rounded-2xl flex items-center justify-between cursor-pointer transition-colors text-left w-full"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#4f46e5]" />
                        <div>
                          <p className="text-[11px] font-black text-gray-900">Improve your score</p>
                          <p className="text-[9px] font-bold text-gray-500">8 suggestions available</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#4f46e5]" />
                    </button>
                  </div>

                  {/* Widget 2: AI Recommendations */}
                  <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider font-display">AI Recommendations</h3>
                      <button 
                        onClick={() => {
                          setActiveFilterCategory('Recommended');
                          setActiveDashboardTab('FindJobs');
                        }}
                        className="text-[10px] font-extrabold text-[#4f46e5] hover:underline cursor-pointer"
                      >
                        View all →
                      </button>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col justify-center">
                      {[
                        { title: 'DevOps Engineer', company: 'IBM', location: 'Remote', match: 96 },
                        { title: 'Full Stack Developer', company: 'Zoho', location: 'Chennai', match: 93 },
                        { title: 'Software Engineer II', company: 'Swiggy', location: 'Bengaluru', match: 90 }
                      ].map((rec, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            setSearchQuery(rec.title);
                            setActiveDashboardTab('FindJobs');
                          }}
                          className="flex items-center justify-between p-2 hover:bg-indigo-50/50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-indigo-100"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-[#4f46e5]/10 rounded-xl flex items-center justify-center font-black text-xs text-[#4f46e5]">
                              {rec.company[0]}
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-900">{rec.title}</p>
                              <p className="text-[10px] text-gray-400 font-bold">{rec.company} • {rec.location}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            {rec.match}% Match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Widget 3: Market Insights */}
                  <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider font-display">Market Insights</h3>
                      <button 
                        onClick={() => setActiveDashboardTab('Salaries')}
                        className="text-[10px] font-extrabold text-[#4f46e5] hover:underline cursor-pointer"
                      >
                        View all →
                      </button>
                    </div>

                    <div 
                      onClick={() => setActiveDashboardTab('Salaries')}
                      className="space-y-1 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg. Salary (Your Role)</p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-gray-900 font-display">₹18.7 LPA</span>
                        <span className="text-[10px] font-black text-emerald-600">↑ 12% vs last year</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Skills in Demand</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['React.js', 'Node.js', 'TypeScript', 'AWS', 'SQL'].map(skill => (
                          <button 
                            key={skill} 
                            onClick={() => {
                              setSearchQuery(skill);
                              setActiveDashboardTab('FindJobs');
                            }}
                            className="px-2 py-0.5 bg-gray-50 border border-gray-200 hover:border-[#4f46e5] hover:text-[#4f46e5] rounded-xl text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full-Width 2-Column Job Cards Feed (Zero Empty Space) */}
                <div className="w-full space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 border border-gray-150 text-center space-y-3">
                      <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                      <h4 className="text-md font-bold font-display text-gray-900">No jobs found matching criteria</h4>
                      <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">Try resetting filters to explore all available job opportunities.</p>
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
                        const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
                        return (
                          <>
                            {/* Responsive 2-Column Card Grid filling full container width */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {paginatedJobs.map((job, idx) => {
                                const matchPct = job.aiMatchPercent || (95 - idx * 3);
                                return (
                                  <div key={job.id} className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs hover:shadow-md transition-all space-y-4 relative group flex flex-col justify-between">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-start gap-3.5 min-w-0">
                                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                          <img alt={job.company} className="w-8 h-8 object-contain" src={job.logoUrl} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-base font-black text-gray-900 font-display group-hover:text-[#4f46e5] transition-colors line-clamp-2 min-h-[2.5rem] leading-snug" title={job.title}>{job.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0 ${getPlatformInfo(job).badgeBg}`}>
                                              via {getPlatformInfo(job).name}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-500 font-semibold mt-0.5 truncate">
                                            {job.company} • {job.location} • {job.workType}
                                          </p>
                                          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-gray-600 mt-2.5">
                                            <span className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.salaryRange}</span>
                                            <span className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.jobType}</span>
                                            <span className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.experienceRequired}</span>
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-black">⚡ Easy Apply</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Circular Match Score Gauge Ring */}
                                      <div className="shrink-0">
                                        <CircularProgress percentage={matchPct} />
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-wrap gap-2">
                                      <span className="text-[10px] font-bold text-gray-400">Posted {job.postedTime}</span>
                                      <div className="flex items-center gap-2.5 sm:gap-3">
                                        <button 
                                          onClick={(e) => handleToggleBookmark(job.id, e)}
                                          className="p-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-gray-500 hover:text-[#4f46e5] cursor-pointer transition-colors shrink-0"
                                          title="Save Job"
                                        >
                                          <Bookmark className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => handleApplyJob(job)}
                                          className="px-4 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all shrink-0 active:scale-98"
                                        >
                                          <Zap className="w-3.5 h-3.5" />
                                          <span>Quick Apply</span>
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setSelectedJobForCoverLetter(job);
                                            setShowCoverLetterModal(true);
                                          }}
                                          className="px-3 py-2.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-[#4f46e5] text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0 flex items-center gap-1"
                                          title="Generate AI Cover Letter"
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                          <span>Cover Letter</span>
                                        </button>
                                        <button 
                                          onClick={() => setSelectedJobDetailModal(job)}
                                          className="px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0"
                                        >
                                          Details →
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Clean Modern Pagination Controls Bar (Full Width) */}
                            {filteredJobs.length > 0 && (
                              <div className="bg-white p-4 rounded-3xl border border-gray-150 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 w-full">
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                  <span>
                                    Showing <strong className="text-gray-900">{Math.min((currentPage - 1) * jobsPerPage + 1, filteredJobs.length)}</strong> to <strong className="text-gray-900">{Math.min(currentPage * jobsPerPage, filteredJobs.length)}</strong> of <strong className="text-gray-900">{filteredJobs.length}</strong> postings
                                  </span>
                                  <div className="hidden sm:flex items-center gap-1.5 border-l border-gray-200 pl-3">
                                    <span className="text-gray-400">Per page:</span>
                                    <select 
                                      value={jobsPerPage} 
                                      onChange={(e) => { setJobsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                      className="bg-transparent border border-gray-200 rounded-xl text-xs font-bold px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4f46e5] text-gray-800 cursor-pointer"
                                    >
                                      <option value={10}>10</option>
                                      <option value={20}>20</option>
                                      <option value={50}>50</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                  </button>

                                  <div className="flex items-center gap-1 px-1">
                                    {Array.from({ length: totalPages }).map((_, index) => {
                                      const pageNum = index + 1;
                                      if (totalPages > 5 && pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
                                        if (pageNum === 2 && currentPage > 3) return <span key={pageNum} className="text-gray-400 text-xs px-1">...</span>;
                                        if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key={pageNum} className="text-gray-400 text-xs px-1">...</span>;
                                        return null;
                                      }

                                      return (
                                        <button
                                          key={pageNum}
                                          onClick={() => setCurrentPage(pageNum)}
                                          className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                                            currentPage === pageNum
                                              ? 'bg-[#4f46e5] text-white shadow-xs'
                                              : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                                          }`}
                                        >
                                          {pageNum}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
                                  >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* User Profile Manager View */}
            {activeDashboardTab === 'Profile' && (
              <UserProfileManager
                userProfile={userProfile}
                onUpdateUserProfile={handleUpdateProfile}
                onOpenPricing={() => setShowPricingModal(true)}
                showToast={showToast}
              />
            )}
            {activeDashboardTab === 'FindJobs' && (
              <div className="space-y-6 flex-1 flex flex-col">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-display">Find Jobs & Opportunities</h1>
                  <p className="text-sm font-semibold text-gray-500">Explore, search, and apply to active positions matching your criteria.</p>
                </div>

                {/* Search and Filters Toolbar */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-150 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2.5">
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

                    <div className="flex items-center gap-2">
                      <button className="flex-1 sm:flex-none px-5 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all cursor-pointer">
                        Search
                      </button>

                      <button 
                        onClick={() => setIsAllFiltersOpen(!isAllFiltersOpen)}
                        className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Advanced</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs & Easy Apply */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs font-bold pt-1 border-t border-gray-100">
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
                    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
                      {['Recommended', 'Recent Jobs', 'Saved Jobs', 'Applied Jobs'].map(tab => (
                        <button 
                          key={tab}
                          onClick={() => setActiveFilterCategory(tab)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                            activeFilterCategory === tab 
                              ? 'bg-[#4f46e5] text-white shadow-md shadow-[#4f46e5]/20 ring-2 ring-[#4f46e5]/20 font-black' 
                              : 'text-gray-600 hover:bg-white hover:text-gray-900 font-bold'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Job Cards Feed Grid (Jobs Only) */}
                <div className="w-full space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 border border-gray-150 text-center space-y-3">
                      <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                      <h4 className="text-md font-bold font-display text-gray-900">No jobs found matching criteria</h4>
                      <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">Try resetting filters to explore all available job opportunities.</p>
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
                        const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
                        return (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {paginatedJobs.map((job, idx) => {
                                const matchPct = job.aiMatchPercent || (95 - idx * 3);
                                return (
                                  <div key={job.id} className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs hover:shadow-md transition-all space-y-4 relative group flex flex-col justify-between">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-start gap-3.5 min-w-0">
                                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                          <img alt={job.company} className="w-8 h-8 object-contain" src={job.logoUrl} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-base font-black text-gray-900 font-display group-hover:text-[#4f46e5] transition-colors line-clamp-2 min-h-[2.5rem] leading-snug" title={job.title}>{job.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0 ${getPlatformInfo(job).badgeBg}`}>
                                              via {getPlatformInfo(job).name}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-500 font-semibold mt-0.5 truncate">
                                            {job.company} • {job.location} • {job.workType}
                                          </p>
                                          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-gray-600 mt-2.5">
                                            <span className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.salaryRange}</span>
                                            <span className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.jobType}</span>
                                            <span className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.experienceRequired}</span>
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-black">⚡ Easy Apply</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="shrink-0">
                                        <CircularProgress percentage={matchPct} />
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-wrap gap-2">
                                      <span className="text-[10px] font-bold text-gray-400">Posted {job.postedTime}</span>
                                      <div className="flex items-center gap-2.5 sm:gap-3">
                                        <button 
                                          onClick={(e) => handleToggleBookmark(job.id, e)}
                                          className="p-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-gray-500 hover:text-[#4f46e5] cursor-pointer transition-colors shrink-0"
                                          title="Save Job"
                                        >
                                          <Bookmark className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => handleApplyJob(job)}
                                          className="px-4 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all shrink-0 active:scale-98"
                                        >
                                          <Zap className="w-3.5 h-3.5" />
                                          <span>Quick Apply</span>
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setSelectedJobForCoverLetter(job);
                                            setShowCoverLetterModal(true);
                                          }}
                                          className="px-3 py-2.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-[#4f46e5] text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0 flex items-center gap-1"
                                          title="Generate AI Cover Letter"
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                          <span>Cover Letter</span>
                                        </button>
                                        <button 
                                          onClick={() => setSelectedJobDetailModal(job)}
                                          className="px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0"
                                        >
                                          Details →
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Pagination */}
                            {filteredJobs.length > 0 && (
                              <div className="bg-white p-4 rounded-3xl border border-gray-150 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 w-full">
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                  <span>Showing <strong className="text-gray-900">{Math.min(filteredJobs.length, (currentPage - 1) * jobsPerPage + 1)}-{Math.min(filteredJobs.length, currentPage * jobsPerPage)}</strong> of <strong className="text-gray-900">{filteredJobs.length}</strong> Opportunities</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                  </button>

                                  <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 shadow-xs"
                                  >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
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
                    onOpenPricing={() => { setIsOnboardingPlanSelection(false); setShowPricingModal(true); }}
                  />
                </div>
              )}

              {/* Resume Builder View */}
              {activeDashboardTab === 'Resume' && (
                <ResumeBuilder 
                  userProfile={userProfile} 
                  onOpenPricing={() => { setIsOnboardingPlanSelection(false); setShowPricingModal(true); }}
                />
              )}

              {/* LinkedIn Auto-Applier Bot View */}
              {activeDashboardTab === 'AutoApply' && (
                <AutoApplyBot
                  userProfile={userProfile}
                  onOpenPricing={() => { setIsOnboardingPlanSelection(false); setShowPricingModal(true); }}
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
      )
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
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleToggleBookmark(selectedJobDetailModal.id, e)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    savedJobIds.includes(selectedJobDetailModal.id)
                      ? 'bg-[#4f46e5]/10 border border-[#4f46e5]/30 text-[#4f46e5]'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {savedJobIds.includes(selectedJobDetailModal.id) ? 'Saved' : 'Save Job'}
                </button>

                <button 
                  onClick={() => {
                    setSelectedJobForCoverLetter(selectedJobDetailModal);
                    setShowCoverLetterModal(true);
                  }}
                  className="px-3.5 py-2.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-[#4f46e5] text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>AI Cover Letter</span>
                </button>
              </div>

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

      {/* External Link Safety & Redirect Shield Modal */}
      <ExternalRedirectModal
        job={pendingRedirectJob}
        onClose={() => setPendingRedirectJob(null)}
        onConfirmRedirect={handleConfirmExternalRedirect}
      />

      {/* High-Conversion Auth Trigger Modal ("Continue with Google to Apply Instantly") */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 border border-gray-150 shadow-2xl space-y-5 relative overflow-hidden">
            {/* Decorative gradient blur */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-[#4f46e5]/25 via-purple-500/20 to-pink-500/15 rounded-full blur-2xl pointer-events-none" />
            
            {/* Close button */}
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2 text-center pt-1">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-[#4f46e5] shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight font-display">
                {authModalDetails.title}
              </h3>
              <p className="text-xs font-medium text-gray-500 leading-relaxed max-w-xs mx-auto">
                {authModalDetails.subtitle}
              </p>
            </div>

            {/* Target Job Quick Preview Badge */}
            {authModalDetails.targetJob && (
              <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl flex items-center gap-3">
                <img 
                  src={authModalDetails.targetJob.logoUrl} 
                  alt={authModalDetails.targetJob.company} 
                  className="w-9 h-9 rounded-xl object-contain bg-white p-1 border border-indigo-100 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/48/000000/briefcase.png'; }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase text-[#4f46e5] tracking-wider">Target Application</p>
                  <p className="text-xs font-extrabold text-gray-900 truncate">{authModalDetails.targetJob.title}</p>
                  <p className="text-[10px] font-bold text-gray-500 truncate">{authModalDetails.targetJob.company} • {authModalDetails.targetJob.location}</p>
                </div>
              </div>
            )}

            {/* Value Proposition Checklist */}
            <div className="space-y-2.5 bg-gray-50/80 p-4 rounded-2xl border border-gray-150 text-xs font-bold text-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black shrink-0">✓</div>
                <span>⚡ 1-Click Quick Apply across 50+ job portals</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black shrink-0">✓</div>
                <span>🤖 AI ATS Resume Score & Keyword Optimizer</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black shrink-0">✓</div>
                <span>🚀 Automated LinkedIn & Indeed Job Applier</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              <SignInButton mode="modal">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-3.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white rounded-2xl text-xs font-black shadow-md shadow-[#4f46e5]/20 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-98"
                >
                  <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google / Email</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>
              </SignInButton>

              <button 
                onClick={() => setShowAuthModal(false)}
                className="w-full py-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-center"
              >
                Continue browsing public jobs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing & Upgrade Modal Overlay */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelectPlan={handleSelectPlan}
        currentPlan={userProfile.plan || 'Free'}
        isOnboarding={isOnboardingPlanSelection}
      />

      {/* AI Cover Letter Studio Modal */}
      <CoverLetterGenerator
        isOpen={showCoverLetterModal}
        onClose={() => setShowCoverLetterModal(false)}
        targetJob={selectedJobForCoverLetter}
        userProfile={userProfile}
        showToast={showToast}
      />
    </div>
  );
}
