import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Upload, Plus, Search, Trash2, Printer, ArrowRight, ArrowLeft, Check, CheckCircle2, 
  X, AlertCircle, ExternalLink, FileText, BookOpen, Briefcase, Award, LayoutGrid, Activity, 
  Columns, Eye, Settings, Undo, Redo, ZoomIn, ZoomOut, Copy, History, Sliders, Info, ShieldCheck, 
  ChevronRight, Calendar, MapPin, Mail, Phone, Globe, Trash, RefreshCw, User, Award as CertIcon
} from 'lucide-react';
import ResumeTemplateRenderer from './ResumeTemplateRenderer';
import { TemplateId } from './ResumeBuilder';

interface WorkExp {
  company: string;
  role: string;
  dates: string;
  description: string;
  technologies?: string;
}

interface Education {
  school: string;
  degree: string;
  year: string;
  gpa?: string;
  coursework?: string;
}

interface Project {
  title: string;
  technologies: string;
  description: string;
}

interface SkillsGrouped {
  languages: string;
  frameworks: string;
  tools: string;
  competencies: string;
}

interface ResumeVersion {
  id: string;
  name: string;
  atsScore: number;
  lastUpdated: string;
  version: string;
  summary: string;
  skills: SkillsGrouped;
  experience: WorkExp[];
  education: Education[];
  projects: Project[];
  certifications: string[];
}

interface Resume {
  id: string;
  name: string;
  targetRole: string;
  targetCompany: string;
  atsScore: number;
  lastUpdated: string;
  version: string;
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  skills: SkillsGrouped;
  experience: WorkExp[];
  education: Education[];
  projects: Project[];
  certifications: string[];
  versions: ResumeVersion[];
}

interface ResumeStudioProps {
  userProfile: {
    name?: string;
    role?: string;
    email?: string;
    skills?: string[];
    resumeText?: string;
  };
  onOpenPricing?: () => void;
}

type StudioStep = 
  | 'home'
  | 'import'
  | 'profile'
  | 'jobMatch'
  | 'jobMatchDetails'
  | 'tailor'
  | 'tailorSummary'
  | 'editor'
  | 'review'
  | 'export'
  | 'versions'
  | 'compare';

const TEMPLATE_OPTIONS = [
  { id: 'executive_ceo', name: 'Executive CEO', tag: 'Classic C-Suite', category: 'Executive' },
  { id: 'ivy_league', name: 'Ivy League', tag: 'Academic & Finance', category: 'Corporate' },
  { id: 'tech_engineer', name: 'Tech Engineer', tag: 'High-Density ATS', category: 'Technical' },
  { id: 'corporate_pm', name: 'Senior PM', tag: 'Product & Management', category: 'Corporate' },
  { id: 'teal_executive', name: 'Modern Teal', tag: 'Contemporary', category: 'Modern' },
  { id: 'sidebar', name: 'Split Sidebar', tag: 'Two-Column Tech', category: 'Technical' },
  { id: 'indigo', name: 'Indigo Startup', tag: 'Modern Web', category: 'Modern' },
  { id: 'slate', name: 'Slate Corporate', tag: 'Minimalist', category: 'Corporate' },
  { id: 'emerald', name: 'Emerald Fresh', tag: 'Badge Grid', category: 'Modern' }
] as const;

const DEFAULT_RESUME: Resume = {
  id: 'resume-1',
  name: 'General Resume',
  targetRole: 'Software Engineer',
  targetCompany: 'General',
  atsScore: 78,
  lastUpdated: '10 mins ago',
  version: 'v1',
  personal: {
    name: 'Aravind Sharma',
    title: 'Full-Stack Software Engineer',
    email: 'aravind.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, India',
    github: 'github.com/aravindsharma',
    linkedin: 'linkedin.com/in/aravindsharma',
    portfolio: 'aravindsharma.dev'
  },
  summary: 'Detail-oriented and results-driven software engineer with 3+ years of experience specializing in building scalable web applications. Proficient in React, Node.js, and cloud databases, with a track record of improving application efficiency.',
  skills: {
    languages: 'TypeScript, JavaScript, Python, SQL, C++',
    frameworks: 'React, Node.js, Next.js, Express, Tailwind CSS',
    tools: 'Git, Docker, AWS, PostgreSQL, Supabase, Redis',
    competencies: 'Full-Stack Development, System Architecture, REST APIs, UI/UX Design'
  },
  experience: [
    {
      company: 'AppInnovate Technologies',
      role: 'Software Engineer',
      dates: '2023 - Present',
      description: '• Developed responsive web applications using React and TypeScript, boosting client engagement by 25%.\n• Built and documented RESTful microservices in Node.js connected to PostgreSQL databases.\n• Streamlined deployments by migrating local backend instances to Docker and AWS ECS.',
      technologies: 'React, TypeScript, Node.js, Docker, AWS, PostgreSQL'
    },
    {
      company: 'TechSoft Solutions',
      role: 'Junior Engineer',
      dates: '2021 - 2023',
      description: '• Collaborated in a team of 5 using Git to build custom administration portals for retail businesses.\n• Wrote database migration scripts and optimized querying speed, decreasing page loads by 12%.\n• Integrated payment services and transactional notification layers via SendGrid.',
      technologies: 'JavaScript, Node.js, Express, MongoDB, Git'
    }
  ],
  education: [
    {
      school: 'National Institute of Technology',
      degree: 'B.Tech in Computer Science & Engineering',
      year: '2017 - 2021',
      gpa: '8.4 CGPA',
      coursework: 'Data Structures, Database Management, Software Engineering, Cloud Computing'
    }
  ],
  projects: [
    {
      title: 'Scalable Microservices Gateway',
      technologies: 'Node.js, Redis, AWS Lambda',
      description: 'Engineered a secure microservices API gateway handling 15,000+ daily sessions, caching routing maps via Redis for sub-10ms response checks.'
    }
  ],
  certifications: [
    'AWS Certified Solutions Architect - Associate',
    'Google Cloud Certified Professional Cloud Developer'
  ],
  versions: []
};

