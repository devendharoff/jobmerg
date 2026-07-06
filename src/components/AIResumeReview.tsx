import React, { useState } from 'react';
import { 
  Sparkles, Check, Play, AlertCircle, RefreshCw, FileText, 
  ChevronRight, Award, CheckCircle, Info 
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
  const [resumeText, setResumeText] = useState(userProfile.resumeText || '');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState('');

  const loadingSteps = [
    "Reading resume structure & header metadata...",
    "Extracting core competencies & educational benchmarks...",
    "Aligning technical stack with 50+ global job directories...",
    "Validating experience velocity against current market demand...",
    "Computing optimal match scores with Gemini models..."
  ];

  const triggerReview = async () => {
    if (!resumeText.trim()) {
      setError("Please write or paste your resume content before conducting an evaluation.");
      return;
    }

    setIsLoading(true);
    setError('');
    setLoadingStep(0);

    // Profile text updates
    onUpdateUserProfile({ resumeText });

    // Stagger loading progress indicators
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
          resumeText,
          userSkills: userProfile.skills,
          experienceYears: userProfile.experienceYears
        })
      });

      if (!response.ok) {
        throw new Error("Server responded with error: " + response.statusText);
      }

      const data: ReviewResult = await response.json();
      setResult(data);

      // Save match percentage changes to parent state to reflect on the search list
      if (data.jobMatches && data.jobMatches.length > 0) {
        onUpdateJobMatches(data.jobMatches);
      }

      // Automatically update profile completeness based on parsed details
      onUpdateUserProfile({ profileCompleteness: 100 });

    } catch (err: any) {
      console.error(err);
      setError("Failed to communicate with AI Review engine. " + err.message);
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
            <Sparkles className="w-5.5 h-5.5 text-[#4f46e5]" />
            AI Resume Analyzer & Matcher
          </h1>
          <p className="text-sm font-semibold text-gray-400 mt-1">Submit your resume text to receive detailed feedback and calculate dynamic job match scoring with Gemini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-premium space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paste Resume Content</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ctrl+V support</span>
            </div>

            <textarea
              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-xs font-mono leading-relaxed text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all h-[420px] shadow-inner"
              placeholder="PASTE YOUR PROFESSIONAL RESUME TEXT HERE...&#10;For example:&#10;DEVENDER KUMAR&#10;Software Engineer | devender@email.com&#10;&#10;EXPERIENCE...&#10;SKILLS..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              disabled={isLoading}
            />

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
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white stroke-none" />
                  Evaluate & Calculate Match Ratings
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
                {/* Concentric rings */}
                <div className="absolute inset-0 border border-dashed border-[#4f46e5]/10 rounded-full"></div>
                <div className="absolute inset-4 border border-[#4f46e5]/15 rounded-full"></div>
                <div className="absolute inset-8 border border-dashed border-[#4f46e5]/25 rounded-full"></div>
                <div className="absolute inset-12 border border-[#4f46e5]/35 rounded-full"></div>
                
                {/* Rotating scanning ray */}
                <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-t-[#4f46e5] border-r-transparent border-b-transparent border-l-transparent animate-radar"></div>
                
                {/* Center Glowing Icon */}
                <div className="w-10 h-10 bg-[#4f46e5] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#4f46e5]/30">
                  <FileText className="w-5.5 h-5.5" />
                </div>

                {/* Floating skill scan nodes */}
                <div className="absolute top-2 left-6 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-6 right-3 w-1.5 h-1.5 bg-[#4f46e5] rounded-full animate-ping [animation-delay:0.8s]"></div>
                <div className="absolute top-10 right-8 w-2 h-2 bg-blue-400 rounded-full animate-ping [animation-delay:1.5s]"></div>
              </div>

              <div className="space-y-2.5 max-w-sm">
                <h3 className="text-md font-black font-display text-gray-900">Evaluating Profile Assets</h3>
                <p className="text-xs text-gray-400 font-bold leading-relaxed uppercase tracking-wider">
                  Our Career Sync engine is calculating real-time match scores with Gemini models.
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
            /* Complete Gemini Report Screen */
            <div className="space-y-6 text-left">
              {/* Main Score Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 flex flex-col items-center text-center py-2 md:border-r border-gray-100">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* SVG Radial Progress gauge */}
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
                  <h4 className="font-black text-xs text-gray-900 uppercase tracking-widest mt-4">Quality Score</h4>
                  <p className="text-[9px] text-[#4f46e5] font-black uppercase tracking-wider mt-1.5 bg-[#4f46e5]/5 border border-[#4f46e5]/10 px-2 py-0.5 rounded-full">Excellent candidate fit</p>
                </div>

                <div className="md:col-span-8 space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-[#4f46e5] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" />
                    Gemini Professional Feedback
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    {result.summary}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Review completed dynamically. Match ratings synchronized with dashboard.
                  </p>
                </div>
              </div>

              {/* Strengths and Improvements columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 border-l-4 border-l-green-500 shadow-premium space-y-4">
                  <h3 className="text-[10px] font-black text-green-600 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1 self-start inline-block uppercase tracking-wider">
                    Core Strengths Identified
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
                  <h3 className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1 self-start inline-block uppercase tracking-wider">
                    Target Areas of Growth
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
                <h3 className="text-xs font-black font-display text-gray-900 uppercase tracking-wider">Optimization Guidelines & Writing Tips</h3>
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
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-md font-black font-display text-gray-900">Review Standby</h3>
                <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                  Your resume is pre-populated with Devender Kumar's credentials. Paste your own or click <b>Evaluate & Calculate Match Ratings</b> to analyze technical scores using real-time API integrations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
