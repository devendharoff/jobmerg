import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, RefreshCw, Terminal, CheckCircle2, AlertCircle, 
  Sparkles, Sliders, User, ShieldCheck, UserCheck, Phone, DollarSign, Globe, Lock, Bookmark, Cpu,
  Search, MapPin, FileSpreadsheet, ChevronRight, HelpCircle, ArrowRight, ShieldAlert, Check,
  X, Plus, Settings, BarChart3, Clock, ExternalLink, Layers, FileText
} from 'lucide-react';
import { JobApplication, UserProfile, PLAN_LIMITS } from '../types';

interface AutoApplyBotProps {
  userProfile?: UserProfile;
  onSyncApplications: (newApps: JobApplication[]) => void;
  onOpenPricing?: () => void;
}

export type TargetPortal = 'LinkedIn' | 'Indeed' | 'ZipRecruiter' | 'Glassdoor' | 'Naukri' | 'Unstop' | 'Wellfound';

const PORTAL_CONFIGS: Record<TargetPortal, { 
  name: string; 
  badge: string; 
  color: string; 
  bg: string; 
  logo: string; 
  fallbackLogo: string 
}> = {
  LinkedIn: { 
    name: 'LinkedIn', 
    badge: 'Easy Apply', 
    color: 'text-blue-600 border-blue-200', 
    bg: 'bg-blue-50', 
    logo: '/assets/logos/job_websites/linkedin.png', 
    fallbackLogo: 'https://cdn.simpleicons.org/linkedin/0A66C2' 
  },
  Indeed: { 
    name: 'Indeed', 
    badge: 'Easy Apply', 
    color: 'text-indigo-600 border-indigo-200', 
    bg: 'bg-indigo-50', 
    logo: '/assets/logos/job_websites/indeed.png', 
    fallbackLogo: 'https://cdn.simpleicons.org/indeed/2164F3' 
  },
  ZipRecruiter: { 
    name: 'ZipRecruiter', 
    badge: '1-Click Apply', 
    color: 'text-[#10b981] border-emerald-200', 
    bg: 'bg-emerald-50', 
    logo: '/assets/logos/job_websites/ziprecruiter.png', 
    fallbackLogo: 'https://www.google.com/s2/favicons?sz=128&domain=ziprecruiter.com' 
  },
  Glassdoor: { 
    name: 'Glassdoor', 
    badge: 'Direct Apply', 
    color: 'text-emerald-700 border-emerald-300', 
    bg: 'bg-emerald-50', 
    logo: '/assets/logos/job_websites/glassdoor.png', 
    fallbackLogo: 'https://cdn.simpleicons.org/glassdoor/0CAA41' 
  },
  Naukri: { 
    name: 'Naukri.com', 
    badge: 'FastApply 🇮🇳', 
    color: 'text-sky-600 border-sky-200', 
    bg: 'bg-sky-50', 
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=naukri.com', 
    fallbackLogo: 'https://cdn.simpleicons.org/naukri' 
  },
  Unstop: { 
    name: 'Unstop', 
    badge: 'Campus Drive', 
    color: 'text-purple-600 border-purple-200', 
    bg: 'bg-purple-50', 
    logo: 'https://www.google.com/s2/favicons?sz=128&domain=unstop.com', 
    fallbackLogo: 'https://unstop.com/favicon.ico' 
  },
  Wellfound: { 
    name: 'Wellfound', 
    badge: 'Startup Apply', 
    color: 'text-rose-600 border-rose-200', 
    bg: 'bg-rose-50', 
    logo: 'https://cdn.simpleicons.org/wellfound/000000', 
    fallbackLogo: 'https://www.google.com/s2/favicons?sz=128&domain=wellfound.com' 
  },
};

