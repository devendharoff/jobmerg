import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, Award, ArrowRight } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planTier: 'Free' | 'Pro' | 'Accelerator') => void;
  currentPlan?: 'Free' | 'Pro' | 'Accelerator';
  isOnboarding?: boolean;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function PricingModal({ isOpen, onClose, onSelectPlan, currentPlan = 'Free', isOnboarding = false }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCheckout = async (planTier: 'Free' | 'Pro' | 'Accelerator') => {
    onSelectPlan?.(planTier);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-gray-150 shadow-2xl space-y-6 relative overflow-hidden my-8">
        
        {/* Background design glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-[#4f46e5]/20 via-purple-500/15 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close Button (Hidden during onboarding) */}
        {!isOnboarding && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-black uppercase tracking-wider border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOnboarding ? 'Account Setup • Choose Plan' : 'JobMerge Pricing & Plans'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-display">
            {isOnboarding ? 'Choose Your Plan to Get Started' : 'Supercharge Your Job Search'}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-gray-500">
            {isOnboarding 
              ? 'Select a plan below to activate your candidate dashboard and begin applying.'
              : 'Start 100% free with core application tools, or upgrade to Pro to unlock 100 auto-applications & 25 ATS scans.'}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-3 flex items-center justify-center gap-3">
            <div className="bg-gray-100 p-1 rounded-2xl inline-flex items-center gap-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800 font-bold'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-[#4f46e5] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800 font-bold'
                }`}
              >
                <span>Annual</span>
                <span className="px-1.5 py-0.5 bg-emerald-400 text-emerald-950 text-[9px] font-black rounded-full uppercase">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch pt-2">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center justify-between text-left">
              <span>⚠️ {errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-800 text-xs font-black cursor-pointer ml-2">✕</button>
            </div>
          )}

          {/* 1. Free Starter Plan */}
          <div className="bg-gray-50/90 border border-gray-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-gray-900 font-display">Free Starter</h3>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">Basic job search & trial</p>
                </div>
                <span className="px-2.5 py-0.5 bg-gray-200 text-gray-700 text-[9px] font-black uppercase rounded-full">
                  Current Plan
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900 font-display">₹0</span>
                <span className="text-xs font-bold text-gray-400">/ forever</span>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-gray-200/80 text-xs font-bold text-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>📄 <strong>1 Generated Resume</strong> (Free Quota Limit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>🚀 <strong>5 Auto Applications</strong> (LinkedIn + Indeed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>⚡ 10 Daily Job Searches</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <X className="w-4 h-4 text-gray-300 shrink-0" />
                  <span className="line-through">Unlimited Auto Applications</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <X className="w-4 h-4 text-gray-300 shrink-0" />
                  <span className="line-through">AI ATS Resume Score Checker</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleCheckout('Free')}
              className={`w-full py-3 border rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                currentPlan === 'Free'
                  ? 'bg-gray-200 text-gray-800 border-gray-300'
                  : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'
              }`}
            >
              {currentPlan === 'Free' ? '✓ Selected Free Starter' : 'Choose Free Starter'}
            </button>
          </div>

          {/* 2. Job Hunter Pro (Highlighted) */}
          <div className="bg-white border-2 border-[#4f46e5] rounded-3xl p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-indigo-500/10 scale-102 z-10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-[#4f46e5] to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm">
              🔥 Most Popular (85% Choose)
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-gray-900 font-display">Job Hunter Pro</h3>
                  <p className="text-[11px] font-bold text-[#4f46e5] mt-0.5">Accelerate your job search 10x</p>
                </div>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-[#4f46e5] border border-indigo-100 text-[9px] font-black uppercase rounded-full">
                  Best Value
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900 font-display">
                  ₹0
                </span>
                <span className="text-xs font-bold text-emerald-600 font-black">/ 100% Free</span>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs font-bold text-gray-800">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#4f46e5] shrink-0 stroke-[3]" />
                  <span>📄 <strong>15 Resumes with any template</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#4f46e5] shrink-0 stroke-[3]" />
                  <span>🤖 <strong>25 ATS Score Checkers</strong> & Optimizer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#4f46e5] shrink-0 stroke-[3]" />
                  <span>🚀 <strong>100 Auto-Applying Jobs</strong> (LinkedIn + Indeed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#4f46e5] shrink-0 stroke-[3]" />
                  <span>⚡ Unlimited Job Searches & Salary Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#4f46e5] shrink-0 stroke-[3]" />
                  <span>🎯 Direct Recruiter Referral Alerts</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleCheckout('Pro')}
              className={`w-full py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center active:scale-98 disabled:opacity-50 ${
                currentPlan === 'Pro'
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'bg-[#4f46e5] hover:bg-[#3f37c9] text-white shadow-md shadow-[#4f46e5]/20'
              }`}
            >
              {currentPlan === 'Pro' ? '✓ Selected Job Hunter Pro' : 'Activate Job Hunter Pro (Free)'}
            </button>
          </div>

          {/* 3. Career Accelerator */}
          <div className="bg-gray-50/90 border border-gray-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-gray-900 font-display">Career Accelerator</h3>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">Full-suite VIP career support</p>
                </div>
                <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-black uppercase rounded-full font-extrabold">
                  VIP Executive
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900 font-display">
                  ₹0
                </span>
                <span className="text-xs font-bold text-emerald-600 font-black">/ 100% Free VIP</span>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-gray-200/80 text-xs font-bold text-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>♾️ <strong>ALL UNLIMITED</strong> (Resumes, ATS & Auto-Apply)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>📊 <strong>Fully AI-enabled custom reports after applying jobs</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>🎙️ <strong>1-on-1 AI Mock Interview Practice</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>👨‍💼 <strong>Senior Recruiter Human Resume Review</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>✍️ Custom AI Cover Letters for top companies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>💬 24/7 Priority VIP Support & Setup Guidance</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleCheckout('Accelerator')}
              className={`w-full py-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center disabled:opacity-50 ${
                currentPlan === 'Accelerator'
                  ? 'bg-purple-800 text-white shadow-md'
                  : 'bg-gray-900 hover:bg-black text-white'
              }`}
            >
              {currentPlan === 'Accelerator' ? '✓ Selected VIP Accelerator' : 'Activate VIP Accelerator (Free)'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
