import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
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
    portfolio?: string;
  };
  summary: React.ReactNode;
  experience: WorkExp[];
  education: Education[];
  projects: Project[];
  skills: SkillsGrouped;
  certifications?: string[];
}

const cleanUrl = (url: string) => {
  if (!url) return '';
  return url.replace(/^(https?:\/\/)?(www\.)?/, '');
};

export default function ResumeTemplateRenderer({
  template,
  personal,
  summary,
  experience,
  education,
  projects,
  skills,
  certifications = []
}: ResumeTemplateRendererProps) {

  // Global helper to render contact row
  const renderContactInfo = (separator = ' | ') => {
    const parts = [
      personal.phone && `☎ ${personal.phone}`,
      personal.email && `✉ ${personal.email}`,
      personal.location && `📍 ${personal.location}`,
      personal.linkedin && `🔗 ${cleanUrl(personal.linkedin)}`,
      personal.github && `🐙 ${cleanUrl(personal.github)}`,
      personal.portfolio && `🌐 ${cleanUrl(personal.portfolio)}`
    ].filter(Boolean);
    return parts.join(separator);
  };

  // Grouped skills rendering template
  const renderSkillsSection = (titleStyle = "font-bold", itemStyle = "text-[10px] text-gray-800") => {
    return (
      <div className="space-y-1">
        {skills.languages && (
          <p className={itemStyle}><span className={titleStyle}>Languages:</span> {skills.languages}</p>
        )}
        {skills.frameworks && (
          <p className={itemStyle}><span className={titleStyle}>Frameworks & Libraries:</span> {skills.frameworks}</p>
        )}
        {skills.tools && (
          <p className={itemStyle}><span className={titleStyle}>Tools & Platforms:</span> {skills.tools}</p>
        )}
        {skills.competencies && (
          <p className={itemStyle}><span className={titleStyle}>Core Competencies:</span> {skills.competencies}</p>
        )}
      </div>
    );
  };

  // Certifications rendering template
  const renderCertificationsSection = (headerStyle = "text-xs font-bold uppercase tracking-widest", listStyle = "text-[10px] space-y-1") => {
    if (!certifications || certifications.length === 0 || (certifications.length === 1 && !certifications[0])) return null;
    return (
      <div className="space-y-1.5">
        <h3 className={headerStyle}>Certifications & Achievements</h3>
        <ul className={listStyle}>
          {certifications.map((cert, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-gray-900 font-bold">•</span>
              <span>{cert}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      {/* ==================== TEMPLATE 1: EXECUTIVE CEO ==================== */}
      {template === 'executive_ceo' && (
        <div className="space-y-4 font-serif text-gray-900 text-left">
          {/* Top Double Line Header */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold tracking-widest uppercase font-serif border-t-2 border-b-2 border-gray-900 py-1.5">
              {personal.name ? `${personal.name.toUpperCase()} - RESUME` : 'EXECUTIVE RESUME'}
            </h1>
            <p className="text-[10px] text-gray-700 font-serif pt-1">
              {renderContactInfo('  |  ')}
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
            <div className="text-[11px] text-gray-805 leading-normal font-serif text-justify">
              {summary}
            </div>
          )}

          {/* Technical Skills */}
          <div className="space-y-1.5">
            <div className="bg-gray-100 text-center py-1 border-t border-b border-gray-300">
              <h3 className="text-xs font-bold uppercase tracking-widest font-serif">Technical Skills</h3>
            </div>
            <div className="px-2">
              {renderSkillsSection("font-bold", "text-[10px] font-serif leading-relaxed text-gray-800")}
            </div>
          </div>

          {/* Executive Experience */}
          <div className="space-y-2">
            <div className="bg-gray-100 text-center py-1 border-t border-b border-gray-300">
              <h3 className="text-xs font-bold uppercase tracking-widest font-serif">Professional Experience</h3>
            </div>

            <div className="space-y-3">
              {experience.map((work, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs font-serif">
                    <span className="font-bold uppercase underline">{work.company} &nbsp;|&nbsp; <span className="font-normal no-underline">{personal.location}</span></span>
                    <span className="font-bold">{work.dates}</span>
                  </div>
                  <p className="text-[11px] italic font-bold text-gray-800">{work.role}</p>
                  {work.technologies && (
                    <p className="text-[9px] font-serif text-gray-700 italic"><span className="font-bold">Tech Stack Used:</span> {work.technologies}</p>
                  )}
                  <div className="text-[10px] text-gray-800 font-serif leading-relaxed whitespace-pre-line pl-2">
                    {work.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <div className="bg-gray-100 text-center py-1 border-t border-b border-gray-300">
                <h3 className="text-xs font-bold uppercase tracking-widest font-serif">Key Projects</h3>
              </div>
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-serif font-bold">
                      <span>{proj.title}</span>
                      <span className="text-[9px] font-normal italic">Tech: {proj.technologies}</span>
                    </div>
                    <div className="text-[10px] text-gray-800 font-serif leading-relaxed pl-2">
                      {proj.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="space-y-1.5">
              <div className="bg-gray-100 text-center py-1 border-t border-b border-gray-300">
                <h3 className="text-xs font-bold uppercase tracking-widest font-serif">Education & Credentials</h3>
              </div>
              <div className="space-y-2 text-[10px] font-serif px-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between">
                      <span><strong className="font-bold">{edu.degree}</strong> &nbsp;—&nbsp; {edu.school}</span>
                      <span className="font-bold">{edu.year}</span>
                    </div>
                    {edu.coursework && (
                      <p className="text-[9px] text-gray-650 italic"><span className="font-bold">Coursework & Highlights:</span> {edu.coursework}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {renderCertificationsSection(
            "text-xs font-bold uppercase tracking-widest font-serif bg-gray-100 py-1 text-center border-t border-b border-gray-300",
            "text-[10px] font-serif space-y-1 px-4 pt-1"
          )}
        </div>
      )}

      {/* ==================== TEMPLATE 2: IVY LEAGUE / HARVARD CLASSIC ==================== */}
      {template === 'ivy_league' && (
        <div className="space-y-4 font-serif text-gray-900 text-left">
          {/* Centered Classic Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold font-serif tracking-tight text-gray-900">{personal.name}</h1>
            <p className="text-[10px] font-serif text-gray-600 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
              {personal.location && <span>📍 {personal.location}</span>}
              {personal.phone && <span>• ☎ {personal.phone}</span>}
              {personal.email && <span>• ✉ {personal.email}</span>}
              {personal.linkedin && <span>• 🔗 {cleanUrl(personal.linkedin)}</span>}
              {personal.github && <span>• 🐙 {cleanUrl(personal.github)}</span>}
              {personal.portfolio && <span>• 🌐 {cleanUrl(personal.portfolio)}</span>}
            </p>
          </div>

          <div className="border-b border-gray-800 pt-1"></div>

          {/* Summary */}
          {summary && (
            <div className="text-[11px] text-gray-800 leading-normal font-serif text-justify pb-1">
              {summary}
            </div>
          )}

          {/* Education First (Ivy League Standard) */}
          {education.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest font-serif border-b border-gray-300 pb-0.5">Education</h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-[11px] font-serif space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span>{edu.degree}</span>
                      <span>{edu.year}</span>
                    </div>
                    <div className="text-gray-700 italic">{edu.school}</div>
                    {edu.coursework && (
                      <p className="text-[10px] text-gray-600 italic"><span className="font-bold">Coursework:</span> {edu.coursework}</p>
                    )}
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
                  {work.technologies && (
                    <p className="text-[9px] text-gray-600 italic"><span className="font-bold">Tech Stack Used:</span> {work.technologies}</p>
                  )}
                  <div className="text-[10px] text-gray-705 leading-normal pl-2 whitespace-pre-line">{work.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest font-serif border-b border-gray-300 pb-0.5">Projects</h2>
              <div className="space-y-2">
                {projects.map((proj, idx) => (
                  <div key={idx} className="text-[11px] font-serif">
                    <div className="flex justify-between font-bold">
                      <span>{proj.title}</span>
                      <span className="text-[10px] text-gray-600 font-normal italic">Tech Stack: {proj.technologies}</span>
                    </div>
                    <div className="text-[10px] text-gray-700 pl-2 leading-tight">{proj.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-widest font-serif border-b border-gray-300 pb-0.5">Skills</h2>
            <div className="px-2">
              {renderSkillsSection("font-bold text-gray-905", "text-[10px] font-serif text-gray-800 leading-normal")}
            </div>
          </div>

          {/* Certifications */}
          {renderCertificationsSection(
            "text-xs font-bold uppercase tracking-widest font-serif border-b border-gray-300 pb-0.5",
            "text-[10px] font-serif space-y-1 px-2 pt-1"
          )}
        </div>
      )}

      {/* ==================== TEMPLATE 3: TECH ENGINEER ATS DIRECT ==================== */}
      {template === 'tech_engineer' && (
        <div className="space-y-4 font-sans text-gray-900 text-left">
          {/* Top Header Grid */}
          <div className="flex justify-between items-start border-b-2 border-gray-900 pb-3">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 font-display">{personal.name}</h1>
              <p className="text-xs font-bold text-gray-605 mt-0.5">{personal.title}</p>
            </div>
            <div className="text-right text-[10px] font-semibold text-gray-700 space-y-0.5">
              <p>{personal.phone}</p>
              <p>{personal.email}</p>
              <p>{personal.location}</p>
              {personal.linkedin && <p>LI: {cleanUrl(personal.linkedin)}</p>}
              {personal.github && <p>GH: {cleanUrl(personal.github)}</p>}
              {personal.portfolio && <p>Port: {cleanUrl(personal.portfolio)}</p>}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="text-[11px] text-gray-800 leading-normal text-justify">
              {summary}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5">Education</h2>
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between text-[11px] items-start">
                  <div>
                    <strong className="font-bold">{edu.degree}</strong>
                    <div className="text-gray-700">{edu.school}</div>
                    {edu.coursework && (
                      <p className="text-[9px] text-gray-600 italic"><span className="font-bold">Relevant Coursework:</span> {edu.coursework}</p>
                    )}
                  </div>
                  <div className="text-right font-bold text-gray-700 shrink-0">
                    <div>{personal.location}</div>
                    <div className="text-[10px]">{edu.year}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5">Relevant Work Experience</h2>
            {experience.map((work, idx) => (
              <div key={idx} className="space-y-0.5 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>{work.company}</span>
                  <span className="text-gray-600 font-medium">{personal.location}</span>
                </div>
                <div className="flex justify-between text-gray-800 italic font-semibold">
                  <span>{work.role}</span>
                  <span className="not-italic text-gray-600">{work.dates}</span>
                </div>
                {work.technologies && (
                  <p className="text-[9px] text-gray-655 italic"><span className="font-bold">Tech Stack Used:</span> {work.technologies}</p>
                )}
                <div className="text-[10px] text-gray-700 pl-3 leading-relaxed whitespace-pre-line">{work.description}</div>
              </div>
            ))}
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5">Project Experience</h2>
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>{proj.title}</span>
                    <span className="text-[10px] text-gray-600 font-normal italic">Tech Stack: {proj.technologies}</span>
                  </div>
                  <div className="text-[10px] text-gray-700 pl-3 leading-tight">{proj.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Technical Skills */}
          <div className="space-y-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5">Technical Skills</h2>
            <div className="px-2">
              {renderSkillsSection("font-bold text-gray-900", "text-[10px] text-gray-800 leading-relaxed")}
            </div>
          </div>

          {/* Certifications */}
          {renderCertificationsSection(
            "text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-0.5",
            "text-[10px] space-y-1 px-2 pt-1"
          )}
        </div>
      )}

      {/* ==================== TEMPLATE 4: CORPORATE SENIOR PM ==================== */}
      {template === 'corporate_pm' && (
        <div className="space-y-4 font-sans text-gray-900 text-left">
          {/* Centered Name Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black tracking-widest text-[#0f172a] uppercase font-display">{personal.name}</h1>
            <p className="text-[10px] font-bold text-gray-600 tracking-wide flex flex-wrap justify-center gap-x-2 gap-y-0.5">
              {personal.phone && <span>☎ {personal.phone}</span>}
              {personal.email && <span>• ✉ {personal.email}</span>}
              {personal.location && <span>• 📍 {personal.location}</span>}
              {personal.linkedin && <span>• 🔗 {cleanUrl(personal.linkedin)}</span>}
              {personal.github && <span>• 🐙 {cleanUrl(personal.github)}</span>}
              {personal.portfolio && <span>• 🌐 {cleanUrl(personal.portfolio)}</span>}
            </p>
          </div>

          {/* Subtitle Banner Bar */}
          <div className="bg-[#0f172a] text-white text-center py-1.5 px-3 rounded">
            <h2 className="text-xs font-extrabold uppercase tracking-wider">
              {personal.title || 'SENIOR PRODUCT MANAGER'}
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

          {/* Technical Skills grouped */}
          <div className="space-y-1">
            <div className="bg-slate-100 px-2 py-0.5 border-l-4 border-[#0f172a]">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800">CORE COMPETENCIES</h3>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              {renderSkillsSection("font-bold text-slate-900", "text-[10px] text-slate-805 leading-relaxed")}
            </div>
          </div>

          {/* Experience */}
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
                <div className="font-bold text-slate-850 italic">{work.role}</div>
                {work.technologies && (
                  <p className="text-[9px] text-slate-600 italic"><span className="font-bold">Tech Stack Used:</span> {work.technologies}</p>
                )}
                <div className="text-gray-700 leading-relaxed whitespace-pre-line pl-1">{work.description}</div>
              </div>
            ))}
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div className="space-y-3">
              <div className="bg-slate-100 px-2 py-0.5 border-l-4 border-[#0f172a]">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800">KEY PROJECTS</h3>
              </div>
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-1 text-[10px]">
                  <div className="flex justify-between font-extrabold text-slate-900 border-b border-slate-150 pb-0.5">
                    <span>{proj.title}</span>
                    <span className="text-[9px] font-normal italic">Tech Stack: {proj.technologies}</span>
                  </div>
                  <div className="text-gray-750 pl-1 leading-relaxed">{proj.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="space-y-1">
              <div className="bg-slate-100 px-2 py-0.5 border-l-4 border-[#0f172a]">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800">EDUCATION</h3>
              </div>
              <div className="text-[10px] text-gray-800 space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-semibold">
                      <span><strong>{edu.degree}</strong>, {edu.school}</span>
                      <span className="text-gray-600">{edu.year}</span>
                    </div>
                    {edu.coursework && (
                      <p className="text-[9px] text-gray-600 italic"><span className="font-bold">Coursework:</span> {edu.coursework}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {renderCertificationsSection(
            "text-[10px] font-extrabold uppercase tracking-widest text-slate-805 bg-slate-100 px-2 py-0.5 border-l-4 border-[#0f172a]",
            "text-[10px] space-y-1 px-1 pt-1.5"
          )}
        </div>
      )}

      {/* ==================== TEMPLATE 5: MODERN TEAL EXECUTIVE ==================== */}
      {template === 'teal_executive' && (
        <div className="space-y-4 font-sans text-gray-900 text-left">
          {/* Teal Header */}
          <div className="space-y-1 border-b-2 border-teal-600 pb-3">
            <h1 className="text-2xl font-black text-teal-800 tracking-tight uppercase font-display">{personal.name}</h1>
            <p className="text-xs font-bold text-teal-600">{personal.title}</p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-teal-700 pt-1">
              {personal.phone && <span>☎ {personal.phone}</span>}
              {personal.email && <span>✉ {personal.email}</span>}
              {personal.location && <span>📍 {personal.location}</span>}
              {personal.linkedin && <span>🔗 {cleanUrl(personal.linkedin)}</span>}
              {personal.github && <span>🐙 {cleanUrl(personal.github)}</span>}
              {personal.portfolio && <span>🌐 {cleanUrl(personal.portfolio)}</span>}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="text-[11px] text-gray-700 leading-relaxed font-medium">{summary}</div>
          )}

          {/* Core Competencies Grouped */}
          <div className="space-y-2">
            <h2 className="text-xs font-extrabold text-teal-700 uppercase tracking-wider">Technical Skills</h2>
            <div className="bg-teal-50/40 p-2.5 border border-teal-100/50 rounded-xl">
              {renderSkillsSection("font-bold text-teal-900", "text-[10px] text-gray-800 leading-relaxed")}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold text-teal-700 uppercase tracking-wider border-b border-teal-100 pb-1">Experience</h2>
            {experience.map((work, idx) => (
              <div key={idx} className="space-y-1 text-[11px]">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">{work.role}</span>
                  <span className="text-[10px] text-teal-700 italic font-bold">{work.dates}</span>
                </div>
                <div className="font-extrabold text-teal-805 text-[10px] uppercase">{work.company}, {personal.location}</div>
                {work.technologies && (
                  <p className="text-[9px] text-teal-700 italic"><span className="font-bold">Tech Stack:</span> {work.technologies}</p>
                )}
                <div className="text-[10px] text-gray-600 leading-relaxed whitespace-pre-line pl-2">{work.description}</div>
              </div>
            ))}
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold text-teal-700 uppercase tracking-wider border-b border-teal-100 pb-1">Projects</h2>
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-1 text-[11px]">
                  <div className="flex justify-between items-baseline font-bold">
                    <span>{proj.title}</span>
                    <span className="text-[10px] text-teal-705 italic font-bold">Tech: {proj.technologies}</span>
                  </div>
                  <div className="text-[10px] text-gray-600 pl-2 leading-tight">{proj.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-extrabold text-teal-700 uppercase tracking-wider border-b border-teal-100 pb-1">Education</h2>
              {education.map((edu, idx) => (
                <div key={idx} className="text-[10px] font-semibold space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-gray-800"><strong>{edu.degree}</strong> &nbsp;—&nbsp; {edu.school}</span>
                    <span className="text-teal-700 font-bold">{edu.year}</span>
                  </div>
                  {edu.coursework && (
                    <p className="text-[9px] text-teal-700 italic"><span className="font-bold">Coursework:</span> {edu.coursework}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {renderCertificationsSection(
            "text-xs font-extrabold text-teal-700 uppercase tracking-wider border-b border-teal-100 pb-1",
            "text-[10px] space-y-1 px-2 pt-1"
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
              {personal.email && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-blue-400 shrink-0" /> {personal.email}</p>}
              {personal.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-blue-400 shrink-0" /> {personal.phone}</p>}
              {personal.location && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-blue-400 shrink-0" /> {personal.location}</p>}
              {personal.linkedin && <p className="flex items-center gap-1.5"><Linkedin className="w-3 h-3 text-blue-400 shrink-0" /> {cleanUrl(personal.linkedin)}</p>}
              {personal.github && <p className="flex items-center gap-1.5"><Github className="w-3 h-3 text-blue-400 shrink-0" /> {cleanUrl(personal.github)}</p>}
              {personal.portfolio && <p className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-blue-400 shrink-0" /> {cleanUrl(personal.portfolio)}</p>}
            </div>

            {/* Skills Grouped */}
            <div className="space-y-2 border-t border-slate-800 pt-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Skills</h3>
              <div className="space-y-2 text-[9px] text-slate-350 leading-relaxed font-semibold">
                {skills.languages && <p><strong className="text-blue-300 block">Languages:</strong> {skills.languages}</p>}
                {skills.frameworks && <p><strong className="text-blue-300 block">Frameworks & Libs:</strong> {skills.frameworks}</p>}
                {skills.tools && <p><strong className="text-blue-300 block">Tools & Platforms:</strong> {skills.tools}</p>}
                {skills.competencies && <p><strong className="text-blue-300 block">Core Competencies:</strong> {skills.competencies}</p>}
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
                    {edu.coursework && <p className="text-slate-500 text-[8px] italic">{edu.coursework}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Certifications inside Sidebar */}
            {certifications && certifications.length > 0 && (
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Certifications</h3>
                <ul className="text-[9px] text-slate-300 space-y-1 list-disc pl-3">
                  {certifications.map((cert, idx) => (
                    <li key={idx}>{cert}</li>
                  ))}
                </ul>
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
                      {work.technologies && (
                        <p className="text-[9px] text-gray-500 italic"><span className="font-bold">Tech Stack Used:</span> {work.technologies}</p>
                      )}
                      <div className="text-[10px] text-gray-505 leading-relaxed font-medium whitespace-pre-line">{work.description}</div>
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
                      <p className="text-[10px] text-gray-505 leading-normal">{proj.description}</p>
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
                <p>{personal.phone}</p>
                <p>{personal.email}</p>
                <p>{personal.location}</p>
                {personal.linkedin && <p className="text-[#353df6]">LI: {cleanUrl(personal.linkedin)}</p>}
                {personal.github && <p>GH: {cleanUrl(personal.github)}</p>}
                {personal.portfolio && <p>Port: {cleanUrl(personal.portfolio)}</p>}
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
                    {work.technologies && (
                      <p className="text-[9px] text-[#353df6] italic"><span className="font-bold">Tech Stack Used:</span> {work.technologies}</p>
                    )}
                    <div className="text-[11px] text-gray-505 leading-relaxed font-medium whitespace-pre-line">{work.description}</div>
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

          {/* Grouped Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 border-b border-gray-150 pb-1">Skills</h4>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-150">
              {renderSkillsSection("font-bold text-[#353df6]", "text-[10px] text-gray-800 leading-relaxed")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            {education.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 border-b border-gray-150 pb-1">Education</h4>
                {education.map((edu, idx) => (
                  <div key={idx} className="text-[11px] space-y-0.5">
                    <p className="font-extrabold text-gray-800">{edu.degree}</p>
                    <p className="text-gray-550 font-semibold">{edu.school} ({edu.year})</p>
                    {edu.coursework && <p className="text-gray-500 text-[9px] italic">{edu.coursework}</p>}
                  </div>
                ))}
              </div>
            )}

            {certifications && certifications.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-900 border-b border-gray-150 pb-1">Certifications</h4>
                <ul className="text-[10px] text-gray-650 space-y-1 list-disc pl-4">
                  {certifications.map((cert, idx) => (
                    <li key={idx}>{cert}</li>
                  ))}
                </ul>
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
            <p className="text-xs font-bold text-slate-550 uppercase tracking-widest">{personal.title}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-500 pt-1">
              {personal.phone && <span>☎ {personal.phone}</span>}
              {personal.email && <span>✉ {personal.email}</span>}
              {personal.location && <span>📍 {personal.location}</span>}
              {personal.linkedin && <span>🔗 {cleanUrl(personal.linkedin)}</span>}
              {personal.github && <span>🐙 {cleanUrl(personal.github)}</span>}
              {personal.portfolio && <span>🌐 {cleanUrl(personal.portfolio)}</span>}
            </div>
          </div>

          {summary && (
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700">Executive Summary</h4>
              <div className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</div>
            </div>
          )}

          {/* Grouped Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 border-b border-slate-200 pb-1">Skills</h4>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              {renderSkillsSection("font-bold text-slate-800", "text-[10px] text-gray-800 leading-relaxed")}
            </div>
          </div>

          {experience.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 border-b border-slate-200 pb-1">Experience</h4>
              {experience.map((work, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-slate-900">{work.role} at {work.company}</span>
                    <span className="text-slate-500">{work.dates}</span>
                  </div>
                  {work.technologies && (
                    <p className="text-[9px] text-slate-600 italic"><span className="font-bold">Tech Stack Used:</span> {work.technologies}</p>
                  )}
                  <div className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">{work.description}</div>
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 border-b border-slate-200 pb-1">Key Projects</h4>
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-slate-900">{proj.title}</span>
                    <span className="text-slate-500 text-[9px] font-normal italic">Tech: {proj.technologies}</span>
                  </div>
                  <div className="text-[11px] text-gray-600 leading-relaxed">{proj.description}</div>
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 border-b border-slate-200 pb-1">Education</h4>
              {education.map((edu, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-800">
                    <span>{edu.degree} — {edu.school}</span>
                    <span className="text-slate-500">{edu.year}</span>
                  </div>
                  {edu.coursework && <p className="text-slate-550 text-[9px] italic">{edu.coursework}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {renderCertificationsSection(
            "text-xs font-extrabold uppercase tracking-widest text-slate-705 border-b border-slate-200 pb-1",
            "text-[10px] space-y-1 pt-1.5"
          )}
        </div>
      )}

      {/* ==================== TEMPLATE 9: EMERALD FRESH TECH ==================== */}
      {template === 'emerald' && (
        <div className="space-y-5 text-left border-t-8 border-emerald-600 pt-2">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-emerald-950 tracking-tight uppercase font-display">{personal.name}</h1>
            <p className="text-xs font-extrabold text-emerald-605 tracking-wider uppercase">{personal.title}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[9px] font-bold text-emerald-800 bg-emerald-50/60 p-2.5 border border-emerald-100 rounded-xl">
              {personal.email && <p>✉ {personal.email}</p>}
              {personal.phone && <p>☎ {personal.phone}</p>}
              {personal.location && <p>📍 {personal.location}</p>}
              {personal.linkedin && <p>🔗 {cleanUrl(personal.linkedin)}</p>}
              {personal.github && <p>🐙 {cleanUrl(personal.github)}</p>}
              {personal.portfolio && <p>🌐 {cleanUrl(personal.portfolio)}</p>}
            </div>
          </div>

          {summary && (
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Summary</h4>
              <div className="text-xs text-gray-600 leading-relaxed font-semibold">{summary}</div>
            </div>
          )}

          {/* Grouped Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 border-b border-emerald-100 pb-1">Tech Stack</h4>
            <div className="bg-emerald-50/30 p-3 border border-emerald-100/50 rounded-xl">
              {renderSkillsSection("font-bold text-emerald-805", "text-[10px] text-gray-800 leading-relaxed")}
            </div>
          </div>

          {experience.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 border-b border-emerald-100 pb-1">Experience</h4>
              {experience.map((work, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-extrabold">
                    <span className="text-gray-900">{work.role} at <span className="text-emerald-650">{work.company}</span></span>
                    <span className="text-gray-400">{work.dates}</span>
                  </div>
                  {work.technologies && (
                    <p className="text-[9px] text-emerald-700 italic"><span className="font-bold">Tech Stack Used:</span> {work.technologies}</p>
                  )}
                  <div className="text-[11px] text-gray-505 leading-relaxed whitespace-pre-line">{work.description}</div>
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 border-b border-emerald-100 pb-1">Projects</h4>
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-extrabold">
                    <span className="text-gray-900">{proj.title}</span>
                    <span className="text-[9px] text-emerald-705 italic font-bold">Tech: {proj.technologies}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 leading-relaxed">{proj.description}</div>
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 border-b border-emerald-100 pb-1">Education</h4>
              {education.map((edu, idx) => (
                <div key={idx} className="text-xs font-bold text-gray-800 space-y-0.5">
                  <div className="flex justify-between">
                    <span>{edu.degree} — {edu.school}</span>
                    <span className="text-emerald-650">{edu.year}</span>
                  </div>
                  {edu.coursework && <p className="text-emerald-650 text-[9px] font-normal italic">{edu.coursework}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {renderCertificationsSection(
            "text-xs font-extrabold uppercase tracking-widest text-emerald-700 border-b border-emerald-100 pb-1",
            "text-[10px] space-y-1 px-2 pt-1"
          )}
        </div>
      )}
    </>
  );
}
