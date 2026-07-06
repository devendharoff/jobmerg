import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Search, MapPin, SlidersHorizontal, BookOpen, Bookmark, 
  Briefcase, Award, ArrowRight, Check, CheckCircle2, DollarSign, 
  Compass, BarChart3, FileText, User, LogOut, ChevronRight, HelpCircle, 
  X, AlertCircle, BookmarkCheck, Heart, UserCheck, ShieldCheck, Clock
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
  const [selectedWorkType, setSelectedWorkType] = useState<string>('All');
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Students' | 'Freshers' | 'Graduates' | 'Experienced'>('All');

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


  // Filter Jobs list
  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;

    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = 
      job.location.toLowerCase().includes(locationQuery.toLowerCase());

    const matchesWorkType = selectedWorkType === 'All' || job.workType === selectedWorkType;
    const matchesJobType = selectedJobType === 'All' || job.jobType === selectedJobType;

    return matchesCategory && matchesSearch && matchesLocation && matchesWorkType && matchesJobType;
  });

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
          <aside className="w-full lg:w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 lg:h-screen lg:overflow-y-auto">
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

                   {/* Filter Selectors */}
                   <div className="flex flex-wrap gap-2.5 pt-1 items-center">
                     <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 mr-1 shrink-0" />
                     
                     {/* Work Type selector */}
                     <div className="flex gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1 text-[10px] font-bold">
                       {['All', 'Remote', 'Hybrid', 'On-site'].map((type) => (
                         <button
                           key={type}
                           onClick={() => setSelectedWorkType(type)}
                           className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                             selectedWorkType === type 
                               ? 'bg-white text-[#4f46e5] shadow-sm font-extrabold' 
                               : 'text-gray-500 hover:text-gray-800'
                           }`}
                         >
                           {type}
                         </button>
                       ))}
                     </div>

                     {/* Job Type selector */}
                     <div className="flex gap-1 bg-gray-50 border border-gray-100 rounded-xl p-1 text-[10px] font-bold">
                       {['All', 'Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                         <button
                           key={type}
                           onClick={() => setSelectedJobType(type)}
                           className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                             selectedJobType === type 
                               ? 'bg-white text-[#4f46e5] shadow-sm font-extrabold' 
                               : 'text-gray-500 hover:text-gray-800'
                           }`}
                         >
                           {type}
                         </button>
                       ))}
                     </div>

                     <span className="text-[11px] text-gray-400 font-bold ml-auto uppercase tracking-wide">
                       Found {filteredJobs.length} matches
                     </span>
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
                              setSelectedWorkType('All');
                              setSelectedJobType('All');
                              setSelectedCategory('All');
                            }}
                            className="text-[#4f46e5] text-xs font-bold hover:underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
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

    </div>
  );
}
