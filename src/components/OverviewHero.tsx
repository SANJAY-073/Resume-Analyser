import React from 'react';
import { 
  Target, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Github, 
  Sparkles, 
  ArrowRight,
  GraduationCap,
  Briefcase,
  Check,
  FileDown
} from 'lucide-react';
import { FullResumeAnalysis } from '../types';

interface OverviewHeroProps {
  analysis: FullResumeAnalysis;
  onSelectTab: (tabId: string) => void;
  onTriggerAIDeepReview?: () => void;
  isDeepReviewing?: boolean;
  onOpenExportModal?: () => void;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({
  analysis,
  onSelectTab,
  onTriggerAIDeepReview,
  isDeepReviewing,
  onOpenExportModal
}) => {
  const { parsedResume, targetJobFit, atsReadiness, benchmarking, skillGaps } = analysis;
  const matchScore = targetJobFit?.matchScore || 0;
  const atsScore = atsReadiness?.score || 0;

  // Color helpers with Neo Mint accents
  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'text-[#2ef8a0] bg-[#2ef8a0]/10 border-[#2ef8a0]/30';
    if (score >= 70) return 'text-emerald-300 bg-emerald-950/60 border-emerald-800/50';
    if (score >= 50) return 'text-amber-300 bg-amber-950/60 border-amber-800/50';
    return 'text-rose-400 bg-rose-950/60 border-rose-800/50';
  };

  const getProgressBar = (score: number) => {
    if (score >= 85) return 'bg-[#2ef8a0] shadow-[0_0_10px_rgba(46,248,160,0.5)]';
    if (score >= 70) return 'bg-emerald-400';
    if (score >= 50) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  // Extract top priority action items
  const actionItems: { title: string; desc: string; tab: string }[] = [];
  
  if (targetJobFit && targetJobFit.missingSkills && targetJobFit.missingSkills.length > 0) {
    actionItems.push({
      title: `Add Missing Skills: ${targetJobFit.missingSkills.slice(0, 3).join(', ')}`,
      desc: `Target role requires ${targetJobFit.missingSkills.length} key skill(s) not explicitly detected.`,
      tab: 'skill-gaps'
    });
  }

  const failingChecks = (atsReadiness?.checks || []).filter(c => c.status !== 'pass');
  if (failingChecks.length > 0) {
    actionItems.push({
      title: `Optimize ATS: ${failingChecks[0].name}`,
      desc: failingChecks[0].recommendation || failingChecks[0].description,
      tab: 'ats-readiness'
    });
  }

  if (parsedResume && parsedResume.quantifiedBulletsPercentage < 50) {
    actionItems.push({
      title: 'Quantify Experience Bullets (XYZ Formula)',
      desc: `Only ${parsedResume.quantifiedBulletsPercentage}% of bullets have numbers or metrics. Boost with measurable outcomes.`,
      tab: 'ats-readiness'
    });
  }

  return (
    <div className="space-y-4">
      
      {/* Top Banner Card: Candidate + Target Job + Action Header */}
      <div className="bg-[#181d23]/95 rounded-2xl border border-[#252e37] p-5 sm:p-6 shadow-lg backdrop-blur-md">
        
        {/* Candidate Profile Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#252e37]">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#12161a] border border-[#2ef8a0]/40 flex items-center justify-center text-[#2ef8a0] font-bold text-base shrink-0 shadow-[0_0_12px_rgba(46,248,160,0.15)]">
              {parsedResume?.detectedName ? parsedResume.detectedName.charAt(0) : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight neo-gradient-text">
                  {parsedResume?.detectedName || 'Candidate Resume'}
                </h1>
                {targetJobFit && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2ef8a0]/10 text-[#2ef8a0] border border-[#2ef8a0]/30 flex items-center gap-1">
                    <Target className="w-3 h-3 text-[#2ef8a0]" />
                    <span>Target: [{targetJobFit.level || 'Role'}] {targetJobFit.jobTitle}</span>
                  </span>
                )}
              </div>

              {/* Contact Icons List */}
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium">
                {parsedResume?.contactInfo?.email ? (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {parsedResume.contactInfo.email}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> Missing Email
                  </span>
                )}

                {parsedResume?.contactInfo?.phone && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {parsedResume.contactInfo.phone}
                  </span>
                )}

                {parsedResume?.contactInfo?.location && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {parsedResume.contactInfo.location}
                  </span>
                )}

                {parsedResume?.contactInfo?.gitHub && (
                  <span className="flex items-center gap-1 text-white font-medium">
                    <Github className="w-3.5 h-3.5 text-[#2ef8a0]" /> GitHub
                  </span>
                )}

                {parsedResume?.contactInfo?.linkedIn && (
                  <span className="flex items-center gap-1 text-emerald-300">
                    <Linkedin className="w-3.5 h-3.5 text-[#2ef8a0]" /> LinkedIn
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: AI Deep Review & Export PDF */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#12161a] hover:bg-[#1e242c] text-slate-200 hover:text-white border border-[#252e37] hover:border-[#2ef8a0]/40 transition-all cursor-pointer shadow-xs"
                title="Export Formatted PDF Report & Actionable Checklist"
              >
                <FileDown className="w-3.5 h-3.5 text-[#2ef8a0]" />
                <span>Export PDF</span>
              </button>
            )}

