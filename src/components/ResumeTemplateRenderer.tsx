import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { TemplateId } from './ResumeBuilder';

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
  gpa?: string;
}

interface Project {
  title: string;
  technologies: string;
  description: string;
}

interface ResumeTemplateRendererProps {
  template: TemplateId;
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    github?: string;
    linkedin?: string;
  };
  summary: React.ReactNode;
  experience: any[];
  education: Education[];
  projects: any[];
  skills: any[];
}

export default function ResumeTemplateRenderer({
  template,
  personal,
  summary,
  experience,
  education,
  projects,
  skills
}: ResumeTemplateRendererProps) {
  return (
    <>
      {/* ==================== TEMPLATE 1: EXECUTIVE CEO (Reference Image 1) ==================== */}
      {template === 'executive_ceo' && (
        <div className="space-y-4 font-serif text-gray-900 text-left">
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
            <div className="text-[11px] text-gray-800 leading-normal font-serif text-justify">
              {summary}
            </div>
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
                  <div className="text-[10px] text-gray-800 font-serif leading-relaxed whitespace-pre-line pl-2">
                    {work.description}
                  </div>
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
        <div className="space-y-4 font-serif text-gray-900 text-left">
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
                  <div className="text-[10px] text-gray-700 leading-normal pl-2 whitespace-pre-line">{work.description}</div>
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
                    <div className="text-[10px] text-gray-700 pl-2 leading-tight">{proj.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-widest font-serif border-b border-gray-300 pb-0.5">Skills & Qualifications</h2>
            <div className="text-[10px] font-serif text-gray-800">
              <strong className="font-bold">Core Skills:</strong> {skills.map((s, i) => <React.Fragment key={i}>{i > 0 && ', '}{s}</React.Fragment>)}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TEMPLATE 3: TECH ENGINEER ATS DIRECT (Reference Image 3) ==================== */}
      {template === 'tech_engineer' && (
        <div className="space-y-4 font-sans text-gray-900 text-left">
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
                <div className="text-[10px] text-gray-700 pl-3 leading-relaxed whitespace-pre-line">{work.description}</div>
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
                  <div className="text-[10px] text-gray-700 pl-3 leading-tight">• {proj.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Technical Skills Grouping */}
          <div className="space-y-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5">Technical Skills</h2>
            <div className="text-[10px] text-gray-800 space-y-1">
              <p><strong className="font-bold">Proficient in:</strong> {skills.slice(0, 4).map((s, i) => <React.Fragment key={i}>{i > 0 && ', '}{s}</React.Fragment>)}</p>
              <p><strong className="font-bold">Tools & Technologies:</strong> {skills.slice(4).map((s, i) => <React.Fragment key={i}>{i > 0 && ', '}{s}</React.Fragment>)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TEMPLATE 4: CORPORATE SENIOR PM (Reference Image 4) ==================== */}
      {template === 'corporate_pm' && (
        <div className="space-y-4 font-sans text-gray-900 text-left">
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
              <div className="text-[10px] text-gray-700 leading-relaxed px-1 text-justify font-medium">{summary}</div>
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
                <div className="text-gray-700 leading-relaxed whitespace-pre-line pl-1">{work.description}</div>
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
        <div className="space-y-4 font-sans text-gray-900 text-left">
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
            <div className="text-[11px] text-gray-700 leading-relaxed font-medium">{summary}</div>
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
                <div className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-line pl-2">{work.description}</div>
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
                <div className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</div>
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
                      <div className="text-[10px] text-gray-500 leading-relaxed font-medium whitespace-pre-line">{work.description}</div>
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
              <div className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</div>
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
                    <div className="text-[11px] text-gray-500 leading-relaxed font-medium whitespace-pre-line">{work.description}</div>
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
              <div className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</div>
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
                  <div className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">{work.description}</div>
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
              <div className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</div>
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
                  <div className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-line">{work.description}</div>
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
    </>
  );
}
