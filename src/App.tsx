import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Search, MapPin, SlidersHorizontal, BookOpen, Bookmark, 
  Briefcase, Award, ArrowRight, Check, CheckCircle2, DollarSign, 
  Compass, BarChart3, FileText, User, LogOut, ChevronRight, HelpCircle, 
  X, AlertCircle, BookmarkCheck, Heart, UserCheck, ShieldCheck, Clock,
  ChevronDown
} from 'lucide-react';
import { 
  ActiveScreen, Job, UserProfile, JobApplication, SalaryInsight 
} from './types';
import { INITIAL_JOBS, INITIAL_SALARY_INSIGHTS, DEFAULT_USER } from './data';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import SalaryInsights from './components/SalaryInsights';
import ApplicationTracker from './components/ApplicationTracker';
import AIResumeReview from './components/AIResumeReview';
import ResumeBuilder from './components/ResumeBuilder';
import { supabase } from './supabaseClient';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('Landing');
  const [activeDashboardTab, setActiveDashboardTab] = useState<'FindJobs' | 'Salaries' | 'AIReview' | 'Applications' | 'Saved' | 'Resume'>('FindJobs');
  
  // User Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);

  // Global Jobs list with dynamic ratings
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

  // Fetch jobs from Supabase on mount
  useEffect(() => {
    async function fetchJobs() {
      try {
        const { data, error } = await supabase
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
            category: dbJob.category || 'Experienced'
          }));

          setJobs(mappedJobs);
          setSelectedJob(mappedJobs[0]);
        }
      } catch (err) {
        console.error("Error fetching jobs from Supabase:", err);
      }
    }
    fetchJobs();
  }, []);

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
    setIsLoggedIn(false);
    setSavedJobIds([]);
    setApplications([]);
    setUserProfile(DEFAULT_USER);
    setActiveScreen('Landing');
    showToast("Successfully logged out.");
  };

  const handleLandingSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setLocationQuery(location);
    if (!isLoggedIn) {
      setIsLoggedIn(true); // Sign in automatically with demo profile for best prototype flow
    }
    setActiveScreen('Dashboard');
    setActiveDashboardTab('FindJobs');
  };

  const handleToggleBookmark = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter(id => id !== jobId));
      showToast("Removed from saved jobs.");
      if (isLoggedIn) {
        try {
          await supabase.from('saved_jobs').delete().eq('user_email', userProfile.email).eq('job_id', jobId);
        } catch (err) {
          console.error("Error removing bookmark in Supabase:", err);
        }
      }
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
      showToast("Added to saved jobs!");
      if (isLoggedIn) {
        try {
          await supabase.from('saved_jobs').insert({ user_email: userProfile.email, job_id: jobId });
        } catch (err) {
          console.error("Error saving bookmark in Supabase:", err);
        }
      }
    }
  };

  const handleApplyJob = async (job: Job) => {
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

    if (isLoggedIn) {
      try {
        await supabase.from('applications').insert({
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
    }
  };

  // Applications Pipeline Handlers
  const handleUpdateAppStatus = async (id: string, status: JobApplication['status']) => {
    setApplications(applications.map(app => app.id === id ? { ...app, status } : app));
    showToast(`Moved application stage to ${status}`);
    if (isLoggedIn) {
      try {
        await supabase.from('applications').update({ status }).eq('id', id);
      } catch (err) {
        console.error("Error updating application status in Supabase:", err);
      }
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
    if (isLoggedIn) {
      try {
        await supabase.from('applications').insert({
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
    }
  };

  const handleDeleteApp = async (id: string) => {
    setApplications(applications.filter(app => app.id !== id));
    showToast("Deleted application card.");
    if (isLoggedIn) {
      try {
        await supabase.from('applications').delete().eq('id', id);
      } catch (err) {
        console.error("Error deleting application in Supabase:", err);
      }
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    setApplications(applications.map(app => app.id === id ? { ...app, notes } : app));
    showToast("Notes saved.");
    if (isLoggedIn) {
      try {
        await supabase.from('applications').update({ notes }).eq('id', id);
      } catch (err) {
        console.error("Error updating application notes in Supabase:", err);
      }
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
    
    if (isLoggedIn) {
      try {
        await supabase.from('profiles').upsert({
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
            if (!isLoggedIn) {
              setIsLoggedIn(true);
            }
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
        <SignIn onNavigate={setActiveScreen} onLoginSuccess={handleLoginSuccess} />
      )}

      {activeScreen === 'SignUp' && (
        <SignUp onNavigate={setActiveScreen} onSignUpSuccess={handleSignUpSuccess} />
      )}

      {activeScreen === 'Dashboard' && (
        <div className="flex-1 flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-[#f8f9fa]">
          
          {/* Main Navigation Sidebar (Left Column) */}
          <aside className="w-full lg:w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 lg:h-screen lg:overflow-hidden">
            <div className="p-6 space-y-8">
              {/* Logo */}
              <button 
                onClick={() => setActiveScreen('Landing')}
                className="flex items-center gap-2 focus:outline-none cursor-pointer self-start group"
              >
                <div className="w-8 h-8 bg-[#4f46e5] rounded-xl flex items-center justify-center shadow-md shadow-[#4f46e5]/10 group-hover:scale-105 transition-transform">
                  <Sparkles className="text-white w-4.5 h-4.5" />
                </div>
                <span className="font-extrabold text-xl text-gray-900 tracking-tight font-display font-black">JobMerge</span>
              </button>

              {/* Navigation Actions Menu */}
              <nav className="space-y-1.5">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2.5">Menu</p>
                
                <button
                  onClick={() => setActiveDashboardTab('FindJobs')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDashboardTab === 'FindJobs'
                      ? 'bg-[#4f46e5]/5 text-[#4f46e5]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  id="tab-find-jobs"
                >
                  <Compass className="w-4 h-4" />
                  Find Jobs
                </button>

                <button
                  onClick={() => setActiveDashboardTab('Salaries')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDashboardTab === 'Salaries'
                      ? 'bg-[#4f46e5]/5 text-[#4f46e5]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  id="tab-salary"
                >
                  <BarChart3 className="w-4 h-4" />
                  Salary Insights
                </button>

                <button
                  onClick={() => setActiveDashboardTab('AIReview')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDashboardTab === 'AIReview'
                      ? 'bg-[#4f46e5]/5 text-[#4f46e5]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  id="tab-ai-review"
                >
                  <FileText className="w-4 h-4" />
                  AI Resume Review
                </button>

                <button
                  onClick={() => setActiveDashboardTab('Resume')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDashboardTab === 'Resume'
                      ? 'bg-[#4f46e5]/5 text-[#4f46e5]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  id="tab-resume-builder"
                >
                  <BookOpen className="w-4 h-4" />
                  Resume Builder
                </button>

                <button
                  onClick={() => setActiveDashboardTab('Applications')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDashboardTab === 'Applications'
                      ? 'bg-[#4f46e5]/5 text-[#4f46e5]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  id="tab-pipeline"
                >
                  <Briefcase className="w-4 h-4" />
                  Applications Pipeline
                </button>

                <button
                  onClick={() => setActiveDashboardTab('Saved')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDashboardTab === 'Saved'
                      ? 'bg-[#4f46e5]/5 text-[#4f46e5]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  id="tab-saved"
                >
                  <Bookmark className="w-4 h-4" />
                  Saved Jobs
                </button>
              </nav>
            </div>

            {/* User Profile Block at bottom */}
            <div className="p-6 border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img 
                    alt={userProfile.name} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-inner"
                    src={userProfile.avatarUrl} 
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-gray-900 truncate">{userProfile.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{userProfile.role}</p>
                </div>
              </div>

              {/* Profile completeness progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span className="text-gray-400 uppercase tracking-wider font-extrabold">Profile Status</span>
                  <span className="text-[#4f46e5] font-black">{userProfile.profileCompleteness}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-100/50">
                  <div 
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${userProfile.profileCompleteness}%` }}
                  ></div>
                </div>
                {userProfile.profileCompleteness < 100 && (
                  <button 
                    onClick={() => setActiveDashboardTab('AIReview')}
                    className="text-[9px] font-bold text-[#4f46e5] hover:underline flex items-center gap-0.5 cursor-pointer font-extrabold uppercase tracking-wide"
                  >
                    Complete with AI scanner <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Log out button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-red-50 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-500 hover:text-red-600 transition-colors cursor-pointer active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </aside>

          {/* Active Work Pane (Right / Center Column) */}
          <main className="flex-1 p-6 md:p-8 lg:overflow-hidden max-w-7xl mx-auto w-full lg:h-full flex flex-col">
            
            {/* Find Jobs View */}
            {activeDashboardTab === 'FindJobs' && (
              <div className="space-y-6 flex-1 flex flex-col lg:overflow-hidden h-full">
                
                {/* Search and Filters Strip */}
                 <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-premium space-y-4">
                   <div className="flex flex-col md:flex-row gap-3">
                     {/* Keywords Search */}
                     <div className="flex-1 flex items-center gap-2.5 bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-2.5 focus-within:bg-white focus-within:border-[#4f46e5]/30 focus-within:ring-2 focus-within:ring-[#4f46e5]/5 transition-all">
                       <Search className="text-gray-400 w-4 h-4 shrink-0" />
                       <input 
                         type="text"
                         placeholder="Job title, technical keyword or company name..."
                         className="w-full bg-transparent border-none text-[13px] font-semibold focus:outline-none focus:ring-0 placeholder-gray-400 text-gray-800"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                       />
                       {searchQuery && (
                         <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                           <X className="w-3.5 h-3.5" />
                         </button>
                       )}
                     </div>

                     {/* Location Input */}
                     <div className="md:w-64 flex items-center gap-2.5 bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-2.5 focus-within:bg-white focus-within:border-[#4f46e5]/30 focus-within:ring-2 focus-within:ring-[#4f46e5]/5 transition-all">
                       <MapPin className="text-gray-400 w-4 h-4 shrink-0" />
                       <input 
                         type="text"
                         placeholder="Location (city or Remote)"
                         className="w-full bg-transparent border-none text-[13px] font-semibold focus:outline-none focus:ring-0 placeholder-gray-400 text-gray-800"
                         value={locationQuery}
                         onChange={(e) => setLocationQuery(e.target.value)}
                       />
                       {locationQuery && (
                         <button onClick={() => setLocationQuery('')} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                           <X className="w-3.5 h-3.5" />
                         </button>
                       )}
                     </div>
                   </div>

                   {/* Category Tabs Selector */}
                   <div className="flex flex-wrap gap-1.5 pb-2 border-b border-gray-100">
                     {([
                       { id: 'All', label: 'All Jobs', icon: Briefcase },
                       { id: 'Students', label: 'Students', icon: Award },
                       { id: 'Freshers', label: 'Freshers', icon: Sparkles },
                       { id: 'Graduates', label: 'Graduates', icon: Compass },
                       { id: 'Experienced', label: 'Experienced', icon: ShieldCheck }
                     ] as const).map((cat) => {
                       const Icon = cat.icon;
                       const isActive = selectedCategory === cat.id;
                       return (
                         <button
                           key={cat.id}
                           onClick={() => setSelectedCategory(cat.id)}
                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                             isActive
                               ? 'bg-[#3f37c9] text-white shadow-md shadow-[#4f46e5]/15'
                               : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-100'
                           }`}
                         >
                           <Icon className="w-3.5 h-3.5" />
                           {cat.label}
                         </button>
                       );
                     })}
                   </div>

                    {/* Filter Selectors (LinkedIn-Style Horizontal Bar) */}
                    <div className="space-y-3 pt-1">
                      <div className="relative flex flex-wrap gap-2 items-center z-20">
                        {/* Date Posted Pill */}
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
                            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              selectedDatePosted !== 'all' 
                                ? 'bg-[#3f37c9]/5 border-[#3f37c9]/30 text-[#3f37c9] shadow-sm font-extrabold'
                                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                            }`}
                          >
                            <span>Date Posted</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                          </button>
                          {activeDropdown === 'date' && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)}></div>
                              <div className="absolute left-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl p-4 w-56 z-40 animate-fade-in space-y-3">
                                <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Show results posted within:</h4>
                                <div className="space-y-2">
                                  {[
                                    { id: 'all', label: 'Any time' },
                                    { id: '24h', label: 'Past 24 hours' },
                                    { id: 'week', label: 'Past week' },
                                    { id: 'month', label: 'Past month' }
                                  ].map(opt => (
                                    <label key={opt.id} className="flex items-center gap-2.5 text-xs text-gray-700 font-semibold cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name="date-posted" 
                                        className="text-[#4f46e5] focus:ring-[#4f46e5] rounded-full border-gray-300 w-3.5 h-3.5"
                                        checked={selectedDatePosted === opt.id}
                                        onChange={() => {
                                          setSelectedDatePosted(opt.id);
                                          setActiveDropdown(null);
                                        }}
                                      />
                                      <span>{opt.label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Workplace Type Pill */}
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === 'workplace' ? null : 'workplace')}
                            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              selectedWorkplaceTypes.length > 0
                                ? 'bg-[#3f37c9]/5 border-[#3f37c9]/30 text-[#3f37c9] shadow-sm font-extrabold'
                                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                            }`}
                          >
                            <span>Workplace type {selectedWorkplaceTypes.length > 0 && `(${selectedWorkplaceTypes.length})`}</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                          </button>
                          {activeDropdown === 'workplace' && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)}></div>
                              <div className="absolute left-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl p-4 w-60 z-40 animate-fade-in space-y-3">
                                <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Select options:</h4>
                                <div className="space-y-2">
                                  {['On-site', 'Hybrid', 'Remote'].map(type => {
                                    const counts = getFacetCounts();
                                    const count = counts.workplace[type as keyof typeof counts.workplace] || 0;
                                    return (
                                      <label key={type} className="flex items-center justify-between text-xs text-gray-700 font-semibold cursor-pointer">
                                        <div className="flex items-center gap-2.5">
                                          <input 
                                            type="checkbox" 
                                            className="text-[#4f46e5] focus:ring-[#4f46e5] rounded border-gray-300 w-3.5 h-3.5"
                                            checked={selectedWorkplaceTypes.includes(type)}
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
                                        <span className="text-[10px] text-gray-400 font-bold">({count})</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Experience Level Pill */}
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === 'experience' ? null : 'experience')}
                            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              selectedExperienceLevels.length > 0
                                ? 'bg-[#3f37c9]/5 border-[#3f37c9]/30 text-[#3f37c9] shadow-sm font-extrabold'
                                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                            }`}
                          >
                            <span>Experience level {selectedExperienceLevels.length > 0 && `(${selectedExperienceLevels.length})`}</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                          </button>
                          {activeDropdown === 'experience' && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)}></div>
                              <div className="absolute left-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl p-4 w-60 z-40 animate-fade-in space-y-3">
                                <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Select levels:</h4>
                                <div className="space-y-2">
                                  {['Internship', 'Entry level', 'Associate', 'Mid-Senior', 'Executive'].map(level => {
                                    const counts = getFacetCounts();
                                    const count = counts.experience[level as keyof typeof counts.experience] || 0;
                                    return (
                                      <label key={level} className="flex items-center justify-between text-xs text-gray-700 font-semibold cursor-pointer">
                                        <div className="flex items-center gap-2.5">
                                          <input 
                                            type="checkbox" 
                                            className="text-[#4f46e5] focus:ring-[#4f46e5] rounded border-gray-300 w-3.5 h-3.5"
                                            checked={selectedExperienceLevels.includes(level)}
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
                                        <span className="text-[10px] text-gray-400 font-bold">({count})</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Job Type Pill */}
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === 'jobtype' ? null : 'jobtype')}
                            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              selectedJobTypes.length > 0
                                ? 'bg-[#3f37c9]/5 border-[#3f37c9]/30 text-[#3f37c9] shadow-sm font-extrabold'
                                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                            }`}
                          >
                            <span>Job type {selectedJobTypes.length > 0 && `(${selectedJobTypes.length})`}</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                          </button>
                          {activeDropdown === 'jobtype' && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)}></div>
                              <div className="absolute left-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl p-4 w-60 z-40 animate-fade-in space-y-3">
                                <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Select types:</h4>
                                <div className="space-y-2">
                                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => {
                                    const counts = getFacetCounts();
                                    const count = counts.jobType[type as keyof typeof counts.jobType] || 0;
                                    return (
                                      <label key={type} className="flex items-center justify-between text-xs text-gray-700 font-semibold cursor-pointer">
                                        <div className="flex items-center gap-2.5">
                                          <input 
                                            type="checkbox" 
                                            className="text-[#4f46e5] focus:ring-[#4f46e5] rounded border-gray-300 w-3.5 h-3.5"
                                            checked={selectedJobTypes.includes(type)}
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
                                        <span className="text-[10px] text-gray-400 font-bold">({count})</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Easy Apply Toggle Button */}
                        <button
                          onClick={() => setEasyApplyOnly(!easyApplyOnly)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            easyApplyOnly
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm font-extrabold'
                              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Easy Apply</span>
                        </button>

                        {/* Company Selector Pill */}
                        <div className="relative">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === 'company' ? null : 'company')}
                            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              selectedCompanies.length > 0
                                ? 'bg-[#3f37c9]/5 border-[#3f37c9]/30 text-[#3f37c9] shadow-sm font-extrabold'
                                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                            }`}
                          >
                            <span>Company {selectedCompanies.length > 0 && `(${selectedCompanies.length})`}</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                          </button>
                          {activeDropdown === 'company' && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)}></div>
                              <div className="absolute left-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl p-4 w-64 z-40 animate-fade-in space-y-3 max-h-72 overflow-y-auto">
                                <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Select companies:</h4>
                                <div className="space-y-2">
                                  {Object.entries(getFacetCounts().company)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 10)
                                    .map(([companyName, count]) => (
                                      <label key={companyName} className="flex items-center justify-between text-xs text-gray-700 font-semibold cursor-pointer">
                                        <div className="flex items-center gap-2.5">
                                          <input 
                                            type="checkbox" 
                                            className="text-[#4f46e5] focus:ring-[#4f46e5] rounded border-gray-300 w-3.5 h-3.5"
                                            checked={selectedCompanies.includes(companyName)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedCompanies([...selectedCompanies, companyName]);
                                              } else {
                                                setSelectedCompanies(selectedCompanies.filter(c => c !== companyName));
                                              }
                                            }}
                                          />
                                          <span className="truncate max-w-[140px]">{companyName}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold">({count})</span>
                                      </label>
                                    ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* All Filters Button */}
                        <button
                          onClick={() => setIsAllFiltersOpen(true)}
                          className="ml-auto px-4 py-1.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-95"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>All Filters</span>
                        </button>
                      </div>

                      {/* Active Filter Summary Row */}
                      {(selectedDatePosted !== 'all' || selectedWorkplaceTypes.length > 0 || selectedExperienceLevels.length > 0 || selectedJobTypes.length > 0 || selectedCompanies.length > 0 || selectedSalaryRange !== 'all' || easyApplyOnly) && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-gray-100 items-center text-[10px] font-bold">
                          <span className="text-gray-400 font-extrabold uppercase tracking-wide mr-1">Active:</span>
                          
                          {selectedDatePosted !== 'all' && (
                            <span className="inline-flex items-center gap-1 bg-[#4f46e5]/5 border border-[#4f46e5]/10 text-[#4f46e5] px-2 py-0.5 rounded-md">
                              <span>Date: {selectedDatePosted === '24h' ? '24h' : selectedDatePosted === 'week' ? 'Week' : 'Month'}</span>
                              <button onClick={() => setSelectedDatePosted('all')} className="hover:text-red-500 cursor-pointer text-xs">✕</button>
                            </span>
                          )}
                          
                          {selectedWorkplaceTypes.map(wt => (
                            <span key={wt} className="inline-flex items-center gap-1 bg-[#4f46e5]/5 border border-[#4f46e5]/10 text-[#4f46e5] px-2 py-0.5 rounded-md">
                              <span>{wt}</span>
                              <button onClick={() => setSelectedWorkplaceTypes(selectedWorkplaceTypes.filter(x => x !== wt))} className="hover:text-red-500 cursor-pointer text-xs">✕</button>
                            </span>
                          ))}
                          
                          {selectedExperienceLevels.map(el => (
                            <span key={el} className="inline-flex items-center gap-1 bg-[#4f46e5]/5 border border-[#4f46e5]/10 text-[#4f46e5] px-2 py-0.5 rounded-md">
                              <span>{el}</span>
                              <button onClick={() => setSelectedExperienceLevels(selectedExperienceLevels.filter(x => x !== el))} className="hover:text-red-500 cursor-pointer text-xs">✕</button>
                            </span>
                          ))}
                          
                          {selectedJobTypes.map(jt => (
                            <span key={jt} className="inline-flex items-center gap-1 bg-[#4f46e5]/5 border border-[#4f46e5]/10 text-[#4f46e5] px-2 py-0.5 rounded-md">
                              <span>{jt}</span>
                              <button onClick={() => setSelectedJobTypes(selectedJobTypes.filter(x => x !== jt))} className="hover:text-red-500 cursor-pointer text-xs">✕</button>
                            </span>
                          ))}
                          
                          {selectedCompanies.map(co => (
                            <span key={co} className="inline-flex items-center gap-1 bg-[#4f46e5]/5 border border-[#4f46e5]/10 text-[#4f46e5] px-2 py-0.5 rounded-md">
                              <span>{co}</span>
                              <button onClick={() => setSelectedCompanies(selectedCompanies.filter(x => x !== co))} className="hover:text-red-500 cursor-pointer text-xs">✕</button>
                            </span>
                          ))}

                          {selectedSalaryRange !== 'all' && (
                            <span className="inline-flex items-center gap-1 bg-[#4f46e5]/5 border border-[#4f46e5]/10 text-[#4f46e5] px-2 py-0.5 rounded-md">
                              <span>Salary: {selectedSalaryRange === '10l' ? '₹10L+' : selectedSalaryRange === '15l' ? '₹15L+' : selectedSalaryRange === '20l' ? '₹20L+' : '₹30L+'}</span>
                              <button onClick={() => setSelectedSalaryRange('all')} className="hover:text-red-500 cursor-pointer text-xs">✕</button>
                            </span>
                          )}

                          {easyApplyOnly && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md">
                              <span>Easy Apply</span>
                              <button onClick={() => setEasyApplyOnly(false)} className="hover:text-red-500 cursor-pointer text-xs">✕</button>
                            </span>
                          )}

                          <button 
                            onClick={() => {
                              setSelectedDatePosted('all');
                              setSelectedWorkplaceTypes([]);
                              setSelectedExperienceLevels([]);
                              setSelectedJobTypes([]);
                              setSelectedCompanies([]);
                              setSelectedSalaryRange('all');
                              setEasyApplyOnly(false);
                              setSearchQuery('');
                              setLocationQuery('');
                            }}
                            className="text-red-500 hover:text-red-700 ml-1 hover:underline cursor-pointer transition-colors uppercase tracking-wider font-extrabold text-[9px]"
                          >
                            Clear all
                          </button>
                        </div>
                      )}

                      {/* Header Results Summary and Sorting */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                          Found {filteredJobs.length} matches
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                          <span className="text-gray-400 uppercase tracking-wide">Sort by:</span>
                          <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-black text-[#4f46e5] py-0 pl-1 pr-6 focus:ring-0 focus:outline-none cursor-pointer"
                          >
                            <option value="recent">Most Recent</option>
                            <option value="relevant">Most Relevant</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                               {/* Job Search Core Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 min-h-0 lg:overflow-hidden pb-4">
                    
                    {/* Left Column: Jobs List */}
                    <div className="lg:col-span-5 space-y-3.5 lg:h-full lg:overflow-y-auto pr-1 pb-4 scrollbar-thin">
                      {filteredJobs.length === 0 ? (
                        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-premium text-center space-y-3">
                          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                          <h4 className="text-md font-bold font-display text-gray-900">No postings match filters</h4>
                          <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                            Try modifying search keywords or resetting filters to check other opportunities.
                          </p>
                          <button 
                            onClick={() => {
                              setSearchQuery('');
                              setLocationQuery('');
                              setSelectedDatePosted('all');
                              setSelectedWorkplaceTypes([]);
                              setSelectedExperienceLevels([]);
                              setSelectedJobTypes([]);
                              setSelectedCompanies([]);
                              setSelectedSalaryRange('all');
                              setEasyApplyOnly(false);
                              setSelectedCategory('All');
                              setSortBy('recent');
                            }}
                            className="text-[#4f46e5] text-xs font-bold hover:underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
                      ) : isLoadingFilters ? (
                        // LinkedIn-style Premium Skeleton Cards
                        Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="p-5 rounded-3xl border border-gray-100 bg-white space-y-4 animate-pulse">
                            <div className="flex items-start gap-4">
                              <div className="w-11 h-11 bg-gray-200 rounded-2xl shrink-0"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-5 bg-gray-200 rounded-lg w-16"></div>
                              <div className="h-5 bg-gray-200 rounded-lg w-16"></div>
                              <div className="h-5 bg-gray-200 rounded-lg w-16"></div>
                            </div>
                            <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                              <div className="h-5 bg-gray-200 rounded-full w-24"></div>
                              <div className="h-3 bg-gray-200 rounded-md w-12"></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        filteredJobs.map((job) => {
                          const isSelected = selectedJob && job.id === selectedJob.id;
                          const isSaved = savedJobIds.includes(job.id);
                          
                          return (
                            <div
                              key={job.id}
                              onClick={() => setSelectedJob(job)}
                              className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-4 relative overflow-hidden group ${
                                isSelected 
                                  ? 'bg-white border-[#4f46e5] ring-2 ring-[#4f46e5]/10 shadow-premium shadow-glow-indigo' 
                                  : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                              }`}
                              id={`job-item-${job.id}`}
                            >
                              {/* Logo, title, saved state row */}
                              <div className="flex items-start gap-4">
                                <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                  <img 
                                    alt={job.company} 
                                    className="w-7 h-7 object-contain" 
                                    src={job.logoUrl} 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/48/000000/briefcase.png';
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <h3 className="text-sm font-extrabold text-gray-900 truncate group-hover:text-[#4f46e5] transition-colors">{job.title}</h3>
                                  <p className="text-xs font-semibold text-gray-400 truncate">{job.company} • {job.location}</p>
                                </div>
                                <button
                                  onClick={(e) => handleToggleBookmark(job.id, e)}
                                  className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                    isSaved 
                                      ? 'bg-[#4f46e5]/5 border-[#4f46e5]/20 text-[#4f46e5]' 
                                      : 'bg-white border-gray-150 hover:border-gray-200 text-gray-400'
                                  }`}
                                >
                                  <Bookmark className="w-4 h-4 fill-current stroke-[2.2]" />
                                </button>
                              </div>
 
                             {/* Job stats inline chips */}
                             <div className="flex flex-wrap gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                               <span className="px-2 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.workType}</span>
                               <span className="px-2 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.jobType}</span>
                               <span className="px-2 py-1 bg-gray-50 border border-gray-150 rounded-lg">{job.experienceRequired}</span>
                             </div>
 
                             {/* Dynamic AI Match score badge */}
                             {job.aiMatchPercent && (
                               <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                 <div className="inline-flex items-center gap-1 bg-[#4f46e5]/5 border border-[#4f46e5]/10 text-[#4f46e5] text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                                   <Sparkles className="w-3.5 h-3.5" />
                                   <span>{job.aiMatchPercent}% Match</span>
                                 </div>
                                 <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                   <Clock className="w-3 h-3" /> {job.postedTime}
                                 </span>
                               </div>
                             )}
                           </div>
                         );
                       })
                     )}
                   </div>
 
                   {/* Right Column: Detailed Pane */}
                   <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto pb-4">
                     {selectedJob ? (
                       <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6" id="job-detail-panel">
                         
                         {/* Header block with apply and bookmark */}
                         <div className="flex justify-between items-start gap-4">
                           <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                               <img 
                                 alt={selectedJob.company} 
                                 className="w-10 h-10 object-contain" 
                                 src={selectedJob.logoUrl} 
                                 onError={(e) => {
                                   (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/48/000000/briefcase.png';
                                 }}
                               />
                             </div>
                             <div>
                               <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{selectedJob.title}</h2>
                               <p className="text-sm font-semibold text-[#4f46e5] mt-1">{selectedJob.company}</p>
                               <p className="text-xs font-semibold text-gray-400 mt-0.5">{selectedJob.location} • {selectedJob.postedTime}</p>
                             </div>
                           </div>
 
                           <div className="flex gap-2">
                             <button
                               onClick={(e) => handleToggleBookmark(selectedJob.id, e)}
                               className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                 savedJobIds.includes(selectedJob.id) 
                                   ? 'bg-[#4f46e5]/5 border-[#4f46e5]/20 text-[#4f46e5]' 
                                   : 'bg-white border-gray-150 hover:border-gray-200 text-gray-400'
                               }`}
                             >
                               <Bookmark className="w-5 h-5 fill-current stroke-[2.2]" />
                             </button>
 
                             {/* Applied/Apply CTA */}
                             {applications.some(app => app.jobId === selectedJob.id) ? (
                               <button
                                 disabled
                                 className="px-6 py-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-bold text-sm flex items-center gap-1.5"
                               >
                                 <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                                 Applied
                               </button>
                             ) : (
                               <button
                                 onClick={() => handleApplyJob(selectedJob)}
                                 className="px-6 py-3 bg-[#4f46e5] text-white hover:bg-[#3f37c9] rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-[#4f46e5]/15 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                                 id="btn-apply-job"
                               >
                                 {selectedJob.applyUrl?.includes('linkedin.com') ? 'Apply via LinkedIn' : 
                                  selectedJob.applyUrl?.includes('indeed.com') ? 'Apply via Indeed' :
                                  selectedJob.applyUrl?.includes('google.com') ? 'Apply via Google' :
                                  selectedJob.applyUrl?.includes('microsoft.com') ? 'Apply via Microsoft' :
                                  selectedJob.applyUrl?.includes('stripe.com') ? 'Apply via Stripe' :
                                  'Apply on Company Site'}
                                 <ArrowRight className="w-4 h-4" />
                               </button>
                             )}
                           </div>
                         </div>
 
                         {/* Core features listing */}
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50/70 border border-gray-150 rounded-2xl">
                           <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Salary Budget</p>
                             <p className="text-xs font-extrabold text-gray-800 mt-1">{selectedJob.salaryRange}</p>
                           </div>
                           <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Experience</p>
                             <p className="text-xs font-extrabold text-gray-800 mt-1">{selectedJob.experienceRequired}</p>
                           </div>
                           <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Work environment</p>
                             <p className="text-xs font-extrabold text-[#4f46e5] mt-1">{selectedJob.workType}</p>
                           </div>
                           <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contract Type</p>
                             <p className="text-xs font-extrabold text-gray-800 mt-1">{selectedJob.jobType}</p>
                           </div>
                         </div>
 
                         {/* Gemini Alignment Explanation Panel */}
                         {selectedJob.aiMatchPercent && (
                           <div className="bg-[#4f46e5]/5 border border-[#4f46e5]/10 p-5 rounded-3xl space-y-3 relative overflow-hidden">
                             {/* Accent graphics background glow */}
                             <div className="absolute top-0 right-0 w-32 h-32 bg-[#4f46e5]/10 rounded-full blur-2xl"></div>
                             
                             <div className="flex items-center justify-between relative z-10">
                               <div className="inline-flex items-center gap-1.5 bg-[#4f46e5]/10 border border-[#4f46e5]/20 text-[#4f46e5] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                 <Sparkles className="w-3.5 h-3.5" />
                                 Gemini Match alignment: {selectedJob.aiMatchPercent}%
                               </div>
                               <span className="text-[10px] text-[#4f46e5] font-bold flex items-center gap-1">
                                 <Award className="w-3.5 h-3.5" /> Verified fit
                               </span>
                             </div>
 
                             <p className="text-xs font-semibold text-gray-700 leading-relaxed relative z-10">
                               {selectedJob.aiMatchExplanation || `This Software Engineering role matches your core experience perfectly based on your registered skills: ${userProfile.skills.slice(0, 4).join(', ')}. Your profile aligns closely with the company's technology stack.`}
                             </p>
                           </div>
                         )}
 
                         {/* About Company */}
                         <div className="space-y-2.5">
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About the company</h4>
                           <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                             {selectedJob.companyAbout}
                           </p>
                         </div>
 
                         {/* Description */}
                         <div className="space-y-2.5">
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job description</h4>
                           <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                             {selectedJob.description}
                           </p>
                         </div>
 
                         {/* Requirements list */}
                         <div className="space-y-3">
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Requirements</h4>
                           <ul className="space-y-2.5">
                             {selectedJob.requirements.map((req, idx) => (
                               <li key={idx} className="flex gap-2.5 items-start">
                                 <div className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] shrink-0 mt-1.5"></div>
                                 <span className="text-xs text-gray-600 font-semibold leading-relaxed">{req}</span>
                               </li>
                             ))}
                           </ul>
                         </div>
 
                         {/* Benefits list */}
                         <div className="space-y-3">
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Benefits</h4>
                           <ul className="space-y-2.5">
                             {selectedJob.benefits.map((ben, idx) => (
                               <li key={idx} className="flex gap-2.5 items-start">
                                 <div className="w-4 h-4 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                                   <Check className="w-2.5 h-2.5 stroke-[3]" />
                                 </div>
                                 <span className="text-xs text-gray-600 font-semibold leading-relaxed">{ben}</span>
                               </li>
                             ))}
                           </ul>
                         </div>
 
                         {/* Technical Stack Chips */}
                         <div className="space-y-3 pt-2">
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Technical Stack</h4>
                           <div className="flex flex-wrap gap-1.5">
                             {selectedJob.skills.map((skill) => (
                               <span 
                                 key={skill}
                                 className="px-3 py-1.5 bg-gray-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-600"
                               >
                                 {skill}
                               </span>
                             ))}
                           </div>
                         </div>
 
                       </div>
                     ) : (
                       <div className="bg-white rounded-3xl p-10 border border-gray-150 text-center space-y-4 h-96 flex flex-col items-center justify-center">
                         <Briefcase className="w-10 h-10 text-gray-300" />
                         <h3 className="text-lg font-bold font-display text-gray-900">Select a Job</h3>
                         <p className="text-xs text-gray-400 font-semibold max-w-xs leading-relaxed">
                           Click on any opportunity card in the listings list to review complete details, requirements, and AI alignment explanations.
                         </p>
                       </div>
                     )}
                   </div>
                 </div>          </div>
            )}

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

            {/* Applications Kanban Tracker View */}
            {activeDashboardTab === 'Applications' && (
              <div className="flex-1 lg:overflow-y-auto pb-6">
                <ApplicationTracker 
                  applications={applications} 
                  onUpdateStatus={handleUpdateAppStatus} 
                  onAddApplication={handleAddManualApp} 
                  onDeleteApplication={handleDeleteApp} 
                  onUpdateNotes={handleUpdateNotes}
                  availableJobs={jobs}
                />
              </div>
            )}

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

    </div>
  );
}
