import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Globe, Award, Briefcase, BookOpen, 
  Sparkles, Check, Trash2, Plus, Download, RefreshCw, Printer, ShieldAlert, ChevronRight, LayoutGrid, CheckCircle2,
  Columns, Eye, FileText
} from 'lucide-react';
import { UserProfile } from '../types';
import ResumeWizard from './ResumeWizard';
import ResumeTemplateRenderer from './ResumeTemplateRenderer';

interface ResumeBuilderProps {
  userProfile: UserProfile;
  onOpenPricing?: () => void;
}

interface WorkExp {
  company: string;
  role: string;
  dates: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  year: string;
  gpa: string;
}

interface Project {
  title: string;
  technologies: string;
  description: string;
}

export type TemplateId = 
  | 'executive_ceo'
  | 'ivy_league'
  | 'tech_engineer'
  | 'corporate_pm'
  | 'teal_executive'
  | 'sidebar'
  | 'indigo'
  | 'slate'
  | 'emerald';

interface TemplateOption {
  id: TemplateId;
  name: string;
  tag: string;
  category: 'Executive' | 'Corporate' | 'Technical' | 'Modern';
  description: string;
  badgeBg: string;
  badgeText: string;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'executive_ceo',
    name: 'Executive CEO & C-Suite',
    tag: 'Classic Formal',
    category: 'Executive',
    description: 'Double rule executive top header, Demonstrated Achievements checkmarks, and 3-column Core Competencies.',
    badgeBg: 'bg-slate-900',
    badgeText: 'text-white'
  },
  {
    id: 'ivy_league',
    name: 'Ivy League / Harvard Classic',
    tag: 'Academic & Finance',
    category: 'Executive',
    description: 'Centered header, elegant serif typography, clean full-bleed horizontal dividers, top education standard.',
    badgeBg: 'bg-amber-900',
    badgeText: 'text-amber-100'
  },
  {
    id: 'tech_engineer',
    name: 'Tech & Engineer (ATS-Direct)',
    tag: 'High Density ATS',
    category: 'Technical',
    description: 'Top-right contact stack, sharp section underlines, bulleted project tech stacks for engineering roles.',
    badgeBg: 'bg-gray-800',
    badgeText: 'text-gray-100'
  },
  {
    id: 'corporate_pm',
    name: 'Corporate Senior PM',
    tag: 'Product & Mgmt',
    category: 'Corporate',
    description: 'Navy subtitle bar, shaded section title blocks, 3-column competencies matrix, metric highlight focus.',
    badgeBg: 'bg-blue-900',
    badgeText: 'text-blue-100'
  },
  {
    id: 'teal_executive',
    name: 'Modern Teal Executive',
    tag: 'Contemporary',
    category: 'Corporate',
    description: 'Crisp teal section headers, bold role titles, bulleted competencies, and refined spacing.',
    badgeBg: 'bg-teal-700',
    badgeText: 'text-teal-50'
  },
  {
    id: 'sidebar',
    name: 'Modern Split Sidebar',
    tag: 'Two-Column Tech',
    category: 'Modern',
    description: 'Dark left sidebar for contact & skills, spacious right main column for summary & work experience.',
    badgeBg: 'bg-[#353df6]',
    badgeText: 'text-white'
  },
  {
    id: 'indigo',
    name: 'Indigo Modern Startup',
    tag: 'Startup & Web',
    category: 'Modern',
    description: 'Vibrant indigo section accents, clean right-aligned contact details, sleek divider rules.',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-indigo-50'
  },
  {
    id: 'slate',
    name: 'Slate Minimal Corporate',
    tag: 'Executive Minimalist',
    category: 'Executive',
    description: 'Dark slate accent bar, crisp uppercase font headers, formal divider rules.',
    badgeBg: 'bg-slate-700',
    badgeText: 'text-slate-100'
  },
  {
    id: 'emerald',
    name: 'Emerald Fresh Tech',
    tag: 'Tech Badge Grid',
    category: 'Technical',
    description: 'Emerald green header grid, rounded skill badge pills, green section headers.',
    badgeBg: 'bg-emerald-700',
    badgeText: 'text-emerald-50'
  }
];

