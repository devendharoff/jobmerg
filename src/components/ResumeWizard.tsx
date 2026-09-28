import React, { useState } from 'react';
import { 
  Target, Sparkles, CheckCircle, ArrowRight, RefreshCw, LayoutGrid, Upload, X, ArrowLeft, FileText, Check, ShieldCheck,
  User, Mail, Phone, MapPin, Briefcase, BookOpen, AlertTriangle
} from 'lucide-react';
import { TemplateId } from './ResumeBuilder';

interface ResumeWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (synthesizedData: any, keywords: string[]) => void;
}

const TEMPLATE_OPTIONS = [
  { id: 'executive_ceo', name: 'Executive CEO', tag: 'Classic C-Suite' },
  { id: 'ivy_league', name: 'Ivy League', tag: 'Academic & Finance' },
  { id: 'tech_engineer', name: 'Tech Engineer', tag: 'High-Density ATS' },
  { id: 'corporate_pm', name: 'Senior PM', tag: 'Product & Management' },
  { id: 'teal_executive', name: 'Modern Teal', tag: 'Contemporary' },
  { id: 'sidebar', name: 'Split Sidebar', tag: 'Two-Column Tech' },
  { id: 'indigo', name: 'Indigo Startup', tag: 'Modern Web' },
  { id: 'slate', name: 'Slate Corporate', tag: 'Minimalist' },
  { id: 'emerald', name: 'Emerald Fresh', tag: 'Badge Grid' }
];

function flattenSkills(skills: any): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map((s: any) => String(s).trim()).filter(Boolean);
  if (typeof skills === 'object') {
    const parts: string[] = [];
    ['languages', 'frameworks', 'tools', 'competencies'].forEach(key => {
      if (skills[key] && typeof skills[key] === 'string') {
        skills[key].split(',').forEach((s: string) => {
          const trimmed = s.trim();
          if (trimmed) parts.push(trimmed);
        });
      }
    });
    return Array.from(new Set(parts));
  }
  if (typeof skills === 'string') return skills.split(',').map((s: string) => s.trim()).filter(Boolean);
  return [];
}

function buildFullTextFromParsed(d: any): string {
  if (!d) return '';
  const parts: string[] = [];
  if (d.personal) {
    parts.push(`${d.personal.name || ''}\n${d.personal.title || ''}\n${d.personal.email || ''} ${d.personal.phone || ''} ${d.personal.location || ''}\n`);
    if (d.personal.linkedin) parts.push(`LinkedIn: ${d.personal.linkedin}\n`);
    if (d.personal.github) parts.push(`GitHub: ${d.personal.github}\n`);
    if (d.personal.portfolio) parts.push(`Portfolio: ${d.personal.portfolio}\n`);
  }
  if (d.summary) parts.push(`PROFESSIONAL SUMMARY:\n${d.summary}\n`);
  const flat = flattenSkills(d.skills);
  if (flat.length) parts.push(`SKILLS: ${flat.join(', ')}\n`);
  if (d.experience?.length) {
    parts.push('WORK EXPERIENCE:\n' + d.experience.map((e: any, i: number) => {
      const tech = e.technologies ? `\nTechnologies: ${e.technologies}` : '';
      return `[${i + 1}] ${e.role || ''} at ${e.company || ''} (${e.dates || ''})${tech}\n${e.description || ''}`;
    }).join('\n\n') + '\n');
  }
  if (d.education?.length) {
    parts.push('EDUCATION:\n' + d.education.map((e: any) => {
      const gpa = e.gpa ? ` — GPA: ${e.gpa}` : '';
      return `${e.degree || ''} at ${e.school || ''} (${e.year || ''})${gpa}`;
    }).join('\n') + '\n');
  }
  if (d.projects?.length) {
    parts.push('PROJECTS:\n' + d.projects.map((p: any) => {
      return `${p.title || ''} (${p.technologies || ''})\n${p.description || ''}`;
    }).join('\n\n') + '\n');
  }
  if (d.certifications?.length) parts.push(`CERTIFICATIONS: ${d.certifications.join(', ')}\n`);
  return parts.filter(Boolean).join('\n');
}

