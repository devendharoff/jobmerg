import React, { useState } from 'react';
import { 
  Sun, Search, MapPin, SlidersHorizontal, ArrowRight, Check, 
  Briefcase, Bolt, Users, ShieldCheck, Heart, Sparkles, 
  TrendingUp, Bookmark, MessageSquare, ArrowUpRight, Mail, Send, Globe, ChevronDown, Bell
} from 'lucide-react';
import { ActiveScreen, Job } from '../types';

interface LandingPageProps {
  onNavigate: (screen: ActiveScreen) => void;
  onSearch: (query: string, location: string) => void;
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}

export default function LandingPage({ onNavigate, onSearch, jobs = [], onSelectJob }: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'Students' | 'Freshers' | 'Graduates' | 'Experienced'>('Students');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, locationQuery);
  };

  const handlePopularSearch = (term: string) => {
    onSearch(term, '');
  };

  const handleNewsletterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setNewsletterSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans selection:bg-[#4f46e5]/10 selection:text-[#4f46e5] bg-grid-pattern animate-fade-in">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <button 
              onClick={() => onNavigate('Landing')}
              className="text-2xl font-extrabold flex items-center gap-2 cursor-pointer focus:outline-none group"
              id="navbar-logo"
            >
              <div className="w-8 h-8 bg-[#4f46e5] rounded-xl flex items-center justify-center shadow-md shadow-[#4f46e5]/25 group-hover:scale-105 transition-transform">
                <Sparkles className="text-white w-4.5 h-4.5" />
              </div>
              <span className="font-display tracking-tight text-gray-900 font-black">JobMerge</span>
            </button>

            {/* Menu items */}
            <div className="hidden md:flex items-center gap-7 text-[13px] font-bold text-gray-600">
              <button onClick={() => onNavigate('Dashboard')} className="hover:text-[#4f46e5] transition-colors cursor-pointer flex items-center gap-1">
                Find Jobs <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button onClick={() => onNavigate('Dashboard')} className="hover:text-[#4f46e5] transition-colors cursor-pointer flex items-center gap-1">
                Companies <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button onClick={() => onNavigate('Dashboard')} className="hover:text-[#4f46e5] transition-colors cursor-pointer flex items-center gap-1">
                Resources <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">For Employers</a>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">Pricing</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('SignIn')}
              className="px-4 py-2 text-gray-600 font-bold text-[13px] hover:text-[#4f46e5] transition-colors cursor-pointer"
              id="btn-signin-nav"
            >
              Sign in
            </button>
            <button 
              onClick={() => onNavigate('SignUp')}
              className="px-5 py-2.5 bg-[#3f37c9] hover:bg-[#4f46e5] text-white rounded-xl font-bold text-[13px] hover:shadow-lg hover:shadow-[#4f46e5]/20 active:scale-[0.98] transition-all cursor-pointer"
              id="btn-signup-nav"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-10 pb-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-7 animate-fade-in">
            {/* Sun Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#4f46e5]/5 text-[#4f46e5] rounded-full border border-[#4f46e5]/10">
              <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span className="text-[11px] font-extrabold tracking-wide uppercase">One Search. Every Opportunity.</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-[62px] font-extrabold tracking-tight text-gray-900 leading-[1.08] font-display">
                All Jobs.<br />
                One <span className="text-[#4f46e5] relative inline-block">Powerful<span className="absolute bottom-1.5 left-0 w-full h-2.5 bg-[#4f46e5]/10 -z-10 rounded"></span></span> Search.
              </h1>
              <p className="text-[15px] text-gray-500 max-w-lg leading-relaxed font-semibold">
                We collect the best opportunities from LinkedIn, Upstock, Indeed, Glassdoor and 50+ platforms — so you can find the right job faster.
              </p>
            </div>

            {/* Verification Checklist */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#4f46e5]/10 rounded-full flex items-center justify-center text-[#4f46e5]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[13px] font-bold text-gray-700">50+ Job Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#4f46e5]/10 rounded-full flex items-center justify-center text-[#4f46e5]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[13px] font-bold text-gray-700">Real-time Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#4f46e5]/10 rounded-full flex items-center justify-center text-[#4f46e5]">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[13px] font-bold text-gray-700">Smarter Matching</span>
              </div>
            </div>

            {/* Interactive Search Bar */}
            <form 
              onSubmit={handleSearchSubmit}
              className="p-1.5 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center gap-2 hover:border-gray-200 focus-within:border-[#4f46e5] focus-within:ring-4 focus-within:ring-[#4f46e5]/5 transition-all duration-300"
              id="hero-search-form"
            >
              <div className="flex-1 flex items-center px-3.5 w-full gap-2">
                <Search className="text-gray-400 w-4.5 h-4.5 shrink-0" />
                <input 
                  className="w-full border-none focus:outline-none focus:ring-0 text-[13px] py-2 text-gray-800 placeholder-gray-400 bg-transparent font-semibold" 
                  placeholder="Job title, keyword or company" 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="hero-search-input"
                />
              </div>
              <div className="hidden md:block w-px h-6 bg-gray-100"></div>
              <div className="flex-1 flex items-center px-3.5 w-full gap-2">
                <MapPin className="text-gray-400 w-4.5 h-4.5 shrink-0" />
                <input 
                  className="w-full border-none focus:outline-none focus:ring-0 text-[13px] py-2 text-gray-800 placeholder-gray-400 bg-transparent font-semibold" 
                  placeholder="Location" 
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  id="hero-location-input"
                />
              </div>
              <button 
                type="button"
                onClick={() => onNavigate('Dashboard')}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-500 font-bold text-[13px] hover:text-[#4f46e5] transition-colors shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              <button 
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-[#3f37c9] hover:bg-[#4f46e5] text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-[13px] whitespace-nowrap active:scale-[0.98] hover:shadow-lg hover:shadow-[#3f37c9]/25 transition-all cursor-pointer"
                id="hero-search-btn"
              >
                Search Jobs
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Popular:</span>
              <button type="button" onClick={() => handlePopularSearch('Software Engineer')} className="px-3 py-1.5 bg-white hover:bg-[#4f46e5] border border-gray-100 hover:text-white rounded-xl font-bold text-gray-600 cursor-pointer transition-all shadow-sm">Software Engineer</button>
              <button type="button" onClick={() => handlePopularSearch('Product Designer')} className="px-3 py-1.5 bg-white hover:bg-[#4f46e5] border border-gray-100 hover:text-white rounded-xl font-bold text-gray-600 cursor-pointer transition-all shadow-sm">Product Designer</button>
              <button type="button" onClick={() => handlePopularSearch('Data Analyst')} className="px-3 py-1.5 bg-white hover:bg-[#4f46e5] border border-gray-100 hover:text-white rounded-xl font-bold text-gray-600 cursor-pointer transition-all shadow-sm">Data Analyst</button>
              <button type="button" onClick={() => handlePopularSearch('UI/UX Designer')} className="px-3 py-1.5 bg-white hover:bg-[#4f46e5] border border-gray-100 hover:text-white rounded-xl font-bold text-gray-600 cursor-pointer transition-all shadow-sm">UI/UX Designer</button>
              <button type="button" onClick={() => handlePopularSearch('Remote')} className="px-3 py-1.5 bg-white hover:bg-[#4f46e5] border border-gray-100 hover:text-white rounded-xl font-bold text-gray-600 cursor-pointer transition-all shadow-sm">Remote Jobs</button>
              <button type="button" onClick={() => onNavigate('Dashboard')} className="text-[#4f46e5] font-extrabold flex items-center gap-0.5 hover:underline ml-1 cursor-pointer">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Dashboard Mockup Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Top Job Sources Component */}
            <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-lg shadow-gray-200/20">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-extrabold text-gray-900 font-display">Top job sources</h3>
                <button onClick={() => onNavigate('Dashboard')} className="text-[#353df6] text-xs font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer">
                  View all sources <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-3">
                {/* LinkedIn */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 bg-white border border-gray-200 hover:border-[#353df6]/30 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <img alt="LinkedIn" className="w-8 h-8 object-contain" src="top_logos (1)/logos/job_websites/linkedin.png" />
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-500">LinkedIn</span>
                </div>
                {/* Indeed */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 bg-white border border-gray-200 hover:border-[#353df6]/30 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <img alt="Indeed" className="w-8 h-8 object-contain" src="https://cdn.simpleicons.org/indeed/003A9B" />
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-500">Indeed</span>
                </div>
                {/* Glassdoor */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 bg-white border border-gray-200 hover:border-[#353df6]/30 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <img alt="Glassdoor" className="w-8 h-8 object-contain" src="https://cdn.simpleicons.org/glassdoor/0CAA41" />
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-500">Glassdoor</span>
                </div>
                {/* ZipRecruiter */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 bg-white border border-gray-200 hover:border-[#353df6]/30 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <img alt="ZipRecruiter" className="w-8 h-8 object-contain" src="top_logos (1)/logos/job_websites/ziprecruiter.png" />
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-500">ZipRecruiter</span>
                </div>
                {/* Monster */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 bg-white border border-gray-200 hover:border-[#353df6]/30 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <img alt="Monster" className="w-8 h-8 object-contain" src="https://cdn.simpleicons.org/monster/8A2BE2" />
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-500">Monster</span>
                </div>
                {/* More */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 bg-blue-50/50 border border-blue-100 hover:border-[#353df6]/30 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer text-[#353df6] font-black text-lg">
                    •••
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-500">+ 50 more</span>
                </div>
              </div>
            </div>

            {/* Trending & Market Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Trending Searches Component */}
              <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-gray-150 shadow-lg shadow-gray-200/20 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 font-display mb-5">Trending searches</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                      <span className="text-gray-800 font-extrabold">Software Engineer</span>
                      <span className="text-green-600 flex items-center gap-0.5 font-extrabold">
                        <ArrowRight className="w-3 h-3 -rotate-45" /> 28%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                      <span className="text-gray-800 font-extrabold">Product Designer</span>
                      <span className="text-green-600 flex items-center gap-0.5 font-extrabold">
                        <ArrowRight className="w-3 h-3 -rotate-45" /> 21%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                      <span className="text-gray-800 font-extrabold">Data Analyst</span>
                      <span className="text-green-600 flex items-center gap-0.5 font-extrabold">
                        <ArrowRight className="w-3 h-3 -rotate-45" /> 16%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                      <span className="text-gray-800 font-extrabold">UI/UX Designer</span>
                      <span className="text-green-600 flex items-center gap-0.5 font-extrabold">
                        <ArrowRight className="w-3 h-3 -rotate-45" /> 14%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                      <span className="text-gray-800 font-extrabold">DevOps Engineer</span>
                      <span className="text-green-600 flex items-center gap-0.5 font-extrabold">
                        <ArrowRight className="w-3 h-3 -rotate-45" /> 12%
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => onNavigate('Dashboard')} className="mt-6 text-[#353df6] text-xs font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer text-left">
                  Explore all trends <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Market Insights Component */}
              <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-gray-150 shadow-lg shadow-gray-200/20 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 font-display mb-4">Market insights</h3>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Salary</p>
                    <div className="flex items-end gap-1.5">
                      <span className="text-2xl font-extrabold font-display text-gray-900 leading-none">₹16.8 LPA</span>
                      <span className="text-xs font-bold text-green-600 flex items-center gap-0.5 leading-none mb-0.5">
                        <ArrowRight className="w-3.5 h-3.5 -rotate-45" /> 12%
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold">vs last month</p>
                  </div>
                </div>

                {/* SVG Trend Graph */}
                <div className="h-10 my-4 relative overflow-visible">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#353df6" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#353df6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 25 Q 15 20 30 22 T 60 15 T 80 18 T 100 5" fill="none" stroke="#353df6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 0 25 Q 15 20 30 22 T 60 15 T 80 18 T 100 5 L 100 30 L 0 30 Z" fill="url(#chart-grad)" />
                    <circle cx="100" cy="5" r="3" fill="#353df6" />
                    <circle cx="80" cy="18" r="2" fill="#353df6" />
                    <circle cx="60" cy="15" r="2" fill="#353df6" />
                    <circle cx="30" cy="22" r="2" fill="#353df6" />
                    <circle cx="0" cy="25" r="2" fill="#353df6" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top in-demand skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[9px] font-extrabold text-gray-600">React</span>
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[9px] font-extrabold text-gray-600">Python</span>
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[9px] font-extrabold text-gray-600">AWS</span>
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[9px] font-extrabold text-gray-600">SQL</span>
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[9px] font-extrabold text-gray-600">Node.js</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Strip */}
            <div className="bg-[#353df6]/5 rounded-2xl p-4 border border-[#353df6]/10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 text-[#353df6]">
                <div className="w-8 h-8 bg-[#353df6]/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-4.5 h-4.5 text-[#353df6] stroke-[2.2]" />
                </div>
                <span className="text-xs font-extrabold text-gray-800">New jobs added in last 24 hours</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-md font-extrabold text-[#353df6]">1,256</span>
                <button onClick={() => onNavigate('Dashboard')} className="text-[#353df6] text-xs font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer">
                  View all new jobs <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="py-8 max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl py-6 px-8 border border-gray-150 shadow-lg shadow-gray-250/10 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="flex items-center gap-3.5 w-full justify-start md:justify-center p-2 md:p-0">
            <div className="w-11 h-11 bg-[#353df6]/10 rounded-full flex items-center justify-center text-[#353df6] shrink-0">
              <Briefcase className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 font-display">50+</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Job Sources</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3.5 w-full justify-start md:justify-center p-2 md:p-0 pt-4 md:pt-0">
            <div className="w-11 h-11 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
              <Bolt className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 font-display">1M+</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Jobs Indexed</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 w-full justify-start md:justify-center p-2 md:p-0 pt-4 md:pt-0">
            <div className="w-11 h-11 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 shrink-0">
              <Users className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 font-display">500K+</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Active Seekers</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 w-full justify-start md:justify-center p-2 md:p-0 pt-4 md:pt-0">
            <div className="w-11 h-11 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 shrink-0">
              <ShieldCheck className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 font-display">98%</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Verified Listings</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 w-full justify-start md:justify-center p-2 md:p-0 pt-4 md:pt-0">
            <div className="w-11 h-11 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 shrink-0">
              <Heart className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 font-display">4.8/5</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">User Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-white border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Trusted by job seekers from</p>
          
          {/* Infinite Marquee Wrapper */}
          <div className="relative w-full overflow-hidden py-3">
            {/* Fade overlays on borders for modern blend */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            
            <div className="animate-marquee flex items-center gap-14 whitespace-nowrap hover:[animation-play-state:paused] cursor-pointer">
              {Array(3).fill([
                { name: 'Google', url: 'https://cdn.simpleicons.org/google/4285F4' },
                { name: 'Microsoft', url: 'https://cdn.simpleicons.org/microsoft/00A4EF' },
                { name: 'Apple', url: 'https://cdn.simpleicons.org/apple/000000' },
                { name: 'Amazon', url: 'https://cdn.simpleicons.org/amazon/FF9900' },
                { name: 'Adobe', url: 'https://cdn.simpleicons.org/adobe/FF0000' },
                { name: 'Meta', url: 'https://cdn.simpleicons.org/meta/0668E1' },
                { name: 'Oracle', url: 'https://cdn.simpleicons.org/oracle/F80000' },
                { name: 'IBM', url: 'https://cdn.simpleicons.org/ibm/052FAD' },
                { name: 'Salesforce', url: 'https://cdn.simpleicons.org/salesforce/00A1E0' },
                { name: 'Nvidia', url: 'https://cdn.simpleicons.org/nvidia/76B900' },
                { name: 'SAP', url: 'https://cdn.simpleicons.org/sap/008FD3' },
                { name: 'PayPal', url: 'https://cdn.simpleicons.org/paypal/003087' },
                { name: 'Cisco', url: 'https://cdn.simpleicons.org/cisco/1BA0D7' }
              ]).flat().map((logo, idx) => (
                <div key={idx} className="flex items-center gap-2.5 hover:scale-105 transition-all duration-300 shrink-0 px-2">
                  <img 
                    alt={logo.name} 
                    className="h-8 md:h-9 object-contain" 
                    src={logo.url} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?sz=128&domain=${logo.name.toLowerCase()}.com`;
                    }}
                  />
                  <span className="font-display font-black text-sm md:text-base text-gray-800 tracking-tight">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Jobs Showcase Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4f46e5]/5 text-[#4f46e5] text-xs font-bold rounded-lg border border-[#4f46e5]/10 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Explore Opportunities
            </div>
            <h2 className="text-3xl font-extrabold font-display text-gray-900 leading-tight">
              Tailored Openings for Every Career Stage
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto font-semibold text-sm">
              Discover verified opportunities collected from over 50 platforms, perfectly matching your experience profile.
            </p>

            {/* Experience Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 pt-6">
              {(['Students', 'Freshers', 'Graduates', 'Experienced'] as const).map((category) => {
                const isActive = activeCategory === category;
                let label = '';
                if (category === 'Students') {
                  label = '🎓 Students (Internships)';
                } else if (category === 'Freshers') {
                  label = '🌱 Freshers (Entry-level)';
                } else if (category === 'Graduates') {
                  label = '🎓 Graduates (Junior Roles)';
                } else {
                  label = '💼 Experienced (Mid-Senior)';
                }

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#3f37c9] text-white shadow-lg shadow-[#3f37c9]/25 scale-[1.02]'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-150'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Grid for Active Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobs
              .filter((job) => job.category === activeCategory)
              .slice(0, 3)
              .map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-3xl border border-gray-150 hover:border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group"
                >
                  <div className="space-y-4">
                    {/* Logo & Bookmark Icon */}
                    <div className="flex justify-between items-start">
                      <div className="w-11 h-11 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        <img
                          alt={job.company}
                          className="w-7 h-7 object-contain"
                          src={job.logoUrl}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://img.icons8.com/color/48/000000/briefcase.png';
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-[#4f46e5] bg-[#4f46e5]/5 border border-[#4f46e5]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {job.workType}
                      </span>
                    </div>

                    {/* Job Title & Company */}
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900 truncate group-hover:text-[#4f46e5] transition-colors duration-200">
                        {job.title}
                      </h3>
                      <p className="text-xs font-semibold text-gray-400 truncate">
                        {job.company} • {job.location}
                      </p>
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      <div>
                        <span className="text-gray-400 block font-semibold text-[8px] uppercase tracking-widest text-left">Experience</span>
                        <span className="text-gray-700 font-extrabold">{job.experienceRequired}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold text-[8px] uppercase tracking-widest text-left">Stipend/Salary</span>
                        <span className="text-[#4f46e5] font-extrabold text-xs truncate block max-w-full">{job.salaryRange}</span>
                      </div>
                    </div>

                    {/* Skills badges */}
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-extrabold text-gray-600"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 border border-gray-150 rounded-lg text-[9px] font-extrabold text-gray-400">
                          +{job.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View details Action button */}
                  <div className="pt-5">
                    <button
                      type="button"
                      onClick={() => onSelectJob(job)}
                      className="w-full py-3 bg-[#4f46e5]/5 hover:bg-[#3f37c9] text-[#4f46e5] hover:text-white rounded-2xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group-hover:shadow-md"
                    >
                      View details & Apply
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Bottom Action callout */}
          <div className="text-center mt-10">
            <button
              type="button"
              onClick={() => onNavigate('Dashboard')}
              className="text-[#4f46e5] text-[13px] font-black inline-flex items-center gap-1 hover:underline cursor-pointer group"
            >
              Explore all {jobs.length} opportunities
            </button>
          </div>
        </div>
      </section>

      {/* Why JobMerge Features Section */}
      <section className="py-20 bg-[#f8f9fa] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold font-display text-gray-900 leading-tight">Why JobMerge?</h2>
            <p className="text-gray-500 max-w-md mx-auto font-semibold text-sm">The tools you need to land your next big role, all in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-3xl border border-gray-150 shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="w-10 h-10 bg-blue-50 text-[#3b82f6] rounded-xl flex items-center justify-center mb-5 border border-blue-100">
                <Search className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-extrabold font-display text-gray-900 mb-2">One Search. Everywhere.</h3>
              <p className="text-gray-400 text-xs leading-relaxed font-semibold">
                Search once and get results from 50+ job platforms.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-3xl border border-gray-150 shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5 border border-emerald-100">
                <SlidersHorizontal className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-extrabold font-display text-gray-900 mb-2">Smart Filters</h3>
              <p className="text-gray-400 text-xs leading-relaxed font-semibold">
                Filter by salary, experience, skills, location and more.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-3xl border border-gray-150 shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-5 border border-blue-100">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-extrabold font-display text-gray-900 mb-2">AI Match Score</h3>
              <p className="text-gray-400 text-xs leading-relaxed font-semibold">
                Get AI-powered match score and job recommendations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-7 rounded-3xl border border-gray-150 shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-5 border border-orange-100">
                <Bell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-extrabold font-display text-gray-900 mb-2">Real-time Alerts</h3>
              <p className="text-gray-400 text-xs leading-relaxed font-semibold">
                Get instant alerts for new jobs that match your profile.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-7 rounded-3xl border border-gray-150 shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-5 border border-rose-100">
                <Bookmark className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-extrabold font-display text-gray-900 mb-2">Save & Track</h3>
              <p className="text-gray-400 text-xs leading-relaxed font-semibold">
                Save jobs and track your applications in one place.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-7 rounded-3xl border border-gray-150 shadow-md hover:-translate-y-1 transition-transform duration-300">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5 border border-indigo-100">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-extrabold font-display text-gray-900 mb-2">Insights & Trends</h3>
              <p className="text-gray-400 text-xs leading-relaxed font-semibold">
                Explore salary trends, top skills and in-demand roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Conversion Banner */}
      <section className="py-12 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#353df6] rounded-[24px] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl shadow-[#353df6]/25">
            {/* Background design glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 blur-[80px] rounded-full"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              {/* Stacked candidate avatars */}
              <div className="flex items-center -space-x-3 shrink-0">
                <img alt="User portrait" className="w-12 h-12 rounded-full border-4 border-[#353df6] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" />
                <img alt="User portrait" className="w-12 h-12 rounded-full border-4 border-[#353df6] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" />
                <img alt="User portrait" className="w-12 h-12 rounded-full border-4 border-[#353df6] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl md:text-[28px] font-extrabold text-white font-display tracking-tight leading-tight">
                  Ready to find your dream job?
                </h2>
                <p className="text-white/80 text-sm font-semibold">
                  Join thousands of job seekers finding the right opportunities every day.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-3 shrink-0 w-full md:w-auto">
              <button 
                type="button"
                onClick={() => onNavigate('SignUp')}
                className="w-full md:w-auto px-8 py-3.5 bg-white text-[#353df6] hover:bg-gray-50 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                id="cta-signup-btn"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4 text-white/90 text-xs font-bold mt-1">
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            <div className="md:col-span-4 space-y-4">
              <button 
                onClick={() => onNavigate('Landing')}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
              >
                <svg className="w-7 h-7 text-[#353df6] fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4v12a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                  <path d="M2 12a4 4 0 0 1 4-4h12a4 4 0 0 1 0 8H6a4 4 0 0 1-4-4z" />
                </svg>
                <span className="font-display tracking-tight text-xl font-extrabold text-gray-900">JobMerge</span>
              </button>
              <p className="text-gray-400 text-xs font-bold leading-relaxed max-w-xs">
                Simplifying the job search by aggregating the world's best opportunities into one powerful interface.
              </p>
              <div className="flex gap-3">
                <a className="w-8 h-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center hover:bg-[#353df6] hover:text-white transition-all border border-gray-100" href="#">
                  <Globe className="w-4 h-4" />
                </a>
                <a className="w-8 h-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center hover:bg-[#353df6] hover:text-white transition-all border border-gray-100" href="#">
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a className="w-8 h-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center hover:bg-[#353df6] hover:text-white transition-all border border-gray-100" href="#">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider">Product</h4>
              <ul className="space-y-2">
                <li><button type="button" onClick={() => onNavigate('Dashboard')} className="text-gray-400 text-xs font-bold hover:text-[#353df6] cursor-pointer">Find Jobs</button></li>
                <li><button type="button" onClick={() => onNavigate('Dashboard')} className="text-gray-400 text-xs font-bold hover:text-[#353df6] cursor-pointer">Salaries</button></li>
                <li><button type="button" onClick={() => onNavigate('Dashboard')} className="text-gray-400 text-xs font-bold hover:text-[#353df6] cursor-pointer">AI Matching</button></li>
                <li><a className="text-gray-400 text-xs font-bold hover:text-[#353df6]" href="#">Mobile App</a></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider">Company</h4>
              <ul className="space-y-2">
                <li><a className="text-gray-400 text-xs font-bold hover:text-[#353df6]" href="#">About Us</a></li>
                <li><a className="text-gray-400 text-xs font-bold hover:text-[#353df6]" href="#">Careers</a></li>
                <li><a className="text-gray-400 text-xs font-bold hover:text-[#353df6]" href="#">Press Kit</a></li>
                <li><a className="text-gray-400 text-xs font-bold hover:text-[#353df6]" href="#">Contact</a></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3.5">
              <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider">Subscribe to our newsletter</h4>
              <p className="text-gray-400 text-xs font-bold leading-relaxed">Get the latest job trends and insights delivered to your inbox.</p>
              
              {newsletterSubscribed ? (
                <div className="bg-green-50 text-green-700 text-xs p-3 rounded-xl border border-green-200 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 stroke-[3]" />
                  Awesome! You've successfully subscribed to our weekly newsletter.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubscribe} className="flex gap-2" id="newsletter-form">
                  <input 
                    className="flex-1 bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#353df6] text-xs font-semibold text-gray-800 placeholder-gray-400 shadow-inner" 
                    placeholder="Enter your email" 
                    type="email" 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-[#353df6] text-white rounded-xl font-bold text-xs hover:bg-[#252ccb] shadow-md shadow-[#353df6]/10 active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Join
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-400 text-[11px] font-bold">© 2026 JobMerge Inc. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-5 text-[11px] font-bold text-gray-400">
              <a className="hover:text-[#353df6] transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-[#353df6] transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-[#353df6] transition-colors" href="#">Cookie Settings</a>
              <a className="hover:text-[#353df6] transition-colors" href="#">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