export default function ResumeBuilder({ userProfile, onOpenPricing }: ResumeBuilderProps) {
  // View mode switcher: 'split' | 'form' | 'preview'
  const [viewMode, setViewMode] = useState<'split' | 'form' | 'preview'>('split');

  // ── Load persisted resume data from localStorage (populated by JD Optimizer or autosave) ──
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('jobmerge_resume_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };

  const savedData = loadSavedData();
  const wasOptimized = localStorage.getItem('jobmerge_resume_optimized') === 'true';

  // Show a toast banner if data came from JD Optimizer
  const [showOptimizedBanner, setShowOptimizedBanner] = useState(wasOptimized);

  useEffect(() => {
    if (wasOptimized) {
      // Clear the flag so banner only shows once
      localStorage.removeItem('jobmerge_resume_optimized');
      setTimeout(() => setShowOptimizedBanner(false), 6000);
    }
  }, []);

  // ── AI Resume Wizard state variables ──
  const [showWizard, setShowWizard] = useState(false);
  const [highlightKeywords, setHighlightKeywords] = useState(true);
  
  const loadSavedKeywords = () => {
    try {
      const saved = localStorage.getItem('jobmerge_resume_keywords');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  };
  const [keywordsToHighlight, setKeywordsToHighlight] = useState<string[]>(loadSavedKeywords());

  // Helper to highlight extracted JD keywords in text
  const renderHighlightedText = (text: string) => {
    if (!text) return null;
    if (!highlightKeywords || keywordsToHighlight.length === 0) {
      return text;
    }
    const escapedKws = keywordsToHighlight
      .map(k => k.trim())
      .filter(Boolean)
      .map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    if (escapedKws.length === 0) {
      return text;
    }
    const regex = new RegExp(`\\b(${escapedKws.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => {
          const isMatch = keywordsToHighlight.some(kw => kw.toLowerCase() === part.toLowerCase());
          return isMatch ? (
            <span key={i} className="bg-amber-100 text-amber-950 px-1 rounded font-bold border-b border-amber-300 print:bg-transparent print:text-inherit print:border-none print:px-0">
              {part}
            </span>
          ) : part;
        })}
      </>
    );
  };

  const renderHighlightedSkill = (skill: string) => {
    if (!highlightKeywords || keywordsToHighlight.length === 0) return skill;
    const isMatch = keywordsToHighlight.some(kw => kw.toLowerCase() === skill.toLowerCase());
    return isMatch ? (
      <span className="bg-amber-100 text-amber-950 font-black px-1.5 py-0.5 rounded border-b border-amber-300 print:bg-transparent print:text-inherit print:border-none print:px-0">
        {skill}
      </span>
    ) : skill;
  };

  // Resume details state — prefers saved/optimized data, then userProfile, then sensible empty defaults
  const [personal, setPersonal] = useState({
    name: userProfile.name || '',
    title: userProfile.role || '',
    email: userProfile.email || '',
    phone: savedData?.phone || '',
    location: savedData?.location || '',
    github: savedData?.github || '',
    linkedin: savedData?.linkedin || ''
  });

  const [summary, setSummary] = useState(
    savedData?.summary || userProfile.resumeText || ''
  );

  const [skills, setSkills] = useState<string[]>(
    savedData?.skills?.length > 0 ? savedData.skills
    : userProfile.skills?.length > 0 ? userProfile.skills
    : []
  );
  const [skillInput, setSkillInput] = useState('');

  const [experience, setExperience] = useState<WorkExp[]>(
    savedData?.experience?.length > 0 ? savedData.experience : [
      {
        company: '',
        role: '',
        dates: '',
        description: ''
      }
    ]
  );

  const [education, setEducation] = useState<Education[]>(
    savedData?.education?.length > 0 ? savedData.education : [
      {
        school: '',
        degree: '',
        year: '',
        gpa: ''
      }
    ]
  );

  const [projects, setProjects] = useState<Project[]>(
    savedData?.projects?.length > 0 ? savedData.projects : [
      {
        title: '',
        technologies: '',
        description: ''
      }
    ]
  );

  // ── Autosave all resume data to localStorage on every change ──
  useEffect(() => {
    try {
      localStorage.setItem('jobmerge_resume_data', JSON.stringify({
        summary, skills, experience, education, projects,
        phone: personal.phone, location: personal.location,
        github: personal.github, linkedin: personal.linkedin
      }));
    } catch (e) {}
  }, [summary, skills, experience, education, projects, personal]);

  // Selected Template Style
  const [template, setTemplate] = useState<TemplateId>('executive_ceo');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Executive' | 'Corporate' | 'Technical' | 'Modern'>('All');


  // Auto fill from userProfile state
  const handleAutoFill = () => {
    setPersonal({
      name: userProfile.name || '',
      title: userProfile.role || '',
      email: userProfile.email || '',
      phone: personal.phone,
      location: personal.location,
      github: personal.github,
      linkedin: personal.linkedin
    });
    if (userProfile.skills?.length) {
      setSkills(userProfile.skills);
    }
    if (userProfile.resumeText) {
      setSummary(userProfile.resumeText.split('\n\n')[1] || userProfile.resumeText);
    }
  };

  // Add items functions
  const addWork = () => {
    setExperience([...experience, { company: '', role: '', dates: '', description: '' }]);
  };

  const removeWork = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addEdu = () => {
    setEducation([...education, { school: '', degree: '', year: '', gpa: '' }]);
  };

  const removeEdu = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addProj = () => {
    setProjects([...projects, { title: '', technologies: '', description: '' }]);
  };

  const removeProj = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Skill handlers
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredTemplates = categoryFilter === 'All' 
    ? TEMPLATE_OPTIONS 
    : TEMPLATE_OPTIONS.filter(t => t.category === categoryFilter);

  const userPlan = userProfile.plan || 'Free';

  return (
    <div className="space-y-6 animate-fade-in flex-1 flex flex-col lg:overflow-hidden h-full">
      
      {/* Active Plan Quota Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 border border-indigo-150 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-gray-800 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#4f46e5] shrink-0" />
          <span>Active Plan: <strong className="text-gray-900">{userPlan === 'Accelerator' ? 'VIP Accelerator (Unlimited Resumes)' : userPlan === 'Pro' ? 'Job Hunter Pro (15 Resumes)' : 'Free Starter (1 Resume Limit)'}</strong></span>
        </div>
        <button
          onClick={onOpenPricing}
          className="px-3.5 py-1.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs active:scale-98"
        >
          {userPlan === 'Free' ? 'Upgrade to Pro →' : 'Manage Plan'}
        </button>
      </div>

      {/* JD Optimizer Success Banner */}
      {showOptimizedBanner && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-4 flex items-center gap-3 animate-fade-in print:hidden">
          <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-extrabold text-emerald-800">🎯 JD Optimizer Applied!</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Your resume summary and skills have been updated with AI-optimized content from the job description. Review and customize below.
            </p>
          </div>
          <button
            onClick={() => setShowOptimizedBanner(false)}
            className="text-emerald-400 hover:text-emerald-600 cursor-pointer shrink-0"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
      )}

      {/* Top Header & Compact Template Selector Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-xs space-y-4 shrink-0 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-display">Resume Builder & Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4f46e5] text-[10px] font-black tracking-wide uppercase border border-indigo-100">9 ATS Templates</span>
            </div>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Recruiter-tested, ATS-optimized executive & technical formats.</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            {/* Template Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-2xl">
              <LayoutGrid className="w-3.5 h-3.5 text-[#4f46e5]" />
              <span className="text-xs font-bold text-gray-400">Template:</span>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as TemplateId)}
                className="bg-transparent text-xs font-black text-gray-900 focus:outline-none cursor-pointer"
              >
                {TEMPLATE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.tag})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'split' ? 'bg-white text-[#4f46e5] shadow-xs font-extrabold' : 'text-gray-500 hover:text-gray-800'
                }`}
                title="Split View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                onClick={() => setViewMode('form')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'form' ? 'bg-white text-[#4f46e5] shadow-xs font-extrabold' : 'text-gray-500 hover:text-gray-800'
                }`}
                title="Form Only Mode"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Form</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'preview' ? 'bg-white text-[#4f46e5] shadow-xs font-extrabold' : 'text-gray-500 hover:text-gray-800'
                }`}
                title="Preview Only Mode"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>

            <button
              onClick={handleAutoFill}
              className="px-3.5 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Auto-fill
            </button>

            <button
              onClick={() => setShowWizard(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-505 hover:to-indigo-650 text-white rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-98"
              title="Launch AI Resume wizard"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              AI Wizard
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#4f46e5] text-white hover:bg-[#3f37c9] rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-0 lg:overflow-hidden pb-4">
        
        {/* Left Column: Input Form (Scrollable) */}
        {(viewMode === 'split' || viewMode === 'form') && (
          <div className={`space-y-6 lg:h-full lg:overflow-y-auto pr-1 pb-4 scrollbar-thin print:hidden ${
            viewMode === 'form' ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-6'
          }`}>
          
          {/* Section: Personal Info */}
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 bg-blue-50 text-[#353df6] rounded-lg flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 font-display">Personal Details</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-500">Full Name</label>
                <input 
                  type="text" 
                  value={personal.name} 
                  onChange={e => setPersonal({...personal, name: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-500">Professional Title</label>
                <input 
                  type="text" 
                  value={personal.title} 
                  onChange={e => setPersonal({...personal, title: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-500">Email Address</label>
                <input 
                  type="email" 
                  value={personal.email} 
                  onChange={e => setPersonal({...personal, email: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-500">Phone Number</label>
                <input 
                  type="text" 
                  value={personal.phone} 
                  onChange={e => setPersonal({...personal, phone: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-500">Location (City, Country)</label>
                <input 
                  type="text" 
                  value={personal.location} 
                  onChange={e => setPersonal({...personal, location: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-500">LinkedIn Profile</label>
                <input 
                  type="text" 
                  value={personal.linkedin} 
                  onChange={e => setPersonal({...personal, linkedin: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                />
              </div>
            </div>
          </div>

          {/* Section: Professional Summary */}
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 bg-blue-50 text-[#353df6] rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 font-display">Professional Summary</h3>
            </div>
            
            <div className="space-y-1 text-xs">
              <label className="font-bold text-gray-500">Write a short executive overview of your career & impact</label>
              <textarea 
                rows={3}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#353df6] resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section: Work Experience */}
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 text-[#353df6] rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Work Experience</h3>
              </div>
              <button 
                onClick={addWork}
                className="text-[10px] font-extrabold uppercase tracking-wide text-[#353df6] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            </div>

            <div className="space-y-4 divide-y divide-gray-100">
              {experience.map((work, idx) => (
                <div key={idx} className={`space-y-3 text-xs ${idx > 0 ? 'pt-4' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#353df6]">Job Role #{idx + 1}</span>
                    <button 
                      onClick={() => removeWork(idx)} 
                      className="text-red-500 hover:text-red-700 flex items-center gap-0.5 font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-400">Company Name</label>
                      <input 
                        type="text" 
                        value={work.company}
                        onChange={e => {
                          const updated = [...experience];
                          updated[idx].company = e.target.value;
                          setExperience(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-400">Role / Designation</label>
                      <input 
                        type="text" 
                        value={work.role}
                        onChange={e => {
                          const updated = [...experience];
                          updated[idx].role = e.target.value;
                          setExperience(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-400">Date Range (e.g. 2022 - Present)</label>
                      <input 
                        type="text" 
                        value={work.dates}
                        onChange={e => {
                          const updated = [...experience];
                          updated[idx].dates = e.target.value;
                          setExperience(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-400">Key Achievements / Bullet Points</label>
                    <textarea 
                      rows={3}
                      value={work.description}
                      onChange={e => {
                        const updated = [...experience];
                        updated[idx].description = e.target.value;
                        setExperience(updated);
                      }}
                      className="w-full bg-gray-50 border border-gray-150 rounded-lg p-2.5 text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#353df6] resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Education */}
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 text-[#353df6] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Education</h3>
              </div>
              <button 
                onClick={addEdu}
                className="text-[10px] font-extrabold uppercase tracking-wide text-[#353df6] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add School
              </button>
            </div>

            <div className="space-y-4 divide-y divide-gray-100">
              {education.map((edu, idx) => (
                <div key={idx} className={`space-y-3 text-xs ${idx > 0 ? 'pt-4' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#353df6]">Education #{idx + 1}</span>
                    <button 
                      onClick={() => removeEdu(idx)} 
                      className="text-red-500 hover:text-red-700 flex items-center gap-0.5 font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-gray-400">School / University</label>
                      <input 
                        type="text" 
                        value={edu.school}
                        onChange={e => {
                          const updated = [...education];
                          updated[idx].school = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-400">Degree / Branch</label>
                      <input 
                        type="text" 
                        value={edu.degree}
                        onChange={e => {
                          const updated = [...education];
                          updated[idx].degree = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-400">Year / Score</label>
                      <input 
                        type="text" 
                        value={edu.year}
                        onChange={e => {
                          const updated = [...education];
                          updated[idx].year = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Technical Skills */}
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 bg-blue-50 text-[#353df6] rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 font-display">Technical Skills & Competencies</h3>
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input 
                type="text"
                placeholder="Enter skill (e.g. System Architecture, Python)"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-[#353df6] text-white rounded-xl font-bold text-xs hover:bg-[#252ccb] cursor-pointer"
              >
                Add Skill
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 bg-gray-50 border border-gray-250 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  {skill}
                  <button 
                    type="button"
                    onClick={() => removeSkill(idx)} 
                    className="text-red-400 hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section: Projects */}
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-50 text-[#353df6] rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Key Projects & Highlights</h3>
              </div>
              <button 
                onClick={addProj}
                className="text-[10px] font-extrabold uppercase tracking-wide text-[#353df6] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            <div className="space-y-4 divide-y divide-gray-100">
              {projects.map((proj, idx) => (
                <div key={idx} className={`space-y-3 text-xs ${idx > 0 ? 'pt-4' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#353df6]">Project #{idx + 1}</span>
                    <button 
                      onClick={() => removeProj(idx)} 
                      className="text-red-500 hover:text-red-700 flex items-center gap-0.5 font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-400">Project Title</label>
                      <input 
                        type="text" 
                        value={proj.title}
                        onChange={e => {
                          const updated = [...projects];
                          updated[idx].title = e.target.value;
                          setProjects(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-400">Technologies</label>
                      <input 
                        type="text" 
                        value={proj.technologies}
                        onChange={e => {
                          const updated = [...projects];
                          updated[idx].technologies = e.target.value;
                          setProjects(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-400">Description / Metrics</label>
                    <textarea 
                      rows={2}
                      value={proj.description}
                      onChange={e => {
                        const updated = [...projects];
                        updated[idx].description = e.target.value;
                        setProjects(updated);
                      }}
                      className="w-full bg-gray-50 border border-gray-150 rounded-lg p-2.5 text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#353df6] resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Right Column: High-Fidelity Resume Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`lg:h-full lg:overflow-y-auto pb-6 print:w-full print:p-0 print:h-auto print:overflow-visible ${
            viewMode === 'preview' ? 'lg:col-span-12 flex justify-center w-full' : 'lg:col-span-6 lg:sticky lg:top-4'
          }`}>
            
            <div className="bg-slate-100/90 p-4 sm:p-6 rounded-3xl border border-slate-200/90 flex flex-col items-center shadow-xs min-h-full print:bg-white print:border-none print:p-0">
              {/* Preview Canvas Top Header */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4 print:hidden text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black tracking-wider uppercase text-slate-800 font-display">Live A4 Paper Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs">A4 Format</span>
                  
                  {keywordsToHighlight.length > 0 && (
                    <button 
                      onClick={() => setHighlightKeywords(!highlightKeywords)} 
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all border shadow-xs ${
                        highlightKeywords 
                          ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                      title="Toggle keyword highlighting on the preview"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Highlight: {highlightKeywords ? 'ON' : 'OFF'}
                    </button>
                  )}

                  <button 
                    onClick={handlePrint} 
                    className="px-3.5 py-1.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> Save PDF
                  </button>
                </div>
              </div>

              {/* Sheet layout */}
              <div 
                id="resume-printable-sheet" 
                className={`w-full max-w-[620px] min-h-[820px] bg-white rounded-2xl shadow-xl shadow-slate-300/40 p-8 sm:p-10 text-gray-900 print:shadow-none print:p-0 print:rounded-none print:max-w-none transition-all border border-gray-200/90 ${
                  template === 'sidebar' ? 'p-0 overflow-hidden' : ''
                }`}
              >
              
              <ResumeTemplateRenderer
                template={template}
                personal={personal}
                summary={highlightKeywords ? renderHighlightedText(summary) : summary}
                experience={highlightKeywords ? experience.map(exp => ({ ...exp, description: renderHighlightedText(exp.description) })) : experience}
                education={education}
                projects={highlightKeywords ? projects.map(proj => ({ ...proj, description: renderHighlightedText(proj.description) })) : projects}
                skills={highlightKeywords ? skills.map(skill => renderHighlightedSkill(skill)) : skills}
              />

            </div>
          </div>

        </div>
        )}

      </div>

      <ResumeWizard 
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onGenerate={(data, kws) => {
          if (data.personal) {
            setPersonal({
              name: data.personal.name || '',
              title: data.personal.title || '',
              email: data.personal.email || '',
              phone: data.personal.phone || '',
              location: data.personal.location || '',
              github: data.personal.github || '',
              linkedin: data.personal.linkedin || ''
            });
          }
          if (data.summary) setSummary(data.summary);
          if (data.skills) setSkills(data.skills);
          if (data.experience) setExperience(data.experience);
          if (data.education) setEducation(data.education);
          if (data.projects) setProjects(data.projects);
          
          setKeywordsToHighlight(kws);
          setHighlightKeywords(true);
          
          try {
            localStorage.setItem('jobmerge_resume_keywords', JSON.stringify(kws));
            localStorage.setItem('jobmerge_resume_data', JSON.stringify({
              summary: data.summary,
              skills: data.skills,
              experience: data.experience,
              education: data.education,
              projects: data.projects,
              phone: data.personal?.phone || '',
              location: data.personal?.location || '',
              github: data.personal?.github || '',
              linkedin: data.personal?.linkedin || ''
            }));
          } catch (e) {}
        }}
      />

    </div>
  );
}
