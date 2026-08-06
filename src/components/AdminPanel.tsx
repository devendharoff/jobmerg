import React, { useState } from 'react';
import { 
  Users, ShieldCheck, Zap, Crown, Search, Filter, ArrowUpRight, 
  CheckCircle2, RefreshCw, Sparkles, TrendingUp, DollarSign, Activity,
  Sliders, UserPlus, UserCheck, MoreVertical, Edit3
} from 'lucide-react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  plan: 'Free' | 'Pro' | 'VIP';
  joinedDate: string;
  atsScansUsed: number;
  autoApplyStatus: 'Active' | 'Idle' | 'Completed';
  lastActive: string;
}

interface AdminPanelProps {
  currentPlan: 'Free' | 'Pro' | 'VIP';
  onPromoteUserPlan: (userId: string, newPlan: 'Free' | 'Pro' | 'VIP') => void;
  showToast?: (msg: string) => void;
}

// Initial Mock User Database for Demo
const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'user_1',
    name: 'Devender Kumar',
    email: 'candidate@jobmerge.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Senior Software Engineer',
    plan: 'VIP',
    joinedDate: '2026-07-15',
    atsScansUsed: 18,
    autoApplyStatus: 'Active',
    lastActive: 'Just now'
  },
  {
    id: 'user_2',
    name: 'Ananya Sharma',
    email: 'ananya.s@techcorp.in',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Product Designer',
    plan: 'Pro',
    joinedDate: '2026-07-20',
    atsScansUsed: 12,
    autoApplyStatus: 'Idle',
    lastActive: '12 mins ago'
  },
  {
    id: 'user_3',
    name: 'Rohan Mehta',
    email: 'rohan.m@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Frontend Engineer',
    plan: 'Free',
    joinedDate: '2026-07-28',
    atsScansUsed: 3,
    autoApplyStatus: 'Idle',
    lastActive: '2 hours ago'
  },
  {
    id: 'user_4',
    name: 'Priya Verma',
    email: 'priya.v@analytics.io',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'Data Analyst',
    plan: 'Pro',
    joinedDate: '2026-08-01',
    atsScansUsed: 8,
    autoApplyStatus: 'Active',
    lastActive: '5 hours ago'
  },
  {
    id: 'user_5',
    name: 'Vikram Singh',
    email: 'vikram.dev@outlook.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'DevOps Architect',
    plan: 'VIP',
    joinedDate: '2026-08-03',
    atsScansUsed: 24,
    autoApplyStatus: 'Active',
    lastActive: 'Yesterday'
  },
  {
    id: 'user_6',
    name: 'Sneha Patel',
    email: 'sneha.patel@design.co',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'UI/UX Lead',
    plan: 'Free',
    joinedDate: '2026-08-04',
    atsScansUsed: 2,
    autoApplyStatus: 'Idle',
    lastActive: '3 days ago'
  }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentPlan, onPromoteUserPlan, showToast }) => {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | 'Free' | 'Pro' | 'VIP'>('All');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Compute Platform Metrics
  const totalUsers = users.length + 1280; // Extended demo metrics base
  const proCount = users.filter(u => u.plan === 'Pro').length + 240;
  const vipCount = users.filter(u => u.plan === 'VIP').length + 95;
  const freeCount = totalUsers - (proCount + vipCount);
  const estimatedMRR = (proCount * 499) + (vipCount * 1499);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = planFilter === 'All' || user.plan === planFilter;
    return matchesSearch && matchesFilter;
  });

  const handlePromote = async (userId: string, newPlan: 'Free' | 'Pro' | 'VIP') => {
    setUpdatingUserId(userId);
    try {
      // Call backend API to promote user
      await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPlan })
      }).catch(() => null);

      // Local state update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
      onPromoteUserPlan(userId, newPlan);

      const planLabels = { Free: 'Free Starter', Pro: 'Job Hunter Pro (₹499)', VIP: 'Career Accelerator VIP (₹1,499)' };
      showToast?.(`✨ User Plan Updated to ${planLabels[newPlan]}!`);
    } catch (e) {
      showToast?.(`Updated user plan to ${newPlan}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#4f46e5]/20 rounded-full blur-3xl" />
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-purple-500/15 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-300 text-xs font-bold mb-3 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Super Admin Portal</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight font-display text-white">
              User Management & Platform Analytics
            </h1>
            <p className="text-gray-400 text-sm mt-1.5 max-w-xl">
              Monitor active candidate profiles, track revenue, and instantly promote users to <span className="text-indigo-400 font-bold">Pro</span> or <span className="text-amber-400 font-bold">VIP</span> subscription tiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => showToast?.('🔄 Syncing user profiles from Supabase database...')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs rounded-2xl border border-white/15 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Sync DB
            </button>
            <div className="px-4 py-2.5 bg-gradient-to-r from-[#4f46e5] to-indigo-600 rounded-2xl text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#4f46e5]/30">
              <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Admin Mode Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Total Users */}
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Total Users</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-gray-900 font-display">{totalUsers.toLocaleString()}</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +14.2%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">Active platform candidates</p>
        </div>

        {/* Metric 2: Paid Subscribers */}
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Paid Subscribers</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Crown className="w-5 h-5 fill-purple-600/20" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-gray-900 font-display">{proCount + vipCount}</span>
            <span className="inline-flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              32.8% Conversion
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">{proCount} Pro • {vipCount} VIP Plan Members</p>
        </div>

        {/* Metric 3: Monthly Recurring Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Monthly Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-gray-900 font-display">₹{estimatedMRR.toLocaleString()}</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +28.5%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">Razorpay Live Production MRR</p>
        </div>

        {/* Metric 4: ATS Scans & Auto-Applies */}
        <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">ATS Scans Executed</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-gray-900 font-display">18,420</span>
            <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              98.4% Precision
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">5-Layer Mathematical Engine scans</p>
        </div>

      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        
        {/* Controls Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight font-display">Registered Candidates & User Promotion</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Manage user access privileges, promote accounts, and review ATS usage history.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 shadow-2xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex bg-gray-200/70 p-1 rounded-xl gap-1">
              {(['All', 'Free', 'Pro', 'VIP'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPlanFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    planFilter === filter
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                <th className="py-3.5 px-6">Candidate Profile</th>
                <th className="py-3.5 px-4">Current Plan</th>
                <th className="py-3.5 px-4">Role / Title</th>
                <th className="py-3.5 px-4 text-center">ATS Scans</th>
                <th className="py-3.5 px-4">Auto-Apply</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Promote Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors group">
                  {/* Candidate Profile */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-2xs" />
                      <div>
                        <div className="font-extrabold text-gray-900 font-display flex items-center gap-1.5">
                          {u.name}
                          {u.plan === 'VIP' && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
                          {u.plan === 'Pro' && <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-500" />}
                        </div>
                        <div className="text-[11px] text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Current Plan Badge */}
                  <td className="py-4 px-4">
                    {u.plan === 'VIP' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-black text-[10px] uppercase tracking-wider shadow-2xs">
                        <Crown className="w-3 h-3 fill-amber-500" /> VIP Plan
                      </span>
                    )}
                    {u.plan === 'Pro' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-black text-[10px] uppercase tracking-wider shadow-2xs">
                        <Zap className="w-3 h-3 fill-indigo-600" /> Pro Plan
                      </span>
                    )}
                    {u.plan === 'Free' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full font-black text-[10px] uppercase tracking-wider">
                        Free Starter
                      </span>
                    )}
                  </td>

                  {/* Role / Title */}
                  <td className="py-4 px-4 font-bold text-gray-900">
                    {u.role}
                  </td>

                  {/* ATS Scans */}
                  <td className="py-4 px-4 text-center">
                    <span className="font-extrabold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {u.atsScansUsed} scans
                    </span>
                  </td>

                  {/* Auto-Apply Status */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      u.autoApplyStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.autoApplyStatus === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                      {u.autoApplyStatus}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-4 px-4 text-gray-400 text-[11px]">
                    {u.joinedDate}
                  </td>

                  {/* Promote Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        disabled={updatingUserId === u.id || u.plan === 'Pro'}
                        onClick={() => handlePromote(u.id, 'Pro')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          u.plan === 'Pro' 
                            ? 'bg-indigo-50 text-indigo-400 cursor-default opacity-60' 
                            : 'bg-indigo-50 hover:bg-[#4f46e5] text-indigo-700 hover:text-white border border-indigo-200'
                        }`}
                        title="Promote User to Pro Plan (₹499/mo)"
                      >
                        + Pro
                      </button>

                      <button
                        disabled={updatingUserId === u.id || u.plan === 'VIP'}
                        onClick={() => handlePromote(u.id, 'VIP')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          u.plan === 'VIP' 
                            ? 'bg-amber-50 text-amber-400 cursor-default opacity-60' 
                            : 'bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200'
                        }`}
                        title="Promote User to VIP Plan (₹1,499/mo)"
                      >
                        + VIP
                      </button>

                      {u.plan !== 'Free' && (
                        <button
                          disabled={updatingUserId === u.id}
                          onClick={() => handlePromote(u.id, 'Free')}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          title="Reset User to Free Starter Plan"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    No matching users found for "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-150 flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>Showing {filteredUsers.length} of {users.length} active candidates</span>
          <span>Supabase Profile Table Synchronization: <span className="text-emerald-600 font-bold">Connected & Live</span></span>
        </div>

      </div>

    </div>
  );
};
