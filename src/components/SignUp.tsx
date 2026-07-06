import React, { useState } from 'react';
import { Sparkles, User, Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Briefcase, Plus, X } from 'lucide-react';
import { ActiveScreen } from '../types';

interface SignUpProps {
  onNavigate: (screen: ActiveScreen) => void;
  onSignUpSuccess: (email: string, name: string, role: string, skills: string[]) => void;
}

export default function SignUp({ onNavigate, onSignUpSuccess }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'JavaScript']);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all core fields.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignUpSuccess(email, name, role, skills);
    }, 800);
  };

  const handleOAuthSignUp = (platform: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignUpSuccess('candidate.social@gmail.com', 'New Candidate', 'Software Developer', ['JavaScript', 'HTML', 'CSS']);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans animate-fade-in">
      {/* Left Column (Shared Visual Showcase) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#3f37c9] text-white p-16 flex-col justify-between relative overflow-hidden">
        {/* Ambient background glows */}
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

        {/* Interactive Feature list */}
        <div className="space-y-10 max-w-md relative z-10 text-left">
          <div className="space-y-3">
            <h2 className="text-3xl font-black tracking-tight font-display text-white leading-tight">
              Smarter matching. <br />Faster hiring.
            </h2>
            <p className="text-white/80 text-xs font-semibold leading-relaxed">
              Create a free developer or designer profile today and experience AI matching and single-click applications across the globe.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5 border border-white/10">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-black text-sm text-white">Personalized AI Matching</p>
                <p className="text-xs text-white/70 font-semibold leading-relaxed">Get instantly matching jobs evaluated with dynamic explanations from Gemini models.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5 border border-white/10">
                <Sun className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-black text-sm text-white">Consolidated Applications</p>
                <p className="text-xs text-white/70 font-semibold leading-relaxed">Track every step of your application (Applied, Interview, Offer, Reject) in an interactive Kanban board.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5 border border-white/10">
                <Briefcase className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-black text-sm text-white">Salaries & Demand Analysis</p>
                <p className="text-xs text-white/70 font-semibold leading-relaxed">Study real-time local salary benchmarks, growth trends, and required tech stacks in the market.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-white/50 font-bold uppercase tracking-wider">
          <span>© 2026 JobMerge Inc.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Column (Sign Up Form) */}
      <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between items-center bg-white shadow-xl lg:shadow-none overflow-y-auto">
        {/* Header link */}
        <div className="w-full flex justify-between lg:justify-end items-center mb-8 shrink-0">
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
            Already have an account?{' '}
            <button 
              onClick={() => onNavigate('SignIn')} 
              className="text-[#4f46e5] font-black hover:underline cursor-pointer uppercase tracking-wider"
              id="btn-signin-redirect"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Form Body */}
        <div className="w-full max-w-md my-auto space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-black font-display tracking-tight text-gray-900">
              Create an account
            </h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Fill in your details below to activate your interactive dashboard.
            </p>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => handleOAuthSignUp('Google')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              id="btn-signup-google"
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
              onClick={() => handleOAuthSignUp('LinkedIn')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              id="btn-signup-linkedin"
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
              Or fill information
            </span>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 border border-red-150 rounded-xl text-xs font-bold text-left" id="signup-error-toast">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left" id="signup-form">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all shadow-inner"
                  placeholder="Devender Kumar"
                  required
                  id="signup-name-input"
                />
              </div>
            </div>

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
                  id="signup-email-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Password</label>
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
                  id="signup-password-input"
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

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Target Role / Speciality</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all cursor-pointer shadow-sm"
                  id="signup-role-select"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Product Designer">Product Designer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                </select>
              </div>
            </div>

            {/* Custom Skills Chips Creator */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Your Core Skills</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:bg-white transition-all shadow-inner"
                  placeholder="e.g. React, Python, Figma"
                  id="signup-skill-input"
                />
                <button 
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3.5 py-2 bg-[#4f46e5] text-white rounded-xl hover:bg-[#3f37c9] flex items-center justify-center font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill) => (
                  <span 
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4f46e5]/5 border border-[#4f46e5]/10 rounded-xl text-[11px] font-bold text-[#4f46e5]"
                  >
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#4f46e5] hover:text-red-500 hover:scale-115 cursor-pointer focus:outline-none transition-transform"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#3f37c9] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-xs hover:shadow-lg hover:shadow-[#4f46e5]/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
              id="signup-submit-btn"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Register Profile
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Small terms link */}
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-8 text-center shrink-0">
          By signing up you agree to our{' '}
          <a className="underline hover:text-gray-600" href="#">Terms</a> and{' '}
          <a className="underline hover:text-gray-600" href="#">Privacy</a>.
        </p>
      </div>
    </div>
  );
}
