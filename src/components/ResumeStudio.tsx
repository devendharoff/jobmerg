import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Upload, Plus, Search, Trash2, Printer, ArrowRight, ArrowLeft, Check, CheckCircle2, 
  X, AlertCircle, AlertTriangle, ExternalLink, FileText, BookOpen, Briefcase, Award, LayoutGrid, Activity, 
  Columns, Eye, Settings, Undo, Redo, ZoomIn, ZoomOut, Copy, History, Sliders, Info, ShieldCheck, 
  ChevronRight, Calendar, MapPin, Mail, Phone, Globe, Trash, RefreshCw, User, Award as CertIcon, Edit3
} from 'lucide-react';
import ResumeTemplateRenderer from './ResumeTemplateRenderer';
import { TemplateId } from './ResumeBuilder';
import { extractKeywordsFromJD } from '../../services/jdAnalyzer';

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
  { id: 'emerald', name: 'Emerald Fresh', tag: 'Badge Grid', category: 'Modern' },
  { id: 'aditya_srikar', name: 'Aditya Srikar Senior Tech', tag: 'High Impact Lead', category: 'Technical' },
  { id: 'classic_formal', name: 'Classic Formal ATS', tag: 'Word Standard', category: 'Corporate' },
  { id: 'data_scientist', name: 'Entry Level Data Scientist', tag: 'AI & Analytics', category: 'Technical' },
  { id: 'experienced_hire_v1', name: 'Experienced Hire v1', tag: 'Senior Executive', category: 'Executive' },
  { id: 'experienced_hire_v2', name: 'Experienced Hire v2', tag: 'Modern Specialist', category: 'Executive' },
  { id: 'student_graduate', name: 'University Graduate', tag: 'Student Focus', category: 'Corporate' },
  { id: 'tech_program_mgr', name: 'Technical Program Mgr', tag: 'TPM & Agile', category: 'Technical' },
  { id: 'corporate_bullet', name: 'Corporate Bullet', tag: 'Minimal ATS', category: 'Corporate' }
] as const;

const BLANK_RESUME: Resume = {
  id: 'resume-1',
  name: 'My Resume',
  targetRole: '',
  targetCompany: '',
  atsScore: 0,
  lastUpdated: 'Just now',
  version: 'v1',
  personal: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    github: '',
    linkedin: '',
    portfolio: ''
  },
  summary: '',
  skills: {
    languages: '',
    frameworks: '',
    tools: '',
    competencies: ''
  },
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  versions: []
};

// Keep DEFAULT_RESUME as an alias so existing code referencing it still compiles
const DEFAULT_RESUME = BLANK_RESUME;

const BROWSER_SKILL_MAP: Record<string, { name: string; bucket: 'languages' | 'frameworks' | 'tools' | 'competencies' }> = {
  'javascript': { name: 'JavaScript', bucket: 'languages' },
  'java script': { name: 'JavaScript', bucket: 'languages' },
  'typescript': { name: 'TypeScript', bucket: 'languages' },
  'type script': { name: 'TypeScript', bucket: 'languages' },
  'python': { name: 'Python', bucket: 'languages' },
  'java': { name: 'Java', bucket: 'languages' },
  'c++': { name: 'C++', bucket: 'languages' },
  'c#': { name: 'C#', bucket: 'languages' },
  'go': { name: 'Go', bucket: 'languages' },
  'golang': { name: 'Go', bucket: 'languages' },
  'rust': { name: 'Rust', bucket: 'languages' },
  'php': { name: 'PHP', bucket: 'languages' },
  'ruby': { name: 'Ruby', bucket: 'languages' },
  'swift': { name: 'Swift', bucket: 'languages' },
  'kotlin': { name: 'Kotlin', bucket: 'languages' },
  'dart': { name: 'Dart', bucket: 'languages' },
  'scala': { name: 'Scala', bucket: 'languages' },
  'r': { name: 'R', bucket: 'languages' },
  'sql': { name: 'SQL', bucket: 'languages' },
  'graphql': { name: 'GraphQL', bucket: 'languages' },
  'html': { name: 'HTML', bucket: 'languages' },
  'css': { name: 'CSS', bucket: 'languages' },
  'react': { name: 'React', bucket: 'frameworks' },
  'react.js': { name: 'React', bucket: 'frameworks' },
  'reactjs': { name: 'React', bucket: 'frameworks' },
  'next.js': { name: 'Next.js', bucket: 'frameworks' },
  'nextjs': { name: 'Next.js', bucket: 'frameworks' },
  'vue': { name: 'Vue.js', bucket: 'frameworks' },
  'vue.js': { name: 'Vue.js', bucket: 'frameworks' },
  'angular': { name: 'Angular', bucket: 'frameworks' },
  'svelte': { name: 'Svelte', bucket: 'frameworks' },
  'node.js': { name: 'Node.js', bucket: 'frameworks' },
  'nodejs': { name: 'Node.js', bucket: 'frameworks' },
  'express': { name: 'Express.js', bucket: 'frameworks' },
  'express.js': { name: 'Express.js', bucket: 'frameworks' },
  'nestjs': { name: 'NestJS', bucket: 'frameworks' },
  'nest.js': { name: 'NestJS', bucket: 'frameworks' },
  'django': { name: 'Django', bucket: 'frameworks' },
  'flask': { name: 'Flask', bucket: 'frameworks' },
  'fastapi': { name: 'FastAPI', bucket: 'frameworks' },
  'spring': { name: 'Spring Boot', bucket: 'frameworks' },
  'spring boot': { name: 'Spring Boot', bucket: 'frameworks' },
  'ruby on rails': { name: 'Ruby on Rails', bucket: 'frameworks' },
  'rails': { name: 'Ruby on Rails', bucket: 'frameworks' },
  'laravel': { name: 'Laravel', bucket: 'frameworks' },
  '.net': { name: '.NET', bucket: 'frameworks' },
  'dotnet': { name: '.NET', bucket: 'frameworks' },
  'asp.net': { name: 'ASP.NET', bucket: 'frameworks' },
  'flutter': { name: 'Flutter', bucket: 'frameworks' },
  'react native': { name: 'React Native', bucket: 'frameworks' },
  'redux': { name: 'Redux', bucket: 'frameworks' },
  'redux toolkit': { name: 'Redux Toolkit', bucket: 'frameworks' },
  'tailwind': { name: 'Tailwind CSS', bucket: 'frameworks' },
  'tailwindcss': { name: 'Tailwind CSS', bucket: 'frameworks' },
  'tailwind css': { name: 'Tailwind CSS', bucket: 'frameworks' },
  'bootstrap': { name: 'Bootstrap', bucket: 'frameworks' },
  'mui': { name: 'Material UI', bucket: 'frameworks' },
  'material ui': { name: 'Material UI', bucket: 'frameworks' },
  'zustand': { name: 'Zustand', bucket: 'frameworks' },
  'aws': { name: 'AWS', bucket: 'tools' },
  'amazon web services': { name: 'AWS', bucket: 'tools' },
  'gcp': { name: 'GCP', bucket: 'tools' },
  'google cloud': { name: 'GCP', bucket: 'tools' },
  'azure': { name: 'Azure', bucket: 'tools' },
  'docker': { name: 'Docker', bucket: 'tools' },
  'kubernetes': { name: 'Kubernetes', bucket: 'tools' },
  'k8s': { name: 'Kubernetes', bucket: 'tools' },
  'git': { name: 'Git', bucket: 'tools' },
  'github': { name: 'GitHub', bucket: 'tools' },
  'gitlab': { name: 'GitLab', bucket: 'tools' },
  'jenkins': { name: 'Jenkins', bucket: 'tools' },
  'ci/cd': { name: 'CI/CD', bucket: 'tools' },
  'ci cd': { name: 'CI/CD', bucket: 'tools' },
  'github actions': { name: 'GitHub Actions', bucket: 'tools' },
  'terraform': { name: 'Terraform', bucket: 'tools' },
  'ansible': { name: 'Ansible', bucket: 'tools' },
  'postgresql': { name: 'PostgreSQL', bucket: 'tools' },
  'postgres': { name: 'PostgreSQL', bucket: 'tools' },
  'mongodb': { name: 'MongoDB', bucket: 'tools' },
  'mysql': { name: 'MySQL', bucket: 'tools' },
  'redis': { name: 'Redis', bucket: 'tools' },
  'sqlite': { name: 'SQLite', bucket: 'tools' },
  'oracle': { name: 'Oracle', bucket: 'tools' },
  'elasticsearch': { name: 'Elasticsearch', bucket: 'tools' },
  'firebase': { name: 'Firebase', bucket: 'tools' },
  'supabase': { name: 'Supabase', bucket: 'tools' },
  'prisma': { name: 'Prisma', bucket: 'tools' },
  'rabbitmq': { name: 'RabbitMQ', bucket: 'tools' },
  'kafka': { name: 'Kafka', bucket: 'tools' },
  'nginx': { name: 'Nginx', bucket: 'tools' },
  'linux': { name: 'Linux', bucket: 'tools' },
  'bash': { name: 'Bash', bucket: 'tools' },
  'shell': { name: 'Shell Scripting', bucket: 'tools' },
  'vite': { name: 'Vite', bucket: 'tools' },
  'webpack': { name: 'Webpack', bucket: 'tools' },
  'rollup': { name: 'Rollup', bucket: 'tools' },
  'jest': { name: 'Jest', bucket: 'tools' },
  'vitest': { name: 'Vitest', bucket: 'tools' },
  'cypress': { name: 'Cypress', bucket: 'tools' },
  'playwright': { name: 'Playwright', bucket: 'tools' },
  'selenium': { name: 'Selenium', bucket: 'tools' },
  'postman': { name: 'Postman', bucket: 'tools' },
  'swagger': { name: 'Swagger', bucket: 'tools' },
  'figma': { name: 'Figma', bucket: 'tools' },
  'jira': { name: 'Jira', bucket: 'competencies' },
  'confluence': { name: 'Confluence', bucket: 'competencies' },
  'agile': { name: 'Agile', bucket: 'competencies' },
  'scrum': { name: 'Scrum', bucket: 'competencies' },
  'kanban': { name: 'Kanban', bucket: 'competencies' },
  'microservices': { name: 'Microservices', bucket: 'competencies' },
  'system design': { name: 'System Design', bucket: 'competencies' },
  'oauth': { name: 'OAuth', bucket: 'competencies' },
  'rest api': { name: 'REST APIs', bucket: 'competencies' },
  'restful api': { name: 'REST APIs', bucket: 'competencies' },
  'rest': { name: 'REST APIs', bucket: 'competencies' },
  'unit testing': { name: 'Unit Testing', bucket: 'competencies' },
  'tdd': { name: 'TDD', bucket: 'competencies' },
  'code review': { name: 'Code Review', bucket: 'competencies' },
  'mentoring': { name: 'Mentoring', bucket: 'competencies' },
  'leadership': { name: 'Leadership', bucket: 'competencies' },
  'data structures': { name: 'Data Structures', bucket: 'competencies' },
  'algorithms': { name: 'Algorithms', bucket: 'competencies' },
  'oop': { name: 'OOP', bucket: 'competencies' },
  'object oriented': { name: 'Object-Oriented Programming', bucket: 'competencies' },
  'machine learning': { name: 'Machine Learning', bucket: 'competencies' },
  'devops': { name: 'DevOps', bucket: 'competencies' },
  'sre': { name: 'SRE', bucket: 'competencies' },
};

