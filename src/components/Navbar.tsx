import React from 'react';
import { 
  FileText, 
  Briefcase, 
  Download, 
  RotateCcw, 
  PlusCircle,
  GraduationCap
} from 'lucide-react';
import { SampleResume, JobDescription } from '../types';

interface NavbarProps {
  sampleResumes: SampleResume[];
  onSelectSample: (sample: SampleResume) => void;
  onReset: () => void;
  onOpenAddJob: () => void;
  onExport: () => void;
  jobs: JobDescription[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  isAnalyzing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  sampleResumes,
  onSelectSample,
  onReset,
  onOpenAddJob,
  onExport,
  jobs,
  selectedJobId,
  onSelectJob,
  isAnalyzing
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#12161a]/95 backdrop-blur-md border-b border-[#252e37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#181d23] border border-[#2ef8a0]/30 flex items-center justify-center text-[#2ef8a0] shadow-[0_0_12px_rgba(46,248,160,0.15)] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex items-center">
              <span className="font-bold text-white text-base sm:text-lg tracking-tight neo-gradient-text leading-none">
                ResumeAI <span className="text-[#2ef8a0] font-semibold drop-shadow-[0_0_8px_rgba(46,248,160,0.3)]">Matcher</span>
              </span>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Target Job Quick Select */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-[#181d23] border border-[#252e37] hover:border-[#2ef8a0]/40 rounded-lg px-2.5 py-1.5 text-xs transition-colors">
              <Briefcase className="w-3.5 h-3.5 text-[#2ef8a0] shrink-0" />
              <span className="text-slate-400 font-medium">Target:</span>
              <select
                aria-label="Target Role Selection"
                value={selectedJobId}
                onChange={(e) => onSelectJob(e.target.value)}
                className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer pr-1 max-w-[220px] truncate"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id} className="bg-[#181d23] text-slate-100">
                    [{j.level}] {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Sample Selector Dropdown */}
            <div className="relative inline-block text-left">
              <select
                aria-label="Quick Load Sample Resume"
                onChange={(e) => {
                  const found = sampleResumes.find(s => s.id === e.target.value);
                  if (found) onSelectSample(found);
                }}
                defaultValue=""
                className="text-xs font-medium bg-[#181d23] border border-[#252e37] text-slate-200 rounded-lg px-2.5 sm:px-3 py-1.5 hover:bg-[#1e242c] hover:border-[#2ef8a0]/40 focus:outline-none focus:ring-1 focus:ring-[#2ef8a0] cursor-pointer shadow-xs max-w-[140px] sm:max-w-none truncate transition-all"
              >
                <option value="" disabled className="bg-[#181d23] text-slate-500">⚡ Load Preset Resume...</option>
                {sampleResumes.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#181d23] text-slate-100">
                    {s.name} ({s.tag})
                  </option>
                ))}
              </select>
            </div>

            {/* Add Custom Job */}
            <button
              onClick={onOpenAddJob}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-[#252e37] bg-[#181d23] text-xs font-medium text-slate-300 hover:text-[#2ef8a0] hover:bg-[#1e242c] hover:border-[#2ef8a0]/40 transition-colors shadow-xs"
              title="Add Custom Job Description"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Add Job</span>
            </button>

            {/* Export Report */}
            <button
              onClick={onExport}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-[#252e37] bg-[#181d23] text-xs font-medium text-slate-300 hover:text-[#2ef8a0] hover:bg-[#1e242c] hover:border-[#2ef8a0]/40 transition-colors shadow-xs"
              title="Export Full Analysis Report"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              className="p-1.5 rounded-lg border border-[#252e37] bg-[#181d23] text-slate-400 hover:text-white hover:bg-[#1e242c] hover:border-[#2ef8a0]/40 transition-colors"
              title="Reset Analysis"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
