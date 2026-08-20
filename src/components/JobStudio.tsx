import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Globe, Award, Briefcase, BookOpen, 
  Sparkles, Check, Trash2, Plus, Download, RefreshCw, Printer, ShieldAlert, ChevronRight, LayoutGrid, CheckCircle2,
  Columns, Eye, FileText, ChevronLeft, ArrowRight, Activity, Zap, Info, Award as CertIcon
} from 'lucide-react';
import { UserProfile } from '../types';
import ResumeWizard from './ResumeWizard';
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

interface JobStudioProps {
  userProfile: UserProfile;
  onOpenPricing?: () => void;
}

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

export default function JobStudio({ userProfile, onOpenPricing }: JobStudioProps) {
  // Studio layout settings
  const [showCopilot, setShowCopilot] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  
  // ── Load persisted resume data from localStorage ──
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('jobmerge_resume_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };

  const savedData = loadSavedData();
  
  // Job Description Copilot states
  const [jobDescription, setJobDescription] = useState(localStorage.getItem('jobmerge_last_jd') || '');
  const [isExtracting, setIsExtracting] = useState(false);
  const [keywords, setKeywords] = useState<{ found: string[]; missing: string[]; priority: string[] } | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsDetails, setAtsDetails] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Resume states
  const [personal, setPersonal] = useState({
    name: userProfile.name || '',
    title: userProfile.role || '',
    email: userProfile.email || '',
    phone: savedData?.phone || '',
    location: savedData?.location || '',
    github: savedData?.github || '',
    linkedin: savedData?.linkedin || '',
    portfolio: savedData?.portfolio || ''
  });

  const [summary, setSummary] = useState(savedData?.summary || userProfile.resumeText || '');
  
  // Logical skills categorization state
  const [skillsGrouped, setSkillsGrouped] = useState<SkillsGrouped>({
    languages: savedData?.skillsGrouped?.languages || 'Python, JavaScript, HTML/CSS, SQL',
    frameworks: savedData?.skillsGrouped?.frameworks || 'React, Flask, Node.js, Express, Tailwind CSS',
    tools: savedData?.skillsGrouped?.tools || 'Git, Supabase, Firebase, MongoDB, Docker, AWS',
    competencies: savedData?.skillsGrouped?.competencies || 'Full-Stack Development, UI/UX Design, API Integration'
  });

  const [experience, setExperience] = useState<WorkExp[]>(
    savedData?.experience || [{ company: '', role: '', dates: '', description: '', technologies: '' }]
  );
  const [education, setEducation] = useState<Education[]>(
    savedData?.education || [{ school: '', degree: '', year: '', gpa: '', coursework: '' }]
  );
  const [projects, setProjects] = useState<Project[]>(
    savedData?.projects || [{ title: '', technologies: '', description: '' }]
  );
  const [certifications, setCertifications] = useState<string[]>(
    savedData?.certifications || ['AWS Certified Solutions Architect', 'Google Cloud Certified Professional']
  );
  
  const [certInput, setCertInput] = useState('');

  // Wizard and Highlights
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
  const [template, setTemplate] = useState<TemplateId>('executive_ceo');

  // Autosave
  useEffect(() => {
    try {
      localStorage.setItem('jobmerge_resume_data', JSON.stringify({
        summary, 
        skillsGrouped, 
        experience, 
        education, 
        projects,
        certifications,
        phone: personal.phone, 
        location: personal.location,
        github: personal.github, 
        linkedin: personal.linkedin,
        portfolio: personal.portfolio
      }));
    } catch (e) {}
  }, [summary, skillsGrouped, experience, education, projects, certifications, personal]);

  useEffect(() => {
    localStorage.setItem('jobmerge_last_jd', jobDescription);
  }, [jobDescription]);

  // Real-time local ATS scorer
  useEffect(() => {
    const text = `${personal.name} ${personal.title} ${summary} ${skillsGrouped.languages} ${skillsGrouped.frameworks} ${skillsGrouped.tools} ${skillsGrouped.competencies} ${experience.map(e => `${e.company} ${e.role} ${e.description} ${e.technologies}`).join(' ')} ${projects.map(p => `${p.title} ${p.description} ${p.technologies}`).join(' ')} ${certifications.join(' ')}`;
    const lowerText = text.toLowerCase();
    
    // Scorer calculation
    let score = 55;
    const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(lowerText);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(lowerText);
    
    if (hasEmail) score += 10;
    if (hasPhone) score += 10;
    if (skillsGrouped.languages.length > 3) score += 5;
    if (skillsGrouped.frameworks.length > 3) score += 5;
    if (experience.length > 0 && experience[0].company) score += 10;
    
    // Keywords matching
    if (keywordsToHighlight.length > 0) {
      const matched = keywordsToHighlight.filter(kw => lowerText.includes(kw.toLowerCase())).length;
      const ratio = matched / keywordsToHighlight.length;
      score += Math.round(ratio * 15);
    }
    
    setAtsScore(Math.min(99, score));
    setAtsDetails(score > 80 ? "Excellent ATS compliance. Resume is optimized with keywords and structured appropriately." : "Moderate ATS match. Try auto-injecting missing keywords to hit a >85 score.");
  }, [personal, summary, skillsGrouped, experience, projects, certifications, keywordsToHighlight]);

  // AI Extractor
  const handleExtractKeywords = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 50) return;
    setIsExtracting(true);
    try {
      const res = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const extracted = data.extractedKeywords || { found: [], missing: [], priority: [] };
      setKeywords(extracted);
      const kws = [...extracted.found, ...extracted.priority];
      setKeywordsToHighlight(kws);
      localStorage.setItem('jobmerge_resume_keywords', JSON.stringify(kws));
    } catch (e) {
      const fallback = {
        found: ['react', 'typescript', 'javascript'],
        missing: ['aws', 'ci/cd', 'docker', 'kubernetes', 'system design', 'agile'],
        priority: ['aws', 'ci/cd', 'docker', 'kubernetes', 'system design']
      };
      setKeywords(fallback);
      setKeywordsToHighlight([...fallback.found, ...fallback.priority]);
    } finally {
      setIsExtracting(false);
    }
  };

  // AI Direct Optimizer
  const handleAutoOptimize = async () => {
    if (!jobDescription) return;
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/optimize-resume-for-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: { summary, skills: Object.values(skillsGrouped).join(', ').split(',').map(s => s.trim()), experience, projects },
          jobDescription,
          missingKeywords: keywords?.missing || keywordsToHighlight.slice(0, 6),
          currentMatchScore: atsScore
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const opt = data.optimizedData;
      if (opt.summary) setSummary(opt.summary);
      if (opt.skills) {
        // split back to categories approximately or add to tools/frameworks
        setSkillsGrouped(prev => ({
          ...prev,
          tools: prev.tools + ', ' + opt.skills.slice(0, 4).join(', ')
        }));
      }
      if (opt.experience) {
        setExperience(opt.experience);
      }
    } catch (e) {
      const kws = keywords?.missing || keywordsToHighlight.slice(0, 4);
      setSkillsGrouped(prev => ({
        ...prev,
        tools: prev.tools + ', ' + kws.join(', ')
      }));
      setSummary(prev => prev + ` Proficient in ${kws.join(', ')}.`);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Add / remove handlers
  const addWork = () => setExperience([...experience, { company: '', role: '', dates: '', description: '', technologies: '' }]);
  const removeWork = (idx: number) => setExperience(experience.filter((_, i) => i !== idx));
  const addEdu = () => setEducation([...education, { school: '', degree: '', year: '', gpa: '', coursework: '' }]);
  const removeEdu = (idx: number) => setEducation(education.filter((_, i) => i !== idx));
  const addProj = () => setProjects([...projects, { title: '', technologies: '', description: '' }]);
  const removeProj = (idx: number) => setProjects(projects.filter((_, i) => i !== idx));
  
  const handlePrint = () => {
    window.print();
  };
  
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

  return (
    <div className="space-y-6 animate-fade-in flex-1 flex flex-col lg:overflow-hidden h-full font-sans text-gray-900 bg-[#f8f9fa] relative">
      
      {/* Active Studio Top Header Bar */}
      <header className="bg-white border-b border-gray-150 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 shadow-xs print:hidden rounded-3xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight font-display text-slate-900">AI Job Studio & Sandbox</h1>
              <p className="text-xs text-gray-500 font-semibold">Integrate keywords, analyze ATS compliance, and build resumes side-by-side.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowCopilot(!showCopilot)}
            className={`px-3.5 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showCopilot 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{showCopilot ? 'Hide AI Copilot' : 'Show AI Copilot'}</span>
          </button>

          <button
            onClick={() => setShowWizard(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Resume Wizard</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 lg:overflow-hidden h-full min-h-0">
        
        {/* PANEL 1: AI COPILOT & ATS ANALYZER (Width: 25% or 3 Cols) */}
        {showCopilot && (
          <div className="col-span-12 lg:col-span-3 bg-white border border-gray-150 rounded-3xl p-5 flex flex-col space-y-5 lg:h-full lg:overflow-y-auto scrollbar-thin shadow-xs text-left print:hidden animate-slide-right">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">AI Copilot</span>
              <h2 className="text-md font-extrabold text-slate-900 font-display mt-0.5">ATS Scanner & Recommendations</h2>
            </div>

            {/* Overall Match Circle */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
              <div className="relative shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke={atsScore && atsScore > 80 ? "#10b981" : "#eab308"} strokeWidth="4" 
                    strokeDasharray={2 * Math.PI * 28} 
                    strokeDashoffset={2 * Math.PI * 28 * (1 - (atsScore || 65) / 100)} 
                  />
                </svg>
                <span className="absolute text-sm font-black text-slate-800">{atsScore}%</span>
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">ATS Match Score</p>
                <p className="text-[10px] text-gray-500 font-semibold leading-tight mt-0.5">{atsDetails}</p>
              </div>
            </div>

            {/* Target Job Description Paste */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Target Job Description</label>
              <textarea
                className="w-full bg-gray-50 border border-gray-150 rounded-xl p-3 text-[11px] font-medium leading-normal placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-[120px] resize-none"
                placeholder="Paste Job Description to run real-time keyword compliance reviews..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <button
                onClick={handleExtractKeywords}
                disabled={isExtracting || jobDescription.trim().length < 50}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-fade-in"
              >
                {isExtracting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>Scan JD Gaps</>
                )}
              </button>
            </div>

            {/* Keywords Analysis lists */}
            {keywordsToHighlight.length > 0 && (
              <div className="space-y-3.5 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Keywords Match Analysis</span>
                  <button 
                    onClick={handleAutoOptimize}
                    disabled={isOptimizing}
                    className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer uppercase"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> Auto-Inject
                  </button>
                </div>

                <div className="space-y-2">
                  {keywords && keywords.missing.length > 0 ? (
                    <div>
                      <p className="text-[10px] text-red-500 font-extrabold mb-1">Missing ({keywords.missing.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {keywords.missing.slice(0, 10).map((kw, i) => (
                          <button
                            key={i}
                            onClick={() => setSkillsGrouped(prev => ({ ...prev, tools: prev.tools ? `${prev.tools}, ${kw}` : kw }))}
                            className="px-2 py-0.5 bg-red-50 hover:bg-emerald-50 text-red-700 hover:text-emerald-800 border border-red-100 hover:border-emerald-250 rounded text-[9px] font-semibold flex items-center gap-0.5 transition-colors cursor-pointer"
                            title="Click to add to skills"
                          >
                            <span>{kw}</span>
                            <span className="font-extrabold text-[10px]">+</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold mb-1">Active Target Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {keywordsToHighlight.slice(0, 10).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[9px] font-semibold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 2: INTERACTIVE EDITOR */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className={`space-y-6 lg:h-full lg:overflow-y-auto pr-1 pb-4 scrollbar-thin text-left print:hidden ${
            showCopilot 
              ? (viewMode === 'editor' ? 'col-span-12 lg:col-span-9 max-w-4xl mx-auto w-full' : 'col-span-12 lg:col-span-4')
              : (viewMode === 'editor' ? 'col-span-12 max-w-4xl mx-auto w-full' : 'col-span-12 lg:col-span-7')
          }`}>
            
            {/* Form: Personal Details */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Full Name</label>
                  <input 
                    type="text" 
                    value={personal.name} 
                    onChange={e => setPersonal({...personal, name: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Professional Title</label>
                  <input 
                    type="text" 
                    value={personal.title} 
                    onChange={e => setPersonal({...personal, title: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Email Address</label>
                  <input 
                    type="email" 
                    value={personal.email} 
                    onChange={e => setPersonal({...personal, email: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Phone Number</label>
                  <input 
                    type="text" 
                    value={personal.phone} 
                    onChange={e => setPersonal({...personal, phone: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Location</label>
                  <input 
                    type="text" 
                    value={personal.location} 
                    onChange={e => setPersonal({...personal, location: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">LinkedIn Profile</label>
                  <input 
                    type="text" 
                    value={personal.linkedin} 
                    onChange={e => setPersonal({...personal, linkedin: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">GitHub Profile</label>
                  <input 
                    type="text" 
                    value={personal.github} 
                    onChange={e => setPersonal({...personal, github: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-400">Portfolio Website</label>
                  <input 
                    type="text" 
                    value={personal.portfolio} 
                    onChange={e => setPersonal({...personal, portfolio: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Form: Summary */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Professional Summary</h3>
              </div>
              <div className="space-y-1 text-xs">
                <textarea 
                  rows={3}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-gray-805 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Form: Grouped Skills Editor */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Technical Skills (Grouped)</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Languages (e.g. Python, JS)</label>
                  <input 
                    type="text" 
                    value={skillsGrouped.languages}
                    onChange={e => setSkillsGrouped({...skillsGrouped, languages: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Frameworks & Libraries (e.g. React, Node.js)</label>
                  <input 
                    type="text" 
                    value={skillsGrouped.frameworks}
                    onChange={e => setSkillsGrouped({...skillsGrouped, frameworks: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-805 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Tools & Platforms (e.g. Git, Docker, AWS)</label>
                  <input 
                    type="text" 
                    value={skillsGrouped.tools}
                    onChange={e => setSkillsGrouped({...skillsGrouped, tools: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-805 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">Core Competencies (e.g. API Integration, UI/UX)</label>
                  <input 
                    type="text" 
                    value={skillsGrouped.competencies}
                    onChange={e => setSkillsGrouped({...skillsGrouped, competencies: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-850 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Form: Work Experience */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 font-display">Work History</h3>
                </div>
                <button 
                  onClick={addWork}
                  className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Job
                </button>
              </div>

              <div className="space-y-4 divide-y divide-gray-100">
                {experience.map((work, idx) => (
                  <div key={idx} className="space-y-3 pt-4 first:pt-0 border-none">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-indigo-600 text-xs">Job Entry #{idx + 1}</span>
                      {experience.length > 1 && (
                        <button 
                          onClick={() => removeWork(idx)} 
                          className="text-red-500 hover:text-red-700 flex items-center gap-0.5 font-bold cursor-pointer text-[10px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
                          className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-805 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-400">Job Title / Role</label>
                        <input 
                          type="text" 
                          value={work.role}
                          onChange={e => {
                            const updated = [...experience];
                            updated[idx].role = e.target.value;
                            setExperience(updated);
                          }}
                          className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-805 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-400">Dates / Years</label>
                        <input 
                          type="text" 
                          value={work.dates}
                          onChange={e => {
                            const updated = [...experience];
                            updated[idx].dates = e.target.value;
                            setExperience(updated);
                          }}
                          className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-805 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-gray-400">Tech Stack Used</label>
                      <input 
                        type="text" 
                        placeholder="e.g. React, Supabase, Tailwind CSS"
                        value={work.technologies || ''}
                        onChange={e => {
                          const updated = [...experience];
                          updated[idx].technologies = e.target.value;
                          setExperience(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-gray-400">Description Bullet Points (Use newlines for separate bullets)</label>
                      <textarea 
                        rows={3}
                        value={work.description}
                        onChange={e => {
                          const updated = [...experience];
                          updated[idx].description = e.target.value;
                          setExperience(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg p-2.5 text-gray-805 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form: Projects */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 font-display">Personal Projects</h3>
                </div>
                <button 
                  onClick={addProj}
                  className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              <div className="space-y-4 divide-y divide-gray-100">
                {projects.map((proj, idx) => (
                  <div key={idx} className="space-y-3 pt-4 first:pt-0 border-none">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-indigo-600 text-xs">Project #{idx + 1}</span>
                      {projects.length > 1 && (
                        <button 
                          onClick={() => removeProj(idx)} 
                          className="text-red-500 hover:text-red-700 flex items-center gap-0.5 font-bold cursor-pointer text-[10px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                          className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-805 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-400">Tech Stack / Technologies</label>
                        <input 
                          type="text" 
                          value={proj.technologies}
                          onChange={e => {
                            const updated = [...projects];
                            updated[idx].technologies = e.target.value;
                            setProjects(updated);
                          }}
                          className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-855 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-gray-400">Description</label>
                      <textarea 
                        rows={2}
                        value={proj.description}
                        onChange={e => {
                          const updated = [...projects];
                          updated[idx].description = e.target.value;
                          setProjects(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg p-2.5 text-gray-855 focus:outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form: Education */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 font-display">Education</h3>
                </div>
                <button 
                  onClick={addEdu}
                  className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Degree
                </button>
              </div>

              <div className="space-y-4 divide-y divide-gray-100">
                {education.map((edu, idx) => (
                  <div key={idx} className="space-y-3 pt-4 first:pt-0 border-none">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-indigo-600 text-xs">Degree Entry #{idx + 1}</span>
                      {education.length > 1 && (
                        <button 
                          onClick={() => removeEdu(idx)} 
                          className="text-red-500 hover:text-red-700 flex items-center gap-0.5 font-bold cursor-pointer text-[10px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-gray-400">School / University</label>
                        <input 
                          type="text" 
                          value={edu.school}
                          onChange={e => {
                            const updated = [...education];
                            updated[idx].school = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-400">Degree (e.g. B.Tech CS)</label>
                        <input 
                          type="text" 
                          value={edu.degree}
                          onChange={e => {
                            const updated = [...education];
                            updated[idx].degree = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-400">Graduation Year</label>
                        <input 
                          type="text" 
                          value={edu.year}
                          onChange={e => {
                            const updated = [...education];
                            updated[idx].year = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-855 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-gray-400">Relevant Coursework & Highlights</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Data Structures, Database Systems, Machine Learning"
                        value={edu.coursework || ''}
                        onChange={e => {
                          const updated = [...education];
                          updated[idx].coursework = e.target.value;
                          setEducation(updated);
                        }}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg px-3 py-2 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form: Certifications & Achievements */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center">
                  <CertIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Certifications & Achievements</h3>
              </div>
              
              <form onSubmit={handleAddCert} className="flex gap-2">
                <input 
                  type="text" 
                  value={certInput}
                  onChange={e => setCertInput(e.target.value)}
                  placeholder="e.g. Founded local Tech Club, Hackathon Winner..."
                  className="flex-1 bg-gray-50 border border-gray-150 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-extrabold cursor-pointer animate-fade-in"
                >
                  Add
                </button>
              </form>

              <div className="space-y-1.5">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-gray-150 rounded-xl text-xs font-bold text-gray-800">
                    <span>{cert}</span>
                    <button 
                      type="button" 
                      onClick={() => removeCert(idx)}
                      className="text-red-500 hover:text-red-700 font-bold ml-1 focus:outline-none"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* PANEL 3: HIGH-FIDELITY PREVIEW */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`lg:h-full lg:overflow-y-auto pb-6 print:w-full print:p-0 print:h-auto print:overflow-visible text-left ${
            showCopilot 
              ? (viewMode === 'preview' ? 'col-span-12' : 'col-span-12 lg:col-span-5')
              : (viewMode === 'preview' ? 'col-span-12 flex justify-center w-full' : 'col-span-12 lg:col-span-5')
          }`}>
            
            <div className="bg-slate-100/90 p-4 sm:p-6 rounded-3xl border border-slate-200/90 flex flex-col items-center shadow-xs min-h-full print:bg-white print:border-none print:p-0">
              
              {/* Preview Canvas Top Header */}
              <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-3 border-b border-slate-200/80 mb-4 print:hidden gap-3 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-indigo-600" />
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as TemplateId)}
                    className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {TEMPLATE_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                      <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
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

              {/* Sheet Layout Canvas */}
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
                  skills={skillsGrouped}
                  certifications={certifications}
                />
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Embedded Resume Wizard Modal */}
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
              linkedin: data.personal.linkedin || '',
              portfolio: data.personal.portfolio || ''
            });
          }
          if (data.summary) setSummary(data.summary);
          
          if (data.skills) {
            // Distribute flat array of skills into grouped fields
            const sks = data.skills;
            setSkillsGrouped({
              languages: sks.slice(0, 4).join(', '),
              frameworks: sks.slice(4, 8).join(', '),
              tools: sks.slice(8, 12).join(', '),
              competencies: sks.slice(12).join(', ')
            });
          }
          
          if (data.experience) setExperience(data.experience);
          if (data.education) setEducation(data.education);
          if (data.projects) setProjects(data.projects);
          
          setKeywordsToHighlight(kws);
          setHighlightKeywords(true);
          
          try {
            localStorage.setItem('jobmerge_resume_keywords', JSON.stringify(kws));
            localStorage.setItem('jobmerge_resume_data', JSON.stringify({
              summary: data.summary,
              skillsGrouped: {
                languages: data.skills?.slice(0, 4).join(', ') || '',
                frameworks: data.skills?.slice(4, 8).join(', ') || '',
                tools: data.skills?.slice(8, 12).join(', ') || '',
                competencies: data.skills?.slice(12).join(', ') || ''
              },
              experience: data.experience,
              education: data.education,
              projects: data.projects,
              phone: data.personal?.phone || '',
              location: data.personal?.location || '',
              github: data.personal?.github || '',
              linkedin: data.personal?.linkedin || '',
              portfolio: data.personal?.portfolio || ''
            }));
          } catch (e) {}
        }}
      />
    </div>
  );
}
