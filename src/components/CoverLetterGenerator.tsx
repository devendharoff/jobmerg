import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, Copy, Check, Download, RefreshCw, X, Sliders, Edit3, MessageSquare
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
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEditingInline, setIsEditingInline] = useState(false);

  const companyName = targetJob?.company || 'Target Tech Corp';
  const jobTitle = targetJob?.title || 'Senior Software Engineer';
  const candidateName = userProfile.name || 'Devender Singh';

  useEffect(() => {
    if (isOpen) {
      generateLetter();
    }
  }, [isOpen, targetJob]);

  const generateLetter = async (selectedTone = tone) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          companyName,
          jobDescription: targetJob?.description || '',
          tone: selectedTone,
          userProfile,
          customPrompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.coverLetter) {
          setCoverLetterText(data.coverLetter);
          setIsGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend cover letter generation error, fallback to local client generation:', err);
    }

    // Client fallback if fetch fails
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    let letter = '';
    if (selectedTone === 'Tech') {
      letter = `${candidateName}
${userProfile.email || 'candidate@example.com'} | ${userProfile.role || 'Software Engineer'}
${dateStr}

${companyName} Engineering Team

Subject: Application for ${jobTitle} - ${candidateName}

Hi ${companyName} Engineering Team,

I'm excited to apply for the ${jobTitle} role. As a hands-on developer focused on modern web engineering, I've spent the past ${userProfile.experienceYears || 2}+ years building high-throughput UI frameworks and resilient backend APIs using ${userProfile.skills.slice(0, 5).join(', ') || 'React, TypeScript, Next.js, and Node.js'}.

Key highlights I bring to ${companyName}:
• Deep technical proficiency in ${userProfile.skills.slice(0, 3).join(', ') || 'React and Node.js'} with a track record of clean codebases.
• Experience building responsive single-page applications and integrating real-time API state pipelines.
• Passion for continuous learning, automated code testing, and high-performance frontend optimization.

I admire ${companyName}'s tech stack and user-centric vision. I would love to bring my technical expertise to your engineering team.

Best regards,

${candidateName}`;
    } else if (selectedTone === 'Direct') {
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
    } else {
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
    }

    setCoverLetterText(letter);
    setIsGenerating(false);
  };

  const handleToneChange = (t: 'Executive' | 'Tech' | 'Direct') => {
    setTone(t);
    generateLetter(t);
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
                  onClick={() => handleToneChange(t)}
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingInline(!isEditingInline)}
              className={`px-3 py-1.5 border font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                isEditingInline ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>{isEditingInline ? 'Preview' : 'Direct Edit'}</span>
            </button>

            <button
              onClick={() => generateLetter(tone)}
              disabled={isGenerating}
              className="px-3.5 py-1.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Generate AI</span>
            </button>
          </div>
        </div>

        {/* Custom AI Prompt Bar */}
        <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100/60 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#4f46e5] shrink-0" />
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Custom instructions (e.g. 'Emphasize my cloud migration background and leadership')..."
            className="w-full text-xs bg-transparent border-none focus:outline-none text-gray-800 font-medium placeholder:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') generateLetter(tone);
            }}
          />
          {customPrompt && (
            <button
              onClick={() => {
                setCustomPrompt('');
                generateLetter(tone);
              }}
              className="text-[10px] font-bold text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Letter Preview Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
          {isGenerating ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin"></div>
              <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Synthesizing Cover Letter with Gemini AI...</p>
            </div>
          ) : isEditingInline ? (
            <textarea
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              className="w-full h-full min-h-[320px] bg-white border-2 border-indigo-300 rounded-2xl p-6 shadow-sm font-mono text-xs text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
            />
          ) : (
            <div 
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setCoverLetterText(e.currentTarget.innerText)}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm font-mono text-xs text-gray-800 leading-relaxed whitespace-pre-wrap selection:bg-indigo-100 focus:outline-none focus:border-indigo-400"
            >
              {coverLetterText}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-150 flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Direct editable draft • Powered by Gemini 2.0 AI
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
