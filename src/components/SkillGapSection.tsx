import React, { useState } from 'react';
import { 
  GraduationCap, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Award, 
  Filter, 
  Search, 
  Check, 
  XCircle,
  BookOpen
} from 'lucide-react';
import { FullResumeAnalysis, FreeCourse, SkillGapItem } from '../types';

interface SkillGapSectionProps {
  analysis: FullResumeAnalysis;
}

export const SkillGapSection: React.FC<SkillGapSectionProps> = ({ analysis }) => {
  const { skillGaps } = analysis;
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing' | 'matched'>('missing');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories
  const gapItems = skillGaps?.gapItems || [];
  const categories = ['All', ...Array.from(new Set(gapItems.map(g => g.category)))];

  const filteredGaps = gapItems.filter(item => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'missing' && item.status !== 'matched') ||
      (statusFilter === 'matched' && item.status === 'matched');

    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = (item.skillName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      
      {/* Overview Banner */}
      <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-4 sm:p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#252e37]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/30">
                Industry Skill Taxonomy
              </span>
              <span className="text-xs text-slate-400 font-medium">Free Upskilling Catalog</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1 neo-gradient-text">Skill Gap Analysis & Free Certification Roadmap</h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl font-medium">
              Identifies missing required competencies with direct free course links from Coursera, freeCodeCamp, MIT, and IBM.
            </p>
          </div>

          {/* Metrics summary */}
          <div className="flex items-center space-x-3 bg-[#12161a] p-2.5 rounded-xl border border-[#252e37] shrink-0 self-start lg:self-auto shadow-sm">
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-[#2ef8a0]">{skillGaps?.matchedCount || 0}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Matched Skills</div>
            </div>
            <div className="h-7 w-px bg-[#252e37]" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-rose-400">{skillGaps?.missingCount || 0}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Skill Gaps</div>
            </div>
          </div>
        </div>

        {/* Featured Free Courses Carousel / Grid */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#2ef8a0]" />
              <span>Recommended Free Certified Courses to Close Gaps:</span>
            </h3>
            <span className="text-[11px] text-[#2ef8a0] font-semibold">100% Free / Free Audit</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {(skillGaps?.topRecommendedCourses || []).slice(0, 4).map((course, idx) => (
              <a
                key={idx}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-[#252e37] bg-[#12161a]/90 hover:bg-[#181d23] hover:border-[#2ef8a0]/50 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/30">
                      {course.badge}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-[#2ef8a0] transition-colors" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-[#2ef8a0] line-clamp-2 pt-0.5 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">{course.provider}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-[#252e37] flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-[#2ef8a0]" /> {course.duration}
                  </span>
                  <span className="capitalize text-slate-400 font-medium">{course.level}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Filter and Interactive Skills Grid */}
      <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3.5">
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252e37]">
          
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Status:</span>
            <button
              onClick={() => setStatusFilter('missing')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'missing'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold'
                  : 'bg-[#12161a] border border-[#252e37] text-slate-400 hover:text-slate-200'
              }`}
            >
              Missing Gaps ({skillGaps?.missingCount || 0})
            </button>
            <button
              onClick={() => setStatusFilter('matched')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'matched'
                  ? 'bg-[#2ef8a0]/15 text-[#2ef8a0] border border-[#2ef8a0]/30 font-semibold shadow-xs'
                  : 'bg-[#12161a] border border-[#252e37] text-slate-400 hover:text-slate-200'
              }`}
            >
              Matched ({skillGaps?.matchedCount || 0})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-[#1e242c] text-white border border-[#252e37] font-semibold'
                  : 'bg-[#12161a] border border-[#252e37] text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12161a] border border-[#252e37] focus:border-[#2ef8a0]/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2ef8a0] transition-colors"
            />
          </div>

        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredGaps.length === 0 ? (
            <div className="col-span-3 p-8 text-center text-xs text-slate-400 bg-[#12161a] rounded-xl border border-[#252e37]">
              No skills found matching selected filter criteria.
            </div>
          ) : (
            filteredGaps.map((item, idx) => {
              const isMatched = item.status === 'matched';
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isMatched ? 'bg-[#12161a]/90 border-[#2ef8a0]/30' : 'bg-[#12161a]/80 border-[#252e37] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {isMatched ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2ef8a0] shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-white">{item.skillName}</h4>
                    </div>

                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      item.importance === 'High' ? 'bg-[#2ef8a0]/10 text-[#2ef8a0] border-[#2ef8a0]/30' : 'bg-[#181d23] text-slate-400 border-[#252e37]'
                    }`}>
                      {item.importance}
                    </span>
                  </div>

                  <div className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{item.category}</span>
                    <span className={isMatched ? 'text-[#2ef8a0] font-medium' : 'text-rose-400 font-medium'}>
                      {isMatched ? 'Matched' : 'Missing'}
                    </span>
                  </div>

                  {/* Course recommendation if missing */}
                  {!isMatched && item.recommendedCourses && item.recommendedCourses.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#252e37]">
                      <a
                        href={item.recommendedCourses[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#2ef8a0] hover:text-[#00f59b] font-medium flex items-center justify-between group/link"
                      >
                        <span className="truncate">Free Course: {item.recommendedCourses[0].title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 ml-1 group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
