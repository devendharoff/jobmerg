import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Globe, Award, Briefcase, BookOpen, 
  Sparkles, Check, Trash2, Plus, Download, RefreshCw, Printer, ShieldAlert, ChevronRight
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

export default function ResumeBuilder({ userProfile }: ResumeBuilderProps) {
  // Resume details state
  const [personal, setPersonal] = useState({
    name: userProfile.name,
    title: userProfile.role,
    email: userProfile.email,
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    github: 'github.com/devender',
    linkedin: 'linkedin.com/in/devender'
  });

  const [summary, setSummary] = useState(
    'Passionate and detail-oriented Software Engineer with over 4 years of experience specializing in building responsive, component-driven web applications. Strong expert in JavaScript, TypeScript, and modern frontend environments like React and Next.js.'
  );

  const [skills, setSkills] = useState<string[]>(userProfile.skills);
  const [skillInput, setSkillInput] = useState('');

  const [experience, setExperience] = useState<WorkExp[]>([
    {
      company: 'Tech Solutions Inc.',
      role: 'Software Engineer',
      dates: '2022 - Present',
      description: 'Developed and optimized client-facing web applications using React and Next.js. Restructured state management to improve dashboard performance by 35%. Mentored junior frontend developers and defined code styling guides.'
    },
    {
      company: 'Innovate Hub',
      role: 'Junior Frontend Developer',
      dates: '2020 - 2022',
      description: 'Built responsive marketing websites and single-page applications. Integrated REST APIs and worked closely with design team to maintain a unified Figma design system library.'
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
  const [template, setTemplate] = useState<'slate' | 'indigo' | 'emerald'>('indigo');

  // Auto fill from userProfile state
  const handleAutoFill = () => {
    setPersonal({
      name: userProfile.name,
      title: userProfile.role,
      email: userProfile.email,
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      github: 'github.com/devender',
      linkedin: 'linkedin.com/in/devender'
    });
    setSkills(userProfile.skills);
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

  return (
    <div className="space-y-6 animate-fade-in flex-1 flex flex-col lg:overflow-hidden h-full">
      
      {/* Top Banner Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-display">Job Ready Resume</h1>
          <p className="text-xs font-semibold text-gray-500 mt-0.5">Generate, style, and download professional recruiter-ready resumes in seconds.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          {/* Template Toggle */}
          <div className="flex bg-gray-50 p-1 border border-gray-150 rounded-xl text-[10px] font-bold text-gray-500">
            <button 
              onClick={() => setTemplate('slate')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${template === 'slate' ? 'bg-white text-gray-800 shadow-sm' : 'hover:text-gray-800'}`}
            >
              Slate Slate
            </button>
            <button 
              onClick={() => setTemplate('indigo')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${template === 'indigo' ? 'bg-white text-[#353df6] shadow-sm' : 'hover:text-[#353df6]'}`}
            >
              Indigo Modern
            </button>
            <button 
              onClick={() => setTemplate('emerald')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${template === 'emerald' ? 'bg-white text-emerald-600 shadow-sm' : 'hover:text-emerald-600'}`}
            >
              Emerald Fresh
            </button>
          </div>

          <button
            onClick={handleAutoFill}
            className="px-4 py-2 border border-gray-150 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Auto-fill
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-[#353df6] text-white hover:bg-[#252ccb] rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#353df6]/15 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
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
              <label className="font-bold text-gray-500">Write a short summary about your skills & targets</label>
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
                <Plus className="w-3.5 h-3.5" /> Add New
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
                      <label className="font-bold text-gray-400">Date Range (e.g. 2021 - Present)</label>
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
                    <label className="font-bold text-gray-400">Key Responsibilities / Achievements</label>
                    <textarea 
                      rows={2}
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
                <Plus className="w-3.5 h-3.5" /> Add New
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
                      <label className="font-bold text-gray-400">Year (e.g. 2016-2020)</label>
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

          {/* Section: Skills */}
          <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 bg-blue-50 text-[#353df6] rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-900 font-display">Technical Skills</h3>
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input 
                type="text"
                placeholder="Enter a skill (e.g. React, Docker)"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#353df6]"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-[#353df6] text-white rounded-xl font-bold text-xs hover:bg-[#252ccb] cursor-pointer"
              >
                Add Tag
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-2">
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
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Key Projects</h3>
              </div>
              <button 
                onClick={addProj}
                className="text-[10px] font-extrabold uppercase tracking-wide text-[#353df6] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
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
                      <label className="font-bold text-gray-400">Technologies (comma-separated)</label>
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
                    <label className="font-bold text-gray-400">Project Summary</label>
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

        {/* Right Column: High-Fidelity Resume Preview Pane (Scrollable sheet A4 ratio) */}
        <div className="lg:col-span-6 lg:h-full lg:overflow-y-auto pb-6 print:w-full print:p-0 print:h-auto print:overflow-visible">
          
          <div className="bg-gray-100 p-6 rounded-3xl border border-gray-150 flex items-center justify-center print:bg-white print:border-none print:p-0">
            {/* Sheet layout */}
            <div 
              id="resume-printable-sheet" 
              className={`w-full max-w-[620px] min-h-[820px] bg-white rounded-2xl shadow-xl p-8 text-gray-800 print:shadow-none print:p-0 print:rounded-none ${
                template === 'slate' ? 'border-t-[8px] border-slate-700' :
                template === 'emerald' ? 'border-t-[8px] border-emerald-600' :
                'border-t-[8px] border-[#353df6]'
              }`}
            >
              
              {/* Template Style Header */}
              {template === 'slate' && (
                <div className="border-b border-slate-200 pb-5 text-left space-y-1.5">
                  <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase font-display">{personal.name || 'Your Full Name'}</h1>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{personal.title || 'Professional Title'}</p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-400 pt-1">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {personal.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {personal.phone}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {personal.location}</span>
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-slate-400" /> {personal.linkedin}</span>
                  </div>
                </div>
              )}

              {template === 'indigo' && (
                <div className="pb-5 text-left space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-black text-gray-900 tracking-tight font-display">{personal.name || 'Your Full Name'}</h1>
                      <p className="text-xs font-extrabold text-[#353df6] uppercase tracking-wide mt-1">{personal.title || 'Professional Title'}</p>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 text-right space-y-0.5">
                      <p>{personal.email}</p>
                      <p>{personal.phone}</p>
                      <p>{personal.location}</p>
                      <p className="text-[#353df6]/80">{personal.linkedin}</p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-150 w-full mt-2"></div>
                </div>
              )}

              {template === 'emerald' && (
                <div className="pb-5 text-left space-y-2">
                  <h1 className="text-2xl font-black text-emerald-950 tracking-tight font-display uppercase">{personal.name || 'Your Full Name'}</h1>
                  <p className="text-xs font-extrabold text-emerald-600 tracking-wider uppercase">{personal.title || 'Professional Title'}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-bold text-emerald-800 bg-emerald-50/50 p-2.5 border border-emerald-100 rounded-xl">
                    <p>✉ {personal.email}</p>
                    <p>☎ {personal.phone}</p>
                    <p>📍 {personal.location}</p>
                    <p>🔗 {personal.linkedin}</p>
                  </div>
                </div>
              )}

              {/* Body elements */}
              <div className="space-y-5 text-left mt-5">
                
                {/* Summary */}
                {summary && (
                  <div className="space-y-1.5">
                    <h4 className={`text-xs font-extrabold uppercase tracking-widest ${
                      template === 'slate' ? 'text-slate-700' :
                      template === 'emerald' ? 'text-emerald-700' :
                      'text-gray-900'
                    }`}>Professional Summary</h4>
                    <p className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</p>
                  </div>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                  <div className="space-y-3">
                    <h4 className={`text-xs font-extrabold uppercase tracking-widest border-b border-gray-100 pb-1 ${
                      template === 'slate' ? 'text-slate-700 border-slate-200' :
                      template === 'emerald' ? 'text-emerald-700 border-emerald-100' :
                      'text-gray-900'
                    }`}>Work Experience</h4>
                    
                    <div className="space-y-4">
                      {experience.filter(w => w.company || w.role).map((work, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-start text-xs font-extrabold">
                            <span className="text-gray-900">{work.role} at <span className={template === 'emerald' ? 'text-emerald-600' : template === 'indigo' ? 'text-[#353df6]' : 'text-slate-700'}>{work.company}</span></span>
                            <span className="text-gray-400 font-bold">{work.dates}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed font-semibold whitespace-pre-line">{work.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                  <div className="space-y-3">
                    <h4 className={`text-xs font-extrabold uppercase tracking-widest border-b border-gray-100 pb-1 ${
                      template === 'slate' ? 'text-slate-700 border-slate-200' :
                      template === 'emerald' ? 'text-emerald-700 border-emerald-100' :
                      'text-gray-900'
                    }`}>Projects</h4>

                    <div className="space-y-3">
                      {projects.filter(p => p.title).map((proj, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-extrabold">
                            <span className="text-gray-800">{proj.title}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              template === 'slate' ? 'bg-slate-100 text-slate-700' :
                              template === 'emerald' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              'bg-blue-50 text-[#353df6]'
                            }`}>{proj.technologies}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid for Skills and Education */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Skills */}
                  {skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className={`text-xs font-extrabold uppercase tracking-widest border-b border-gray-100 pb-1 ${
                        template === 'slate' ? 'text-slate-700 border-slate-200' :
                        template === 'emerald' ? 'text-emerald-700 border-emerald-100' :
                        'text-gray-900'
                      }`}>Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((skill, idx) => (
                          <span 
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              template === 'slate' ? 'bg-slate-50 border border-slate-200 text-slate-700' :
                              template === 'emerald' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' :
                              'bg-gray-50 border border-gray-150 text-gray-700'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="space-y-2">
                      <h4 className={`text-xs font-extrabold uppercase tracking-widest border-b border-gray-100 pb-1 ${
                        template === 'slate' ? 'text-slate-700 border-slate-200' :
                        template === 'emerald' ? 'text-emerald-700 border-emerald-100' :
                        'text-gray-900'
                      }`}>Education</h4>
                      
                      <div className="space-y-2">
                        {education.filter(e => e.school || e.degree).map((edu, idx) => (
                          <div key={idx} className="text-[11px]">
                            <p className="font-extrabold text-gray-800">{edu.degree}</p>
                            <p className="text-gray-500 font-semibold">{edu.school}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">{edu.year} • {edu.gpa}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
              
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
