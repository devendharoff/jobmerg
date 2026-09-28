import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, RefreshCw, Terminal, CheckCircle2, AlertCircle, 
  Sparkles, Sliders, User, ShieldCheck, UserCheck, Phone, DollarSign, Globe, Lock, Bookmark, Cpu,
  Search, MapPin, FileSpreadsheet, ChevronRight, HelpCircle, ArrowRight, ShieldAlert, Check
} from 'lucide-react';
import { JobApplication, UserProfile, PLAN_LIMITS } from '../types';

interface AutoApplyBotProps {
  userProfile?: UserProfile;
  onSyncApplications: (newApps: JobApplication[]) => void;
  onOpenPricing?: () => void;
}

export type TargetPortal = 'LinkedIn' | 'Indeed' | 'Naukri' | 'Unstop' | 'Wellfound' | 'ZipRecruiter' | 'Glassdoor';

const PRESET_TEMPLATES: Array<{
  id: string;
  name: string;
  desc: string;
  terms: string;
  location: string;
  datePosted: string;
  portal: TargetPortal;
}> = [
  {
    id: 'fullstack-us',
    name: '🔥 Full-Stack Dev (US Remote)',
    desc: 'Target High-Yield Remote Senior & Full-Stack roles',
    terms: 'Software Engineer, Full Stack Developer, React Developer, Node.js Developer',
    location: 'United States',
    datePosted: 'Past week',
    portal: 'LinkedIn'
  },
  {
    id: 'entry-tech',
    name: '🎓 Tech Graduate / Entry-Level',
    desc: 'Focus on Entry, Associate & Junior engineering openings',
    terms: 'Graduate Software Engineer, Junior Frontend Developer, Associate Developer',
    location: 'United States',
    datePosted: 'Past 24 hours',
    portal: 'Indeed'
  },
  {
    id: 'naukri-tech-in',
    name: '🇮🇳 India MNCs & Tech Hubs',
    desc: 'Naukri FastApply for Bangalore, Hyderabad, Pune & Remote',
    terms: 'Software Engineer, Java Developer, React Developer, Backend Engineer, Full Stack',
    location: 'India',
    datePosted: 'Past week',
    portal: 'Naukri'
  },
  {
    id: 'unstop-campus',
    name: '⚡ Off-Campus & Internships',
    desc: 'Unstop drives for SDE Interns, Graduate Trainees & Freshers',
    terms: 'Software Engineer Intern, SDE Intern, Graduate Engineer Trainee, Junior Developer',
    location: 'India (Remote/Hybrid)',
    datePosted: 'Past 3 days',
    portal: 'Unstop'
  },
  {
    id: 'wellfound-startup',
    name: '🚀 High-Growth Startup Roles',
    desc: 'AngelList & Wellfound 1-Click Apply for founding tech roles',
    terms: 'Founding Engineer, Fullstack Engineer, Lead Frontend Engineer, AI Engineer',
    location: 'Remote Worldwide',
    datePosted: 'Past week',
    portal: 'Wellfound'
  },
  {
    id: 'aiml-data',
    name: '🤖 AI, ML & Data Science',
    desc: 'Target Machine Learning, LLM & Data Science positions',
    terms: 'Machine Learning Engineer, Data Scientist, AI Research Engineer, Python Developer',
    location: 'Remote / Hybrid',
    datePosted: 'Past week',
    portal: 'LinkedIn'
  },
  {
    id: 'cloud-devops',
    name: '☁️ Cloud & DevOps SRE',
    desc: 'Infrastructure, Kubernetes, AWS & Cloud Architecture',
    terms: 'DevOps Engineer, Site Reliability Engineer, SRE, Cloud Architect, AWS Specialist',
    location: 'United States / Remote',
    datePosted: 'Past 24 hours',
    portal: 'Indeed'
  },
  {
    id: 'design-uiux',
    name: '🎨 UI/UX Product Designer',
    desc: 'Target Product & Visual Design positions',
    terms: 'Product Designer, UI/UX Designer, UX Engineer',
    location: 'Remote',
    datePosted: 'Past month',
    portal: 'Glassdoor'
  }
];