function buildFallbackFromParsed(parsedResumeData: any, keywordsList: string[], pastedText: string): any {
  const flat = flattenSkills(parsedResumeData?.skills);
  const skillsMerged = Array.from(new Set([...flat, ...keywordsList])).filter(Boolean).slice(0, 20);
  const expCount = parsedResumeData?.experience?.length;
  const eduCount = parsedResumeData?.education?.length;

  const name = parsedResumeData?.personal?.name || '';
  const title = parsedResumeData?.personal?.title || '';
  const email = parsedResumeData?.personal?.email || '';
  const phone = parsedResumeData?.personal?.phone || '';
  const location = parsedResumeData?.personal?.location || '';
  const github = parsedResumeData?.personal?.github || '';
  const linkedin = parsedResumeData?.personal?.linkedin || '';
  const portfolio = parsedResumeData?.personal?.portfolio || '';
  const summary = parsedResumeData?.summary || (keywordsList.length
    ? `Professional with demonstrated expertise in ${keywordsList.slice(0, 4).join(', ')}.`
    : '');
  const experience = expCount > 0 ? parsedResumeData.experience : [];
  const education = eduCount > 0 ? parsedResumeData.education : [];
  const projects = parsedResumeData?.projects?.length ? parsedResumeData.projects : [];
  const certifications = parsedResumeData?.certifications || [];

  return {
    personal: { name, title, email, phone, location, github, linkedin, portfolio },
    summary,
    skills: skillsMerged,
    experience,
    education,
    projects,
    certifications,
    implementedKeywords: keywordsList.filter(kw =>
      skillsMerged.some(s => s.toLowerCase().includes(kw.toLowerCase()))
    ).slice(0, 10)
  };
}

