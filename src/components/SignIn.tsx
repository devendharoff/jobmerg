import React, { useState } from 'react';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Sun } from 'lucide-react';
import { ActiveScreen } from '../types';

interface SignInProps {
  onNavigate: (screen: ActiveScreen) => void;
  onLoginSuccess: (email: string, name: string) => void;
}

export default function SignIn({ onNavigate, onLoginSuccess }: SignInProps) {
  const [email, setEmail] = useState('devender.kumar@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Auto deduce name from email
      const name = email === 'devender.kumar@gmail.com' ? 'Devender Kumar' : email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      onLoginSuccess(email, name);
    }, 800);
  };

  const handleOAuthLogin = (platform: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess('candidate.oauth@gmail.com', 'Demo Candidate');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans animate-fade-in">
      {/* Left Illustrative Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#3f37c9] text-white p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative background visual ambient elements */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-white/10 rounded-full blur-[140px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4f46e5]/50 rounded-full blur-[120px] -ml-20 -mb-20"></div>

        {/* Branding header */}
        <button 
          onClick={() => onNavigate('Landing')}
          className="flex items-center gap-2 cursor-pointer text-white self-start focus:outline-none group"
        >
          <div className="w-9 h-9 bg-white text-[#3f37c9] rounded-xl flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl font-display tracking-tight text-white font-black">JobMerge</span>
        </button>

        {/* Interactive mock user feedback visual card in center */}
        <div className="space-y-8 max-w-md relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <img 
                alt="User portrait" 
                className="w-10 h-10 rounded-full border-2 border-white/30 object-cover shadow-inner"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ" 
              />
              <div className="text-left">
                <p className="font-black text-sm text-white">Devender Kumar</p>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Software Engineer</p>
              </div>
              <div className="ml-auto bg-green-500/20 text-green-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-green-500/30">
                Matched 96%
              </div>
            </div>
            <p className="text-white/90 text-xs font-semibold leading-relaxed mb-4 text-left">
              "JobMerge consolidated my search across 6 different job portals. I applied directly, tracked interview invitations in the Kanban board, and got matched using their AI analysis. Truly outstanding tool!"
            </p>
            <div className="flex justify-between items-center text-[9px] text-white/50 font-bold uppercase tracking-wider">
              <span>Verified Candidate</span>
              <span>Landed at Google Bangalore</span>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <h2 className="text-3xl font-black tracking-tight font-display text-white leading-tight">
              One search. <br />Every opportunity.
            </h2>
            <p className="text-white/80 text-xs font-semibold leading-relaxed">
              Log in to access your custom-curated job boards, resume match reports, salary analysis charts, and personal application trackers.
            </p>
          </div>
        </div>

        {/* Footer info strip */}
        <div className="flex justify-between items-center text-xs text-white/50 font-bold uppercase tracking-wider">
          <span>© 2026 JobMerge Inc.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between items-center bg-white shadow-xl lg:shadow-none">
        {/* Mobile Logo / Header */}
        <div className="w-full flex justify-between lg:justify-end items-center mb-8">
          <button 
            onClick={() => onNavigate('Landing')}
            className="flex lg:hidden items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 bg-[#4f46e5] rounded-xl flex items-center justify-center">
              <Sparkles className="text-white w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-xl text-gray-900 font-display font-black">JobMerge</span>
          </button>
          
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Don't have an account?{' '}
            <button 
              onClick={() => onNavigate('SignUp')} 
              className="text-[#4f46e5] font-black hover:underline cursor-pointer uppercase tracking-wider"
              id="btn-signup-redirect"
            >
              Sign up free
            </button>
          </p>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-md my-auto space-y-7">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-black font-display tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Enter your details below or log in via your professional account.
            </p>
          </div>

          {/* Social Sign-in Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => handleOAuthLogin('Google')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              id="btn-login-google"
            >
              <img 
                alt="Google G" 
                className="w-4 h-4" 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
              />
              Google
            </button>
            <button 
              type="button"
              onClick={() => handleOAuthLogin('LinkedIn')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              id="btn-login-linkedin"
            >
              <img 
                alt="LinkedIn" 
                className="w-4 h-4 rounded-sm" 
                src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.svg" 
              />
              LinkedIn
            </button>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Or write credentials
            </span>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 border border-red-150 rounded-xl text-xs font-bold text-left" id="login-error-toast">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left" id="login-form">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all shadow-inner"
                  placeholder="name@company.com"
                  required
                  id="login-email-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-bold text-[#4f46e5] hover:underline uppercase tracking-wider">Forgot?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                  id="login-password-input"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
                defaultChecked 
                className="h-4 w-4 text-[#3f37c9] focus:ring-[#4f46e5]/10 border-gray-200 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-[9px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">
                Keep me signed in
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#3f37c9] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-xs hover:shadow-lg hover:shadow-[#4f46e5]/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
              id="login-submit-btn"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="bg-[#4f46e5]/5 border border-[#4f46e5]/10 p-4 rounded-2xl flex items-start gap-3">
            <Sun className="w-5 h-5 text-[#4f46e5] shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <p className="text-xs font-black text-gray-700 uppercase tracking-wider">Quick Demo Access</p>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                Clicking "Sign in" directly logs you in as <b>Devender Kumar</b> with the prototype state pre-populated!
              </p>
            </div>
          </div>
        </div>

        {/* Small terms link */}
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-8 text-center">
          By signing in you agree to our{' '}
          <a className="underline hover:text-gray-600" href="#">Terms</a> and{' '}
          <a className="underline hover:text-gray-600" href="#">Privacy</a>.
        </p>
      </div>
    </div>
  );
}
