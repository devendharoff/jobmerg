import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Globe, Award, Briefcase, BookOpen, 
  Sparkles, Check, Trash2, Plus, Download, RefreshCw, Printer, ShieldAlert, ChevronRight, LayoutGrid, CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';

interface ResumeBuilderProps {
  userProfile: UserProfile;
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

export default function ResumeBuilder({ userProfile }: ResumeBuilderProps) {
  // Resume details state
  const [personal, setPersonal] = useState({
    name: userProfile.name || 'Devender Singh',
    title: userProfile.role || 'Senior Software Engineer',
    email: userProfile.email || 'devender@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    github: 'github.com/devender',
    linkedin: 'linkedin.com/in/devender'
  });

  const [summary, setSummary] = useState(
    'Passionate and detail-oriented Software Engineer with over 4 years of experience specializing in building responsive, component-driven web applications. Strong expert in JavaScript, TypeScript, and modern frontend environments like React and Next.js.'
  );

  const [skills, setSkills] = useState<string[]>(
    userProfile.skills?.length > 0 ? userProfile.skills : ['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS', 'GraphQL', 'System Design']
  );
  const [skillInput, setSkillInput] = useState('');

  const [experience, setExperience] = useState<WorkExp[]>([
    {
      company: 'Tech Solutions Inc.',
      role: 'Software Engineer',
      dates: '2022 - Present',
      description: '• Developed and optimized client-facing web applications using React and Next.js.\n• Restructured state management to improve dashboard performance by 35%.\n• Mentored junior frontend developers and defined code styling guides.'
    },
    {
      company: 'Innovate Hub',
      role: 'Junior Frontend Developer',
      dates: '2020 - 2022',
      description: '• Built responsive marketing websites and single-page applications.\n• Integrated REST APIs and worked closely with design team to maintain a unified Figma design system library.'
    }
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      school: 'National Institute of Technology',
      degree: 'B.Tech in Computer Science',
      year: '2016 - 2020',
      gpa: '8.4 CGPA'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      title: 'JobMerge Dashboard',
      technologies: 'React, TypeScript, Supabase, Tailwind',
      description: 'Built an interactive dashboard aggregating 50+ job portals with automatic application pipelines, AI matchmaking percentages, and live market metrics.'
    },
    {
      title: 'DevCollab IDE',
      technologies: 'Node.js, Socket.io, React, Express',
      description: 'Created a collaborative browser-based code editor with real-time room sync, chat functionality, and instant test running suites.'
    }
  ]);

  // Selected Template Style
  const [template, setTemplate] = useState<TemplateId>('executive_ceo');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Executive' | 'Corporate' | 'Technical' | 'Modern'>('All');