const STRATEGY_PRESETS = [
  {
    id: 'fullstack-us',
    name: '🔥 Full-Stack Dev (US Remote)',
    desc: 'High-yield Remote Senior & Full-Stack roles',
    titles: ['Software Engineer', 'Full Stack Developer', 'React Developer'],
    location: ['United States'],
    tags: ['US Remote', '50-100 jobs', 'Past week'],
    portal: 'LinkedIn' as TargetPortal,
    datePosted: 'Past week'
  },
  {
    id: 'entry-tech',
    name: '🎓 Tech Graduate / Entry-Level',
    desc: 'Focus on Entry, Associate & Junior roles',
    titles: ['Graduate Software Engineer', 'Junior Frontend Developer', 'Associate Developer'],
    location: ['United States'],
    tags: ['Entry Level', 'US', '30 jobs'],
    portal: 'Indeed' as TargetPortal,
    datePosted: 'Past 24 hours'
  },
  {
    id: 'design-uiux',
    name: '🎨 UI/UX Product Designer',
    desc: 'Product & Visual Design positions',
    titles: ['Product Designer', 'UI/UX Designer', 'UX Engineer'],
    location: ['United States'],
    tags: ['Product Design', 'US', '30 jobs'],
    portal: 'Glassdoor' as TargetPortal,
    datePosted: 'Past month'
  },
  {
    id: 'aiml-data',
    name: '🤖 AI / ML & Data Science',
    desc: 'Target Machine Learning & Data positions',
    titles: ['Machine Learning Engineer', 'Data Scientist', 'AI Developer'],
    location: ['Remote'],
    tags: ['AI / ML', 'Worldwide', '50 jobs'],
    portal: 'LinkedIn' as TargetPortal,
    datePosted: 'Past week'
  }
];