type BrowserExtractResult = {
  personal: { name: string; title: string; email: string; phone: string; location: string; github: string; linkedin: string; portfolio: string };
  summary: string;
  skills: SkillsGrouped;
  experience: WorkExp[];
  education: Education[];
  projects: Project[];
  certifications: string[];
  confidenceScores: { name: number; email: number; phone: number; skills: number; experience: number; education: number; overall: number };
};

function extractProfileFromTextBrowser(text: string): BrowserExtractResult {
  const clean = (text || '').replace(/\r\n/g, '\n');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  const lower = clean.toLowerCase();

  const emailMatch = clean.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = clean.match(/(\+?\d{0,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{0,4}/);
  const linkedinMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub|company|school|groups)\/[\w\-_%./]+/i);
  const githubMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-./]+/i);
  const portfolioMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?(?!linkedin|github|twitter|facebook|instagram|youtube|medium|quora|reddit)[\w-]+\.(?:com|org|net|io|dev|me|in|co|app|ai|xyz|tech|design|studio|agency|online)[\w\-./]*/i);

  let candidateName = '';
  const commonWords = new Set(['resume', 'curriculum', 'vitae', 'cv', 'contact', 'profile', 'about', 'me', 'email', 'phone', 'address', 'skills', 'experience', 'education', 'projects', 'objective', 'summary', 'work', 'references', 'language', 'languages']);
  for (const line of lines.slice(0, 8)) {
    const filtered = line
      .replace(/[^\p{L}\s\-'.]/gu, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    const words = filtered.split(' ').filter(Boolean);
    if (words.length >= 2 && words.length <= 6) {
      const uncommon = words.filter(w => !commonWords.has(w.toLowerCase())).length;
      const capitalized = words.filter(w => /^[A-Z]/.test(w)).length;
      if (uncommon / words.length >= 0.5 && capitalized / words.length >= 0.5) {
        candidateName = filtered;
        break;
      }
    }
  }

  let professionalTitle = '';
  const titleKeywords = /(engineer|developer|architect|manager|lead|scientist|analyst|designer|consultant|specialist|director|officer|administrator|intern|associate|consultant|head|principal|staff|senior|junior|executive|founder|cto|ceo|pm|product)/i;
  for (const line of lines.slice(0, 12)) {
    if (titleKeywords.test(line) && !line.includes('@') && line.length < 80) {
      professionalTitle = line;
      break;
    }
  }

  const skillBuckets = { languages: [] as string[], frameworks: [] as string[], tools: [] as string[], competencies: [] as string[] };
  const seen = new Set<string>();
  Object.entries(BROWSER_SKILL_MAP).forEach(([key, entry]) => {
    if (seen.has(entry.name)) return;
    const pattern = new RegExp('(^|[^a-z0-9])' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)', 'i');
    if (pattern.test(lower)) {
      skillBuckets[entry.bucket].push(entry.name);
      seen.add(entry.name);
    }
  });

  const experiences: WorkExp[] = [];
  const sectionPoints = [
    { label: 'experience', idx: lower.search(/experience|employment|work( history)?|professional/) },
    { label: 'education', idx: lower.search(/education|academic|qualification|degree/) },
    { label: 'projects', idx: lower.search(/project|personal project|key project/) },
    { label: 'skills', idx: lower.search(/skill|technical skill|core compete/) },
  ].filter(s => s.idx >= 0).sort((a, b) => a.idx - b.idx);
  const getSectionRange = (label: string): [number, number] => {
    const start = sectionPoints.find(s => s.label === label);
    if (!start) return [-1, -1];
    const next = sectionPoints.find(s => s.idx > start.idx);
    return [start.idx, next ? next.idx : clean.length];
  };
  const expRange = getSectionRange('experience');
  if (expRange[0] >= 0) {
    const expChunk = clean.slice(expRange[0], expRange[1]);
    const expLines = expChunk.split('\n').map(l => l.trim()).filter(Boolean);
    const datePattern = /((?:19|20)\d{2}\s*[-–]\s*(?:(?:19|20)\d{2}|present|current))|(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2}\s*[-–]\s*(?:present|current|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2}))/i;
    let currentEntry: Partial<WorkExp> | null = null;
    for (const line of expLines.slice(1)) {
      if (datePattern.test(line) || /(present|current)/i.test(line) && line.length < 120) {
        if (currentEntry && (currentEntry.company || currentEntry.role)) {
          experiences.push({
            company: currentEntry.company || '',
            role: currentEntry.role || '',
            dates: currentEntry.dates || '',
            description: currentEntry.description || '',
            technologies: currentEntry.technologies || '',
          });
        }
        currentEntry = { dates: line };
      } else if (line.length > 2 && line.length < 100 && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('—')) {
        if (!currentEntry) currentEntry = {};
        if (!currentEntry.role) {
          currentEntry.role = line;
        } else if (!currentEntry.company) {
          currentEntry.company = line;
        } else if (currentEntry.description) {
          currentEntry.description += '\n' + line;
        } else {
          currentEntry.company += ' | ' + line;
        }
      } else if (line.length > 5) {
        if (!currentEntry) currentEntry = {};
        const bullet = line.replace(/^[\s•\-\*\—]\s*/, '');
        if (currentEntry.description) {
          currentEntry.description += '\n• ' + bullet;
        } else {
          currentEntry.description = '• ' + bullet;
        }
      }
    }
    if (currentEntry && (currentEntry.company || currentEntry.role)) {
      experiences.push({
        company: currentEntry.company || '',
        role: currentEntry.role || '',
        dates: currentEntry.dates || '',
        description: currentEntry.description || '',
        technologies: currentEntry.technologies || '',
      });
    }
  }

  const educations: Education[] = [];
  const eduRange = getSectionRange('education');
  if (eduRange[0] >= 0) {
    const eduChunk = clean.slice(eduRange[0], eduRange[1]);
    const eduLines = eduChunk.split('\n').map(l => l.trim()).filter(Boolean).slice(1);
    const degreePattern = /(bachelor|master|phd|ph\.d|doctor|b\.?tech|m\.?tech|b\.?e|m\.?e|b\.?sc|m\.?sc|b\.?a|m\.?a|diploma|certification|graduate|post.?graduate)/i;
    let cur: Partial<Education> | null = null;
    for (const line of eduLines) {
      const yearMatch = line.match(/((?:19|20)\d{2}\s*[-–]\s*(?:(?:19|20)\d{2}|present|current))|((?:19|20)\d{2})/);
      if (degreePattern.test(line) || /(university|college|institute|school|academy|iit|nit|b\.?tech|m\.?tech)/i.test(line)) {
        if (cur && (cur.school || cur.degree)) educations.push({ school: cur.school || '', degree: cur.degree || '', year: cur.year || '', gpa: cur.gpa || '', coursework: cur.coursework || '' });
        cur = {};
        if (degreePattern.test(line)) cur.degree = line;
        if (/(university|college|institute|school|academy)/i.test(line)) cur.school = line;
        if (yearMatch) cur.year = yearMatch[0];
      } else if (yearMatch) {
        if (!cur) cur = {};
        cur.year = (cur.year ? cur.year + ' ' : '') + yearMatch[0];
      } else if (line.length < 200) {
        if (!cur) cur = {};
        if (!cur.school) cur.school = line;
        else if (!cur.coursework) cur.coursework = line;
        else cur.coursework += '; ' + line;
      }
    }
    if (cur && (cur.school || cur.degree)) educations.push({ school: cur.school || '', degree: cur.degree || '', year: cur.year || '', gpa: cur.gpa || '', coursework: cur.coursework || '' });
  }

  const projRange = getSectionRange('projects');
  const projects: Project[] = [];
  if (projRange[0] >= 0) {
    const chunk = clean.slice(projRange[0], projRange[1]);
    const projLines = chunk.split('\n').map(l => l.trim()).filter(Boolean).slice(1);
    let cur: Partial<Project> | null = null;
    for (const line of projLines) {
      const shortBullet = line.replace(/^[\s•\-\*\—]\s*/, '');
      if (line.length < 80 && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && !shortBullet.startsWith('—') && line.length > 3) {
        if (cur && (cur.title)) projects.push({ title: cur.title, technologies: cur.technologies || '', description: cur.description || '' });
        cur = { title: line };
      } else if (cur) {
        if (cur.description) cur.description += '\n' + shortBullet;
        else cur.description = shortBullet;
      }
    }
    if (cur && cur.title) projects.push({ title: cur.title, technologies: cur.technologies || '', description: cur.description || '' });
  }

  const certifications: string[] = [];
  const certIdx = lower.search(/certif|award|achievement/);
  if (certIdx >= 0) {
    const endIdx = clean.indexOf('\n\n', certIdx);
    const chunk = clean.slice(certIdx, endIdx === -1 ? clean.length : endIdx);
    chunk.split('\n').slice(1).forEach(line => {
      const trimmed = line.replace(/^[\s•\-\*\—]\s*/, '').trim();
      if (trimmed.length > 5 && trimmed.length < 200) certifications.push(trimmed);
    });
  }

  let summary = '';
  const objIdx = lower.search(/objective|summary|professional summary|about me|profile|personal profile/);
  if (objIdx >= 0) {
    const nxt = sectionPoints.find(s => s.idx > objIdx);
    const end = nxt ? nxt.idx : Math.min(objIdx + 1200, clean.length);
    const chunkLines = clean.slice(objIdx, end).split('\n').slice(1).map(l => l.trim()).filter(Boolean);
    summary = chunkLines.filter(l => l.length > 20).join(' ').slice(0, 600);
  } else if (lines.length > 15) {
    summary = lines.slice(lines.findIndex(l => l.length > 100) + 1 || 4, 14).join(' ').slice(0, 500);
  }

  const skillsCount = skillBuckets.languages.length + skillBuckets.frameworks.length + skillBuckets.tools.length + skillBuckets.competencies.length;
  const nameScore = candidateName ? 92 : 20;
  const emailScore = emailMatch ? 99 : 10;
  const phoneScore = phoneMatch ? 95 : 10;
  const skillsScore = skillsCount >= 8 ? 95 : skillsCount >= 4 ? 75 : skillsCount > 0 ? 55 : 25;
  const expScore = experiences.length > 0 ? 92 : 20;
  const eduScore = educations.length > 0 ? 93 : 20;
  const overall = Math.round(nameScore * 0.15 + emailScore * 0.12 + phoneScore * 0.08 + skillsScore * 0.22 + expScore * 0.25 + eduScore * 0.18);

  return {
    personal: {
      name: candidateName,
      title: professionalTitle,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: '',
      github: githubMatch ? githubMatch[0] : '',
      linkedin: linkedinMatch ? linkedinMatch[0] : '',
      portfolio: portfolioMatch ? portfolioMatch[0] : '',
    },
    summary,
    skills: {
      languages: skillBuckets.languages.join(', '),
      frameworks: skillBuckets.frameworks.join(', '),
      tools: skillBuckets.tools.join(', '),
      competencies: skillBuckets.competencies.join(', '),
    },
    experience: experiences,
    education: educations,
    projects,
    certifications: certifications.slice(0, 8),
    confidenceScores: { name: nameScore, email: emailScore, phone: phoneScore, skills: skillsScore, experience: expScore, education: eduScore, overall },
  };
}


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
  const [confidenceScores, setConfidenceScores] = useState({
    name: 0,
    email: 0,
    phone: 0,
    skills: 0,
    experience: 0,
    education: 0,
    overall: 0
  });
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionErrorDetail, setExtractionErrorDetail] = useState<string | null>(null);
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pasteModeText, setPasteModeText] = useState('');
  const [isLocalExtracting, setIsLocalExtracting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{ type: 'pdf' | 'docx' | 'link'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


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
    setExportFeedback(null);
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
    const originalTitle = document.title;
    const userName = personal.name || userProfile.name || 'Resume';
    document.title = `${userName.replace(/\s+/g, '_')}_Resume`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };
  const handlePrintPdf = () => {
    handlePrint();
    setExportFeedback({
      type: 'pdf',
      message: 'Print dialog opened. Select "Save as PDF" as the Destination in the print dialog. Enable "Background graphics" under More Settings to preserve template styling, then click Save.'
    });
  };

  const handleDownloadDocx = () => {
    const r = activeResume;
    const name = personal.name || 'Candidate';
    
    // Construct MS Word-compatible HTML string
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${name} - Resume</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.25; color: #333333; margin: 1in; }
    h1 { font-size: 18pt; font-weight: bold; margin-bottom: 2pt; text-align: center; color: #000000; text-transform: uppercase; }
    .contact-info { text-align: center; font-size: 9.5pt; color: #475569; margin-bottom: 12pt; }
    h2 { font-size: 12.5pt; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; margin-top: 14pt; margin-bottom: 6pt; text-transform: uppercase; }
    .section-desc { font-size: 10.5pt; margin-bottom: 8pt; text-align: justify; }
    .item { margin-bottom: 10pt; }
    .item-header { font-weight: bold; font-size: 11pt; color: #000000; }
    .item-meta { font-style: italic; color: #475569; margin-bottom: 2pt; }
    .item-tech { font-size: 9.5pt; font-weight: bold; color: #0f766e; margin-bottom: 2pt; }
    .bullets { margin: 0; padding-left: 18pt; }
    .bullet-item { margin-bottom: 3pt; font-size: 10.5pt; }
    .skills-table { width: 100%; border-collapse: collapse; margin-top: 4pt; }
    .skills-row { margin-bottom: 4pt; }
    .skills-label { font-weight: bold; font-size: 10.5pt; color: #0f172a; width: 130px; vertical-align: top; }
    .skills-val { font-size: 10.5pt; color: #334155; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <div class="contact-info">
    ${[
      personal.phone && `Phone: ${personal.phone}`,
      personal.email && `Email: ${personal.email}`,
      personal.location && `Location: ${personal.location}`,
      personal.linkedin && `LinkedIn: ${personal.linkedin}`,
      personal.github && `GitHub: ${personal.github}`,
      personal.portfolio && `Portfolio: ${personal.portfolio}`
    ].filter(Boolean).join('  |  ')}
  </div>
`;

    if (summary) {
      html += `<h2>Professional Summary</h2>
  <div class="section-desc">${summary}</div>
`;
    }

    if (skillsGrouped && (skillsGrouped.languages || skillsGrouped.frameworks || skillsGrouped.tools || skillsGrouped.competencies)) {
      html += `<h2>Core Competencies & Skills</h2>
  <table class="skills-table">
`;
      if (skillsGrouped.languages) {
        html += `    <tr class="skills-row"><td class="skills-label">Languages:</td><td class="skills-val">${skillsGrouped.languages}</td></tr>\n`;
      }
      if (skillsGrouped.frameworks) {
        html += `    <tr class="skills-row"><td class="skills-label">Frameworks & Libs:</td><td class="skills-val">${skillsGrouped.frameworks}</td></tr>\n`;
      }
      if (skillsGrouped.tools) {
        html += `    <tr class="skills-row"><td class="skills-label">Tools & Platforms:</td><td class="skills-val">${skillsGrouped.tools}</td></tr>\n`;
      }
      if (skillsGrouped.competencies) {
        html += `    <tr class="skills-row"><td class="skills-label">Methodologies:</td><td class="skills-val">${skillsGrouped.competencies}</td></tr>\n`;
      }
      html += `  </table>\n`;
    }

    if (experience && experience.length > 0) {
      html += `<h2>Work History</h2>\n`;
      experience.forEach(exp => {
        html += `  <div class="item">
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td class="item-header" style="text-align:left;">${exp.role} &nbsp;—&nbsp; ${exp.company}</td>
        <td class="item-header" style="text-align:right;">${exp.dates}</td>
      </tr>
    </table>
`;
        if (exp.technologies) {
          html += `    <div class="item-tech">Technologies: ${exp.technologies}</div>\n`;
        }
        if (exp.description) {
          html += `    <ul class="bullets">\n`;
          const bullets = exp.description.split('\n').map(b => b.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
          bullets.forEach(bullet => {
            html += `      <li class="bullet-item">${bullet}</li>\n`;
          });
          html += `    </ul>\n`;
        }
        html += `  </div>\n`;
      });
    }

    if (projects && projects.length > 0) {
      html += `<h2>Key Projects</h2>\n`;
      projects.forEach(proj => {
        html += `  <div class="item">
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td class="item-header" style="text-align:left;">${proj.title}</td>
        <td class="item-header" style="text-align:right; font-weight:normal; font-style:italic;">${proj.technologies}</td>
      </tr>
    </table>
    <div style="font-size:10.5pt; color:#334155; margin-top:2px;">${proj.description}</div>
  </div>\n`;
      });
    }

    if (education && education.length > 0) {
      html += `<h2>Education</h2>\n`;
      education.forEach(edu => {
        html += `  <div class="item">
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td class="item-header" style="text-align:left;">${edu.degree}</td>
        <td class="item-header" style="text-align:right;">${edu.year}</td>
      </tr>
    </table>
    <div class="item-meta">${edu.school}</div>
    ${edu.coursework ? `<div style="font-size:9.5pt; color:#475569; italic;">Relevant Coursework: ${edu.coursework}</div>` : ''}
  </div>\n`;
      });
    }

    if (certifications && certifications.length > 0 && certifications[0]) {
      html += `<h2>Certifications</h2>
  <ul class="bullets">
`;
      certifications.forEach(cert => {
        if (cert && cert.trim()) {
          html += `    <li class="bullet-item">${cert}</li>\n`;
        }
      });
      html += `  </ul>\n`;
    }

    html += `</body>\n</html>`;

    // Create Blob and trigger download
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_Resume.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportFeedback({
      type: 'docx',
      message: `Successfully downloaded editable Word file: "${name.replace(/\s+/g, '_')}_Resume.doc". Open it in Microsoft Word, Pages, or Google Docs.`
    });
  };

  const handleCreateLink = () => {
    const link = `https://jobmerge.co/share/resume-${selectedResumeId}`;
    navigator.clipboard.writeText(link);
    setExportFeedback({
      type: 'link',
      message: `Share Link copied to clipboard: "${link}". Anyone with this link can view your tailored resume.`
    });
  };

  // Create new resume flow — starts completely blank, no mock data
  const handleCreateNew = () => {
    const newResume: Resume = {
      ...BLANK_RESUME,
      id: `resume-${Date.now()}`,
      name: `Untitled Resume (${resumes.length + 1})`,
      lastUpdated: 'Just now',
      version: 'v1',
      versions: []
    };
    setResumes([...resumes, newResume]);
    setSelectedResumeId(newResume.id);
    // Reset all working state to blank before the new upload
    setPersonal({ ...BLANK_RESUME.personal });
    setSummary('');
    setSkillsGrouped({ ...BLANK_RESUME.skills });
    setExperience([]);
    setEducation([]);
    setProjects([]);
    setCertifications([]);
    setConfidenceScores({ name: 0, email: 0, phone: 0, skills: 0, experience: 0, education: 0, overall: 0 });
    setExtractionError(null);
    goToStep('import');
  };

  // Upload handler — drag and drop
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      extractActualResumeData(e.dataTransfer.files[0]);
    }
  };

  const applyLocalExtraction = (text: string) => {
    const result = extractProfileFromTextBrowser(text);
    setPersonal({
      ...BLANK_RESUME.personal,
      ...result.personal,
    });
    setSummary(result.summary || '');
    setSkillsGrouped(result.skills);
    setExperience(result.experience);
    setEducation(result.education);
    setProjects(result.projects);
    setCertifications(result.certifications);
    setConfidenceScores(result.confidenceScores);
  };

  const extractActualResumeData = (file: File) => {
    setPersonal({ ...BLANK_RESUME.personal });
    setSummary('');
    setSkillsGrouped({ ...BLANK_RESUME.skills });
    setExperience([]);
    setEducation([]);
    setProjects([]);
    setCertifications([]);
    setConfidenceScores({ name: 0, email: 0, phone: 0, skills: 0, experience: 0, education: 0, overall: 0 });
    setExtractionError(null);
    setExtractionErrorDetail(null);

    setUploadProgress(5);
    setExtractionStage('Reading document...');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'txt') {
        try {
          setUploadProgress(60);
          setExtractionStage('Extracting from text locally...');
          const text = atob(base64Data);
          applyLocalExtraction(text);
          setPasteModeText(text);
          setUploadProgress(100);
          setTimeout(() => {
            goToStep('profile');
            setUploadProgress(0);
            setExtractionStage('');
          }, 400);
          return;
        } catch (txtErr: any) {
          setUploadProgress(0);
          setExtractionStage('');
          setExtractionError('Could not read this text file.');
          setExtractionErrorDetail(txtErr?.message || String(txtErr));
          return;
        }
      }

      setUploadProgress(15);
      setExtractionStage('Uploading document to deterministic parser...');

      try {
        const uploadRes = await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeFile: base64Data, fileName: file.name }),
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || errData.detail || 'We couldn\'t process your resume file.');
        }

        const jobData = await uploadRes.json();
        const resumeId = jobData.resumeId;

        const applyCanonicalData = (canonical: any) => {
          const personalOut = {
            name: canonical.personal?.name?.value || '',
            title: canonical.experience?.[0]?.title?.raw || '',
            email: canonical.personal?.email?.value || '',
            phone: canonical.personal?.phone?.raw || '',
            location: canonical.personal?.location?.value || '',
            github: canonical.personal?.github?.value || '',
            linkedin: canonical.personal?.linkedin?.value || '',
            portfolio: canonical.personal?.portfolio?.value || '',
          };

          const skillsList = canonical.skills?.map((s: any) => s.raw_value).filter(Boolean) || [];
          const skillsOut: SkillsGrouped = {
            languages: skillsList.slice(0, 5).join(', '),
            frameworks: skillsList.slice(5, 10).join(', '),
            tools: skillsList.slice(10, 15).join(', '),
            competencies: skillsList.slice(15).join(', '),
          };

          const experienceOut = (canonical.experience || []).map((e: any) => ({
            company: e.company?.raw || '',
            role: e.title?.raw || '',
            dates: e.date?.raw || '',
            description: Array.isArray(e.description) ? e.description.join('\n• ') : (e.description || ''),
            technologies: ''
          }));

          const educationOut = (canonical.education || []).map((e: any) => ({
            school: e.institution || '',
            degree: e.degree || '',
            year: e.date?.raw || '',
            gpa: e.grade ? `${e.grade.type}: ${e.grade.raw}` : '',
            coursework: ''
          }));

          const projectsOut = (canonical.projects || []).map((p: any) => ({
            title: p.name || '',
            technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : '',
            description: Array.isArray(p.description) ? p.description.join(' ') : ''
          }));

          const certificationsOut = (canonical.certifications || []).map((c: any) => c.name);

          const confidenceScoresOut = {
            name: canonical.personal?.name?.value ? 99 : 0,
            email: canonical.personal?.email?.value ? 99 : 0,
            phone: canonical.personal?.phone?.raw ? 95 : 0,
            skills: canonical.skills?.length > 0 ? 95 : 0,
            experience: canonical.experience?.length > 0 ? 95 : 0,
            education: canonical.education?.length > 0 ? 95 : 0,
            overall: 95
          };

          setPersonal(personalOut);
          setSummary(canonical.summary?.value || '');
          setSkillsGrouped(skillsOut);
          setExperience(experienceOut);
          setEducation(educationOut);
          setProjects(projectsOut);
          setCertifications(certificationsOut);
          setConfidenceScores(confidenceScoresOut);

          setUploadProgress(100);
          setExtractionStage('Extraction completed!');
          setTimeout(() => {
            goToStep('profile');
            setUploadProgress(0);
            setExtractionStage('');
          }, 400);
        };

        const canonicalData = jobData.canonical || jobData.structured;
        if (canonicalData) {
          applyCanonicalData(canonicalData);
          return;
        }

        setUploadProgress(25);
        setExtractionStage('File validated ✓ Extraction job queued...');

        // Poll job status every 500ms
        let isDone = false;
        let pollAttempts = 0;

        while (!isDone && pollAttempts < 40) {
          pollAttempts++;
          await new Promise((res) => setTimeout(res, 500));

          const statusRes = await fetch(`/api/resumes/${resumeId}/status`);
          if (!statusRes.ok) continue;

          const statusData = await statusRes.json();
          setUploadProgress(statusData.progress || 35);
          if (statusData.step) {
            setExtractionStage(statusData.step);
          }

          const polledCanonical = statusData.canonical || statusData.structured;
          if (polledCanonical) {
            isDone = true;
            applyCanonicalData(polledCanonical);
            return;
          } else if (statusData.status === 'failed') {
            isDone = true;
            setUploadProgress(0);
            setExtractionStage('');
            setExtractionError(statusData.error || 'Resume extraction failed.');
            setExtractionErrorDetail(statusData.error || 'Please upload a readable PDF/DOCX or paste text below.');
            setIsPasteMode(true);
            return;
          }
        }

        if (!isDone) {
          throw new Error('Resume extraction timed out after 20 seconds.');
        }

      } catch (e: any) {
        console.warn("[ResumeStudio] API extraction notice, attempting browser fallback:", e.message);
        try {
          const rawDocText = atob(base64Data);
          if (rawDocText && rawDocText.length > 30) {
            applyLocalExtraction(rawDocText);
            setUploadProgress(100);
            setExtractionStage('Extraction completed!');
            setTimeout(() => {
              goToStep('profile');
              setUploadProgress(0);
              setExtractionStage('');
            }, 400);
            return;
          }
        } catch (clientErr) {}

        setUploadProgress(0);
        setExtractionStage('');
        setExtractionError('Resume extraction notice: ' + (e.message || 'Could not process document.'));
        setExtractionErrorDetail(e.message || 'Try pasting your resume text below for instant offline extraction.');
        setIsPasteMode(true);
      }
    };
    reader.onerror = () => {
      setUploadProgress(0);
      setExtractionStage('Error reading file');
      setExtractionError('Could not read this file. Please try a different PDF or DOCX.');
      setExtractionErrorDetail('Your browser couldn\'t read this file. Try another file or paste your resume text below.');
      setIsPasteMode(true);
    };
    reader.readAsDataURL(file);
  };

  const performPasteExtraction = () => {
    const text = pasteModeText.trim();
    if (text.length < 50) {
      setExtractionError('Paste at least 50 characters of resume text for local extraction.');
      setExtractionErrorDetail('Copy your resume content and paste it above.');
      return;
    }
    setIsLocalExtracting(true);
    setTimeout(() => {
      try {
        applyLocalExtraction(text);
        setExtractionError(null);
        setExtractionErrorDetail(null);
        setTimeout(() => {
          goToStep('profile');
          setIsLocalExtracting(false);
        }, 300);
      } catch (err: any) {
        setExtractionError('Local extraction failed.');
        setExtractionErrorDetail(err?.message || String(err));
        setIsLocalExtracting(false);
      }
    }, 450);
  };


  // Quick Edit Drawer state
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [activeQuickEditTab, setActiveQuickEditTab] = useState<'personal' | 'summary' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications'>('personal');

  // Job analysis trigger with dynamic keyword extraction
  const handleAnalyzeJob = () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 50) return;
    setIsMatching(true);

    setTimeout(() => {
      // 1. Prepare candidate text & skills list
      const candidateText = [
        personal.name,
        personal.title,
        summary,
        skillsGrouped.languages,
        skillsGrouped.frameworks,
        skillsGrouped.tools,
        skillsGrouped.competencies,
        ...experience.map(e => `${e.role} ${e.company} ${e.description} ${e.technologies || ''}`),
        ...education.map(e => `${e.degree} ${e.school} ${e.coursework || ''}`),
        ...projects.map(p => `${p.title} ${p.description} ${p.technologies}`),
        ...certifications
      ].join(' ');

      const candidateSkills = [
        ...skillsGrouped.languages.split(','),
        ...skillsGrouped.frameworks.split(','),
        ...skillsGrouped.tools.split(','),
        ...skillsGrouped.competencies.split(',')
      ].map(s => s.trim()).filter(Boolean);

      // 2. Perform dynamic NLP analysis via extractKeywordsFromJD
      const analysis = extractKeywordsFromJD(jobDescription, candidateText, candidateSkills);

      // 3. Extract company name if present in JD
      let companyName = activeResume.targetCompany || 'Target Company';
      const companyMatch = jobDescription.match(/(?:at|company:?|hiring for|join|team at)\s+([A-Z][A-Za-z0-9\s&.]{2,30})/i);
      if (companyMatch && companyMatch[1]) {
        const extractedCompany = companyMatch[1].trim();
        if (!['The', 'A', 'An', 'Our', 'We', 'This', 'Your'].includes(extractedCompany)) {
          companyName = extractedCompany;
        }
      }

      // 4. Extract experience requirement if present
      let expLevel = '2–5 years';
      const expMatch = jobDescription.match(/(\d+\s*[-–+to]\s*\d*|\d+\+?)\s*(?:years?|yrs?)/i);
      if (expMatch && expMatch[0]) {
        expLevel = expMatch[0].trim();
      }

      // 5. Extract location/work mode
      let locationMode = 'Remote / Hybrid';
      if (/remote/i.test(jobDescription)) locationMode = 'Remote';
      else if (/hybrid/i.test(jobDescription)) locationMode = 'Hybrid';
      else if (/on-?site/i.test(jobDescription)) locationMode = 'On-site';

      const foundKws = analysis.extractedKeywords.found;
      const missingKws = analysis.extractedKeywords.missing;
      const priorityKws = analysis.extractedKeywords.priority;

      const allExtractedKws = [...foundKws, ...missingKws];
      setKeywordsToHighlight(allExtractedKws.length > 0 ? allExtractedKws : ['React', 'TypeScript', 'Next.js']);

      const matchScore = Math.max(35, Math.min(98, analysis.currentMatchScore));

      const match = {
        role: analysis.jobTitle || activeResume.targetRole || 'Target Role',
        company: companyName,
        experience: expLevel,
        location: locationMode,
        requiredSkills: allExtractedKws.slice(0, 10),
        preferredSkills: missingKws.slice(0, 5),
        matchedKeywords: foundKws,
        missingKeywords: missingKws,
        matchScore: matchScore
      };

      setJobMatchResult(match);

      // 6. Build dynamic tailoring recommendations based on actual missing keywords
      const topMissing = priorityKws.length > 0 ? priorityKws : missingKws;
      const recs: {
        id: string;
        section: 'summary' | 'experience' | 'skills';
        index?: number;
        before: string;
        after: string;
        why: string;
        status: 'pending' | 'accepted' | 'rejected';
      }[] = [];

      if (topMissing.length > 0) {
        const topKwsText = topMissing.slice(0, 3).join(', ');

        // Summary Recommendation
        const summaryBefore = summary || 'Experienced professional with a proven track record.';
        const summaryAfter = summaryBefore.toLowerCase().includes(topMissing[0].toLowerCase())
          ? summaryBefore
          : `${summaryBefore.trim().replace(/\.$/, '')}, with specialized expertise in ${topKwsText} to drive product goals.`;

        recs.push({
          id: 'rec-summary',
          section: 'summary',
          before: summaryBefore,
          after: summaryAfter,
          why: `Incorporates top missing priority keywords (${topKwsText}) extracted directly from this specific job description.`,
          status: 'pending'
        });

        // Experience Recommendation
        if (experience.length > 0) {
          const expBefore = experience[0].description || 'Engineered and maintained core application features.';
          const expKw1 = topMissing[0] || 'scalable architecture';
          const expKw2 = topMissing[1] || 'modern best practices';

          const expAfter = `${expBefore.trim()}\n• Utilized ${expKw1} and ${expKw2} to improve throughput and streamline release cycles.`;

          recs.push({
            id: 'rec-exp-0',
            section: 'experience',
            index: 0,
            before: expBefore,
            after: expAfter,
            why: `Weaves target qualification keywords (${expKw1}, ${expKw2}) into work experience bullet points.`,
            status: 'pending'
          });
        }

        // Skills Recommendation
        if (topMissing.length >= 2) {
          const skillsToAdd = topMissing.slice(0, 4).join(', ');
          recs.push({
            id: 'rec-skills',
            section: 'skills',
            before: skillsGrouped.tools || 'Technical Tools',
            after: skillsGrouped.tools ? `${skillsGrouped.tools}, ${skillsToAdd}` : skillsToAdd,
            why: `Adds missing technical requirements (${skillsToAdd}) to your Tools section for ATS compliance.`,
            status: 'pending'
          });
        }
      }

      setTailorRecommendations(recs);
      setIsMatching(false);

      // Save active resume target info
      setResumes(prev => prev.map(r => r.id === selectedResumeId ? {
        ...r,
        targetRole: match.role,
        targetCompany: match.company,
        atsScore: matchScore
      } : r));

    }, 800);
  };

  // Apply Tailoring change actions
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
      name: `${activeResume.targetCompany || 'Tailored'} Version`,
      atsScore: Math.min(98, (jobMatchResult?.matchScore || 85) + 7),
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
        if (rec.section === 'experience' && rec.index !== undefined && updatedExperience[rec.index]) {
          updatedExperience[rec.index].description = rec.after;
        }
        if (rec.section === 'skills') {
          updatedSkills.tools = rec.after;
        }
      }
    });

    if (jobMatchResult && jobMatchResult.matchedKeywords.length > 0) {
      const topMatched = jobMatchResult.matchedKeywords.slice(0, 4);
      updatedSkills.tools = [...new Set([...updatedSkills.tools.split(',').map(s => s.trim()).filter(Boolean), ...topMatched])].join(', ');
    }

    setSummary(updatedSummary);
    setExperience(updatedExperience);
    setSkillsGrouped(updatedSkills);

    setResumes(prev => prev.map(r => r.id === selectedResumeId ? {
      ...r,
      atsScore: Math.min(98, (r.atsScore || 80) + 7),
      version: `v${r.versions.length + 2}`,
      versions: [newVersion, ...r.versions]
    } : r));

    goToStep('tailorSummary');
  };

  // Add / remove / update handlers for lists
  const addWork = () => setExperience([...experience, { company: '', role: '', dates: '', description: '', technologies: '' }]);
  const removeWork = (idx: number) => setExperience(experience.filter((_, i) => i !== idx));
  const updateWork = (idx: number, field: keyof WorkExp, val: string) => {
    setExperience(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const addEdu = () => setEducation([...education, { school: '', degree: '', year: '', coursework: '' }]);
  const removeEdu = (idx: number) => setEducation(education.filter((_, i) => i !== idx));
  const updateEdu = (idx: number, field: keyof Education, val: string) => {
    setEducation(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const addProj = () => setProjects([...projects, { title: '', technologies: '', description: '' }]);
  const removeProj = (idx: number) => setProjects(projects.filter((_, i) => i !== idx));
  const updateProj = (idx: number, field: keyof Project, val: string) => {
    setProjects(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
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
              onClick={() => setIsQuickEditOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
              title="Edit any text in your resume at any stage"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Resume</span>
            </button>
          )}
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

                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      extractActualResumeData(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  accept=".pdf,.docx"
                />

                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
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

                {extractionError && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 flex gap-3 items-start animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-red-700">Couldn't extract resume</p>
                      <p className="text-[11px] text-red-600 mt-0.5">{extractionError}</p>
                      <p className="text-[10px] text-red-400 mt-1">Supported formats: PDF (text-based) and DOCX</p>
                    </div>
                    <button
                      onClick={() => { setExtractionError(null); fileInputRef.current?.click(); }}
                      className="text-[10px] font-black text-red-600 underline shrink-0"
                    >
                      Try again
                    </button>
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
            <div className={`border-b px-6 py-3 flex justify-between items-center text-xs shrink-0 ${
              confidenceScores.overall < 85 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {confidenceScores.overall < 85 ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>{confidenceScores.overall}% Extraction Confidence — {
                  confidenceScores.overall < 85 ? 'Please verify flagged fields with lower confidence' : 'Review and verify before continuing'
                }</span>
              </div>
              <div className="text-[10px] text-gray-450 font-black uppercase tracking-wider">Verification Layer</div>
            </div>

            {/* Editable Profile area */}
            <div className="flex-grow overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
              
              {/* Personal Info */}
              <div className="border border-gray-150 p-5 rounded-3xl bg-slate-50/50 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-805 tracking-wider">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-gray-500">Full Name</label>
                      {confidenceScores.name < 85 && <span className="text-[10px] text-amber-600 font-black flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Verify name</span>}
                    </div>
                    <input 
                      type="text" 
                      value={personal.name} 
                      onChange={e => setPersonal({...personal, name: e.target.value})} 
                      className={`w-full bg-white border rounded-xl px-3 py-1.5 text-gray-805 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        confidenceScores.name < 85 ? 'border-amber-300 ring-1 ring-amber-300/30' : 'border-gray-200'
                      }`}
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
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-gray-500">Email</label>
                      {confidenceScores.email < 85 && <span className="text-[10px] text-amber-600 font-black flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Verify email</span>}
                    </div>
                    <input 
                      type="text" 
                      value={personal.email} 
                      onChange={e => setPersonal({...personal, email: e.target.value})} 
                      className={`w-full bg-white border rounded-xl px-3 py-1.5 text-gray-855 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        confidenceScores.email < 85 ? 'border-amber-300 ring-1 ring-amber-300/30' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-gray-500">Phone</label>
                      {confidenceScores.phone < 85 && <span className="text-[10px] text-amber-600 font-black flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Verify phone</span>}
                    </div>
                    <input 
                      type="text" 
                      value={personal.phone} 
                      onChange={e => setPersonal({...personal, phone: e.target.value})} 
                      className={`w-full bg-white border rounded-xl px-3 py-1.5 text-gray-855 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        confidenceScores.phone < 85 ? 'border-amber-300 ring-1 ring-amber-300/30' : 'border-gray-200'
                      }`}
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
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-805 tracking-wider">Skills Grouped</h3>
                  {confidenceScores.skills < 85 && <span className="text-[10px] text-amber-600 font-black flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Verify skills completeness</span>}
                </div>
                <div className={`grid grid-cols-1 gap-3 text-xs p-4 bg-white border rounded-3xl ${
                  confidenceScores.skills < 85 ? 'border-amber-200 bg-amber-50/10' : 'border-gray-150'
                }`}>
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

              {/* Work Experience Section */}
              <div className="border border-gray-150 p-5 rounded-3xl bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-805 tracking-wider">Work Experience</h3>
                  <button 
                    onClick={addWork} 
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>
                {experience.map((exp, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 p-4 rounded-2xl space-y-3 relative text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900">Position #{idx + 1}</span>
                      <button onClick={() => removeWork(idx)} className="text-red-500 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Role / Title (e.g. Senior Frontend Developer)" 
                        value={exp.role} 
                        onChange={e => updateWork(idx, 'role', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:bg-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Company Name (e.g. Google)" 
                        value={exp.company} 
                        onChange={e => updateWork(idx, 'company', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:bg-white"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Dates (e.g. Jan 2022 – Present)" 
                      value={exp.dates} 
                      onChange={e => updateWork(idx, 'dates', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:bg-white"
                    />
                    <textarea 
                      rows={3} 
                      placeholder="Key achievements and bullet points..." 
                      value={exp.description} 
                      onChange={e => updateWork(idx, 'description', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-slate-800 focus:outline-none focus:bg-white resize-none"
                    />
                  </div>
                ))}
              </div>

              {/* Education Section */}
              <div className="border border-gray-150 p-5 rounded-3xl bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-805 tracking-wider">Education</h3>
                  <button 
                    onClick={addEdu} 
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Education
                  </button>
                </div>
                {education.map((edu, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 p-4 rounded-2xl space-y-3 relative text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900">Education #{idx + 1}</span>
                      <button onClick={() => removeEdu(idx)} className="text-red-500 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Degree (e.g. B.S. Computer Science)" 
                        value={edu.degree} 
                        onChange={e => updateEdu(idx, 'degree', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:bg-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Institution / University" 
                        value={edu.school} 
                        onChange={e => updateEdu(idx, 'school', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:bg-white"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Graduation Year (e.g. 2023)" 
                      value={edu.year} 
                      onChange={e => updateEdu(idx, 'year', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* Projects Section */}
              <div className="border border-gray-150 p-5 rounded-3xl bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-slate-805 tracking-wider">Projects</h3>
                  <button 
                    onClick={addProj} 
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>
                {projects.map((proj, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 p-4 rounded-2xl space-y-3 relative text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900">Project #{idx + 1}</span>
                      <button onClick={() => removeProj(idx)} className="text-red-500 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Project Title" 
                        value={proj.title} 
                        onChange={e => updateProj(idx, 'title', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:bg-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Technologies Used" 
                        value={proj.technologies} 
                        onChange={e => updateProj(idx, 'technologies', e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:bg-white"
                      />
                    </div>
                    <textarea 
                      rows={2} 
                      placeholder="Project description..." 
                      value={proj.description} 
                      onChange={e => updateProj(idx, 'description', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-slate-800 focus:outline-none focus:bg-white resize-none"
                    />
                  </div>
                ))}
              </div>

              {/* Certifications Section */}
              <div className="border border-gray-150 p-5 rounded-3xl bg-slate-50/50 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-805 tracking-wider">Certifications</h3>
                <form onSubmit={handleAddCert} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add certification (e.g. AWS Certified Solutions Architect)" 
                    value={certInput} 
                    onChange={e => setCertInput(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button type="submit" className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer">
                    Add
                  </button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert, idx) => (
                    <span key={idx} className="bg-white border border-gray-200 text-slate-800 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <span>{cert}</span>
                      <button onClick={() => removeCert(idx)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
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
          <div className="flex-grow flex flex-col lg:flex-row min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 print:hidden animate-fade-in text-left">
            
            {/* LEFT SIDEBAR: DOWNLOAD ACTIONS & CONTROLS */}
            <div className="w-full lg:w-[450px] bg-white p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shrink-0 space-y-6">
              
              <div className="space-y-6">
                <div className="text-center sm:text-left space-y-2">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                    <Check className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-905 font-display">Your resume is ready!</h2>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    Tailored successfully for{' '}
                    <strong className="text-slate-800">
                      {jobMatchResult?.company || activeResume.targetCompany || 'General'}
                    </strong>{' '}
                    —{' '}
                    <span className="text-slate-700 italic">
                      {jobMatchResult?.role || activeResume.targetRole || 'Your Target Role'}
                    </span>{' '}
                    (ATS score: <strong className="text-indigo-650">{activeResume.atsScore || 78}</strong>)
                  </p>
                </div>

                {/* Feedback Panel */}
                {exportFeedback && (
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed animate-fade-in ${
                    exportFeedback.type === 'pdf' 
                      ? 'bg-blue-50 border-blue-200 text-blue-800' 
                      : exportFeedback.type === 'docx'
                      ? 'bg-teal-50 border-teal-200 text-teal-850'
                      : 'bg-emerald-50 border-emerald-250 text-emerald-850'
                  }`}>
                    <div className="flex items-start gap-2">
                      <Info className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold capitalize">{exportFeedback.type} Export Details</p>
                        <p className="font-medium mt-0.5">{exportFeedback.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Download options grid */}
                <div className="space-y-3.5 pt-2">
                  <div className="bg-slate-50 border border-gray-150 p-4.5 rounded-2xl flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 font-display">PDF Document</h4>
                        <p className="text-[10px] text-gray-450 font-medium mt-0.5">Best for online applications and tracking systems.</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Official</span>
                    </div>
                    <button 
                      onClick={handlePrintPdf}
                      className="w-full mt-4 py-2.5 bg-slate-905 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black tracking-wider uppercase cursor-pointer transition-all"
                    >
                      Export PDF
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-gray-150 p-4.5 rounded-2xl flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 font-display">Word File (DOCX)</h4>
                        <p className="text-[10px] text-gray-450 font-medium mt-0.5">Fully editable local file format for manual edits.</p>
                      </div>
                      <span className="bg-teal-100 text-teal-800 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Editable</span>
                    </div>
                    <button 
                      onClick={handleDownloadDocx}
                      className="w-full mt-4 py-2.5 bg-slate-905 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black tracking-wider uppercase cursor-pointer transition-all"
                    >
                      Export DOCX
                    </button>
                  </div>

                  <div className="bg-slate-50 border border-gray-150 p-4.5 rounded-2xl flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 font-display">Share Link</h4>
                        <p className="text-[10px] text-gray-450 font-medium mt-0.5">Create a public link for online viewing.</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-805 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Cloud</span>
                    </div>
                    <button 
                      onClick={handleCreateLink}
                      className="w-full mt-4 py-2.5 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-[10px] font-black tracking-wider uppercase cursor-pointer transition-all"
                    >
                      Copy Share Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Back / Exit */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-150">
                <button onClick={() => goToStep('editor')} className="text-xs font-bold text-gray-500 hover:text-gray-800 hover:underline flex items-center gap-1 transition-all">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Editor</span>
                </button>
                <button onClick={() => goToStep('home')} className="px-4 py-2 bg-slate-905 hover:bg-slate-800 text-white rounded-xl text-xs font-black cursor-pointer transition-all">
                  Exit Studio
                </button>
              </div>

            </div>

            {/* RIGHT PREVIEW PANEL: EXPORT VIEW CANVAS */}
            <div className="flex-1 bg-slate-100/90 p-6 overflow-y-auto flex flex-col items-center justify-start min-h-full">
              
              {/* Document Container */}
              <div 
                id="resume-printable-sheet"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className={`w-full max-w-[620px] min-h-[820px] bg-white rounded-2xl shadow-xl border border-gray-250/90 p-8 sm:p-10 text-gray-900 transition-all ${
                  activeTemplate === 'sidebar' ? 'p-0 overflow-hidden' : ''
                }`}
              >
                <ResumeTemplateRenderer 
                  template={activeTemplate}
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

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #resume-printable-sheet, #resume-printable-sheet * {
            visibility: visible !important;
          }
          #resume-printable-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* GLOBAL QUICK EDIT DRAWER / MODAL - ACCESSIBLE FROM ALL STEPS */}
      {isQuickEditOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in print:hidden">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-gray-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-150 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-display">Edit Resume Content</h3>
                  <p className="text-[10px] text-gray-500 font-semibold">Changes sync instantly across all stages & template previews</p>
                </div>
              </div>
              <button 
                onClick={() => setIsQuickEditOpen(false)}
                className="p-1.5 text-gray-400 hover:text-slate-800 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Edit Navigation Tabs */}
            <div className="flex items-center gap-1 p-2 bg-gray-100 border-b border-gray-200 overflow-x-auto scrollbar-none shrink-0 text-xs font-bold">
              {[
                { id: 'personal', label: 'Personal' },
                { id: 'summary', label: 'Summary' },
                { id: 'skills', label: 'Skills' },
                { id: 'experience', label: 'Experience' },
                { id: 'education', label: 'Education' },
                { id: 'projects', label: 'Projects' },
                { id: 'certifications', label: 'Certifications' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveQuickEditTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    activeQuickEditTab === tab.id ? 'bg-white text-indigo-700 shadow-xs font-black' : 'text-gray-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
              
              {/* Personal Tab */}
              {activeQuickEditTab === 'personal' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-gray-600 font-bold">Full Name</label>
                    <input 
                      type="text" 
                      value={personal.name} 
                      onChange={e => setPersonal({...personal, name: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-600 font-bold">Professional Title</label>
                    <input 
                      type="text" 
                      value={personal.title} 
                      onChange={e => setPersonal({...personal, title: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-600 font-bold">Email</label>
                      <input 
                        type="text" 
                        value={personal.email} 
                        onChange={e => setPersonal({...personal, email: e.target.value})} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-600 font-bold">Phone</label>
                      <input 
                        type="text" 
                        value={personal.phone} 
                        onChange={e => setPersonal({...personal, phone: e.target.value})} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-600 font-bold">LinkedIn URL</label>
                    <input 
                      type="text" 
                      value={personal.linkedin || ''} 
                      onChange={e => setPersonal({...personal, linkedin: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-600 font-bold">GitHub / Portfolio URL</label>
                    <input 
                      type="text" 
                      value={personal.github || personal.portfolio || ''} 
                      onChange={e => setPersonal({...personal, github: e.target.value, portfolio: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Summary Tab */}
              {activeQuickEditTab === 'summary' && (
                <div className="space-y-2">
                  <label className="text-gray-600 font-bold">Professional Summary</label>
                  <textarea 
                    rows={6}
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-slate-800 leading-relaxed resize-none focus:outline-none focus:bg-white"
                    placeholder="Write a concise overview of your core qualifications and experience..."
                  />
                </div>
              )}

              {/* Skills Tab */}
              {activeQuickEditTab === 'skills' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-gray-600 font-bold">Languages</label>
                    <input 
                      type="text" 
                      value={skillsGrouped.languages} 
                      onChange={e => setSkillsGrouped({...skillsGrouped, languages: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-600 font-bold">Frameworks & Libraries</label>
                    <input 
                      type="text" 
                      value={skillsGrouped.frameworks} 
                      onChange={e => setSkillsGrouped({...skillsGrouped, frameworks: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-600 font-bold">Tools & Platforms</label>
                    <input 
                      type="text" 
                      value={skillsGrouped.tools} 
                      onChange={e => setSkillsGrouped({...skillsGrouped, tools: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-600 font-bold">Core Competencies</label>
                    <input 
                      type="text" 
                      value={skillsGrouped.competencies} 
                      onChange={e => setSkillsGrouped({...skillsGrouped, competencies: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Experience Tab */}
              {activeQuickEditTab === 'experience' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900">Work Experience Timeline</span>
                    <button onClick={addWork} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add Role
                    </button>
                  </div>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="bg-slate-50 border border-gray-200 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-600">Role #{idx + 1}</span>
                        <button onClick={() => removeWork(idx)} className="text-red-500 hover:underline text-[10px] font-bold">Remove</button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Job Title" 
                        value={exp.role} 
                        onChange={e => updateWork(idx, 'role', e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5"
                      />
                      <input 
                        type="text" 
                        placeholder="Company" 
                        value={exp.company} 
                        onChange={e => updateWork(idx, 'company', e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5"
                      />
                      <input 
                        type="text" 
                        placeholder="Dates (e.g. Jan 2022 - Present)" 
                        value={exp.dates} 
                        onChange={e => updateWork(idx, 'dates', e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5"
                      />
                      <textarea 
                        rows={4} 
                        placeholder="Bullet points / Description..." 
                        value={exp.description} 
                        onChange={e => updateWork(idx, 'description', e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Education Tab */}
              {activeQuickEditTab === 'education' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900">Education</span>
                    <button onClick={addEdu} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add Education
                    </button>
                  </div>
                  {education.map((edu, idx) => (
                    <div key={idx} className="bg-slate-50 border border-gray-200 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-600">Education #{idx + 1}</span>
                        <button onClick={() => removeEdu(idx)} className="text-red-500 hover:underline text-[10px] font-bold">Remove</button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Degree" 
                        value={edu.degree} 
                        onChange={e => updateEdu(idx, 'degree', e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5"
                      />
                      <input 
                        type="text" 
                        placeholder="School / University" 
                        value={edu.school} 
                        onChange={e => updateEdu(idx, 'school', e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5"
                      />
                      <input 
                        type="text" 
                        placeholder="Year" 
                        value={edu.year} 
                        onChange={e => updateEdu(idx, 'year', e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Projects Tab */}
              {activeQuickEditTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900">Projects</span>
                    <button onClick={addProj} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add Project
                    </button>
                  </div>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="bg-slate-50 border border-gray-200 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-600">Project #{idx + 1}</span>
                        <button onClick={() => removeProj(idx)} className="text-red-500 hover:underline text-[10px] font-bold">Remove</button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Project Title" 
                        value={proj.title} 
                        onChange={e => updateProj(idx, 'title', e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5"
                      />
                      <input 
                        type="text" 
                        placeholder="Technologies" 
                        value={proj.technologies} 
                        onChange={e => updateProj(idx, 'technologies', e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5"
                      />
                      <textarea 
                        rows={3} 
                        placeholder="Description..." 
                        value={proj.description} 
                        onChange={e => updateProj(idx, 'description', e.target.value)} 
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications Tab */}
              {activeQuickEditTab === 'certifications' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddCert} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add certification..." 
                      value={certInput} 
                      onChange={e => setCertInput(e.target.value)} 
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs"
                    />
                    <button type="submit" className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Add</button>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert, idx) => (
                      <span key={idx} className="bg-gray-100 border border-gray-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <span>{cert}</span>
                        <button onClick={() => removeCert(idx)} className="text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Done action */}
            <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-semibold">Changes are saved automatically</span>
              <button 
                onClick={() => setIsQuickEditOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs"
              >
                Done Editing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