  // Auto fill from userProfile state
  const handleAutoFill = () => {
    setPersonal({
      name: userProfile.name || 'Devender Singh',
      title: userProfile.role || 'Senior Software Engineer',
      email: userProfile.email || 'devender@example.com',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      github: 'github.com/devender',
      linkedin: 'linkedin.com/in/devender'
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

  return (
    <div className="space-y-6 animate-fade-in flex-1 flex flex-col lg:overflow-hidden h-full">
      
      {/* Top Banner Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-display">Job Ready Resume Builder</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#353df6] text-[10px] font-extrabold tracking-wide uppercase border border-blue-100">9 World-Class Templates</span>
          </div>
          <p className="text-xs font-semibold text-gray-500 mt-0.5">Recruiter-tested, ATS-friendly templates inspired by CEO Executive, Ivy League, Tech Engineering, and Corporate PM formats.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          <button
            onClick={handleAutoFill}
            className="px-4 py-2 border border-gray-150 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Auto-fill Profile
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-[#353df6] text-white hover:bg-[#252ccb] rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#353df6]/15 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Template Selector Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-sm space-y-3 shrink-0 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#353df6]" />
            <h2 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider font-display">Select Resume Template Format</h2>
          </div>
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-xl border border-gray-150 text-[10px] font-bold">
            {(['All', 'Executive', 'Corporate', 'Technical', 'Modern'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  categoryFilter === cat ? 'bg-white text-gray-900 shadow-sm font-black' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Template Cards Row */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {filteredTemplates.map((t) => {
            const isSelected = template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`flex-shrink-0 w-64 p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#353df6] bg-blue-50/40 shadow-sm ring-1 ring-[#353df6]' 
                    : 'border-gray-150 bg-gray-50/60 hover:bg-white hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${t.badgeBg} ${t.badgeText}`}>
                      {t.tag}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#353df6] shrink-0" />
                    )}
                  </div>
                  <h3 className="text-xs font-extrabold text-gray-900 mt-2 tracking-tight">{t.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 min-h-0 lg:overflow-hidden pb-4">
        
        {/* Left Column: Input Form (Scrollable) */}
        <div className="lg:col-span-6 space-y-6 lg:h-full lg:overflow-y-auto pr-1 pb-4 scrollbar-thin print:hidden">
          
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

        {/* Right Column: High-Fidelity Resume Preview Pane */}
        <div className="lg:col-span-6 lg:h-full lg:overflow-y-auto pb-6 print:w-full print:p-0 print:h-auto print:overflow-visible">
          
          <div className="bg-gray-100 p-4 sm:p-6 rounded-3xl border border-gray-150 flex items-center justify-center print:bg-white print:border-none print:p-0">
            {/* Sheet layout */}
            <div 
              id="resume-printable-sheet" 
              className={`w-full max-w-[650px] min-h-[840px] bg-white rounded-xl shadow-xl p-8 text-gray-900 print:shadow-none print:p-0 print:rounded-none print:max-w-none transition-all ${
                template === 'sidebar' ? 'p-0 overflow-hidden' : ''
              }`}
            >
              
              {/* ==================== TEMPLATE 1: EXECUTIVE CEO (Reference Image 1) ==================== */}
              {template === 'executive_ceo' && (
                <div className="space-y-4 font-serif text-gray-900">
                  {/* Top Double Line Header */}
                  <div className="text-center space-y-1">
                    <h1 className="text-xl font-bold tracking-widest uppercase font-serif border-t-2 border-b-2 border-gray-900 py-1.5">
                      {personal.name ? `${personal.name.toUpperCase()} - EXECUTIVE RESUME` : 'EXECUTIVE RESUME SAMPLE'}
                    </h1>
                    <p className="text-[10px] text-gray-700 font-serif pt-1">
                      {personal.location} &nbsp;|&nbsp; {personal.phone} &nbsp;|&nbsp; {personal.email}
                    </p>
                  </div>

                  {/* Subtitle */}
                  <div className="text-center border-b border-gray-400 pb-2">
                    <h2 className="text-sm font-bold tracking-widest uppercase font-serif text-gray-900">
                      {personal.title || 'CHIEF EXECUTIVE OFFICER'}
                    </h2>
                  </div>

                  {/* Summary */}
                  {summary && (
                    <p className="text-[11px] text-gray-800 leading-normal font-serif text-justify">
                      {summary}
                    </p>
                  )}

                  {/* Demonstrated Achievements */}
                  <div className="space-y-1.5">
                    <div className="bg-gray-100 text-center py-1 border-t border-b border-gray-300">
                      <h3 className="text-xs font-bold uppercase tracking-widest font-serif">Demonstrated Achievements</h3>
                    </div>
                    <div className="text-[10px] font-serif space-y-1 px-4">
                      <p className="flex items-start gap-2"><span className="text-gray-900 font-bold">✓</span> Expanded product performance and state architecture driving 35% gain in operational efficiency.</p>
                      <p className="flex items-start gap-2"><span className="text-gray-900 font-bold">✓</span> Spearheaded multi-platform development across web, mobile, and cloud environments.</p>
                      <p className="flex items-start gap-2"><span className="text-gray-900 font-bold">✓</span> Co-founded technology initiatives scaling engineering personnel and customer adoption.</p>
                    </div>
                  </div>

                  {/* Core Competencies Matrix */}
                  <div className="space-y-1.5">
                    <div className="bg-gray-100 text-center py-1 border-t border-b border-gray-300">
                      <h3 className="text-xs font-bold uppercase tracking-widest font-serif">Core Competencies</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] font-serif px-2">
                      {skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900">✓</span> {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Executive Experience */}
                  <div className="space-y-2">
                    <div className="bg-gray-100 text-center py-1 border-t border-b border-gray-300">
                      <h3 className="text-xs font-bold uppercase tracking-widest font-serif">Executive Experience</h3>
                    </div>

                    <div className="space-y-3">
                      {experience.map((work, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-baseline text-xs font-serif">
                            <span className="font-bold uppercase underline">{work.company} &nbsp;|&nbsp; <span className="font-normal no-underline">{personal.location}</span></span>
                            <span className="font-bold">{work.dates}</span>
                          </div>
                          <p className="text-[11px] italic font-bold text-gray-800">{work.role}</p>
                          <p className="text-[10px] text-gray-800 font-serif leading-relaxed whitespace-pre-line pl-2">
                            {work.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education & Projects */}
                  {education.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="bg-gray-100 text-center py-1 border-t border-b border-gray-300">
                        <h3 className="text-xs font-bold uppercase tracking-widest font-serif">Education & Credentials</h3>
                      </div>
                      <div className="space-y-1 text-[10px] font-serif px-2">
                        {education.map((edu, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span><strong className="font-bold">{edu.degree}</strong> &nbsp;—&nbsp; {edu.school}</span>
                            <span className="font-bold">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== TEMPLATE 2: IVY LEAGUE / HARVARD CLASSIC (Reference Image 2) ==================== */}
              {template === 'ivy_league' && (
                <div className="space-y-4 font-serif text-gray-900">
                  {/* Centered Classic Header */}
                  <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold font-serif tracking-tight text-gray-900">{personal.name || 'Charles Bloomberg'}</h1>
                    <p className="text-[10px] font-serif text-gray-600 flex items-center justify-center gap-2">
                      <span>📍 {personal.location}</span>
                      <span>•</span>
                      <span>✉ {personal.email}</span>
                      <span>•</span>
                      <span>☎ {personal.phone}</span>
                    </p>
                  </div>

                  <div className="border-b border-gray-800 pt-1"></div>

                  {/* Education First (Ivy League Standard) */}
                  {education.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-bold uppercase tracking-widest font-serif border-b border-gray-300 pb-0.5">Education</h2>
                      <div className="space-y-2">
                        {education.map((edu, idx) => (
                          <div key={idx} className="text-[11px] font-serif">
                            <div className="flex justify-between font-bold">
                              <span>{edu.degree}</span>
                              <span>{edu.year}</span>
                            </div>
                            <div className="text-gray-700 italic">{edu.school}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest font-serif border-b border-gray-300 pb-0.5">Experience</h2>
                    <div className="space-y-3">
                      {experience.map((work, idx) => (
                        <div key={idx} className="text-[11px] font-serif space-y-0.5">
                          <div className="flex justify-between font-bold">
                            <span>{work.role}</span>
                            <span>{work.dates}</span>
                          </div>
                          <div className="text-gray-700 italic">{work.company} &nbsp;•&nbsp; {personal.location}</div>
                          <p className="text-[10px] text-gray-700 leading-normal pl-2 whitespace-pre-line">{work.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects & Involvement */}
                  {projects.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-bold uppercase tracking-widest font-serif border-b border-gray-300 pb-0.5">Involvement & Projects</h2>
                      <div className="space-y-2">
                        {projects.map((proj, idx) => (
                          <div key={idx} className="text-[11px] font-serif">
                            <div className="flex justify-between font-bold">
                              <span>{proj.title}</span>
                              <span className="text-[10px] text-gray-600 font-normal">{proj.technologies}</span>
                            </div>
                            <p className="text-[10px] text-gray-700 pl-2 leading-tight">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-widest font-serif border-b border-gray-300 pb-0.5">Skills & Qualifications</h2>
                    <p className="text-[10px] font-serif text-gray-800">
                      <strong className="font-bold">Core Skills:</strong> {skills.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* ==================== TEMPLATE 3: TECH ENGINEER ATS DIRECT (Reference Image 3) ==================== */}
              {template === 'tech_engineer' && (
                <div className="space-y-4 font-sans text-gray-900">
                  {/* Top Header Grid */}
                  <div className="flex justify-between items-start border-b-2 border-gray-900 pb-3">
                    <div>
                      <h1 className="text-3xl font-black tracking-tight text-gray-900 font-display">{personal.name || 'Test Name'}</h1>
                      <p className="text-xs font-bold text-gray-600 mt-0.5">{personal.title || 'Controls / Software Engineer'}</p>
                    </div>
                    <div className="text-right text-[10px] font-semibold text-gray-700 space-y-0.5">
                      <p>{personal.email}</p>
                      <p>{personal.linkedin}</p>
                      <p>{personal.phone}</p>
                      <p>{personal.location}</p>
                    </div>
                  </div>

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="space-y-1">
                      <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5">Education</h2>
                      {education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <div>
                            <strong className="font-bold">{edu.degree}</strong>
                            <div className="text-gray-700">{edu.school}</div>
                          </div>
                          <div className="text-right font-bold text-gray-700">
                            <div>{personal.location}</div>
                            <div className="text-[10px]">{edu.year}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Relevant Work Experience */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5">Relevant Work Experience</h2>
                    {experience.map((work, idx) => (
                      <div key={idx} className="space-y-0.5 text-[11px]">
                        <div className="flex justify-between font-bold">
                          <span>{work.company}</span>
                          <span className="text-gray-600">{personal.location}</span>
                        </div>
                        <div className="flex justify-between text-gray-800 italic font-semibold">
                          <span>{work.role}</span>
                          <span className="not-italic text-gray-600">{work.dates}</span>
                        </div>
                        <p className="text-[10px] text-gray-700 pl-3 leading-relaxed whitespace-pre-line">{work.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Project Experience */}
                  {projects.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5">Project Experience</h2>
                      {projects.map((proj, idx) => (
                        <div key={idx} className="space-y-0.5 text-[11px]">
                          <div className="flex justify-between font-bold">
                            <span>{proj.title}</span>
                            <span className="text-[10px] text-gray-600 font-normal">{proj.technologies}</span>
                          </div>
                          <p className="text-[10px] text-gray-700 pl-3 leading-tight">• {proj.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Technical Skills Grouping */}
                  <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5">Technical Skills</h2>
                    <div className="text-[10px] text-gray-800 space-y-1">
                      <p><strong className="font-bold">Proficient in:</strong> {skills.slice(0, 4).join(', ')}</p>
                      <p><strong className="font-bold">Tools & Technologies:</strong> {skills.slice(4).join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TEMPLATE 4: CORPORATE SENIOR PM (Reference Image 4) ==================== */}
              {template === 'corporate_pm' && (
                <div className="space-y-4 font-sans text-gray-900">
                  {/* Name Header */}
                  <div className="text-center space-y-1">
                    <h1 className="text-2xl font-black tracking-widest text-[#0f172a] uppercase font-display">{personal.name || 'ANANYA SINGH'}</h1>
                    <p className="text-[10px] font-bold text-gray-600 tracking-wide">
                      ☎ {personal.phone} &nbsp;|&nbsp; ✉ {personal.email} &nbsp;|&nbsp; 🔗 {personal.linkedin}
                    </p>
                  </div>

                  {/* Subtitle Banner Bar */}
                  <div className="bg-[#0f172a] text-white text-center py-1.5 px-3 rounded">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider">
                      {personal.title || 'SENIOR PRODUCT MANAGER'} — <span className="font-normal italic text-slate-300 text-[10px]">leveraging 4+ years of experience</span>
                    </h2>
                  </div>

                  {/* Profile Summary */}
                  {summary && (
                    <div className="space-y-1">
                      <div className="bg-slate-100 px-2 py-0.5 border-l-4 border-[#0f172a]">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800">PROFILE SUMMARY</h3>
                      </div>
                      <p className="text-[10px] text-gray-700 leading-relaxed px-1 text-justify font-medium">{summary}</p>
                    </div>
                  )}

                  {/* Core Competencies Box */}
                  <div className="space-y-1">
                    <div className="bg-slate-100 px-2 py-0.5 border-l-4 border-[#0f172a]">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800">CORE COMPETENCIES</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px] font-semibold text-slate-800">
                      {skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-[#0f172a] font-bold">•</span> {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Professional Experience */}
                  <div className="space-y-3">
                    <div className="bg-slate-100 px-2 py-0.5 border-l-4 border-[#0f172a]">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800">PROFESSIONAL EXPERIENCE</h3>
                    </div>

                    {experience.map((work, idx) => (
                      <div key={idx} className="space-y-1 text-[10px]">
                        <div className="flex justify-between font-extrabold text-slate-900 border-b border-slate-150 pb-0.5">
                          <span>{work.company}, {personal.location}</span>
                          <span>{work.dates}</span>
                        </div>
                        <div className="font-bold text-slate-800 italic">{work.role}</div>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line pl-1">{work.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="space-y-1">
                      <div className="bg-slate-100 px-2 py-0.5 border-l-4 border-[#0f172a]">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800">EDUCATION</h3>
                      </div>
                      <div className="text-[10px] text-gray-800 space-y-1">
                        {education.map((edu, idx) => (
                          <div key={idx} className="flex justify-between font-semibold">
                            <span><strong>{edu.degree}</strong>, {edu.school}</span>
                            <span className="text-gray-600">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== TEMPLATE 5: MODERN TEAL EXECUTIVE (Reference Image 5) ==================== */}
              {template === 'teal_executive' && (
                <div className="space-y-4 font-sans text-gray-900">
                  {/* Teal Header */}
                  <div className="space-y-1 border-b-2 border-teal-600 pb-3">
                    <h1 className="text-2xl font-black text-teal-800 tracking-tight uppercase font-display">{personal.name || 'EXECUTIVE RESUME'}</h1>
                    <p className="text-xs font-bold text-teal-600">{personal.title || 'Chief Executive Officer'}</p>
                    
                    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-teal-700 pt-1">
                      <span>☎ {personal.phone}</span>
                      <span>✉ {personal.email}</span>
                      <span>📍 {personal.location}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  {summary && (
                    <p className="text-[11px] text-gray-700 leading-relaxed font-medium">{summary}</p>
                  )}

                  {/* Core Competencies */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-extrabold text-teal-700 uppercase tracking-wider">Core Competencies</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-bold text-gray-800">
                      {skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Executive Experience */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-extrabold text-teal-700 uppercase tracking-wider border-b border-teal-100 pb-1">Executive Experience</h2>
                    {experience.map((work, idx) => (
                      <div key={idx} className="space-y-1 text-[11px]">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-gray-900">{work.role}</span>
                          <span className="text-[10px] text-teal-700 italic font-bold">{work.dates}</span>
                        </div>
                        <div className="font-extrabold text-teal-800 text-[10px] uppercase">{work.company}, {personal.location}</div>
                        <p className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-line pl-2">{work.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-extrabold text-teal-700 uppercase tracking-wider border-b border-teal-100 pb-1">Education</h2>
                      {education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] font-semibold">
                          <span className="text-gray-800"><strong>{edu.degree}</strong> &nbsp;—&nbsp; {edu.school}</span>
                          <span className="text-teal-700 font-bold">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== TEMPLATE 6: MODERN SPLIT SIDEBAR ==================== */}
              {template === 'sidebar' && (
                <div className="grid grid-cols-12 min-h-[840px] text-left">
                  {/* Left Sidebar (35%) */}
                  <div className="col-span-4 bg-slate-900 text-white p-6 space-y-6">
                    <div>
                      <h1 className="text-xl font-black tracking-tight text-white font-display">{personal.name}</h1>
                      <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider mt-1">{personal.title}</p>
                    </div>

                    <div className="space-y-2 text-[10px] text-slate-300 font-semibold border-t border-slate-800 pt-4">
                      <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-blue-400 shrink-0" /> {personal.email}</p>
                      <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-blue-400 shrink-0" /> {personal.phone}</p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-blue-400 shrink-0" /> {personal.location}</p>
                      <p className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-blue-400 shrink-0" /> {personal.linkedin}</p>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2 border-t border-slate-800 pt-4">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Skills</h3>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-200 border border-slate-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    {education.length > 0 && (
                      <div className="space-y-2 border-t border-slate-800 pt-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Education</h3>
                        {education.map((edu, idx) => (
                          <div key={idx} className="text-[10px] space-y-0.5">
                            <p className="font-bold text-white">{edu.degree}</p>
                            <p className="text-slate-400 text-[9px]">{edu.school}</p>
                            <p className="text-slate-500 text-[9px]">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Main Column (65%) */}
                  <div className="col-span-8 p-6 space-y-5 bg-white">
                    {summary && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#353df6]">Profile Overview</h3>
                        <p className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</p>
                      </div>
                    )}

                    {experience.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#353df6] border-b border-gray-150 pb-1">Work History</h3>
                        <div className="space-y-3">
                          {experience.map((work, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline text-xs font-extrabold">
                                <span className="text-gray-900">{work.role}</span>
                                <span className="text-gray-400 text-[10px] font-bold">{work.dates}</span>
                              </div>
                              <p className="text-[10px] font-extrabold text-[#353df6]">{work.company}</p>
                              <p className="text-[10px] text-gray-500 leading-relaxed font-medium whitespace-pre-line">{work.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {projects.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#353df6] border-b border-gray-150 pb-1">Projects</h3>
                        <div className="space-y-2">
                          {projects.map((proj, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <div className="flex justify-between items-center text-xs font-extrabold">
                                <span className="text-gray-800">{proj.title}</span>
                                <span className="text-[9px] bg-blue-50 text-[#353df6] px-1.5 py-0.5 rounded font-bold">{proj.technologies}</span>
                              </div>
                              <p className="text-[10px] text-gray-500 leading-normal">{proj.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== TEMPLATE 7: INDIGO MODERN STARTUP ==================== */}
              {template === 'indigo' && (
                <div className="space-y-5 text-left">
                  <div className="pb-5 text-left space-y-2 border-b-2 border-[#353df6]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight font-display">{personal.name}</h1>
                        <p className="text-xs font-extrabold text-[#353df6] uppercase tracking-wide mt-1">{personal.title}</p>
                      </div>
                      <div className="text-[10px] font-extrabold text-gray-500 text-right space-y-0.5">
                        <p>{personal.email}</p>
                        <p>{personal.phone}</p>
                        <p>{personal.location}</p>
                        <p className="text-[#353df6]">{personal.linkedin}</p>
                      </div>
                    </div>
                  </div>

                  {summary && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-900">Professional Summary</h4>
                      <p className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#353df6] border-b border-gray-150 pb-1">Work Experience</h4>
                      <div className="space-y-3">
                        {experience.map((work, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-start text-xs font-extrabold">
                              <span className="text-gray-900">{work.role} at <span className="text-[#353df6]">{work.company}</span></span>
                              <span className="text-gray-400 font-bold">{work.dates}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium whitespace-pre-line">{work.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#353df6] border-b border-gray-150 pb-1">Key Projects</h4>
                      <div className="space-y-2">
                        {projects.map((proj, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-extrabold">
                              <span className="text-gray-800">{proj.title}</span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#353df6]">{proj.technologies}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {skills.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 border-b border-gray-150 pb-1">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {education.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 border-b border-gray-150 pb-1">Education</h4>
                        {education.map((edu, idx) => (
                          <div key={idx} className="text-[11px]">
                            <p className="font-extrabold text-gray-800">{edu.degree}</p>
                            <p className="text-gray-500 font-semibold">{edu.school}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== TEMPLATE 8: SLATE CLASSIC ==================== */}
              {template === 'slate' && (
                <div className="space-y-5 text-left border-t-8 border-slate-700 pt-2">
                  <div className="border-b border-slate-200 pb-4 space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase font-display">{personal.name}</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{personal.title}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-500 pt-1">
                      <span>✉ {personal.email}</span>
                      <span>☎ {personal.phone}</span>
                      <span>📍 {personal.location}</span>
                    </div>
                  </div>

                  {summary && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Executive Summary</h4>
                      <p className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 border-b border-slate-200 pb-1">Experience</h4>
                      {experience.map((work, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-extrabold">
                            <span className="text-slate-900">{work.role} at {work.company}</span>
                            <span className="text-slate-500">{work.dates}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">{work.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {education.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 border-b border-slate-200 pb-1">Education</h4>
                      {education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] font-bold text-slate-800">
                          <span>{edu.degree} — {edu.school}</span>
                          <span className="text-slate-500">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== TEMPLATE 9: EMERALD FRESH TECH ==================== */}
              {template === 'emerald' && (
                <div className="space-y-5 text-left border-t-8 border-emerald-600 pt-2">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-black text-emerald-950 tracking-tight uppercase font-display">{personal.name}</h1>
                    <p className="text-xs font-extrabold text-emerald-600 tracking-wider uppercase">{personal.title}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-bold text-emerald-800 bg-emerald-50/60 p-2.5 border border-emerald-100 rounded-xl">
                      <p>✉ {personal.email}</p>
                      <p>☎ {personal.phone}</p>
                      <p>📍 {personal.location}</p>
                      <p>🔗 {personal.linkedin}</p>
                    </div>
                  </div>

                  {summary && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Summary</h4>
                      <p className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</p>
                    </div>
                  )}

                  {experience.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 border-b border-emerald-100 pb-1">Experience</h4>
                      {experience.map((work, idx) => (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between font-extrabold">
                            <span className="text-gray-900">{work.role} at <span className="text-emerald-600">{work.company}</span></span>
                            <span className="text-gray-400">{work.dates}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-line">{work.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 border-b border-emerald-100 pb-1">Tech Stack</h4>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
