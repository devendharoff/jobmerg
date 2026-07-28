import React, { useState } from 'react';
import { 
  Sparkles, Check, Play, AlertCircle, RefreshCw, FileText, 
  ChevronRight, Award, CheckCircle, Info, Upload, X, ShieldCheck, Target, Zap, FileSpreadsheet
} from 'lucide-react';
import { UserProfile, Job } from '../types';

interface AIResumeReviewProps {
  userProfile: UserProfile;
  availableJobs: Job[];
  onUpdateUserProfile: (updated: Partial<UserProfile>) => void;
  onUpdateJobMatches: (matches: Array<{ jobId: string; matchPercent: number; matchExplanation: string }>) => void;
}

interface ReviewResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  tips: string[];
  jobMatches: Array<{ jobId: string; matchPercent: number; matchExplanation: string }>;
}

export default function AIResumeReview({
  userProfile,
  availableJobs,
  onUpdateUserProfile,
  onUpdateJobMatches
}: AIResumeReviewProps) {
  const [activeInputTab, setActiveInputTab] = useState<'pdf' | 'text'>('pdf');
  const [resumeText, setResumeText] = useState(userProfile.resumeText || '');
  
  // PDF File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState('');

  const loadingSteps = [
    "Scanning resume document structure & header contact details...",
    "Parsing technical skills against ATS keyword index database...",
    "Evaluating Google X-Y-Z quantifiable bullet point metric ratio...",
    "Auditing section formatting, typography, & readability rules...",
    "Computing final ATS Compatibility Score & job fit ratings..."
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError("Only PDF files are supported for high-fidelity ATS resume parsing.");
        return;
      }
      setError('');
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setFileBase64(base64Data);
      };
      reader.onerror = () => {
        setError("Failed to read the file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFileBase64(null);
    setError('');
  };

  const triggerReview = async () => {
    if (activeInputTab === 'pdf' && !fileBase64) {
      setError("Please select or drop a valid PDF resume file before running ATS scan.");
      return;
    }
    if (activeInputTab === 'text' && !resumeText.trim()) {
      setError("Please write or paste your resume text content before conducting an ATS evaluation.");
      return;
    }

    setIsLoading(true);
    setError('');
    setLoadingStep(0);

    if (activeInputTab === 'text') {
      onUpdateUserProfile({ resumeText });
    }

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      const response = await fetch('/api/resume-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: activeInputTab === 'text' ? resumeText : '',
          resumeFile: activeInputTab === 'pdf' ? fileBase64 : null,
          fileName: activeInputTab === 'pdf' && selectedFile ? selectedFile.name : null,
          userSkills: userProfile.skills,
          experienceYears: userProfile.experienceYears
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || response.statusText);
      }

      const data: ReviewResult = await response.json();
      setResult(data);

      if (data.jobMatches && data.jobMatches.length > 0) {
        onUpdateJobMatches(data.jobMatches);
      }

      onUpdateUserProfile({ profileCompleteness: 100 });

    } catch (err: any) {
      console.error(err);
      setError("Failed to communicate with ATS Score engine. " + err.message);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="resume-review-view">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-display flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#4f46e5]" />
            ATS Resume Score Checker
          </h1>
          <p className="text-sm font-semibold text-gray-400 mt-1">
            Scan your resume against Applicant Tracking Systems (ATS), calculate compatibility scores, and discover actionable keyword optimizations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#4f46e5]/5 border border-[#4f46e5]/10 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold text-[#4f46e5]">
          <Target className="w-3.5 h-3.5" />
          <span>ATS Algorithm v4.2 Enabled</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-premium space-y-4 text-left">
            
            {/* Input Method Tabs */}
            <div className="flex bg-gray-50 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setActiveInputTab('pdf'); setError(''); }}
                disabled={isLoading}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeInputTab === 'pdf'
                    ? 'bg-white text-[#4f46e5] shadow-sm'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                Upload PDF Resume
              </button>
              <button
                type="button"
                onClick={() => { setActiveInputTab('text'); setError(''); }}
                disabled={isLoading}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeInputTab === 'text'
                    ? 'bg-white text-[#4f46e5] shadow-sm'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                Paste Resume Text
              </button>
            </div>

            {activeInputTab === 'pdf' ? (
              /* PDF Upload Area */
              <div className="space-y-3">
                {!selectedFile ? (
                  <label className="border-2 border-dashed border-gray-200 hover:border-[#4f46e5]/50 bg-gray-50/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white min-h-[300px]">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                    <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm text-gray-400 mb-4">
                      <Upload className="w-5 h-5 text-[#4f46e5]" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 mb-1">Click to Upload Resume PDF</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Supports PDF up to 10MB</span>
                  </label>
                ) : (
                  <div className="border border-gray-100 bg-gray-50/30 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
                    <div className="w-16 h-16 bg-[#4f46e5]/10 text-[#4f46e5] rounded-2xl flex items-center justify-center relative">
                      <FileText className="w-8 h-8" />
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        disabled={isLoading}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white border border-gray-150 hover:bg-red-50 hover:text-red-600 rounded-full flex items-center justify-center shadow-sm cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 max-w-[240px] truncate">{selectedFile.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 font-semibold">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for ATS scan</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Paste Resume Text Area */
              <textarea
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-xs font-mono leading-relaxed text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all h-[300px] shadow-inner"
                placeholder="PASTE YOUR PROFESSIONAL RESUME TEXT HERE...&#10;For example:&#10;DEVENDER KUMAR&#10;Software Engineer | devender@email.com&#10;&#10;EXPERIENCE...&#10;SKILLS..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={isLoading}
              />
            )}

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-150 text-red-700 text-xs font-bold rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={triggerReview}
              disabled={isLoading}
              className="w-full py-4 bg-[#3f37c9] hover:bg-[#4f46e5] disabled:bg-gray-100 text-white disabled:text-gray-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#3f37c9]/10 disabled:shadow-none active:scale-[0.98] transition-all cursor-pointer"
              id="btn-trigger-ai-review"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  Running ATS Parser & Scoring...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white stroke-none" />
                  Calculate ATS Score & Scan Resume
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Output Panel */}
        <div className="lg:col-span-7">
          {isLoading ? (
            /* Premium Radar Scanner Loading screen */
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-premium flex flex-col items-center justify-center text-center h-[548px] space-y-8">
              {/* Rotating radar / scanning visual animation */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border border-dashed border-[#4f46e5]/10 rounded-full"></div>
                <div className="absolute inset-4 border border-[#4f46e5]/15 rounded-full"></div>
                <div className="absolute inset-8 border border-dashed border-[#4f46e5]/25 rounded-full"></div>
                <div className="absolute inset-12 border border-[#4f46e5]/35 rounded-full"></div>
                
                <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-t-[#4f46e5] border-r-transparent border-b-transparent border-l-transparent animate-radar"></div>
                
                <div className="w-10 h-10 bg-[#4f46e5] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#4f46e5]/30">
                  <ShieldCheck className="w-5.5 h-5.5" />
                </div>

                <div className="absolute top-2 left-6 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-6 right-3 w-1.5 h-1.5 bg-[#4f46e5] rounded-full animate-ping [animation-delay:0.8s]"></div>
                <div className="absolute top-10 right-8 w-2 h-2 bg-blue-400 rounded-full animate-ping [animation-delay:1.5s]"></div>
              </div>

              <div className="space-y-2.5 max-w-sm">
                <h3 className="text-md font-black font-display text-gray-900">Scanning Resume for ATS Compliance</h3>
                <p className="text-xs text-gray-400 font-bold leading-relaxed uppercase tracking-wider">
                  Our ATS engine is verifying formatting, keywords, contact details, and metric density.
                </p>
              </div>

              {/* Progress steps animation list */}
              <div className="w-full max-w-md space-y-2 pt-2">
                {loadingSteps.map((step, idx) => {
                  const isCompleted = idx < loadingStep;
                  const isActive = idx === loadingStep;
                  
                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-50/50 border-green-100 text-green-700 font-bold' 
                          : isActive 
                            ? 'bg-[#4f46e5]/5 border-[#4f46e5]/10 text-[#4f46e5] font-bold shadow-sm' 
                            : 'bg-gray-50/40 border-gray-100 text-gray-400 font-semibold'
                      }`}
                    >
                      <span className="text-[11px]">{step}</span>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      ) : isActive ? (
                        <div className="w-3.5 h-3.5 border-2 border-[#4f46e5]/30 border-t-[#4f46e5] rounded-full animate-spin shrink-0"></div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-gray-100 shrink-0"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : result ? (
            /* Complete ATS Score Report Screen */
            <div className="space-y-6 text-left">
              {/* Main ATS Score Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 flex flex-col items-center text-center py-2 md:border-r border-gray-100">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="56" cy="56" r="46" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="46" 
                        fill="none" 
                        stroke="url(#radialGrad)" 
                        strokeWidth="6.5" 
                        strokeDasharray={289} 
                        strokeDashoffset={289 - (289 * result.overallScore) / 100}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="radialGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="text-center">
                      <span className="text-3xl font-black text-gray-900 font-display">{result.overallScore}</span>
                      <span className="text-[10px] text-gray-400 font-bold block">/ 100</span>
                    </div>
                  </div>
                  <h4 className="font-black text-xs text-gray-900 uppercase tracking-widest mt-4">ATS Compatibility Score</h4>
                  <p className="text-[9px] text-[#4f46e5] font-black uppercase tracking-wider mt-1.5 bg-[#4f46e5]/5 border border-[#4f46e5]/10 px-2.5 py-0.5 rounded-full">
                    {result.overallScore >= 80 ? 'ATS Verified Pass (High Interview Rate)' : result.overallScore >= 65 ? 'ATS Compatible (Minor Fixes Needed)' : 'ATS Warning (Optimization Required)'}
                  </p>
                </div>

                <div className="md:col-span-8 space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-[#4f46e5] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ATS Audit Summary
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    {result.summary}
                  </p>
                  
                  {/* ATS Section Score Metrics */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-gray-100">
                    <div className="p-2 bg-gray-50 rounded-xl">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Contact Info & Header</p>
                      <p className="text-xs font-black text-green-600">Passed (100%)</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-xl">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Keyword Density</p>
                      <p className="text-xs font-black text-[#4f46e5]">{result.overallScore}% Density</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths and Improvements columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 border-l-4 border-l-green-500 shadow-premium space-y-4">
                  <h3 className="text-[10px] font-black text-green-600 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1 self-start inline-block uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> ATS Strengths Found
                  </h3>
                  <div className="space-y-3">
                    {result.strengths.map((str, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 leading-relaxed">{str}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 border-l-4 border-l-amber-500 shadow-premium space-y-4">
                  <h3 className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1 self-start inline-block uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3" /> ATS Keyword & Format Fixes
                  </h3>
                  <div className="space-y-3">
                    {result.improvements.map((imp, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                          <ChevronRight className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 leading-relaxed">{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Writing Tips */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-premium space-y-4">
                <h3 className="text-xs font-black font-display text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#4f46e5]" />
                  ATS Optimization & Bullet Point Formulas
                </h3>
                <div className="space-y-3.5">
                  {result.tips.map((tip, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="w-6 h-6 bg-[#4f46e5]/5 rounded-lg flex items-center justify-center text-[#4f46e5] shrink-0 font-black text-xs">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-semibold text-gray-600 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Standby view */
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-premium flex flex-col items-center justify-center text-center h-[548px] space-y-6">
              <div className="w-14 h-14 bg-[#4f46e5]/5 text-[#4f46e5] rounded-2xl flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-md font-black font-display text-gray-900">ATS Scan Ready</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Upload your PDF resume or paste resume text above, then click <b>Calculate ATS Score & Scan Resume</b> to run an instant Applicant Tracking System compatibility check.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
