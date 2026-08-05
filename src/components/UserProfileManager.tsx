import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Globe, Linkedin, Github, Briefcase, Award, 
  Sparkles, Check, Save, Plus, Trash2, ShieldCheck, Zap, CreditCard, RefreshCw, ChevronRight, Lock
} from 'lucide-react';
import { UserProfile, PLAN_LIMITS, UserPlanTier } from '../types';

interface UserProfileManagerProps {
  userProfile: UserProfile;
  onUpdateUserProfile: (updated: Partial<UserProfile>) => void;
  onOpenPricing?: () => void;
  showToast?: (msg: string) => void;
}

const PRESET_SKILLS = [
  'React.js', 'TypeScript', 'Node.js', 'Next.js', 'Python', 'AWS', 
  'Docker', 'GraphQL', 'Tailwind CSS', 'SQL', 'MongoDB', 'System Design',
  'REST APIs', 'Git', 'Kubernetes', 'Redux', 'CI/CD'
];

export default function UserProfileManager({
  userProfile,
  onUpdateUserProfile,
  onOpenPricing,
  showToast
}: UserProfileManagerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'career' | 'skills' | 'plan' | 'security'>('profile');
  
  // Editable State Fields
  const [name, setName] = useState(userProfile.name || '');
  const [email] = useState(userProfile.email || '');
  const [role, setRole] = useState(userProfile.role || 'Software Engineer');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Bangalore, India');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/candidate');
  const [github, setGithub] = useState('github.com/candidate');
  const [portfolio, setPortfolio] = useState('https://candidate.dev');

  const [experienceYears, setExperienceYears] = useState(userProfile.experienceYears || 2);
  const [desiredSalary, setDesiredSalary] = useState(userProfile.desiredSalary || '₹14L PA');
  const [summary, setSummary] = useState(userProfile.resumeText || 'Passionate software engineer with experience building modern web applications.');

  const [skills, setSkills] = useState<string[]>(userProfile.skills || ['React.js', 'TypeScript', 'Node.js']);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const plan = userProfile.plan || 'Free';
  const usage = userProfile.usage || { resumesCreated: 1, atsScansUsed: 1, autoAppliesUsed: 5 };
  const limits = PLAN_LIMITS[plan];

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const calculateCompleteness = () => {
    let score = 40;
    if (name) score += 10;
    if (role) score += 10;
    if (skills.length >= 3) score += 15;
    if (skills.length >= 6) score += 10;
    if (summary.length > 50) score += 15;
    return Math.min(100, score);
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    const newCompleteness = calculateCompleteness();

    setTimeout(() => {
      onUpdateUserProfile({
        name,
        role,
        skills,
        experienceYears,
        desiredSalary,
        resumeText: summary,
        profileCompleteness: newCompleteness
      });
      setIsSaving(false);
      if (showToast) showToast('🎉 Profile updated successfully!');
    }, 450);
  };

  return (
    <div className="space-y-6 animate-fade-in flex-1 flex flex-col pb-10">
      
      {/* Header Profile Card Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative group">
              <img 
                src={userProfile.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ'} 
                alt={name} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-indigo-400/40 shadow-2xl"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                ✓
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">{name}</h1>
                <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider border ${
                  plan === 'Accelerator' 
                    ? 'bg-purple-500/20 text-purple-200 border-purple-400/30' 
                    : plan === 'Pro' 
                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30' 
                    : 'bg-white/10 text-gray-200 border-white/20'
                }`}>
                  {plan === 'Accelerator' ? 'VIP Accelerator' : plan === 'Pro' ? 'Job Hunter Pro' : 'Free Starter'}
                </span>
              </div>
              <p className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>{role} • {location}</span>
              </p>
              <p className="text-xs text-gray-400 font-medium">{email}</p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto pt-2 sm:pt-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-center sm:text-right">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Profile Strength</p>
              <div className="flex items-center gap-2 justify-center sm:justify-end mt-0.5">
                <span className="text-xl font-extrabold text-emerald-400 font-display">{calculateCompleteness()}%</span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {calculateCompleteness() >= 85 ? 'Excellent' : calculateCompleteness() >= 70 ? 'Good' : 'Needs Work'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Toolbar */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'profile', label: 'Personal & Contact', icon: User },
            { id: 'career', label: 'Career & Bio', icon: Briefcase },
            { id: 'skills', label: 'Skills & Stack', icon: Award },
            { id: 'plan', label: 'Plan & Quotas', icon: CreditCard },
            { id: 'security', label: 'Security & Preferences', icon: Lock },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-md font-black' 
                    : 'text-indigo-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Contents */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xs space-y-6">

        {/* Tab 1: Personal & Contact */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 font-display">Personal & Contact Information</h2>
              <p className="text-xs font-semibold text-gray-500">Manage your contact details displayed to recruiters and hiring managers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#4f46e5]">
                  <User className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full bg-transparent text-xs font-semibold focus:outline-none text-gray-900" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Job Title / Target Role</label>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#4f46e5]">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    className="w-full bg-transparent text-xs font-semibold focus:outline-none text-gray-900" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Primary Email (Clerk Authenticated)</label>
                <div className="flex items-center gap-2.5 bg-gray-100 border border-gray-200 rounded-2xl px-3.5 py-2.5 opacity-80 cursor-not-allowed">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={email} 
                    readOnly 
                    className="w-full bg-transparent text-xs font-semibold text-gray-600 focus:outline-none cursor-not-allowed" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Phone Number</label>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#4f46e5]">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full bg-transparent text-xs font-semibold focus:outline-none text-gray-900" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Location</label>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#4f46e5]">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    className="w-full bg-transparent text-xs font-semibold focus:outline-none text-gray-900" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">LinkedIn Profile URL</label>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#4f46e5]">
                  <Linkedin className="w-4 h-4 text-[#0a66c2]" />
                  <input 
                    type="text" 
                    value={linkedin} 
                    onChange={(e) => setLinkedin(e.target.value)} 
                    className="w-full bg-transparent text-xs font-semibold focus:outline-none text-gray-900" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">GitHub Profile URL</label>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#4f46e5]">
                  <Github className="w-4 h-4 text-gray-800" />
                  <input 
                    type="text" 
                    value={github} 
                    onChange={(e) => setGithub(e.target.value)} 
                    className="w-full bg-transparent text-xs font-semibold focus:outline-none text-gray-900" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Portfolio Website</label>
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-[#4f46e5]">
                  <Globe className="w-4 h-4 text-[#4f46e5]" />
                  <input 
                    type="text" 
                    value={portfolio} 
                    onChange={(e) => setPortfolio(e.target.value)} 
                    className="w-full bg-transparent text-xs font-semibold focus:outline-none text-gray-900" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Career & Bio */}
        {activeTab === 'career' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 font-display">Career Preferences & Professional Bio</h2>
              <p className="text-xs font-semibold text-gray-500">Set target experience and compensation metrics used for AI job matching.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Years of Experience</label>
                <input 
                  type="number" 
                  min={0}
                  max={40}
                  value={experienceYears} 
                  onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#4f46e5] text-gray-900" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Target Desired Salary</label>
                <input 
                  type="text" 
                  value={desiredSalary} 
                  onChange={(e) => setDesiredSalary(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#4f46e5] text-gray-900" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Professional Bio & Resume Summary</label>
              <textarea 
                rows={5}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a brief overview of your background, technical achievements, and career goals..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:border-[#4f46e5] text-gray-900 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Skills & Stack */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 font-display">Technical Skills & Expertise</h2>
              <p className="text-xs font-semibold text-gray-500">Skills added here directly influence your automated job recommendation percentages.</p>
            </div>

            {/* Custom Skill Input */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleAddSkill(newSkillInput); }}
              className="flex items-center gap-2"
            >
              <input 
                type="text" 
                placeholder="Add custom skill (e.g. Docker, GraphQL, Kubernetes)..." 
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#4f46e5] text-gray-900"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white font-extrabold text-xs rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </form>

            {/* Active User Skills Badges */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Your Active Skills ({skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span 
                    key={skill}
                    className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-[#4f46e5] font-black text-xs rounded-2xl flex items-center gap-2 shadow-xs group"
                  >
                    <span>{skill}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Quick Add Skills */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Recommended Skills for Software Engineering Roles</h3>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SKILLS.filter(s => !skills.includes(s)).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddSkill(preset)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-[#4f46e5] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{preset}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Plan & Quotas */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 font-display">Subscription Plan & Usage Quotas</h2>
                <p className="text-xs font-semibold text-gray-500">Track active feature allocations and plan benefits.</p>
              </div>
              <button
                onClick={onOpenPricing}
                className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{plan === 'Free' ? 'Upgrade to Pro' : 'Change Plan'}</span>
              </button>
            </div>

            {/* Active Plan Card */}
            <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 border border-indigo-150 rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">Active Plan</span>
                  <h3 className="text-xl font-extrabold text-gray-900 font-display mt-0.5">
                    {plan === 'Accelerator' ? 'Career Accelerator (VIP Executive)' : plan === 'Pro' ? 'Job Hunter Pro' : 'Free Starter'}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-full uppercase tracking-wider shadow-sm">
                  Active
                </span>
              </div>

              {/* Usage Progress Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-white p-4 rounded-2xl border border-gray-150 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">📄 Resumes Created</p>
                  <p className="text-lg font-black text-gray-900">
                    {usage.resumesCreated} / {limits.maxResumes === Infinity ? '∞' : limits.maxResumes}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-150 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">🤖 ATS Score Scans</p>
                  <p className="text-lg font-black text-gray-900">
                    {usage.atsScansUsed} / {limits.maxAtsScans === Infinity ? '∞' : limits.maxAtsScans}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-150 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">🚀 Auto Applications</p>
                  <p className="text-lg font-black text-indigo-700">
                    {usage.autoAppliesUsed} / {limits.maxAutoApplies === Infinity ? '∞' : limits.maxAutoApplies}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Security & Preferences */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 font-display">Account Security & Automation Preferences</h2>
              <p className="text-xs font-semibold text-gray-500">Configure safety thresholds and Clerk identity settings.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Anti-Bot Human Mode</h4>
                  <p className="text-[11px] text-gray-500 font-semibold">Introduces natural human delays during Chrome bot form auto-filling.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-[#4f46e5] rounded border-gray-300" />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Email Alerts on New Job Matches</h4>
                  <p className="text-[11px] text-gray-500 font-semibold">Receive instant alerts when positions with over 90% match score are posted.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-[#4f46e5] rounded border-gray-300" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
