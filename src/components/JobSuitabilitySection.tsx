import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Target, 
  Filter,
  Check,
  Search,
  GraduationCap,
  Award,
  Layers
} from 'lucide-react';
import { JobSuitabilityResult, JobDescription } from '../types';

interface JobSuitabilitySectionProps {
  jobMatches: JobSuitabilityResult[];
  jobs: JobDescription[];
  selectedJobId: string;
  onSelectTargetJob: (jobId: string) => void;
}

export const JobSuitabilitySection: React.FC<JobSuitabilitySectionProps> = ({
  jobMatches,
  jobs,
  selectedJobId,
  onSelectTargetJob
}) => {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(selectedJobId || jobMatches[0]?.jobId);
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique departments
  const departments = ['All', ...Array.from(new Set(jobs.map(j => j.department)))];

  // Helper to map job matching with job data
  const enrichedMatches = jobMatches.map(match => {
    const jobMeta = jobs.find(j => j.id === match.jobId);
    return {
      ...match,
      level: match.level || jobMeta?.level || 'Mid-Level',
      department: match.department || jobMeta?.department || 'Engineering',
      experienceYears: match.experienceYears !== undefined ? match.experienceYears : (jobMeta?.experienceYears || 0)
    };
  });

  const filteredMatches = enrichedMatches.filter(item => {
    const matchesDept = deptFilter === 'All' || item.department === deptFilter;
    
    let matchesLevel = true;
    if (levelFilter === 'Intern') matchesLevel = item.level.toLowerCase().includes('intern');
    else if (levelFilter === 'Fresher') matchesLevel = item.level.toLowerCase().includes('fresher') || item.level.toLowerCase().includes('entry') || item.level.toLowerCase().includes('graduate');
    else if (levelFilter === 'Mid') matchesLevel = item.level.toLowerCase().includes('mid');
    else if (levelFilter === 'Senior') matchesLevel = item.level.toLowerCase().includes('senior') || item.level.toLowerCase().includes('lead');

    const matchesSearch = !searchQuery.trim() || 
      item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.matchedSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDept && matchesLevel && matchesSearch;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'text-[#2ef8a0] bg-[#2ef8a0]/10 border-[#2ef8a0]/30';
    if (score >= 70) return 'text-emerald-300 bg-emerald-950/60 border-emerald-800/50';
    if (score >= 50) return 'text-amber-300 bg-amber-950/60 border-amber-800/50';
    return 'text-rose-400 bg-rose-950/60 border-rose-800/50';
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return 'bg-[#2ef8a0] shadow-[0_0_8px_rgba(46,248,160,0.5)]';
    if (score >= 70) return 'bg-emerald-400';
    if (score >= 50) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  const getLevelBadge = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('intern')) {
      return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
    }
    if (l.includes('fresher') || l.includes('entry') || l.includes('graduate')) {
      return 'bg-[#2ef8a0]/15 text-[#2ef8a0] border-[#2ef8a0]/30';
    }
    if (l.includes('senior') || l.includes('lead')) {
      return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    }
    return 'bg-slate-800 text-slate-200 border-slate-700';
  };

  return (
    <div className="space-y-3.5">
      
      {/* Section Header with Multi-Level Filters */}
      <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#2ef8a0]" />
              <span className="neo-gradient-text">Multi-Role Career Match & Suitability ({filteredMatches.length} roles)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Evaluated across Internships, Freshers, Mid-Level, and Senior specifications with NLP semantic scoring.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roles or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12161a] border border-[#252e37] focus:border-[#2ef8a0]/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2ef8a0] transition-colors"
            />
          </div>
        </div>

        {/* Experience Level & Department Filter Bars */}
        <div className="pt-2 border-t border-[#252e37] flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Level Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Level:</span>
            {[
              { id: 'All', label: 'All' },
              { id: 'Intern', label: '🎓 Interns' },
              { id: 'Fresher', label: '🚀 Freshers' },
              { id: 'Mid', label: '💼 Mid-Level' },
              { id: 'Senior', label: '👑 Senior' }
            ].map(lvl => (
              <button
                key={lvl.id}
                onClick={() => setLevelFilter(lvl.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  levelFilter === lvl.id
                    ? 'bg-[#2ef8a0] text-[#12161a] font-bold shadow-[0_0_10px_rgba(46,248,160,0.25)]'
                    : 'bg-[#12161a] border border-[#252e37] text-slate-400 hover:text-white hover:border-[#2ef8a0]/30 hover:bg-[#1e242c]'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Dept:</span>
            <select
              aria-label="Filter Department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-[#12161a] border border-[#252e37] text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2ef8a0]"
            >
              {departments.map(d => (
                <option key={d} value={d} className="bg-[#181d23] text-slate-100">{d}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Role Comparison Cards List */}
      <div className="space-y-2.5">
        {filteredMatches.length === 0 ? (
          <div className="bg-[#181d23]/95 rounded-xl border border-[#252e37] p-8 text-center text-slate-400 text-xs">
            No matching job specifications found for selected filters. Try changing level or search criteria.
          </div>
        ) : (
          filteredMatches.map(match => {
            const isExpanded = expandedJobId === match.jobId;
            const isTarget = selectedJobId === match.jobId;

            return (
              <div
                key={match.jobId}
                className={`bg-[#181d23]/95 rounded-xl border transition-all overflow-hidden ${
                  isTarget 
                    ? 'border-[#2ef8a0]/80 ring-1 ring-[#2ef8a0]/40 shadow-[0_0_20px_rgba(46,248,160,0.12)]' 
                    : 'border-[#252e37] hover:border-[#2ef8a0]/30'
                }`}
              >
                
                {/* Card Header Row */}
                <div 
                  onClick={() => setExpandedJobId(isExpanded ? null : match.jobId)}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#1e242c]/60 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 border ${
                      isTarget ? 'bg-[#12161a] text-[#2ef8a0] border-[#2ef8a0]/50 shadow-[0_0_10px_rgba(46,248,160,0.15)]' : 'bg-[#12161a] text-slate-300 border-[#252e37]'
                    }`}>
                      <span className="text-sm font-extrabold">{match.matchScore}%</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Match</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">{match.jobTitle}</h3>
                        
                        {/* Level Badge */}
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getLevelBadge(match.level)}`}>
                          {match.level}
                        </span>

                        {isTarget && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#2ef8a0] text-[#12161a] shadow-[0_0_8px_rgba(46,248,160,0.3)]">
                            Active Target
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-[#12161a] border border-[#252e37] font-medium">
                          {match.department}
                        </span>
                      </div>

                      {/* Subscore preview pills */}
                      <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-slate-400">
                        <span>Skills: <strong className="text-slate-200">{match.subScores.skillsMatch}%</strong></span>
                        <span>•</span>
                        <span>Keywords: <strong className="text-slate-200">{match.subScores.keywordOverlap}%</strong></span>
                        <span>•</span>
                        <span className="text-[#2ef8a0] font-medium">{match.matchedSkills.length} skills matched</span>
                        {match.missingSkills.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-medium">{match.missingSkills.length} gaps</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side controls */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {!isTarget && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTargetJob(match.jobId);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#252e37] bg-[#12161a] text-slate-300 hover:text-[#2ef8a0] hover:border-[#2ef8a0]/40 hover:bg-[#1e242c] transition-colors shadow-xs cursor-pointer"
                      >
                        Set as Target Role
                      </button>
                    )}
                    <div className="p-1 rounded-lg text-slate-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#2ef8a0]" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-[#1e242c] h-1">
                  <div className={`h-full ${getBarColor(match.matchScore)} transition-all duration-700`} style={{ width: `${match.matchScore}%` }} />
                </div>

                {/* Expanded In-Depth Breakdown */}
                {isExpanded && (
                  <div className="p-4 bg-[#12161a]/95 border-t border-[#252e37] space-y-3.5 text-xs sm:text-sm">
                    
                    {/* Detailed Subscore Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-[#181d23] p-2.5 rounded-xl border border-[#252e37]">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">Skills Match</div>
                        <div className="text-base font-extrabold text-white mt-0.5">{match.subScores.skillsMatch}%</div>
                        <div className="w-full bg-[#12161a] h-1 rounded-full mt-1.5">
                          <div className="h-full bg-[#2ef8a0] rounded-full" style={{ width: `${match.subScores.skillsMatch}%` }} />
                        </div>
                      </div>

                      <div className="bg-[#181d23] p-2.5 rounded-xl border border-[#252e37]">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">Keyword Overlap</div>
                        <div className="text-base font-extrabold text-white mt-0.5">{match.subScores.keywordOverlap}%</div>
                        <div className="w-full bg-[#12161a] h-1 rounded-full mt-1.5">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${match.subScores.keywordOverlap}%` }} />
                        </div>
                      </div>

                      <div className="bg-[#181d23] p-2.5 rounded-xl border border-[#252e37]">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">Experience Depth</div>
                        <div className="text-base font-extrabold text-white mt-0.5">{match.subScores.experienceRelevance}%</div>
                        <div className="w-full bg-[#12161a] h-1 rounded-full mt-1.5">
                          <div className="h-full bg-teal-400 rounded-full" style={{ width: `${match.subScores.experienceRelevance}%` }} />
                        </div>
                      </div>

                      <div className="bg-[#181d23] p-2.5 rounded-xl border border-[#252e37]">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">Education & Certs</div>
                        <div className="text-base font-extrabold text-white mt-0.5">{match.subScores.educationCertifications}%</div>
                        <div className="w-full bg-[#12161a] h-1 rounded-full mt-1.5">
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${match.subScores.educationCertifications}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Why this resume fits explanation */}
                    <div className="bg-[#181d23] p-3 rounded-xl border border-[#252e37] space-y-1.5">
                      <h4 className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-[#2ef8a0]" />
                        <span>Semantic Fit Analysis:</span>
                      </h4>
                      <ul className="space-y-1 text-slate-300 text-xs">
                        {match.fitExplanation.map((exp, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0 mt-0.5" />
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Matched vs Missing Skills Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      {/* Matched Skills */}
                      <div className="bg-[#181d23] p-3 rounded-xl border border-[#2ef8a0]/30 space-y-1.5">
                        <span className="font-bold text-[#2ef8a0] text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2ef8a0]" />
                          Matched Skills ({match.matchedSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {match.matchedSkills.length > 0 ? (
                            match.matchedSkills.map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded-full bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/25 text-[11px] font-semibold">
                                ✓ {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 italic">No exact skill matches identified.</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="bg-[#181d23] p-3 rounded-xl border border-rose-900/50 space-y-1.5">
                        <span className="font-bold text-rose-400 text-xs flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          Missing Skills / Gaps ({match.missingSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {match.missingSkills.length > 0 ? (
                            match.missingSkills.map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/40 text-[11px] font-medium">
                                ✗ {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#2ef8a0] font-medium">All required skills present!</span>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