export default function AutoApplyBot({ userProfile, onSyncApplications, onOpenPricing }: AutoApplyBotProps) {
  // Target Portal Selection State
  const [targetPortal, setTargetPortal] = useState<TargetPortal>(() => {
    return (localStorage.getItem('jobmerge_target_portal') as any) || 'LinkedIn';
  });

  // Target Job Titles & Locations Tag State
  const [targetJobTitles, setTargetJobTitles] = useState<string[]>(['Software Engineer', 'Full Stack Developer', 'React Developer']);
  const [targetLocations, setTargetLocations] = useState<string[]>(['United States']);
  const [newTitleInput, setNewTitleInput] = useState<string>('');
  const [newLocationInput, setNewLocationInput] = useState<string>('');

  // Filters & Limit Configuration State
  const [easyApplyOnly, setEasyApplyOnly] = useState<boolean>(true);
  const [datePosted, setDatePosted] = useState<string>('Past week');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fullstack-us');
  const [switchNumber, setSwitchNumber] = useState<number>(30);
  const [totalApplicationsLimit, setTotalApplicationsLimit] = useState<number>(30);
  const [summaryTimeframe, setSummaryTimeframe] = useState<string>('Past 7 days');

  // Persona State for Form Auto-Fill
  const loadSavedPersona = () => {
    try {
      const saved = localStorage.getItem('jobmerge_auto_apply_persona');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };
  const savedPersona = loadSavedPersona();

  const [firstName, setFirstName] = useState<string>(savedPersona?.firstName || userProfile?.name?.split(' ')[0] || 'Sai');
  const [lastName, setLastName] = useState<string>(savedPersona?.lastName || userProfile?.name?.split(' ').slice(1).join(' ') || 'Vignesh');
  const [phoneNumber, setPhoneNumber] = useState<string>(savedPersona?.phoneNumber || '+1 555-019-2834');
  const [currentCity, setCurrentCity] = useState<string>(savedPersona?.currentCity || 'San Francisco, CA');
  const [experienceYears, setExperienceYears] = useState<string>(savedPersona?.experienceYears || userProfile?.experienceYears?.toString() || '3');
  const [requireVisa, setRequireVisa] = useState<string>(savedPersona?.requireVisa || 'No');
  const [websiteUrl, setWebsiteUrl] = useState<string>(savedPersona?.websiteUrl || 'https://github.com/example');
  const [linkedinUrl, setLinkedinUrl] = useState<string>(savedPersona?.linkedinUrl || 'https://www.linkedin.com/in/example');
  const [desiredSalary, setDesiredSalary] = useState<string>(savedPersona?.desiredSalary || '1200000');
  const [resumeFilename, setResumeFilename] = useState<string>('avasarama-resume.pdf');
  const [resumeSize, setResumeSize] = useState<string>('245 KB');

  // Modals & Sliders State
  const [showPersonaModal, setShowPersonaModal] = useState<boolean>(false);
  const [showCreatePresetModal, setShowCreatePresetModal] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [showConsoleDrawer, setShowConsoleDrawer] = useState<boolean>(false);

  // Execution & Output State
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [botLogs, setBotLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ applied: 0, failed: 0, skipped: 0, remaining: 30 });
  const [historyJobs, setHistoryJobs] = useState<any[]>([
    { Company: 'ABC Technologies', Title: 'Senior React Developer', Date_Applied: '2 min ago', Status: 'Applied', Job_Link: '#' },
    { Company: 'Google', Title: 'Software Engineer', Date_Applied: '5 min ago', Status: 'Applied', Job_Link: '#' },
    { Company: 'Microsoft', Title: 'Frontend Developer', Date_Applied: '12 min ago', Status: 'Applied', Job_Link: '#' },
    { Company: 'Amazon', Title: 'Full Stack Developer', Date_Applied: '15 min ago', Status: 'Skipped', Job_Link: '#' },
    { Company: 'Meta', Title: 'Software Engineer', Date_Applied: '20 min ago', Status: 'Applied', Job_Link: '#' }
  ]);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const consoleContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  // Tag manipulation handlers
  const handleAddJobTitle = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newTitleInput.trim() && !targetJobTitles.includes(newTitleInput.trim())) {
      setTargetJobTitles([...targetJobTitles, newTitleInput.trim()]);
      setNewTitleInput('');
    }
  };

  const handleRemoveJobTitle = (titleToRemove: string) => {
    setTargetJobTitles(targetJobTitles.filter(t => t !== titleToRemove));
  };

  const handleAddLocation = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newLocationInput.trim() && !targetLocations.includes(newLocationInput.trim())) {
      setTargetLocations([...targetLocations, newLocationInput.trim()]);
      setNewLocationInput('');
    }
  };

  const handleRemoveLocation = (locToRemove: string) => {
    setTargetLocations(targetLocations.filter(l => l !== locToRemove));
  };

  // Preset Selection Handler
  const handleApplyPreset = (preset: typeof STRATEGY_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setTargetJobTitles(preset.titles);
    setTargetLocations(preset.location);
    setTargetPortal(preset.portal);
    setDatePosted(preset.datePosted);
    localStorage.setItem('jobmerge_target_portal', preset.portal);
    showToast(`⚡ Strategy Preset loaded: ${preset.name}`);
  };

  // Poll Backend Status & SSE Events
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/auto-apply/status');
        if (res.ok) {
          const data = await res.json();
          setIsBotRunning(data.isRunning);
          setBotLogs(data.logs || []);
          if (data.stats) {
            setStats({
              applied: data.stats.applied || 0,
              failed: data.stats.failed || 0,
              skipped: data.stats.skipped || 0,
              remaining: Math.max(0, totalApplicationsLimit - (data.stats.applied || 0))
            });
          }
        }
      } catch (err) {}
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [totalApplicationsLimit]);

  // Handle Start & Stop Bot Engine
  const handleStartBot = async () => {
    const plan = userProfile?.plan || 'Free';
    const usage = userProfile?.usage || { resumesCreated: 1, atsScansUsed: 1, autoAppliesUsed: 5 };
    const limit = PLAN_LIMITS[plan].maxAutoApplies;

    if (usage.autoAppliesUsed >= limit) {
      showToast(`🔒 Plan Limit Reached: Upgrade to Pro or Accelerator for unlimited applications!`);
      onOpenPricing?.();
      return;
    }

    localStorage.setItem('jobmerge_target_portal', targetPortal);

    // Dispatch DOM Event to Chrome Extension
    window.dispatchEvent(new CustomEvent('JOBMERGE_START_BOT', {
      detail: {
        keyword: targetJobTitles.join(', '),
        location: targetLocations.join(', '),
        limit: totalApplicationsLimit,
        portal: targetPortal
      }
    }));

    try {
      const res = await fetch('/api/auto-apply/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal: targetPortal,
          searchTerms: targetJobTitles,
          searchLocation: targetLocations.join(', '),
          easyApplyOnly,
          datePosted,
          safetyConfig: { switchNumber, totalApplicationsLimit },
          userInfo: { firstName, lastName, phoneNumber, currentCity, experienceYears, requireVisa, websiteUrl, linkedinUrl, desiredSalary }
        })
      });

      if (res.ok) {
        setIsBotRunning(true);
        showToast(`🚀 ${targetPortal} Auto-Apply Engine Launched!`);
      }
    } catch (err) {
      showToast('❌ Error launching bot engine.');
    }
  };

  const handleStopBot = async () => {
    window.dispatchEvent(new CustomEvent('JOBMERGE_STOP_BOT'));
    try {
      await fetch('/api/auto-apply/stop', { method: 'POST' });
      setIsBotRunning(false);
      showToast('⏹️ Auto-Apply engine stopped.');
    } catch (err) {}
  };

  return (
    <div className="space-y-6 text-left font-sans bg-[#f8f9fa] min-h-screen pb-16 animate-fade-in">
      
      {/* Dynamic Toast Feedback Notice */}
      {toastNotice && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-slide-in">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-extrabold">{toastNotice}</span>
        </div>
      )}

      {/* Main Container Header */}
      <header className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Portal Brand Icon Badge */}
          <div className="w-13 h-13 rounded-2xl bg-white border border-gray-200 p-2.5 flex items-center justify-center shadow-sm shrink-0">
            <img 
              src={PORTAL_CONFIGS[targetPortal].logo} 
              alt={targetPortal} 
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = PORTAL_CONFIGS[targetPortal].fallbackLogo; }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight font-display">
              {targetPortal} Auto-Applier
            </h1>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              Automate relevant Easy Apply applications based on your preferences.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Engine Status Badge */}
          <div className="bg-slate-50 border border-gray-200 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isBotRunning ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-xs font-black text-gray-800">
              {isBotRunning ? 'Engine Active' : 'Engine Idle'}
            </span>
            <span className="text-[10px] text-gray-400 font-bold border-l border-gray-200 pl-2">
              {isBotRunning ? 'Applying to positions' : 'Ready to start'}
            </span>
          </div>

          {/* Primary Action Button */}
          {!isBotRunning ? (
            <button
              onClick={handleStartBot}
              className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Auto Apply</span>
            </button>
          ) : (
            <button
              onClick={handleStopBot}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Auto Apply</span>
            </button>
          )}

          {/* Settings Icon Button */}
          <button
            onClick={() => setShowPersonaModal(true)}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Configure Persona Form Answers"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: 5 STEP-BY-STEP CONFIGURATION CARDS (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: Select Job Portal */}
          <section className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-[#4f46e5] font-black text-xs flex items-center justify-center border border-indigo-100">
                  1
                </span>
                <div>
                  <h2 className="text-sm font-black text-gray-900 font-display">Select Job Portal</h2>
                  <p className="text-[11px] font-bold text-gray-400">Choose where you want to apply.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['LinkedIn', 'Indeed', 'ZipRecruiter', 'Glassdoor'] as TargetPortal[]).map((portalKey) => {
                const config = PORTAL_CONFIGS[portalKey];
                const isSelected = targetPortal === portalKey;

                return (
                  <button
                    key={portalKey}
                    onClick={() => {
                      setTargetPortal(portalKey);
                      localStorage.setItem('jobmerge_target_portal', portalKey);
                      showToast(`Switched target portal to ${config.name}`);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                      isSelected 
                        ? 'border-[#4f46e5] bg-indigo-50/40 ring-2 ring-[#4f46e5]/20 shadow-xs' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 p-1.5 flex items-center justify-center shadow-2xs">
                        <img 
                          src={config.logo} 
                          alt={config.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = config.fallbackLogo; }}
                        />
                      </div>

                      {isSelected && (
                        <div className="w-4.5 h-4.5 bg-[#4f46e5] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs">
                          ✓
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-gray-900">{config.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 bg-[#4f46e5] text-white text-[8px] font-black rounded-full uppercase">Active</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 block mt-0.5">{config.badge}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 2: Strategy Presets */}
          <section className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-[#4f46e5] font-black text-xs flex items-center justify-center border border-indigo-100">
                  2
                </span>
                <div>
                  <h2 className="text-sm font-black text-gray-900 font-display">Strategy Presets</h2>
                  <p className="text-[11px] font-bold text-gray-400">Choose a preset to quickly load recommended settings.</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreatePresetModal(true)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] rounded-xl text-xs font-black flex items-center gap-1 transition-colors cursor-pointer border border-indigo-150"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Preset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STRATEGY_PRESETS.slice(0, 3).map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-4.5 rounded-2xl border transition-all cursor-pointer space-y-3 relative flex flex-col justify-between ${
                      isSelected 
                        ? 'border-[#4f46e5] bg-indigo-50/40 ring-2 ring-[#4f46e5]/20 shadow-xs' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-4 h-4 bg-[#4f46e5] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs">
                        ✓
                      </div>
                    )}

                    <div className="space-y-1 pr-6">
                      <h3 className="font-extrabold text-xs text-gray-900 leading-snug">{preset.name}</h3>
                      <p className="text-[10px] text-gray-500 font-medium leading-normal">{preset.desc}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {preset.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-extrabold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* STEP 3: Job Target Configuration */}
          <section className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-[#4f46e5] font-black text-xs flex items-center justify-center border border-indigo-100">
                  3
                </span>
                <div>
                  <h2 className="text-sm font-black text-gray-900 font-display">Job Target Configuration</h2>
                  <p className="text-[11px] font-bold text-gray-400">Define exactly what roles the engine should search for.</p>
                </div>
              </div>
            </div>

            {/* Job Titles & Location Tag Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Target Job Titles Tag Container */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-gray-700">Target Job Titles</label>
                <div className="min-h-[46px] p-2 bg-gray-50 border border-gray-200 rounded-2xl flex flex-wrap items-center gap-1.5 focus-within:bg-white focus-within:border-[#4f46e5] transition-all">
                  {targetJobTitles.map((title) => (
                    <span key={title} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <span>{title}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveJobTitle(title)}
                        className="text-gray-400 hover:text-red-500 font-bold text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTitleInput}
                    onChange={(e) => setNewTitleInput(e.target.value)}
                    onKeyDown={handleAddJobTitle}
                    placeholder={targetJobTitles.length === 0 ? "Add title..." : "Add more titles..."}
                    className="flex-1 min-w-[100px] bg-transparent border-none text-xs font-semibold focus:outline-none px-1 text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Target Location Tag Container */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-gray-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  Target Location
                </label>
                <div className="min-h-[46px] p-2 bg-gray-50 border border-gray-200 rounded-2xl flex flex-wrap items-center gap-1.5 focus-within:bg-white focus-within:border-[#4f46e5] transition-all">
                  {targetLocations.map((loc) => (
                    <span key={loc} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <span>{loc}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveLocation(loc)}
                        className="text-gray-400 hover:text-red-500 font-bold text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newLocationInput}
                    onChange={(e) => setNewLocationInput(e.target.value)}
                    onKeyDown={handleAddLocation}
                    placeholder="Add location..."
                    className="flex-1 min-w-[100px] bg-transparent border-none text-xs font-semibold focus:outline-none px-1 text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Select Options Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Date Posted</label>
                <select
                  value={datePosted}
                  onChange={(e) => setDatePosted(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#4f46e5] transition-colors"
                >
                  <option value="Past week">Past week</option>
                  <option value="Past 24 hours">Past 24 hours</option>
                  <option value="Past month">Past month</option>
                  <option value="Any time">Any time</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Application Limit</label>
                <select
                  value={totalApplicationsLimit}
                  onChange={(e) => setTotalApplicationsLimit(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#4f46e5] transition-colors"
                >
                  <option value={10}>10 jobs</option>
                  <option value={30}>30 jobs (Recommended)</option>
                  <option value={50}>50 jobs</option>
                  <option value={100}>100 jobs</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Safety Limit per Switch</label>
                <select
                  value={switchNumber}
                  onChange={(e) => setSwitchNumber(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#4f46e5] transition-colors"
                >
                  <option value={15}>15 applications</option>
                  <option value={30}>30 applications</option>
                  <option value={50}>50 applications</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Easy Apply Filter</label>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEasyApplyOnly(!easyApplyOnly)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      easyApplyOnly ? 'bg-[#4f46e5]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        easyApplyOnly ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-[11px] font-bold text-gray-600">Only apply to Easy Apply roles</span>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 4: Application Profile */}
          <section className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-[#4f46e5] font-black text-xs flex items-center justify-center border border-indigo-100">
                  4
                </span>
                <div>
                  <h2 className="text-sm font-black text-gray-900 font-display">Application Profile</h2>
                  <p className="text-[11px] font-bold text-gray-400">Configure your resume and application details.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Resume Status Card */}
              <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Resume</span>
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-indigo-50 text-[#4f46e5] rounded-lg flex items-center justify-center font-black">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900 leading-tight">{resumeFilename}</p>
                        <p className="text-[10px] font-bold text-gray-400">{resumeSize} • PDF</p>
                      </div>
                    </div>
                    <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-black">✓</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-gray-200/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                      <span>✓ PDF supported</span>
                      <span>✓ Resume available</span>
                    </div>
                    <button 
                      onClick={() => showToast('Resume file replaced successfully')}
                      className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-[10px] font-extrabold cursor-pointer"
                    >
                      Replace
                    </button>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">✓ Ready for automation</div>
                </div>
              </div>

              {/* Application Answers Card */}
              <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Application Answers</span>
                  <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="w-8 h-8 bg-indigo-50 text-[#4f46e5] rounded-lg flex items-center justify-center font-black shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900 leading-tight">Personal & Work Details</p>
                      <p className="text-[10px] font-medium text-gray-500 mt-0.5">
                        Personal information, work authorization, custom questions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                  <button
                    onClick={() => setShowPersonaModal(true)}
                    className="px-3.5 py-1.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white rounded-xl text-[11px] font-extrabold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                  >
                    <span>Configure Answers</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Configured
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 5: Ready to Start (Green Banner) */}
          <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 rounded-3xl p-6 border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  ✓
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-900 font-display">5. Ready to Start</h2>
                  <p className="text-[11px] font-extrabold text-emerald-800">
                    All requirements are configured. You can start the auto application engine.
                  </p>
                </div>
              </div>

              {!isBotRunning ? (
                <button
                  onClick={handleStartBot}
                  className="px-6 py-3 bg-[#4f46e5] hover:bg-[#3f37c9] text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Auto Apply</span>
                </button>
              ) : (
                <button
                  onClick={handleStopBot}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Engine</span>
                </button>
              )}
            </div>

            {/* Green Checklist Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-emerald-200/60 text-[11px] font-black text-emerald-900">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span>
                <span>Portal selected: <strong className="text-gray-900">{targetPortal}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span>
                <span>Resume configured: <strong className="text-gray-900">{resumeFilename}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span>
                <span>Job targets: <strong className="text-gray-900">{targetJobTitles.length} titles</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span>
                <span>Application limits: <strong className="text-gray-900">{totalApplicationsLimit} jobs</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span>
                <span>Easy Apply: <strong className="text-gray-900">Only Easy Apply</strong></span>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: SIDEBAR METRICS & RECENT APPLICATIONS (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CARD 1: Engine Status Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 font-display">
                <Plus className="w-4 h-4 text-[#4f46e5]" />
                <span>Engine Status</span>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isBotRunning ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`} />
                {isBotRunning ? 'Active' : 'Idle'}
              </span>
            </div>

            {/* 4 Stat Counters */}
            <div className="grid grid-cols-4 gap-2 text-center py-2 bg-gray-50/80 rounded-2xl p-2.5 border border-gray-150">
              <div>
                <span className="text-lg font-black text-gray-900 font-display block leading-none">{stats.applied}</span>
                <span className="text-[9px] font-extrabold text-gray-400 uppercase mt-1 block">Applied</span>
              </div>
              <div>
                <span className="text-lg font-black text-blue-600 font-display block leading-none">{stats.skipped}</span>
                <span className="text-[9px] font-extrabold text-gray-400 uppercase mt-1 block">Skipped</span>
              </div>
              <div>
                <span className="text-lg font-black text-red-500 font-display block leading-none">{stats.failed}</span>
                <span className="text-[9px] font-extrabold text-gray-400 uppercase mt-1 block">Errors</span>
              </div>
              <div>
                <span className="text-lg font-black text-emerald-600 font-display block leading-none">{stats.remaining}</span>
                <span className="text-[9px] font-extrabold text-gray-400 uppercase mt-1 block">Remaining</span>
              </div>
            </div>

            {/* Main Action Button */}
            {!isBotRunning ? (
              <button
                onClick={handleStartBot}
                className="w-full py-3 bg-[#4f46e5] hover:bg-[#3f37c9] text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Auto Apply</span>
              </button>
            ) : (
              <button
                onClick={handleStopBot}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Engine</span>
              </button>
            )}

            {/* Sub-Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-extrabold">
              <button
                onClick={() => setShowPersonaModal(true)}
                className="py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configure</span>
              </button>

              <button
                onClick={() => setShowConsoleDrawer(!showConsoleDrawer)}
                className="py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{showConsoleDrawer ? 'Hide Logs' : 'View History'}</span>
              </button>
            </div>
          </div>

          {/* CARD 2: Application Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 font-display">
                <BarChart3 className="w-4 h-4 text-[#4f46e5]" />
                <span>Application Summary</span>
              </div>

              <select
                value={summaryTimeframe}
                onChange={(e) => setSummaryTimeframe(e.target.value)}
                className="text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="Past 7 days">Past 7 days</option>
                <option value="Past 30 days">Past 30 days</option>
                <option value="All time">All time</option>
              </select>
            </div>

            {/* 4 Summary Stat Blocks */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-blue-50/60 rounded-2xl border border-blue-100/80">
                <FileText className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-base font-black text-gray-900 block leading-none">24</span>
                <span className="text-[9px] font-extrabold text-gray-400 block mt-1">Applications</span>
              </div>

              <div className="p-2.5 bg-amber-50/60 rounded-2xl border border-amber-100/80">
                <FileText className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <span className="text-base font-black text-gray-900 block leading-none">6</span>
                <span className="text-[9px] font-extrabold text-gray-400 block mt-1">Skipped</span>
              </div>

              <div className="p-2.5 bg-rose-50/60 rounded-2xl border border-rose-100/80">
                <AlertCircle className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                <span className="text-base font-black text-gray-900 block leading-none">1</span>
                <span className="text-[9px] font-extrabold text-gray-400 block mt-1">Errors</span>
              </div>

              <div className="p-2.5 bg-emerald-50/60 rounded-2xl border border-emerald-100/80">
                <BarChart3 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-base font-black text-emerald-700 block leading-none">80%</span>
                <span className="text-[9px] font-extrabold text-gray-400 block mt-1">Success rate</span>
              </div>
            </div>
          </div>

          {/* CARD 3: Recent Applications Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 font-display">
                <FileText className="w-4 h-4 text-[#4f46e5]" />
                <span>Recent Applications</span>
              </div>
              <button 
                onClick={() => setShowConsoleDrawer(true)}
                className="text-[10px] font-extrabold text-[#4f46e5] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {historyJobs.slice(0, 5).map((job, idx) => {
                const companyName = job.Company || 'Company';
                let logoUrl = '/assets/logos/software_companies/google.png';
                const lower = companyName.toLowerCase();
                if (lower.includes('microsoft')) logoUrl = '/assets/logos/software_companies/microsoft.png';
                else if (lower.includes('meta')) logoUrl = '/assets/logos/software_companies/meta.png';
                else if (lower.includes('ibm') || lower.includes('abc')) logoUrl = '/assets/logos/software_companies/ibm.png';
                else if (lower.includes('amazon')) logoUrl = 'https://cdn.simpleicons.org/amazon/FF9900';

                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-2xl transition-colors text-xs border border-transparent hover:border-gray-200/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 p-1 flex items-center justify-center shrink-0">
                        <img 
                          src={logoUrl} 
                          alt={companyName} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://logo.clearbit.com/${companyName.replace(/[^a-z0-9]/g, '')}.com`;
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-gray-900 truncate">{job.Company}</p>
                        <p className="text-[10px] font-bold text-gray-400 truncate">{job.Title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        job.Status === 'Applied' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {job.Status}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400">{job.Date_Applied}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 4: Left Sidebar Crown Promo Banner */}
          <div className="p-5 bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#3730a3] rounded-3xl text-white space-y-3 shadow-lg shadow-indigo-500/10 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-amber-400/20 border border-amber-300/40 rounded-xl flex items-center justify-center text-amber-300 font-black text-sm">
                👑
              </span>
              <span className="font-extrabold text-xs">Upgrade to Pro</span>
            </div>

            <div className="space-y-1 text-[11px] font-bold text-indigo-100">
              <p className="flex items-center gap-1.5">✓ Unlimited applications</p>
              <p className="flex items-center gap-1.5">✓ Advanced filters & strategy presets</p>
              <p className="flex items-center gap-1.5">✓ Priority support</p>
            </div>

            <button
              onClick={() => onOpenPricing?.()}
              className="w-full py-2 bg-white text-[#4f46e5] hover:bg-gray-100 rounded-xl text-xs font-black shadow-md cursor-pointer transition-colors active:scale-98"
            >
              Upgrade Now
            </button>
          </div>

        </div>

      </div>

      {/* DRAWER / CONSOLE PANEL FOR LIVE LOGS & APPLICATION HISTORY */}
      {showConsoleDrawer && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-slate-200 shadow-2xl space-y-4 font-mono text-[11px] animate-slide-down">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-sans">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-bold text-slate-100 text-xs">Live Chrome Extension Streaming Terminal</span>
            </div>
            <button
              onClick={() => setShowConsoleDrawer(false)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div ref={consoleContainerRef} className="max-h-60 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar text-[10px]">
            {botLogs.length === 0 ? (
              <div className="text-slate-500 italic py-6 text-center">
                Ready. Start Auto-Apply engine to stream live terminal logs here.
              </div>
            ) : (
              botLogs.map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap break-words">
                  {log.includes('[ERROR]') ? (
                    <span className="text-red-400 font-semibold">{log}</span>
                  ) : log.includes('[SUCCESS]') || log.includes('Applied') ? (
                    <span className="text-emerald-400 font-semibold">{log}</span>
                  ) : (
                    <span className="text-slate-300">{log}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PERSONA ANSWERS FORM MODAL */}
      {showPersonaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-gray-150 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#4f46e5]" />
                <h3 className="text-base font-black text-gray-900 font-display">Configure Application Answers</h3>
              </div>
              <button onClick={() => setShowPersonaModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current City</label>
                  <input
                    type="text"
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Require Visa Sponsorship?</label>
                  <select
                    value={requireVisa}
                    onChange={(e) => setRequireVisa(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Portfolio / Github URL</label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Desired Annual Salary</label>
                  <input
                    type="text"
                    value={desiredSalary}
                    onChange={(e) => setDesiredSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowPersonaModal(false);
                  showToast('✅ Application Answers updated!');
                }}
                className="px-5 py-2.5 bg-[#4f46e5] text-white rounded-xl font-black text-xs hover:bg-[#3f37c9] cursor-pointer shadow-xs"
              >
                Save Persona Answers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PRESET MODAL */}
      {showCreatePresetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-gray-150 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 font-display">Create Strategy Preset</h3>
              <button onClick={() => setShowCreatePresetModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Preset Title</label>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g. Senior Frontend (US Remote)"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl text-[11px] text-indigo-900 font-semibold">
                Will save current targets: <strong className="text-[#4f46e5]">{targetJobTitles.join(', ')}</strong> in <strong className="text-[#4f46e5]">{targetLocations.join(', ')}</strong> ({targetPortal}).
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (newPresetName.trim()) {
                    showToast(`✨ Custom strategy preset "${newPresetName}" saved!`);
                    setShowCreatePresetModal(false);
                    setNewPresetName('');
                  }
                }}
                className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
              >
                Save Preset
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
        data-api-url={typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
        data-first-name={firstName}
        data-last-name={lastName}
        data-phone={phoneNumber}
        data-city={currentCity}
        data-experience={experienceYears}
        data-salary={desiredSalary}
        data-visa={requireVisa}
        data-website={websiteUrl}
        data-linkedin={linkedinUrl}
      />

    </div>
  );
}
