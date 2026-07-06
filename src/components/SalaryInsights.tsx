import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Sparkles, Check, Plus, 
  Briefcase, ArrowRight, DollarSign, Award, ArrowUpRight 
} from 'lucide-react';
import { SalaryInsight, Job, UserProfile } from '../types';
import { INITIAL_SALARY_INSIGHTS } from '../data';

interface SalaryInsightsProps {
  insights: SalaryInsight[];
  userProfile: UserProfile;
  onUpdateUserProfile: (updated: Partial<UserProfile>) => void;
  onViewJob: (job: Job) => void;
  availableJobs: Job[];
}

const YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

export default function SalaryInsights({ 
  insights = INITIAL_SALARY_INSIGHTS, 
  userProfile, 
  onUpdateUserProfile, 
  onViewJob,
  availableJobs 
}: SalaryInsightsProps) {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const activeInsight = insights[selectedRoleIndex] || insights[0];

  // Filter jobs that match the selected role family
  const matchingJobs = availableJobs.filter(job => {
    const titleLower = job.title.toLowerCase();
    const roleLower = activeInsight.role.toLowerCase();
    
    // Simple matching rule: e.g. "Software Engineer" matches "Senior Software Engineer"
    return titleLower.includes(roleLower) || 
           roleLower.includes(titleLower) ||
           (roleLower === 'software engineer' && titleLower.includes('developer')) ||
           (roleLower === 'full stack developer' && titleLower.includes('frontend'));
  });

  const handleAddSkillToProfile = (skill: string) => {
    if (!userProfile.skills.includes(skill)) {
      const updatedSkills = [...userProfile.skills, skill];
      onUpdateUserProfile({ skills: updatedSkills });
    }
  };

  // SVG dimensions for trend graph
  const width = 600;
  const height = 240;
  const padding = 40;

  const maxVal = Math.max(...activeInsight.trendData);
  const minVal = Math.min(...activeInsight.trendData);
  const valRange = maxVal - minVal || 1;

  // Calculate coordinates for SVG trend path
  const points = activeInsight.trendData.map((val, idx) => {
    const x = padding + (idx / (activeInsight.trendData.length - 1)) * (width - padding * 2);
    // invert Y since SVG 0 is top
    const y = height - padding - ((val - minVal) / valRange) * (height - padding * 2);
    return { x, y, val };
  });

  // smooth curve path
  const curveD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = points[idx - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="space-y-8 animate-fade-in" id="salary-insights-view">
      {/* Header and explanation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-display">Salary & Market Insights</h1>
          <p className="text-sm font-semibold text-gray-400 mt-1">Analyze salary structures, market demands, and trending technical stacks.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4f46e5]/5 text-[#4f46e5] text-xs font-bold rounded-lg border border-[#4f46e5]/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Updated daily
        </div>
      </div>

      {/* Grid containing selector and active insight card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Role Selector Rail */}
        <div className="lg:col-span-4 space-y-3 text-left">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Select Career Path</h3>
          <div className="space-y-2">
            {insights.map((insight, idx) => {
              const isSelected = idx === selectedRoleIndex;
              return (
                <button
                  key={insight.role}
                  onClick={() => {
                    setSelectedRoleIndex(idx);
                    setHoveredPointIndex(null);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#3f37c9] border-[#3f37c9] text-white shadow-lg shadow-[#4f46e5]/15' 
                      : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800 shadow-sm'
                  }`}
                  id={`role-btn-${insight.role.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div>
                    <p className={`font-black text-xs uppercase tracking-wider ${isSelected ? 'text-white' : 'text-gray-900'}`}>{insight.role}</p>
                    <p className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-gray-450'} font-bold mt-1`}>Avg: {insight.averageSalary}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-white/15 text-white' 
                        : 'bg-gray-50 border border-gray-150 text-gray-500'
                    }`}>
                      {insight.demandLevel}
                    </span>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Role Detailed Insights Dashboard */}
        <div className="lg:col-span-8 space-y-6 text-left">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium space-y-6">
            
            {/* Core Stats Overview */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-405 uppercase tracking-widest">Average National Salary</p>
                <div className="flex items-end gap-2.5">
                  <span className="text-4xl font-black text-gray-900 font-display tracking-tight">{activeInsight.averageSalary}</span>
                  <div className={`flex items-center gap-0.5 text-xs font-black mb-1.5 px-2 py-0.5 rounded-full ${
                    activeInsight.changeDirection === 'up' ? 'text-green-700 bg-green-50' : 'text-red-650 bg-red-50'
                  }`}>
                    {activeInsight.changeDirection === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{activeInsight.changePercent}%</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-400">Year-on-year growth velocity</p>
              </div>

              <div className="flex gap-4">
                <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl text-center min-w-[100px] shadow-inner">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Market Demand</p>
                  <p className="text-sm font-black text-[#3f37c9] font-display mt-1">{activeInsight.demandLevel}</p>
                </div>
                <div className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl text-center min-w-[100px] shadow-inner">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Active Openings</p>
                  <p className="text-sm font-black text-gray-900 font-display mt-1">{matchingJobs.length}</p>
                </div>
              </div>
            </div>

            {/* Salary Growth Trend Chart (Interactive SVG) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black font-display text-gray-900 uppercase tracking-wider">Salary Growth Trajectory (LPA)</h4>
                <span className="text-[10px] font-bold text-gray-400">Hover points to inspect data</span>
              </div>

              <div className="bg-gray-50/30 border border-gray-100 rounded-2xl p-4 overflow-x-auto relative">
                {/* SVG Visual */}
                <div className="w-full min-w-[500px] h-[240px]">
                  <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
                    
                    {/* Horizontal background grid lines */}
                    {[0, 1, 2, 3, 4].map((gridLine) => {
                      const y = padding + (gridLine / 4) * (height - padding * 2);
                      const gridVal = maxVal - (gridLine / 4) * valRange;
                      return (
                        <g key={gridLine}>
                          <line 
                            x1={padding} 
                            y1={y} 
                            x2={width - padding} 
                            y2={y} 
                            stroke="rgba(79, 70, 229, 0.05)" 
                            strokeWidth="1.2" 
                            strokeDasharray="4 4" 
                          />
                          <text 
                            x={padding - 12} 
                            y={y + 3.5} 
                            fill="#9ca3af" 
                            fontSize="9" 
                            fontWeight="800" 
                            textAnchor="end"
                          >
                            ₹{gridVal.toFixed(1)}L
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient under the curve */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>
                    <path 
                      d={`${curveD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`} 
                      fill="url(#chartGradient)" 
                    />

                    {/* Main trend curve line */}
                    <path 
                      d={curveD} 
                      fill="none" 
                      stroke="#4f46e5" 
                      strokeWidth="3.2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />

                    {/* Interactive anchor point circles */}
                    {points.map((p, idx) => {
                      const isHovered = idx === hoveredPointIndex;
                      return (
                        <g key={idx}>
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r={isHovered ? 6.5 : 4} 
                            fill={isHovered ? '#ffffff' : '#ffffff'} 
                            stroke="#4f46e5" 
                            strokeWidth={isHovered ? 4 : 2.5} 
                            className="transition-all duration-150 cursor-pointer"
                            onMouseEnter={() => setHoveredPointIndex(idx)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          />
                          {/* Label of years */}
                          <text 
                            x={p.x} 
                            y={height - padding + 18} 
                            fill="#9ca3af" 
                            fontSize="9" 
                            fontWeight="800" 
                            textAnchor="middle"
                          >
                            {YEARS[idx]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Live hover tooltip */}
                {hoveredPointIndex !== null && points[hoveredPointIndex] && (
                  <div 
                    className="absolute bg-slate-900 text-white p-3 rounded-xl text-xs font-bold shadow-glow-indigo space-y-0.5 border border-slate-800 z-10 pointer-events-none"
                    style={{
                      left: `${(points[hoveredPointIndex].x / width) * 100}%`,
                      top: `${(points[hoveredPointIndex].y / height) * 100 - 30}%`,
                      transform: 'translate(-50%, -100%)',
                    }}
                  >
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">{YEARS[hoveredPointIndex]} Benchmark</p>
                    <p className="text-[#a5b4fc] text-sm">₹{points[hoveredPointIndex].val.toFixed(1)} LPA</p>
                  </div>
                )}
              </div>
            </div>

            {/* Core In-demand Skills block */}
            <div className="space-y-3">
              <h4 className="text-xs font-black font-display text-gray-900 uppercase tracking-wider">In-Demand Technical Competencies</h4>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Incorporating these technologies into your resume and profile significantly improves your keyword match rate during automated reviews.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activeInsight.skills.map((skill) => {
                  const userHasSkill = userProfile.skills.includes(skill);
                  return (
                    <div 
                      key={skill}
                      className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-gray-700">{skill}</span>
                      {userHasSkill ? (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          <Check className="w-3 h-3 stroke-[3]" />
                          In Profile
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddSkillToProfile(skill)}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[#4f46e5] hover:text-white bg-[#4f46e5]/5 hover:bg-[#4f46e5] px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-[#4f46e5]/10"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          Add to Profile
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Suggested Matching Opportunities */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-premium text-left">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-black font-display text-gray-900 uppercase tracking-wider">Suggested Openings for {activeInsight.role}s</h3>
          <span className="text-xs font-bold text-gray-400">Directly matched with listings</span>
        </div>

        {matchingJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm font-semibold">
            No direct openings found for this category. Check the "Find Jobs" tab for all listings!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingJobs.slice(0, 4).map((job) => (
              <div 
                key={job.id}
                className="p-4 border border-gray-100 hover:border-gray-250 rounded-2xl flex items-start gap-4 hover:shadow-md transition-all group"
              >
                {/* Logo */}
                <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  <img alt={job.company} className="w-7 h-7 object-contain animate-float" src={job.logoUrl} />
                </div>
                {/* Job Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#4f46e5] transition-colors truncate">{job.title}</h4>
                  <p className="text-xs font-semibold text-gray-400 truncate">{job.company} • {job.location}</p>
                  <p className="text-xs font-bold text-[#4f46e5] pt-0.5">{job.salaryRange}</p>
                </div>
                <button
                  onClick={() => onViewJob(job)}
                  className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-[#4f46e5]/10 text-gray-450 hover:text-[#4f46e5] flex items-center justify-center transition-all cursor-pointer group-hover:translate-x-0.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