            {onTriggerAIDeepReview && (
              <button
                onClick={onTriggerAIDeepReview}
                disabled={isDeepReviewing}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#2ef8a0] hover:bg-[#00f59b] text-[#12161a] shadow-[0_0_20px_rgba(46,248,160,0.25)] hover:shadow-[0_0_25px_rgba(46,248,160,0.4)] transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#12161a]" />
                <span>{isDeepReviewing ? 'Generating AI Review...' : 'AI Career Coach Review'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Core 4 Metric Scorecards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
          
          {/* 1. Target Job Match */}
          <div 
            onClick={() => onSelectTab('job-suitability')}
            className="p-3.5 rounded-xl border border-[#252e37] hover:border-[#2ef8a0]/50 hover:bg-[#1e242c] transition-all cursor-pointer bg-[#12161a]/90 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Role Match Score</span>
              <Target className="w-4 h-4 text-[#2ef8a0]" />
            </div>
            <div className="flex items-baseline space-x-2 mt-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{matchScore}%</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${getScoreBadge(matchScore)}`}>
                {matchScore >= 80 ? 'High Fit' : matchScore >= 65 ? 'Moderate' : 'Needs Polish'}
              </span>
            </div>
            <div className="w-full bg-[#1e242c] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className={`h-full ${getProgressBar(matchScore)} rounded-full transition-all duration-700`} style={{ width: `${matchScore}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-2 flex items-center justify-between">
              <span>{targetJobFit?.matchedSkills?.length || 0} skills aligned</span>
              <span className="text-[#2ef8a0] font-medium group-hover:underline">Compare Roles →</span>
            </p>
          </div>

          {/* 2. ATS Filter Readiness */}
          <div 
            onClick={() => onSelectTab('ats-readiness')}
            className="p-3.5 rounded-xl border border-[#252e37] hover:border-[#2ef8a0]/50 hover:bg-[#1e242c] transition-all cursor-pointer bg-[#12161a]/90 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ATS Readiness</span>
              <ShieldCheck className="w-4 h-4 text-[#2ef8a0]" />
            </div>
            <div className="flex items-baseline space-x-2 mt-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{atsScore}/100</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${getScoreBadge(atsScore)}`}>
                {atsReadiness?.rating || 'Unrated'}
              </span>
            </div>
            <div className="w-full bg-[#1e242c] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className={`h-full ${getProgressBar(atsScore)} rounded-full transition-all duration-700`} style={{ width: `${atsScore}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-2 flex items-center justify-between">
              <span>{(atsReadiness?.checks || []).filter(c => c.status === 'pass').length}/{(atsReadiness?.checks || []).length} checks passed</span>
              <span className="text-[#2ef8a0] font-medium group-hover:underline">Fix Issues →</span>
            </p>
          </div>

          {/* 3. Skill Gaps & Free Courses */}
          <div 
            onClick={() => onSelectTab('skill-gaps')}
            className="p-3.5 rounded-xl border border-[#252e37] hover:border-[#2ef8a0]/50 hover:bg-[#1e242c] transition-all cursor-pointer bg-[#12161a]/90 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Skill Gaps & Courses</span>
              <GraduationCap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-2 mt-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {skillGaps?.missingCount || 0}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                missing / gaps
              </span>
            </div>
            <div className="w-full bg-[#1e242c] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, ((skillGaps?.matchedCount || 1) / ((skillGaps?.matchedCount || 1) + (skillGaps?.missingCount || 1))) * 100)}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-2 flex items-center justify-between">
              <span>{(skillGaps?.topRecommendedCourses || []).length} free courses</span>
              <span className="text-[#2ef8a0] font-medium group-hover:underline">View Roadmap →</span>
            </p>
          </div>

          {/* 4. Cohort Percentile Benchmark */}
          <div 
            onClick={() => onSelectTab('benchmarking')}
            className="p-3.5 rounded-xl border border-[#252e37] hover:border-[#2ef8a0]/50 hover:bg-[#1e242c] transition-all cursor-pointer bg-[#12161a]/90 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cohort Benchmark</span>
              <Award className="w-4 h-4 text-[#2ef8a0]" />
            </div>
            <div className="mt-1.5">
              <div className="text-base font-bold text-white truncate">
                {benchmarking?.percentileBand?.split('(')[0]?.trim() || 'Top 25%'}
              </div>
              <div className="text-xs text-[#2ef8a0] font-semibold mt-0.5">
                {benchmarking?.percentileNumber || 75}th Percentile Rank
              </div>
            </div>
            <div className="w-full bg-[#1e242c] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-[#2ef8a0] rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(46,248,160,0.4)]" style={{ width: `${benchmarking?.percentileNumber || 75}%` }} />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-2 flex items-center justify-between">
              <span>Vs. Curated Profiles</span>
              <span className="text-[#2ef8a0] font-medium group-hover:underline">Radar Chart →</span>
            </p>
          </div>

        </div>

        {/* Actionable Recommendations Strip */}
        {actionItems.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-[#252e37] bg-[#12161a]/60 rounded-xl p-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2ef8a0]" />
              <span>Immediate High-Impact Recommendations:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {actionItems.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectTab(item.tab)}
                  className="p-2.5 rounded-lg bg-[#181d23] border border-[#252e37] hover:border-[#2ef8a0]/50 hover:bg-[#1e242c] cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#2ef8a0] truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-semibold text-[#2ef8a0] flex items-center gap-1">
                    <span>Fix now</span> <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
