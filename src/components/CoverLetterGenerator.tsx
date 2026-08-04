import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, Copy, Check, Download, RefreshCw, X, Sliders, Globe, Briefcase, Mail, Send
} from 'lucide-react';
import { Job, UserProfile } from '../types';

interface CoverLetterGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  targetJob: Job | null;
  userProfile: UserProfile;
  showToast?: (msg: string) => void;
}

export default function CoverLetterGenerator({
  isOpen,
  onClose,
  targetJob,
  userProfile,
  showToast
}: CoverLetterGeneratorProps) {
  const [tone, setTone] = useState<'Executive' | 'Tech' | 'Direct'>('Executive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState('');

  // Sample or custom target job details
  const companyName = targetJob?.company || 'Target Tech Corp';
  const jobTitle = targetJob?.title || 'Senior Software Engineer';
  const candidateName = userProfile.name || 'Devender Singh';

  useEffect(() => {
    if (isOpen) {
      generateLetter();
    }
  }, [isOpen, targetJob, tone]);

  const generateLetter = () => {
    setIsGenerating(true);

    setTimeout(() => {
      let letter = '';
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      if (tone === 'Executive') {
        letter = `${candidateName}
${userProfile.email || 'candidate@example.com'} | ${userProfile.role || 'Software Engineer'}
${dateStr}

Hiring Manager
${companyName}

Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With over ${userProfile.experienceYears || 2} years of experience specializing in software development and scalable architecture, I have consistently driven measurable results across component-driven web applications and cloud integrations.

At my core, I excel in leveraging technologies such as ${userProfile.skills.slice(0, 4).join(', ') || 'React, TypeScript, and Node.js'} to optimize product performance and streamline engineering workflows. What attracts me most to ${companyName} is your commitment to high-impact technology and product excellence.

In my previous experience, I led cross-functional efforts that improved system responsiveness, reduced deployment latency, and enhanced user engagement. I am confident that my technical skills and strategic problem-solving approach make me a strong fit for your team.

Thank you for your time and consideration. I welcome the opportunity to discuss how my background aligns with ${companyName}'s goals.

Sincerely,

${candidateName}`;
      } else if (tone === 'Tech') {
        letter = `${candidateName}
${userProfile.email || 'candidate@example.com'} | GitHub: github.com/candidate
${dateStr}

Engineering Team
${companyName}

Subject: Application for ${jobTitle} - ${candidateName}

Hi ${companyName} Engineering Team,

I'm excited to apply for the ${jobTitle} role. As a hands-on developer focused on modern web engineering, I've spent the past ${userProfile.experienceYears || 2}+ years building high-throughput UI frameworks and resilient backend APIs using ${userProfile.skills.slice(0, 5).join(', ') || 'React, TypeScript, Next.js, and Node.js'}.

Key highlights I bring to ${companyName}:
• Deep technical proficiency in ${userProfile.skills.slice(0, 3).join(', ') || 'React and Node.js'} with a track record of clean, maintainable codebases.
• Experience building responsive single-page applications and integrating real-time API state pipelines.
• Passion for continuous learning, automated code testing, and high-performance frontend optimization.

I admire ${companyName}'s tech stack and user-centric vision. I would love to bring my technical expertise to your engineering team.

Best regards,

${candidateName}`;
      } else {
        letter = `${candidateName}
${userProfile.email || 'candidate@example.com'}
${dateStr}

Hiring Team at ${companyName},

I am applying for the ${jobTitle} role at ${companyName}. My technical background in ${userProfile.skills.slice(0, 3).join(', ') || 'React, JavaScript, and Node.js'} directly aligns with the key requirements for this position.

Highlights of my qualifications:
- ${userProfile.experienceYears || 2}+ years of software engineering experience.
- Track record of shipping reliable, high-density applications with clean UI/UX standards.
- Strong problem-solving mindset and rapid adaptability to modern tech stacks.

I am eager to contribute to ${companyName}'s growth and would appreciate the opportunity to interview.

Best,

${candidateName}`;
      }

      setCoverLetterText(letter);
      setIsGenerating(false);
    }, 350);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    if (showToast) showToast('📋 Cover letter copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([coverLetterText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    if (showToast) showToast('📥 Cover letter downloaded as TXT!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-gray-150 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4f46e5] rounded-2xl flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight font-display">AI Cover Letter Studio</h2>
              <p className="text-xs text-indigo-200 font-medium">Tailored application letter for <strong className="text-white">{jobTitle}</strong> at <strong className="text-white">{companyName}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Tone Switcher */}
        <div className="p-4 bg-gray-50 border-b border-gray-150 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-black text-gray-700 uppercase tracking-wider">Tone & Style:</span>
            <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-xs">
              {(['Executive', 'Tech', 'Direct'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    tone === t
                      ? 'bg-[#4f46e5] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {t === 'Executive' ? 'Formal Executive' : t === 'Tech' ? 'Tech & Startup' : 'Concise Direct'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateLetter}
            disabled={isGenerating}
            className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#4f46e5] ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>

        {/* Letter Preview Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
          {isGenerating ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin"></div>
              <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Tailoring Cover Letter...</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm font-mono text-xs text-gray-800 leading-relaxed whitespace-pre-wrap selection:bg-indigo-100">
              {coverLetterText}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-150 flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold text-gray-400">
            Powered by AI tailored keyword alignment engine
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#4f46e5] hover:bg-[#3f37c9] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
