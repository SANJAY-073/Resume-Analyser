import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  FileText, 
  TrendingUp,
  Filter,
  FileDown
} from 'lucide-react';
import { FullResumeAnalysis, BulletAuditItem } from '../types';

interface ATSReadinessSectionProps {
  analysis: FullResumeAnalysis;
  onRewriteBulletWithAI?: (bullet: string) => Promise<string | null>;
  onOpenExportModal?: () => void;
}

export const ATSReadinessSection: React.FC<ATSReadinessSectionProps> = ({
  analysis,
  onRewriteBulletWithAI,
  onOpenExportModal
}) => {
  const { atsReadiness, parsedResume } = analysis;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [checkFilter, setCheckFilter] = useState<'all' | 'issues' | 'pass'>('issues');
  const [filterType, setFilterType] = useState<'all' | 'needs-work' | 'strong'>('needs-work');
  const [customRewrites, setCustomRewrites] = useState<Record<number, string>>({});
  const [isRewritingIndex, setIsRewritingIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAIRewrite = async (bullet: string, index: number) => {
    if (!onRewriteBulletWithAI) return;
    setIsRewritingIndex(index);
    try {
      const rewritten = await onRewriteBulletWithAI(bullet);
      if (rewritten) {
        setCustomRewrites(prev => ({ ...prev, [index]: rewritten }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRewritingIndex(null);
    }
  };

  const checks = atsReadiness?.checks || [];
  const issueChecks = checks.filter(c => c.status !== 'pass');
  const passChecks = checks.filter(c => c.status === 'pass');

  const displayedChecks = checkFilter === 'all' 
    ? checks 
    : checkFilter === 'issues' 
    ? issueChecks 
    : passChecks;

  const bulletAudits = atsReadiness?.bulletAudits || [];
  const filteredBullets = bulletAudits.filter(b => {
    if (filterType === 'needs-work') return b.verbStrength === 'weak' || !b.isQuantified;
    if (filterType === 'strong') return b.verbStrength === 'strong' && b.isQuantified;
    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* ATS Score & Overview Banner */}
      <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-4 sm:p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#252e37]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/30">
                ATS Compatibility Engine
              </span>
              <span className="text-xs text-slate-400 font-medium">{atsReadiness?.rating || 'Good'} Rating</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1 neo-gradient-text">Applicant Tracking System (ATS) Health Check</h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl font-medium">
              ATS bots screen for standardized section titles, clean single-column hierarchy, quantifiable metrics, and active verbs.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[#12161a] p-3 rounded-xl border border-[#252e37] shrink-0 self-start lg:self-auto shadow-sm">
            <div className="text-center px-2">
              <div className={`text-2xl sm:text-3xl font-black ${
                (atsReadiness?.score || 0) >= 85 ? 'text-[#2ef8a0]' : (atsReadiness?.score || 0) >= 70 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {atsReadiness?.score || 0}<span className="text-xs font-normal text-slate-500">/100</span>
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">ATS Pass Score</div>
            </div>
            <div className="h-8 w-px bg-[#252e37]" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-white">
                {parsedResume?.quantifiedBulletsPercentage || 0}%
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Metrics Rate</div>
            </div>
          </div>
        </div>

        {/* Filter Bar for Checklist */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Filter Checks:</span>
            <button
              onClick={() => setCheckFilter('issues')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                checkFilter === 'issues'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold'
                  : 'bg-[#12161a] border border-[#252e37] text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚠️ Needs Attention ({issueChecks.length})
            </button>
            <button
              onClick={() => setCheckFilter('pass')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                checkFilter === 'pass'
                  ? 'bg-[#2ef8a0]/15 text-[#2ef8a0] border border-[#2ef8a0]/30 font-semibold shadow-xs'
                  : 'bg-[#12161a] border border-[#252e37] text-slate-400 hover:text-slate-200'
              }`}
            >
              ✅ Passed ({passChecks.length})
            </button>
            <button
              onClick={() => setCheckFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                checkFilter === 'all'
                  ? 'bg-[#1e242c] text-white border border-[#252e37] font-semibold'
                  : 'bg-[#12161a] border border-[#252e37] text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({checks.length})
            </button>
          </div>

          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-[#252e37] bg-[#12161a] text-xs font-semibold text-slate-300 hover:text-[#2ef8a0] hover:bg-[#1e242c] hover:border-[#2ef8a0]/40 transition-all cursor-pointer shadow-xs"
              title="Download full ATS Checklist & Audit as PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-[#2ef8a0]" />
              <span>Export PDF Checklist</span>
            </button>
          )}
        </div>

        {/* ATS Checklist Cards */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedChecks.length === 0 ? (
            <div className="col-span-2 p-6 text-center text-xs text-slate-400 bg-[#12161a] rounded-xl border border-[#252e37]">
              No checks found in this category.
            </div>
          ) : (
            displayedChecks.map(check => {
              const isPass = check.status === 'pass';
              const isWarning = check.status === 'warning';
              return (
                <div
                  key={check.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isPass
                      ? 'bg-[#12161a]/80 border-[#2ef8a0]/30'
                      : isWarning
                      ? 'bg-[#12161a]/80 border-amber-900/40'
                      : 'bg-[#12161a]/80 border-rose-900/40'
                  }`}
                >
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5 shrink-0">
                      {isPass ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2ef8a0]" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{check.name}</h4>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${
                          isPass
                            ? 'bg-[#2ef8a0]/10 text-[#2ef8a0] border-[#2ef8a0]/30'
                            : isWarning
                            ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                            : 'bg-rose-950 text-rose-300 border-rose-800/60'
                        }`}>
                          {check.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{check.description}</p>
                      <p className="text-[11px] text-slate-400 italic pt-0.5">
                        💡 {check.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Standardized Section Titles Helper */}
        {(atsReadiness?.sectionSuggestions || []).length > 0 && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-[#12161a] border border-[#2ef8a0]/30 space-y-2">
            <h4 className="text-xs font-bold text-[#2ef8a0] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#2ef8a0]" />
              <span>Standardize Non-Standard Section Titles:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {atsReadiness.sectionSuggestions.map((sug, idx) => (
                <div key={idx} className="bg-[#181d23] p-2.5 rounded-lg border border-[#252e37] flex items-center justify-between">
                  <div>
                    <span className="line-through text-slate-500 text-[11px] mr-2">"{sug.current}"</span>
                    <ArrowRight className="w-3 h-3 text-[#2ef8a0] inline mr-2" />
                    <strong className="text-white font-bold">"{sug.standardized}"</strong>
                  </div>
                  <span className="text-[10px] bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/30 px-2 py-0.5 rounded-full font-medium">Standard</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Bullet Point Rewriter & Measurable Impact Optimizer */}
      <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-4 sm:p-5 shadow-lg backdrop-blur-md">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252e37]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2ef8a0]" />
              <span className="neo-gradient-text">Measurable Achievements & Action Verb Optimizer</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Transform passive bullets into high-converting impact statements: <code className="bg-[#12161a] text-[#2ef8a0] border border-[#252e37] px-1.5 py-0.5 rounded font-mono">Accomplished [X] as measured by [Y] by doing [Z]</code>.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 bg-[#12161a] border border-[#252e37] p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterType('needs-work')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'needs-work' ? 'bg-[#1e242c] text-white shadow-xs font-semibold border border-[#252e37]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Needs Work ({bulletAudits.filter(b => b.verbStrength === 'weak' || !b.isQuantified).length})
            </button>
            <button
              onClick={() => setFilterType('strong')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'strong' ? 'bg-[#2ef8a0]/15 text-[#2ef8a0] shadow-xs font-semibold border border-[#2ef8a0]/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strong ({bulletAudits.filter(b => b.verbStrength === 'strong' && b.isQuantified).length})
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === 'all' ? 'bg-[#1e242c] text-white shadow-xs font-semibold border border-[#252e37]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({bulletAudits.length})
            </button>
          </div>
        </div>

        {/* Bullets List */}
        <div className="mt-3.5 space-y-3">
          {filteredBullets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#12161a] rounded-xl border border-[#252e37]">
              No bullets match the selected filter.
            </div>
          ) : (
            filteredBullets.map((bullet, idx) => {
              const rewrittenText = customRewrites[idx] || bullet.suggestedImprovement;
              const isStrong = bullet.verbStrength === 'strong' && bullet.isQuantified;
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isStrong ? 'bg-[#12161a]/60 border-[#252e37]' : 'bg-[#12161a]/90 border-amber-900/50'
                  }`}
                >
                  <div className="flex flex-col space-y-2">
                    
                    {/* Top status bar of bullet */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          bullet.verbStrength === 'strong' ? 'bg-[#2ef8a0]/15 text-[#2ef8a0] border border-[#2ef8a0]/30' :
                          bullet.verbStrength === 'moderate' ? 'bg-teal-950 text-teal-300 border border-teal-800/60' :
                          'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}>
                          Verb: {bullet.actionVerb} ({bullet.verbStrength})
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          bullet.isQuantified ? 'bg-[#2ef8a0]/15 text-[#2ef8a0] border border-[#2ef8a0]/30' : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>
                          {bullet.isQuantified ? '✓ Quantified' : '⚠ Missing Metrics'}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-500 font-medium">
                        {bullet.wordCount} words
                      </span>
                    </div>

                    {/* Original bullet text */}
                    <div className="text-xs text-slate-300 bg-[#181d23] p-2.5 rounded-lg border border-[#252e37]">
                      <span className="text-slate-400 font-bold mr-1">Current:</span>
                      <span>"{bullet.original}"</span>
                    </div>

                    {/* Suggested / AI Rewritten improvement */}
                    {(!isStrong || customRewrites[idx]) && (
                      <div className="text-xs bg-[#181d23] p-2.5 rounded-lg border border-[#2ef8a0]/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2ef8a0] flex items-center gap-1 text-[11px]">
                            <Sparkles className="w-3 h-3 text-[#2ef8a0]" />
                            {customRewrites[idx] ? 'AI Custom Polished Bullet:' : 'Recommended High-Impact Formula:'}
                          </span>
                          <div className="flex items-center space-x-2">
                            {onRewriteBulletWithAI && (
                              <button
                                onClick={() => handleAIRewrite(bullet.original, idx)}
                                disabled={isRewritingIndex === idx}
                                className="text-[11px] font-medium text-[#2ef8a0] hover:text-[#00f59b] flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw className={`w-3 h-3 ${isRewritingIndex === idx ? 'animate-spin' : ''}`} />
                                <span>{isRewritingIndex === idx ? 'Generating...' : 'AI Rewrite'}</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleCopy(rewrittenText, idx)}
                              className="text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1 bg-[#12161a] border border-[#252e37] px-2 py-0.5 rounded cursor-pointer"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-[#2ef8a0]" /> : <Copy className="w-3 h-3 text-slate-400" />}
                              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-100 font-medium leading-relaxed">
                          "{rewrittenText}"
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