export default function ResumeWizard({ isOpen, onClose, onGenerate }: ResumeWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [jobDescription, setJobDescription] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [keywords, setKeywords] = useState<{ found: string[]; missing: string[]; priority: string[] } | null>(null);
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('executive_ceo');
  const [oldResumeText, setOldResumeText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState<any>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleExtractKeywords = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      setError('Please paste a detailed job description (minimum 50 characters).');
      return;
    }
    setError('');
    setIsExtracting(true);

    try {
      const resumeText = oldResumeText || buildFullTextFromParsed(parsedResumeData);
      const res = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobDescription,
          resumeText,
          userSkills: flattenSkills(parsedResumeData?.skills)
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKeywords(data.extractedKeywords || { found: [], missing: [], priority: [] });
      setStep(2);
    } catch (e) {
      const lowerJD = jobDescription.toLowerCase();
      const words = Array.from(new Set(lowerJD.match(/\b[a-z]{3,}\b/g) || []))
        .filter((w: string) => !['the', 'and', 'for', 'with', 'you', 'will', 'this', 'that', 'from', 'have', 'are', 'our', 'team', 'work', 'experience', 'skills', 'role', 'required', 'preferred', 'looking', 'join', 'about'].includes(w));
      
      setKeywords({
        found: words.slice(0, 5),
        missing: words.slice(5, 15),
        priority: words.slice(5, 10)
      });
      setStep(2);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError('');
      setIsParsingResume(true);
      setParsedResumeData(null);

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'txt') {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string || '';
          setOldResumeText(text);
          if (text.trim().length > 30) {
            setParsedResumeData({
              personal: { name: '', title: '', email: '', phone: '', location: '', github: '', linkedin: '', portfolio: '' },
              summary: '',
              skills: { languages: '', frameworks: '', tools: '', competencies: '' },
              experience: [],
              education: [],
              projects: [],
              certifications: [],
              confidenceScores: { overall: 50, name: 0, email: 0, phone: 0, skills: 0, experience: 0, education: 0 }
            });
          }
          setIsParsingResume(false);
        };
        reader.readAsText(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1] || base64String;

          const uploadRes = await fetch('/api/resumes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeFile: base64Data, fileName: file.name })
          });

          if (!uploadRes.ok) {
            const errData = await uploadRes.json();
            setError(errData.error || errData.detail || 'Could not upload file.');
            setIsParsingResume(false);
            return;
          }

          const jobData = await uploadRes.json();
          const resumeId = jobData.resumeId;

          let isDone = false;
          let pollCount = 0;
          while (!isDone && pollCount < 40) {
            pollCount++;
            await new Promise((resolve) => setTimeout(resolve, 500));

            const statusRes = await fetch(`/api/resumes/${resumeId}/status`);
            if (!statusRes.ok) continue;

            const statusData = await statusRes.json();

            if (statusData.status === 'completed' && statusData.canonical) {
              isDone = true;
              const canonical = statusData.canonical;

              const mappedData = {
                personal: {
                  name: canonical.personal?.name?.value || '',
                  email: canonical.personal?.email?.value || '',
                  phone: canonical.personal?.phone?.raw || '',
                  location: canonical.personal?.location?.value || '',
                  linkedin: canonical.personal?.linkedin?.value || '',
                  github: canonical.personal?.github?.value || '',
                  portfolio: canonical.personal?.portfolio?.value || '',
                },
                summary: canonical.summary?.value || '',
                skills: {
                  languages: (canonical.skills || []).map((s: any) => s.raw_value).join(', '),
                  frameworks: '',
                  tools: '',
                  competencies: ''
                },
                experience: (canonical.experience || []).map((e: any) => ({
                  company: e.company?.raw || '',
                  role: e.title?.raw || '',
                  dates: e.date?.raw || '',
                  description: Array.isArray(e.description) ? e.description.join('\n• ') : (e.description || '')
                })),
                education: (canonical.education || []).map((e: any) => ({
                  school: e.institution || '',
                  degree: e.degree || '',
                  year: e.date?.raw || '',
                  gpa: e.grade ? `${e.grade.type}: ${e.grade.raw}` : ''
                })),
                projects: (canonical.projects || []).map((p: any) => ({
                  title: p.name || '',
                  technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : '',
                  description: Array.isArray(p.description) ? p.description.join(' ') : ''
                })),
                certifications: (canonical.certifications || []).map((c: any) => c.name),
                confidenceScores: { overall: 95 }
              };

              setParsedResumeData(mappedData);
              setOldResumeText(canonical.raw?.full_text || buildFullTextFromParsed(mappedData));
              setIsParsingResume(false);
              return;
            } else if (statusData.status === 'failed') {
              isDone = true;
              setError(statusData.error || 'Could not extract resume text.');
              setIsParsingResume(false);
              return;
            }
          }

          if (!isDone) {
            setError('Resume extraction timed out after 20 seconds.');
            setIsParsingResume(false);
          }
        } catch (parseErr: any) {
          setError('Could not connect to the resume extraction service. Please try pasting resume text manually.');
          setIsParsingResume(false);
        }
      };
      reader.onerror = () => {
        setError('Could not read this file. Please try a different PDF or DOCX.');
        setIsParsingResume(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    const textToUse = oldResumeText.trim();
    const hasParsedData = !!(parsedResumeData && (
      parsedResumeData.personal?.name ||
      parsedResumeData.experience?.length > 0 ||
      parsedResumeData.skills
    ));
    if (!hasParsedData && (!textToUse || textToUse.length < 30)) {
      setError('Please upload your old resume file or paste its content in the text field (minimum 30 characters).');
      return;
    }
    setError('');
    setIsSynthesizing(true);

    const keywordsList = keywords ? [...keywords.found, ...keywords.priority] : [];
    const extractedText = parsedResumeData ? buildFullTextFromParsed(parsedResumeData) : textToUse;

    try {
      const res = await fetch('/api/synthesize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          oldResumeText: extractedText,
          keywords: keywordsList,
          parsedResumeData: parsedResumeData || null
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const finalSkills = Array.isArray(data.skills) ? data.skills : flattenSkills(data.skills);
      onGenerate({ ...data, skills: finalSkills }, keywordsList);
      onClose();
    } catch (e) {
      const fallbackData = parsedResumeData
        ? buildFallbackFromParsed(parsedResumeData, keywordsList, textToUse)
        : {
            personal: { name: '', title: '', email: '', phone: '', location: '', github: '', linkedin: '', portfolio: '' },
            summary: keywordsList.length ? `Experienced professional with expertise in ${keywordsList.slice(0, 5).join(', ')}.` : '',
            skills: [...keywordsList].slice(0, 15),
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            implementedKeywords: keywordsList.slice(0, 6)
          };
      onGenerate(fallbackData, keywordsList);
      onClose();
    } finally {
      setIsSynthesizing(false);
    }
  };

  const conf = parsedResumeData?.confidenceScores;
  const expCount = parsedResumeData?.experience?.length || 0;
  const eduCount = parsedResumeData?.education?.length || 0;
  const projCount = parsedResumeData?.projects?.length || 0;
  const skillCount = flattenSkills(parsedResumeData?.skills).length;
  const hasName = !!(parsedResumeData?.personal?.name);
  const hasEmail = !!(parsedResumeData?.personal?.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-gray-150 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight font-display">AI Resume Wizard</h2>
              <p className="text-xs text-indigo-200 font-medium">Build a resume matching any job description step-by-step</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 border-b border-gray-150 px-6 py-3 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === s 
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : step > s
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-250 text-gray-400'
              }`}>
                {s}
              </span>
              <span className={`hidden sm:inline font-bold ${step === s ? 'text-gray-900 font-black' : ''}`}>
                {s === 1 ? 'Job Post' : s === 2 ? 'Keywords' : s === 3 ? 'Design' : 'Import'}
              </span>
              {s < 4 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>

        <div className="p-6 flex-1 overflow-y-auto min-h-[300px]">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 text-red-700 border border-red-150 rounded-xl text-xs font-bold text-left">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 text-left animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Paste Target Job Description</label>
                <textarea
                  className="w-full bg-gray-50/60 border border-gray-100 rounded-2xl p-4 text-xs font-mono leading-relaxed text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 h-[220px]"
                  placeholder="Paste the full job description or requirements section here..."
                  value={jobDescription}
                  onChange={(e) => { setJobDescription(e.target.value); setError(''); }}
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleExtractKeywords}
                  disabled={isExtracting || jobDescription.trim().length < 50}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isExtracting ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Extracting Keywords...</>
                  ) : (
                    <>Analyze Keywords <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && keywords && (
            <div className="space-y-5 text-left animate-fade-in">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Target Keywords Extracted</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">We will optimize your resume to highlight these terms.</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider block mb-2">Priority Skills & Technologies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.priority.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold">
                        ⚡ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {keywords.found.length > 0 && (
                  <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block mb-2">Existing Matches</span>
                    <div className="flex flex-wrap gap-1.5">
                      {keywords.found.map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-emerald-250 text-emerald-800 rounded-lg text-xs font-bold">
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-250 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  Select Template <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 text-left animate-fade-in">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Select Resume Template</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Pick the visual layout for your generated document.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TEMPLATE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id as TemplateId)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      selectedTemplate === t.id
                        ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-500/10'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs text-gray-950 block">{t.name}</span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{t.tag}</span>
                    </div>
                    <div className="flex justify-end mt-4">
                      {selectedTemplate === t.id ? (
                        <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px]"><Check className="w-3 h-3 stroke-[3]" /></span>
                      ) : (
                        <span className="w-5 h-5 border border-gray-200 rounded-full" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-250 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  Upload Old Resume <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-left animate-fade-in">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Upload Old Resume Data</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">We extract all sections from your resume and tailor it to the target job.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all space-y-2.5 ${
                  isParsingResume
                    ? 'border-indigo-300 bg-indigo-50/30'
                    : parsedResumeData
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-gray-200 hover:border-indigo-500/50 bg-gray-50/50 hover:bg-indigo-50/5'
                }`}>
                  <input type="file" accept=".pdf,.docx,.txt" onChange={handleUploadFile} className="hidden" disabled={isParsingResume} />
                  <Upload className={`w-7 h-7 ${parsedResumeData ? 'text-emerald-600' : 'text-indigo-600'}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{isParsingResume ? 'Parsing resume...' : (selectedFile ? selectedFile.name : 'Select old resume file')}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Supports PDF, DOCX, TXT up to 10MB</p>
                  </div>
                  {isParsingResume && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                      <div className="bg-indigo-600 h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                  )}
                  {parsedResumeData && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      <Check className="w-3 h-3" /> Extracted successfully
                    </div>
                  )}
                </label>

                {parsedResumeData && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 animate-fade-in">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-wider">Extraction Summary</h4>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Review what we pulled from your uploaded resume</p>
                      </div>
                      {conf && (
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                          conf.overall >= 85
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : conf.overall >= 65
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {conf.overall || 0}% Confidence
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-white border border-slate-100 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                          <User className="w-3 h-3" /> Name
                        </div>
                        <p className={`text-[11px] font-bold mt-1 truncate ${hasName ? 'text-slate-800' : 'text-gray-400'}`}>
                          {hasName ? parsedResumeData.personal.name : 'Not detected'}
                        </p>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                          <Mail className="w-3 h-3" /> Email
                        </div>
                        <p className={`text-[11px] font-bold mt-1 truncate ${hasEmail ? 'text-slate-800' : 'text-gray-400'}`}>
                          {hasEmail ? parsedResumeData.personal.email : 'Not detected'}
                        </p>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                          <Briefcase className="w-3 h-3" /> Experience
                        </div>
                        <p className={`text-[11px] font-black mt-1 ${expCount > 0 ? 'text-indigo-700' : 'text-gray-400'}`}>
                          {expCount > 0 ? `${expCount} job${expCount > 1 ? 's' : ''}` : '0 entries'}
                        </p>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 tracking-wider">
                          <LayoutGrid className="w-3 h-3" /> Skills
                        </div>
                        <p className={`text-[11px] font-black mt-1 ${skillCount > 0 ? 'text-indigo-700' : 'text-gray-400'}`}>
                          {skillCount > 0 ? `${skillCount} found` : '0 detected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                      <span className={`px-2 py-0.5 rounded-lg border ${
                        eduCount > 0 ? 'bg-white text-slate-700 border-slate-200' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        <BookOpen className="w-3 h-3 inline mr-1 align-[-2px]" /> Education: {eduCount || 0}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg border ${
                        projCount > 0 ? 'bg-white text-slate-700 border-slate-200' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        <FileText className="w-3 h-3 inline mr-1 align-[-2px]" /> Projects: {projCount || 0}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg border ${
                        parsedResumeData?.certifications?.length ? 'bg-white text-slate-700 border-slate-200' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        <ShieldCheck className="w-3 h-3 inline mr-1 align-[-2px]" /> Certs: {parsedResumeData?.certifications?.length || 0}
                      </span>
                      {conf && conf.overall < 85 && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Verify low-confidence fields in editor
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Or Paste Old Resume Text Directly</label>
                  <textarea
                    className="w-full bg-gray-50/60 border border-gray-100 rounded-2xl p-4 text-xs font-mono leading-relaxed text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 h-[120px]"
                    placeholder="Enter your old resume text content... (pasting here works as a fallback if upload can't parse your file)"
                    value={oldResumeText}
                    onChange={(e) => { setOldResumeText(e.target.value); setError(''); }}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep(3)}
                  disabled={isSynthesizing}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-250 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={handleSynthesize}
                  disabled={isSynthesizing}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSynthesizing ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Synthesizing Resume...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> Generate & Build Resume</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