export default function AutoApplyBot({ userProfile, onSyncApplications, onOpenPricing }: AutoApplyBotProps) {
  // Navigation wizard steps: 1. Setup Persona & Credentials -> 2. Job Targets -> 3. Live Bot Console
  const [activeStep, setActiveStep] = useState<'profile' | 'targets' | 'console'>('targets');

  // Target Portal Selection State ('LinkedIn' | 'Indeed' | 'Naukri' | 'Unstop' | 'Wellfound' | 'ZipRecruiter' | 'Glassdoor')
  const [targetPortal, setTargetPortal] = useState<TargetPortal>(() => {
    return (localStorage.getItem('jobmerge_target_portal') as any) || 'LinkedIn';
  });

  // Search & Bot Parameters State
  const [searchTerms, setSearchTerms] = useState<string>('Software Engineer, Full Stack Developer, React Developer');
  const [searchLocation, setSearchLocation] = useState<string>('United States');
  const [easyApplyOnly, setEasyApplyOnly] = useState<boolean>(true);
  const [datePosted, setDatePosted] = useState<string>('Past week');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fullstack-us');

  // Safety & Limits state
  const [switchNumber, setSwitchNumber] = useState<number>(30);
  const [totalApplicationsLimit, setTotalApplicationsLimit] = useState<number>(30);
  const [showChromeWindow, setShowChromeWindow] = useState<boolean>(true);

  // Load saved persona answers from localStorage
  const loadSavedPersona = () => {
    try {
      const saved = localStorage.getItem('jobmerge_auto_apply_persona');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };
  const savedPersona = loadSavedPersona();

  // User Profile & Answer Form State
  const [firstName, setFirstName] = useState<string>(savedPersona?.firstName || userProfile?.name?.split(' ')[0] || 'Sai');
  const [middleName, setMiddleName] = useState<string>(savedPersona?.middleName || '');
  const [lastName, setLastName] = useState<string>(savedPersona?.lastName || userProfile?.name?.split(' ').slice(1).join(' ') || 'Vignesh');
  const [phoneNumber, setPhoneNumber] = useState<string>(savedPersona?.phoneNumber || '9876543210');
  const [currentCity, setCurrentCity] = useState<string>(savedPersona?.currentCity || 'San Francisco, CA');
  const [experienceYears, setExperienceYears] = useState<string>(savedPersona?.experienceYears || userProfile?.experienceYears?.toString() || '3');
  const [requireVisa, setRequireVisa] = useState<string>(savedPersona?.requireVisa || 'No');
  const [websiteUrl, setWebsiteUrl] = useState<string>(savedPersona?.websiteUrl || 'https://github.com/example');
  const [linkedinUrl, setLinkedinUrl] = useState<string>(savedPersona?.linkedinUrl || 'https://www.linkedin.com/in/example');
  const [desiredSalary, setDesiredSalary] = useState<string>(savedPersona?.desiredSalary || '1200000');

  const [resumeBase64, setResumeBase64] = useState<string>(() => {
    return localStorage.getItem('jobmerge_auto_apply_resume_base64') || '';
  });

  // Autosave persona answers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jobmerge_auto_apply_persona', JSON.stringify({
        firstName, middleName, lastName, phoneNumber, currentCity,
        experienceYears, requireVisa, websiteUrl, linkedinUrl, desiredSalary
      }));
    } catch (e) {}
  }, [firstName, middleName, lastName, phoneNumber, currentCity, experienceYears, requireVisa, websiteUrl, linkedinUrl, desiredSalary]);

  // Execution & Output State
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [botLogs, setBotLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ applied: 0, failed: 0, skipped: 0 });
  const [historyJobs, setHistoryJobs] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Toast feedback state
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const consoleContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [resumeInfo, setResumeInfo] = useState<{ exists: boolean; size: number } | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false);
  const [screenshotTimestamp, setScreenshotTimestamp] = useState<number>(Date.now());
  const [executionReport, setExecutionReport] = useState<{ applied: any[]; failed: any[]; startTime: string; endTime: string } | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isFetchingReport, setIsFetchingReport] = useState<boolean>(false);
  const prevRunningRef = useRef<boolean>(false);

  const fetchExecutionReport = async () => {
    setIsFetchingReport(true);
    try {
      const res = await fetch('/api/auto-apply/report');
      if (res.ok) {
        const data = await res.json();
        setExecutionReport(data);
        setShowReportModal(true);
      }
    } catch (err) {
      console.error("Failed to load run report:", err);
    } finally {
      setIsFetchingReport(false);
    }
  };

  useEffect(() => {
    if (!isBotRunning) return;
    const interval = setInterval(() => {
      setScreenshotTimestamp(Date.now());
    }, 2000);
    return () => clearInterval(interval);
  }, [isBotRunning]);

  const fetchResumeInfo = async () => {
    try {
      const res = await fetch('/api/auto-apply/check-resume');
      if (res.ok) {
        const data = await res.json();
        setResumeInfo(data);
      }
    } catch (err) {
      console.error("Failed to check bot resume status:", err);
    }
  };

  useEffect(() => {
    fetchResumeInfo();
  }, []);

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('❌ Please upload a PDF resume file.');
      return;
    }

    setIsUploadingResume(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        setResumeBase64(base64Data);
        localStorage.setItem('jobmerge_auto_apply_resume_base64', base64Data);

        const res = await fetch('/api/auto-apply/upload-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeBase64: base64Data, filename: file.name }),
        });

        if (res.ok) {
          showToast('✅ Resume successfully synced with the Auto-Apply bot!');
          fetchResumeInfo();
        } else {
          const data = await res.json();
          showToast(`❌ Failed to save resume: ${data.error || 'Server error'}`);
        }
      } catch (err) {
        showToast('❌ Failed to upload resume.');
      } finally {
        setIsUploadingResume(false);
      }
    };
  };

  const getBotCurrentStatus = () => {
    if (!isBotRunning) {
      return { 
        text: 'Engine Stopped', 
        subText: 'Launch the automation engine to start scanning positions', 
        type: 'idle',
        phase: 0
      };
    }
    
    for (let i = botLogs.length - 1; i >= 0; i--) {
      const log = botLogs[i];
      
      if (log.includes('Sleeping for 10 min')) {
        return { 
          text: 'Rate Limit Cool-down', 
          subText: 'Sleeping for 10 minutes to protect your LinkedIn profile from rate flags', 
          type: 'sleep',
          phase: 5
        };
      }
      if (log.includes('Waiting up to 120 seconds')) {
        return { 
          text: 'Manual Credentials Login', 
          subText: 'Waiting for manual login and CAPTCHA validation in the Chrome browser window', 
          type: 'login',
          phase: 2
        };
      }
      if (log.includes('Seems like login attempt failed')) {
        return { 
          text: 'Manual Login Pending', 
          subText: 'Verification failed or pending. Please log in directly in Chrome browser.', 
          type: 'login',
          phase: 2
        };
      }
      if (log.includes('Login successful')) {
        return { 
          text: 'Authenticated Session', 
          subText: 'Successfully detected logged-in session feed.', 
          type: 'active',
          phase: 3
        };
      }
      if (log.includes('Now searching for')) {
        const match = log.match(/>>>> Now searching for "(.*?)" <<<</);
        return { 
          text: 'Searching Positions', 
          subText: `Searching for: "${match ? match[1] : 'Software Engineer'}" on LinkedIn`, 
          type: 'search',
          phase: 3
        };
      }
      if (log.includes('Setting search location as')) {
        const match = log.match(/Setting search location as:\s*"(.*?)"/);
        return { 
          text: 'Filtering Jobs', 
          subText: `Setting location parameter to: "${match ? match[1] : 'United States'}"`, 
          type: 'search',
          phase: 3
        };
      }
      if (log.includes('Applying for')) {
        const match = log.match(/Applying for\s*"(.*?)"/);
        return { 
          text: 'Applying to Position', 
          subText: `Processing 'Easy Apply' application modal for: "${match ? match[1] : 'Job Post'}"`, 
          type: 'apply',
          phase: 4
        };
      }
      if (log.includes('Answering question')) {
        const match = log.match(/Answering question\s*"(.*?)"/);
        return { 
          text: 'Form Auto-Completion', 
          subText: `Answering screening question: "${match ? match[1] : 'details'}"`, 
          type: 'apply',
          phase: 4
        };
      }
      if (log.includes('Clicking next')) {
        return { 
          text: 'Form Auto-Completion', 
          subText: 'Navigating forms pages and uploading resume attachment...', 
          type: 'apply',
          phase: 4
        };
      }
      if (log.includes('Submitting application')) {
        return { 
          text: 'Submitting Form', 
          subText: 'Clicking submit button to finalize job application', 
          type: 'submit',
          phase: 4
        };
      }
    }
    
    return { 
      text: 'Initializing Chrome Engine', 
      subText: 'Launching clean Google Chrome browser window with anti-bot detection flags...', 
      type: 'init',
      phase: 1
    };
  };

  // Auto-scroll logs terminal only if user is already near the bottom
  useEffect(() => {
    const container = consoleContainerRef.current;
    if (container) {
      const threshold = 100; // px threshold to detect if user is near bottom
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [botLogs]);

  // Poll status periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/auto-apply/status');
        if (res.ok) {
          const data = await res.json();
          const wasRunning = prevRunningRef.current;
          setIsBotRunning(data.isRunning);
          
          if (wasRunning && !data.isRunning) {
            fetchExecutionReport();
            fetchHistory();
          }
          prevRunningRef.current = data.isRunning;

          setBotLogs(data.logs || []);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bot status:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Listen to live stream updates via Server-Sent Events (SSE)
  useEffect(() => {
    const eventSource = new EventSource('/api/auto-apply/live-stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setIsBotRunning(data.status === 'Applying' || data.status === 'Active');
        
        if (data.log) {
          setBotLogs(prev => {
            if (prev.includes(data.log)) return prev;
            const updated = [...prev, data.log];
            return updated.slice(-500);
          });
        }
        
        if (data.applied !== undefined || data.failed !== undefined) {
          setStats(prev => ({
            applied: data.applied !== undefined ? data.applied : prev.applied,
            failed: data.failed !== undefined ? data.failed : prev.failed,
            skipped: prev.skipped
          }));
        }
      } catch (err) {
        console.error('Error parsing live stream event:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Fetch applied history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/auto-apply/history');
      if (res.ok) {
        const jobs = await res.json();
        setHistoryJobs(jobs);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setSelectedPresetId(preset.id);
    setSearchTerms(preset.terms);
    setSearchLocation(preset.location);
    setDatePosted(preset.datePosted);
    if (preset.portal) {
      setTargetPortal(preset.portal);
      localStorage.setItem('jobmerge_target_portal', preset.portal);
    }
    showToast(`Loaded strategy preset: ${preset.name} (${preset.portal} target)`);
  };

  const handleStartBot = async (e: React.FormEvent) => {
    e.preventDefault();

    const plan = userProfile?.plan || 'Free';
    const usage = userProfile?.usage || { resumesCreated: 1, atsScansUsed: 1, autoAppliesUsed: 5 };
    const limit = PLAN_LIMITS[plan].maxAutoApplies;

    if (usage.autoAppliesUsed >= limit) {
      showToast(`🔒 Plan Limit Reached: You have used all ${limit} auto-applications included in your ${plan} Plan. Upgrade to Pro (100 apps) or Accelerator (Unlimited) to continue!`);
      onOpenPricing?.();
      return;
    }

    // Save target portal to localStorage
    localStorage.setItem('jobmerge_target_portal', targetPortal);

    // Dispatch custom event to notify local Chrome Extension to start automation
    window.dispatchEvent(new CustomEvent('JOBMERGE_START_BOT', {
      detail: {
        keyword: searchTerms || 'Software Engineer',
        location: searchLocation || 'United States',
        limit: totalApplicationsLimit,
        portal: targetPortal
      }
    }));

    try {
      const termsArray = searchTerms.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/auto-apply/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal: targetPortal,
          searchTerms: termsArray.length > 0 ? termsArray : ['Software Engineer'],
          searchLocation: searchLocation || 'United States',
          easyApplyOnly,
          datePosted,
          showChromeWindow,
          safetyConfig: { switchNumber, totalApplicationsLimit },
          userInfo: {
            firstName,
            middleName,
            lastName,
            phoneNumber,
            currentCity,
            experienceYears,
            requireVisa,
            websiteUrl,
            linkedinUrl,
            desiredSalary
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setIsBotRunning(true);
        setActiveStep('console');
        showToast('🚀 Automation started! Check live terminal below.');
      } else {
        alert(data.error || 'Failed to start LinkedIn Auto Applier');
      }
    } catch (err: any) {
      alert('Error connecting to backend server: ' + err.message);
    }
  };

  const handleStopBot = async () => {
    // Dispatch custom event to notify local Chrome Extension to stop automation
    window.dispatchEvent(new CustomEvent('JOBMERGE_STOP_BOT'));

    try {
      const res = await fetch('/api/auto-apply/stop', { method: 'POST' });
      const data = await res.json();
      setIsBotRunning(false);
      showToast('⏹️ Automation stopped by user.');
    } catch (err: any) {
      alert('Failed to stop bot: ' + err.message);
    }
  };

  const handleSyncToTracker = () => {
    if (historyJobs.length === 0) {
      alert('No applied jobs recorded yet.');
      return;
    }

    const formattedApps: JobApplication[] = historyJobs.map(job => ({
      id: 'linkedIn-' + (job.Job_ID || Math.random().toString(36).substring(2, 8)),
      jobId: job.Job_ID || 'linkedin-' + Math.random().toString(36).substring(2, 6),
      jobTitle: job.Title || 'Applied Role',
      company: job.Company || 'LinkedIn Employer',
      logoUrl: `https://logo.clearbit.com/${(job.Company || 'linkedin').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      appliedDate: job.Date_Applied ? job.Date_Applied.split(' ')[0] : new Date().toISOString().split('T')[0],
      status: 'Applied',
      notes: `Applied automatically via LinkedIn Auto-Applier. Job Link: ${job.Job_Link || 'N/A'}`
    }));

    onSyncApplications(formattedApps);
    showToast(`✅ Synced ${formattedApps.length} applications to your Application Pipeline!`);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left relative pb-12">
      
      {/* Silent Sync Authentication Element for Chrome Extension */}
      <div 
        id="jobmerge-sync-auth" 
        data-token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_premium_token" 
        data-api-url={typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
        style={{ display: 'none' }} 
      />
      
      {/* Dynamic Floating Toast Feedback */}
      {toastNotice && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastNotice}</span>
        </div>
      )}

      {/* Top Hero Banner with Live Engine Status Indicator */}
      <div className="bg-gradient-to-r from-[#3f37c9] via-[#4361ee] to-[#4895ef] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Application Automation Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
              LinkedIn Auto-Applier Hub
            </h1>
            <p className="text-indigo-100 text-xs font-medium leading-relaxed">
              Define your job targets, configure form profile answers, and let the AI automation engine search & apply to relevant Easy Apply roles.
            </p>
          </div>

          {/* Engine Status Callout Card */}
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-4 min-w-[240px] space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-indigo-100 tracking-wider">Engine Status</span>
              <span className={`w-2.5 h-2.5 rounded-full ${isBotRunning ? 'bg-emerald-400 animate-ping' : 'bg-white/50'}`} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-base font-extrabold ${isBotRunning ? 'text-emerald-300' : 'text-white'}`}>
                {isBotRunning ? '● Automation Active' : '○ Engine Idle'}
              </span>
            </div>
            <div className="text-[11px] text-indigo-100 font-semibold flex justify-between border-t border-white/10 pt-2 mt-1">
              <span>Applied: <strong>{stats.applied}</strong></span>
              <span>Skipped: <strong>{stats.skipped}</strong></span>
            </div>
          </div>
        </div>

        {/* Guided Wizard Steps Bar */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/15 overflow-x-auto custom-scrollbar">
          
          <button
            onClick={() => setActiveStep('targets')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeStep === 'targets' ? 'bg-white text-[#3f37c9] shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#3f37c9]/10 flex items-center justify-center text-[10px] font-extrabold">1</span>
            Job Targets & Presets
          </button>

          <ChevronRight className="w-4 h-4 text-white/50 shrink-0" />

          <button
            onClick={() => setActiveStep('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeStep === 'profile' ? 'bg-white text-[#3f37c9] shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#3f37c9]/10 flex items-center justify-center text-[10px] font-extrabold">2</span>
            Form Personal Answers
          </button>

          <ChevronRight className="w-4 h-4 text-white/50 shrink-0" />

          <button
            onClick={() => setActiveStep('console')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeStep === 'console' ? 'bg-white text-[#3f37c9] shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#3f37c9]/10 flex items-center justify-center text-[10px] font-extrabold">3</span>
            Live Console & Output
          </button>

        </div>
      </div>

      {/* STEP 1: JOB TARGETS & PRESETS */}
      {activeStep === 'targets' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Target Job Portal Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#3f37c9]" />
                Select Target Job Portal
              </h2>
              <span className="text-[11px] text-[#3f37c9] font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Active: {targetPortal}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {[
                { id: 'LinkedIn', name: 'LinkedIn', badge: 'Easy Apply', color: 'border-blue-500 bg-blue-50/40 text-blue-700', icon: '💼' },
                { id: 'Indeed', name: 'Indeed', badge: 'Indeed Apply', color: 'border-indigo-500 bg-indigo-50/40 text-indigo-700', icon: '🔍' },
                { id: 'Naukri', name: 'Naukri.com', badge: 'FastApply 🇮🇳', color: 'border-sky-500 bg-sky-50/40 text-sky-700', icon: '🚀' },
                { id: 'Unstop', name: 'Unstop', badge: 'Campus & Off-Campus', color: 'border-purple-500 bg-purple-50/40 text-purple-700', icon: '⚡' },
                { id: 'Wellfound', name: 'Wellfound', badge: 'Startup Apply', color: 'border-emerald-500 bg-emerald-50/40 text-emerald-700', icon: '🎯' },
                { id: 'ZipRecruiter', name: 'ZipRecruiter', badge: '1-Click Apply', color: 'border-teal-500 bg-teal-50/40 text-teal-700', icon: '⚡' },
                { id: 'Glassdoor', name: 'Glassdoor', badge: 'Direct Apply', color: 'border-amber-500 bg-amber-50/40 text-amber-700', icon: '🏢' }
              ].map((portal) => {
                const isSelected = targetPortal === portal.id;
                return (
                  <button
                    key={portal.id}
                    type="button"
                    onClick={() => {
                      setTargetPortal(portal.id as any);
                      localStorage.setItem('jobmerge_target_portal', portal.id);
                      showToast(`Target portal switched to ${portal.name}!`);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 relative ${
                      isSelected 
                        ? 'border-[#3f37c9] bg-indigo-50/70 ring-2 ring-[#3f37c9]/30 shadow-md scale-[1.02]' 
                        : 'border-gray-150 bg-white hover:border-gray-300 hover:bg-gray-50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base">{portal.icon}</span>
                      {isSelected ? (
                        <span className="w-4 h-4 bg-[#3f37c9] text-white rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-200" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[11px] text-gray-900 truncate">{portal.name}</h3>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400 block truncate mt-0.5">{portal.badge}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strategy Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#3f37c9]" />
                Select a Quick Strategy Preset
              </h2>
              <span className="text-[11px] text-gray-400 font-semibold">1-click configuration</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRESET_TEMPLATES.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 relative flex flex-col justify-between ${
                      isSelected 
                        ? 'border-[#3f37c9] bg-indigo-50/40 shadow-md ring-2 ring-[#3f37c9]/20' 
                        : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-5 h-5 bg-[#3f37c9] text-white rounded-full flex items-center justify-center text-xs shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pr-6">
                        <span className="px-2 py-0.5 bg-indigo-50 text-[#3f37c9] text-[9px] font-extrabold rounded-full border border-indigo-100">
                          {preset.portal} Target
                        </span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xs text-gray-900 leading-snug">{preset.name}</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">{preset.desc}</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-1">
                      <div className="text-[10px] font-mono text-[#3f37c9] bg-white p-2 rounded-xl border border-gray-100 truncate">
                        {preset.terms}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold pt-1 border-t border-gray-50">
                        <span className="truncate max-w-[50%]">📍 {preset.location}</span>
                        <span>⏳ {preset.datePosted}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chrome Extension Connection & Download Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-indigo-500/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Chrome Extension Ready
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-bold">
                    v1.0.0 Installed
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white">JobMerge Extension Direct Automation</h3>
                <p className="text-xs text-indigo-200/80 max-w-2xl font-medium">
                  Applications execute natively inside your own Chrome browser session for 100% account security, zero CAPTCHA flags, and instant form completion across LinkedIn, Indeed, Naukri, and Unstop.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="/jobmerge-extension.zip"
                  download="jobmerge-extension.zip"
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-indigo-400/30"
                >
                  <Globe className="w-4 h-4" />
                  <span>Download Extension (.zip)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Form Controls */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#3f37c9]" />
                Target Preferences & Filters
              </h2>
            </div>

            <form onSubmit={handleStartBot} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-gray-400" />
                    Target Job Titles (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={searchTerms}
                    onChange={(e) => setSearchTerms(e.target.value)}
                    placeholder="e.g. Software Engineer, React Developer"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#3f37c9] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    Target Location
                  </label>
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="e.g. United States, Remote, San Francisco"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#3f37c9] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">Date Posted Filter</label>
                  <select
                    value={datePosted}
                    onChange={(e) => setDatePosted(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#3f37c9]"
                  >
                    <option value="Any time">Any time</option>
                    <option value="Past month">Past month</option>
                    <option value="Past week">Past week</option>
                    <option value="Past 24 hours">Past 24 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">Safety Limit Switch</label>
                  <select
                    value={switchNumber}
                    onChange={(e) => setSwitchNumber(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#3f37c9]"
                  >
                    <option value={15}>15 applications per batch</option>
                    <option value={30}>30 applications per batch (Recommended)</option>
                    <option value={50}>50 applications per batch</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">Total Application Limit</label>
                  <select
                    value={totalApplicationsLimit}
                    onChange={(e) => setTotalApplicationsLimit(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#3f37c9]"
                  >
                    <option value={10}>Apply to 10 jobs strictly</option>
                    <option value={15}>Apply to 15 jobs strictly</option>
                    <option value={30}>Apply to 30 jobs strictly (Recommended)</option>
                    <option value={50}>Apply to 50 jobs strictly</option>
                    <option value={100}>Apply to 100 jobs strictly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">Easy Apply Filter</label>
                  <div className="pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={easyApplyOnly}
                        onChange={(e) => setEasyApplyOnly(e.target.checked)}
                        className="w-4 h-4 rounded text-[#3f37c9] focus:ring-0"
                      />
                      Easy Apply Only
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep('profile')}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Configure Form Answers →
                </button>

                {!isBotRunning ? (
                  <button
                    type="submit"
                    className="py-3 px-6 bg-[#3f37c9] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Launch Automation Bot
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopBot}
                    className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    Stop Engine
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 2: FORM PERSONAL ANSWERS */}
      {activeStep === 'profile' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in text-xs">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#3f37c9]" />
                Easy Apply Question Persona Answers
              </h2>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                The bot uses these answers to automatically fill out standard recruiter questions during application submission.
              </p>
            </div>
            <button
              onClick={() => setActiveStep('targets')}
              className="text-[#3f37c9] hover:underline font-bold text-xs"
            >
              Back to Targets
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Middle Name</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Current City</label>
              <input
                type="text"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Require Visa Sponsorship?</label>
              <select
                value={requireVisa}
                onChange={(e) => setRequireVisa(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Portfolio Website</label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Desired Salary (Annual)</label>
              <input
                type="text"
                value={desiredSalary}
                onChange={(e) => setDesiredSalary(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-emerald-600 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Persona answers ready to inject
            </span>
            <button
              onClick={() => setActiveStep('targets')}
              className="px-6 py-3 bg-[#3f37c9] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Continue to Bot Launch →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONSOLE & LIVE OUTPUT */}
      {(activeStep === 'console' || isBotRunning) && (
        <div className="space-y-6 animate-fade-in text-xs">
          
          {/* Live Browser Operations Tracker */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#3f37c9] animate-pulse" />
                <h2 className="text-sm font-bold text-gray-900">Live Browser Actions Tracker</h2>
              </div>
              {isBotRunning && (
                <span className="px-2.5 py-1 bg-indigo-50 text-[#3f37c9] rounded-full font-bold text-[10px] flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3f37c9] inline-block" />
                  Chrome Session Active
                </span>
              )}
            </div>

            {/* Step Pipeline Flow UI */}
            <div className="grid grid-cols-5 gap-2 text-center relative font-semibold text-[10px] text-gray-400">
              {[
                { label: "1. Launch Chrome", phase: 1 },
                { label: "2. Manual Login", phase: 2 },
                { label: "3. Scan Listings", phase: 3 },
                { label: "4. Apply to Job", phase: 4 },
                { label: "5. Cool-down", phase: 5 },
              ].map((step, idx) => {
                const currentPhase = getBotCurrentStatus().phase;
                const isCompleted = currentPhase > step.phase;
                const isActive = currentPhase === step.phase;
                
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono transition-all border ${
                      isCompleted 
                        ? "bg-emerald-500 border-emerald-600 text-white shadow-sm"
                        : isActive 
                        ? "bg-[#3f37c9] border-[#3f37c9] text-white shadow-md animate-bounce"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}>
                      {isCompleted ? "✓" : step.phase}
                    </div>
                    <span className={`hidden sm:inline transition-all ${
                      isActive ? "text-[#3f37c9] font-bold" : isCompleted ? "text-emerald-600" : ""
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Current Status Log Banner */}
            <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="p-2 bg-indigo-50 text-[#3f37c9] rounded-xl flex-shrink-0 animate-pulse">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-800 text-xs">
                  {getBotCurrentStatus().text}
                </p>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {getBotCurrentStatus().subText}
                </p>
              </div>
            </div>

            {/* Live Extension Engine Card */}
            {isBotRunning && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl mt-4 max-w-4xl mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    <span className="text-emerald-400 font-extrabold uppercase tracking-wider font-sans">Chrome Extension Active</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans">Target: LinkedIn / Indeed / ZipRecruiter</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-1">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Search Keywords</span>
                    <p className="text-xs font-bold text-white truncate">{searchTerms}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target Location</span>
                    <p className="text-xs font-bold text-white truncate">{searchLocation}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                    <p className="text-xs font-bold text-emerald-400">{stats.applied} / {totalApplicationsLimit} Roles Applied</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status & Stats Metrics Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Bot Engine Status</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full inline-block ${
                  isBotRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-xs font-bold text-gray-900">{getBotCurrentStatus().text}</span>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Easy Applied</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-emerald-600 font-mono">{stats.applied}</span>
                <span className="text-[10px] text-gray-400 font-bold">jobs completed</span>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Skipped / Filtered</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-amber-600 font-mono">{stats.skipped}</span>
                <span className="text-[10px] text-gray-400 font-bold">irrelevant jobs</span>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Failed Runs</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-red-600 font-mono">{stats.failed}</span>
                <span className="text-[10px] text-gray-400 font-bold">errors caught</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {isBotRunning ? (
                <button
                  onClick={handleStopBot}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-500/10 transition-colors cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  Stop Engine Execution
                </button>
              ) : (
                <button
                  onClick={() => setActiveStep('targets')}
                  className="px-5 py-2.5 bg-[#3f37c9] hover:bg-[#4f46e5] text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  ← Configure Strategy
                </button>
              )}
              
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                {showTerminal ? "Hide Live Console Logs" : "Show Live Console Logs"}
              </button>
            </div>

            <button
              onClick={handleSyncToTracker}
              disabled={historyJobs.length === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer w-full md:w-auto justify-center"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Sync Applications to Main Pipeline ({historyJobs.length})
            </button>
          </div>

          {/* Collapsible Terminal Console Panel */}
          {showTerminal && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-slate-200 shadow-2xl space-y-4 font-mono text-[11px] flex flex-col h-[320px] animate-slide-down">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-sans">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="font-bold text-slate-100 text-xs">Developer Live Engine Logs</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
              </div>
              <div 
                ref={consoleContainerRef}
                className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar text-[10px] leading-relaxed"
              >
                {botLogs.length === 0 ? (
                  <div className="text-slate-500 italic py-12 text-center">
                    No log outputs recorded yet. Start bot engine to track live terminal execution here.
                  </div>
                ) : (
                  botLogs.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap break-words">
                      {log.includes('[ERROR]') ? (
                        <span className="text-red-400 font-semibold">{log}</span>
                      ) : log.includes('[SUCCESS]') || log.includes('Applied') ? (
                        <span className="text-emerald-400 font-semibold">{log}</span>
                      ) : log.includes('[SYSTEM]') ? (
                        <span className="text-indigo-400 font-semibold">{log}</span>
                      ) : (
                        <span className="text-slate-300">{log}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Applied Jobs Log Table */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#3f37c9]" />
                  Recorded LinkedIn Applications Log
                </h2>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                  Live record of applications parsed from `all_applied_applications_history.csv`
                </p>
              </div>
              <button
                onClick={fetchHistory}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                Refresh History
              </button>
            </div>

            {historyJobs.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs font-medium">
                No applied applications recorded yet in `all_applied_applications_history.csv`.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">HR Contact</th>
                      <th className="py-3 px-4">Date Applied</th>
                      <th className="py-3 px-4 text-right">LinkedIn Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                    {historyJobs.map((job, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">{job.Title}</td>
                        <td className="py-3 px-4">{job.Company}</td>
                        <td className="py-3 px-4 text-gray-500">{job.HR_Name || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-500">{job.Date_Applied}</td>
                        <td className="py-3 px-4 text-right">
                          {job.Job_Link ? (
                            <a
                              href={job.Job_Link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#3f37c9] hover:underline font-bold"
                            >
                              View Job
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execution Session Report Modal */}
      {showReportModal && executionReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-150 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">LinkedIn Bot Execution Report</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Session Completed at {new Date(executionReport.endTime).toLocaleTimeString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content Tabs Grid */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 text-center">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Successfully Applied</span>
                  <span className="text-2xl font-black text-emerald-700">{executionReport.applied.length}</span>
                </div>
                <div className="bg-rose-50/50 border border-rose-100/80 rounded-2xl p-4 text-center">
                  <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block">Failed / Skipped</span>
                  <span className="text-2xl font-black text-rose-700">{executionReport.failed.length}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Target Limit Set</span>
                  <span className="text-sm font-bold text-slate-700 mt-1">{totalApplicationsLimit} jobs strictly</span>
                </div>
              </div>

              {/* Lists */}
              <div className="space-y-4">
                
                {/* Success Table */}
                <div>
                  <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Applications Submitted successfully ({executionReport.applied.length})
                  </h4>
                  {executionReport.applied.length === 0 ? (
                    <div className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                      No successful job submissions completed during this session.
                    </div>
                  ) : (
                    <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold text-[9px] uppercase tracking-wider">
                            <th className="py-2 px-3">Job Title</th>
                            <th className="py-2 px-3">Company</th>
                            <th className="py-2 px-3 text-right">Link</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-600 font-medium">
                          {executionReport.applied.map((job, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-bold text-gray-900">{job.title}</td>
                              <td className="py-2 px-3">{job.company}</td>
                              <td className="py-2 px-3 text-right">
                                <a href={job.jobLink} target="_blank" rel="noreferrer" className="text-[#3f37c9] hover:underline font-bold">View Job</a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Failure Details */}
                <div>
                  <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Failed or Skipped listings ({executionReport.failed.length})
                  </h4>
                  {executionReport.failed.length === 0 ? (
                    <div className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                      Zero errors or validation failures encountered during this run!
                    </div>
                  ) : (
                    <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold text-[9px] uppercase tracking-wider">
                            <th className="py-2 px-3">Job ID</th>
                            <th className="py-2 px-3">Failure Reason / Checkpoint</th>
                            <th className="py-2 px-3 text-right">Link</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-600 font-medium">
                          {executionReport.failed.map((job, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-mono text-[10px] text-gray-400">{job.jobId}</td>
                              <td className="py-2 px-3 font-bold text-rose-600">{job.reason}</td>
                              <td className="py-2 px-3 text-right">
                                {job.jobLink ? (
                                  <a href={job.jobLink} target="_blank" rel="noreferrer" className="text-[#3f37c9] hover:underline font-bold">View Job</a>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
              <button 
                onClick={() => {
                  const formattedApps = executionReport.applied.map(job => ({
                    id: 'linkedIn-' + (job.jobId || Math.random().toString(36).substring(2, 8)),
                    jobId: job.jobId || 'linkedin-' + Math.random().toString(36).substring(2, 6),
                    jobTitle: job.title || 'Applied Role',
                    company: job.company || 'LinkedIn Employer',
                    logoUrl: `https://logo.clearbit.com/${(job.company || 'linkedin').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                    appliedDate: job.dateApplied ? job.dateApplied.split(' ')[0] : new Date().toISOString().split('T')[0],
                    status: 'Applied',
                    notes: `Applied automatically via LinkedIn Auto-Applier. Job Link: ${job.jobLink || 'N/A'}`
                  }));
                  onSyncApplications(formattedApps);
                  showToast(`✅ Synced ${formattedApps.length} applications to your pipeline!`);
                  setShowReportModal(false);
                }}
                disabled={executionReport.applied.length === 0}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all flex items-center gap-1.5"
              >
                Sync Session to Tracker ({executionReport.applied.length})
              </button>
              <button 
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Chrome Extension Auth Bridge Container */}
      <div 
        id="jobmerge-sync-auth" 
        style={{ display: 'none' }}
        data-token="jobmerge_vip_token_2026"
        data-api-url={window.location.origin}
        data-first-name={firstName}
        data-last-name={lastName}
        data-phone={phoneNumber}
        data-city={currentCity}
        data-experience={experienceYears}
        data-salary={desiredSalary}
        data-visa={requireVisa}
        data-website={websiteUrl}
        data-linkedin={linkedinUrl}
        data-has-resume={!!resumeBase64}
      />
    </div>
  );
}