export default function ResumeStudio({ userProfile, onOpenPricing }: ResumeStudioProps) {
  // Stepper flow configuration
  const steps: { label: StudioStep; display: string }[] = [
    { label: 'import', display: 'Import' },
    { label: 'profile', display: 'Profile' },
    { label: 'jobMatch', display: 'Job Match' },
    { label: 'tailor', display: 'Tailor' },
    { label: 'editor', display: 'Design' },
    { label: 'review', display: 'Review' },
    { label: 'export', display: 'Export' }
  ];

  // Core resume list states
  const [resumes, setResumes] = useState<Resume[]>(() => {
    try {
      const saved = localStorage.getItem('jobmerge_studio_resumes');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [DEFAULT_RESUME];
  });
  
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || 'resume-1');
  const [currentStep, setCurrentStep] = useState<StudioStep>('home');
  const [autosaveIndicator, setAutosaveIndicator] = useState('Saved just now');

  // Active working states
  const activeResume = resumes.find(r => r.id === selectedResumeId) || DEFAULT_RESUME;

  // Standalone fields sync'ed to activeResume
  const [personal, setPersonal] = useState(activeResume.personal);
  const [summary, setSummary] = useState(activeResume.summary);
  const [skillsGrouped, setSkillsGrouped] = useState<SkillsGrouped>(activeResume.skills);
  const [experience, setExperience] = useState<WorkExp[]>(activeResume.experience);
  const [education, setEducation] = useState<Education[]>(activeResume.education);
  const [projects, setProjects] = useState<Project[]>(activeResume.projects);
  const [certifications, setCertifications] = useState<string[]>(activeResume.certifications);
  const [certInput, setCertInput] = useState('');

  // Sync to hooks when active resume changes
  useEffect(() => {
    setPersonal(activeResume.personal);
    setSummary(activeResume.summary);
    setSkillsGrouped(activeResume.skills);
    setExperience(activeResume.experience);
    setEducation(activeResume.education);
    setProjects(activeResume.projects);
    setCertifications(activeResume.certifications);
  }, [selectedResumeId]);

  // Sync back to resumes list & localStorage
  useEffect(() => {
    setResumes(prev => prev.map(r => r.id === selectedResumeId ? {
      ...r,
      personal,
      summary,
      skills: skillsGrouped,
      experience,
      education,
      projects,
      certifications
    } : r));
    setAutosaveIndicator('Saving...');
    const timer = setTimeout(() => setAutosaveIndicator('Saved just now'), 400);
    return () => clearTimeout(timer);
  }, [personal, summary, skillsGrouped, experience, education, projects, certifications, selectedResumeId]);
  
  // Job Match State
  const [jobDescription, setJobDescription] = useState(localStorage.getItem('jobmerge_last_jd') || '');
  const [isMatching, setIsMatching] = useState(false);
  const [jobMatchResult, setJobMatchResult] = useState<{
    role: string;
    company: string;
    experience: string;
    location: string;
    requiredSkills: string[];
    preferredSkills: string[];
    matchedKeywords: string[];
    missingKeywords: string[];
    matchScore: number;
  } | null>(null);

  // AI Tailoring state
  const [tailorRecommendations, setTailorRecommendations] = useState<{
    id: string;
    section: 'summary' | 'experience' | 'skills';
    index?: number;
    before: string;
    after: string;
    why: string;
    status: 'pending' | 'accepted' | 'rejected';
  }[]>([]);

  // Design Studio settings
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>('executive_ceo');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [highlightKeywords, setHighlightKeywords] = useState(true);
  const [designSettings, setDesignSettings] = useState({
    font: 'sans',
    fontSize: 'balanced',
    spacing: 'balanced',
    layout: 'single-column'
  });

  // History & Compare state
  const [compareVersionIds, setCompareVersionIds] = useState<{ a: string; b: string } | null>(null);

  // Drag and drop / extraction upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionStage, setExtractionStage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const [keywordsToHighlight, setKeywordsToHighlight] = useState<string[]>(['React', 'TypeScript', 'Next.js', 'Docker', 'REST APIs', 'Tailwind CSS', 'AWS', 'CI/CD']);

  // Stepper helper
  const goToStep = (step: StudioStep) => {
    setCurrentStep(step);
  };

  const handleNextStep = () => {
    const currentIndex = steps.findIndex(s => s.label === currentStep);
    if (currentIndex !== -1 && currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1].label);
    }
  };

  const handlePrevStep = () => {
    const currentIndex = steps.findIndex(s => s.label === currentStep);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1].label);
    } else {
      goToStep('home');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Create new resume flow
  const handleCreateNew = () => {
    const newResume: Resume = {
      ...DEFAULT_RESUME,
      id: `resume-${Date.now()}`,
      name: `Untitled Resume (${resumes.length + 1})`,
      lastUpdated: 'Just now',
      version: 'v1',
      versions: []
    };
    setResumes([...resumes, newResume]);
    setSelectedResumeId(newResume.id);
    goToStep('import');
  };

  // Upload handler simulating AI extraction pipeline
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    simulateExtraction();
  };

  const simulateExtraction = () => {
    setUploadProgress(10);
    setExtractionStage('Reading document...');
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            goToStep('profile');
            setUploadProgress(0);
          }, 500);
          return 100;
        }
        const next = prev + 25;
        if (next === 35) setExtractionStage('Extracting experience & timeline...');
        if (next === 60) setExtractionStage('Identifying technical skills...');
        if (next === 85) setExtractionStage('Structuring profile layers...');
        return next;
      });
    }, 600);
  };

  // Job analysis trigger
  const handleAnalyzeJob = () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 50) return;
    setIsMatching(true);

    setTimeout(() => {
      // Mocked high-end Job match insights
      const match = {
        role: 'Frontend Development Engineer',
        company: 'Microsoft',
        experience: '2–4 years',
        location: 'Hyderabad / Hybrid',
        requiredSkills: ['React', 'TypeScript', 'Next.js', 'REST APIs', 'Data Structures'],
        preferredSkills: ['AWS', 'Docker', 'CI/CD', 'Tailwind CSS'],
        matchedKeywords: ['React', 'TypeScript', 'Docker', 'REST APIs', 'Tailwind CSS'],
        missingKeywords: ['Next.js', 'AWS', 'CI/CD'],
        matchScore: 87
      };
      setJobMatchResult(match);
      setIsMatching(false);

      // Populate tailoring recommendations
      setTailorRecommendations([
        {
          id: 'rec-1',
          section: 'summary',
          before: summary,
          after: 'Driven software engineer specializing in building responsive web applications using React, TypeScript, and Next.js. Experienced in designing microservices and integrating REST APIs with secure authentication wrappers.',
          why: 'The job description explicitly prioritizes Next.js and REST API integration as core responsibilities.',
          status: 'pending'
        },
        {
          id: 'rec-2',
          section: 'experience',
          index: 0,
          before: experience[0]?.description || '',
          after: '• Engineered client-facing web application pages in React and Next.js using component architecture.\n• Designed and integrated high-throughput REST APIs using Node.js for backend services.\n• Maintained code version stability using Git workflows and deployed staging containers to Docker.',
          why: 'Weaves in target keywords Next.js and REST APIs to align experience bullets directly with the qualifications.',
          status: 'pending'
        }
      ]);
    }, 1200);
  };

  // Apply Tayloring change actions
  const handleAcceptTailoring = (id: string) => {
    setTailorRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
  };

  const handleRejectTailoring = (id: string) => {
    setTailorRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  const handleApplyTailoredChanges = () => {
    // Create new version in timeline
    const newVersion: ResumeVersion = {
      id: `ver-${Date.now()}`,
      name: `${activeResume.targetCompany} Tailored Version`,
      atsScore: 94,
      lastUpdated: 'Just now',
      version: `v${activeResume.versions.length + 2}`,
      summary: summary,
      skills: { ...skillsGrouped },
      experience: experience.map(e => ({ ...e })),
      education: education.map(e => ({ ...e })),
      projects: projects.map(p => ({ ...p })),
      certifications: [...certifications]
    };

    let updatedSummary = summary;
    let updatedExperience = experience.map(e => ({ ...e }));
    let updatedSkills = { ...skillsGrouped };

    tailorRecommendations.forEach(rec => {
      if (rec.status === 'accepted') {
        if (rec.section === 'summary') {
          updatedSummary = rec.after;
        }
        if (rec.section === 'experience' && rec.index !== undefined) {
          updatedExperience[rec.index].description = rec.after;
        }
      }
    });

    // Boost matched keywords to skills list
    if (jobMatchResult) {
      updatedSkills.frameworks = [...new Set([...updatedSkills.frameworks.split(',').map(s => s.trim()), 'Next.js'])].join(', ');
      updatedSkills.tools = [...new Set([...updatedSkills.tools.split(',').map(s => s.trim()), 'CI/CD', 'AWS'])].join(', ');
    }

    setSummary(updatedSummary);
    setExperience(updatedExperience);
    setSkillsGrouped(updatedSkills);

    setResumes(prev => prev.map(r => r.id === selectedResumeId ? {
      ...r,
      atsScore: 94,
      version: `v${r.versions.length + 2}`,
      versions: [newVersion, ...r.versions]
    } : r));

    goToStep('tailorSummary');
  };

  // Add / remove handlers for lists
  const addWork = () => setExperience([...experience, { company: '', role: '', dates: '', description: '', technologies: '' }]);
  const removeWork = (idx: number) => setExperience(experience.filter((_, i) => i !== idx));
  const addEdu = () => setEducation([...education, { school: '', degree: '', year: '', coursework: '' }]);
  const removeEdu = (idx: number) => setEducation(education.filter((_, i) => i !== idx));
  const addProj = () => setProjects([...projects, { title: '', technologies: '', description: '' }]);
  const removeProj = (idx: number) => setProjects(projects.filter((_, i) => i !== idx));

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput('');
    }
  };
  const removeCert = (idx: number) => setCertifications(certifications.filter((_, i) => i !== idx));

  // Highlighting parser
  const renderHighlightedText = (text: string) => {
    if (!text) return null;
    if (!highlightKeywords || keywordsToHighlight.length === 0) return text;
    const escaped = keywordsToHighlight
      .map(k => k.trim())
      .filter(Boolean)
      .map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    if (escaped.length === 0) return text;
    const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = keywordsToHighlight.some(kw => kw.toLowerCase() === part.toLowerCase());
          return isMatch ? (
            <span key={i} className="bg-amber-100 text-amber-955 px-1 rounded font-bold border-b border-amber-300 print:bg-transparent print:text-inherit print:border-none print:px-0">
              {part}
            </span>
          ) : part;
        })}
      </>
    );
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-[#fafbfa] text-slate-800 antialiased overflow-hidden">
      
      {/* HEADER SECTION / WORKFLOW STEPPER */}
      <header className="bg-white border-b border-gray-150 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 shadow-xs print:hidden">
        
        {/* Studio Branding & Nav */}
        <div className="flex items-center gap-3">
          <div onClick={() => goToStep('home')} className="cursor-pointer flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black shadow-xs">
              M
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-slate-900 font-display">Resume Studio</h2>
              <p className="text-[10px] font-semibold text-gray-500">{activeResume.name} • {activeResume.version}</p>
            </div>
          </div>
          <span className="text-gray-300">|</span>
          <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>{autosaveIndicator}</span>
          </div>
        </div>

        {/* Dynamic Workflow indicator */}
        {currentStep !== 'home' && (
          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest overflow-x-auto w-full md:w-auto scrollbar-none py-1">
            {steps.map((s, idx) => {
              const isActive = s.label === currentStep || 
                (currentStep === 'jobMatchDetails' && s.label === 'jobMatch') ||
                (currentStep === 'tailorSummary' && s.label === 'tailor');
              return (
                <React.Fragment key={s.label}>
                  {idx > 0 && <span className="text-gray-200">→</span>}
                  <span className={`${isActive ? 'text-indigo-600 font-extrabold' : 'text-gray-400'}`}>
                    {s.display}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Top actions */}
        <div className="flex items-center gap-2">
          {currentStep !== 'home' && (
            <button 
              onClick={handlePrevStep}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
          {currentStep !== 'home' && currentStep !== 'export' && (
            <button 
              onClick={handleNextStep}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1 shadow-xs"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* CORE SCREENS VIEWPORT */}
      <main className="flex-1 min-h-0 relative flex flex-col">
        
        {/* ==================== SCREEN 01: HOME ==================== */}
        {currentStep === 'home' && (
          <div className="flex-grow overflow-y-auto p-6 sm:p-12 max-w-5xl mx-auto w-full space-y-12 animate-fade-in text-left">
            <div className="space-y-3.5">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">JobMerge Professional</span>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 font-display">Build a resume that fits the job.</h1>
              <p className="text-sm text-gray-500 font-medium max-w-xl">
                Import your existing resume or start fresh, then leverage our ATS analyzer to automatically tailor it for target company requirements.
              </p>
            </div>

            {/* Direct action blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div 
                onClick={() => goToStep('import')} 
                className="bg-white p-6 rounded-3xl border border-gray-150 shadow-xs hover:shadow-md hover:border-gray-250 cursor-pointer transition-all flex flex-col justify-between h-[160px]"
              >
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Upload Existing Resume</h3>
                  <p className="text-xs text-gray-505 font-medium mt-0.5">Parse, structure, and optimize an existing PDF or DOCX file.</p>
                </div>
              </div>
              <div 
                onClick={handleCreateNew}
                className="bg-white p-6 rounded-3xl border border-gray-150 shadow-xs hover:shadow-md hover:border-gray-250 cursor-pointer transition-all flex flex-col justify-between h-[160px]"
              >
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Plus className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Start From Scratch</h3>
                  <p className="text-xs text-gray-550 font-medium mt-0.5">Design a blank resume and build sections block-by-block.</p>
                </div>
              </div>
            </div>

            {/* Recent Resumes List Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">My Saved Resumes</h3>
                <button 
                  onClick={handleCreateNew}
                  className="text-xs font-extrabold text-indigo-600 hover:text-indigo-850 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create New
                </button>
              </div>

              {resumes.length === 0 ? (
                /* Empty state */
                <div className="bg-white rounded-3xl p-8 border border-gray-150 text-center space-y-3">
                  <p className="text-sm text-gray-500 font-bold">Your next great application starts here.</p>
                  <button onClick={handleCreateNew} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black">
                    Create your first resume →
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-gray-150 rounded-3xl divide-y divide-gray-100 shadow-xs overflow-hidden">
                  {resumes.map(r => (
                    <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{r.name}</p>
                          <p className="text-[10px] text-gray-505 font-semibold">{r.targetRole} &nbsp;•&nbsp; {r.targetCompany}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-505">
                        <div className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#4f46e5] text-[10px] font-black">
                          {r.atsScore} ATS Score
                        </div>
                        <div className="text-[10px]">Updated {r.lastUpdated}</div>
                        <div className="text-[10px] text-slate-400">{r.version}</div>
                        <button
                          onClick={() => {
                            setSelectedResumeId(r.id);
                            goToStep('editor');
                          }}
                          className="px-3.5 py-1.5 bg-slate-905 hover:bg-slate-800 text-white font-black rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                        >
                          Open →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== SCREEN 02: IMPORT ==================== */}
        {currentStep === 'import' && (
          <div className="flex-grow flex items-center justify-center p-6 bg-[#fafbfa] animate-fade-in text-left">
            <div className="bg-white rounded-3xl border border-gray-150 shadow-md p-8 sm:p-12 max-w-2xl w-full flex flex-col sm:flex-row gap-8 items-start relative overflow-hidden">
              
              {/* Drag and Drop Zone */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-905 font-display">Upload your Resume</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">PDF or Word document format preferred.</p>
                </div>

                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={simulateExtraction}
                  className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer h-[180px] ${
                    dragOver ? 'border-indigo-500 bg-indigo-50/20' : 'border-gray-250 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Upload className="w-7 h-7 text-gray-400" />
                  <p className="text-xs font-bold text-gray-650">Drop your resume here or <span className="text-indigo-600 hover:underline">Browse</span></p>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex justify-between text-[10px] font-black text-slate-705">
                      <span>{extractionStage}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Context Info Panel */}
              <div className="w-full sm:w-[220px] bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4 text-xs font-medium">
                <h4 className="font-extrabold text-slate-800">What we'll extract</h4>
                <ul className="space-y-1.5 text-gray-605 pl-1">
                  <li className="flex items-center gap-1.5">✓ Experience timeline</li>
                  <li className="flex items-center gap-1.5">✓ Technical skills</li>
                  <li className="flex items-center gap-1.5">✓ Personal projects</li>
                  <li className="flex items-center gap-1.5">✓ Education background</li>
                  <li className="flex items-center gap-1.5">✓ Contact details</li>
                </ul>
                <div className="pt-3 border-t border-slate-205 text-[10px] text-gray-400 leading-normal flex items-start gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  <span>Your resume details stay 100% private and secure.</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== SCREEN 03: PROFILE EXTRACTION ==================== */}
        {currentStep === 'profile' && (
          <div className="flex-grow flex flex-col min-h-0 bg-white animate-fade-in text-left">
            
            {/* Top confidence indicator banner */}
            <div className="bg-[#4f46e5]/5 border-b border-[#4f46e5]/10 px-6 py-3 flex justify-between items-center text-xs shrink-0">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>95% Extraction Confidence — Review and verify before continuing</span>
              </div>
              <div className="text-[10px] text-gray-400">Extracted from: general_resume.pdf</div>
            </div>

            {/* Editable Profile area */}
            <div className="flex-grow overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
              
              {/* Personal Info */}
              <div className="border border-gray-150 p-5 rounded-3xl bg-slate-50/50 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-805 tracking-wider">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Full Name</label>
                    <input 
                      type="text" 
                      value={personal.name} 
                      onChange={e => setPersonal({...personal, name: e.target.value})} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Professional Title</label>
                    <input 
                      type="text" 
                      value={personal.title} 
                      onChange={e => setPersonal({...personal, title: e.target.value})} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Email</label>
                    <input 
                      type="text" 
                      value={personal.email} 
                      onChange={e => setPersonal({...personal, email: e.target.value})} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-855 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Phone</label>
                    <input 
                      type="text" 
                      value={personal.phone} 
                      onChange={e => setPersonal({...personal, phone: e.target.value})} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-855 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">LinkedIn Profile</label>
                    <input 
                      type="text" 
                      value={personal.linkedin || ''} 
                      onChange={e => setPersonal({...personal, linkedin: e.target.value})} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-855 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Portfolio URL</label>
                    <input 
                      type="text" 
                      value={personal.portfolio || ''} 
                      onChange={e => setPersonal({...personal, portfolio: e.target.value})} 
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-855 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="border border-gray-150 p-5 rounded-3xl bg-slate-50/50 space-y-2 text-xs">
                <h3 className="font-black uppercase text-slate-805 tracking-wider">Professional Summary</h3>
                <textarea 
                  rows={3} 
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-805 leading-normal resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Grouped Skills */}
              <div className="border border-gray-150 p-5 rounded-3xl bg-slate-50/50 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-805 tracking-wider">Skills Grouped</h3>
                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Languages</label>
                    <input 
                      type="text" 
                      value={skillsGrouped.languages}
                      onChange={e => setSkillsGrouped({...skillsGrouped, languages: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Frameworks & Libraries</label>
                    <input 
                      type="text" 
                      value={skillsGrouped.frameworks}
                      onChange={e => setSkillsGrouped({...skillsGrouped, frameworks: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Tools & Platforms</label>
                    <input 
                      type="text" 
                      value={skillsGrouped.tools}
                      onChange={e => setSkillsGrouped({...skillsGrouped, tools: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-500">Core Competencies</label>
                    <input 
                      type="text" 
                      value={skillsGrouped.competencies}
                      onChange={e => setSkillsGrouped({...skillsGrouped, competencies: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Action Panel */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 shrink-0">
                <button 
                  onClick={() => goToStep('home')}
                  className="px-4 py-2 text-gray-550 font-bold hover:underline"
                >
                  Save & Exit
                </button>
                <button 
                  onClick={() => goToStep('jobMatch')}
                  className="px-5 py-2 bg-[#4f46e5] text-white rounded-xl text-xs font-black hover:bg-[#3f37c9] shadow-xs flex items-center gap-1"
                >
                  <span>Continue to Job Match</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==================== SCREEN 04: JOB MATCH ==================== */}
        {currentStep === 'jobMatch' && (
          <div className="flex-grow grid grid-cols-12 min-h-0 bg-[#fafbfa] text-left animate-fade-in print:hidden">
            
            {/* Left JD entry Panel */}
            <div className="col-span-12 lg:col-span-6 p-6 border-r border-gray-200 flex flex-col space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Job Analyzer</span>
                <h2 className="text-lg font-extrabold text-slate-900 font-display">Target Job Description</h2>
              </div>

              <textarea
                className="flex-1 w-full bg-white border border-gray-200 rounded-3xl p-5 text-xs font-semibold leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                placeholder="Paste the job description here... We'll identify required skills, preferred qualifications, and structural alignment gaps."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />

              <button
                onClick={handleAnalyzeJob}
                disabled={isMatching || jobDescription.trim().length < 50}
                className="w-full py-3 bg-[#4f46e5] hover:bg-[#3f37c9] disabled:bg-gray-200 text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {isMatching ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <>Analyze Job Requirements</>}
              </button>
            </div>

            {/* Right Job Match Analysis results */}
            <div className="col-span-12 lg:col-span-6 p-6 flex flex-col overflow-y-auto scrollbar-thin">
              {!jobMatchResult ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-2 p-10">
                  <LayoutGrid className="w-8 h-8 text-gray-300" />
                  <p className="text-xs font-bold text-gray-505">Your job match metrics will appear here after analysis.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in text-xs font-medium">
                  
                  {/* Headline match details */}
                  <div className="flex justify-between items-center bg-white border border-gray-150 p-5 rounded-3xl shadow-xs">
                    <div>
                      <h3 className="text-md font-extrabold text-slate-900 font-display">{jobMatchResult.role}</h3>
                      <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{jobMatchResult.company} &nbsp;•&nbsp; {jobMatchResult.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-indigo-600">{jobMatchResult.matchScore}%</div>
                      <span className="text-[9px] font-bold text-gray-405">Match score</span>
                    </div>
                  </div>

                  {/* Skills lists */}
                  <div className="bg-white border border-gray-150 p-5 rounded-3xl space-y-4">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wide">Skills alignment</h4>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {jobMatchResult.requiredSkills.map((s, idx) => {
                          const isMatched = jobMatchResult.matchedKeywords.includes(s);
                          return (
                            <span 
                              key={idx} 
                              className={`px-2.5 py-1 rounded-lg font-bold border ${
                                isMatched ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-red-50 text-red-705 border-red-150'
                              }`}
                            >
                              {isMatched ? '✓' : '×'} {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => goToStep('jobMatchDetails')}
                      className="px-4 py-2 border border-gray-200 text-gray-700 font-extrabold rounded-xl hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => goToStep('tailor')}
                      className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black flex items-center gap-1 shadow-xs"
                    >
                      <span>Tailor Resume</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== SCREEN 05: JOB MATCH DETAILS ==================== */}
        {currentStep === 'jobMatchDetails' && (
          <div className="flex-grow overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6 text-left animate-fade-in text-xs font-semibold">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Deep Analysis</span>
              <h2 className="text-xl font-extrabold text-slate-905 font-display mt-0.5">Job Match Details</h2>
            </div>

            <div className="space-y-4 divide-y divide-gray-150 bg-white border border-gray-150 rounded-3xl p-6 shadow-xs">
              <div className="pb-4 space-y-3">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wide">Requirement Mapping</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-extrabold text-slate-900">React</p>
                      <p className="text-[10px] text-gray-505 font-medium mt-0.5">Found in: Experience + Skills</p>
                    </div>
                    <span className="text-emerald-600 font-extrabold">✓ Strong Match</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-extrabold text-slate-900">Next.js</p>
                      <p className="text-[10px] text-gray-505 font-medium mt-0.5">Found in: Skills list only</p>
                    </div>
                    <span className="text-amber-600 font-extrabold">△ Partial Match</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-extrabold text-slate-900">AWS Cloud</p>
                      <p className="text-[10px] text-gray-505 font-medium mt-0.5">Not found in profile</p>
                    </div>
                    <span className="text-red-500 font-extrabold">× Missing</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => goToStep('jobMatch')} className="px-4 py-2 border border-gray-200 text-gray-700 font-extrabold rounded-xl">
                Back to Match Screen
              </button>
              <button onClick={() => goToStep('tailor')} className="px-4.5 py-2 bg-[#4f46e5] text-white rounded-xl font-black">
                Tailor My Resume
              </button>
            </div>
          </div>
        )}

        {/* ==================== SCREEN 06: AI TAILORING ==================== */}
        {currentStep === 'tailor' && (
          <div className="flex-grow flex flex-col min-h-0 bg-[#fafbfa] animate-fade-in text-left print:hidden">
            
            {/* Top Score Transition banner */}
            <div className="bg-slate-905 text-white px-6 py-3 flex justify-between items-center text-xs shrink-0 font-bold">
              <div>Tailor resume for: <span className="text-indigo-400">Microsoft — Frontend Development Engineer</span></div>
              <div className="flex items-center gap-2">
                <span>ATS Match Projection:</span>
                <span className="text-amber-400">87%</span>
                <span>→</span>
                <span className="text-emerald-400">94%</span>
              </div>
            </div>

            {/* Recommendations stack */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
              
              {tailorRecommendations.map(rec => (
                <div key={rec.id} className="bg-white border border-gray-150 rounded-3xl p-5 shadow-xs space-y-4 text-xs font-semibold relative overflow-hidden">
                  
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    rec.status === 'accepted' ? 'bg-emerald-500' : rec.status === 'rejected' ? 'bg-red-500' : 'bg-indigo-500'
                  }`}></div>

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Suggested Rewrite</span>
                      <h4 className="text-sm font-extrabold text-slate-805 mt-0.5 uppercase tracking-wide">
                        {rec.section === 'summary' ? 'Summary Section' : `Experience bullet`}
                      </h4>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRejectTailoring(rec.id)}
                        className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          rec.status === 'rejected' ? 'bg-red-55 text-red-700 border-red-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleAcceptTailoring(rec.id)}
                        className={`px-3.5 py-1.5 border rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                          rec.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-600 text-white hover:bg-indigo-705 border-transparent'
                        }`}
                      >
                        {rec.status === 'accepted' ? 'Accepted ✓' : 'Accept'}
                      </button>
                    </div>
                  </div>

                  {/* Before / After comparisons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-gray-150 space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Before</p>
                      <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-line">{rec.before}</p>
                    </div>
                    <div className="bg-indigo-50/20 p-4 rounded-2xl border border-indigo-100/50 space-y-1">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">AI Proposed Version</p>
                      <p className="text-slate-800 font-bold leading-relaxed whitespace-pre-line">{rec.after}</p>
                    </div>
                  </div>

                  {/* Why Explainer */}
                  <div className="p-3 bg-slate-50 rounded-2xl text-[10px] text-gray-505 flex items-start gap-1.5">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <p><span className="font-bold text-gray-705">Why this improves match:</span> {rec.why}</p>
                  </div>

                </div>
              ))}

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button onClick={() => goToStep('jobMatch')} className="px-4 py-2 text-gray-550 font-bold hover:underline">
                  Review Manually
                </button>
                <button 
                  onClick={handleApplyTailoredChanges}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md"
                >
                  Apply Accepted Changes →
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==================== SCREEN 07: TAILORING SUMMARY ==================== */}
        {currentStep === 'tailorSummary' && (
          <div className="flex-grow flex items-center justify-center p-6 bg-[#fafbfa] animate-fade-in text-left">
            <div className="bg-white border border-gray-150 p-8 sm:p-12 rounded-3xl shadow-md max-w-xl w-full text-center space-y-6">
              
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-900 font-display">Your resume is tailored!</h2>
                <p className="text-xs text-gray-505 font-medium">Factual timeline has been preserved. Match score successfully updated.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-gray-150 text-center">
                <div>
                  <p className="text-xl font-black text-indigo-650">94%</p>
                  <span className="text-[9px] font-bold text-gray-400">Match score</span>
                </div>
                <div>
                  <p className="text-xl font-black text-emerald-600">+7%</p>
                  <span className="text-[9px] font-bold text-gray-400">Keyword match</span>
                </div>
                <div>
                  <p className="text-xl font-black text-slate-805">+2</p>
                  <span className="text-[9px] font-bold text-gray-400">Optimizations</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-left border-t border-gray-100 pt-4">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wide">Applied Changes</h4>
                <ul className="space-y-1.5 text-gray-600">
                  <li className="flex items-center gap-1.5">✓ Professional summary rephrased to emphasize Next.js</li>
                  <li className="flex items-center gap-1.5">✓ Tech Stack list updated with target keywords</li>
                  <li className="flex items-center gap-1.5">✓ AppInnovate experience bullet optimization accepted</li>
                </ul>
              </div>

              <button 
                onClick={() => goToStep('editor')}
                className="w-full py-3 bg-[#4f46e5] text-white hover:bg-[#3f37c9] font-black rounded-2xl text-xs"
              >
                Design Resume
              </button>

            </div>
          </div>
        )}

        {/* ==================== SCREEN 08: EDITOR ==================== */}
        {currentStep === 'editor' && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#fafbfa] border-t border-gray-150 print:bg-white print:border-none">
            
            {/* LEFT SIDEBAR: CONTENT EDITORS */}
            <aside className="w-full lg:w-[280px] bg-white border-r border-gray-150 p-5 flex flex-col space-y-4 shrink-0 lg:h-full lg:overflow-y-auto scrollbar-thin text-left print:hidden">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">Content Outline</span>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mt-0.5">Resume Sections</h3>
              </div>

              <div className="space-y-1 text-xs font-extrabold text-gray-600">
                {[
                  { label: 'Personal details', icon: User },
                  { label: 'Professional summary', icon: Award },
                  { label: 'Technical skills', icon: LayoutGrid },
                  { label: 'Experience timeline', icon: Briefcase },
                  { label: 'Education credentials', icon: BookOpen },
                  { label: 'Certifications', icon: CertIcon }
                ].map((sec, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => goToStep('profile')}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50/80 hover:text-slate-900 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <sec.icon className="w-4 h-4 text-slate-400" />
                      <span>{sec.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                ))}
              </div>

              {/* Version timeline trigger */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => goToStep('versions')}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <History className="w-4 h-4" />
                  <span>Version History ({activeResume.versions.length + 1})</span>
                </button>
              </div>
            </aside>

            {/* CENTER CANVAS: A4 SHEET PREVIEW */}
            <div className="flex-1 flex flex-col items-center p-4 sm:p-8 lg:overflow-y-auto scrollbar-thin print:p-0 print:overflow-visible">
              
              {/* Zoom and Preview Toolbar */}
              <div className="w-full max-w-[620px] bg-white border border-gray-200 px-4 py-2.5 rounded-2xl flex items-center justify-between mb-4 shadow-xs text-xs font-bold text-gray-550 print:hidden">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                  <select
                    value={activeTemplate}
                    onChange={(e) => setActiveTemplate(e.target.value as TemplateId)}
                    className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {TEMPLATE_OPTIONS.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setZoomLevel(prev => Math.max(70, prev - 10))} className="p-1 hover:bg-gray-55 rounded"><ZoomOut className="w-3.5 h-3.5" /></button>
                    <span>{zoomLevel}%</span>
                    <button onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))} className="p-1 hover:bg-gray-55 rounded"><ZoomIn className="w-3.5 h-3.5" /></button>
                  </div>
                  <span className="text-gray-200">|</span>
                  <button 
                    onClick={() => setHighlightKeywords(!highlightKeywords)} 
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] flex items-center gap-1 ${
                      highlightKeywords ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white text-gray-550 border-gray-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Highlights: {highlightKeywords ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Sheet container */}
              <div 
                id="resume-printable-sheet"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className={`w-full max-w-[620px] min-h-[820px] bg-white rounded-2xl shadow-xl border border-gray-250/90 p-8 sm:p-10 text-gray-900 transition-all print:shadow-none print:p-0 print:rounded-none print:max-w-none print:border-none ${
                  activeTemplate === 'sidebar' ? 'p-0 overflow-hidden' : ''
                }`}
              >
                <ResumeTemplateRenderer 
                  template={activeTemplate}
                  personal={activeResume.personal}
                  summary={highlightKeywords ? renderHighlightedText(activeResume.summary) : activeResume.summary}
                  experience={highlightKeywords ? activeResume.experience.map(exp => ({ ...exp, description: renderHighlightedText(exp.description) })) : activeResume.experience}
                  education={activeResume.education}
                  projects={highlightKeywords ? activeResume.projects.map(proj => ({ ...proj, description: renderHighlightedText(proj.description) })) : activeResume.projects}
                  skills={activeResume.skills}
                  certifications={activeResume.certifications}
                />
              </div>

            </div>

            {/* RIGHT SIDEBAR: DESIGN SETTINGS & ATS SCORES */}
            <aside className="w-full lg:w-[300px] bg-white border-l border-gray-150 p-5 flex flex-col space-y-5 shrink-0 lg:h-full lg:overflow-y-auto scrollbar-thin text-left print:hidden">
              
              {/* Score breakdown panel */}
              <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">ATS live report</h4>
                  <span className="text-lg font-black text-indigo-650">{activeResume.atsScore} / 100</span>
                </div>

                <div className="space-y-2 text-[10px] font-bold text-gray-500">
                  {[
                    { label: 'Keyword match density', val: 95 },
                    { label: 'Technical skills relevance', val: 92 },
                    { label: 'Format structures compliance', val: 98 },
                    { label: 'Sections order & clarity', val: 96 }
                  ].map((stat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between">
                        <span>{stat.label}</span>
                        <span>{stat.val}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full">
                        <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${stat.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => goToStep('review')}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200 text-xs font-black rounded-xl"
                >
                  Improve with AI
                </button>
              </div>

              {/* Design Controls */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-gray-100">Design Styles</h4>
                
                <div className="space-y-3 text-xs font-bold text-gray-500">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400">Typography Font</label>
                    <select 
                      value={designSettings.font}
                      onChange={e => setDesignSettings({...designSettings, font: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    >
                      <option value="sans">Clean Sans-Serif (Arial, Helvetica)</option>
                      <option value="serif">Classic Serif (Georgia, Times)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400">Page Margins & Spacing</label>
                    <select
                      value={designSettings.spacing}
                      onChange={e => setDesignSettings({...designSettings, spacing: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 font-extrabold focus:outline-none"
                    >
                      <option value="compact">Compact (Maximum Density)</option>
                      <option value="balanced">Balanced (Recommended)</option>
                      <option value="spacious">Spacious (Clean & Airy)</option>
                    </select>
                  </div>
                </div>
              </div>

            </aside>

          </div>
        )}

        {/* ==================== SCREEN 09 & 10: ATS DETAILS / LIVE ANALYSIS ==================== */}
        {currentStep === 'review' && (
          <div className="flex-grow overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6 text-left animate-fade-in text-xs font-semibold">
            
            {/* Checklist */}
            <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Quality Assurance</span>
                <h3 className="text-lg font-extrabold text-slate-905 font-display mt-0.5">Final Resume Checklist</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                {[
                  'Contact details complete (Phone, Email, LinkedIn)',
                  'Summary optimized with target position keywords',
                  'Factual work dates & timelines verified',
                  'Grouped technical skills configured',
                  'Certifications & Achievements aligned',
                  'Spelling check completed without issues'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements Suggestions */}
            <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-805 uppercase tracking-wide">Suggested Improvements</h3>
              
              <div className="space-y-3">
                <div className="p-4.5 bg-amber-50/50 border border-amber-200 rounded-2xl flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-amber-900">Add measurable outcomes</h4>
                    <p className="text-amber-800 text-[10px] font-medium leading-relaxed">
                      Your work experience details have 2 bullet points without measurable impact stats. Adding numeric metrics boosts recruiter interest.
                    </p>
                  </div>
                  <button className="px-3 py-1.5 bg-amber-605 text-white rounded-xl text-[10px] font-black">
                    Improve with AI
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button onClick={() => goToStep('editor')} className="px-4 py-2 border border-gray-200 text-gray-700 font-extrabold rounded-xl">
                Back to Design Editor
              </button>
              <button 
                onClick={() => goToStep('export')}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-xs flex items-center gap-1"
              >
                <span>Proceed to Export</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ==================== SCREEN 12: EXPORT ==================== */}
        {currentStep === 'export' && (
          <div className="flex-grow flex items-center justify-center p-6 bg-[#fafbfa] animate-fade-in text-left print:hidden">
            <div className="bg-white border border-gray-150 p-8 sm:p-12 rounded-3xl shadow-md max-w-2xl w-full space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-905 font-display">Your resume is ready for download.</h2>
                <p className="text-xs text-gray-500 font-semibold">Tailored successfully for Microsoft — Frontend Development Engineer (ATS: 94)</p>
              </div>

              {/* Download options grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-extrabold text-slate-700">
                <div className="bg-slate-50 border border-gray-150 p-5 rounded-2xl flex flex-col justify-between h-[130px] shadow-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-900 font-display">PDF Document</h4>
                    <p className="text-[10px] text-gray-450 font-medium mt-0.5">Best for quick applications.</p>
                  </div>
                  <button 
                    onClick={handlePrint}
                    className="w-full py-2 bg-slate-905 hover:bg-slate-800 text-white rounded-xl text-[10px] cursor-pointer"
                  >
                    Download PDF
                  </button>
                </div>

                <div className="bg-slate-50 border border-gray-150 p-5 rounded-2xl flex flex-col justify-between h-[130px] shadow-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-900 font-display">Word File (DOCX)</h4>
                    <p className="text-[10px] text-gray-450 font-medium mt-0.5">Fully editable local copy.</p>
                  </div>
                  <button 
                    onClick={handlePrint}
                    className="w-full py-2 bg-slate-905 hover:bg-slate-800 text-white rounded-xl text-[10px] cursor-pointer"
                  >
                    Download DOCX
                  </button>
                </div>

                <div className="bg-slate-50 border border-gray-150 p-5 rounded-2xl flex flex-col justify-between h-[130px] shadow-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-900 font-display">Share Link</h4>
                    <p className="text-[10px] text-gray-450 font-medium mt-0.5">Create a public URL copy.</p>
                  </div>
                  <button className="w-full py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-[10px] cursor-pointer">
                    Create link
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button onClick={() => goToStep('editor')} className="text-gray-500 hover:text-gray-800 hover:underline">
                  Back to Editor
                </button>
                <button onClick={() => goToStep('home')} className="px-4 py-2 bg-slate-905 hover:bg-slate-800 text-white rounded-xl cursor-pointer">
                  Exit Studio
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==================== SCREEN 14 & 15: VERSIONS & COMPARISON ==================== */}
        {currentStep === 'versions' && (
          <div className="flex-grow overflow-y-auto p-6 sm:p-10 max-w-3xl mx-auto w-full space-y-6 text-left animate-fade-in text-xs font-semibold">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Timeline</span>
              <h2 className="text-xl font-extrabold text-slate-905 font-display mt-0.5">Resume Version History</h2>
            </div>

            <div className="space-y-4">
              {/* Current Active Version */}
              <div className="bg-white border border-gray-200 p-5 rounded-3xl shadow-xs flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <span>v2</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">Microsoft — Frontend Development Engineer (Active)</p>
                    <p className="text-[10px] text-gray-500 font-semibold mt-0.5">ATS: 94 &nbsp;•&nbsp; Updated Just now</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">Current version</div>
              </div>

              {/* History timeline list */}
              {activeResume.versions.map((ver, idx) => (
                <div key={ver.id} className="bg-white border border-gray-150 p-5 rounded-3xl shadow-xs flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-655 font-extrabold">
                      <span>{ver.version}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-805">{ver.name}</p>
                      <p className="text-[10px] text-gray-550 font-semibold mt-0.5">ATS: {ver.atsScore} &nbsp;•&nbsp; Updated {ver.lastUpdated}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setCompareVersionIds({ a: ver.id, b: 'current' });
                        goToStep('compare');
                      }}
                      className="px-3 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-[10px] font-bold cursor-pointer"
                    >
                      Compare
                    </button>
                    <button 
                      onClick={() => {
                        setSummary(ver.summary);
                        setSkillsGrouped(ver.skills);
                        setExperience(ver.experience);
                        setEducation(ver.education);
                        setProjects(ver.projects);
                        setCertifications(ver.certifications);
                        
                        setResumes(prev => prev.map(r => r.id === selectedResumeId ? {
                          ...r,
                          version: ver.version
                        } : r));
                        
                        goToStep('editor');
                      }}
                      className="px-3 py-1.5 bg-slate-905 text-white rounded-xl text-[10px] font-black cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => goToStep('editor')} className="px-4 py-2 border border-gray-200 text-gray-700 font-extrabold rounded-xl cursor-pointer">
              Back to Design Editor
            </button>
          </div>
        )}

        {/* ==================== SCREEN 15: COMPARE ==================== */}
        {currentStep === 'compare' && compareVersionIds && (
          <div className="flex-grow flex flex-col min-h-0 bg-[#fafbfa] text-left animate-fade-in text-xs font-semibold">
            
            {/* Split layout comparison */}
            <div className="flex-1 grid grid-cols-12 min-h-0 divide-x divide-gray-200">
              <div className="col-span-6 p-6 overflow-y-auto space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display">Original Version (A)</h3>
                
                <div className="bg-white border border-gray-150 p-5 rounded-3xl space-y-4">
                  <div>
                    <p className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">Summary</p>
                    <p className="text-gray-655 font-medium leading-relaxed mt-1">
                      Detail-oriented and results-driven software engineer with 3+ years of experience specializing in building scalable web applications.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-6 p-6 overflow-y-auto space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest font-display text-indigo-650">Optimized Version (B)</h3>
                
                <div className="bg-white border border-indigo-150 p-5 rounded-3xl space-y-4 shadow-sm">
                  <div>
                    <p className="font-extrabold text-[10px] text-indigo-500 uppercase tracking-wider">Summary</p>
                    <p className="text-slate-800 font-bold leading-relaxed mt-1">
                      Driven software engineer specializing in building responsive web applications using <span className="bg-amber-100 text-amber-900 font-black px-1 rounded">React</span>, <span className="bg-amber-100 text-amber-900 font-black px-1 rounded">TypeScript</span>, and <span className="bg-amber-100 text-amber-900 font-black px-1 rounded">Next.js</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex justify-between shrink-0">
              <button onClick={() => goToStep('versions')} className="px-4 py-2 border border-gray-200 text-gray-700 font-extrabold rounded-xl cursor-pointer">
                Back to Version History
              </button>
              <button onClick={() => goToStep('editor')} className="px-4.5 py-2 bg-slate-905 text-white rounded-xl cursor-pointer">
                Keep Current
              </button>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
