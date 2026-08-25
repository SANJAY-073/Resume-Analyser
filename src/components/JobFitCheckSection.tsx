import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  Search,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { JobSuitabilityResult, JobDescription } from '../types';

interface JobFitCheckSectionProps {
  targetJobFit?: JobSuitabilityResult;
  selectedJob?: JobDescription;
  allJobs: JobDescription[];
  onSelectJob: (jobId: string) => void;
}

export const JobFitCheckSection: React.FC<JobFitCheckSectionProps> = ({
  targetJobFit,
  selectedJob,
  allJobs,
  onSelectJob
}) => {
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'matched' | 'missing'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!targetJobFit || !selectedJob) {
    return (
      <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-8 text-center text-slate-400 backdrop-blur-md">
        Please select a target job to inspect specific fit details.
      </div>
    );
  }

  const allKeywords = [
    ...(targetJobFit.matchedKeywords || []).map(k => ({ text: k, type: 'matched' as const })),
    ...(targetJobFit.missingKeywords || []).map(k => ({ text: k, type: 'missing' as const }))
  ];

  const filteredKeywords = allKeywords.filter(k => {
    const matchesFilter = keywordFilter === 'all' || k.type === keywordFilter;
    const matchesSearch = k.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      
      {/* Target Job Header Card */}
      <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-5 sm:p-6 shadow-lg backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#252e37]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/30">
                Target Role Fit Check
              </span>
              <span className="text-xs text-slate-400 font-medium">{selectedJob.department} • {selectedJob.level}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 neo-gradient-text">{selectedJob.title}</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">{selectedJob.description}</p>
          </div>

          <div className="flex items-center space-x-3 bg-[#12161a] p-3 rounded-xl border border-[#252e37] shrink-0 shadow-sm">
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold text-[#2ef8a0]">{targetJobFit.matchScore}%</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Fit Score</div>
            </div>
            <div className="h-8 w-px bg-[#252e37]" />
            <div className="text-center px-2">
              <div className="text-2xl font-extrabold text-emerald-400">
                {(targetJobFit.matchedKeywords || []).length}/{allKeywords.length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Keywords Found</div>
            </div>
          </div>
        </div>

        {/* Responsibilities & Qualifications Alignment */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          
          <div className="bg-[#12161a]/90 p-3.5 rounded-xl border border-[#252e37]">
            <h3 className="font-bold text-white mb-2 flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-[#2ef8a0]" />
              Role Responsibilities Alignment:
            </h3>
            <ul className="space-y-1.5 text-slate-300">
              {(selectedJob.responsibilities || []).map((resp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ef8a0] mt-1.5 shrink-0" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#12161a]/90 p-3.5 rounded-xl border border-[#252e37] space-y-2">
            <h3 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Key Strengths & Growth Areas for this Job:
            </h3>
            <div className="space-y-1 text-slate-300">
              {(targetJobFit.strengths || []).map((str, i) => (
                <p key={i} className="flex items-center gap-1.5 text-[#2ef8a0] font-medium">
                  <Check className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0" /> {str}
                </p>
              ))}
              {(targetJobFit.improvementAreas || []).map((imp, i) => (
                <p key={i} className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {imp}
                </p>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Keyword Cloud & Inspection Card */}
      <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-5 sm:p-6 shadow-lg backdrop-blur-md">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#252e37]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="neo-gradient-text">Interactive Role Keyword Cloud</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#12161a] border border-[#252e37] text-slate-300 font-medium">
                {allKeywords.length} Keywords Checked
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              ATS filters rank candidates by precise matching and keyword density.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter keywords..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#12161a] border border-[#252e37] focus:border-[#2ef8a0]/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2ef8a0] w-36 sm:w-44 transition-colors"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-1 bg-[#12161a] border border-[#252e37] p-1 rounded-lg">
              <button
                onClick={() => setKeywordFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  keywordFilter === 'all' ? 'bg-[#1e242c] text-white shadow-xs font-semibold border border-[#252e37]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({allKeywords.length})
              </button>
              <button
                onClick={() => setKeywordFilter('matched')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  keywordFilter === 'matched' ? 'bg-[#2ef8a0]/15 text-[#2ef8a0] shadow-xs font-semibold border border-[#2ef8a0]/30' : 'text-slate-400 hover:text-[#2ef8a0]'
                }`}
              >
                Matched ({targetJobFit.matchedKeywords.length})
              </button>
              <button
                onClick={() => setKeywordFilter('missing')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  keywordFilter === 'missing' ? 'bg-rose-950/60 text-rose-300 shadow-xs font-semibold border border-rose-800/50' : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                Missing ({targetJobFit.missingKeywords.length})
              </button>
            </div>

          </div>
        </div>

        {/* Keyword Pills Grid */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {filteredKeywords.map((kw, index) => {
              const isMatched = kw.type === 'matched';
              return (
                <div
                  key={index}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isMatched
                      ? 'bg-[#2ef8a0]/10 text-[#2ef8a0] border-[#2ef8a0]/30 hover:bg-[#2ef8a0]/20 shadow-xs'
                      : 'bg-rose-950/50 text-rose-300 border-rose-800/40 hover:bg-rose-900/40'
                  }`}
                >
                  {isMatched ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span>{kw.text}</span>
                  <span className="text-[10px] opacity-75">
                    {isMatched ? '✓ Found' : '✗ Missing'}
                  </span>
                </div>
              );
            })}
          </div>

          {filteredKeywords.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-500 font-medium">
              No keywords match your search query.
            </div>
          )}
        </div>

        {/* Action Suggestion Bar */}
        {targetJobFit.missingKeywords.length > 0 && (
          <div className="mt-5 p-3.5 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-start space-x-2 text-xs text-amber-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-200">ATS Keyword Placement Tip:</strong> Integrate missing keywords like{' '}
              <span className="font-semibold text-amber-100">{targetJobFit.missingKeywords.slice(0, 4).join(', ')}</span> into your Technical Skills list and Professional Experience bullet points to pass automated keyword ranking filters.
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
