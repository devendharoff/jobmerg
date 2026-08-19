import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Home } from 'lucide-react';
import { ActiveScreen } from '../types';

interface AdminSignInProps {
  onNavigate: (screen: ActiveScreen) => void;
  onLoginSuccess: (email: string, name: string) => void;
}

export default function AdminSignIn({ onNavigate, onLoginSuccess }: AdminSignInProps) {
  const [email, setEmail] = useState('avasarama04@gmail.com');
  const [password, setPassword] = useState('admin123');
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

    if (email !== 'avasarama04@gmail.com') {
      setError('Access Denied: Only registered Super Admins are allowed.');
      return;
    }

    if (password !== 'admin123') {
      setError('Invalid password. Please try again.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email, 'Super Admin');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans animate-fade-in relative overflow-hidden">
      {/* Decorative background visual ambient elements */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#4f46e5]/10 rounded-full blur-[140px] -mr-40 -mt-40"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] -ml-20 -mb-20"></div>

      {/* Main Container */}
      <div className="w-full flex flex-col justify-between items-center p-8 md:p-16 min-h-screen relative z-10">
        
        {/* Header navigation bar */}
        <div className="w-full flex justify-between items-center mb-8">
          <button 
            onClick={() => onNavigate('Landing')}
            className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all focus:outline-none"
          >
            <Home className="w-4 h-4" />
            <span>JobMerge Home</span>
          </button>
          
          <button 
            onClick={() => onNavigate('SignIn')}
            className="text-xs font-black text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer uppercase tracking-wider bg-indigo-950/30 border border-indigo-900/40 px-3.5 py-2 rounded-xl transition-all"
          >
            User Login Portal →
          </button>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-md my-auto space-y-7 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-8 rounded-3xl shadow-2xl">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 border border-indigo-500/30 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black font-display tracking-tight text-white">
              Super Admin Gateway
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Enter administrative credentials to access the platform controls.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-950/50 text-red-300 border border-red-900/50 rounded-xl text-xs font-bold text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-slate-950 transition-all shadow-inner"
                  placeholder="admin@jobmerge.ai"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-slate-950 transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-355 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98 border border-indigo-500/30 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Verify & Enter Portal
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl flex items-start gap-3">
            <div className="text-indigo-400 shrink-0 mt-0.5 text-[10px] font-black uppercase tracking-wider">Note</div>
            <div className="space-y-1 text-left">
              <p className="text-xs font-black text-slate-300 uppercase tracking-wider">Demo Credentials</p>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Super admin credentials are pre-filled (<b>admin123</b>). Simply click "Verify & Enter Portal" to instantly login.
              </p>
            </div>
          </div>
        </div>

        {/* Small terms link */}
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-8 text-center">
          Super Admin Panel · Secure Connection Required
        </p>
      </div>
    </div>
  );
}
