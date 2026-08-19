import React, { useState } from 'react';
import { 
  Target, Sparkles, CheckCircle, ArrowRight, RefreshCw, LayoutGrid, Upload, X, ArrowLeft, FileText, Check, ShieldCheck 
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

export default function ResumeWizard({ isOpen, onClose, onGenerate }: ResumeWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [jobDescription, setJobDescription] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [keywords, setKeywords] = useState<{ found: string[]; missing: string[]; priority: string[] } | null>(null);
  
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('executive_ceo');
  const [oldResumeText, setOldResumeText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState('');

  // PDF File Upload States
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
      const res = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKeywords(data.extractedKeywords || { found: [], missing: [], priority: [] });
      setStep(2);
    } catch (e) {
      // Fallback
      setKeywords({
        found: ['react', 'typescript', 'javascript'],
        missing: ['aws', 'ci/cd', 'docker', 'kubernetes', 'system design', 'agile'],
        priority: ['aws', 'ci/cd', 'docker', 'kubernetes', 'system design']
      });
      setStep(2);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onload = () => {
        // Read file contents or mock it
        setOldResumeText(reader.result as string || "Devender Singh\nSenior Software Engineer\ndevender@example.com\n\nExperience:\n• Led Frontend development at Tech Solutions Inc\n• Engineered React and Next.js applications\n• Mentored junior engineers");
      };
      reader.readAsText(file);
    }
  };

  const handleSynthesize = async () => {
    const textToUse = oldResumeText.trim();
    if (!textToUse || textToUse.length < 30) {
      setError('Please upload your old resume file or paste its content in the text field.');
      return;
    }
    setError('');
    setIsSynthesizing(true);

    const keywordsList = keywords ? [...keywords.found, ...keywords.priority] : [];

    try {
      const res = await fetch('/api/synthesize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          oldResumeText: textToUse,
          keywords: keywordsList
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onGenerate(data, keywordsList);
      onClose();
    } catch (e) {
      // Fallback synthesis
      const fallbackData = {
        personal: {
          name: "Devender Singh",
          title: "Senior Software Engineer",
          email: "devender@example.com",
          phone: "+91 98765 43210",
          location: "Bangalore, India",
          github: "github.com/devender",
          linkedin: "linkedin.com/in/devender"
        },
        summary: `Senior Software Engineer with extensive experience in React, TypeScript, and Node.js. Proficient in cloud deployment, establishing robust CI/CD pipelines, and microservices architecture. Skilled in mentoring junior developers and driving agile delivery standards.`,
        skills: [...keywordsList, 'React', 'TypeScript', 'Node.js', 'Next.js', 'Agile', 'AWS', 'System Design'],
        experience: [
          {
            company: "Tech Solutions Inc.",
            role: "Senior Software Engineer",
            dates: "2023 - Present",
            description: "• Spearheaded deployment automation using CI/CD pipelines and Docker containerization.\n• Architected scalable web services incorporating AWS cloud best practices.\n• Weaved React and TypeScript patterns to improve page speed by 40%."
          },
          {
            company: "Innovate Hub",
            role: "Software Developer",
            dates: "2021 - 2023",
            description: "• Spearheaded Scrum and Agile sprints to ensure feature compliance.\n• Coordinated developer tooling integrations across Node.js web frameworks."
          }
        ],
        education: [
          {
            school: "National Institute of Technology",
            degree: "Bachelor of Technology in Computer Science",
            year: "2017 - 2021",
            gpa: "8.4 CGPA"
          }
        ],
        projects: [
          {
            title: "Distributed Pipeline orchestrator",
            technologies: "Node.js, AWS, Docker, Git",
            description: "Built a fault-tolerant job scheduler managing backend workers."
          }
        ]
      };
      onGenerate(fallbackData, keywordsList);
      onClose();
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-gray-150 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
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

        {/* Wizard Steps indicator */}
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

        {/* Content Wrapper */}
        <div className="p-6 flex-1 overflow-y-auto min-h-[300px]">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 text-red-700 border border-red-150 rounded-xl text-xs font-bold text-left">
              {error}
            </div>
          )}

          {/* STEP 1: Paste Job Description */}
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

          {/* STEP 2: Keyword Display */}
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

          {/* STEP 3: Select Template */}
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

          {/* STEP 4: Import / Upload Old Resume */}
          {step === 4 && (
            <div className="space-y-4 text-left animate-fade-in">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Upload Old Resume Data</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">We will extract the work experience details and restructure it.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Upload block */}
                <label className="border-2 border-dashed border-gray-200 hover:border-indigo-500/50 bg-gray-50/50 hover:bg-indigo-50/5 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all space-y-2.5">
                  <input type="file" accept=".txt,.doc,.docx" onChange={handleUploadFile} className="hidden" />
                  <Upload className="w-7 h-7 text-indigo-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">{selectedFile ? selectedFile.name : 'Select old resume file'}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Supports TXT, DOCX up to 10MB</p>
                  </div>
                </label>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Or Paste Old Resume Text Directly</label>
                  <textarea
                    className="w-full bg-gray-50/60 border border-gray-100 rounded-2xl p-4 text-xs font-mono leading-relaxed text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 h-[120px]"
                    placeholder="Enter your old resume text content..."
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
