import React from 'react';
import { Sparkles, Zap, Globe, ArrowRight, ShieldCheck, CheckCircle2, BookmarkCheck, FileText } from 'lucide-react';

interface BetaNoJobsNoticeProps {
  onNavigateToAutoApply: () => void;
  onNavigateToResumeStudio: () => void;
}

export default function BetaNoJobsNotice({ onNavigateToAutoApply, onNavigateToResumeStudio }: BetaNoJobsNoticeProps) {
  return (
    <div className="space-y-8 animate-fade-in text-left max-w-5xl mx-auto py-4">
      {/* Hero Beta Launch Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Initial Beta Product Phase
            </span>
            <span className="px-3 py-1 bg-white/10 text-slate-300 text-xs font-bold rounded-full">
              Zero Internal Job Ads
            </span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display text-white">
              We Don't Host Jobs on JobMerge — We Automate Your Applications Everywhere Else!
            </h1>
            <p className="text-indigo-200/90 text-sm font-medium leading-relaxed">
              During our initial launch months, JobMerge does not post or host native job listings directly on our platform. Instead, we provide you with powerful automation tools to apply on top job boards and tailor your ATS resume.
            </p>
          </div>

          {/* Key Value Pill Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">External Portals</h4>
                <p className="text-[11px] text-slate-300 font-medium">LinkedIn, Indeed, Naukri, Unstop</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">100% Account Safety</h4>
                <p className="text-[11px] text-slate-300 font-medium">Runs in your own browser</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">ATS Tailoring</h4>
                <p className="text-[11px] text-slate-300 font-medium">Instant AI match score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Flagship Product Launcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flagship Product 1: Auto Apply Bot */}
        <div 
          onClick={onNavigateToAutoApply}
          className="bg-white p-7 rounded-3xl border border-gray-200 shadow-md hover:shadow-xl transition-all cursor-pointer group space-y-5 flex flex-col justify-between hover:border-indigo-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4f46e5]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-[#4f46e5] uppercase tracking-wider">Flagship Product #1</span>
              <h2 className="text-xl font-extrabold text-gray-900 font-display group-hover:text-[#4f46e5] transition-colors mt-0.5">
                Auto Apply Bot Extension
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Automate Easy Apply job applications on LinkedIn, Indeed, Naukri, Unstop, Wellfound, ZipRecruiter, and Glassdoor natively inside your browser.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-600 pt-1">
              <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg">💼 LinkedIn Easy Apply</span>
              <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg">🚀 Naukri FastApply</span>
              <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg">⚡ Unstop Campus</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
            <span className="text-xs font-black text-gray-900">Launch Auto Apply Hub</span>
            <div className="w-9 h-9 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Flagship Product 2: Resume Studio */}
        <div 
          onClick={onNavigateToResumeStudio}
          className="bg-white p-7 rounded-3xl border border-gray-200 shadow-md hover:shadow-xl transition-all cursor-pointer group space-y-5 flex flex-col justify-between hover:border-emerald-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Flagship Product #2</span>
              <h2 className="text-xl font-extrabold text-gray-900 font-display group-hover:text-emerald-600 transition-colors mt-0.5">
                Resume Studio & ATS Scanner
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Scan, score, and tailor your resume against any job description with instant AI bullet optimization, keyword matching, and PDF generation.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-600 pt-1">
              <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg">🎯 ATS Score Checker</span>
              <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg">⚡ AI Resume Builder</span>
              <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg">📄 Cover Letters</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
            <span className="text-xs font-black text-gray-900">Open Resume Studio</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
